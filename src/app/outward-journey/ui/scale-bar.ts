import { Component, ElementRef, afterRenderEffect, computed, inject, signal, viewChild, viewChildren } from '@angular/core';
import { STAGES, STAGE_DISTANCES } from '../data/stages';
import { formatDistance } from '../engine/format';
import { MAX_Z, distanceAt } from '../engine/zoom-math';
import { ZoomState } from '../engine/zoom-state';
import { SceneGeometry } from '../scene/scene-geometry';

/**
 * The scale bar on the right edge: names all stages (Erde at the bottom), marks the
 * position continuously, flies to a stage when one is chosen, and zooms when dragged along.
 * On short phones it ends above the stage texts and lists the stages behind a "Stufen" button,
 * so every target keeps its full touch size.
 */
@Component({
  selector: 'app-scale-bar',
  host: {
    'data-scale-bar': '',
    '[class.compact]': 'compact()',
    '[style.height.px]': 'geometry.scaleBarHeight()',
    '(keydown.escape)': 'closeList()',
    '(focusin)': 'focusInside = true',
    '(focusout)': 'onFocusOut($event)',
  },
  template: `
    <nav aria-label="Massstab">
      <div class="line" aria-hidden="true"></div>
      @if (!compact()) {
        <ol class="stops">
          @for (stop of stops(); track stop.n) {
            <li>
              <button #stopButton type="button" [class.on]="stop.current" [class.dim]="stop.dim"
                [attr.aria-current]="stop.current ? 'location' : null" (click)="choose(stop.n)">
                {{ stop.label }}<i aria-hidden="true"></i>
              </button>
            </li>
          }
        </ol>
      } @else {
        <ol class="ticks" aria-hidden="true">
          @for (stop of stops(); track stop.n) {
            <li [class.on]="stop.current"></li>
          }
        </ol>
        @if (currentLabel(); as label) {
          <p class="current" aria-hidden="true" [style.top]="markerTop()">{{ label }}</p>
        }
        <button #toggle type="button" class="toggle" aria-controls="stage-list" [attr.aria-expanded]="listOpen()" (click)="listOpen.set(!listOpen())">
          Stufen
        </button>
        @if (listOpen()) {
          <ol id="stage-list" class="list">
            @for (stop of stops(); track stop.n) {
              <li>
                <button #stopButton type="button" [class.on]="stop.current" [attr.aria-current]="stop.current ? 'location' : null" (click)="choose(stop.n)">
                  {{ stop.label }}
                </button>
              </li>
            }
          </ol>
        }
      }
      <div class="marker" aria-hidden="true" [style.top]="markerTop()"></div>
      <div class="slider">
        <input type="range" min="0" [max]="max" step="0.01" [value]="zoom.z()"
          aria-label="Zoom von der Erde bis zum Universum" [attr.aria-valuetext]="valueText()"
          (input)="onSlide($event)" (change)="zoom.release()" (pointerup)="zoom.release()" (keydown)="onKey($event)" />
      </div>
    </nav>
  `,
  styleUrl: './scale-bar.css',
})
export class ScaleBar {
  protected readonly zoom = inject(ZoomState);
  protected readonly geometry = inject(SceneGeometry);
  protected readonly max = MAX_Z;
  protected readonly compact = this.geometry.compactScaleBar;
  protected readonly listOpen = signal(false);
  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('stopButton');
  private readonly toggle = viewChild<ElementRef<HTMLButtonElement>>('toggle');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  /** Whether keyboard focus is (or was, until its button disappeared) inside the bar. */
  protected focusInside = false;

  constructor() {
    // Switching between the full and the compact bar removes the focused button: keep focus in the bar.
    afterRenderEffect(() => {
      const compact = this.compact();
      const active = this.host.ownerDocument.activeElement;
      if (!this.focusInside || (active && active !== this.host.ownerDocument.body)) {
        return;
      }
      if (compact) {
        this.toggle()?.nativeElement.focus();
      } else {
        const index = this.stops().findIndex((s) => s.current);
        this.buttons()[Math.max(0, index)]?.nativeElement.focus();
      }
    });
  }

  /** Focus leaving for another element ends "inside"; focus lost to nowhere (a removed button) does not. */
  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && !this.host.contains(next)) {
      this.focusInside = false;
    }
  }

  /** Stage buttons from the top (Universum) to the bottom (Erde). */
  protected readonly stops = computed(() => {
    const resting = this.zoom.restingStage();
    return STAGES.map((s, n) => ({
      n,
      label: s.label,
      current: resting === n,
      dim: resting !== null && resting !== n,
    })).reverse();
  });

  protected readonly currentLabel = computed(() => {
    const resting = this.zoom.restingStage();
    return resting === null ? null : STAGES[resting].label;
  });

  /** Marker position; in the compact bar the "Stufen" button takes the bottom 48 px. */
  protected readonly markerTop = computed(() => {
    const free = this.compact() ? 92 : 44;
    return `calc(22px + (100% - ${free}px) * ${(MAX_Z - this.zoom.z()) / MAX_Z})`;
  });

  protected readonly valueText = computed(() => {
    const z = this.zoom.z();
    return `${STAGES[this.zoom.nearest()].title}, ${formatDistance(distanceAt(z, STAGE_DISTANCES))}`;
  });

  protected choose(stage: number): void {
    this.closeList();
    this.zoom.flyTo(stage);
  }

  /** Closes the compact list; focus goes back to "Stufen" instead of getting lost with the list. */
  protected closeList(): void {
    if (this.listOpen() && this.host.contains(this.host.ownerDocument.activeElement)) {
      this.toggle()?.nativeElement.focus();
    }
    this.listOpen.set(false);
  }

  protected onSlide(event: Event): void {
    this.zoom.moveTo(Number((event.target as HTMLInputElement).value));
  }

  /** Arrow keys on the slider step a whole stage instead of a tiny amount. */
  protected onKey(event: KeyboardEvent): void {
    const directions: Record<string, 1 | -1> = { ArrowUp: 1, ArrowRight: 1, PageUp: 1, ArrowDown: -1, ArrowLeft: -1, PageDown: -1 };
    const dir = directions[event.key];
    if (dir) {
      event.preventDefault();
      event.stopPropagation();
      this.zoom.step(dir);
    }
  }

  /** Moves focus to the current stage (end path "Zu einer Stufe springen"). */
  focusCurrent(): void {
    this.listOpen.set(true);
    setTimeout(() => {
      const index = this.stops().findIndex((s) => s.current);
      this.buttons()[Math.max(0, index)]?.nativeElement.focus();
    });
  }
}
