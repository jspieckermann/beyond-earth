import { PLANETS } from '../../outward-journey/data/planets';
import { STAGES } from '../../outward-journey/data/stages';
import { GALAXY_MARKS, LOCAL_GROUP_MARKS, UNIVERSE_MARKS } from '../../outward-journey/scene/layers/galaxy-layers';
import { STAR_TARGETS } from '../../outward-journey/scene/layers/star-layers';
import { DESTINATIONS, DESTINATION_GROUPS, findDestination, searchDestinations } from './destinations';

describe('destinations', () => {
  it('offer every selectable place of Modul A exactly once', () => {
    const selectable = new Set<string>([
      'erde',
      'mond',
      'voyager',
      ...PLANETS.map((p) => p.id),
      ...STAR_TARGETS.map((t) => t.id),
      ...GALAXY_MARKS.map((m) => m.id),
      ...LOCAL_GROUP_MARKS.map((m) => m.id),
      ...UNIVERSE_MARKS.map((m) => m.id),
    ]);
    const ids = DESTINATIONS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(ids)).toEqual(selectable);
    expect(ids).toHaveLength(38);
  });

  it('are grouped by every stage of Modul A, in order', () => {
    expect(DESTINATION_GROUPS.map((g) => g.title)).toEqual(STAGES.map((s) => s.title));
    expect(DESTINATION_GROUPS.every((g) => g.destinations.length > 0)).toBe(true);
    expect(findDestination('andromeda')?.stage).toBe('lokale-gruppe');
  });

  it('classify the places as in the spec', () => {
    const named = (kind: string) => DESTINATIONS.filter((d) => d.reach.kind === kind).map((d) => d.name);
    expect(named('here')).toEqual(['Erde', 'Orion-Arm', 'Milchstrasse', 'Laniakea-Superhaufen']);
    expect(named('never')).toEqual(['Herkules-Corona-Borealis-Mauer', 'TON 618', 'JADES-GS-z14-0', 'Kosmischer Mikrowellenhintergrund']);
    const lower = DESTINATIONS.filter((d) => d.reach.kind === 'journey' && d.reach.lowerBound).map((d) => d.name);
    expect(lower).toEqual(['Boötes-Leerraum', 'Geschosshaufen', 'Webbs erstes Deep Field']);
  });

  it('use the closest approach for planets', () => {
    const labels = Object.fromEntries(DESTINATIONS.filter((d) => d.closestApproach).map((d) => [d.name, d.distanceLabel]));
    expect(labels).toEqual({
      Merkur: '77 Mio. km',
      Venus: '38 Mio. km',
      Mars: '55 Mio. km',
      Jupiter: '588 Mio. km',
      Saturn: '1,2 Mrd. km',
      Uranus: '2,6 Mrd. km',
      Neptun: '4,3 Mrd. km',
    });
    expect(findDestination('mond')?.distanceLabel).toBe('384.400 km');
    expect(findDestination('proxima')?.distanceLabel).toBe('4,24 Lichtjahre');
    expect(findDestination('unbekannt')).toBeUndefined();
  });

  it('can be searched by name', () => {
    const found = searchDestinations('andro');
    expect(found).toHaveLength(1);
    expect(found[0].title).toBe('Die Lokale Gruppe');
    expect(found[0].destinations.map((d) => [d.name, d.distanceLabel])).toEqual([['Andromeda', 'ca. 2,5 Mio. Lichtjahre']]);
    expect(searchDestinations('  ')).toBe(DESTINATION_GROUPS);
    expect(searchDestinations('xyz')).toEqual([]);
  });
});
