import { GeoPoint, altitude, bodyPosition, galacticToEquatorial, magnitude, moonFraction, riseSet, skyAt, sunCrossing } from './ephemeris';

/**
 * Almanac values from timeanddate.com ("Sun & Moon times", monthly tables, read 25 Nov 2026), converted from
 * local time (CET/CEST) to UTC. June moonsets are those of the following night (local 22 June, after midnight). The USNO service named in the design could not be reached from here.
 */
interface Fixture {
  readonly place: string;
  readonly at: GeoPoint;
  readonly day: string;
  readonly sunrise: string;
  readonly sunset: string;
  /** Astronomical twilight: morning start and evening end, when the Sun reaches −18° (with the date when it falls after midnight). */
  readonly dawn?: string;
  readonly dusk?: string;
  readonly moonrise: string;
  readonly moonset: string;
}

const HAMBURG = { lat: 53.55, lon: 9.99 };
const MUENCHEN = { lat: 48.14, lon: 11.58 };
const ZUERICH = { lat: 47.37, lon: 8.55 };

const FIXTURES: Fixture[] = [
  { place: 'Hamburg', at: HAMBURG, day: '2026-03-15', sunrise: '05:34', sunset: '17:23', dawn: '03:37', dusk: '19:22', moonrise: '04:37', moonset: '12:48' },
  { place: 'Hamburg', at: HAMBURG, day: '2026-06-21', sunrise: '02:50', sunset: '19:53', moonrise: '10:57', moonset: '23:03' },
  { place: 'Hamburg', at: HAMBURG, day: '2026-11-24', sunrise: '07:01', sunset: '15:11', dawn: '04:55', dusk: '17:17', moonrise: '14:22', moonset: '07:13' },
  { place: 'München', at: MUENCHEN, day: '2026-03-15', sunrise: '05:27', sunset: '17:18', dawn: '03:43', dusk: '19:03', moonrise: '04:06', moonset: '13:04' },
  { place: 'München', at: MUENCHEN, day: '2026-06-21', sunrise: '03:13', sunset: '19:17', dawn: '2026-06-21T23:50', dusk: '2026-06-21T22:40', moonrise: '10:51', moonset: '23:00' },
  { place: 'München', at: MUENCHEN, day: '2026-11-24', sunrise: '06:33', sunset: '15:26', dawn: '04:42', dusk: '17:17', moonrise: '14:48', moonset: '06:35' },
  { place: 'Zürich', at: ZUERICH, day: '2026-03-15', sunrise: '05:39', sunset: '17:31', dawn: '03:56', dusk: '19:14', moonrise: '04:15', moonset: '13:20' },
  { place: 'Zürich', at: ZUERICH, day: '2026-06-21', sunrise: '03:29', sunset: '19:26', dawn: '2026-06-21T00:25', dusk: '2026-06-21T22:29', moonrise: '11:04', moonset: '23:12' },
  { place: 'Zürich', at: ZUERICH, day: '2026-11-24', sunrise: '06:42', sunset: '15:41', dawn: '04:54', dusk: '17:30', moonrise: '15:05', moonset: '06:44' },
];

const FIVE_MINUTES = 5 * 60_000;
const utc = (day: string, time: string) => new Date(time.includes('T') ? `${time}:00Z` : `${day}T${time}:00Z`);
const startOf = (day: string) => new Date(`${day}T00:00:00Z`);

function expectNear(actual: Date | null, expected: Date): void {
  expect(actual).not.toBeNull();
  expect(Math.abs((actual as Date).getTime() - expected.getTime())).toBeLessThanOrEqual(FIVE_MINUTES);
}

describe('ephemeris against the almanac', () => {
  for (const f of FIXTURES) {
    it(`matches ${f.place} on ${f.day} within five minutes`, () => {
      const start = startOf(f.day);
      expectNear(riseSet('sun', f.at, 1, start, 1), utc(f.day, f.sunrise));
      expectNear(riseSet('sun', f.at, -1, start, 1), utc(f.day, f.sunset));
      expectNear(riseSet('moon', f.at, 1, start, 1), utc(f.day, f.moonrise));
      expectNear(riseSet('moon', f.at, -1, start, 1), utc(f.day, f.moonset));
      if (f.dawn && f.dusk) {
        expectNear(sunCrossing(f.at, 1, -18, start, 1), utc(f.day, f.dawn));
        expectNear(sunCrossing(f.at, -1, -18, start, 1), utc(f.day, f.dusk));
      } else {
        // High summer in Hamburg: the Sun never reaches −18°.
        expect(sunCrossing(f.at, -1, -18, start, 1)).toBeNull();
      }
    });
  }

  it('knows the nearly full Moon of 25 November 2026 (timeanddate: 99,6 %)', () => {
    expect(moonFraction(new Date('2026-11-24T23:24:00Z'))).toBeGreaterThan(0.98);
  });

  it('gives the altitude of the Sun and the Moon', () => {
    expect(altitude('sun', HAMBURG, new Date('2026-06-21T11:20:00Z'))).toBeCloseTo(90 - 53.55 + 23.44, 0);
    expect(altitude('moon', HAMBURG, new Date('2026-11-24T23:24:00Z'))).toBeGreaterThan(55);
  });
});

describe('positions in the local sky', () => {
  it('puts the Polarstern at the height of the latitude, in the north', () => {
    const p = skyAt(HAMBURG, new Date('2026-11-24T19:30:00Z'))({ ra: 37.9546, dec: 89.2641 });
    expect(Math.abs(p.alt - 53.55)).toBeLessThan(1);
    expect(Math.min(p.az, 360 - p.az)).toBeLessThan(2);
  });

  it('converts the galactic centre and the north galactic pole', () => {
    const centre = galacticToEquatorial(0, 0);
    expect(centre.ra).toBeCloseTo(266.4, 1);
    expect(centre.dec).toBeCloseTo(-28.94, 1);
    const pole = galacticToEquatorial(0, 90);
    expect(pole.ra).toBeCloseTo(192.86, 1);
    expect(pole.dec).toBeCloseTo(27.13, 1);
  });
});

describe('the planets on 26 November 2026 in Hamburg', () => {
  const at = (iso: string) => new Date(iso);

  it('puts Saturn about 37° high in the south at 20:00', () => {
    const s = bodyPosition('saturn', HAMBURG, at('2026-11-26T19:00:00Z'));
    expect(s.alt).toBeCloseTo(37, 0);
    expect(Math.abs(s.az - 170)).toBeLessThan(1);
    expect(magnitude('saturn', at('2026-11-26T19:00:00Z'))).toBeCloseTo(0.6, 0);
  });

  it('lets Jupiter and Mars rise late in the evening, about 4° apart', () => {
    const jupiter = riseSet('jupiter', HAMBURG, 1, at('2026-11-26T12:00:00Z'), 1) as Date;
    const mars = riseSet('mars', HAMBURG, 1, at('2026-11-26T12:00:00Z'), 1) as Date;
    expect(Math.abs(jupiter.getTime() - at('2026-11-26T21:33:00Z').getTime())).toBeLessThan(5 * 60_000);
    expect(Math.abs(mars.getTime() - at('2026-11-26T21:50:00Z').getTime())).toBeLessThan(5 * 60_000);
    const j = bodyPosition('jupiter', HAMBURG, at('2026-11-26T23:00:00Z'));
    const m = bodyPosition('mars', HAMBURG, at('2026-11-26T23:00:00Z'));
    expect(Math.hypot(j.alt - m.alt, (j.az - m.az) * Math.cos((j.alt * Math.PI) / 180))).toBeCloseTo(4, 0);
    expect(magnitude('jupiter', at('2026-11-26T23:00:00Z'))).toBeLessThan(-2);
  });

  it('shows Venus as the morning star, rising at about 4:20', () => {
    const venus = riseSet('venus', HAMBURG, 1, at('2026-11-26T12:00:00Z'), 1) as Date;
    expect(Math.abs(venus.getTime() - at('2026-11-27T03:20:00Z').getTime())).toBeLessThan(5 * 60_000);
    expect(magnitude('venus', at('2026-11-27T05:00:00Z'))).toBeLessThan(-4);
  });
});
