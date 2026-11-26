import { StoredPlace } from '../../core/models';
import { Moment, momentsFor } from './moments';
import { NightPlace, nightFor } from './night';
import { conditionsFor, milkyWayNote, moonPhaseWord, summarize, summarySentence } from './summary';
import { NightSky, listFor } from './visibility';

const HAMBURG: StoredPlace = { name: 'Hamburg', region: 'Hamburg', lat: 53.55, lon: 9.99, tz: 'Europe/Berlin', source: 'list' };
const evening = (year: number, month: number, day: number) => ({ year, month, day });

function at(place: NightPlace, day: ReturnType<typeof evening>, darkness: 1 | 2 | 3 | 4 | 5, id: Moment['id'] = 'abends') {
  const night = nightFor(place, day);
  const sky = new NightSky(place, night, darkness);
  const moment = momentsFor(night, place.tz).find((m) => m.id === id) as Moment;
  return { night, list: listFor(sky, moment), moment };
}

describe('the conditions', () => {
  it('show when it is dark and a disturbing Moon', () => {
    const { night, list } = at(HAMBURG, evening(2026, 11, 26), 2);
    const c = conditionsFor(night, HAMBURG.tz, list.moonDisturbs);
    expect(c.dark).toEqual({ value: 'Dunkel ab 18:15 Uhr', label: '' });
    expect(c.moon.value).toMatch(/^Mond 9\d %$/);
    expect(c.moon.label).toBe('fast voll, ab 17:20 Uhr am Himmel');
    expect(c.moon.warn).toBe(true);
  });

  it('say when it does not get dark', () => {
    const { night } = at(HAMBURG, evening(2026, 6, 21), 2);
    expect(conditionsFor(night, HAMBURG.tz, false).dark).toEqual({ value: 'Nicht ganz dunkel', label: 'heute Nacht' });
  });

  it('name the phases', () => {
    expect(moonPhaseWord(0.01)).toBe('Neumond');
    expect(moonPhaseWord(0.2)).toBe('Sichel');
    expect(moonPhaseWord(0.5)).toBe('Halbmond');
    expect(moonPhaseWord(0.8)).toBe('fast voll');
    expect(moonPhaseWord(0.99)).toBe('Vollmond');
  });
});

describe('the summary sentence', () => {
  it('names the count and the bright Moon', () => {
    const { night, list, moment } = at(HAMBURG, evening(2026, 11, 26), 2);
    expect(summarySentence(list, moment, night, 2)).toBe(
      `Um 20 Uhr siehst du ${list.visible.length} Dinge mit blossem Auge. Der helle Mond schluckt heute alles Blasse, Planeten und helle Sterne strahlen trotzdem.`,
    );
  });

  it('calls a moonless dark night a night for the Milky Way', () => {
    const { night, list, moment } = at(HAMBURG, evening(2026, 12, 9), 4);
    expect(summarySentence(list, moment, night, 4)).toMatch(/Heute ist eine Nacht für die Milchstrasse\.$/);
  });

  it('says the place is too bright for the Milky Way', () => {
    const { night, list, moment } = at(HAMBURG, evening(2026, 12, 9), 2);
    expect(summarySentence(list, moment, night, 2)).toMatch(/Für die Milchstrasse ist dein Ort zu hell\.$/);
  });

  it('speaks of a summer night that does not get dark', () => {
    const { night, list, moment } = at(HAMBURG, evening(2026, 6, 21), 2, 'mitternacht');
    expect(summarySentence(list, moment, night, 2)).toMatch(/Ganz dunkel wird es hier heute nicht/);
  });

  it('says when hardly anything can be seen', () => {
    const { night, list, moment } = at(HAMBURG, evening(2026, 11, 26), 2);
    expect(summarySentence({ ...list, visible: [] }, moment, night, 2)).toBe('Zu dieser Zeit ist von hier kaum etwas zu sehen.');
  });
});

describe('the Milky Way note', () => {
  it('names Saturday, 28 November, when the Moon rises only at 20:20', () => {
    const night = nightFor(HAMBURG, evening(2026, 11, 26));
    expect(milkyWayNote(HAMBURG, night, 4, false)).toBe('Samstag, 28. November, 18:15 bis 20:20 Uhr. Dann geht der Mond erst um 20:20 Uhr auf.');
    expect(milkyWayNote(HAMBURG, night, 2, false)).toMatch(/Ab Dunkelheit 3 siehst du das Band\.$/);
    expect(milkyWayNote(HAMBURG, night, 4, true)).toBeNull();
  });

  it('says after midnight when the Moon rises after midnight', () => {
    const night = nightFor(HAMBURG, evening(2026, 11, 30));
    expect(milkyWayNote(HAMBURG, night, 4, false)).toMatch(/^Dienstag, 1\. Dezember, .* Dann geht der Mond erst nach Mitternacht auf\.$/);
  });
});

describe('the home card', () => {
  it('names the count, Saturn in the south, darkness and the Milky Way next on 26 November', () => {
    const info = summarize(HAMBURG, 2, new Date('2026-11-26T15:00:00Z'));
    expect(info.location).toBe('Hamburg');
    expect(info.darkness).toBe(2);
    expect(info.headline).toMatch(/^\d+ Dinge mit blossem Auge, zum Beispiel Saturn im Süden\.$/);
    expect(info.darkFrom).toBe('Dunkel ab 18:15 Uhr');
    expect(info.milkyWayNext).toBe('Die Milchstrasse: wieder am Samstag.');
    expect(info.moon).toBeTruthy();
  });

  it('makes the Milky Way the highlight on a moonless night at level 4', () => {
    const info = summarize(HAMBURG, 4, new Date('2026-12-09T15:00:00Z'));
    expect(info.headline).toMatch(/zum Beispiel die Milchstrasse\.$/);
    expect(info.milkyWayNext).toBeUndefined();
  });
});
