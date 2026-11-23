import { formatCount, formatDistance, formatDuration, formatKms, formatPercent } from './format';
import { MAX_BETA, MIN_BETA, PRESETS, betaToPosition, clampBeta, parsePercent, positionToBeta, presetFor } from './speed-scale';
import { OUTCOMES, TRAVEL_RULES, figuresFor, generations, historyAnchor, travel } from './travel';

const NOW = new Date(Date.UTC(2026, 10, 23, 12));
const voyager = PRESETS[0].beta;
const journey = (lightYears: number, lowerBound = false) => ({ kind: 'journey' as const, lightYears, lowerBound });
const KM = 1 / 9.4607e12;

describe('format', () => {
  it('shows durations in the most familiar unit', () => {
    expect(formatDuration(1.3 / (365.25 * 86400))).toBe('1,3 Sekunden');
    expect(formatDuration(30 / (365.25 * 86400))).toBe('30 Sekunden');
    expect(formatDuration(120 / (365.25 * 86400))).toBe('2 Minuten');
    expect(formatDuration(6.3 / (365.25 * 24))).toBe('6,3 Stunden');
    expect(formatDuration(221 / 365.25)).toBe('221 Tage');
    expect(formatDuration(1 / 365.25)).toBe('1 Tag');
    expect(formatDuration(21.2)).toBe('21,2 Jahre');
    expect(formatDuration(74_772.4)).toBe('74.772 Jahre');
    expect(formatDuration(2_525_253)).toBe('2,5 Mio. Jahre');
    expect(formatDuration(4.4e10)).toBe('44 Mrd. Jahre');
  });

  it('shows speeds as percentages and km/s', () => {
    expect(formatPercent(voyager)).toBe('0,0057');
    expect(PRESETS.map((p) => formatPercent(p.beta))).toEqual(['0,0057', '3,3', '4,5', '12', '20']);
    expect(formatPercent(0.1)).toBe('10');
    expect(formatPercent(0.1036)).toBe('10,4');
    expect(formatPercent(0.0102)).toBe('1,02');
    expect(formatPercent(0.99)).toBe('99');
    expect(formatPercent(0.999999)).toBe('99,9999');
    expect(formatPercent(MIN_BETA)).toBe('0,001');
    expect(formatKms(voyager)).toBe('17');
    expect(formatKms(0.1)).toBe('29.979');
    expect(formatCount(2991)).toBe('2.991');
  });

  it('shows distances for the destination list', () => {
    expect(formatDistance(384_400 * KM)).toBe('384.400 km');
    expect(formatDistance(55e6 * KM)).toBe('55 Mio. km');
    expect(formatDistance(25.9e9 * KM)).toBe('25,9 Mrd. km');
    expect(formatDistance(4.24)).toBe('4,24 Lichtjahre');
    expect(formatDistance(26_000)).toBe('ca. 26.000 Lichtjahre');
    expect(formatDistance(2.5e6)).toBe('ca. 2,5 Mio. Lichtjahre');
    expect(formatDistance(3.7e9)).toBe('ca. 3,7 Mrd. Lichtjahre');
  });
});

describe('speed scale', () => {
  it('spans 0,001 % to 99,9999 % with room at both ends', () => {
    expect(positionToBeta(0)).toBeCloseTo(MIN_BETA, 10);
    expect(positionToBeta(1000)).toBeCloseTo(MAX_BETA, 10);
    expect(positionToBeta(600)).toBeCloseTo(0.1, 10);
    expect(positionToBeta(150)).toBeCloseTo(0.0001, 10);
    expect(positionToBeta(450)).toBeCloseTo(0.01, 10);
  });

  it('round-trips positions and speeds', () => {
    for (const beta of [MIN_BETA, voyager, 0.01, 0.1, 0.2, 0.5, 0.9, 0.99, 0.9999, MAX_BETA]) {
      expect(positionToBeta(betaToPosition(beta)) / beta).toBeCloseTo(1, 1);
    }
    expect(betaToPosition(0.5)).toBeGreaterThan(betaToPosition(0.2));
    expect(betaToPosition(0.99)).toBeLessThan(betaToPosition(0.9999));
    // 10 %–50 % is spread finely, not squeezed into a few steps
    expect(betaToPosition(0.5) - betaToPosition(0.1)).toBeGreaterThan(50);
  });

  it('parses German numbers and clamps them', () => {
    expect(parsePercent('0,5')).toEqual({ beta: 0.005, clampedHigh: false });
    expect(parsePercent('0.5 %')).toEqual({ beta: 0.005, clampedHigh: false });
    expect(parsePercent('100')).toEqual({ beta: MAX_BETA, clampedHigh: true });
    expect(parsePercent('0')?.beta).toBe(MIN_BETA);
    expect(parsePercent('schnell')).toBeNull();
    expect(clampBeta(Number.NaN)).toBe(MIN_BETA);
  });

  it('knows its presets', () => {
    expect(PRESETS.map((p) => p.label)).toEqual(['Voyager 1', 'Orion', 'Longshot', 'Daedalus', 'Starshot']);
    expect(presetFor(0.2)?.id).toBe('starshot');
    expect(presetFor(0.21)).toBeUndefined();
  });
});

describe('travel', () => {
  it('reproduces the calculation table of the spec', () => {
    const rows: [number, number, string, string, number, number][] = [
      [4.24, voyager, '74.772 Jahre', '74.772 Jahre', 2991, 2991],
      [4.24, 0.01, '424 Jahre', '424 Jahre', 17, 17],
      [4.24, 0.2, '21,2 Jahre', '20,8 Jahre', 1, 1],
      [8.6, 0.1, '86 Jahre', '85,6 Jahre', 4, 4],
      [26_000, 0.99, '26.263 Jahre', '3.705 Jahre', 149, 1051],
      [26_000, 0.999999, '26.000 Jahre', '36,8 Jahre', 1, 1041],
    ];
    for (const [ly, beta, earth, board, gB, gE] of rows) {
      const r = travel(journey(ly), beta, NOW);
      if (r.kind !== 'journey') throw new Error('journey expected');
      expect(formatDuration(r.earthYears), `${ly} @ ${beta}`).toBe(earth);
      expect(formatDuration(r.boardYears), `${ly} @ ${beta}`).toBe(board);
      expect(r.generationsBoard).toBe(gB);
      expect(r.generationsEarth).toBe(gE);
    }
  });

  it('measures short journeys in hours', () => {
    const r = travel(journey(384_400 * KM), voyager, NOW);
    if (r.kind !== 'journey') throw new Error('journey expected');
    expect(formatDuration(r.earthYears)).toBe('6,3 Stunden');
    expect(formatDuration(r.boardYears)).toBe('6,3 Stunden');
    expect(r.outcome).toBe(OUTCOMES.blink);
    expect(r.arrivalYear).toBe(2026);
  });

  it('marks lower bounds and never-reachable places', () => {
    const far = travel(journey(3.7e9, true), 0.99, NOW);
    expect(far.kind === 'journey' && far.lowerBound).toBe(true);
    expect(far.kind === 'journey' && far.arrivalYear).toBeNull();
    expect(travel({ kind: 'never' }, 0.999999, NOW)).toEqual({ kind: 'never', outcome: OUTCOMES.never });
    expect(travel({ kind: 'here' }, 0.1, NOW)).toEqual({ kind: 'here', outcome: OUTCOMES.here });
  });

  it('chooses the outcome sentence in the order of the spec', () => {
    const outcome = (ly: number, beta: number) => travel(journey(ly), beta, NOW).outcome;
    expect(outcome(384_400 * KM, 0.01)).toBe(OUTCOMES.blink);
    expect(outcome(0.5, 0.99)).toBe(OUTCOMES.arrive);
    expect(outcome(4.24, 0.2)).toBe(OUTCOMES.arrive);
    expect(outcome(26_000, 0.999999)).toBe(OUTCOMES.arriveAlone);
    expect(outcome(4.24, voyager)).toBe(OUTCOMES.generations);
  });

  it('counts generations, figures and history anchors', () => {
    expect(generations(50)).toBe(1);
    expect(generations(50.1)).toBe(3);
    expect(generations(424)).toBe(17);
    expect(figuresFor(17)).toEqual({ count: 17, unit: 1 });
    expect(figuresFor(149)).toEqual({ count: 15, unit: 10 });
    expect(figuresFor(2991)).toEqual({ count: 3, unit: 1000 });
    expect(figuresFor(2991).count).toBeLessThanOrEqual(TRAVEL_RULES.maxFigures);
    expect(historyAnchor(1)).toBeNull();
    expect(historyAnchor(17)).toBe('17 Generationen: Ungefähr so weit zurück liegt Galileis erster Blick durchs Fernrohr.');
    expect(historyAnchor(149)).toContain('Pyramide von Gizeh');
    expect(historyAnchor(2991)).toContain('Chauvet');
    expect(historyAnchor(100_000)).toContain('mehr, als es Menschen unserer Art überhaupt gibt');
  });

  it('adds a line for a journey started at birth', () => {
    const arrived = travel(journey(4.24), 0.2, NOW, 1996);
    expect(arrived.kind === 'journey' && arrived.birthLine).toBe(
      'Wärst du bei deiner Geburt aufgebrochen, wärst du schon angekommen: im Jahr 2017.',
    );
    const underway = travel(journey(4.24), 0.01, NOW, 1996);
    expect(underway.kind === 'journey' && underway.birthLine).toContain('des Weges geschafft');
    const none = travel(journey(4.24), 0.2, NOW);
    expect(none.kind === 'journey' && none.birthLine).toBeNull();
  });
});
