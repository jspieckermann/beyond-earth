import { moonLine } from './summary';
import { Night, NightPlace, eveningOf, nextNight, nightFor, spanMinutes, tonight } from './night';
import { clockTime, dateKey, roundToFive, spokenTime, zonedTime } from './time';

const HAMBURG: NightPlace = { lat: 53.55, lon: 9.99, tz: 'Europe/Berlin' };
const MUENCHEN: NightPlace = { lat: 48.14, lon: 11.58, tz: 'Europe/Berlin' };
const clock = (d: Date) => clockTime(d, 'Europe/Berlin');

const evening = (year: number, month: number, day: number) => ({ year, month, day });

describe('tonight', () => {
  it('runs from local noon to local noon; before noon it is still last night', () => {
    expect(eveningOf(new Date('2026-11-25T02:00:00Z'), 'Europe/Berlin')).toEqual(evening(2026, 11, 24));
    expect(eveningOf(new Date('2026-11-25T12:30:00Z'), 'Europe/Berlin')).toEqual(evening(2026, 11, 25));
    const night = tonight(HAMBURG, new Date('2026-11-25T02:00:00Z'));
    expect(night.window.start.toISOString()).toBe('2026-11-24T11:00:00.000Z');
    expect(night.window.end.toISOString()).toBe('2026-11-25T11:00:00.000Z');
  });

  it('finds local noon across a change of daylight saving time', () => {
    expect(zonedTime(evening(2026, 3, 29), 12, 0, 'Europe/Berlin').toISOString()).toBe('2026-03-29T10:00:00.000Z');
    expect(zonedTime(evening(2026, 10, 25), 12, 0, 'Europe/Berlin').toISOString()).toBe('2026-10-25T11:00:00.000Z');
  });

  it('has no dark span in Hamburg on 21 June', () => {
    const night = nightFor(HAMBURG, evening(2026, 6, 21));
    expect(night.sunset).not.toBeNull();
    expect(night.dark).toBeNull();
    expect(night.best).toBeNull();
  });

  it('has a short dark span around midnight in München on 21 June', () => {
    const night = nightFor(MUENCHEN, evening(2026, 6, 21)) as Night & { dark: NonNullable<Night['dark']> };
    expect(night.dark).not.toBeNull();
    expect(spanMinutes(night.dark)).toBeLessThan(120);
    expect(clock(night.dark.start)).toBe('0:40');
  });

  it('is outshone by the full Moon on 24 November in Hamburg', () => {
    const night = nightFor(HAMBURG, evening(2026, 11, 24));
    expect(night.dark).not.toBeNull();
    expect(night.moonFraction).toBeGreaterThan(0.95);
    expect(night.best).toBeNull();
  });

  it('keeps the evening dark until a late moonrise', () => {
    const night = nightFor(HAMBURG, evening(2026, 12, 1));
    const dark = night.dark as NonNullable<Night['dark']>;
    const best = night.best as NonNullable<Night['best']>;
    const rise = night.moonDisturbs.find((m) => m.start > dark.start) as NonNullable<Night['best']>;
    expect(best.start).toEqual(dark.start);
    expect(best.end).toEqual(rise.start);
  });

  it('looks for the next good night within 30 nights', () => {
    const next = nextNight(HAMBURG, evening(2026, 11, 24), (n) => n.best !== null);
    expect(next).not.toBeNull();
    expect(nextNight(HAMBURG, evening(2026, 6, 1), (n) => n.dark !== null)).toBeNull();
  });

  it('rounds times to five minutes', () => {
    expect(roundToFive(new Date('2026-11-24T17:17:31Z')).toISOString()).toBe('2026-11-24T17:20:00.000Z');
    expect(clock(new Date('2026-11-24T17:12:00Z'))).toBe('18:10');
    expect(spokenTime(new Date('2026-11-24T22:01:00Z'), 'Europe/Berlin')).toBe('23 Uhr');
    expect(dateKey(evening(2026, 3, 5))).toBe('2026-03-05');
  });
});

describe('twilight', () => {
  it('knows nautical twilight around the dark span', () => {
    const night = nightFor(HAMBURG, evening(2026, 11, 26));
    const n = night.nautical as NonNullable<Night['nautical']>;
    const d = night.dark as NonNullable<Night['dark']>;
    expect(n.start < d.start && d.end < n.end).toBe(true);
    expect(clock(n.start)).toBe('17:35');
    expect(clock(n.end)).toBe('6:40');
  });

  it('has nautical twilight but no dark span in Hamburg on 21 June', () => {
    const night = nightFor(HAMBURG, evening(2026, 6, 21));
    expect(night.dark).toBeNull();
    expect(night.nautical).not.toBeNull();
  });
});

describe('the moon line', () => {
  const line = (y: number, m: number, d: number, place = HAMBURG) => moonLine(nightFor(place, evening(y, m, d)), place.tz);

  it('names the new Moon', () => {
    expect(line(2026, 12, 9)).toBe('Der Mond ist neu. Er stört heute nicht.');
  });

  it('names the full Moon', () => {
    expect(line(2026, 11, 24)).toBe('Vollmond. Er überstrahlt die Milchstrasse die ganze Nacht.');
  });

  it('names a late moonrise', () => {
    expect(line(2026, 12, 1)).toMatch(/^Der Mond geht um \S+ Uhr auf\. Bis dahin ist es dunkel\.$/);
  });

  it('names a Moon that sets during the night', () => {
    expect(line(2026, 12, 18)).toMatch(/^Der Mond geht um \S+ Uhr unter\. Danach ist es dunkel\.$/);
  });

  it('names a thin crescent setting in the evening', () => {
    expect(line(2026, 12, 12)).toMatch(/^Eine schmale Sichel geht um \S+ Uhr unter\.$/);
  });

  it('names a thin crescent rising in the morning', () => {
    expect(line(2026, 12, 4)).toMatch(/^Eine schmale Sichel geht um \S+ Uhr auf\. Sie stört kaum\.$/);
  });

  it('speaks of a Moon the whole night that is not full', () => {
    expect(line(2026, 11, 26)).toBe('Der Mond steht die ganze Nacht am Himmel und überstrahlt das Band.');
  });
});
