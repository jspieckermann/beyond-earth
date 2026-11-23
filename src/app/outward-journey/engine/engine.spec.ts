import { earthAge, formatAge, isValidBirthYear, planetAge } from './age';
import { LIGHT_YEAR_M, de, formatDistance, formatLightTime } from './format';
import { subsolarPoint, sunHeight } from './sun-position';
import {
  FLIGHT_PACE,
  RETURN_PACE,
  distanceAt,
  earthOffsetAt,
  flightDuration,
  flightPosition,
  inVoid,
  labelOpacity,
  layerOpacity,
  layerScale,
  nearestStage,
  placeMarker,
  snapTarget,
  stageNearness,
} from './zoom-math';

const LY = LIGHT_YEAR_M;

describe('formatDistance and formatLightTime', () => {
  const table: [number, string, string][] = [
    [1.2742e7, '12.742 km', '0,04 s'],
    [3.844e8, '384.400 km', '1,3 s'],
    [4.5e12, '4,5 Mrd. km', '4 h 10 min'],
    [4.24 * LY, '4,24 Lichtjahre', '4,2 Jahre'],
    [10_000 * LY, '10.000 Lichtjahre', '10.000 Jahre'],
    [26_000 * LY, '26.000 Lichtjahre', '26.000 Jahre'],
    [100_000 * LY, '100.000 Lichtjahre', '100.000 Jahre'],
    [2.5e6 * LY, '2,5 Mio. Lichtjahre', '2,5 Mio. Jahre'],
    [1e7 * LY, '10 Mio. Lichtjahre', '10 Mio. Jahre'],
    [93e9 * LY, '93 Mrd. Lichtjahre', 'seit 13,8 Mrd. Jahren'],
  ];

  for (const [metres, distance, light] of table) {
    it(`formats ${distance} / ${light}`, () => {
      expect(formatDistance(metres)).toBe(distance);
      expect(formatLightTime(metres)).toBe(light);
    });
  }

  it('covers the units in between', () => {
    expect(formatDistance(1.5e11)).toBe('150 Mio. km');
    expect(formatDistance(2.28e11)).toBe('228 Mio. km');
    expect(formatDistance(5e10)).toBe('50 Mio. km');
    expect(formatDistance(4e14)).toBe('400 Mrd. km');
    expect(formatDistance(0.5 * LY)).toBe('0,5 Lichtjahre');
    expect(formatDistance(550 * LY)).toBe('550 Lichtjahre');
    expect(formatLightTime(1.496e11)).toBe('8 min 19 s');
    expect(formatLightTime(1.8e10)).toBe('1 min');
    expect(formatLightTime(2.59e13)).toBe('23 h 60 min');
    expect(formatLightTime(1e14)).toBe('4 Tage');
    expect(formatLightTime(550 * LY)).toBe('550 Jahre');
  });

  it('formats German numbers', () => {
    expect(de(1234.5, 1)).toBe('1.234,5');
    expect(de(2)).toBe('2');
  });
});

describe('zoom maths', () => {
  it('scales layers by the stage factor', () => {
    expect(layerScale(3, 3)).toBe(1);
    expect(layerScale(3, 2)).toBe(6);
    expect(layerScale(3, 4)).toBeCloseTo(1 / 6);
    expect(layerScale(0, 9)).toBe(0.005);
    expect(layerScale(9, 0)).toBe(60);
  });

  it('cross-fades neighbouring layers', () => {
    expect(layerOpacity(5, 5)).toBe(1);
    expect(layerOpacity(5, 5.5)).toBeCloseTo(0.2);
    expect(layerOpacity(6, 5.5)).toBeCloseTo(0.2);
    expect(layerOpacity(5, 7)).toBe(0);
  });

  it('shows nothing in the stretched emptiness', () => {
    for (let n = 0; n < 10; n++) {
      expect(layerOpacity(n, 2.5)).toBe(0);
    }
    expect(layerOpacity(2, 2.1)).toBeCloseTo(0.5);
    expect(layerOpacity(3, 2.9)).toBeCloseTo(0.5);
    expect(layerOpacity(1, 2.5)).toBe(0);
    expect(layerOpacity(4, 2.5)).toBe(0);
    expect(inVoid(2.5)).toBe(true);
    expect(inVoid(2.1)).toBe(false);
  });

  it('fades labels faster than layers', () => {
    expect(labelOpacity(4, 4)).toBe(1);
    expect(labelOpacity(4, 4.25)).toBe(0);
    expect(layerOpacity(4, 4.25)).toBeGreaterThan(0.5);
  });

  it('knows the nearest stage and how close it is', () => {
    expect(nearestStage(3.4)).toBe(3);
    expect(nearestStage(-1)).toBe(0);
    expect(stageNearness(4)).toBe(1);
    expect(stageNearness(4.1)).toBeCloseTo(0.5);
    expect(stageNearness(4.5)).toBe(0);
  });

  it('interpolates distances logarithmically', () => {
    const d = [1, 100, 10_000, 1e6, 1e8, 1e10, 1e12];
    expect(distanceAt(0, d)).toBe(1);
    expect(distanceAt(0.5, d)).toBeCloseTo(10);
    expect(distanceAt(6, d)).toBeCloseTo(1e12);
    expect(distanceAt(12, d)).toBeCloseTo(1e12);
  });

  it('eases the Earth offset between stages', () => {
    const offsets = Array.from({ length: 10 }, (_, i) => ({ x: i === 5 ? 100 : 0, y: 0 }));
    expect(earthOffsetAt(5, offsets).x).toBe(100);
    expect(earthOffsetAt(4.5, offsets).x).toBeCloseTo(50);
    expect(earthOffsetAt(4.1, offsets).x).toBeLessThan(10);
  });

  it('snaps to the nearest stage, continuing in the direction of movement', () => {
    expect(snapTarget(0.05, 1)).toBe(0);
    expect(snapTarget(0.1, 1)).toBe(1);
    expect(snapTarget(0.6, -1)).toBe(0);
    expect(snapTarget(0.6, 0)).toBe(1);
    expect(snapTarget(6.5, 1)).toBe(6);
  });

  it('takes at least 6 s through the emptiness', () => {
    expect(flightDuration(2, 3)).toBe(7000);
    expect(flightDuration(3, 2)).toBe(7000);
    expect(flightDuration(0, 1)).toBe(900);
    expect(flightDuration(0, 0.1)).toBe(600);
    expect(flightDuration(0, 9)).toBe(8 * 900 + 7000);
    expect(flightDuration(6, 0, RETURN_PACE)).toBe(9_000);
  });

  it('moves slowly through the emptiness during a flight', () => {
    expect(flightPosition(0, 4, 0)).toBe(0);
    expect(flightPosition(0, 4, 1)).toBe(4);
    const total = flightDuration(1, 3, FLIGHT_PACE);
    // After the first stage (900 ms) the flight is at the edge of the emptiness.
    expect(flightPosition(1, 3, 900 / total)).toBeCloseTo(2);
    // Halfway through the emptiness after another 3.5 s.
    expect(flightPosition(1, 3, (900 + 3500) / total)).toBeCloseTo(2.5);
    // Flying back, the emptiness comes first.
    expect(flightPosition(3, 1, 3500 / total)).toBeCloseTo(2.5);
    expect(flightPosition(4, 4, 0.5)).toBe(4);
    expect(flightPosition(0, 1, 0.5)).toBeCloseTo(0.5);
  });

  it('places the Earth marker and points to an off-screen Earth', () => {
    const viewport = { width: 390, height: 844 };
    const safe = { left: 20, top: 120, right: 330, bottom: 520 };
    const visible = placeMarker({ x: 200, y: 300 }, viewport, safe);
    expect(visible).toMatchObject({ x: 200, y: 300, offscreen: false });
    const away = placeMarker({ x: 900, y: 1000 }, viewport, safe);
    expect(away).toMatchObject({ x: 330, y: 520, offscreen: true });
    expect(away.angle).toBeGreaterThan(0);
    expect(away.angle).toBeLessThan(90);
  });
});

describe('age on other planets', () => {
  const now = new Date(Date.UTC(2026, 10, 20, 12));

  it('computes the ages of the spec', () => {
    expect(formatAge(planetAge(1996, 1.881, now))).toBe('16');
    expect(formatAge(planetAge(1996, 11.86, now))).toBe('2,6');
    expect(earthAge(1996, now)).toBeCloseTo(30.39, 1);
  });

  it('validates the birth year', () => {
    expect(isValidBirthYear(1996, now)).toBe(true);
    expect(isValidBirthYear(1899, now)).toBe(false);
    expect(isValidBirthYear(2027, now)).toBe(false);
    expect(isValidBirthYear(1996.5, now)).toBe(false);
  });

  it('never goes below zero', () => {
    expect(earthAge(2026, new Date(Date.UTC(2026, 0, 1)))).toBe(0);
  });
});

describe('sun position', () => {
  it('puts the Sun over the Greenwich meridian at noon UTC near the equinox', () => {
    const sun = subsolarPoint(new Date(Date.UTC(2026, 2, 20, 12)));
    expect(Math.abs(sun.lat)).toBeLessThan(1);
    expect(Math.abs(sun.lon)).toBeLessThan(3);
  });

  it('puts the Sun over the southern hemisphere in November', () => {
    const sun = subsolarPoint(new Date(Date.UTC(2026, 10, 20, 0)));
    expect(sun.lat).toBeLessThan(-18);
    expect(Math.abs(Math.abs(sun.lon) - 180)).toBeLessThan(10);
  });

  it('tells day from night', () => {
    const sun = subsolarPoint(new Date(Date.UTC(2026, 10, 20, 12)));
    expect(sunHeight(0, 0, sun)).toBeGreaterThan(0);
    expect(sunHeight(0, 180, sun)).toBeLessThan(0);
  });
});
