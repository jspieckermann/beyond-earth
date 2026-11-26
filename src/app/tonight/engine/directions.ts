import { SkyPosition } from './ephemeris';
import { BandSample } from './band';

/** The eight compass directions. */
export type Compass = 'N' | 'NO' | 'O' | 'SO' | 'S' | 'SW' | 'W' | 'NW';

export interface CompassDirection {
  readonly id: Compass;
  /** "Westen" */
  readonly name: string;
  /** "nach Westen" */
  readonly towards: string;
  readonly az: number;
}

export const COMPASS: readonly CompassDirection[] = [
  { id: 'N', name: 'Norden', towards: 'nach Norden', az: 0 },
  { id: 'NO', name: 'Nordosten', towards: 'nach Nordosten', az: 45 },
  { id: 'O', name: 'Osten', towards: 'nach Osten', az: 90 },
  { id: 'SO', name: 'Südosten', towards: 'nach Südosten', az: 135 },
  { id: 'S', name: 'Süden', towards: 'nach Süden', az: 180 },
  { id: 'SW', name: 'Südwesten', towards: 'nach Südwesten', az: 225 },
  { id: 'W', name: 'Westen', towards: 'nach Westen', az: 270 },
  { id: 'NW', name: 'Nordwesten', towards: 'nach Nordwesten', az: 315 },
];

export function compass(id: Compass): CompassDirection {
  return COMPASS.find((c) => c.id === id) as CompassDirection;
}

/** The compass direction (of eight) an azimuth points to. */
export function compassWord(az: number): CompassDirection {
  return COMPASS[Math.round((((az % 360) + 360) % 360) / 45) % 8];
}

/** Band samples must be this high to count for a direction. */
export const MIN_BAND_ALTITUDE = 15;
/** The band "passes overhead" this close to the zenith. */
export const ZENITH_REACH = 30;
/** Half the width of a compass sector. */
export const VIEW_HALF_WIDTH = 45;
/** From this altitude on, an object stands „Fast genau über dir“. */
export const OVERHEAD_ALTITUDE = 70;

/** Angle from `centre` to `az`, −180 to 180; positive is to the right (clockwise) when facing `centre`. */
export function azimuthOffset(az: number, centre: number): number {
  return ((((az - centre) % 360) + 540) % 360) - 180;
}

/** How many band samples above 15° each compass direction sees within ±45°. */
export function sectorScores(samples: readonly BandSample[]): Map<Compass, number> {
  const scores = new Map<Compass, number>();
  for (const c of COMPASS) {
    scores.set(c.id, samples.filter((s) => s.alt >= MIN_BAND_ALTITUDE && Math.abs(azimuthOffset(s.az, c.az)) <= VIEW_HALF_WIDTH).length);
  }
  return scores;
}

export function bandNearZenith(samples: readonly BandSample[]): boolean {
  return samples.some((s) => s.alt >= 90 - ZENITH_REACH);
}

/** Fists at arm's length (one fist ≈ 10°), rounded to halves. */
export function fists(degrees: number): number {
  return Math.round(degrees / 5) / 2;
}

const NUMBERS = ['null', 'eine', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];

/** 1 → „eine Faust“, 1,5 → „gut eine Faust“, 3 → „drei Fäuste“, 3,5 → „gut drei Fäuste“, 0,5 → „eine halbe Faust“. */
export function fistWords(count: number): string {
  if (count <= 0) {
    return 'knapp über dem Horizont';
  }
  if (count === 0.5) {
    return 'eine halbe Faust';
  }
  const whole = Math.floor(count);
  const unit = whole === 1 ? 'Faust' : 'Fäuste';
  const word = NUMBERS[Math.min(whole, 9)];
  return count > whole ? `gut ${word} ${unit}` : `${word} ${unit}`;
}

/** „gut drei Fäuste hoch“ */
export function heightWords(alt: number): string {
  const f = fists(alt);
  return f <= 0 ? 'knapp über dem Horizont' : `${fistWords(f)} hoch`;
}

/** Whole fists for the cards: 37° → „Vier Fäuste“, 12° → „Eine Faust“ (at least one). */
export function wholeFists(alt: number): string {
  const n = Math.min(9, Math.max(1, Math.round(alt / 10)));
  const word = NUMBERS[n];
  return `${word.charAt(0).toUpperCase()}${word.slice(1)} ${n === 1 ? 'Faust' : 'Fäuste'}`;
}

/** „Süden · Vier Fäuste hoch“, or „Fast genau über dir“ from 70° on. */
export function positionWords(p: SkyPosition): string {
  return p.alt >= OVERHEAD_ALTITUDE ? 'Fast genau über dir' : `${compassWord(p.az).name} · ${wholeFists(p.alt)} hoch`;
}

/** From one star to the next: „zwei Fäuste höher, etwas nach links“. */
export function relativeStep(from: SkyPosition, to: SkyPosition): string {
  const up = fists(to.alt - from.alt);
  const side = azimuthOffset(to.az, from.az) * Math.cos((((from.alt + to.alt) / 2) * Math.PI) / 180);
  const vertical = up === 0 ? 'auf gleicher Höhe' : `${fistWords(Math.abs(up))} ${up > 0 ? 'höher' : 'tiefer'}`;
  if (Math.abs(side) < 4) {
    return up === 0 ? 'gleich daneben' : `${vertical}, fast genau ${up > 0 ? 'darüber' : 'darunter'}`;
  }
  const amount = Math.abs(side) < 15 ? 'etwas ' : '';
  return `${vertical}, ${amount}nach ${side < 0 ? 'links' : 'rechts'}`;
}

/** Angular distance between two positions in the local sky, in degrees. */
export function separation(a: SkyPosition, b: SkyPosition): number {
  const r = Math.PI / 180;
  const c = Math.sin(a.alt * r) * Math.sin(b.alt * r) + Math.cos(a.alt * r) * Math.cos(b.alt * r) * Math.cos((a.az - b.az) * r);
  return Math.acos(Math.min(1, Math.max(-1, c))) / r;
}
