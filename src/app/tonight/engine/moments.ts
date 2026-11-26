import { Night, spanMiddle } from './night';
import { localParts, zonedTime } from './time';

export type MomentId = 'abends' | 'mitternacht' | 'morgens';

/** One of the three times of the night the page can show. */
export interface Moment {
  readonly id: MomentId;
  /** „Abends“ */
  readonly name: string;
  readonly at: Date;
  /** „20 Uhr“ */
  readonly clock: string;
}

const HOUR = 3_600_000;
/** „Abends“ is never earlier than this local hour. */
export const EARLIEST_EVENING_HOUR = 20;
/** A moment still counts as "ahead" until this long after it. */
export const MOMENT_GRACE_MINUTES = 60;

/** The full local hour nearest to `date` (or the one before, with `down`). */
function toHour(date: Date, tz: string, down = false): Date {
  const p = localParts(date, tz);
  const intoHour = (p.minute * 60 + p.second) * 1000 + (date.getTime() % 1000);
  const start = date.getTime() - intoHour;
  return new Date(!down && p.minute >= 30 ? start + HOUR : start);
}

function clock(date: Date, tz: string): string {
  return `${localParts(date, tz).hour} Uhr`;
}

/**
 * The three moments of tonight: „Abends“ at the end of nautical twilight (not before 20:00), „Mitternacht“ halfway
 * between sunset and sunrise, „Morgens“ at the start of nautical twilight; all on the full hour. When the Sun does not
 * get 12° below the horizon (or the three would not follow each other), they lie two hours apart around the darkest moment.
 */
export function momentsFor(night: Night, tz: string): readonly Moment[] {
  const make = (evening: Date, middle: Date, morning: Date): Moment[] => [
    { id: 'abends', name: 'Abends', at: evening, clock: clock(evening, tz) },
    { id: 'mitternacht', name: 'Mitternacht', at: middle, clock: clock(middle, tz) },
    { id: 'morgens', name: 'Morgens', at: morning, clock: clock(morning, tz) },
  ];
  const around = () => {
    const d = toHour(night.darkest, tz);
    return make(new Date(d.getTime() - 2 * HOUR), d, new Date(d.getTime() + 2 * HOUR));
  };
  const n = night.nautical;
  if (!n || !night.sunset || !night.sunrise) {
    return around();
  }
  const earliest = zonedTime(night.evening, EARLIEST_EVENING_HOUR, 0, tz);
  const evening = toHour(n.start > earliest ? n.start : earliest, tz);
  const middle = toHour(spanMiddle({ start: night.sunset, end: night.sunrise }), tz);
  const morning = toHour(n.end, tz, true);
  return evening < middle && middle < morning ? make(evening, middle, morning) : around();
}

/** The first moment that is still ahead (or less than an hour past); after the last one, the last one. */
export function preselectedMoment(moments: readonly Moment[], now: Date): MomentId {
  const grace = MOMENT_GRACE_MINUTES * 60_000;
  return (moments.find((m) => m.at.getTime() + grace > now.getTime()) ?? moments[moments.length - 1]).id;
}
