import { DarknessLevel, StoredPlace, TonightInfo } from '../../core/models';
import { Moment, momentsFor, preselectedMoment } from './moments';
import { Night, NightPlace, Span, nextNight, tonight } from './night';
import { NightSky, SkyList, highlightFor, listFor, milkyWayTonight } from './visibility';
import { LocalDate, addDays, clockTime, dayAndMonth, daysBetween, spokenTime, weekday, zonedTime } from './time';

/** The names of the five darkness levels. */
export const DARKNESS_NAMES: Record<DarknessLevel, string> = {
  1: 'Mitten in der Stadt',
  2: 'Stadtrand, Vorort',
  3: 'Land, nahe einer Stadt',
  4: 'Auf dem Land',
  5: 'Sehr dunkel: Sternenpark, Gebirge, Insel',
};

/** What can be seen at each level. */
export const DARKNESS_SENTENCES: Record<DarknessLevel, string> = {
  1: 'Einige helle Sterne. Planeten und Mond gut.',
  2: 'Die Sternbilder. Vom Band höchstens eine Ahnung.',
  3: 'Das Band als blasser Schleier, hoch oben.',
  4: 'Das Band deutlich, von Horizont zu Horizont.',
  5: 'Das Band mit Struktur und dunklen Staubbändern.',
};

/** One line of the conditions: a bold part and the rest of the sentence. */
export interface ConditionLine {
  readonly value: string;
  readonly label: string;
  /** Shown highlighted, e.g. a disturbing Moon. */
  readonly warn?: boolean;
}

export interface Conditions {
  readonly dark: ConditionLine;
  readonly moon: ConditionLine;
}

const NEW_MOON = 0.03;
const FULL_MOON = 0.97;
const THIN = 0.25;

/** „fast voll“, „Halbmond“ … */
export function moonPhaseWord(fraction: number): string {
  if (fraction < NEW_MOON) {
    return 'Neumond';
  }
  if (fraction > FULL_MOON) {
    return 'Vollmond';
  }
  if (fraction > 0.6) {
    return 'fast voll';
  }
  return fraction > 0.4 ? 'Halbmond' : 'Sichel';
}

/** The part of the night the Moon is spoken about for: the dark span, else sunset to sunrise. */
function nightSpan(night: Night): Span {
  if (night.dark) {
    return night.dark;
  }
  return night.sunset && night.sunrise ? { start: night.sunset, end: night.sunrise } : night.window;
}

/** The two lines above the moments: „Dunkel ab 18:15 Uhr“ and „Mond 94 %, fast voll, ab 17:15 Uhr am Himmel“. */
export function conditionsFor(night: Night, tz: string, moonDisturbs: boolean): Conditions {
  const dark: ConditionLine = night.dark
    ? { value: `Dunkel ab ${clockTime(night.dark.start, tz)} Uhr`, label: '' }
    : { value: 'Nicht ganz dunkel', label: 'heute Nacht' };
  const f = night.moonFraction;
  const span = nightSpan(night);
  const up = night.moonUp.filter((m) => m.end > span.start && m.start < span.end);
  let when: string;
  if (f < NEW_MOON || up.length === 0) {
    when = 'heute Nacht nicht am Himmel';
  } else if (up[0].start > (night.sunset ?? night.window.start)) {
    when = `ab ${clockTime(up[0].start, tz)} Uhr am Himmel`;
  } else {
    when = up[0].end < span.end ? `bis ${clockTime(up[0].end, tz)} Uhr am Himmel` : 'die ganze Nacht am Himmel';
  }
  return { dark, moon: { value: `Mond ${Math.round(f * 100)} %`, label: `${moonPhaseWord(f)}, ${when}`, warn: moonDisturbs } };
}

/** „Um 20 Uhr siehst du 6 Dinge mit blossem Auge.“ with one clause for the main condition. */
export function summarySentence(list: SkyList, moment: Moment, night: Night, darkness: DarknessLevel): string {
  const n = list.visible.length;
  if (n === 0) {
    return 'Zu dieser Zeit ist von hier kaum etwas zu sehen.';
  }
  const count = `Um ${moment.clock} siehst du ${n === 1 ? 'ein Ding' : `${n} Dinge`} mit blossem Auge.`;
  if (!night.dark) {
    return `${count} Ganz dunkel wird es hier heute nicht, Mond, Planeten und die hellsten Sterne siehst du trotzdem.`;
  }
  if (list.moonDisturbs) {
    return `${count} Der helle Mond schluckt heute alles Blasse, Planeten und helle Sterne strahlen trotzdem.`;
  }
  if (list.visible.some((v) => v.id === 'milchstrasse')) {
    return `${count} Heute ist eine Nacht für die Milchstrasse.`;
  }
  return darkness < 3 ? `${count} Für die Milchstrasse ist dein Ort zu hell.` : count;
}

/** „morgen“, „am Dienstag“, „am 3. Dezember“ */
function when(from: LocalDate, to: LocalDate): string {
  const days = daysBetween(from, to);
  if (days === 1) {
    return 'morgen';
  }
  return days <= 6 ? `am ${weekday(to)}` : `am ${dayAndMonth(to)}`;
}

/** The next night with a best time (dark, without a disturbing Moon, at least an hour). */
export function nextMilkyWayNight(place: NightPlace, night: Night): Night | null {
  return nextNight(place, night.evening, (n) => n.best !== null);
}

/** Why the next good night is good, in one sentence. */
function why(next: Night, tz: string): string {
  const { dark, best } = next;
  if (!dark || !best) {
    return '';
  }
  if (best.end < dark.end) {
    const midnight = zonedTime(addDays(next.evening, 1), 0, 0, tz);
    return best.end >= midnight ? 'Dann geht der Mond erst nach Mitternacht auf.' : `Dann geht der Mond erst um ${spokenTime(best.end, tz)} auf.`;
  }
  if (best.start > dark.start) {
    return `Dann ist der Mond um ${spokenTime(best.start, tz)} untergegangen.`;
  }
  return 'Dann stört der Mond nicht.';
}

/** The note about the Milky Way's next good night, or `null` when it can be seen tonight. */
export function milkyWayNote(place: NightPlace, night: Night, darkness: DarknessLevel, visibleTonight: boolean): string | null {
  if (visibleTonight) {
    return null;
  }
  const brighter = darkness < 3 ? ' Fahr dafür aus der Stadt raus: Ab Dunkelheit 3 siehst du das Band.' : '';
  const next = nextMilkyWayNight(place, night);
  if (!next || !next.best) {
    return `In den nächsten 30 Nächten gibt es hier keine gute Nacht für die Milchstrasse.${brighter}`;
  }
  const tz = place.tz;
  const date = `${weekday(next.evening)}, ${dayAndMonth(next.evening)}, ${clockTime(next.best.start, tz)} bis ${clockTime(next.best.end, tz)} Uhr.`;
  return `${date} ${why(next, tz)}${brighter}`;
}

/** One sentence about what the Moon does tonight, for the home card. */
export function moonLine(night: Night, tz: string): string {
  const f = night.moonFraction;
  if (f < NEW_MOON) {
    return 'Der Mond ist neu. Er stört heute nicht.';
  }
  const span = nightSpan(night);
  const up = night.moonUp.filter((m) => m.end > span.start && m.start < span.end);
  if (up.length === 0) {
    return 'Der Mond steht in der Nacht nicht am Himmel. Er stört heute nicht.';
  }
  const first = up[0];
  const risesDuring = first.start > span.start;
  const setsDuring = first.end < span.end;
  const dark = !!night.dark;
  if (!risesDuring && !setsDuring) {
    if (f > FULL_MOON) {
      return 'Vollmond. Er überstrahlt die Milchstrasse die ganze Nacht.';
    }
    return f > THIN ? 'Der Mond steht die ganze Nacht am Himmel und überstrahlt das Band.' : 'Eine schmale Sichel steht die ganze Nacht am Himmel. Sie stört kaum.';
  }
  if (!risesDuring) {
    const t = spokenTime(first.end, tz);
    if (f <= THIN) {
      return `Eine schmale Sichel geht um ${t} unter.`;
    }
    return dark ? `Der Mond geht um ${t} unter. Danach ist es dunkel.` : `Der Mond geht um ${t} unter. Danach stört er nicht mehr.`;
  }
  const t = spokenTime(first.start, tz);
  if (f <= THIN) {
    return `Eine schmale Sichel geht um ${t} auf. Sie stört kaum.`;
  }
  return dark ? `Der Mond geht um ${t} auf. Bis dahin ist es dunkel.` : `Der Mond geht um ${t} auf. Bis dahin stört er nicht.`;
}

/**
 * Tonight in a few lines for the home-screen card, with the same rules as the page.
 * Loaded with a dynamic import, so the astronomy library stays out of the home chunk.
 */
export function summarize(place: StoredPlace, darkness: DarknessLevel, now: Date): TonightInfo {
  const night = tonight(place, now);
  const sky = new NightSky(place, night, darkness);
  const moments = momentsFor(night, place.tz);
  const moment = moments.find((m) => m.id === preselectedMoment(moments, now)) as Moment;
  const count = listFor(sky, moment).visible.length;
  const highlight = highlightFor(sky, moments, moment);
  const things = count === 1 ? 'Ein Ding' : `${count} Dinge`;
  const example = highlight ? `, zum Beispiel ${highlight.name}${highlight.direction ? ` im ${highlight.direction}` : ''}` : '';
  const mwTonight = milkyWayTonight(sky, moments);
  const next = mwTonight ? null : nextMilkyWayNight(place, night);
  return {
    location: place.name,
    darkness,
    headline: count ? `${things} mit blossem Auge${example}.` : 'Heute ist von hier kaum etwas zu sehen.',
    darkFrom: night.dark ? `Dunkel ab ${spokenTime(night.dark.start, place.tz)}` : 'Heute wird es nicht ganz dunkel',
    moon: moonLine(night, place.tz),
    milkyWayNext: mwTonight
      ? undefined
      : next
        ? `Die Milchstrasse: wieder ${when(night.evening, next.evening)}.`
        : 'Die Milchstrasse: in den nächsten 30 Nächten nicht.',
  };
}
