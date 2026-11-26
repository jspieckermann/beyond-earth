import { Component, computed, effect, inject, signal } from '@angular/core';
import { clamp } from '../engine/zoom-math';
import { ZoomState } from '../engine/zoom-state';
import { JourneyUi } from '../journey-ui';
import { SceneGeometry } from '../scene/scene-geometry';

/** How long the marker lights up when the Earth is selected in the solar system. */
export const FLASH_MS = 1600;
/**
 * Zoom position from which the marker fades in: on the way out of the solar system. Up to there the Earth
 * is drawn as a sphere with its name (at the Earth, at Erde und Mond and in the solar system).
 */
export const MARKER_FROM_Z = 2.2;

/**
 * The Earth stays marked as a small glowing point once it is too small to see, beyond the solar system.
 * When the Earth is off-screen, the marker waits at the edge of the picture and points towards it.
 * In free exploration it opens the Earth up close.
 */
@Component({
  selector: 'app-earth-marker',
  host: {
    '[style.left.px]': 'place().x',
    '[style.top.px]': 'place().y',
    '[style.opacity]': 'opacity()',
    '[class.flash]': 'flashing()',
    '[class.calm]': 'zoom.reducedMotion()',
  },
  template: `
    @if (selectable()) {
      <button type="button" class="earth" aria-label="Erde ansehen" (click)="open()">
        <span class="dot" aria-hidden="true"></span>
        <span class="label" aria-hidden="true">Erde</span>
      </button>
    } @else {
      <span class="dot" aria-hidden="true"></span>
      <span class="label">Erde</span>
    }
    @if (place().offscreen) {
      <svg class="arrow" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" [style.transform]="'rotate(' + place().angle + 'deg)'">
        <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span class="sr-only">, ausserhalb des Bildes</span>
    }
  `,
  styles: `
    :host { position: absolute; display: flex; align-items: center; gap: 6px; transform: translate(-5px, -50%); pointer-events: none; color: var(--color-ink-bright); }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: var(--color-earth); box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-earth) 25%, transparent), 0 0 0 11px color-mix(in srgb, var(--color-earth) 8%, transparent), 0 0 16px 6px color-mix(in srgb, var(--color-earth) 50%, transparent); animation: pulse 3.2s ease-in-out infinite; }
    .label { font-size: 12px; font-weight: 600; text-shadow: 0 0 8px #000; }
    /* The target starts at the dot and covers the label, so the Sun just left of the Earth stays selectable. */
    .earth { display: flex; align-items: center; gap: 6px; min-height: 24px; padding: 0 6px 0 0; margin: 0 -6px 0 0; border: 0; border-radius: 12px; background: none; color: inherit; font: inherit; cursor: pointer; pointer-events: auto; }
    .earth:focus-visible { outline: 2px solid var(--color-starlight); outline-offset: 2px; }
    .arrow { flex: none; }
    :host(.flash) .dot { animation: flash 0.8s ease-in-out 2; }
    :host(.calm) .dot { animation: none; }
    @keyframes pulse { 50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--color-earth) 18%, transparent), 0 0 0 14px color-mix(in srgb, var(--color-earth) 5%, transparent), 0 0 20px 8px color-mix(in srgb, var(--color-earth) 55%, transparent); } }
    @keyframes flash { 50% { transform: scale(1.8); background: var(--color-ink-bright); } }
  `,
})
export class EarthMarker {
  protected readonly zoom = inject(ZoomState);
  private readonly geometry = inject(SceneGeometry);
  private readonly ui = inject(JourneyUi);

  protected readonly place = this.geometry.marker;
  /** Hidden while the Earth is drawn as a sphere, fading in on the way out of the solar system. */
  protected readonly opacity = computed(() => clamp((this.zoom.z() - MARKER_FROM_Z) * 4, 0, 1));
  protected readonly flashing = signal(false);
  /**
   * In free exploration the marker opens the Earth up close from the neighbouring stars outwards;
   * nearer in, the Earth sphere itself is the target.
   */
  protected readonly selectable = computed(() => this.ui.isExplore() && this.zoom.nearest() >= 3);

  constructor() {
    let timer: ReturnType<typeof setTimeout> | undefined;
    effect((onCleanup) => {
      if (this.ui.earthFlash() === 0) {
        return;
      }
      this.flashing.set(true);
      timer = setTimeout(() => this.flashing.set(false), FLASH_MS);
      onCleanup(() => clearTimeout(timer));
    });
  }

  protected open(): void {
    this.ui.planet.set('erde');
  }
}
