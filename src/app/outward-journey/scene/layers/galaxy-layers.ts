import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { CosmicId, GalaxyId, GalaxyPartId } from '../../data/planets';
import { JourneyUi } from '../../journey-ui';

const LABEL = 'position: absolute; font-size: 11px; color: #c3c6d6; white-space: nowrap; pointer-events: none; opacity: var(--lo, 1); text-shadow: 0 0 6px #000;';

/** Width of the Milky Way reconstruction at its stage, in base units. */
export const MILKY_WAY_SIZE = 760;
/** Where the Sun sits in the reconstruction (fractions of the image). */
export const SUN_IN_IMAGE = { x: 0.5, y: 0.6914 } as const;

/** Position of the reconstruction drawn `size` wide, with the Sun at the Earth (the layer's origin). */
export function galaxyPlacement(size: number): { left: number; top: number; size: number } {
  return { left: -size * SUN_IN_IMAGE.x, top: -size * SUN_IN_IMAGE.y, size };
}

/** A point of the reconstruction (pixels of the 960 px picture) in base units relative to the Earth. */
function inImage(x: number, y: number): { x: number; y: number } {
  const scale = MILKY_WAY_SIZE / 960;
  return { x: (x - 960 * SUN_IN_IMAGE.x) * scale, y: (y - 960 * SUN_IN_IMAGE.y) * scale };
}

/** A labelled, selectable part of the galaxy: where it is marked and where its name sits. */
interface GalaxyMark {
  readonly id: GalaxyPartId;
  readonly name: string;
  readonly at: { readonly x: number; readonly y: number };
  readonly labelStyle: string;
  readonly hole?: boolean;
}

/**
 * The arms are marked where they are clearly visible in the reconstruction near the Sun (the part
 * of the galaxy that is on screen on phones); positions are pixels of the 960 px picture.
 */
export const GALAXY_MARKS: readonly GalaxyMark[] = [
  { id: 'sgr-a', name: 'Sagittarius A*', at: inImage(480, 484), labelStyle: 'left: 100%; top: 4px', hole: true },
  { id: 'scutum-centaurus-arm', name: 'Scutum-Centaurus-Arm', at: inImage(420, 598), labelStyle: 'right: 100%; top: 4px' },
  { id: 'sagittarius-arm', name: 'Sagittarius-Arm', at: inImage(540, 643), labelStyle: 'right: 4px; bottom: 75%' },
  { id: 'orion-arm', name: 'Orion-Arm', at: inImage(440, 655), labelStyle: 'right: 100%; top: 4px' },
  { id: 'perseus-arm', name: 'Perseus-Arm', at: inImage(360, 690), labelStyle: 'left: 100%; top: 4px' },
];

/**
 * Stage 5: the Milky Way from above (a reconstruction from measurements), with its main spiral arms
 * and the black hole Sagittarius A* labelled. In free exploration they can be selected, like the planets.
 */
@Component({
  selector: 'app-milky-way-layer',
  imports: [NgOptimizedImage],
  template: `
    <div class="galaxy" aria-hidden="true"
      [style.left.px]="place.left" [style.top.px]="place.top" [style.width.px]="place.size" [style.height.px]="place.size">
      <img ngSrc="journey/img/milky-way-960.webp" width="960" height="960" alt="" />
    </div>
    @for (m of marks; track m.id) {
      <span class="mark" [class.hole]="m.hole" aria-hidden="true" [style.left.px]="m.at.x" [style.top.px]="m.at.y"></span>
      @if (explore()) {
        <button type="button" class="hit" [attr.aria-label]="m.name + ' ansehen'" (click)="ui.planet.set(m.id)"
          [style.left.px]="m.at.x" [style.top.px]="m.at.y">
          <span class="lbl" aria-hidden="true" [style]="m.labelStyle">{{ m.name }}</span>
        </button>
      } @else {
        <span class="hit static" aria-hidden="true" [style.left.px]="m.at.x" [style.top.px]="m.at.y">
          <span class="lbl" [style]="m.labelStyle">{{ m.name }}</span>
        </span>
      }
    }
  `,
  styles: `
    :host { position: absolute; left: 0; top: 0; }
    .galaxy { position: absolute; }
    .galaxy img { display: block; width: 100%; height: 100%; max-width: none; mask-image: radial-gradient(circle at 50% 50.4%, #000 55%, transparent 71%); }
    .mark { position: absolute; width: 7px; height: 7px; margin: -3.5px 0 0 -3.5px; box-sizing: border-box; border-radius: 50%; border: 1.5px solid #f3eee2; box-shadow: 0 0 4px #000; opacity: var(--lo, 1); }
    .mark.hole { width: 10px; height: 10px; margin: -5px 0 0 -5px; background: #000; border: 2px solid #ffb066; box-shadow: 0 0 8px 3px rgb(255 160 70 / 0.7); }
    .hit { position: absolute; width: 24px; height: 24px; margin: -12px 0 0 -12px; padding: 0; border: 0; border-radius: 50%; background: transparent; cursor: pointer; font-family: inherit; }
    .hit.static { pointer-events: none; }
    .hit:focus-visible { outline: 2px solid #f3d9a4; outline-offset: 1px; }
    .lbl { ${LABEL} color: #f3eee2; padding: 4px 2px; margin-top: -4px; }
    button.hit .lbl { pointer-events: auto; cursor: pointer; }
  `,
})
export class MilkyWayLayer {
  protected readonly ui = inject(JourneyUi);
  protected readonly explore = computed(() => this.ui.variant() === 'freies-erkunden');
  protected readonly place = galaxyPlacement(MILKY_WAY_SIZE);
  protected readonly marks = GALAXY_MARKS;
}

/** A named, selectable galaxy of the Local Group: where it is drawn and where its name sits. */
interface LocalGalaxyMark {
  readonly id: GalaxyId;
  readonly name: string;
  readonly at: { readonly x: number; readonly y: number };
  readonly labelStyle: string;
}

/**
 * The named galaxies, in base units around the Milky Way. Their sizes and distances are drawn
 * larger than to scale, and far enough apart that each keeps a 24 px target.
 */
export const LOCAL_GROUP_MARKS: readonly LocalGalaxyMark[] = [
  { id: 'milchstrasse', name: 'Milchstrasse', at: { x: 0, y: -6 }, labelStyle: 'right: calc(100% + 14px); top: 3px' },
  { id: 'andromeda', name: 'Andromeda', at: { x: 5, y: -92 }, labelStyle: 'right: calc(100% + 24px); top: 4px' },
  { id: 'dreiecksgalaxie', name: 'Dreiecksgalaxie', at: { x: 33, y: -63 }, labelStyle: 'left: 50%; top: 100%; transform: translateX(-50%); font-size: 10px' },
  { id: 'grosse-magellansche-wolke', name: 'Grosse Magellansche Wolke', at: { x: -30, y: 36 }, labelStyle: 'right: 100%; top: 4px; font-size: 10px' },
  { id: 'kleine-magellansche-wolke', name: 'Kleine Magellansche Wolke', at: { x: 5, y: 53 }, labelStyle: 'left: 50%; top: 100%; transform: translateX(-50%); font-size: 10px' },
];

/**
 * Stage 6: the Local Group of galaxies (drawn after their measured arrangement). In free
 * exploration the named galaxies can be selected, like the planets.
 */
@Component({
  selector: 'app-local-group-layer',
  template: `
    <div class="bound" aria-hidden="true"></div>
    <div class="dwarfs" aria-hidden="true"></div>
    @for (g of marks; track g.id) {
      <div class="galaxy" [class]="g.id" aria-hidden="true" [style.left.px]="g.at.x" [style.top.px]="g.at.y"></div>
      @if (explore()) {
        <button type="button" class="hit" [attr.aria-label]="g.name + ' ansehen'" (click)="ui.planet.set(g.id)"
          [style.left.px]="g.at.x" [style.top.px]="g.at.y">
          <span class="lbl" aria-hidden="true" [style]="g.labelStyle">{{ g.name }}</span>
        </button>
      } @else {
        <span class="hit static" aria-hidden="true" [style.left.px]="g.at.x" [style.top.px]="g.at.y">
          <span class="lbl" [style]="g.labelStyle">{{ g.name }}</span>
        </span>
      }
    }
    <span class="lbl title" aria-hidden="true">Lokale Gruppe</span>
  `,
  styles: `
    :host { position: absolute; left: 0; top: 0; }
    div { position: absolute; border-radius: 50%; }
    .bound { left: -180px; top: -195px; width: 360px; height: 360px; box-sizing: border-box; border: 1px dashed rgb(236 232 221 / 0.18); }
    .galaxy { width: 0; height: 0; }
    .galaxy::before { content: ''; position: absolute; border-radius: 50%; transform: translate(-50%, -50%); }
    .milchstrasse::before { width: 58px; height: 58px; background: radial-gradient(circle, rgb(255 240 205 / 0.95), rgb(170 185 255 / 0.35) 50%, transparent 72%); }
    .andromeda::before { width: 78px; height: 30px; transform: translate(-50%, -50%) rotate(-35deg); background: radial-gradient(ellipse, rgb(255 240 210 / 0.95), rgb(180 190 255 / 0.25) 60%, transparent 100%); }
    .dreiecksgalaxie::before { width: 20px; height: 15px; background: radial-gradient(ellipse, rgb(220 225 255 / 0.85), rgb(220 225 255 / 0.3) 60%, transparent 100%); }
    .grosse-magellansche-wolke::before { width: 14px; height: 9px; background: radial-gradient(ellipse, rgb(220 225 255 / 0.8), transparent 100%); }
    .kleine-magellansche-wolke::before { width: 9px; height: 7px; background: radial-gradient(ellipse, rgb(220 225 255 / 0.75), transparent 100%); }
    .dwarfs { left: -165px; top: -210px; width: 390px; height: 390px; border-radius: 0; background: radial-gradient(circle at 34% 76%, rgb(220 225 255 / 0.5) 0 1px, transparent 2.5px), radial-gradient(circle at 58% 34%, rgb(220 225 255 / 0.5) 0 1px, transparent 2.5px), radial-gradient(circle at 70% 30%, rgb(220 225 255 / 0.45) 0 1px, transparent 2.5px), radial-gradient(circle at 22% 40%, rgb(220 225 255 / 0.4) 0 1px, transparent 2.5px), radial-gradient(circle at 66% 70%, rgb(220 225 255 / 0.4) 0 1px, transparent 2.5px), radial-gradient(circle at 48% 22%, rgb(220 225 255 / 0.4) 0 1px, transparent 2.5px), radial-gradient(circle at 80% 52%, rgb(220 225 255 / 0.35) 0 1px, transparent 2.5px), radial-gradient(circle at 32% 88%, rgb(220 225 255 / 0.35) 0 1px, transparent 2.5px); }
    .hit { position: absolute; width: 24px; height: 24px; margin: -12px 0 0 -12px; padding: 0; border: 0; border-radius: 50%; background: transparent; cursor: pointer; font-family: inherit; }
    .hit.static { pointer-events: none; }
    .hit:focus-visible { outline: 2px solid #f3d9a4; outline-offset: 1px; }
    .lbl { ${LABEL} font-size: 11px; padding: 4px 2px; margin-top: -4px; }
    button.hit .lbl { pointer-events: auto; cursor: pointer; }
    .title { left: 0; top: -186px; transform: translateX(-50%); padding: 0; margin: 0; }
  `,
})
export class LocalGroupLayer {
  protected readonly ui = inject(JourneyUi);
  protected readonly explore = computed(() => this.ui.variant() === 'freies-erkunden');
  protected readonly marks = LOCAL_GROUP_MARKS;
}

/** Width of the cosmic-web simulation picture in base units. */
export const UNIVERSE_SIZE = 1100;

/** A named, selectable structure or place of the whole universe: where it is marked and where its name sits. */
interface CosmicMark {
  readonly id: CosmicId;
  readonly name: string;
  readonly at: { readonly x: number; readonly y: number };
  readonly glow: string;
  readonly labelStyle: string;
}

const BELOW = 'left: 50%; top: 100%; transform: translateX(-50%)';

/**
 * The named structures, in base units around the Earth. The picture is a simulation, so their
 * places are schematic: near ones close to the Earth, the most distant ones further out. They sit
 * left of the Earth and above the stage texts, where the scale bar leaves room on phones.
 */
export const UNIVERSE_MARKS: readonly CosmicMark[] = [
  { id: 'laniakea', name: 'Laniakea-Superhaufen', at: { x: -4, y: -32 }, glow: '#ffd27a', labelStyle: 'left: 50%; bottom: 100%; transform: translateX(-50%); margin: 0 0 -4px' },
  { id: 'geschosshaufen', name: 'Geschosshaufen', at: { x: -140, y: -40 }, glow: '#c58cff', labelStyle: BELOW },
  { id: 'bootes-leerraum', name: 'Boötes-Leerraum', at: { x: -100, y: 50 }, glow: '#8f7cff', labelStyle: BELOW },
  { id: 'herkules-mauer', name: 'Herkules-Corona-Borealis-Mauer', at: { x: -60, y: 110 }, glow: '#ff9fd0', labelStyle: BELOW },
  { id: 'webb-deep-field', name: 'Webbs erstes Deep Field', at: { x: -110, y: -150 }, glow: '#ffcf9a', labelStyle: BELOW },
  { id: 'jades-gs-z14-0', name: 'JADES-GS-z14-0', at: { x: 40, y: -180 }, glow: '#ff8a5c', labelStyle: 'right: 100%; top: 4px' },
  { id: 'ton-618', name: 'TON 618', at: { x: 20, y: -105 }, glow: '#9fc4ff', labelStyle: BELOW },
  { id: 'mikrowellenhintergrund', name: 'Kosmischer Mikrowellenhintergrund', at: { x: 130, y: 150 }, glow: '#7fb6ff', labelStyle: 'right: 100%; top: 4px' },
];

/**
 * Stage 7: the cosmic web of galaxy clusters (a simulation picture), with giant structures and
 * remarkable places marked. In free exploration they can be selected, like the planets.
 */
@Component({
  selector: 'app-universe-layer',
  imports: [NgOptimizedImage],
  template: `
    <div class="frame" aria-hidden="true" [style.left.px]="-size / 2" [style.top.px]="-size * 0.333" [style.width.px]="size" [style.height.px]="size * 0.667">
      <img ngSrc="journey/img/cosmic-web-678.webp" width="678" height="452" alt="" />
    </div>
    @for (m of marks; track m.id) {
      <span class="mark" aria-hidden="true" [style.left.px]="m.at.x" [style.top.px]="m.at.y" [style.--glow]="m.glow"></span>
      @if (explore()) {
        <button type="button" class="hit" [attr.aria-label]="m.name + ' ansehen'" (click)="ui.planet.set(m.id)"
          [style.left.px]="m.at.x" [style.top.px]="m.at.y">
          <span class="lbl" aria-hidden="true" [style]="m.labelStyle">{{ m.name }}</span>
        </button>
      } @else {
        <span class="hit static" aria-hidden="true" [style.left.px]="m.at.x" [style.top.px]="m.at.y">
          <span class="lbl" [style]="m.labelStyle">{{ m.name }}</span>
        </span>
      }
    }
  `,
  styles: `
    :host { position: absolute; left: 0; top: 0; }
    .frame { position: absolute; opacity: 0.85; mask-image: radial-gradient(ellipse 50% 50% at 50% 50%, #000 60%, transparent 100%); }
    .frame img { display: block; width: 100%; height: 100%; max-width: none; }
    .mark { position: absolute; width: 9px; height: 9px; margin: -4.5px 0 0 -4.5px; box-sizing: border-box; border-radius: 50%; border: 1.5px solid #f3eee2; background: rgb(2 3 10 / 0.6); box-shadow: 0 0 6px 2px var(--glow), 0 0 3px #000; opacity: var(--lo, 1); }
    .hit { position: absolute; width: 24px; height: 24px; margin: -12px 0 0 -12px; padding: 0; border: 0; border-radius: 50%; background: transparent; cursor: pointer; font-family: inherit; }
    .hit.static { pointer-events: none; }
    .hit:focus-visible { outline: 2px solid #f3d9a4; outline-offset: 1px; }
    .lbl { ${LABEL} color: #f3eee2; font-size: 10px; padding: 4px 2px; margin-top: -4px; text-shadow: 0 0 4px #000, 0 0 8px #000; }
    button.hit .lbl { pointer-events: auto; cursor: pointer; }
  `,
})
export class UniverseLayer {
  protected readonly ui = inject(JourneyUi);
  protected readonly explore = computed(() => this.ui.variant() === 'freies-erkunden');
  protected readonly size = UNIVERSE_SIZE;
  protected readonly marks = UNIVERSE_MARKS;
}
