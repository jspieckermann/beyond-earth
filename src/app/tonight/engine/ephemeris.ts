import {
  Body,
  Equator,
  Horizon,
  HorizonFromVector,
  Illumination,
  Observer,
  RotateVector,
  Rotation_EQJ_HOR,
  Rotation_GAL_EQJ,
  SearchAltitude,
  SearchRiseSet,
  SphereFromVector,
  Spherical,
  VectorFromSphere,
} from 'astronomy-engine';

/**
 * The only module that talks to the astronomy library: Sun, Moon and planet events and positions, the Moon's lit fraction,
 * and the conversion of fixed sky positions (J2000) to altitude and azimuth. Everything else is plain arithmetic.
 */

export interface GeoPoint {
  readonly lat: number;
  readonly lon: number;
}

/** A position in the local sky, in degrees: altitude above the horizon, azimuth clockwise from north. */
export interface SkyPosition {
  readonly alt: number;
  readonly az: number;
}

/** A fixed position on the sky in J2000, in degrees. */
export interface EquatorialPoint {
  readonly ra: number;
  readonly dec: number;
}

export type Luminary = 'sun' | 'moon';
/** The bright planets that can be found with the naked eye. */
export type Planet = 'venus' | 'mars' | 'jupiter' | 'saturn';
export type SolarBody = Luminary | Planet;

const BODY: Record<SolarBody, Body> = {
  sun: Body.Sun,
  moon: Body.Moon,
  venus: Body.Venus,
  mars: Body.Mars,
  jupiter: Body.Jupiter,
  saturn: Body.Saturn,
};

const observer = (p: GeoPoint) => new Observer(p.lat, p.lon, 0);

/** The next rise (+1) or set (−1) of the Sun, Moon or a planet after `from`, within `limitDays`. */
export function riseSet(body: SolarBody, p: GeoPoint, direction: 1 | -1, from: Date, limitDays: number): Date | null {
  return SearchRiseSet(BODY[body], observer(p), direction, from, limitDays)?.date ?? null;
}

/** The next time the Sun climbs (+1) or sinks (−1) through the given altitude after `from`. */
export function sunCrossing(p: GeoPoint, direction: 1 | -1, altitude: number, from: Date, limitDays: number): Date | null {
  return SearchAltitude(Body.Sun, observer(p), direction, from, limitDays, altitude)?.date ?? null;
}

/** Apparent altitude of the Sun, Moon or a planet (centre, with refraction). */
export function altitude(body: SolarBody, p: GeoPoint, date: Date): number {
  return bodyPosition(body, p, date).alt;
}

/** Apparent position of the Sun, Moon or a planet in the local sky (with refraction). */
export function bodyPosition(body: SolarBody, p: GeoPoint, date: Date): SkyPosition {
  const obs = observer(p);
  const eq = Equator(BODY[body], date, obs, true, true);
  const hor = Horizon(date, obs, eq.ra, eq.dec, 'normal');
  return { alt: hor.altitude, az: hor.azimuth };
}

/** Visual magnitude of the Moon or a planet: smaller is brighter. */
export function magnitude(body: Exclude<SolarBody, 'sun'>, date: Date): number {
  return Illumination(BODY[body], date).mag;
}

/** Lit fraction of the Moon's disc, 0 to 1. */
export function moonFraction(date: Date): number {
  return Illumination(Body.Moon, date).phase_fraction;
}

/** A function that places J2000 sky positions in the local sky of `p` at `date`. */
export function skyAt(p: GeoPoint, date: Date): (point: EquatorialPoint) => SkyPosition {
  const rotation = Rotation_EQJ_HOR(date, observer(p));
  return ({ ra, dec }) => {
    const hor = HorizonFromVector(RotateVector(rotation, VectorFromSphere(new Spherical(dec, ra, 1), date)), 'normal');
    return { alt: hor.lat, az: hor.lon };
  };
}

/** J2000 equatorial position of a point given in galactic longitude and latitude (degrees). */
export function galacticToEquatorial(l: number, b: number): EquatorialPoint {
  const t = new Date(Date.UTC(2000, 0, 1, 12));
  const v = RotateVector(Rotation_GAL_EQJ(), VectorFromSphere(new Spherical(b, l, 1), t));
  const s = SphereFromVector(v);
  return { ra: (s.lon + 360) % 360, dec: s.lat };
}
