import { Component, computed, input } from '@angular/core';
import { Drawing } from '../data/objects';
import { star } from '../data/stars';

interface Placed {
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

const BOX = { width: 64, height: 64, pad: 8 } as const;

/**
 * The thumbnail of a constellation or star: the figure from real star positions, north up, east left, dots sized by
 * brightness. Decorative; the name is next to it.
 */
@Component({
  selector: 'app-star-drawing',
  template: `
    <svg [attr.viewBox]="'0 0 ' + box.width + ' ' + box.height" aria-hidden="true">
      @for (l of lines(); track $index) {
        <line [attr.x1]="l[0].x" [attr.y1]="l[0].y" [attr.x2]="l[1].x" [attr.y2]="l[1].y" class="line" />
      }
      @for (s of placed(); track $index) {
        <circle [attr.cx]="s.x" [attr.cy]="s.y" [attr.r]="s.r" class="star" />
      }
    </svg>
  `,
  styles: `
    :host { display: block; }
    svg { display: block; width: 100%; height: auto; border-radius: inherit; background: var(--color-night-800); }
    .line { stroke: var(--color-line-strong); stroke-width: 0.8; }
    .star { fill: var(--color-ink-bright); }
  `,
})
export class StarDrawing {
  readonly drawing = input.required<Drawing>();

  protected readonly box = BOX;

  protected readonly placed = computed<Placed[]>(() => {
    const stars = this.drawing().stars.map((id) => star(id));
    const ra0 = stars.reduce((s, x) => s + x.ra, 0) / stars.length;
    const dec0 = stars.reduce((s, x) => s + x.dec, 0) / stars.length;
    const cos = Math.cos((dec0 * Math.PI) / 180);
    // Unwrap right ascension around the centre so figures across 0h stay together.
    const raw = stars.map((s) => ({ x: -((((s.ra - ra0 + 540) % 360) - 180) * cos), y: -(s.dec - dec0) }));
    const xs = raw.map((p) => p.x);
    const ys = raw.map((p) => p.y);
    const spanX = Math.max(...xs) - Math.min(...xs) || 1;
    const spanY = Math.max(...ys) - Math.min(...ys) || 1;
    const scale = Math.min((BOX.width - 2 * BOX.pad) / spanX, (BOX.height - 2 * BOX.pad) / spanY);
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
    const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    return stars.map((s, i) => ({
      x: BOX.width / 2 + (raw[i].x - cx) * scale,
      y: BOX.height / 2 + (raw[i].y - cy) * scale,
      r: Math.max(0.9, 2.8 - s.mag * 0.6),
    }));
  });

  protected readonly lines = computed(() => {
    const d = this.drawing();
    const at = new Map(d.stars.map((id, i) => [id, this.placed()[i]]));
    return d.lines.map(([a, b]) => [at.get(a) as Placed, at.get(b) as Placed] as const);
  });
}
