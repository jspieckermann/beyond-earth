import { star } from '../data/stars';
import { bandSamples } from './band';
import {
  azimuthOffset,
  bandNearZenith,
  compass,
  fistWords,
  fists,
  heightWords,
  positionWords,
  relativeStep,
  sectorScores,
  separation,
  wholeFists,
} from './directions';
import { skyAt } from './ephemeris';
import { NightPlace, nightFor } from './night';
import { compassRouteFor, fillRoute, meetingPoint, planFor, startTime } from './routes';
import { addDays } from './time';

const HAMBURG: NightPlace = { lat: 53.55, lon: 9.99, tz: 'Europe/Berlin' };
/** 24 November 2026, 20:30 in Hamburg. */
const NOV_EVENING = new Date('2026-11-24T19:30:00Z');

describe('fists', () => {
  it('rounds to half fists and says them in words', () => {
    expect(fists(31)).toBe(3);
    expect(fists(34)).toBe(3.5);
    expect(fistWords(1)).toBe('eine Faust');
    expect(fistWords(1.5)).toBe('gut eine Faust');
    expect(fistWords(3)).toBe('drei Fäuste');
    expect(fistWords(3.5)).toBe('gut drei Fäuste');
    expect(fistWords(9)).toBe('neun Fäuste');
    expect(fistWords(0.5)).toBe('eine halbe Faust');
    expect(heightWords(2)).toBe('knapp über dem Horizont');
  });

  it('describes a step from star to star', () => {
    expect(relativeStep({ alt: 30, az: 290 }, { alt: 50, az: 280 })).toBe('zwei Fäuste höher, etwas nach links');
    expect(relativeStep({ alt: 50, az: 280 }, { alt: 30, az: 320 })).toBe('zwei Fäuste tiefer, nach rechts');
    expect(relativeStep({ alt: 30, az: 100 }, { alt: 50, az: 101 })).toBe('zwei Fäuste höher, fast genau darüber');
    expect(relativeStep({ alt: 30, az: 100 }, { alt: 30, az: 101 })).toBe('gleich daneben');
  });

  it('says positions in whole fists and measures distances', () => {
    expect(wholeFists(37)).toBe('Vier Fäuste');
    expect(wholeFists(12)).toBe('Eine Faust');
    expect(wholeFists(3)).toBe('Eine Faust');
    expect(positionWords({ alt: 37, az: 170 })).toBe('Süden · Vier Fäuste hoch');
    expect(positionWords({ alt: 80, az: 40 })).toBe('Fast genau über dir');
    expect(separation({ alt: 10, az: 80 }, { alt: 14, az: 80 })).toBeCloseTo(4, 5);
    expect(separation({ alt: 0, az: 350 }, { alt: 0, az: 10 })).toBeCloseTo(20, 5);
    expect(azimuthOffset(10, 350)).toBe(20);
  });
});

describe('a November evening in Hamburg', () => {
  const sky = skyAt(HAMBURG, NOV_EVENING);

  it('sees Wega about three fists and Deneb about five fists high in the west', () => {
    expect(fists(sky(star('wega')).alt)).toBeCloseTo(3, 0);
    expect(Math.abs(fists(sky(star('deneb')).alt) - 5)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(azimuthOffset(sky(star('wega')).az, compass('W').az))).toBeLessThanOrEqual(45);
  });

  it('has the band overhead and offers „Über dir“ and the west or north-east', () => {
    const samples = bandSamples(sky);
    expect(bandNearZenith(samples)).toBe(true);
    const scores = sectorScores(samples);
    expect(Math.max(scores.get('W') ?? 0, scores.get('NO') ?? 0)).toBeGreaterThan(0);
    const night = nightFor(HAMBURG, { year: 2026, month: 12, day: 9 });
    const plan = planFor(HAMBURG, night);
    const ids = plan.offers.map((o) => o.id);
    expect(ids).toContain('zenit');
    expect(ids.some((id) => id === 'W' || id === 'NO' || id === 'NW')).toBe(true);
  });

  it('meets at the W of Kassiopeia', () => {
    expect(meetingPoint(sky)).toMatchObject({ figure: 'kassiopeia', overhead: true });
  });

  it('leads from Wega over the Schwan to Kassiopeia in the west', () => {
    const route = compassRouteFor('W', sky);
    expect(route?.id).toBe('schwan');
    const plan = { start: NOV_EVENING, meeting: meetingPoint(sky), offers: [{ id: 'W' as const, name: 'Westen', route: route! }] };
    const filled = fillRoute(plan.offers[0], { ...plan, offers: [...plan.offers, { id: 'zenit', name: 'Über dir', route: route! }] }, sky, '20:30');
    const [one, two, three] = filled.steps!;
    expect(one.title).toBe('Dreh dich nach Westen.');
    expect(one.text).toMatch(/drei Fäuste hoch, ist Wega\.$/);
    expect(two.text).toContain('den Schwan, mit Deneb an der Spitze');
    expect(three.title).toBe('Folge dem Band nach oben.');
    expect(three.text).toContain('das W der Kassiopeia');
    expect(three.text).toContain('Weiter geht es unter „Über dir“.');
  });

  it('leads over Kapella and the Perseus to the same meeting point in the north-east', () => {
    const route = compassRouteFor('NO', sky);
    expect(route?.id).toBe('perseus-kapella');
    const meeting = meetingPoint(sky);
    const filled = fillRoute({ id: 'NO', name: 'Nordosten', route: route! }, { start: NOV_EVENING, meeting, offers: [] }, sky, '20:30');
    expect(filled.steps![0].text).toContain('Kapella');
    expect(filled.steps![2].text).toMatch(/^(Fast genau|Hoch) über dir steht das W der Kassiopeia.$/);
  });

  it('replaces the steps when a star has set', () => {
    const late = skyAt(HAMBURG, new Date('2026-11-25T03:00:00Z'));
    const route = compassRouteFor('W', sky)!;
    const filled = fillRoute({ id: 'W', name: 'Westen', route }, { start: NOV_EVENING, meeting: meetingPoint(sky), offers: [] }, late, '4:00');
    expect(filled.steps).toBeNull();
    expect(filled.tooLow).toMatch(/^Um 4:00 Uhr steht (Wega|Deneb) zu tief\./);
  });

  it('starts „Über dir“ at the meeting point', () => {
    const night = nightFor(HAMBURG, { year: 2026, month: 12, day: 9 });
    const plan = planFor(HAMBURG, night);
    const zenith = plan.offers.find((o) => o.id === 'zenit')!;
    expect(zenith.route.kind).toBe('zenith');
    expect(zenith.route.kind === 'zenith' && zenith.route.figure).toBe(plan.meeting.figure);
    const filled = fillRoute(zenith, plan, skyAt(HAMBURG, plan.start), '21:00');
    expect(filled.steps).toHaveLength(3);
    expect(filled.steps![1].text).toMatch(/^Richtung \S+ zu/);
  });
});

describe('year-round coverage', () => {
  for (const lat of [45, 50, 56]) {
    it(`offers a route every night at ${lat}° North`, () => {
      const place: NightPlace = { lat, lon: 10, tz: 'Europe/Berlin' };
      const missing: string[] = [];
      let evening = { year: 2026, month: 1, day: 1 };
      for (let i = 0; i < 365; i++, evening = addDays(evening, 1)) {
        const plan = planFor(place, nightFor(place, evening));
        if (!plan.offers.some((o) => o.id !== 'zenit')) {
          missing.push(`${evening.month}-${evening.day} ${startTime(nightFor(place, evening)).toISOString()}`);
        }
      }
      expect(missing).toEqual([]);
    });
  }
});
