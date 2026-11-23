import { Component, ElementRef, afterRenderEffect, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { CLOCK } from '../../../core/clock';
import { ZoomState } from '../../engine/zoom-state';
import { TextureData, renderSphere, sphereLookup } from '../sphere-renderer';
import { loadTexture } from '../textures';
import { sunInView } from './earth-globe';

/** Where the Sun stands as seen from a sphere: the subsolar point relative to the view centre, in degrees. */
export interface SunDirection {
  readonly lat: number;
  readonly lon: number;
}

/**
 * The subsolar point of a body drawn in the plane of the solar system, with the Sun at `dx`, `dy`
 * (screen units, y down) from it. We look down on the orbits, so each body is lit from the side
 * facing the Sun; a little light from the front keeps a lit crescent from becoming a thin line.
 */
export function sunFrom(dx: number, dy: number): SunDirection {
  const len = Math.hypot(dx, dy) || 1;
  const v = [(dx / len) * 0.94, (-dy / len) * 0.94, 0.35];
  const n = Math.hypot(v[0], v[1], v[2]);
  return { lat: (Math.asin(v[1] / n) * 180) / Math.PI, lon: (Math.atan2(v[0], v[2]) * 180) / Math.PI };
}

/**
 * A small sphere with a real surface texture (the Moon, the planets, the Sun), lit by the Sun or glowing by itself. Without a given
 * direction it is lit like the Earth at Erde und Mond. The texture loads only once the view comes near
 * its stage (`loadFrom`, a zoom position); until then a disc in the body's colour stands in.
 */
@Component({
  selector: 'app-body-globe',
  template: `
    <div class="globe" aria-hidden="true" [class.ready]="ready()" [style.width.px]="radius() * 2" [style.height.px]="radius() * 2"
      [style.background]="stand()">
      <canvas #canvas [width]="size()" [height]="size()"></canvas>
    </div>
  `,
  styles: `
    :host { display: block; }
    .globe { position: relative; border-radius: 50%; }
    canvas { position: absolute; inset: 0; width: 100%; height: 100%; border-radius: 50%; opacity: 0; transition: opacity 0.6s ease; }
    .ready { background: none !important; }
    .ready canvas { opacity: 1; }
  `,
})
export class BodyGlobe {
  private readonly clock = inject(CLOCK);
  private readonly zoom = inject(ZoomState);
  /** Base name of the texture under journey/tex. */
  readonly texture = input.required<string>();
  readonly radius = input(6);
  readonly color = input('#c9c6bd');
  readonly sun = input<SunDirection | null>(null);
  /** Zoom position from which the texture is loaded. */
  readonly loadFrom = input(0);
  /** Glows by itself (the Sun): no shadow side, only a slightly darker rim. */
  readonly emissive = input(false);

  /** Rendered at about four pixels per base unit, so it stays sharp at twice the size on dense screens. */
  protected readonly size = computed(() => 2 * Math.max(8, Math.round(this.radius() * 4)));
  protected readonly stand = computed(() => `radial-gradient(circle at 34% 36%, ${this.color()}, #1a1a22 95%)`);

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly data = signal<TextureData | null>(null);
  protected readonly ready = signal(false);
  private loading = false;

  constructor() {
    effect(() => {
      if (!this.loading && this.zoom.z() >= this.loadFrom()) {
        this.loading = true;
        void loadTexture(`journey/tex/${this.texture()}-1024.webp`).then((t) => this.data.set(t));
      }
    });
    afterRenderEffect(() => {
      const texture = this.data();
      if (texture) {
        this.ready.set(this.draw(texture, this.sun() ?? sunInView(this.clock())));
      }
    });
  }

  private draw(texture: TextureData, sun: SunDirection): boolean {
    const ctx = this.canvas().nativeElement.getContext?.('2d');
    if (!ctx) {
      return false;
    }
    const lookup = sphereLookup(this.size() / 2);
    const image = ctx.createImageData(lookup.size, lookup.size);
    renderSphere(lookup, texture, image.data, this.emissive() ? { rotation: 0, emissive: true } : { rotation: 0, sun });
    ctx.putImageData(image, 0, 0);
    return true;
  }
}
