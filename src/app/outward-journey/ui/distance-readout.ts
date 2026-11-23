import { Component, computed, inject } from '@angular/core';
import { STAGE_DISTANCES } from '../data/stages';
import { formatDistance, formatLightTime } from '../engine/format';
import { distanceAt, stageNearness } from '../engine/zoom-math';
import { ZoomState } from '../engine/zoom-state';

/** The current distance and light time in the corner, plus the large quiet value while zooming. */
@Component({
  selector: 'app-distance-readout',
  template: `
    <p class="corner">
      <span class="distance">{{ distance() }}</span>
      <span class="light">Licht · {{ light() }}</span>
    </p>
    <p class="transit" aria-hidden="true" [style.opacity]="transitOpacity()">{{ distance() }}</p>
  `,
  styles: `
    :host { position: absolute; inset: 0; pointer-events: none; }
    .corner { position: absolute; left: 22px; top: 64px; margin: 0; display: flex; flex-direction: column; gap: 2px; text-shadow: 0 0 8px #000; }
    .distance { font-size: 15px; font-weight: 500; color: var(--color-ink-bright); font-variant-numeric: tabular-nums; }
    .light { font-size: 11px; color: var(--color-ink-soft); }
    .transit { position: absolute; left: 0; right: 0; top: 30%; margin: 0; text-align: center; font-family: var(--font-serif); font-size: 44px; font-weight: 500; color: var(--color-ink-soft); text-shadow: 0 0 20px #000; font-variant-numeric: tabular-nums; }
    :host-context([data-layout='desktop']) .corner { left: 56px; top: 84px; }
    :host-context([data-layout='desktop']) .distance { font-size: 18px; }
    :host-context([data-layout='desktop']) .transit { font-size: 64px; }
  `,
})
export class DistanceReadout {
  private readonly zoom = inject(ZoomState);
  private readonly metres = computed(() => distanceAt(this.zoom.z(), STAGE_DISTANCES));

  protected readonly distance = computed(() => formatDistance(this.metres()));
  protected readonly light = computed(() => formatLightTime(this.metres()));
  protected readonly transitOpacity = computed(() =>
    this.zoom.restingStage() === null ? (1 - stageNearness(this.zoom.z())) * 0.9 : 0,
  );
}
