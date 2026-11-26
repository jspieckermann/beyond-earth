/** The six experience modules of the concept, by their letter (A Reise nach draussen, B Lichtgeschwindigkeit, C galaktisches Jahr, D Zeitmaschine, E Sterne zählen, F das Unsichtbare). */
export const MODULE_IDS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
export type ModuleId = (typeof MODULE_IDS)[number];

export function isModuleId(value: unknown): value is ModuleId {
  return typeof value === 'string' && (MODULE_IDS as readonly string[]).includes(value);
}

/** How dark the user says it is at the place: 1 "Mitten in der Stadt" to 5 "Sehr dunkel". */
export type DarknessLevel = 1 | 2 | 3 | 4 | 5;

export function isDarknessLevel(value: unknown): value is DarknessLevel {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

/** The place the user chose for Heute Nacht, stored on the device only. */
export interface StoredPlace {
  /** "Hamburg", or for the device location "Dein Standort (Hamburg)" with the nearest listed town, else "Dein Standort". */
  readonly name: string;
  readonly region?: string;
  /** Degrees; the device location is rounded to 0,05°. */
  readonly lat: number;
  readonly lon: number;
  /** IANA time zone. */
  readonly tz: string;
  readonly source: 'list' | 'device';
}

/** What the real sky offers tonight at the user's chosen place, for the home-screen card. */
export interface TonightInfo {
  /** Display name of the chosen place, e.g. "Hamburg". */
  readonly location: string;
  readonly darkness: DarknessLevel;
  /** "7 Dinge mit blossem Auge, zum Beispiel Saturn im Süden.", or "…" while it is being calculated. */
  readonly headline: string;
  /** "Dunkel ab 18:15 Uhr", or that it does not get fully dark. */
  readonly darkFrom?: string;
  /** One sentence about the Moon. */
  readonly moon?: string;
  /** When the Milky Way is not visible tonight: its next good night, e.g. "Die Milchstrasse: wieder am Dienstag." */
  readonly milkyWayNext?: string;
}
