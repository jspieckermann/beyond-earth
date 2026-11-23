import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Body, MOONS, MoonId } from '../data/planets';
import { STAGES } from '../data/stages';
import { ZoomState } from '../engine/zoom-state';
import { JourneyUi } from '../journey-ui';
import { TextureData, proceduralTexture, renderSphere, sphereLookup, tintTexture } from '../scene/sphere-renderer';
import { loadTexture, textureWidth } from '../scene/textures';
import { BirthYearForm } from './birth-year-form';

/** Radius of the drawn planet in CSS pixels. */
export const PLANET_RADIUS = 150;
/** Degrees per arrow key press and per pixel of horizontal drag. */
export const KEY_STEP = 15;
const DRAG_STEP = 0.6;

const GAS_GIANTS = new Set(['jupiter', 'saturn', 'uranus', 'neptun']);

/**
 * A planet, the Moon, the Sun or Voyager 1 up close: zoomed in from its stage, rotatable by drag or arrow keys
 * (Voyager 1 shows a picture instead), with its
 * line, Aha, moons and (for planets) the user's age there. Zoom gestures do not leave it (the wheel only scrolls
 * its content); it stays open until the back control ("Zurück zum Sonnensystem", for the Moon "Zurück zu Erde und Mond") or Escape.
 */
@Component({
  selector: 'app-planet-closeup',
  imports: [BirthYearForm, NgOptimizedImage, RouterLink],
  host: {
    '(keydown.escape)': 'close()',
  },
  templateUrl: './planet-closeup.html',
  styleUrl: './planet-closeup.css',
})
export class PlanetCloseup {
  readonly planet = input.required<Body>();

  protected readonly ui = inject(JourneyUi);
  private readonly zoom = inject(ZoomState);
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('sphere');
  private readonly back = viewChild.required<ElementRef<HTMLButtonElement>>('back');

  protected readonly radius = PLANET_RADIUS;
  /** Free exploration: the link to the travel planner of Modul B, with this object and the stage to return to. */
  protected readonly travel = computed(() =>
    this.ui.isExplore() ? { ziel: this.planet().id, von: STAGES[this.zoom.nearest()].id } : null,
  );
  protected readonly rotation = signal(0);
  protected readonly moon = signal<MoonId | null>(null);
  protected readonly moons = computed(() => this.planet().moons.map((id) => MOONS[id]));
  protected readonly selectedMoon = computed(() => {
    const id = this.moon();
    return id ? MOONS[id] : null;
  });

  private readonly texture = signal<TextureData | null>(null);
  private readonly lookup = sphereLookup(PLANET_RADIUS);
  private drag: { x: number } | null = null;

  constructor() {
    effect(() => {
      const planet = this.planet();
      this.texture.set(proceduralTexture(planet.color, GAS_GIANTS.has(planet.id)));
      this.moon.set(null);
      this.rotation.set(0);
      if (planet.picture || !planet.texture) {
        return;
      }
      void loadTexture(`journey/tex/${planet.texture}-${textureWidth()}.webp`).then((tex) => {
        if (tex && this.planet() === planet) {
          this.texture.set(planet.tint ? tintTexture(tex, planet.tint) : tex);
        }
      });
    });
    effect(() => this.draw(this.rotation(), this.texture()));
    afterNextRender(() => this.back().nativeElement.focus());
    this.zoom.stop();
    inject(DestroyRef).onDestroy(() => (this.drag = null));
  }

  close(): void {
    this.ui.factsOpen.set(false);
    this.ui.planet.set(null);
  }

  protected rotateBy(degrees: number): void {
    this.rotation.update((r) => (r + degrees) % 360);
  }

  protected onSphereKey(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.rotateBy(KEY_STEP);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.rotateBy(-KEY_STEP);
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    this.drag = { x: event.clientX };
  }

  /** Dragging turns the planet; it never leaves the close-up. */
  protected onPointerMove(event: PointerEvent): void {
    if (!this.drag) {
      return;
    }
    this.rotateBy((event.clientX - this.drag.x) * DRAG_STEP);
    this.drag.x = event.clientX;
  }

  protected onPointerUp(): void {
    this.drag = null;
  }

  protected shareAge(): void {
    const planet = this.planet().planet;
    if (planet) {
      this.ui.share.set({ kinds: ['alter'], planet: planet.id });
    }
  }

  private draw(rotation: number, texture: TextureData | null): void {
    const ctx = this.canvas()?.nativeElement.getContext?.('2d');
    if (!ctx || !texture) {
      return;
    }
    const image = ctx.createImageData(this.lookup.size, this.lookup.size);
    renderSphere(this.lookup, texture, image.data, { rotation, emissive: this.planet().emissive });
    ctx.putImageData(image, 0, 0);
  }
}
