import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { EyeView, Mark, pictureUrl } from '../data/pictures';

/** Labels keep this far from the left and right edge of the picture (in picture pixels). */
const EDGE = 90;

interface PlacedMark extends Mark {
  readonly labelX: number;
  readonly labelY: number;
}

/** Text alternative naming what is marked. */
export function markedAlt(view: EyeView, name: string): string {
  const target = view.marks.filter((m) => !m.minor).map((m) => m.label);
  const help = view.marks.filter((m) => m.minor).map((m) => m.label);
  const marked = target.length ? `Markiert: ${target.join(', ')}.` : `Markiert: ${name}.`;
  return `Foto ohne Teleskop: ${name} am Nachthimmel. ${marked}${help.length ? ` Zur Orientierung: ${help.join(', ')}.` : ''}`;
}

/**
 * A naked-eye photo with the object marked: an SVG over the image in the picture's own pixels, so the marks scale
 * with it. Rings and figure lines use the colour tokens and stay readable in night mode, where the photo is tinted.
 */
@Component({
  selector: 'app-marked-photo',
  imports: [NgOptimizedImage],
  template: `
    <div class="wrap">
      <img [ngSrc]="url()" [width]="view().picture.width" [height]="view().picture.height" [alt]="alt()" [priority]="priority()" />
      <svg class="marks" [attr.viewBox]="'0 0 ' + view().picture.width + ' ' + view().picture.height" aria-hidden="true">
        @for (l of view().lines ?? []; track $index) {
          <polyline [attr.points]="points(l.points)" class="line" [class.dashed]="l.dashed" />
          @if (l.stars) {
            @for (p of l.points; track $index) {
              <circle [attr.cx]="p[0]" [attr.cy]="p[1]" r="13" class="ring small" />
            }
          }
        }
        @for (m of marks(); track m.label) {
          @if (m.r) {
            <circle [attr.cx]="m.x" [attr.cy]="m.y" [attr.r]="m.r" class="ring" [class.minor]="m.minor" />
          }
          <text [attr.x]="m.labelX" [attr.y]="m.labelY" class="label" [class.minor]="m.minor">{{ m.label }}</text>
        }
      </svg>
    </div>
  `,
  styles: `
    :host { display: block; }
    .wrap { position: relative; border-radius: 8px; overflow: hidden; background: var(--color-night-950); }
    img { display: block; width: 100%; height: auto; }
    .marks { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
    .ring, .line { fill: none; stroke: var(--color-starlight); stroke-width: 4; stroke-linejoin: round; }
    .ring.small { stroke-width: 3; }
    .ring.minor { stroke-width: 2.5; stroke-dasharray: 8 7; opacity: 0.8; }
    .line { stroke-width: 3; opacity: 0.9; }
    .line.dashed { stroke-dasharray: 12 10; }
    .label {
      font: 600 34px var(--font-sans); fill: var(--color-starlight); text-anchor: middle;
      paint-order: stroke; stroke: var(--color-night-950); stroke-width: 8px; stroke-linejoin: round;
    }
    .label.minor { font-weight: 500; font-size: 28px; fill: var(--color-ink); }
  `,
})
export class MarkedPhoto {
  readonly view = input.required<EyeView>();
  /** The object's name, for the text alternative. */
  readonly name = input.required<string>();
  /** Load before other pictures (the first expanded card). */
  readonly priority = input(false);

  protected readonly url = computed(() => pictureUrl(this.view().picture.id));
  protected readonly alt = computed(() => markedAlt(this.view(), this.name()));

  protected readonly marks = computed<PlacedMark[]>(() => {
    const { width, height } = this.view().picture;
    return this.view().marks.map((m) => {
      const y = m.above ? m.y - m.r - 16 : m.y + m.r + 38;
      return { ...m, labelX: Math.min(Math.max(m.x, EDGE), width - EDGE), labelY: Math.min(Math.max(y, 34), height - 12) };
    });
  });

  protected points(points: readonly (readonly [number, number])[]): string {
    return points.map((p) => p.join(',')).join(' ');
  }
}
