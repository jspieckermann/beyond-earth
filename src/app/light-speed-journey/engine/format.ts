/** Formatting of the travel planner's numbers in German. */

const SECONDS_PER_YEAR = 365.25 * 86400;
const SPEED_OF_LIGHT_KMS = 299_792.458;
/** Kilometres per light-year. */
export const KM_PER_LIGHT_YEAR = 9.4607e12;

function num(value: number, maxFraction = 0): string {
  return value.toLocaleString('de-DE', { maximumFractionDigits: maxFraction });
}

/** A duration given in years, in its most familiar unit: Sekunden, Minuten, Stunden, Tage, Jahre, Mio. or Mrd. Jahre. */
export function formatDuration(years: number): string {
  const seconds = years * SECONDS_PER_YEAR;
  if (seconds < 60) {
    return `${num(seconds, seconds < 10 ? 1 : 0)} Sekunden`;
  }
  if (seconds < 3600) {
    const minutes = Math.round(seconds / 60);
    return `${num(minutes)} ${minutes === 1 ? 'Minute' : 'Minuten'}`;
  }
  if (seconds < 86_400) {
    return `${num(seconds / 3600, 1)} Stunden`;
  }
  if (years < 1) {
    const days = Math.round(seconds / 86_400);
    return `${num(days)} ${days === 1 ? 'Tag' : 'Tage'}`;
  }
  if (years < 100) {
    return `${num(years, 1)} Jahre`;
  }
  if (years < 1e6) {
    return `${num(Math.round(years))} Jahre`;
  }
  if (years < 1e9) {
    return `${num(years / 1e6, 1)} Mio. Jahre`;
  }
  return `${num(years / 1e9, 1)} Mrd. Jahre`;
}

/**
 * A speed as a fraction of c, shown as a percentage without the sign: two significant digits below 1 % ("0,0057"),
 * three up to 99 % ("10,4"), and up to four decimals above ("99,9999"), so every slider step shows.
 */
export function formatPercent(beta: number): string {
  const percent = beta * 100;
  if (percent >= 99) {
    return num(Number(percent.toFixed(4)), 4);
  }
  return percent.toLocaleString('de-DE', { maximumSignificantDigits: percent < 1 ? 2 : 3 });
}

/** A speed as a fraction of c, in km per second: "17", "29.979". */
export function formatKms(beta: number): string {
  const kms = beta * SPEED_OF_LIGHT_KMS;
  return num(kms, kms < 10 ? 1 : 0);
}

/** A whole count with German thousands separators: "2.991". */
export function formatCount(value: number): string {
  return num(value);
}

/** A distance given in light-years, for the destination list: km for the solar system, light-years beyond. */
export function formatDistance(lightYears: number): string {
  if (lightYears < 0.01) {
    const km = lightYears * KM_PER_LIGHT_YEAR;
    if (km < 1e6) {
      return `${num(km)} km`;
    }
    if (km < 1e9) {
      return `${num(km / 1e6)} Mio. km`;
    }
    return `${num(km / 1e9, 1)} Mrd. km`;
  }
  if (lightYears < 10) {
    return `${num(lightYears, 2)} Lichtjahre`;
  }
  if (lightYears < 1e6) {
    return `ca. ${num(lightYears)} Lichtjahre`;
  }
  if (lightYears < 1e9) {
    return `ca. ${num(lightYears / 1e6, 1)} Mio. Lichtjahre`;
  }
  return `ca. ${num(lightYears / 1e9, 1)} Mrd. Lichtjahre`;
}
