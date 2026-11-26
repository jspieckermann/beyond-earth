import { EquatorialPoint, SkyPosition, galacticToEquatorial } from './ephemeris';

/** A point on the centre line of the band (galactic latitude 0°). */
export interface BandSample extends SkyPosition {
  /** Galactic longitude in degrees; 0 is the direction of the centre. */
  readonly l: number;
  /** Relative brightness, 1 towards the centre and less towards the anticentre (the fainter winter band). */
  readonly brightness: number;
}

/** Half the visible width of the band, in degrees. */
export const BAND_HALF_WIDTH = 8;
const STEP = 2;

let centreLine: readonly (EquatorialPoint & { l: number })[] | null = null;

/** The band's centre line in J2000, every 2° of galactic longitude. */
function line(): readonly (EquatorialPoint & { l: number })[] {
  centreLine ??= Array.from({ length: 360 / STEP }, (_, i) => ({ l: i * STEP, ...galacticToEquatorial(i * STEP, 0) }));
  return centreLine;
}

export function brightnessAt(l: number): number {
  return 0.45 + 0.55 * ((1 + Math.cos((l * Math.PI) / 180)) / 2);
}

/** The band's centre line in the local sky, given a function that places sky positions. */
export function bandSamples(sky: (p: EquatorialPoint) => SkyPosition): BandSample[] {
  return line().map((p) => ({ ...sky(p), l: p.l, brightness: brightnessAt(p.l) }));
}
