import { Component, computed, inject } from '@angular/core';
import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { BELT_RADIUS, ORBIT_RADII, PLANETS, Planet, SUN_OFFSET } from '../../data/planets';
import { JourneyUi } from '../../journey-ui';
import { SceneGeometry } from '../scene-geometry';
import { EarthGlobe } from './earth-globe';
import { BodyGlobe, SunDirection, sunFrom } from './body-globe';

/** Stage 1: the whole Earth with its day and night sides as they are right now. */
@Component({
  selector: 'app-earth-layer',
  imports: [EarthGlobe],
  template: `<app-earth-globe class="globe" [radius]="160" [spin]="true" />`,
  styles: `.globe { position: absolute; left: -160px; top: -160px; }`,
})
export class EarthLayer {}

/** Earth radius in the Earth–Moon layer; everything there is drawn at true ratio. */
const EARTH_R = 3.2;
/** One base unit in km at this layer (Earth diameter 12,742 km). */
const KM_PER_UNIT = 12_742 / (2 * EARTH_R);
const MOON_DISTANCE = 384_400 / KM_PER_UNIT;
const MOON_ANGLE = -143;
/** The seven other planets, Mercury to Neptune without the Earth, in km. */
const GAP_PLANETS = [
  { name: 'Merkur', d: 4_879, c: '#b7aea4' },
  { name: 'Venus', d: 12_104, c: '#e9cf96' },
  { name: 'Mars', d: 6_779, c: '#d06a3a' },
  { name: 'Jupiter', d: 139_820, c: '#d8b48a' },
  { name: 'Saturn', d: 116_460, c: '#e6d29e' },
  { name: 'Uranus', d: 50_724, c: '#9fd6dd' },
  { name: 'Neptun', d: 49_244, c: '#5f86e0' },
];

/**
 * Radius the Earth is drawn with here, so it shows as a sphere: larger than to scale. The Moon keeps the true
 * ratio to it (1.737 km : 6.371 km). For "Planeten in die Lücke" both shrink to their true size.
 */
export const EARTH_VIEW_R = 20;
const MOON_VIEW_R = (EARTH_VIEW_R * 1_737.4) / 6_371;
/** Scale that brings both spheres back to their true size. */
const TRUE_SIZE = EARTH_R / EARTH_VIEW_R;
const MOON_POS = {
  x: Math.cos((MOON_ANGLE * Math.PI) / 180) * MOON_DISTANCE,
  y: Math.sin((MOON_ANGLE * Math.PI) / 180) * MOON_DISTANCE,
};

/**
 * Stage 2: Earth and Moon as spheres at their true distance; the spheres are drawn larger than to scale,
 * until the planets glide into the gap. In free exploration, Earth and Moon can be selected.
 */
@Component({
  selector: 'app-earth-moon-layer',
  imports: [EarthGlobe, BodyGlobe],
  template: `
    <div class="orbit" aria-hidden="true" [style.width.px]="moonDistance * 2" [style.height.px]="moonDistance * 2"
      [style.left.px]="-moonDistance" [style.top.px]="-moonDistance"></div>
    <div class="axis" aria-hidden="true" [style.transform]="'rotate(' + angle + 'deg)'">
      @for (p of gap; track p.name) {
        <span class="gap-planet" [class.in]="ui.planetsInGap()"
          [style.width.px]="p.size" [style.height.px]="p.size" [style.left.px]="p.left" [style.top.px]="-p.size / 2"
          [style.background]="p.c" [style.transition-delay.ms]="ui.planetsInGap() ? $index * 350 : 0"></span>
      }
    </div>
    @if (explore()) {
      <!-- The names belong to the buttons, so they can be clicked too. -->
      <button type="button" class="hit earth-hit" aria-label="Erde ansehen" (click)="ui.planet.set('erde')"
        [style.width.px]="earthR * 2" [style.height.px]="earthR * 2" [style.left.px]="-earthR" [style.top.px]="-earthR">
        <app-earth-globe class="sphere" [class.true-size]="ui.planetsInGap()" [radius]="earthR" />
        <span class="lbl earth-lbl" aria-hidden="true" [class.near]="ui.planetsInGap()">Erde</span>
      </button>
      <button type="button" class="hit moon-hit" aria-label="Mond ansehen" (click)="ui.planet.set('mond')"
        [style.left.px]="moon.x - 14" [style.top.px]="moon.y - 14">
        <app-body-globe class="sphere" [class.true-size]="ui.planetsInGap()" texture="mond" [radius]="moonR" [loadFrom]="moonLoadFrom" />
        <span class="lbl moon-lbl" aria-hidden="true">Mond</span>
      </button>
    } @else {
      <app-earth-globe class="sphere alone" [class.true-size]="ui.planetsInGap()" [radius]="earthR"
        [style.left.px]="-earthR" [style.top.px]="-earthR" />
      <app-body-globe class="sphere alone" [class.true-size]="ui.planetsInGap()" texture="mond" [radius]="moonR" [loadFrom]="moonLoadFrom"
        [style.left.px]="moon.x - moonR" [style.top.px]="moon.y - moonR" />
      <span class="lbl" aria-hidden="true" [class.near]="ui.planetsInGap()" [style.left.px]="earthR + 6" [style.top.px]="-7">Erde</span>
      <span class="lbl" aria-hidden="true" [style.left.px]="moon.x + 6" [style.top.px]="moon.y - 18">Mond</span>
    }
  `,
  styles: `
    :host, .axis { position: absolute; left: 0; top: 0; }
    .orbit { position: absolute; border-radius: 50%; border: 1px dashed rgb(236 232 221 / 0.2); }
    .hit { position: absolute; padding: 0; border: 0; border-radius: 50%; background: transparent; display: grid; place-items: center; cursor: pointer; font-family: inherit; }
    .hit:focus-visible { outline: 2px solid #f3d9a4; outline-offset: 2px; }
    .moon-hit { width: 28px; height: 28px; }
    .sphere { transition: transform 0.6s ease; }
    .sphere.alone { position: absolute; }
    .sphere.true-size { transform: scale(${TRUE_SIZE}); }
    .gap-planet { position: absolute; border-radius: 50%; opacity: 0; transform: translateY(40px); transition: opacity 0.6s ease, transform 0.6s ease; }
    .gap-planet.in { opacity: 1; transform: none; }
    .lbl { position: absolute; font-size: 11px; color: #c3c6d6; white-space: nowrap; opacity: var(--lo, 1); transition: transform 0.6s ease; }
    .lbl.near { transform: translateX(${-(EARTH_VIEW_R - EARTH_R)}px); }
    /* Inside the buttons: padded, so the name itself is a comfortable target. */
    .hit .lbl { padding: 4px 2px; cursor: pointer; }
    .earth-lbl { left: calc(100% + 4px); top: 50%; margin-top: -11px; }
    .moon-lbl { left: 18px; top: -8px; }
    @media (prefers-reduced-motion: reduce) { .gap-planet { transition: opacity 0.2s; transform: none; } .sphere, .lbl { transition: none; } }
  `,
})
export class EarthMoonLayer {
  protected readonly ui = inject(JourneyUi);
  protected readonly explore = computed(() => this.ui.variant() === 'freies-erkunden');
  protected readonly earthR = EARTH_VIEW_R;
  protected readonly moonR = MOON_VIEW_R;
  /** The Moon's texture loads once the view starts to leave the Earth. */
  protected readonly moonLoadFrom = 0.2;
  protected readonly moon = MOON_POS;
  protected readonly moonDistance = MOON_DISTANCE;
  protected readonly angle = MOON_ANGLE;
  /** Planets lined up side by side from the Earth's edge towards the Moon. */
  protected readonly gap = GAP_PLANETS.reduce<{ name: string; c: string; size: number; left: number }[]>((acc, p) => {
    const size = p.d / KM_PER_UNIT;
    const prev = acc.at(-1);
    const left = prev ? prev.left + prev.size : EARTH_R;
    return [...acc, { name: p.name, c: p.c, size, left }];
  }, []);
  /** Gap between the surfaces of Earth and Moon, in base units. */
  static readonly gapLength = MOON_DISTANCE - EARTH_R - 1737 / KM_PER_UNIT;
}

interface PlanetView extends Planet {
  readonly selectable: boolean;
  /** Where the Sun stands as seen from the planet, for its lit side. */
  readonly sunSide: SunDirection;
  /** Half the drawn width, with Saturn's rings; the name starts beyond it. */
  readonly halfWidth: number;
  readonly labelBelow: boolean;
}

/** Width of Saturn's rings in planet diameters. */
const SATURN_RINGS = 2.3;

/** Voyager 1 just outside Neptune's orbit, in base units from the Earth. */
export const VOYAGER_POSITION = { x: -21, y: -267 } as const;
/** Highest screen position (px) of Voyager 1 at rest: below the header, so it can always be selected. */
export const VOYAGER_SAFE_TOP = 84;

/** Voyager's vertical position in base units: above Neptune's orbit, but never under the header. */
export function voyagerY(focusY: number, unit: number): number {
  return Math.max(VOYAGER_POSITION.y, (VOYAGER_SAFE_TOP - focusY) / unit);
}

/** Stage 3: the Sun and the orbits of all eight planets; the Sun, the planets and Voyager 1 can be selected. */
@Component({
  selector: 'app-solar-system-layer',
  imports: [NgOptimizedImage, NgTemplateOutlet, BodyGlobe],
  template: `
    @for (r of orbits; track r) {
      <div class="orbit-ring" [class.home]="r === earthOrbit" aria-hidden="true"
        [style.left.px]="sun.x - r" [style.top.px]="sun.y - r" [style.width.px]="r * 2" [style.height.px]="r * 2"></div>
    }
    <div class="orbit-ring belt" aria-hidden="true" [style.left.px]="sun.x - belt" [style.top.px]="sun.y - belt"
      [style.width.px]="belt * 2" [style.height.px]="belt * 2"></div>
    <!-- The Sun as a glowing sphere with its real surface, like the planets around it. -->
    <app-body-globe class="sun" aria-hidden="true" texture="sonne" [radius]="9" color="#ffb347" [emissive]="true" [loadFrom]="loadFrom"
      [style.left.px]="sun.x - 9" [style.top.px]="sun.y - 9" />
    @if (explore()) {
      <button type="button" class="planet sun-hit" aria-label="Sonne ansehen" (click)="ui.planet.set('sonne')"
        [style.left.px]="sun.x" [style.top.px]="sun.y"></button>
    }
    @for (p of planets(); track p.id) {
      @if (p.selectable) {
        <button type="button" class="planet" [attr.aria-label]="p.name + ' ansehen'" (click)="select(p)"
          [style.left.px]="p.orbit.x" [style.top.px]="p.orbit.y">
          <ng-container *ngTemplateOutlet="sphere; context: { $implicit: p }" />
          <!-- Beside the planet (and its rings); Jupiter's and Neptune's below it, clear of the scale bar and readout of phones. -->
          <span class="lbl" [class.below]="p.labelBelow" aria-hidden="true"
            [style.left.px]="p.labelBelow ? 14 : 14 + p.halfWidth + 3" [style.top.px]="p.labelBelow ? 14 + p.orbit.size / 2 : -2">{{ p.name }}</span>
        </button>
      } @else {
        <span class="placed" aria-hidden="true" [style.left.px]="p.orbit.x" [style.top.px]="p.orbit.y">
          <ng-container *ngTemplateOutlet="sphere; context: { $implicit: p }" />
        </span>
        <span class="lbl" [class.below]="p.labelBelow" aria-hidden="true"
          [style.left.px]="p.labelBelow ? p.orbit.x : p.orbit.x + p.halfWidth + 3"
          [style.top.px]="p.labelBelow ? p.orbit.y + p.orbit.size / 2 + 2 : p.orbit.y - 16">{{ p.name }}</span>
      }
    }
    <!-- A planet as a sphere with its real surface, lit from the Sun; Saturn with its rings. -->
    <ng-template #sphere let-p>
      <app-body-globe class="body" [texture]="p.id" [radius]="p.orbit.size / 2" [color]="p.orbit.color" [sun]="p.sunSide" [loadFrom]="loadFrom" />
      @if (p.id === 'saturn') {
        <span class="rings" [style.width.px]="p.orbit.size * rings" [style.height.px]="p.orbit.size * 0.62"></span>
      }
    </ng-template>
    <div class="voyager" aria-hidden="true" [style.left.px]="voyager().x - 9" [style.top.px]="voyager().y - 9">
      <img ngSrc="journey/img/voyager-120.webp" width="120" height="99" alt="" />
    </div>
    @if (explore()) {
      <button type="button" class="planet" aria-label="Voyager 1 ansehen" (click)="ui.planet.set('voyager')"
        [style.left.px]="voyager().x" [style.top.px]="voyager().y">
        <span class="lbl" aria-hidden="true" style="left: 25px; top: 7px">Voyager 1</span>
      </button>
    } @else {
      <span class="lbl" aria-hidden="true" [style.left.px]="voyager().x + 11" [style.top.px]="voyager().y - 7">Voyager 1</span>
    }
  `,
  styles: `
    :host { position: absolute; left: 0; top: 0; }
    .orbit-ring { position: absolute; box-sizing: border-box; border-radius: 50%; border: 1px solid rgb(236 232 221 / 0.2); }
    .orbit-ring.home { border-color: rgb(143 194 255 / 0.5); }
    .orbit-ring.belt { border: 5px dotted rgb(200 190 170 / 0.16); }
    .voyager { position: absolute; border-radius: 50%; overflow: hidden; }
    .voyager img { display: block; width: 100%; height: 100%; object-fit: cover; }
    .sun { position: absolute; border-radius: 50%; box-shadow: 0 0 22px 8px rgb(255 180 80 / 0.45); }
    .planet { position: absolute; width: 28px; height: 28px; margin: -14px 0 0 -14px; padding: 0; border: 0; border-radius: 50%; background: transparent; display: grid; place-items: center; cursor: pointer; }
    .planet { font-family: inherit; }
    .placed { position: absolute; width: 0; height: 0; display: grid; place-items: center; }
    .body { grid-area: 1 / 1; }
    .rings { grid-area: 1 / 1; box-sizing: border-box; border-radius: 50%; border: 1.5px solid rgb(230 214 170 / 0.7); transform: rotate(-18deg); pointer-events: none; }
    /* Inside a button the name is part of the hit area. */
    .planet .lbl { pointer-events: auto; cursor: pointer; padding: 4px 6px 4px 0; margin: -4px 0 0; }
    .lbl.below { transform: translateX(-50%); }
    .planet .lbl.below { padding: 4px 6px; margin: 0; }
    .planet:focus-visible { outline: 2px solid #f3d9a4; outline-offset: 1px; }
    .sun-hit { width: 24px; height: 24px; margin: -12px 0 0 -12px; }
    .voyager { width: 18px; height: 18px; mix-blend-mode: screen; }
    .lbl { position: absolute; font-size: 10px; color: #c3c6d6; white-space: nowrap; pointer-events: none; opacity: var(--lo, 1); }
  `,
})
export class SolarSystemLayer {
  protected readonly ui = inject(JourneyUi);
  protected readonly explore = computed(() => this.ui.variant() === 'freies-erkunden');
  private readonly geometry = inject(SceneGeometry);
  protected readonly voyager = computed(() => ({
    x: VOYAGER_POSITION.x,
    y: voyagerY(this.geometry.focus().y, this.geometry.unit()),
  }));
  protected readonly sun = SUN_OFFSET;
  protected readonly orbits = ORBIT_RADII;
  protected readonly earthOrbit = ORBIT_RADII[2];
  protected readonly belt = BELT_RADIUS;
  /** The planet textures load once the view leaves Erde und Mond towards the solar system. */
  protected readonly loadFrom = 1.3;
  protected readonly rings = SATURN_RINGS;
  protected readonly planets = computed<PlanetView[]>(() =>
    PLANETS.map((p) => ({
      ...p,
      selectable: this.ui.variant() === 'freies-erkunden',
      sunSide: sunFrom(SUN_OFFSET.x - p.orbit.x, SUN_OFFSET.y - p.orbit.y),
      halfWidth: p.id === 'saturn' ? p.orbit.size * SATURN_RINGS / 2 : p.orbit.size / 2,
      // Beside these two, the name would run under the scale bar or the distance readout of phones.
      labelBelow: p.id === 'jupiter' || p.id === 'neptun',
    })),
  );

  protected select(planet: Planet): void {
    this.ui.planet.set(planet.id);
    if (planet.id === 'erde') {
      this.ui.earthFlash.update((n) => n + 1);
    }
  }
}
