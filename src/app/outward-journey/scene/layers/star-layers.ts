import { Component, computed, inject } from '@angular/core';
import { BodyId } from '../../data/planets';
import { JourneyUi } from '../../journey-ui';

const LABEL = 'position: absolute; font-size: 10px; color: #c3c6d6; white-space: nowrap; pointer-events: none; opacity: var(--lo, 1);';

/** Sun position in the star-system layer (base units, relative to the Earth). */
export const STAR_SUN = { x: -8.5, y: -0.5 } as const;
/** Base units per light year: the distances from the Sun are to scale, the directions are simplified. */
export const UNITS_PER_LIGHT_YEAR = 22;

interface Dot {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly color: string;
  /** Glow as box-shadow blur, spread and colour. */
  readonly glow: string;
}

/** A selectable body: its hit box (base units) and where its name sits relative to that box. */
export interface Target {
  readonly id: BodyId;
  readonly name: string;
  readonly label: string;
  readonly box: { readonly left: number; readonly top: number; readonly width: number; readonly height: number };
  readonly labelStyle: string;
  readonly big?: boolean;
}

/** A 24 × 24 hit box around a point. */
const around = (x: number, y: number) => ({ left: x - 12, top: y - 12, width: 24, height: 24 });
const RIGHT = 'left: 100%; top: 4px';

const DOTS: readonly Dot[] = [
  { x: -8.5, y: -0.5, size: 5, color: '#fff4dc', glow: '14px 5px rgb(255 220 160 / 0.45)' },
  { x: -63.5, y: -79, size: 8, color: '#fff6dc', glow: '18px 6px rgb(255 236 190 / 0.5)' },
  { x: -53, y: -75.5, size: 5, color: '#ffd9a0', glow: '10px 3px rgb(255 200 140 / 0.4)' },
  { x: -79.7, y: -60.3, size: 4, color: '#ff8a6b', glow: '10px 3px rgb(255 100 70 / 0.4)' },
  { x: -137.5, y: 22, size: 3.5, color: '#ff8a6b', glow: '8px 2px rgb(255 100 70 / 0.4)' },
  { x: -34.5, y: -141, size: 2.5, color: '#d0704a', glow: '6px 1px rgb(200 90 50 / 0.35)' },
  { x: -31, y: -139.5, size: 2.5, color: '#c0603a', glow: '6px 1px rgb(200 90 50 / 0.35)' },
  { x: -140, y: 92, size: 2.5, color: '#9a5040', glow: '5px 1px rgb(150 70 50 / 0.3)' },
  { x: -8.5, y: -174.5, size: 3, color: '#ff7a5a', glow: '8px 2px rgb(255 90 60 / 0.4)' },
  { x: -149, y: -118, size: 4, color: '#ff9a6a', glow: '10px 3px rgb(255 120 80 / 0.4)' },
  { x: -88, y: -172, size: 9, color: '#f4f8ff', glow: '20px 7px rgb(190 210 255 / 0.55)' },
  { x: -81, y: -168.5, size: 2, color: '#ffffff', glow: '4px 1px rgb(220 230 255 / 0.5)' },
];

export const STAR_TARGETS: readonly Target[] = [
  { id: 'sonne', name: 'Sonne', label: 'Sonne', box: around(-8.5, -0.5), labelStyle: 'left: -15.5px; top: 20.5px' },
  // A and B sit close together: their hit areas split the gap between them.
  {
    id: 'alpha-centauri-a', name: 'Alpha Centauri A', label: 'Alpha Centauri A', big: true,
    box: { left: -77.5, top: -91, width: 19.25, height: 24 }, labelStyle: 'right: 100%; top: 4px; padding-right: 2px',
  },
  {
    id: 'alpha-centauri-b', name: 'Alpha Centauri B', label: 'B', big: true,
    box: { left: -58.25, top: -87.5, width: 19.25, height: 24 }, labelStyle: 'left: 100%; top: 0',
  },
  { id: 'proxima', name: 'Proxima Centauri', label: 'Proxima', box: around(-79.7, -60.3), labelStyle: 'left: -8px; top: 20px' },
  { id: 'barnard', name: 'Barnards Pfeilstern', label: 'Barnards Pfeilstern', box: around(-137.5, 22), labelStyle: RIGHT },
  { id: 'luhman-16', name: 'Luhman 16', label: 'Luhman 16', box: around(-33, -140.5), labelStyle: RIGHT },
  { id: 'wise-0855', name: 'WISE 0855-0714', label: 'WISE 0855-0714', box: around(-140, 92), labelStyle: RIGHT },
  { id: 'wolf-359', name: 'Wolf 359', label: 'Wolf 359', box: around(-8.5, -174.5), labelStyle: RIGHT },
  { id: 'lalande-21185', name: 'Lalande 21185', label: 'Lalande 21185', box: around(-149, -118), labelStyle: RIGHT },
  { id: 'sirius', name: 'Sirius', label: 'Sirius', big: true, box: around(-86, -171), labelStyle: RIGHT },
];

/**
 * Stage 4: the Sun as a point and its neighbours up to Sirius, from Alpha Centauri to the faint brown dwarfs.
 * Distances from the Sun are to scale (a ring marks 5 light years), directions are simplified.
 * In free exploration the Sun and every star system can be selected, like the planets.
 */
@Component({
  selector: 'app-star-system-layer',
  template: `
    <svg class="distance-ring" aria-hidden="true" [style.left.px]="sun.x - ring - 1" [style.top.px]="sun.y - ring - 1"
      [attr.width]="ring * 2 + 2" [attr.height]="ring * 2 + 2">
      <circle [attr.cx]="ring + 1" [attr.cy]="ring + 1" [attr.r]="ring" />
    </svg>
    <span class="lbl ring-lbl" aria-hidden="true" [style.left.px]="sun.x - 30" [style.top.px]="sun.y + ring + 3">5 Lichtjahre</span>
    @for (d of dots; track $index) {
      <span class="star" aria-hidden="true" [style.left.px]="d.x - d.size / 2" [style.top.px]="d.y - d.size / 2"
        [style.width.px]="d.size" [style.height.px]="d.size" [style.background]="d.color"
        [style.box-shadow]="'0 0 ' + d.glow"></span>
    }
    @for (t of targets; track t.id) {
      @if (explore()) {
        <button type="button" class="hit" [attr.aria-label]="t.name + ' ansehen'" (click)="select(t.id)"
          [style.left.px]="t.box.left" [style.top.px]="t.box.top" [style.width.px]="t.box.width" [style.height.px]="t.box.height">
          <span class="lbl" [class.big]="t.big" aria-hidden="true" [style]="t.labelStyle">{{ t.label }}</span>
        </button>
      } @else {
        <span class="hit static" aria-hidden="true"
          [style.left.px]="t.box.left" [style.top.px]="t.box.top" [style.width.px]="t.box.width" [style.height.px]="t.box.height">
          <span class="lbl" [class.big]="t.big" [style]="t.labelStyle">{{ t.label }}</span>
        </span>
      }
    }
  `,
  styles: `
    :host { position: absolute; left: 0; top: 0; }
    /* Not ".ring": that is a Tailwind utility. */
    .distance-ring { position: absolute; overflow: visible; }
    .distance-ring circle { fill: none; stroke: rgb(236 232 221 / 0.22); stroke-width: 1; stroke-dasharray: 3 4; }
    .ring-lbl { width: 60px; text-align: center; font-size: 9px; color: #9a9db0; }
    .star { position: absolute; border-radius: 50%; }
    .hit { position: absolute; padding: 0; border: 0; border-radius: 50%; background: transparent; cursor: pointer; font-family: inherit; }
    .hit.static { cursor: inherit; pointer-events: none; }
    .hit:focus-visible { outline: 2px solid #f3d9a4; outline-offset: 1px; }
    .lbl { ${LABEL} }
    .lbl.big { font-size: 11px; }
    /* Inside a button the name is part of the hit area. */
    button.hit .lbl { pointer-events: auto; cursor: pointer; padding-block: 4px; margin-top: -4px; }
  `,
})
export class StarSystemLayer {
  private readonly ui = inject(JourneyUi);
  protected readonly explore = computed(() => this.ui.variant() === 'freies-erkunden');
  protected readonly sun = STAR_SUN;
  protected readonly ring = 5 * UNITS_PER_LIGHT_YEAR;
  protected readonly dots = DOTS;
  protected readonly targets = STAR_TARGETS;

  protected select(id: BodyId): void {
    this.ui.planet.set(id);
  }
}
