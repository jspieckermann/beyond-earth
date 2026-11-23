import { SKY_MODULES } from '../../home/data/modules';
import { formatDistance, formatLightTime } from '../engine/format';
import { CREDITS, CreditId } from './credits';
import { MOONS, PLANETS, findBody, findPlanet, isStarId } from './planets';
import { HANDOVER_LINE, HOME_LINE, STAGES, STAGE_DISTANCES, STAGE_OFFSETS } from './stages';

describe('stage data', () => {
  it('has the seven stages in order', () => {
    expect(STAGES.map((s) => s.title)).toEqual([
      'Die Erde',
      'Erde und Mond',
      'Das Sonnensystem',
      'Benachbarte Sternensysteme',
      'Die ganze Milchstrasse',
      'Die Lokale Gruppe',
      'Das ganze Universum',
    ]);
    expect(STAGE_DISTANCES).toHaveLength(7);
    expect(STAGE_OFFSETS).toHaveLength(7);
  });

  it('uses the poetic lines and Aha comparisons of the concept', () => {
    const lines = STAGES.map((s) => s.line);
    expect(lines[0]).toBe('„Jeder Mensch, den du je gekannt hast, hat auf dieser Kugel gelebt.“');
    expect(lines[4]).toBe('„Das ist sie. Unsere Galaxie. Und irgendwo darin, viel zu klein, um sie zu sehen: die Erde.“');
    expect(lines[6]).toBe('„Und das ist nur der Teil, dessen Licht uns schon erreicht hat.“');
    expect(STAGES[2].aha).toContain('171 Jahre');
    expect(STAGES[4].aha).toContain('Kronkorken');
    expect(STAGES[5].aha).toContain('einen halben Meter');
    expect(HOME_LINE).toBe('„All das. Und mittendrin: wir.“');
    expect(HANDOVER_LINE).toContain('So schnell, wie es überhaupt geht.');
  });

  it('shows the distances and light times of the spec at rest', () => {
    expect(STAGES.map((s) => formatDistance(s.distanceM))).toEqual([
      '12.742 km',
      '384.400 km',
      '4,5 Mrd. km',
      '4,24 Lichtjahre',
      '100.000 Lichtjahre',
      '10 Mio. Lichtjahre',
      '93 Mrd. Lichtjahre',
    ]);
    expect(STAGES.map((s) => formatLightTime(s.distanceM))).toEqual([
      '0,04 s',
      '1,3 s',
      '4 h 10 min',
      '4,2 Jahre',
      '100.000 Jahre',
      '10 Mio. Jahre',
      'seit 13,8 Mrd. Jahren',
    ]);
  });

  it('gives every stage facts, a text alternative and growing distances', () => {
    STAGES.forEach((s, i) => {
      expect(s.facts.length).toBeGreaterThanOrEqual(3);
      expect(s.alt.length).toBeGreaterThan(20);
      if (i > 0) {
        expect(s.distanceM).toBeGreaterThan(STAGES[i - 1].distanceM);
      }
    });
  });

  it('marks reconstructions in the facts of the Milky Way', () => {
    expect(STAGES[4].facts.join(' ')).toContain('Niemand hat die Milchstrasse je von aussen fotografiert');
    expect(STAGES[6].facts.join(' ')).toContain('Simulation');
  });

  it('branches only to known modules', () => {
    const slugs = SKY_MODULES.map((m) => m.slug);
    const branches = STAGES.flatMap((s) => [s.branch, ...(s.factBranches ?? [])]).filter((b) => b !== undefined);
    expect(branches.map((b) => b.slug).sort()).toEqual(
      ['das-unsichtbare', 'galaktisches-jahr', 'lichtgeschwindigkeit', 'sandkorn-welt', 'zeitmaschine'].sort(),
    );
    branches.forEach((b) => expect(slugs).toContain(b.slug));
    expect(STAGES[3].branch?.label).toBe('Wie leer ist das wirklich?');
    expect(STAGES[5].branch?.slug).toBe('zeitmaschine');
  });
});

describe('planet data', () => {
  it('has the eight planets with five facts each', () => {
    expect(PLANETS.map((p) => p.name)).toEqual(['Merkur', 'Venus', 'Erde', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptun']);
    PLANETS.forEach((p) => {
      expect(Object.values(p.facts).every((v) => v.length > 0)).toBe(true);
      expect(p.period).toBeGreaterThan(0);
    });
  });

  it('uses the Mars values of the spec', () => {
    const mars = findPlanet('mars');
    expect(mars.distance).toBe('228 Mio. km');
    expect(mars.light).toBe('13 min');
    expect(mars.line).toBe('„Eine rote Wüste. Und der Sonnenuntergang ist hier blau.“');
    expect(mars.aha).toContain('Olympus Mons');
  });

  it('has the six large moons at Jupiter and Saturn', () => {
    expect(findPlanet('jupiter').moons).toEqual(['io', 'europa', 'ganymed', 'kallisto']);
    expect(findPlanet('saturn').moons).toEqual(['titan', 'enceladus']);
    expect(Object.keys(MOONS)).toHaveLength(6);
    expect(MOONS.europa.line).toContain('Ozean');
  });

  it('rejects unknown planets', () => {
    expect(() => findPlanet('pluto' as never)).toThrow();
  });

  it('has the neighbouring stars as glowing bodies that return to the neighbouring star systems', () => {
    const ids = ['alpha-centauri-a', 'alpha-centauri-b', 'proxima', 'barnard', 'luhman-16', 'wise-0855', 'wolf-359', 'lalande-21185', 'sirius'] as const;
    for (const id of ids) {
      const star = findBody(id);
      expect(star.emissive).toBe(true);
      expect(star.planet).toBeUndefined();
      expect(star.backLabel).toBe('Zurück zu den benachbarten Sternensystemen');
      expect(isStarId(id)).toBe(true);
    }
    expect(findBody('proxima').distance).toContain('4,24');
    expect(findBody('sirius').distance).toContain('8,6');
    expect(findBody('luhman-16').line).toContain('gescheiterte Sterne');
    expect(isStarId('sonne')).toBe(false);
  });

  it('shows the Milky Way arms and Sagittarius A* as pictures that return to the Milky Way', () => {
    for (const id of ['sgr-a', 'scutum-centaurus-arm', 'sagittarius-arm', 'orion-arm', 'perseus-arm'] as const) {
      const part = findBody(id);
      expect(part.picture).toBeDefined();
      expect(part.backLabel).toBe('Zurück zur Milchstrasse');
      expect(CREDITS[part.credit]).toBeDefined();
    }
    expect(findBody('sgr-a').picture?.src).toContain('sgr-a');
  });

  it('shows the galaxies of the Local Group as credited pictures that return to the Local Group', () => {
    for (const id of ['milchstrasse', 'andromeda', 'dreiecksgalaxie', 'grosse-magellansche-wolke', 'kleine-magellansche-wolke'] as const) {
      const galaxy = findBody(id);
      expect(galaxy.id).toBe(id);
      expect(galaxy.picture?.src).toMatch(/^journey\/img\//);
      expect(galaxy.backLabel).toBe('Zurück zur Stufe Lokale Gruppe');
      expect(CREDITS[galaxy.credit]).toBeDefined();
    }
    expect(findBody('dreiecksgalaxie').credit).toBe('triangulum');
  });

  it('shows the structures of the universe as credited pictures that return to the universe', () => {
    const ids = ['laniakea', 'bootes-leerraum', 'herkules-mauer', 'geschosshaufen', 'webb-deep-field', 'jades-gs-z14-0', 'ton-618', 'mikrowellenhintergrund'] as const;
    for (const id of ids) {
      const place = findBody(id);
      expect(place.id).toBe(id);
      expect(place.picture?.src).toMatch(/^journey\/img\//);
      expect(place.backLabel).toBe('Zurück zur Stufe Universum');
      expect(place.facts.length).toBeGreaterThanOrEqual(4);
      expect(CREDITS[place.credit]).toBeDefined();
    }
    // Without a photo of their own, they say so and show the simulation.
    for (const id of ['bootes-leerraum', 'herkules-mauer'] as const) {
      expect(findBody(id).credit).toBe('cosmic-web');
      expect(findBody(id).facts.join(' ')).toContain('kein Foto');
    }
  });

  it('returns the Earth to the stage it was opened from', () => {
    expect(findBody('erde').backTo).toBe('Sonnensystem');
    expect(findBody('erde', 'mond').backLabel).toBe('Zurück zu Erde und Mond');
    expect(findBody('erde', 'alpha-centauri').backTo).toBe('Benachbarte Sternensysteme');
    expect(findBody('erde', 'milchstrasse').backTo).toBe('Milchstrasse');
    expect(findBody('erde', 'lokale-gruppe').backTo).toBe('Lokale Gruppe');
    expect(findBody('erde', 'universum').backLabel).toBe('Zurück zur Stufe Universum');
    expect(findBody('erde', 'universum').name).toBe('Erde');
  });

  it('returns the Sun to the stage it was opened from', () => {
    expect(findBody('sonne').backTo).toBe('Sonnensystem');
    expect(findBody('sonne', 'sonnensystem').backTo).toBe('Sonnensystem');
    expect(findBody('sonne', 'alpha-centauri').backTo).toBe('Benachbarte Sternensysteme');
  });
});

describe('credits', () => {
  const references = (): CreditId[] => [...STAGES.flatMap((s) => s.credits), ...PLANETS.map((p) => p.credit)];

  it('has an entry for every picture and data set referenced', () => {
    for (const id of references()) {
      expect(CREDITS[id], id).toBeDefined();
    }
  });

  it('catches a missing entry', () => {
    const known = new Set(Object.keys(CREDITS));
    known.delete('cosmic-web');
    expect(references().filter((id) => !known.has(id))).toEqual(['cosmic-web']);
  });

  it('names source, licence and kind for every entry', () => {
    for (const credit of Object.values(CREDITS)) {
      expect(credit.source.length).toBeGreaterThan(0);
      expect(credit.licence.length).toBeGreaterThan(0);
      expect(credit.url).toMatch(/^https:\/\//);
    }
  });
});
