/**
 * The speed slider: positions 0–1000. Up to 600 every power of ten from 0,001 % to 10 % gets the same room;
 * from 600 to 1000 the ratio v / (c − v) grows logarithmically from 1/9 (10 %) to 999.999 (99,9999 %).
 * That spreads 10 %–50 % finely and still gives 99 %, 99,9 % … 99,9999 % room.
 */

/** Slowest and fastest speed, as fractions of the speed of light (0,001 % and 99,9999 %). */
export const MIN_BETA = 0.00001;
export const MAX_BETA = 0.999999;
export const SLIDER_MAX = 1000;

const SPLIT = 600;
const LOW_DECADES = 4; // 0,001 % … 10 %
const logit = (beta: number): number => Math.log10(beta / (1 - beta));
const HIGH_START = logit(0.1);
const HIGH_DECADES = logit(MAX_BETA) - HIGH_START; // v / (c − v) from 1/9 to 999.999

export interface SpeedPreset {
  readonly id: string;
  readonly label: string;
  readonly beta: number;
}

const SPEED_OF_LIGHT_KMS = 299_792.458;

/**
 * The presets, so the numbers get a face: Voyager 1 at its real speed (about 17 km/s, shown as 0,0057 %),
 * then the target speeds of interstellar projects. Where a project names a range, its maximum is used.
 */
export const PRESETS: readonly SpeedPreset[] = [
  { id: 'voyager', label: 'Voyager 1', beta: 17 / SPEED_OF_LIGHT_KMS },
  // Freeman Dyson's Orion starship (nuclear pulse propulsion, 1968): about 0,033 c.
  { id: 'orion', label: 'Orion', beta: 0.033 },
  // Project Longshot (US Naval Academy and NASA, 1988): about 4,5 % on average, 100 years to Alpha Centauri.
  { id: 'longshot', label: 'Longshot', beta: 0.045 },
  // Project Daedalus (British Interplanetary Society, 1973–1978): cruise at about 12 %.
  { id: 'daedalus', label: 'Daedalus', beta: 0.12 },
  // Breakthrough Starshot: 15–20 %, the maximum of the range.
  { id: 'starshot', label: 'Starshot', beta: 0.2 },
];

export function clampBeta(beta: number): number {
  if (!Number.isFinite(beta)) {
    return MIN_BETA;
  }
  return Math.min(MAX_BETA, Math.max(MIN_BETA, beta));
}

export function positionToBeta(position: number): number {
  const p = Math.min(SLIDER_MAX, Math.max(0, position));
  if (p <= SPLIT) {
    return clampBeta(Math.pow(10, -3 + (LOW_DECADES * p) / SPLIT) / 100);
  }
  const ratio = Math.pow(10, HIGH_START + ((p - SPLIT) / (SLIDER_MAX - SPLIT)) * HIGH_DECADES);
  return clampBeta(ratio / (1 + ratio));
}

export function betaToPosition(beta: number): number {
  const b = clampBeta(beta);
  if (b <= 0.1) {
    return Math.round((SPLIT * (Math.log10(b * 100) + 3)) / LOW_DECADES);
  }
  return Math.round(SPLIT + ((SLIDER_MAX - SPLIT) * (logit(b) - HIGH_START)) / HIGH_DECADES);
}

/**
 * A percentage typed by the user ("0,5", "0.5", "99,99 %"), as a clamped fraction of c, and whether it had to be
 * clamped at the top (only light itself reaches 100 %). Unreadable input gives null.
 */
export function parsePercent(text: string): { beta: number; clampedHigh: boolean } | null {
  const cleaned = text.replace('%', '').trim().replace(/\s/g, '');
  if (!/^\d+([.,]\d+)?$/.test(cleaned)) {
    return null;
  }
  const beta = Number(cleaned.replace(',', '.')) / 100;
  return { beta: clampBeta(beta), clampedHigh: beta > MAX_BETA };
}

/** The preset matching a speed, if any. */
export function presetFor(beta: number): SpeedPreset | undefined {
  return PRESETS.find((p) => Math.abs(p.beta - beta) / p.beta < 1e-6);
}
