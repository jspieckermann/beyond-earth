import { STATIONS, Station } from '../data/stations';
import { earthAt, mixColour } from './earth';
import {
  GALACTIC,
  SUN_AGE_YEARS,
  completedRounds,
  formatCompleted,
  distanceKm,
  formatKm,
  formatRounds,
  formatRoundsBack,
  formatTimeBack,
  roundsIn,
  yearsBack,
} from './galactic';
import {
  CENTRE,
  SUN_RADIUS,
  backArc,
  SLIDER_STEPS,
  SLIDER_STRETCH,
  nearestStation,
  ringRadii,
  roundsAtFraction,
  roundsAtPointer,
  roundsAtSlider,
  ruler,
  sliderFraction,
  sliderValue,
  sunAt,
} from './orbit';

const HOUR = 1 / (365.25 * 24);
const SECOND = HOUR / 3600;

describe('galactic calculation', () => {
  it('reproduces the values of the concept', () => {
    expect(formatKm(distanceKm(SECOND))).toBe('230 km');
    expect(formatKm(distanceKm(HOUR))).toBe('828.000 km');
    expect(formatKm(distanceKm(1))).toBe('7,3 Milliarden Kilometer');
    expect(formatKm(distanceKm(30))).toBe('218 Milliarden Kilometer');
    expect(formatRounds(roundsIn(30))).toBe('0,00000013');
    expect(formatRounds(roundsIn(66e6))).toBe('0,29');
    expect(formatRounds(roundsIn(4.6e9))).toBe('20');
    const human = roundsIn(GALACTIC.humanYears);
    expect(formatRounds(human * 100)).toBe('0,13');
    expect(human * 360).toBeCloseTo(0.47, 2);
  });

  it('writes the time back short and long', () => {
    expect(formatTimeBack(0)).toBe('heute');
    expect(formatTimeBack(0.5)).toBe('vor 115 Mio. Jahren');
    expect(formatTimeBack(1, true)).toBe('vor 230 Millionen Jahren');
    expect(formatTimeBack(16)).toBe('vor 3,7 Mrd. Jahren');
    expect(formatTimeBack(20, true)).toBe('vor 4,6 Milliarden Jahren');
    expect(formatTimeBack(30)).toBe('vor 6,9 Mrd. Jahren');
    expect(formatTimeBack(1e9 / 230e6)).toBe('vor 1 Mrd. Jahren');
    expect(yearsBack(2)).toBe(460e6);
  });

  it('writes the rounds back while moving', () => {
    expect(formatRoundsBack(0)).toBe('auf dem Weg');
    expect(formatRoundsBack(0.62)).toBe('0,6 Runden');
    expect(formatRoundsBack(1)).toBe('1 Runde');
    expect(formatRoundsBack(2)).toBe('2 Runden');
  });

  it('counts the rounds the Sun had completed at that time', () => {
    expect(roundsIn(SUN_AGE_YEARS)).toBeCloseTo(20);
    expect(completedRounds(0)).toBe(20);
    expect(completedRounds(1)).toBe(19);
    expect(completedRounds(1.935)).toBe(18);
    expect(completedRounds(19.5)).toBe(0);
    expect(completedRounds(20)).toBe(0);
    expect(formatCompleted(0)).toBe('Bis heute: rund 20 Runden um das Zentrum');
    expect(formatCompleted(1)).toBe('Bis dahin: 19 Runden um das Zentrum');
    expect(formatCompleted(19)).toBe('Bis dahin: 1 Runde um das Zentrum');
    expect(formatCompleted(20)).toBe('Bis dahin: noch keine Runde');
  });

});

describe('orbit geometry', () => {
  const stations = [0, 66 / 230, 0.5, 1, 2, 3, 4, 16, 20];

  it('puts the Sun at today for whole rounds and opposite for half a round', () => {
    const today = sunAt(0);
    expect(today).toEqual({ x: CENTRE, y: Number((CENTRE + SUN_RADIUS).toFixed(4)) });
    for (const r of [1, 2, 3, 20]) {
      expect(sunAt(r).x).toBeCloseTo(today.x, 4);
      expect(sunAt(r).y).toBeCloseTo(today.y, 4);
    }
    expect(sunAt(0.5).y).toBeCloseTo(CENTRE - SUN_RADIUS, 4);
    // Back in time runs counter-clockwise: a quarter round back lies to the right of the centre.
    expect(sunAt(0.25).x).toBeCloseTo(CENTRE + SUN_RADIUS, 4);
  });

  it('draws the back arc only for the part of a round', () => {
    expect(backArc(0)).toBe('');
    expect(backArc(1)).toBe('');
    expect(backArc(3)).toBe('');
    expect(backArc(0.25)).toMatch(/^M 0\.5 \S+ A \S+ \S+ 0 0 0 /);
    expect(backArc(0.75)).toMatch(/ 0 1 0 /);
    expect(backArc(1.5)).not.toBe('');
  });

  it('draws one ring per completed round', () => {
    expect(ringRadii(0)).toEqual([]);
    expect(ringRadii(0.9)).toEqual([]);
    expect(ringRadii(3)).toHaveLength(3);
    const [a, b] = ringRadii(2);
    expect(a).toBeGreaterThan(SUN_RADIUS);
    expect(b).toBeGreaterThan(a);
  });

  it('stretches the first 5 rounds over 70 % of the slider and keeps both parts linear', () => {
    expect(SLIDER_STEPS).toBe(1000);
    expect(SLIDER_STRETCH).toEqual({ rounds: 5, share: 0.7 });
    expect(sliderValue(0, 20)).toBe(0);
    expect(sliderValue(1, 20)).toBe(140);
    expect(sliderValue(2.5, 20)).toBe(350);
    expect(sliderValue(5, 20)).toBe(700);
    expect(sliderValue(12.5, 20)).toBe(850);
    expect(sliderValue(20, 20)).toBe(1000);
    expect(sliderValue(99, 20)).toBe(1000);
    expect(sliderValue(-1, 20)).toBe(0);
    // A round is 2,8 times as wide as on an evenly spaced slider before 5 rounds, and narrower after.
    expect(sliderFraction(1, 20) / (1 / 20)).toBeCloseTo(2.8);
    expect((sliderFraction(20, 20) - sliderFraction(19, 20)) / (1 / 20)).toBeCloseTo(0.4, 3);
    expect(roundsAtSlider(132, 20)).toBeCloseTo(0.9429, 3);
    expect(roundsAtSlider(800, 20)).toBeCloseTo(10);
    expect(roundsAtFraction(2, 20)).toBe(20);
    for (const r of [0, 0.5, 1, 4.9, 5, 7.3, 20]) {
      expect(roundsAtSlider(sliderValue(r, 20), 20)).toBeCloseTo(r, 1);
    }
  });

  it('keeps a slider that ends within the stretched part simply linear', () => {
    expect(sliderFraction(1.5, 3)).toBe(0.5);
    expect(roundsAtSlider(400, 3)).toBeCloseTo(1.2);
    expect(roundsAtFraction(-1, 3)).toBe(0);
  });

  it('draws a ruler with quarter rounds in the stretched part and every round beyond', () => {
    const wide = ruler(20);
    expect(wide.ticks.filter((t) => t.kind === 'quarter')).toHaveLength(15);
    expect(wide.ticks.filter((t) => t.kind !== 'quarter')).toHaveLength(21);
    expect(wide.ticks.filter((t) => t.kind === 'major')).toHaveLength(9);
    expect(wide.labels.map((l) => [l.text, l.left])).toEqual([
      ['heute', '0%'],
      ['1', '14%'],
      ['2', '28%'],
      ['3', '42%'],
      ['4', '56%'],
      ['5', '70%'],
      ['10', '80%'],
      ['15', '90%'],
      ['20', '100%'],
    ]);
    expect(wide.labels.filter((l) => l.strong).map((l) => l.text)).toEqual(['5']);
    const short = ruler(3);
    expect(short.labels.map((l) => l.text)).toEqual(['heute', '1', '2', '3']);
    expect(short.labels.some((l) => l.strong)).toBe(false);
    expect(short.ticks.filter((t) => t.kind === 'quarter')).toHaveLength(9);
  });

  it('finds the nearest station', () => {
    expect(nearestStation(150 / 230, stations)).toBe(2);
    expect(nearestStation(17, stations)).toBe(7);
    expect(nearestStation(0.94, stations)).toBe(3);
  });

  it('turns a pointer angle into rounds close to the previous ones', () => {
    const at = (r: number) => sunAt(r);
    expect(roundsAtPointer(at(0.25), 0.2, 20)).toBeCloseTo(0.25, 3);
    expect(roundsAtPointer(at(0.05), 0.95, 20)).toBeCloseTo(1.05, 3);
    expect(roundsAtPointer(at(0.95), 1.05, 20)).toBeCloseTo(0.95, 3);
    expect(roundsAtPointer(at(0.9), 0.05, 20)).toBe(0);
    expect(roundsAtPointer(at(0.1), 2.95, 3)).toBe(3);
  });
});

describe('the Earth of the past', () => {
  const at = (id: string) => STATIONS.find((s) => s.id === id) as Station;

  it('shows a station exactly at its place', () => {
    const pangaea = at('eine-runde');
    const earth = earthAt(pangaea.rounds);
    expect(earth.ocean).toBe(pangaea.earth.ocean);
    expect(earth.land).toEqual([{ path: pangaea.earth.landPath, fill: pangaea.earth.land, details: pangaea.earth.details, opacity: 1 }]);
    // The coasts are a lighter shade of the ocean.
    expect(earth.shelf).toBe(mixColour(pangaea.earth.ocean, '#ffffff', 0.22));
    expect(earthAt(0).iceNorth).toBe(8);
    expect(earthAt(-1)).toEqual(earthAt(0));
    expect(earthAt(99)).toEqual(earthAt(20));
  });

  it('blends two drawings and grows the ice between two stations', () => {
    const from = at('zwei-runden');
    const to = at('kambrium');
    const earth = earthAt((from.rounds + to.rounds) / 2);
    expect(earth.land.map((l) => l.path)).toEqual([from.earth.landPath, to.earth.landPath]);
    for (const layer of earth.land) {
      expect(layer.opacity).toBeCloseTo(0.5);
    }
    expect(earth.iceSouth).toBeCloseTo((from.earth.iceSouth + to.earth.iceSouth) / 2);
    const snowball = earthAt(2.9);
    expect(snowball.iceNorth).toBeGreaterThan(0);
    expect(snowball.iceNorth).toBeLessThan(42);
  });

  it('fades the landscapes together with their land', () => {
    const earth = earthAt((at('heute').rounds + at('vormenschen').rounds) / 2);
    expect(earth.land.map((l) => l.details)).toEqual([at('heute').earth.details, at('vormenschen').earth.details]);
    for (const layer of earth.land) {
      expect(layer.opacity).toBeCloseTo(0.5);
    }
    expect(mixColour('#000000', '#ffffff', 0.5)).toBe('#808080');
  });

  it('draws every station with land and landscapes inside the globe', () => {
    for (const s of STATIONS) {
      expect(s.earth.landPath).not.toBe('');
      expect(s.earth.details.length).toBeGreaterThan(0);
      // Every point of the outlines lies within the globe of radius 48 around the middle.
      for (const [, x, y] of s.earth.landPath.matchAll(/(-?[d.]+) (-?[d.]+)/g)) {
        expect(Math.hypot(Number(x) - 50, Number(y) - 50)).toBeLessThanOrEqual(48);
      }
    }
    // Today shows recognisable regions: a desert, rainforests, mountains and Greenland's ice.
    expect(at('heute').earth.details.map((d) => d.fill)).toEqual(['#c8a46a', '#3f6e36', '#4b7a3c', '#7a6a4f', '#eef3f7']);
  });

  it('has no land where there is none', () => {
    const none = [{ ...at('heute'), earth: { ...at('heute').earth, landPath: '' } }, { ...at('vormenschen'), earth: { ...at('vormenschen').earth, landPath: '' } }];
    expect(earthAt(0.01, none).land).toEqual([]);
  });
});


