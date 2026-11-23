import { Component, computed, inject } from '@angular/core';
import { STAGES } from '../data/stages';
import { labelOpacity, layerOpacity, layerScale } from '../engine/zoom-math';
import { ZoomState } from '../engine/zoom-state';
import { ZoomInput } from '../input/zoom-input';
import { LocalGroupLayer, MilkyWayLayer, UniverseLayer } from './layers/galaxy-layers';
import { EarthLayer, EarthMoonLayer, SolarSystemLayer } from './layers/near-layers';
import { StarSystemLayer } from './layers/star-layers';
import { OrionSky } from './orion-sky';
import { SceneGeometry } from './scene-geometry';

interface LayerView {
  readonly n: number;
  readonly opacity: number;
  readonly transform: string;
  readonly labels: number;
}

/**
 * The single continuous picture: one layer per stage, anchored at the Earth, each scaled and
 * faded by the zoom. Wheel, drag and pinch on it zoom the journey.
 */
@Component({
  selector: 'app-journey-scene',
  imports: [
    ZoomInput,
    EarthLayer,
    EarthMoonLayer,
    SolarSystemLayer,
    StarSystemLayer,
    MilkyWayLayer,
    LocalGroupLayer,
    UniverseLayer,
    OrionSky,
  ],
  template: `
    <div class="scene" appZoomInput role="group" aria-roledescription="Bild" [attr.aria-label]="description()">
      @for (layer of layers(); track layer.n) {
        <div class="layer" [attr.data-stage]="layer.n" [style.left.px]="earth().x" [style.top.px]="earth().y"
          [style.opacity]="layer.opacity" [style.transform]="layer.transform" [style.--lo]="layer.labels"
          [style.visibility]="layer.opacity > 0 ? 'visible' : 'hidden'" [class.rm]="reduced()">
          @switch (layer.n) {
            @case (0) { <app-earth-layer /> }
            @case (1) { <app-earth-moon-layer /> }
            @case (2) { <app-solar-system-layer /> }
            @case (3) { <app-star-system-layer /> }
            @case (4) { <app-milky-way-layer /> }
            @case (5) { <app-local-group-layer /> }
            @case (6) { <app-universe-layer /> }
          }
        </div>
      }
      <app-orion-sky />
    </div>
  `,
  styles: `
    :host { position: absolute; inset: 0; }
    .scene {
      position: absolute; inset: 0; overflow: hidden; touch-action: none; cursor: grab;
      background:
        radial-gradient(circle at 12% 14%, rgb(236 232 221 / 0.5) 0 1px, transparent 2px),
        radial-gradient(circle at 80% 8%, rgb(236 232 221 / 0.4) 0 1px, transparent 2px),
        radial-gradient(circle at 90% 54%, rgb(236 232 221 / 0.35) 0 1px, transparent 2px),
        radial-gradient(circle at 6% 62%, rgb(236 232 221 / 0.3) 0 1px, transparent 2px),
        radial-gradient(circle at 44% 90%, rgb(236 232 221 / 0.3) 0 1px, transparent 2px),
        #02030a;
    }
    .scene:active { cursor: grabbing; }
    .layer { position: absolute; width: 0; height: 0; transform-origin: 0 0; will-change: transform, opacity; }
    .layer.rm { transition: opacity 0.4s ease; }
  `,
})
export class JourneyScene {
  private readonly zoom = inject(ZoomState);
  private readonly geometry = inject(SceneGeometry);

  protected readonly earth = this.geometry.earth;
  protected readonly reduced = this.zoom.reducedMotion;

  protected readonly layers = computed<LayerView[]>(() => {
    const z = this.zoom.z();
    const unit = this.geometry.unit();
    return STAGES.map((_, n) => ({
      n,
      opacity: layerOpacity(n, z),
      transform: `scale(${layerScale(n, z) * unit})`,
      labels: labelOpacity(n, z),
    }));
  });

  /** Text alternative of the picture at the nearest stage. */
  protected readonly description = computed(() => STAGES[this.zoom.nearest()].alt);
}
