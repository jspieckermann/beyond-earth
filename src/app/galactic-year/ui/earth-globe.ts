import { Component, computed, input } from '@angular/core';
import { EarthState } from '../engine/earth';

const R = 48;

/** A polar cap reaching `depth` from the top (north) or the bottom (south) of the globe, with a curved inner edge, as an SVG path. */
export function capPath(depth: number, north: boolean): string {
  if (depth <= 0) {
    return '';
  }
  const y = Number((north ? 50 - R + depth : 50 + R - depth).toFixed(2));
  const half = Math.sqrt(R * R - (50 - y) * (50 - y));
  const left = (50 - half).toFixed(1);
  const right = (50 + half).toFixed(1);
  const large = depth > R ? 1 : 0;
  // The inner edge curves towards the equator, so the cap looks like a cap on a sphere rather than a flat band.
  const bulge = Number(Math.min(depth * 0.35, 8).toFixed(2));
  const edge = north ? y + bulge : y - bulge;
  return `M${left} ${y} A${R} ${R} 0 ${large} ${north ? 1 : 0} ${right} ${y} Q50 ${edge} ${left} ${y} Z`;
}

/**
 * The small Earth of the past: a simplified drawing of oceans with lighter coasts, land with deserts, forests,
 * mountains and ice, polar caps and a thin atmosphere. While the Sun moves, the drawings of two stations blend
 * into each other and the ice grows or shrinks smoothly.
 */
@Component({
  selector: 'app-earth-globe',
  template: `
    <svg class="picture" viewBox="0 0 100 100" role="img" [attr.aria-label]="label()">
      <defs>
        <radialGradient [attr.id]="id('depth')" cx="42%" cy="40%" r="62%">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.14" />
          <stop offset="1" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
        <radialGradient [attr.id]="id('shade')" cx="35%" cy="32%" r="72%">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.16" />
          <stop offset="0.7" stop-color="#000000" stop-opacity="0.15" />
          <stop offset="1" stop-color="#000000" stop-opacity="0.6" />
        </radialGradient>
        <clipPath [attr.id]="id('disc')"><circle cx="50" cy="50" r="48" /></clipPath>
      </defs>
      <circle cx="50" cy="50" r="48" [attr.fill]="state().ocean" />
      <circle cx="50" cy="50" r="48" [attr.fill]="url('depth')" />
      <g [attr.clip-path]="url('disc')">
        @for (l of state().land; track $index) {
          <g [attr.opacity]="l.opacity">
            <path class="shelf" [attr.d]="l.path" fill="none" [attr.stroke]="state().shelf" stroke-width="2.6" stroke-linejoin="round" />
            <path class="land" [attr.d]="l.path" [attr.fill]="l.fill" />
            @for (d of l.details; track $index) {
              <path class="detail" [attr.d]="d.path" [attr.fill]="d.fill" />
            }
          </g>
        }
        @if (north()) {
          <path class="ice" [attr.d]="north()" fill="#eef3f7" />
        }
        @if (south()) {
          <path class="ice" [attr.d]="south()" fill="#eef3f7" />
        }
      </g>
      <circle cx="50" cy="50" r="48" [attr.fill]="url('shade')" />
      <circle cx="50" cy="50" r="48.6" fill="none" stroke="#9cc8ff" stroke-opacity="0.45" stroke-width="1.4" />
    </svg>
  `,
  styles: `
    :host { display: block; }
    svg { display: block; width: 100%; height: 100%; }
  `,
})
export class EarthGlobe {
  readonly state = input.required<EarthState>();
  /** The text alternative, e.g. "Die Erde vor 230 Millionen Jahren: Ein einziger grosser Kontinent, Pangäa." */
  readonly label = input.required<string>();

  private static next = 0;
  /** Unique ids for the gradients and the clip path, so several globes on one page do not share them. */
  private readonly key = `earth-${EarthGlobe.next++}`;
  protected readonly id = (name: string) => `${this.key}-${name}`;
  protected readonly url = (name: string) => `url(#${this.id(name)})`;
  protected readonly north = computed(() => capPath(this.state().iceNorth, true));
  protected readonly south = computed(() => capPath(this.state().iceSouth, false));
}
