import { GeoPoint } from './ephemeris';

/**
 * Routes and missions are written for Central Europe: 45° to 56° North, within the longitudes of the place list
 * (6,08° to 16,47° East; a unit test keeps these in line with the list).
 */
export const ROUTE_REGION = { minLat: 45, maxLat: 56, minLon: 6.08, maxLon: 16.47 } as const;

export function hasRoutes(p: GeoPoint): boolean {
  const r = ROUTE_REGION;
  return p.lat >= r.minLat && p.lat <= r.maxLat && p.lon >= r.minLon && p.lon <= r.maxLon;
}
