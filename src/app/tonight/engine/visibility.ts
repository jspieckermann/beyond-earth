import { DarknessLevel } from '../../core/models';
import { EASE_ORDER, EASE_WORDS, Ease, ObjectId, OBJECTS, SkyObject, StepContext, Drawing } from '../data/objects';
import { EYE_VIEWS, EyeKey, EyeView, PictureId, THUMBS } from '../data/pictures';
import { SKY_POINTS, StarId, star } from '../data/stars';
import { bandSamples } from './band';
import {
  OVERHEAD_ALTITUDE,
  compassWord,
  fistWords,
  fists,
  positionWords,
  relativeStep,
  separation,
  wholeFists,
} from './directions';
import { SkyPosition, altitude, bodyPosition, magnitude, moonFraction, skyAt } from './ephemeris';
import { Moment } from './moments';
import { Night, NightPlace } from './night';
import { hasRoutes } from './region';
import { BAND_FALLBACK, milkyWaySteps } from './routes';
import { spokenTime } from './time';

/** An object counts as visible from this altitude on. */
export const MIN_ALTITUDE = 10;
/** Two planets closer than this share one card. */
export const PAIR_DISTANCE = 5;
/** The Moon disturbs faint objects while more than this fraction is lit. */
export const MOON_DISTURBS = 0.25;
/** Band samples count for the Milky Way's position from this altitude on. */
const BAND_ALTITUDE = 15;
const STEP_MINUTES = 10;
const MINUTE = 60_000;

/** Why an object is not visible, in the order the reasons are checked. */
export type Reason = 'ort' | 'mond' | 'daemmerung' | 'aufgang' | 'untergang' | 'tief';

export type Evaluation =
  | { readonly visible: true; readonly position: SkyPosition }
  | { readonly visible: false; readonly reason: Reason; readonly position: SkyPosition | null };

/** What a card shows. */
export interface ObjectView {
  /** An object id, or two joined by „+“ for planets sharing a card. */
  readonly id: string;
  readonly name: string;
  readonly kind: string;
  readonly ease: Ease;
  readonly easeWord: string;
  /** „Süden · Vier Fäuste hoch“ */
  readonly position: string;
  readonly eye: string;
  /** `null` outside Central Europe. */
  readonly steps: readonly string[] | null;
  /** „die ganze Nacht“, „bis 2:40 Uhr“ */
  readonly span: string;
  readonly eyeView: EyeView;
  readonly thumb: Thumb;
  readonly magnitude: number;
}

export type Thumb = { readonly picture: PictureId } | { readonly drawing: Drawing };

/** An object of „Heute nicht zu sehen“ with its reason. */
export interface HiddenView {
  readonly id: ObjectId;
  readonly name: string;
  /** The bold first sentence. */
  readonly reason: string;
  /** What follows it. */
  readonly detail: string;
  readonly thumb: Thumb;
}

export interface SkyList {
  readonly visible: readonly ObjectView[];
  readonly hidden: readonly HiddenView[];
  /** The Moon disturbs faint objects at this moment. */
  readonly moonDisturbs: boolean;
}

export interface Highlight {
  readonly id: ObjectId;
  readonly name: string;
  /** „Süden“, or `null` for the Milky Way. */
  readonly direction: string | null;
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** The brightest part of the band that is high enough, or the highest part. */
function bandPosition(sky: (p: { ra: number; dec: number }) => SkyPosition): SkyPosition {
  const samples = bandSamples(sky);
  const high = samples.filter((s) => s.alt >= BAND_ALTITUDE);
  const pick = high.length
    ? high.reduce((a, b) => (b.brightness > a.brightness + 0.05 || (Math.abs(b.brightness - a.brightness) <= 0.05 && b.alt > a.alt) ? b : a))
    : samples.reduce((a, b) => (b.alt > a.alt ? b : a));
  return { alt: pick.alt, az: pick.az };
}

/** Everything about tonight's sky at one place that the list needs, with positions cached per time. */
export class NightSky {
  private readonly skies = new Map<number, (p: { ra: number; dec: number }) => SkyPosition>();
  private readonly positions = new Map<string, SkyPosition>();
  private readonly sun = new Map<number, number>();
  private readonly moonState = new Map<number, boolean>();
  /** Sample times from sunset to sunrise (or the whole window). */
  readonly times: readonly Date[];

  constructor(
    readonly place: NightPlace,
    readonly night: Night,
    readonly darkness: DarknessLevel,
  ) {
    const start = night.sunset ?? night.window.start;
    const end = night.sunrise ?? night.window.end;
    const times: Date[] = [];
    for (let t = start.getTime(); t <= end.getTime(); t += STEP_MINUTES * MINUTE) {
      times.push(new Date(t));
    }
    this.times = times;
  }

  private sky(t: Date) {
    let s = this.skies.get(t.getTime());
    if (!s) {
      s = skyAt(this.place, t);
      this.skies.set(t.getTime(), s);
    }
    return s;
  }

  position(o: SkyObject, t: Date): SkyPosition {
    const key = `${o.id}@${t.getTime()}`;
    const known = this.positions.get(key);
    if (known) {
      return known;
    }
    const src = o.position;
    const p =
      src.kind === 'body'
        ? bodyPosition(src.body, this.place, t)
        : src.kind === 'star'
          ? this.sky(t)(star(src.star))
          : src.kind === 'point'
            ? this.sky(t)(SKY_POINTS[src.point])
            : bandPosition(this.sky(t));
    this.positions.set(key, p);
    return p;
  }

  starPosition(id: StarId, t: Date): SkyPosition {
    return this.sky(t)(star(id));
  }

  sunAltitude(t: Date): number {
    let a = this.sun.get(t.getTime());
    if (a === undefined) {
      a = altitude('sun', this.place, t);
      this.sun.set(t.getTime(), a);
    }
    return a;
  }

  /** The Moon is above the horizon and more than a quarter lit. */
  moonDisturbs(t: Date): boolean {
    let d = this.moonState.get(t.getTime());
    if (d === undefined) {
      d = altitude('moon', this.place, t) > 0 && moonFraction(t) > MOON_DISTURBS;
      this.moonState.set(t.getTime(), d);
    }
    return d;
  }

  /** The rules in the order of the spec; the geometric reasons look at the rest of the night. */
  evaluate(o: SkyObject, t: Date): Evaluation {
    const position = this.position(o, t);
    if (this.darkness < o.minDarkness) {
      return { visible: false, reason: 'ort', position };
    }
    if (o.moonSensitive && this.moonDisturbs(t)) {
      return { visible: false, reason: 'mond', position };
    }
    if (this.sunAltitude(t) > o.sunLimit) {
      return { visible: false, reason: 'daemmerung', position };
    }
    if (position.alt >= MIN_ALTITUDE) {
      return { visible: true, position };
    }
    if (position.alt >= 0) {
      return { visible: false, reason: 'tief', position };
    }
    const later = this.times.some((s) => s > t && this.position(o, s).alt >= MIN_ALTITUDE);
    if (later) {
      return { visible: false, reason: 'aufgang', position };
    }
    const earlier = this.times.some((s) => s < t && this.position(o, s).alt >= MIN_ALTITUDE);
    return { visible: false, reason: earlier ? 'untergang' : 'tief', position };
  }

  visibleAt(o: SkyObject, t: Date): boolean {
    return this.evaluate(o, t).visible;
  }

  /** Above 10° at some time between sunset and sunrise. */
  upTonight(o: SkyObject): boolean {
    return this.times.some((t) => this.position(o, t).alt >= MIN_ALTITUDE);
  }

  /** The first time after `t` at which `test` changes, refined to a minute. */
  private edge(from: Date, to: Date, test: (d: Date) => boolean): Date {
    let a = from.getTime();
    let b = to.getTime();
    const start = test(from);
    while (b - a > MINUTE) {
      const m = (a + b) / 2;
      if (test(new Date(m)) === start) {
        a = m;
      } else {
        b = m;
      }
    }
    return new Date(b);
  }

  /** When an object climbs to 10° after `t`. */
  risesAfter(o: SkyObject, t: Date): Date | null {
    const i = this.times.findIndex((s) => s > t && this.position(o, s).alt >= MIN_ALTITUDE);
    if (i < 0) {
      return null;
    }
    return i === 0 ? this.times[0] : this.edge(this.times[i - 1], this.times[i], (d) => this.position(o, d).alt >= MIN_ALTITUDE);
  }

  /** When an object went below the horizon before `t`. */
  setBefore(o: SkyObject, t: Date): Date | null {
    const before = this.times.filter((s) => s < t);
    for (let i = before.length - 1; i > 0; i--) {
      if (this.position(o, before[i - 1]).alt >= 0 && this.position(o, before[i]).alt < 0) {
        return this.edge(before[i - 1], before[i], (d) => this.position(o, d).alt >= 0);
      }
    }
    return null;
  }

  /** The time span tonight in which the object is visible, in words. */
  spanWords(o: SkyObject): string {
    const tz = this.place.tz;
    const eligible = this.times.filter((t) => this.sunAltitude(t) <= o.sunLimit);
    const vis = eligible.map((t) => this.visibleAt(o, t));
    const first = vis.indexOf(true);
    if (first < 0) {
      return 'heute Nacht nicht';
    }
    const last = vis.lastIndexOf(true);
    const fromStart = first === 0;
    const toEnd = last === vis.length - 1;
    const test = (d: Date) => this.visibleAt(o, d);
    const start = fromStart ? null : this.edge(eligible[first - 1], eligible[first], test);
    const end = toEnd ? null : this.edge(eligible[last], eligible[last + 1], test);
    if (!start && !end) {
      return 'die ganze Nacht';
    }
    if (!start && end) {
      return `bis ${spokenTime(end, tz)}`;
    }
    if (start && !end) {
      return `ab etwa ${spokenTime(start, tz)}`;
    }
    return `von ${spokenTime(start as Date, tz)} bis ${spokenTime(end as Date, tz)}`;
  }

  context(o: SkyObject, t: Date, position: SkyPosition, evening: boolean): StepContext {
    const dir = compassWord(position.az);
    return {
      dir: dir.name,
      towards: dir.towards,
      fists: wholeFists(position.alt),
      overhead: position.alt >= OVERHEAD_ALTITUDE,
      darkness: this.darkness,
      moonFraction: moonFraction(t),
      evening,
      starAlt: (id) => this.starPosition(id, t).alt,
      rel: (from, to) => capitalise(relativeStep(this.starPosition(from, t), this.starPosition(to, t))),
    };
  }
}

const text = <T>(v: string | ((c: T) => string), c: T) => (typeof v === 'string' ? v : v(c));

function thumbOf(o: SkyObject): Thumb {
  return 'drawing' in o.look ? { drawing: o.look.drawing } : { picture: THUMBS[o.look.thumb] as PictureId };
}

function magnitudeOf(o: SkyObject, t: Date): number {
  return o.position.kind === 'body' ? magnitude(o.position.body, t) : o.magnitude;
}


function viewOf(sky: NightSky, o: SkyObject, moment: Moment, position: SkyPosition): ObjectView {
  const c = sky.context(o, moment.at, position, moment.id === 'abends');
  const here = hasRoutes(sky.place);
  const steps = !here ? null : o.steps ? o.steps(c) : (milkyWaySteps(sky.place, moment.at) ?? [BAND_FALLBACK]);
  return {
    id: o.id,
    name: o.name,
    kind: text(o.kind, c),
    ease: o.ease,
    easeWord: EASE_WORDS[o.ease],
    position: positionWords(position),
    eye: text(o.eye, c),
    steps,
    span: sky.spanWords(o),
    eyeView: EYE_VIEWS[o.eyeView],
    thumb: thumbOf(o),
    magnitude: magnitudeOf(o, moment.at),
  };
}

/** Two planets close together as one card, the brighter one first. */
function pairView(sky: NightSky, a: ObjectView, b: ObjectView, oa: SkyObject, ob: SkyObject, moment: Moment): ObjectView {
  const [bright, faint, ob1, ob2] = a.magnitude <= b.magnitude ? [a, b, oa, ob] : [b, a, ob, oa];
  const pb = sky.position(ob1, moment.at);
  const pf = sky.position(ob2, moment.at);
  const key = `${ob1.id}+${ob2.id}`;
  const eyeKey = (key in EYE_VIEWS ? key : ob1.eyeView) as EyeKey;
  const c = sky.context(ob1, moment.at, pb, moment.id === 'abends');
  const apart = capitalise(fistWords(Math.max(0.5, fists(separation(pb, pf)))));
  const steps = hasRoutes(sky.place)
    ? [
        `Dreh dich ${c.towards}.`,
        `${c.fists} hoch: ${ob1.pairHint}. Das ist ${ob1.name}.`,
        `${apart} daneben ${ob2.pairHint}: ${ob2.name}.`,
        ...(ob1.pairExtra ? [ob1.pairExtra] : []),
      ]
    : null;
  return {
    ...bright,
    id: key,
    name: `${bright.name} und ${faint.name}`,
    kind: 'zwei Planeten nebeneinander',
    ease: EASE_ORDER.indexOf(bright.ease) <= EASE_ORDER.indexOf(faint.ease) ? bright.ease : faint.ease,
    easeWord: bright.easeWord,
    eye: `${bright.eye} ${faint.eye}`,
    steps,
    span: bright.span,
    eyeView: EYE_VIEWS[eyeKey],
  };
}

function moonWord(fraction: number): string {
  return fraction > 0.97 ? 'volle' : fraction > 0.6 ? 'fast volle' : 'helle';
}

function hiddenView(sky: NightSky, o: SkyObject, e: Evaluation & { visible: false }, t: Date): HiddenView {
  const tz = sky.place.tz;
  let reason: string;
  let detail = '';
  switch (e.reason) {
    case 'ort':
      reason = 'Dein Ort ist zu hell.';
      detail = `Dafür braucht es Dunkelheit ${o.minDarkness} von 5.`;
      break;
    case 'mond':
      reason = `Der ${moonWord(moonFraction(t))} Mond überstrahlt sie.`;
      break;
    case 'daemmerung':
      reason = 'Noch zu hell.';
      detail = 'Erst wenn die Dämmerung vorbei ist.';
      break;
    case 'aufgang': {
      const at = sky.risesAfter(o, t);
      reason = 'Noch nicht aufgegangen.';
      detail = at ? `Kommt um ${spokenTime(at, tz)} im ${compassWord(sky.position(o, at).az).name} hoch.` : '';
      break;
    }
    case 'untergang': {
      const at = sky.setBefore(o, t);
      reason = 'Schon untergegangen.';
      detail = at ? `Unter dem Horizont seit ${spokenTime(at, tz)}.` : '';
      break;
    }
    default: {
      const at = sky.risesAfter(o, t);
      reason = 'Zu tief am Horizont.';
      detail = at ? `Ab ${spokenTime(at, tz)} steht es hoch genug.` : 'Bäume und Dunst verdecken es.';
    }
  }
  return { id: o.id, name: o.name, reason, detail, thumb: thumbOf(o) };
}

const PLANETS: readonly ObjectId[] = ['venus', 'jupiter', 'mars', 'saturn'];

/** The list for one moment: visible objects in order (planets close together merged) and the hidden ones with reasons. */
export function listFor(sky: NightSky, moment: Moment): SkyList {
  const t = moment.at;
  const visible: { view: ObjectView; object: SkyObject }[] = [];
  const hidden: HiddenView[] = [];
  for (const o of OBJECTS) {
    const e = sky.evaluate(o, t);
    if (e.visible) {
      visible.push({ view: viewOf(sky, o, moment, e.position), object: o });
    } else if (o.id === 'milchstrasse' || sky.upTonight(o)) {
      hidden.push(hiddenView(sky, o, e, t));
    }
  }

  // Planets closer than 5° share one card.
  const planets = visible.filter((v) => PLANETS.includes(v.object.id));
  const merged = new Set<string>();
  const pairs: ObjectView[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const a = planets[i];
      const b = planets[j];
      if (merged.has(a.object.id) || merged.has(b.object.id)) {
        continue;
      }
      if (separation(sky.position(a.object, t), sky.position(b.object, t)) < PAIR_DISTANCE) {
        merged.add(a.object.id).add(b.object.id);
        pairs.push(pairView(sky, a.view, b.view, a.object, b.object, moment));
      }
    }
  }
  const views = [...visible.filter((v) => !merged.has(v.object.id)).map((v) => v.view), ...pairs];
  views.sort((a, b) => {
    if (a.id === 'milchstrasse' || b.id === 'milchstrasse') {
      return a.id === 'milchstrasse' ? -1 : 1;
    }
    const ease = EASE_ORDER.indexOf(a.ease) - EASE_ORDER.indexOf(b.ease);
    return ease !== 0 ? ease : a.magnitude - b.magnitude;
  });
  return { visible: views, hidden, moonDisturbs: sky.moonDisturbs(t) };
}

/** The Milky Way can be seen at one of the moments. */
export function milkyWayTonight(sky: NightSky, moments: readonly Moment[]): boolean {
  const mw = OBJECTS.find((o) => o.id === 'milchstrasse') as SkyObject;
  return moments.some((m) => sky.visibleAt(mw, m.at));
}

/**
 * The highlight of the night for the home card: the Milky Way when it is visible at one of the moments, else the
 * brightest planet visible at one of them, else the first object visible at the preselected moment other than the Moon.
 */
export function highlightFor(sky: NightSky, moments: readonly Moment[], preselected: Moment): Highlight | null {
  if (milkyWayTonight(sky, moments)) {
    return { id: 'milchstrasse', name: 'die Milchstrasse', direction: null };
  }
  // The brightest planet at the preselected moment, else at any other moment.
  let best: { o: SkyObject; t: Date; mag: number } | null = null;
  for (const group of [[preselected], moments.filter((m) => m !== preselected)]) {
    for (const id of PLANETS) {
      const o = OBJECTS.find((x) => x.id === id) as SkyObject;
      const m = group.find((x) => sky.visibleAt(o, x.at));
      if (m) {
        const mag = magnitude(o.position.kind === 'body' ? o.position.body : 'moon', m.at);
        if (!best || mag < best.mag) {
          best = { o, t: m.at, mag };
        }
      }
    }
    if (best) {
      break;
    }
  }
  if (best) {
    return { id: best.o.id, name: best.o.name, direction: compassWord(sky.position(best.o, best.t).az).name };
  }
  const first = listFor(sky, preselected).visible.find((v) => v.id !== 'mond');
  if (!first) {
    return null;
  }
  const o = OBJECTS.find((x) => x.id === first.id.split('+')[0]) as SkyObject;
  return { id: o.id, name: o.name, direction: compassWord(sky.position(o, preselected.at).az).name };
}
