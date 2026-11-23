import { Component, ElementRef, afterRenderEffect, computed, effect, inject, input, signal, untracked, viewChild } from '@angular/core';
import { CLOCK } from '../../../core/clock';
import { subsolarPoint } from '../../engine/sun-position';
import { FRAME_SCHEDULER, ZoomState } from '../../engine/zoom-state';
import { JourneyUi } from '../../journey-ui';
import { SphereLookup, SunLighting, TextureData, renderLitSphere, sphereLookup, sunLighting } from '../sphere-renderer';
import { loadTexture, textureWidth } from '../textures';

/** Longitude at the centre of the drawn globe (Europe and Africa face the viewer). */
export const GLOBE_CENTRE_LON = 15;
/** Pixel radius of the rendered globe (drawn at twice its size in base units for sharpness). */
const RENDER_RADIUS = 256;
/** One turn of the Earth in this time-lapse, instead of a day. */
export const GLOBE_TURN_MS = 120_000;
/** The globe is redrawn at most this often while it turns. */
const FRAME_MS = 33;

/** Where the Sun stands relative to the centre of the drawn Earth: everything near the Earth is lit from there. */
export function sunInView(date: Date): { lat: number; lon: number } {
  const sun = subsolarPoint(date);
  return { lat: sun.lat, lon: sun.lon - GLOBE_CENTRE_LON };
}

/**
 * Which part of the drawn globe lies in the night, seen from above the equator at `centreLon`.
 * With the Sun at relative longitude `rel` (east positive), the terminator projects to
 * x = −cos(rel), so the dark part covers (1 − cos rel) / 2 of the width, on the side away from the Sun.
 */
export function terminator(date: Date, centreLon = GLOBE_CENTRE_LON): { darkSide: 'left' | 'right'; darkFraction: number } {
  const sun = subsolarPoint(date);
  let rel = sun.lon - centreLon;
  rel = ((((rel + 180) % 360) + 360) % 360) - 180;
  const darkFraction = (1 - Math.cos((rel * Math.PI) / 180)) / 2;
  return { darkSide: rel >= 0 ? 'left' : 'right', darkFraction };
}

/**
 * The whole Earth with its day and night sides as they are right now: NASA-based day and night
 * textures blended by the Sun's position. Until they are loaded, a drawn globe stands in.
 * With `spin`, the Earth slowly turns eastwards in time-lapse while the view rests at it; the Sun stays
 * where it is, so the continents move through day and night. With reduced motion it stands still.
 */
@Component({
  selector: 'app-earth-globe',
  template: `
    <div class="globe" aria-hidden="true" [class.ready]="ready()" [style.width.px]="radius() * 2" [style.height.px]="radius() * 2"
      [style.box-shadow]="halo()">
      <div class="drawn">
        <div class="night" [style.background]="nightGradient()"></div>
      </div>
      <canvas #canvas [width]="size()" [height]="size()"></canvas>
    </div>
  `,
  styles: `
    :host { display: block; }
    .globe { position: relative; border-radius: 50%; }
    .drawn, canvas { position: absolute; inset: 0; width: 100%; height: 100%; border-radius: 50%; }
    .drawn {
      overflow: hidden;
      background:
        radial-gradient(ellipse 30% 13% at 30% 32%, rgb(255 255 255 / 0.55), transparent 70%),
        radial-gradient(ellipse 26% 22% at 46% 40%, #6c8a4c, transparent 70%),
        radial-gradient(ellipse 18% 30% at 52% 66%, #7a8a52, transparent 70%),
        radial-gradient(circle at 34% 36%, #4f93d4, #23609f 42%, #11365f 72%, #0a1f3a);
    }
    .night { position: absolute; inset: 0; }
    canvas { opacity: 0; transition: opacity 0.6s ease; }
    .ready canvas { opacity: 1; }
    .ready .drawn { opacity: 0; }
  `,
})
export class EarthGlobe {
  private readonly clock = inject(CLOCK);
  private readonly zoom = inject(ZoomState);
  private readonly ui = inject(JourneyUi);
  private readonly frames = inject(FRAME_SCHEDULER);
  readonly radius = input(160);
  /** Only the Earth of the first stage turns; other drawings of the Earth take over where it stopped. */
  readonly spin = input(false);
  /** Rendered at about four pixels per base unit (sharp at twice the size on dense screens), at most 512 px. */
  protected readonly size = computed(() => 2 * Math.min(RENDER_RADIUS, Math.round(this.radius() * 4)));
  /** The glow around the globe, in proportion to its size. */
  protected readonly halo = computed(() => {
    const r = this.radius();
    return `0 0 0 ${Math.max(1, r / 80)}px rgb(130 180 255 / 0.16), 0 0 ${r * 0.44}px ${r * 0.075}px rgb(110 170 255 / 0.22)`;
  });

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly day = signal<TextureData | null>(null);
  private readonly night = signal<TextureData | null>(null);
  protected readonly ready = signal(false);

  private lookup: SphereLookup | null = null;
  private lighting: SunLighting | null = null;
  private image: ImageData | null = null;

  /** Turning only while the view rests at the Earth and no close-up covers it. */
  private readonly spinning = computed(
    () => this.spin() && this.ready() && !this.zoom.reducedMotion() && this.zoom.restingStage() === 0 && this.ui.planet() === null,
  );

  private readonly side = computed(() => terminator(this.clock()));

  /** Dark overlay over the night side of the drawn stand-in, softened at the terminator. */
  protected readonly nightGradient = computed(() => {
    const { darkSide, darkFraction } = this.side();
    const dir = darkSide === 'right' ? '90deg' : '270deg';
    const start = (1 - darkFraction) * 100;
    return `linear-gradient(${dir}, transparent ${start - 4}%, rgb(2 3 10 / 0.6) ${start + 2}%, rgb(2 3 10 / 0.92) ${start + 10}%)`;
  });

  constructor() {
    const width = textureWidth();
    void loadTexture(`journey/tex/earth-day-${width}.webp`).then((t) => this.day.set(t));
    void loadTexture(`journey/tex/earth-night-${width}.webp`).then((t) => this.night.set(t));
    // Draws once the textures are there, and again whenever the turning Earth has stopped somewhere else.
    afterRenderEffect(() => {
      const day = this.day();
      const night = this.night();
      const turned = this.ui.earthTurn();
      if (day && night) {
        this.ready.set(this.draw(day, night, turned));
      }
    });
    effect((onCleanup) => {
      if (!this.spinning()) {
        return;
      }
      const day = untracked(this.day);
      const night = untracked(this.night);
      if (!day || !night) {
        return;
      }
      let turned = untracked(this.ui.earthTurn);
      let last = this.frames.now();
      let handle = 0;
      const tick = (now: number) => {
        if (now - last >= FRAME_MS) {
          turned = (turned + ((now - last) / GLOBE_TURN_MS) * 360) % 360;
          last = now;
          this.draw(day, night, turned);
        }
        handle = this.frames.request(tick);
      };
      handle = this.frames.request(tick);
      onCleanup(() => {
        this.frames.cancel(handle);
        // Hand the position on when the turning pauses, so the Earth at the next stage matches.
        this.ui.earthTurn.set(turned);
      });
    });
  }

  private draw(day: TextureData, night: TextureData, turned: number): boolean {
    const ctx = this.canvas().nativeElement.getContext?.('2d');
    if (!ctx) {
      return false;
    }
    if (!this.lookup || !this.lighting || !this.image) {
      this.lookup = sphereLookup(this.size() / 2);
      // The Sun's place relative to the view stays fixed; the surface turns beneath it.
      this.lighting = sunLighting(this.lookup, sunInView(this.clock()));
      this.image = ctx.createImageData(this.lookup.size, this.lookup.size);
    }
    // Texture longitude 0 sits in the middle of the image; turn the globe so GLOBE_CENTRE_LON faces us,
    // then further east (to the right) as time passes.
    renderLitSphere(this.lookup, day, night, this.lighting, this.image.data, -GLOBE_CENTRE_LON + turned);
    ctx.putImageData(this.image, 0, 0);
    return true;
  }
}
