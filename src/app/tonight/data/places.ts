import { DarknessLevel } from '../../core/models';
import PLACE_LIST from './places.json';

/** A place from the shipped list (GeoNames towns and International Dark Sky Places). */
export interface ListedPlace {
  readonly name: string;
  readonly region: string;
  readonly lat: number;
  readonly lon: number;
  /** IANA time zone. */
  readonly tz: string;
  readonly pop: number;
  /** An International Dark Sky Place. */
  readonly dark?: boolean;
}

export const PLACES: readonly ListedPlace[] = PLACE_LIST;

/** Most suggestions shown at a time. */
export const MAX_SUGGESTIONS = 8;

/** Lower case, umlauts and ß spelled out or dropped, other diacritics removed: "Zürich" matches "zurich" and "zuerich". */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** "zürich" also as "zuerich". */
function spelledOut(text: string): string {
  return normalize(text.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue'));
}

interface Indexed {
  readonly place: ListedPlace;
  readonly keys: readonly string[];
}

let index: readonly Indexed[] | null = null;

function indexed(): readonly Indexed[] {
  index ??= PLACES.map((place) => ({ place, keys: [...new Set([normalize(place.name), spelledOut(place.name)])] }));
  return index;
}

/** 0 = the name starts with the query, 1 = a word of the name does, 2 = it contains it, -1 = no match. */
function rank(keys: readonly string[], query: string): number {
  let best = -1;
  for (const key of keys) {
    const r = key.startsWith(query) ? 0 : key.includes(` ${query}`) ? 1 : key.includes(query) ? 2 : -1;
    if (r >= 0 && (best < 0 || r < best)) {
      best = r;
    }
  }
  return best;
}

/** Places matching the query: prefix matches first, then word starts, then any part; larger places first. */
export function searchPlaces(query: string, limit = MAX_SUGGESTIONS): ListedPlace[] {
  const q = normalize(query);
  const variants = [...new Set([q, spelledOut(query)])].filter((v) => v.length > 0);
  if (variants.length === 0) {
    return [];
  }
  const hits: { place: ListedPlace; rank: number }[] = [];
  for (const entry of indexed()) {
    const ranks = variants.map((v) => rank(entry.keys, v)).filter((r) => r >= 0);
    if (ranks.length) {
      hits.push({ place: entry.place, rank: Math.min(...ranks) });
    }
  }
  return hits
    .sort((a, b) => a.rank - b.rank || b.place.pop - a.place.pop || a.place.name.localeCompare(b.place.name, 'de'))
    .slice(0, limit)
    .map((h) => h.place);
}

/** The longitudes the list covers, for "places outside Central Europe". */
export const LIST_LONGITUDES = {
  min: Math.min(...PLACES.map((p) => p.lon)),
  max: Math.max(...PLACES.map((p) => p.lon)),
} as const;

/** From this population on, a town's darkness is suggested as „Mitten in der Stadt“. */
export const BIG_CITY = 500_000;

/** The darkness suggested for a place: 5 for a dark-sky place, 1 for a big city, 2 otherwise and for the device location. */
export function suggestedDarkness(place: ListedPlace | null): DarknessLevel {
  if (!place) {
    return 2;
  }
  if (place.dark) {
    return 5;
  }
  return place.pop >= BIG_CITY ? 1 : 2;
}

/** Why a level is suggested, shown below the darkness choice: „Vorgeschlagen für eine Grossstadt.“ */
export function suggestionReason(place: ListedPlace | null): string {
  if (!place) {
    return 'Vorgeschlagen für deinen Standort.';
  }
  if (place.dark) {
    return 'Vorgeschlagen für einen Sternenpark.';
  }
  return place.pop >= BIG_CITY ? 'Vorgeschlagen für eine Grossstadt.' : 'Vorgeschlagen für eine Stadt.';
}

/** Suggestions before anything is typed: two dark-sky places. */
export function darkSkySuggestions(count = 2): ListedPlace[] {
  return PLACES.filter((p) => p.dark).slice(0, count);
}

/** The listed place a stored place came from, if any. */
export function listedPlace(name: string, lat: number, lon: number): ListedPlace | null {
  return PLACES.find((p) => p.name === name && Math.abs(p.lat - lat) < 0.001 && Math.abs(p.lon - lon) < 0.001) ?? null;
}

/** A town counts as „near“ the device location up to this distance. */
export const NEAR_KM = 25;
const EARTH_KM = 6371;

/**
 * The listed town nearest to a position, within `NEAR_KM`; dark-sky places are left out. Looked up in the shipped
 * list on the device, no service is asked.
 */
export function nearestTown(lat: number, lon: number): ListedPlace | null {
  const rad = Math.PI / 180;
  let best: ListedPlace | null = null;
  let bestKm = NEAR_KM;
  for (const p of PLACES) {
    if (p.dark) {
      continue;
    }
    const x = (p.lon - lon) * rad * Math.cos(((p.lat + lat) / 2) * rad);
    const y = (p.lat - lat) * rad;
    const km = Math.hypot(x, y) * EARTH_KM;
    if (km <= bestKm) {
      best = p;
      bestKm = km;
    }
  }
  return best;
}

/** „Dein Standort (Hamburg)“, or „Dein Standort“ when no listed town is near. */
export function deviceName(lat: number, lon: number): string {
  const town = nearestTown(lat, lon);
  return town ? `Dein Standort (${town.name})` : 'Dein Standort';
}
