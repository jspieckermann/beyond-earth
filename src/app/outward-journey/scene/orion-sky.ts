import { Component, ElementRef, afterRenderEffect, computed, effect, inject, signal, viewChild } from '@angular/core';
import { ZoomState } from '../engine/zoom-state';
import { SceneGeometry } from './scene-geometry';
import { StarCatalogue, drawSky, orionCamera } from './star-renderer';
import { loadJson } from './textures';

/** Where the way from the neighbouring stars to the Milky Way starts and ends (zoom positions). */
export const ORION_FROM = 3.1;
export const ORION_TO = 4;
const ORION_PEAK = 3.45;

/** How far the figure has fallen apart (0 = seen from the Earth, 1 = fully apart). */
export function orionProgress(z: number): number {
  return Math.min(1, Math.max(0, (z - 3.25) / 0.65));
}

/** Visibility of the star view: it rises after the neighbouring stars and gives way to the Milky Way. */
export function orionVisibility(z: number): number {
  if (z <= ORION_FROM || z >= ORION_TO) {
    return 0;
  }
  return z < ORION_PEAK ? (z - ORION_FROM) / (ORION_PEAK - ORION_FROM) : Math.max(0, 1 - (z - ORION_PEAK) / (ORION_TO - ORION_PEAK));
}

/**
 * Thousands of real stars between the neighbouring stars and the Milky Way, seen from a camera that
 * moves outwards, so they drift apart in depth. The figure of Orion is not drawn: the short flight
 * between the two stages leaves no time to read it, and its lines only flashed up as stray strokes.
 */
@Component({
  selector: 'app-orion-sky',
  host: { 'aria-hidden': 'true', '[style.opacity]': 'visibility()' },
  template: `<canvas #sky></canvas>`,
  styles: `
    :host { position: absolute; inset: 0; pointer-events: none; }
    canvas { width: 100%; height: 100%; display: block; }
  `,
})
export class OrionSky {
  private readonly zoom = inject(ZoomState);
  private readonly geometry = inject(SceneGeometry);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('sky');
  private readonly catalogue = signal<StarCatalogue | null>(null);
  private loading = false;

  protected readonly visibility = computed(() => orionVisibility(this.zoom.z()));

  constructor() {
    // Load the catalogue lazily once the view gets close to the stars.
    effect(() => {
      if (this.zoom.z() > 2.5 && !this.loading) {
        this.loading = true;
        void loadJson<StarCatalogue>('journey/data/stars.json').then((c) => this.catalogue.set(c));
      }
    });
    afterRenderEffect(() => {
      const catalogue = this.catalogue();
      const z = this.zoom.z();
      const { width, height } = this.geometry.viewport();
      if (catalogue && orionVisibility(z) > 0) {
        this.draw(catalogue, z, width, height);
      }
    });
  }

  private draw(catalogue: StarCatalogue, z: number, width: number, height: number): void {
    const canvas = this.canvas().nativeElement;
    const ctx = canvas.getContext?.('2d');
    if (!ctx) {
      return;
    }
    const dpr = Math.min(2, globalThis.devicePixelRatio ?? 1);
    if (canvas.width !== Math.round(width * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const t = orionProgress(z);
    drawSky(ctx, catalogue, orionCamera(catalogue.orion, t), {
      width,
      height,
      focal: Math.min(width, height) * 1.1,
      lines: 0,
    });
  }
}
