import { GeoPoint, altitude, moonFraction, riseSet, sunCrossing } from './ephemeris';
import { LocalDate, addDays, dateKey, localParts, zonedTime } from './time';

/** A place as the engine needs it. */
export interface NightPlace extends GeoPoint {
  /** IANA time zone. */
  readonly tz: string;
}

export interface Span {
  readonly start: Date;
  readonly end: Date;
}

/** The Sun's altitude below which it is dark. */
export const DARK_SUN_ALTITUDE = -18;
/** End and start of nautical twilight: the bright stars are out. */
export const NAUTICAL_SUN_ALTITUDE = -12;
/** The Moon disturbs while more than this fraction of its disc is lit. */
export const DISTURBING_MOON_FRACTION = 0.25;
/** A best time must be at least this long. */
export const MIN_BEST_MINUTES = 60;
/** How far "the next good night" looks ahead. */
export const LOOKAHEAD_NIGHTS = 30;

/** Tonight from local noon to the next local noon, with twilight, darkness and the Moon. */
export interface Night {
  /** The local date of the evening the night begins on. */
  readonly evening: LocalDate;
  readonly window: Span;
  /** `null` when the Sun does not set in the window. */
  readonly sunset: Date | null;
  readonly sunrise: Date | null;
  /** Sun 18° below the horizon, or `null` when it never gets that low. */
  readonly dark: Span | null;
  /** Sun 12° below the horizon, or `null` when it never gets that low. */
  readonly nautical: Span | null;
  /** The Moon above the horizon, within the window. */
  readonly moonUp: readonly Span[];
  /** The Moon above the horizon and more than a quarter lit. */
  readonly moonDisturbs: readonly Span[];
  /** Lit fraction of the Moon in the middle of the night. */
  readonly moonFraction: number;
  /** The longest dark span without a disturbing Moon, at least an hour; `null` if there is none. */
  readonly best: Span | null;
  /** The middle of the dark span, or of the night when it does not get dark. */
  readonly darkest: Date;
}

const MINUTE = 60_000;

/** The evening tonight begins on: before local noon it is still last night. */
export function eveningOf(now: Date, tz: string): LocalDate {
  const p = localParts(now, tz);
  const today = { year: p.year, month: p.month, day: p.day };
  return p.hour < 12 ? addDays(today, -1) : today;
}

const middle = (s: Span) => new Date((s.start.getTime() + s.end.getTime()) / 2);
const minutes = (s: Span) => (s.end.getTime() - s.start.getTime()) / MINUTE;
const before = (a: Date | null, limit: Date): Date | null => (a && a < limit ? a : null);

function moonSpans(p: GeoPoint, window: Span): Span[] {
  const spans: Span[] = [];
  let t = window.start;
  for (let guard = 0; guard < 4 && t < window.end; guard++) {
    const rise = riseSet('moon', p, 1, t, 1.5);
    const set = riseSet('moon', p, -1, t, 1.5);
    if (set && (!rise || set < rise)) {
      // Up now: the span runs until it sets.
      spans.push({ start: t, end: set < window.end ? set : window.end });
      t = new Date(set.getTime() + MINUTE);
    } else if (rise && rise < window.end) {
      const after = riseSet('moon', p, -1, rise, 1.5);
      const end = after && after < window.end ? after : window.end;
      spans.push({ start: rise, end });
      t = new Date(end.getTime() + MINUTE);
    } else {
      break;
    }
  }
  return spans.filter((s) => s.end > s.start);
}

/** `span` without the parts covered by `cuts`. */
function subtract(span: Span, cuts: readonly Span[]): Span[] {
  let pieces: Span[] = [span];
  for (const cut of cuts) {
    pieces = pieces.flatMap((s) => {
      if (cut.end <= s.start || cut.start >= s.end) {
        return [s];
      }
      const out: Span[] = [];
      if (cut.start > s.start) {
        out.push({ start: s.start, end: cut.start });
      }
      if (cut.end < s.end) {
        out.push({ start: cut.end, end: s.end });
      }
      return out;
    });
  }
  return pieces;
}

/** The part of the window in which the Sun is below `limit`, or `null`. */
function belowSun(place: GeoPoint, window: Span, limit: number): Span | null {
  const dusk = before(sunCrossing(place, -1, limit, window.start, 1), window.end);
  if (dusk) {
    const dawn = sunCrossing(place, 1, limit, dusk, 1);
    return { start: dusk, end: dawn && dawn < window.end ? dawn : window.end };
  }
  return altitude('sun', place, window.start) < limit ? window : null;
}

const cache = new Map<string, Night>();

/** The night beginning on the evening of `evening` at the place. Results are kept in memory. */
export function nightFor(place: NightPlace, evening: LocalDate): Night {
  const key = `${place.lat},${place.lon},${place.tz},${dateKey(evening)}`;
  const known = cache.get(key);
  if (known) {
    return known;
  }
  const window = { start: zonedTime(evening, 12, 0, place.tz), end: zonedTime(addDays(evening, 1), 12, 0, place.tz) };
  const sunset = before(riseSet('sun', place, -1, window.start, 1), window.end);
  const sunrise = sunset ? before(riseSet('sun', place, 1, sunset, 1), window.end) : null;

  const dark = belowSun(place, window, DARK_SUN_ALTITUDE);
  const nautical = belowSun(place, window, NAUTICAL_SUN_ALTITUDE);

  const darkest = dark ? middle(dark) : sunset && sunrise ? middle({ start: sunset, end: sunrise }) : middle(window);
  const moonUp = moonSpans(place, window);
  const moonDisturbs = moonUp.filter((s) => moonFraction(middle(s)) > DISTURBING_MOON_FRACTION);
  const free = dark ? subtract(dark, moonDisturbs) : [];
  const longest = free.reduce<Span | null>((a, s) => (!a || minutes(s) > minutes(a) ? s : a), null);
  const best = longest && minutes(longest) >= MIN_BEST_MINUTES ? longest : null;

  const night: Night = { evening, window, sunset, sunrise, dark, nautical, moonUp, moonDisturbs, moonFraction: moonFraction(darkest), best, darkest };
  cache.set(key, night);
  return night;
}

/** Tonight at the place, for the given "now". */
export function tonight(place: NightPlace, now: Date): Night {
  return nightFor(place, eveningOf(now, place.tz));
}

/** The first of the next 30 nights after `evening` for which `test` holds, or `null`. */
export function nextNight(place: NightPlace, evening: LocalDate, test: (n: Night) => boolean): Night | null {
  for (let i = 1; i <= LOOKAHEAD_NIGHTS; i++) {
    const night = nightFor(place, addDays(evening, i));
    if (test(night)) {
      return night;
    }
  }
  return null;
}

/** Spans of the dark span (or of the whole night) during which the Moon disturbs. */
export function disturbedWithin(night: Night, span: Span): Span[] {
  return night.moonDisturbs
    .map((m) => ({ start: m.start > span.start ? m.start : span.start, end: m.end < span.end ? m.end : span.end }))
    .filter((s) => s.end > s.start);
}

export { middle as spanMiddle, minutes as spanMinutes };
