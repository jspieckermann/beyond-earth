import { BodyId, findBody } from '../../outward-journey/data/planets';
import { STAGES, StageId } from '../../outward-journey/data/stages';
import { KM_PER_LIGHT_YEAR, formatDistance } from '../engine/format';
import { Reach } from '../engine/travel';

/** A place of Modul A that can be chosen as destination. */
export interface Destination {
  readonly id: BodyId;
  /** Name as in Modul A's close-up. */
  readonly name: string;
  /** The stage of Modul A the place belongs to; the destination list is grouped by it. */
  readonly stage: StageId;
  readonly reach: Reach;
  /** Distance shown in the list and on the destination card. */
  readonly distanceLabel: string;
  /** Planets: the distance is the closest approach to the Earth ("bei günstigster Stellung"). */
  readonly closestApproach: boolean;
}

/** A group of the destination list: one stage of Modul A. */
export interface DestinationGroup {
  readonly stage: StageId;
  readonly title: string;
  readonly destinations: readonly Destination[];
}

type Entry =
  | { readonly id: BodyId; readonly km: number; readonly closest?: boolean }
  | { readonly id: BodyId; readonly ly: number; readonly lowerBound?: boolean }
  | { readonly id: BodyId; readonly here: true }
  | { readonly id: BodyId; readonly never: number };

/**
 * Distances from Modul A, measured from the Earth. Planets use the closest approach to the Earth.
 * Far places of the universe are lower bounds (space keeps expanding during the journey) or never reachable.
 */
const ENTRIES: Readonly<Record<StageId, readonly Entry[]>> = {
  erde: [{ id: 'erde', here: true }],
  mond: [{ id: 'mond', km: 384_400 }],
  sonnensystem: [
    { id: 'sonne', km: 149.6e6 },
    { id: 'merkur', km: 77e6, closest: true },
    { id: 'venus', km: 38e6, closest: true },
    { id: 'mars', km: 55e6, closest: true },
    { id: 'jupiter', km: 588e6, closest: true },
    { id: 'saturn', km: 1.2e9, closest: true },
    { id: 'uranus', km: 2.6e9, closest: true },
    { id: 'neptun', km: 4.3e9, closest: true },
    { id: 'voyager', km: 25.9e9 },
  ],
  'alpha-centauri': [
    { id: 'proxima', ly: 4.24 },
    { id: 'alpha-centauri-a', ly: 4.37 },
    { id: 'alpha-centauri-b', ly: 4.37 },
    { id: 'barnard', ly: 6 },
    { id: 'luhman-16', ly: 6.5 },
    { id: 'wise-0855', ly: 7.3 },
    { id: 'wolf-359', ly: 7.9 },
    { id: 'lalande-21185', ly: 8.3 },
    { id: 'sirius', ly: 8.6 },
  ],
  milchstrasse: [
    { id: 'orion-arm', here: true },
    { id: 'sagittarius-arm', ly: 5_000 },
    { id: 'perseus-arm', ly: 6_400 },
    { id: 'scutum-centaurus-arm', ly: 10_000 },
    { id: 'sgr-a', ly: 26_000 },
  ],
  'lokale-gruppe': [
    { id: 'milchstrasse', here: true },
    { id: 'grosse-magellansche-wolke', ly: 160_000 },
    { id: 'kleine-magellansche-wolke', ly: 200_000 },
    { id: 'andromeda', ly: 2.5e6 },
    { id: 'dreiecksgalaxie', ly: 2.7e6 },
  ],
  universum: [
    { id: 'laniakea', here: true },
    { id: 'bootes-leerraum', ly: 700e6, lowerBound: true },
    { id: 'geschosshaufen', ly: 3.7e9, lowerBound: true },
    { id: 'webb-deep-field', ly: 4.6e9, lowerBound: true },
    { id: 'herkules-mauer', never: 10e9 },
    { id: 'ton-618', never: 18e9 },
    { id: 'jades-gs-z14-0', never: 34e9 },
    { id: 'mikrowellenhintergrund', never: 46e9 },
  ],
};

function toDestination(stage: StageId, entry: Entry): Destination {
  const base = { id: entry.id, name: findBody(entry.id).name, stage };
  if ('here' in entry) {
    return { ...base, reach: { kind: 'here' }, distanceLabel: 'Hier wohnen wir', closestApproach: false };
  }
  if ('never' in entry) {
    return { ...base, reach: { kind: 'never' }, distanceLabel: formatDistance(entry.never), closestApproach: false };
  }
  const lightYears = 'km' in entry ? entry.km / KM_PER_LIGHT_YEAR : entry.ly;
  return {
    ...base,
    reach: { kind: 'journey', lightYears, lowerBound: 'lowerBound' in entry && entry.lowerBound === true },
    distanceLabel: formatDistance(lightYears),
    closestApproach: 'closest' in entry && entry.closest === true,
  };
}

/** The destination list, grouped by the stages of Modul A in their order. */
export const DESTINATION_GROUPS: readonly DestinationGroup[] = STAGES.map((s) => ({
  stage: s.id,
  title: s.title,
  destinations: ENTRIES[s.id].map((e) => toDestination(s.id, e)),
}));

export const DESTINATIONS: readonly Destination[] = DESTINATION_GROUPS.flatMap((g) => g.destinations);

export function findDestination(id: string | null | undefined): Destination | undefined {
  return DESTINATIONS.find((d) => d.id === id);
}

/** The destination the planner starts with: Proxima Centauri. */
export const DEFAULT_DESTINATION: Destination = DESTINATIONS.find((d) => d.id === 'proxima') ?? DESTINATIONS[0];

/** Destinations whose name contains the search text (case-insensitive), in the groups that still have one. */
export function searchDestinations(text: string): readonly DestinationGroup[] {
  const query = text.trim().toLocaleLowerCase('de-DE');
  if (!query) {
    return DESTINATION_GROUPS;
  }
  return DESTINATION_GROUPS.map((g) => ({
    ...g,
    destinations: g.destinations.filter((d) => d.name.toLocaleLowerCase('de-DE').includes(query)),
  })).filter((g) => g.destinations.length > 0);
}
