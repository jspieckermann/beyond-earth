/** Local dates and times in a place's IANA time zone, without a date library. */

export interface LocalDate {
  readonly year: number;
  /** 1–12 */
  readonly month: number;
  readonly day: number;
}

interface LocalParts extends LocalDate {
  readonly hour: number;
  readonly minute: number;
}

const partsFormats = new Map<string, Intl.DateTimeFormat>();

function partsFormat(tz: string): Intl.DateTimeFormat {
  let f = partsFormats.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    partsFormats.set(tz, f);
  }
  return f;
}

export function localParts(date: Date, tz: string): LocalParts & { second: number } {
  const map: Record<string, number> = {};
  for (const part of partsFormat(tz).formatToParts(date)) {
    if (part.type !== 'literal') {
      map[part.type] = Number(part.value);
    }
  }
  return { year: map['year'], month: map['month'], day: map['day'], hour: map['hour'] % 24, minute: map['minute'], second: map['second'] };
}

/** Minutes the zone is ahead of UTC at `date`. */
function offsetMinutes(date: Date, tz: string): number {
  const p = localParts(date, tz);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60_000);
}

/** The instant of a local wall-clock time in the zone. */
export function zonedTime(d: LocalDate, hour: number, minute: number, tz: string): Date {
  const guess = Date.UTC(d.year, d.month - 1, d.day, hour, minute);
  let result = new Date(guess - offsetMinutes(new Date(guess), tz) * 60_000);
  // A second pass settles instants near a change of daylight saving time.
  result = new Date(guess - offsetMinutes(result, tz) * 60_000);
  return result;
}

export function addDays(d: LocalDate, days: number): LocalDate {
  const t = new Date(Date.UTC(d.year, d.month - 1, d.day + days));
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() };
}

export function localDate(date: Date, tz: string): LocalDate {
  const p = localParts(date, tz);
  return { year: p.year, month: p.month, day: p.day };
}

/** Days from `a` to `b`. */
export function daysBetween(a: LocalDate, b: LocalDate): number {
  return Math.round((Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / 86_400_000);
}

/** "2026-11-24" */
export function dateKey(d: LocalDate): string {
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
}

/** Rounded to the nearest five minutes. */
export function roundToFive(date: Date): Date {
  const five = 5 * 60_000;
  return new Date(Math.round(date.getTime() / five) * five);
}

/** "18:15", rounded to five minutes, in the zone. */
export function clockTime(date: Date, tz: string): string {
  const p = localParts(roundToFive(date), tz);
  return `${p.hour}:${String(p.minute).padStart(2, '0')}`;
}

/** "23 Uhr" on the hour, otherwise "23:05 Uhr". */
export function spokenTime(date: Date, tz: string): string {
  const p = localParts(roundToFive(date), tz);
  return p.minute === 0 ? `${p.hour} Uhr` : `${p.hour}:${String(p.minute).padStart(2, '0')} Uhr`;
}

/** Hours since local midnight, 0–24, rounded to five minutes. */
export function localHour(date: Date, tz: string): number {
  const p = localParts(roundToFive(date), tz);
  return p.hour + p.minute / 60;
}

const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

export function weekday(d: LocalDate): string {
  return WEEKDAYS[new Date(Date.UTC(d.year, d.month - 1, d.day)).getUTCDay()];
}

/** "24. November" */
export function dayAndMonth(d: LocalDate): string {
  return `${d.day}. ${MONTHS[d.month - 1]}`;
}
