import { LandDetail } from '../data/earth-drawings';
import { STATIONS, Station } from '../data/stations';

/** The land of one station, with its regions, faded in by `opacity`. */
export interface LandLayer {
  readonly path: string;
  readonly fill: string;
  readonly details: readonly LandDetail[];
  readonly opacity: number;
}

/** The Earth at any number of rounds back, blended from the drawings of the two neighbouring stations. */
export interface EarthState {
  readonly ocean: string;
  /** The shallow water along the coasts, a lighter shade of the ocean. */
  readonly shelf: string;
  /** Up to two drawings of land: the older one fades in while the younger one fades out. */
  readonly land: readonly LandLayer[];
  readonly iceNorth: number;
  readonly iceSouth: number;
}

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));

/** A colour between `a` and `b` (both "#rrggbb"). */
export function mixColour(a: string, b: string, t: number): string {
  const [x, y] = [hex(a), hex(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * The Earth at `rounds` back. Between two stations the land of the younger one, with its deserts, forests and
 * ice, fades out while the land of the older one fades in; the ocean colour changes gradually and the polar ice
 * grows or shrinks smoothly.
 */
export function earthAt(rounds: number, stations: readonly Station[] = STATIONS): EarthState {
  const last = stations.length - 1;
  const r = Math.min(Math.max(rounds, stations[0].rounds), stations[last].rounds);
  let i = 0;
  while (i < last - 1 && r > stations[i + 1].rounds) {
    i++;
  }
  const a = stations[i].earth;
  const b = stations[Math.min(i + 1, last)].earth;
  const span = stations[Math.min(i + 1, last)].rounds - stations[i].rounds;
  const t = span > 0 ? Math.min(Math.max((r - stations[i].rounds) / span, 0), 1) : 0;
  const ocean = mixColour(a.ocean, b.ocean, t);
  const land: LandLayer[] = [
    { path: a.landPath, fill: a.land, details: a.details, opacity: 1 - t },
    { path: b.landPath, fill: b.land, details: b.details, opacity: t },
  ];
  return {
    ocean,
    shelf: mixColour(ocean, '#ffffff', 0.22),
    land: land.filter((l) => l.path && l.opacity > 0),
    iceNorth: lerp(a.iceNorth, b.iceNorth, t),
    iceSouth: lerp(a.iceSouth, b.iceSouth, t),
  };
}
