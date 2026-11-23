/**
 * Pure maths of the outward journey's zoom.
 *
 * `z` runs from 0 (Die Erde) to 6 (Das ganze Universum); integer values are the seven stages.
 * Every stage has its own layer, drawn in its own units and shown at `STAGE_FACTOR^(n − z)`:
 * a visual compression of the real scale (neighbouring stages really differ by 30× to 10,000×),
 * while the distance readout stays exact.
 */

export const STAGE_COUNT = 7;
export const MAX_Z = STAGE_COUNT - 1;
/** Visual zoom factor between two neighbouring stages. */
export const STAGE_FACTOR = 6;
/** Index of the solar system; the stretched emptiness lies between it and the next stage. */
export const VOID_FROM = 2;

export interface Point {
  readonly x: number;
  readonly y: number;
}

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
export const clampZ = (z: number) => clamp(z, 0, MAX_Z);
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** Visual scale of stage layer `n` at zoom `z`. */
export function layerScale(n: number, z: number): number {
  return clamp(Math.pow(STAGE_FACTOR, n - z), 0.005, 60);
}

/**
 * Opacity of stage layer `n` at zoom `z`. Layers cross-fade with their neighbours, except
 * across the stretched emptiness: the solar system is gone at z = 2.2 and the next star
 * system appears only from z = 2.8, so the stretch in between shows nothing.
 */
export function layerOpacity(n: number, z: number): number {
  const d = z - n;
  if (n === VOID_FROM && d > 0) {
    return clamp(1 - d * 5, 0, 1);
  }
  if (n === VOID_FROM + 1 && d < 0) {
    return clamp(1 + d * 5, 0, 1);
  }
  if ((n < VOID_FROM && z > VOID_FROM) || (n > VOID_FROM + 1 && z < VOID_FROM + 1)) {
    return 0;
  }
  return clamp(1 - Math.abs(d) * 1.6, 0, 1);
}

/** Labels inside a layer fade much faster than the layer, so they never grow huge in flight. */
export function labelOpacity(n: number, z: number): number {
  return Math.min(layerOpacity(n, z), clamp(1 - Math.abs(z - n) * 4, 0, 1));
}

/** The stage the view is at or closest to. */
export const nearestStage = (z: number) => Math.round(clampZ(z));

/** 1 when resting exactly at a stage, 0 when 0.2 or more away from one. */
export function stageNearness(z: number): number {
  return clamp(1 - Math.abs(z - nearestStage(z)) * 5, 0, 1);
}

/** True while the view is inside the stretched emptiness, where nothing but the Earth marker shows. */
export const inVoid = (z: number) => z > VOID_FROM + 0.2 && z < VOID_FROM + 0.8;

/** Distance in metres at zoom `z`, interpolated logarithmically between the stage distances. */
export function distanceAt(z: number, stageDistances: readonly number[]): number {
  const c = clampZ(z);
  const i = Math.min(MAX_Z - 1, Math.floor(c));
  const f = c - i;
  return Math.pow(10, Math.log10(stageDistances[i]) * (1 - f) + Math.log10(stageDistances[i + 1]) * f);
}

/** Offset of the Earth from the focus point, in base units, eased between the stages' offsets. */
export function earthOffsetAt(z: number, offsets: readonly Point[]): Point {
  const c = clampZ(z);
  const i = Math.min(MAX_Z - 1, Math.floor(c));
  const t = smoothstep(c - i);
  return { x: offsets[i].x * (1 - t) + offsets[i + 1].x * t, y: offsets[i].y * (1 - t) + offsets[i + 1].y * t };
}

/**
 * The stage to settle at after the user lets go. Rounds to the nearest stage, but once the user
 * has moved clearly past a stage (more than 0.08) the view continues in the direction of movement.
 */
export function snapTarget(z: number, lastDirection: number): number {
  const c = clampZ(z);
  const nearest = Math.round(c);
  if (Math.abs(c - nearest) > 0.08 && lastDirection !== 0) {
    return lastDirection > 0 ? Math.ceil(c) : Math.floor(c);
  }
  return nearest;
}

/** Durations of a flight: per normal stage and for the stretch through the emptiness. */
export interface FlightPace {
  readonly stageMs: number;
  readonly voidMs: number;
  /** Minimum duration of any flight. */
  readonly minMs: number;
}

export const FLIGHT_PACE: FlightPace = { stageMs: 900, voidMs: 7000, minMs: 600 };
/** The way home: about 10 s for the whole return, still lingering in the emptiness. */
export const RETURN_PACE: FlightPace = { stageMs: 600, voidMs: 6000, minMs: 600 };

/** Milliseconds a flight needs to travel through [a, b] (a ≤ b) at the given pace. */
function travelMs(a: number, b: number, pace: FlightPace): number {
  const voidPart = Math.max(0, Math.min(b, VOID_FROM + 1) - Math.max(a, VOID_FROM));
  return voidPart * pace.voidMs + (b - a - voidPart) * pace.stageMs;
}

/** Total duration of a flight from `from` to `to`. */
export function flightDuration(from: number, to: number, pace: FlightPace = FLIGHT_PACE): number {
  return Math.max(pace.minMs, travelMs(Math.min(from, to), Math.max(from, to), pace));
}

const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

/**
 * Position of a flight at time fraction `p` (0..1). Time is eased at the ends; inside the
 * emptiness the flight moves slower, so that stretch takes its full share of the duration.
 */
export function flightPosition(from: number, to: number, p: number, pace: FlightPace = FLIGHT_PACE): number {
  const t = clamp(p, 0, 1);
  if (from === to) {
    return to;
  }
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  const total = travelMs(lo, hi, pace);
  const crossesVoid = lo < VOID_FROM + 1 && hi > VOID_FROM;
  // Long flights through the emptiness move evenly there; short ones ease gently.
  const elapsed = (crossesVoid ? t : easeInOut(t)) * total;
  const forward = to > from;
  // Walk the path from the start, spending the elapsed time segment by segment.
  let z = from;
  let remaining = elapsed;
  const segments = [VOID_FROM, VOID_FROM + 1].filter((b) => b > lo && b < hi);
  const bounds = forward ? [...segments, to] : [...segments.reverse(), to];
  for (const bound of bounds) {
    const a = Math.min(z, bound);
    const b = Math.max(z, bound);
    const need = travelMs(a, b, pace);
    if (remaining >= need) {
      remaining -= need;
      z = bound;
      continue;
    }
    const perUnit = need / (b - a);
    const moved = remaining / perUnit;
    return forward ? z + moved : z - moved;
  }
  return to;
}

export interface MarkerPlacement extends Point {
  /** True when the Earth itself is outside the viewport. */
  readonly offscreen: boolean;
  /** Direction from the marker towards the Earth, in degrees (0 = right, 90 = down). */
  readonly angle: number;
}

export interface Rect {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

/** Where to draw the Earth marker: at the Earth, or clamped into the safe area pointing towards it. */
export function placeMarker(earth: Point, viewport: { width: number; height: number }, safe: Rect): MarkerPlacement {
  const offscreen = earth.x < 0 || earth.y < 0 || earth.x > viewport.width || earth.y > viewport.height;
  const x = clamp(earth.x, safe.left, safe.right);
  const y = clamp(earth.y, safe.top, safe.bottom);
  const angle = (Math.atan2(earth.y - y, earth.x - x) * 180) / Math.PI;
  return { x, y, offscreen, angle: Number.isFinite(angle) ? angle : 0 };
}
