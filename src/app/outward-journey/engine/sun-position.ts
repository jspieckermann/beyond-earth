/** Geographic point where the Sun stands in the zenith, in degrees. */
export interface SubsolarPoint {
  readonly lat: number;
  readonly lon: number;
}

const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/**
 * Subsolar point at a moment in time (low-precision NOAA formulas, good to ~0.1°,
 * plenty for drawing the Earth's day and night sides).
 */
export function subsolarPoint(date: Date): SubsolarPoint {
  const jd = date.getTime() / 86_400_000 + 2440587.5;
  const n = jd - 2451545.0;
  const meanLon = (280.46 + 0.9856474 * n) % 360;
  const meanAnomaly = rad((357.528 + 0.9856003 * n) % 360);
  const eclipticLon = rad(meanLon + 1.915 * Math.sin(meanAnomaly) + 0.02 * Math.sin(2 * meanAnomaly));
  const obliquity = rad(23.439 - 0.0000004 * n);
  const declination = Math.asin(Math.sin(obliquity) * Math.sin(eclipticLon));
  const rightAscension = Math.atan2(Math.cos(obliquity) * Math.sin(eclipticLon), Math.cos(eclipticLon));
  // Greenwich mean sidereal time in degrees.
  const gmst = (280.46061837 + 360.98564736629 * n) % 360;
  let lon = deg(rightAscension) - gmst;
  lon = ((((lon + 180) % 360) + 360) % 360) - 180;
  return { lat: deg(declination), lon };
}

/** Cosine of the Sun's zenith angle at a place: > 0 on the day side, < 0 on the night side. */
export function sunHeight(lat: number, lon: number, sun: SubsolarPoint): number {
  return (
    Math.sin(rad(lat)) * Math.sin(rad(sun.lat)) +
    Math.cos(rad(lat)) * Math.cos(rad(sun.lat)) * Math.cos(rad(lon - sun.lon))
  );
}
