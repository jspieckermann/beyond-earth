import { NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, computed, input, output, viewChild } from '@angular/core';
import { completedRounds } from '../engine/galactic';
import { Point, SUN_RADIUS, backArc, ringRadii, roundsAtPointer, sunAt } from '../engine/orbit';

const pct = (n: number) => `${(n * 100).toFixed(3)}%`;
const f = (n: number) => Number(n.toFixed(4));

/** Below this many rounds the Sun counts as being at today's place. */
const TODAY = 0.002;

/** The short arrow in front of the Sun that shows its direction of motion (clockwise in this view). */
export function directionArrow(): { arc: string; head: string } {
  const from = sunAt(-0.012);
  const tip = sunAt(-0.04);
  const a = ((90 + 0.04 * 360) * Math.PI) / 180;
  const dir = { x: -Math.sin(a), y: Math.cos(a) };
  const back = { x: -dir.x * 0.02, y: -dir.y * 0.02 };
  const side = { x: -dir.y * 0.011, y: dir.x * 0.011 };
  const r = f(SUN_RADIUS);
  return {
    arc: `M ${from.x} ${from.y} A ${r} ${r} 0 0 1 ${tip.x} ${tip.y}`,
    head: [
      `${f(tip.x + back.x + side.x)},${f(tip.y + back.y + side.y)}`,
      `${tip.x},${tip.y}`,
      `${f(tip.x + back.x - side.x)},${f(tip.y + back.y - side.y)}`,
    ].join(' '),
  };
}

const ARROW = directionArrow();

/**
 * The Milky Way from above with the Sun's orbit drawn on it. The Earth's marker sits on the Sun, with an
 * arrow for its direction of motion while it is at today's place; turning back moves it counter-clockwise
 * along the orbit. Fine rings stand for the rounds the Sun had completed at that time: about twenty today, fewer the
 * further back. The Sun can be dragged along the orbit.
 */
@Component({
  selector: 'app-galaxy-view',
  imports: [NgOptimizedImage],
  template: `
    <div class="picture" role="img" [attr.aria-label]="alt()">
      <img [ngSrc]="src()" [width]="size()" [height]="size()" alt="" priority />
      <svg class="overlay" viewBox="0 0 1 1" aria-hidden="true">
        <circle class="orbit" cx="0.5" cy="0.5" [attr.r]="radius" />
        @for (r of rings(); track $index) {
          <circle class="ring" cx="0.5" cy="0.5" [attr.r]="r" />
        }
        @if (arc()) {
          <path class="arc" [attr.d]="arc()" />
        }
        @if (atToday()) {
          <path class="arrow" [attr.d]="arrow.arc" />
          <polyline class="arrow" [attr.points]="arrow.head" />
        }
      </svg>
      <span class="sun" aria-hidden="true" [style.left]="sunLeft()" [style.top]="sunTop()"></span>
      <span class="lbl" aria-hidden="true" [class.left]="labelLeft()" [class.up]="labelUp()" [style.left]="sunLeft()" [style.top]="sunTop()">{{ sunLabel() }}</span>
    </div>
    <span
      #handle
      class="handle"
      aria-hidden="true"
      [style.left]="sunLeft()"
      [style.top]="sunTop()"
      (pointerdown)="grab($event)"
      (pointermove)="move($event)"
      (pointerup)="letGo($event)"
      (pointercancel)="letGo($event)"
    ></span>
  `,
  styleUrl: './galaxy-view.css',
})
export class GalaxyView {
  /** Rounds turned back (0 = today). */
  readonly rounds = input(0);
  /** The furthest the Sun can be turned back in this variant. */
  readonly limit = input(20);
  readonly alt = input.required<string>();
  readonly sunLabel = input('Erde');
  /** Wide screens get the sharper picture. */
  readonly large = input(false);

  /** The Sun is dragged to these rounds. */
  readonly dragged = output<number>();
  /** The Sun was let go after dragging. */
  readonly released = output<void>();

  private readonly handle = viewChild.required<ElementRef<HTMLElement>>('handle');

  protected readonly radius = f(SUN_RADIUS);
  protected readonly arrow = ARROW;

  protected readonly size = computed(() => (this.large() ? 1920 : 960));
  protected readonly src = computed(() => `journey/img/milky-way-${this.size()}.webp`);
  protected readonly atToday = computed(() => this.rounds() < TODAY);
  protected readonly position = computed(() => sunAt(this.rounds()));
  protected readonly sunLeft = computed(() => pct(this.position().x));
  protected readonly sunTop = computed(() => pct(this.position().y));
  /** The label goes to the left of the Sun near the right edge, so it stays inside the picture. */
  protected readonly labelLeft = computed(() => this.position().x > 0.62);
  /** In the lower part of the picture the label sits above the Sun, clear of the Earth globe at the lower right. */
  protected readonly labelUp = computed(() => this.position().y > 0.6);
  /** One ring per round the Sun had completed at the time shown: about twenty today, fewer further back. */
  protected readonly rings = computed(() => ringRadii(completedRounds(this.rounds())));
  protected readonly arc = computed(() => backArc(this.rounds()));

  private dragging = false;
  /** Rounds of the last move: the input lags behind while the pointer moves faster than the screen updates. */
  private dragRounds = 0;

  protected grab(event: PointerEvent): void {
    this.dragging = true;
    this.dragRounds = this.rounds();
    (event.target as Element).setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  protected move(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }
    const rect = this.handle().nativeElement.parentElement?.querySelector('.picture')?.getBoundingClientRect();
    if (!rect || rect.width === 0) {
      return;
    }
    const point: Point = { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
    this.dragRounds = roundsAtPointer(point, this.dragRounds, this.limit());
    this.dragged.emit(this.dragRounds);
  }

  protected letGo(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }
    this.dragging = false;
    (event.target as Element).releasePointerCapture?.(event.pointerId);
    this.released.emit();
  }
}
