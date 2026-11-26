import { momentsFor, preselectedMoment } from './moments';
import { NightPlace, nightFor } from './night';
import { localParts } from './time';

const HAMBURG: NightPlace = { lat: 53.55, lon: 9.99, tz: 'Europe/Berlin' };
const MUENCHEN: NightPlace = { lat: 48.14, lon: 11.58, tz: 'Europe/Berlin' };
const evening = (year: number, month: number, day: number) => ({ year, month, day });
const hour = (d: Date) => localParts(d, 'Europe/Berlin').hour;

describe('the three moments', () => {
  it('are 20, 0 and 6 Uhr in Hamburg at the end of November', () => {
    const m = momentsFor(nightFor(HAMBURG, evening(2026, 11, 26)), HAMBURG.tz);
    expect(m.map((x) => x.id)).toEqual(['abends', 'mitternacht', 'morgens']);
    expect(m.map((x) => x.name)).toEqual(['Abends', 'Mitternacht', 'Morgens']);
    expect(m.map((x) => x.clock)).toEqual(['20 Uhr', '0 Uhr', '6 Uhr']);
    expect(m.every((x) => localParts(x.at, HAMBURG.tz).minute === 0)).toBe(true);
  });

  it('move later in summer, when nautical twilight ends late', () => {
    const m = momentsFor(nightFor(MUENCHEN, evening(2026, 6, 21)), MUENCHEN.tz);
    expect(hour(m[0].at)).toBeGreaterThanOrEqual(22);
    expect(m[0].at < m[1].at && m[1].at < m[2].at).toBe(true);
  });

  it('lie around the darkest moment when the Sun never gets 12° low', () => {
    const night = nightFor({ lat: 56, lon: 10, tz: 'Europe/Berlin' }, evening(2026, 6, 21));
    expect(night.nautical).toBeNull();
    const m = momentsFor(night, 'Europe/Berlin');
    expect(m[1].at.getTime() - m[0].at.getTime()).toBe(2 * 3_600_000);
    expect(m[2].at.getTime() - m[1].at.getTime()).toBe(2 * 3_600_000);
  });
});

describe('the preselected moment', () => {
  const m = momentsFor(nightFor(HAMBURG, evening(2026, 11, 26)), HAMBURG.tz);

  it('is „Abends“ during the day and shortly after 20 Uhr', () => {
    expect(preselectedMoment(m, new Date('2026-11-26T13:00:00Z'))).toBe('abends');
    expect(preselectedMoment(m, new Date('2026-11-26T19:30:00Z'))).toBe('abends');
  });

  it('moves on to the next moment an hour after one has passed', () => {
    expect(preselectedMoment(m, new Date('2026-11-26T20:30:00Z'))).toBe('mitternacht');
    expect(preselectedMoment(m, new Date('2026-11-27T02:00:00Z'))).toBe('morgens');
  });

  it('stays at „Morgens“ after the last moment', () => {
    expect(preselectedMoment(m, new Date('2026-11-27T09:00:00Z'))).toBe('morgens');
  });
});
