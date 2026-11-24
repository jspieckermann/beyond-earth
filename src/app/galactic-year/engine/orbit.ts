import { SUN_IN_IMAGE } from '../../outward-journey/scene/layers/galaxy-layers';

/**
 * The Sun's orbit in a square of side 1 that matches the Milky Way picture: the galactic centre in the
 * middle, the Sun straight below it where Modul A marks it in the reconstruction.
 * The galaxy turns clockwise in this view, so turning back in time runs counter-clockwise.
 */
export const CENTRE = 0.5;
export const SUN_RADIUS = SUN_IN_IMAGE.y - CENTRE;
/** Each completed round is drawn as a fine ring this much further out; twenty of them read as growth rings, not a band. */
export const RING_STEP = 0.005;
/** Today's angle on the orbit in degrees (straight below the centre; y grows downwards). */
export const TODAY_ANGLE = 90;
/** Steps of the time slider from today to its end. */
export const SLIDER_STEPS = 1000;

export interface Point {
  readonly x: number;
  readonly y: number;
}

const rad = (deg: number) => (deg * Math.PI) / 180;
const fixed = (n: number) => Number(n.toFixed(4));

/** Angle on the orbit for a number of rounds back. */
export function angleAt(rounds: number): number {
  return TODAY_ANGLE - rounds * 360;
}

/** Where the Sun stands after turning back the given number of rounds. */
export function sunAt(rounds: number, radius = SUN_RADIUS): Point {
  const a = rad(angleAt(rounds));
  return { x: fixed(CENTRE + radius * Math.cos(a)), y: fixed(CENTRE + radius * Math.sin(a)) };
}

/** The bright arc from today back to the Sun for the part of a round; empty for whole rounds. */
export function backArc(rounds: number): string {
  const part = rounds - Math.floor(rounds);
  if (part < 1e-6 || rounds <= 0) {
    return '';
  }
  const from = sunAt(0);
  const to = sunAt(rounds);
  const large = part > 0.5 ? 1 : 0;
  return `M ${from.x} ${from.y} A ${SUN_RADIUS} ${SUN_RADIUS} 0 ${large} 0 ${to.x} ${to.y}`;
}

/** One ring radius per completed round. */
export function ringRadii(completed: number): number[] {
  const count = Math.floor(completed + 1e-9);
  return Array.from({ length: Math.max(0, count) }, (_, k) => fixed(SUN_RADIUS + RING_STEP * (k + 1)));
}

/**
 * The time slider is one ray made of two linear parts: the first rounds, where most stations lie, are
 * stretched over a larger share of the width; the rest follows at an even, closer spacing. A slider that
 * ends within the stretched part (the main journey, 3 rounds) is simply linear.
 */
export const SLIDER_STRETCH = { rounds: 5, share: 0.7 } as const;

/** Where a number of rounds back lies on a slider that ends at `max` rounds, as a fraction of its width. */
export function sliderFraction(rounds: number, max: number): number {
  const r = Math.min(Math.max(rounds, 0), max);
  const { rounds: near, share } = SLIDER_STRETCH;
  if (max <= near) {
    return r / max;
  }
  return r <= near ? (r / near) * share : share + ((r - near) / (max - near)) * (1 - share);
}

/** Rounds back at a fraction of the slider's width (the inverse of `sliderFraction`). */
export function roundsAtFraction(fraction: number, max: number): number {
  const p = Math.min(Math.max(fraction, 0), 1);
  const { rounds: near, share } = SLIDER_STRETCH;
  if (max <= near) {
    return p * max;
  }
  return p <= share ? (p / share) * near : near + ((p - share) / (1 - share)) * (max - near);
}

/** The slider's value for a number of rounds back. */
export function sliderValue(rounds: number, max: number): number {
  return Math.round(sliderFraction(rounds, max) * SLIDER_STEPS);
}

/** Rounds back at a slider value (the inverse of `sliderValue`). */
export function roundsAtSlider(value: number, max: number): number {
  return roundsAtFraction(value / SLIDER_STEPS, max);
}

export interface RulerTick {
  readonly left: string;
  /** Whole rounds that carry a label are long ticks; quarter rounds in the stretched part are short. */
  readonly kind: 'major' | 'round' | 'quarter';
}

export interface RulerLabel {
  readonly left: string;
  readonly text: string;
  /** The label where the stretched part ends ("5"). */
  readonly strong: boolean;
}

/**
 * The ruler under the slider: in the stretched part a tick per quarter round and a label per round, beyond it
 * a tick per round and a label every fifth round. The end of the stretched part is labelled strongly.
 */
export function ruler(max: number): { ticks: RulerTick[]; labels: RulerLabel[] } {
  const near = Math.min(SLIDER_STRETCH.rounds, max);
  const left = (r: number) => `${Number((sliderFraction(r, max) * 100).toFixed(4))}%`;
  const labelled = (r: number) => r <= near || r % 5 === 0;
  const ticks: RulerTick[] = [];
  const labels: RulerLabel[] = [];
  for (let q = 1; q < near * 4; q++) {
    if (q % 4 !== 0) {
      ticks.push({ left: left(q / 4), kind: 'quarter' });
    }
  }
  for (let r = 0; r <= max; r++) {
    ticks.push({ left: left(r), kind: labelled(r) ? 'major' : 'round' });
    if (labelled(r)) {
      labels.push({ left: left(r), text: r === 0 ? 'heute' : String(r), strong: max > near && r === near });
    }
  }
  return { ticks, labels };
}

/** The station whose rounds are closest to the given rounds. */
export function nearestStation(rounds: number, stationRounds: readonly number[]): number {
  let best = 0;
  stationRounds.forEach((r, i) => {
    if (Math.abs(r - rounds) < Math.abs(stationRounds[best] - rounds)) {
      best = i;
    }
  });
  return best;
}

/**
 * Rounds back for a pointer at `point` (in the unit square) while dragging the Sun: the pointer's angle
 * gives the part of a round, and whole rounds are added so that the result stays close to `previous`.
 * The result is kept between 0 and `max`.
 */
export function roundsAtPointer(point: Point, previous: number, max: number): number {
  const angle = (Math.atan2(point.y - CENTRE, point.x - CENTRE) * 180) / Math.PI;
  const part = ((((TODAY_ANGLE - angle) / 360) % 1) + 1) % 1;
  const candidates = [-1, 0, 1].map((k) => Math.floor(previous) + k + part);
  const closest = candidates.reduce((a, b) => (Math.abs(b - previous) < Math.abs(a - previous) ? b : a));
  return Math.min(Math.max(closest, 0), max);
}
