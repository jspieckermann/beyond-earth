/** Metres in one light year (IAU, Julian year). */
export const LIGHT_YEAR_M = 9.4607304725808e15;
/** Speed of light in m/s. */
export const SPEED_OF_LIGHT = 299_792_458;

const SECONDS_PER_DAY = 86_400;
const DAYS_PER_YEAR = 365.25;
/** Age of the universe in years; light times beyond this are shown as "seit 13,8 Mrd. Jahren". */
const AGE_OF_UNIVERSE_YEARS = 13.8e9;

/** German number with at most `fraction` decimals (no trailing zeros). */
export function de(value: number, fraction = 0): string {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: fraction });
}

/** Rounds to the nearest multiple of `step`. */
const roundTo = (value: number, step: number) => Math.round(value / step) * step;

/** A distance in metres in its most familiar unit, German formatting. */
export function formatDistance(metres: number): string {
  const km = metres / 1000;
  if (km < 1e6) {
    return `${de(Math.round(km))} km`;
  }
  if (km < 1e9) {
    const mio = km / 1e6;
    return `${de(mio, mio < 100 ? 1 : 0)} Mio. km`;
  }
  const ly = metres / LIGHT_YEAR_M;
  if (ly < 0.1) {
    const mrd = km / 1e9;
    return `${de(mrd, mrd < 100 ? 1 : 0)} Mrd. km`;
  }
  if (ly < 10) {
    return `${de(ly, 2)} Lichtjahre`;
  }
  if (ly < 1000) {
    return `${de(Math.round(ly))} Lichtjahre`;
  }
  if (ly < 1e6) {
    return `${de(roundTo(ly, 100))} Lichtjahre`;
  }
  if (ly < 1e9) {
    return `${de(ly / 1e6, 1)} Mio. Lichtjahre`;
  }
  return `${de(ly / 1e9)} Mrd. Lichtjahre`;
}

/** How long light needs for a distance in metres, German formatting. */
export function formatLightTime(metres: number): string {
  const s = metres / SPEED_OF_LIGHT;
  if (s < 60) {
    return `${de(s, s < 1 ? 2 : 1)} s`;
  }
  if (s < 3600) {
    const min = Math.floor(s / 60);
    const sec = Math.round(s % 60);
    return sec ? `${min} min ${sec} s` : `${min} min`;
  }
  if (s < 2 * SECONDS_PER_DAY) {
    const h = Math.floor(s / 3600);
    const min = Math.round((s % 3600) / 60);
    return `${h} h ${min} min`;
  }
  const days = s / SECONDS_PER_DAY;
  if (days < DAYS_PER_YEAR) {
    return `${de(Math.round(days))} Tage`;
  }
  const years = days / DAYS_PER_YEAR;
  if (years < 10) {
    return `${de(years, 1)} Jahre`;
  }
  if (years < 1e6) {
    return `${de(years < 1000 ? Math.round(years) : roundTo(years, 100))} Jahre`;
  }
  if (years < AGE_OF_UNIVERSE_YEARS) {
    return `${de(years / 1e6, 1)} Mio. Jahre`;
  }
  return 'seit 13,8 Mrd. Jahren';
}
