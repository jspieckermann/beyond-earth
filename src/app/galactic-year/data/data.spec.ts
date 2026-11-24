import { formatTimeBack } from '../engine/galactic';
import { SECTIONS, SECTION_FACTS, SECTION_TITLES, factsFor } from './scenes';
import { STATIONS, isFullRound, stationsFor } from './stations';

describe('stations', () => {
  it('match the station table of the spec', () => {
    expect(STATIONS.filter((s) => s.kind === 'haupt').map((s) => [s.time, s.roundsText])).toEqual([
      ['heute', 'auf dem Weg'],
      ['vor 66 Mio. Jahren', 'gut ¼ Runde'],
      ['vor 115 Mio. Jahren', '½ Runde'],
      ['vor 230 Mio. Jahren', '1 Runde'],
      ['vor 460 Mio. Jahren', '2 Runden'],
      ['vor 690 Mio. Jahren', '3 Runden'],
      ['vor 920 Mio. Jahren', '4 Runden'],
      ['vor 3,7 Mrd. Jahren', '16 Runden'],
      ['vor 4,6 Mrd. Jahren', '20 Runden'],
    ]);
    expect(STATIONS.filter((s) => s.kind === 'zwischen').map((s) => s.time)).toEqual([
      'vor 6 Mio. Jahren',
      'vor 34 Mio. Jahren',
      'vor 150 Mio. Jahren',
      'vor 180 Mio. Jahren',
      'vor 252 Mio. Jahren',
      'vor 300 Mio. Jahren',
      'vor 375 Mio. Jahren',
      'vor 445 Mio. Jahren',
      'vor 540 Mio. Jahren',
      'vor 575 Mio. Jahren',
      'vor 1,1 Mrd. Jahren',
      'vor 2 Mrd. Jahren',
      'vor 2,4 Mrd. Jahren',
      'vor 4,4 Mrd. Jahren',
      'vor 4,5 Mrd. Jahren',
    ]);
    const pangaea = STATIONS.find((s) => s.id === 'eine-runde');
    expect(pangaea?.sentence).toBe('Als die Sonne das letzte Mal an dieser Stelle war, gingen die ersten Dinosaurier über die Erde.');
    expect(pangaea?.caption).toBe('Ein einziger grosser Kontinent, Pangäa. Die ersten Dinosaurier.');
  });

  it('are in order of time, each with a title, a sentence and a caption', () => {
    STATIONS.forEach((s, i) => {
      expect(s.title && s.sentence && s.caption).toBeTruthy();
      if (i > 0) {
        expect(s.rounds).toBeGreaterThan(STATIONS[i - 1].rounds);
      }
    });
    expect(new Set(STATIONS.map((s) => s.id)).size).toBe(STATIONS.length);
  });

  it('agree with the calculation', () => {
    for (const s of STATIONS) {
      expect(formatTimeBack(s.rounds)).toBe(s.time);
      expect(formatTimeBack(s.rounds, true)).toBe(s.timeLong);
    }
  });

  it('give the main journey today and 1, 2, 3 rounds back', () => {
    expect(stationsFor(true).map((s) => s.rounds)).toEqual([0, 1, 2, 3]);
    expect(stationsFor(false)).toBe(STATIONS);
  });

  it('pulse only at whole rounds', () => {
    expect(STATIONS.filter(isFullRound).map((s) => s.rounds)).toEqual([1, 2, 3, 4, 16, 20]);
  });
});

describe('sections', () => {
  it('have a title and facts each', () => {
    expect(SECTIONS.map((s) => SECTION_TITLES[s])).toEqual(['Eine Runde', 'Zurückdrehen']);
    for (const section of SECTIONS) {
      expect(SECTION_FACTS[section].facts.length).toBeGreaterThan(0);
    }
  });

  it('disclose the calculation and the drawings', () => {
    expect(SECTION_FACTS.runde.facts.join(' ')).toContain('230 Kilometern pro Sekunde');
    expect(SECTION_FACTS.runde.facts.join(' ')).toContain('210 bis 250 Millionen Jahre');
    expect(SECTION_FACTS.runde.facts.join(' ')).toContain('230 Millionen Jahren');
    expect(SECTION_FACTS.zurueck.facts.join(' ')).toContain('vereinfachte Zeichnung');
    expect(SECTION_FACTS.zurueck.facts.join(' ')).not.toContain('Lupe');
    expect(SECTION_FACTS.zurueck.sources[0].source).toContain('R. Hurt');
  });

  it('offer the branch to the invisible only with branches', () => {
    expect(factsFor('runde', true).branches).toEqual([{ label: 'Was hält die Sonne auf ihrer Bahn?', slug: 'das-unsichtbare' }]);
    expect(factsFor('runde', false).branches).toEqual([]);
  });
});
