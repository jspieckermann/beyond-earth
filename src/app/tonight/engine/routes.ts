import { COMPASS_ROUTES, CompassRoute, Meeting, RouteContext, StepAnchor, StepText, ZENITH_ROUTES, ZenithRoute } from '../data/routes';
import { FigureId, SKY_POINTS, StarId, figure, star, STARS } from '../data/stars';
import { BandSample, bandSamples } from './band';
import {
  COMPASS,
  Compass,
  CompassDirection,
  VIEW_HALF_WIDTH,
  ZENITH_REACH,
  azimuthOffset,
  bandNearZenith,
  compass,
  compassWord,
  heightWords,
  relativeStep,
  sectorScores,
} from './directions';
import { GeoPoint, SkyPosition, galacticToEquatorial, skyAt } from './ephemeris';
import { Night, spanMiddle } from './night';

/** Route stars must be at least this high. */
export const MIN_STAR_ALTITUDE = 10;
/** The order in which figures near the zenith become the meeting point. */
export const MEETING_ORDER: readonly FigureId[] = ['kassiopeia', 'schwan', 'fuhrmann', 'perseus', 'adler'];

export type ViewId = Compass | 'zenit';

/** One viewing direction offered tonight, with its route. */
export interface DirectionOffer {
  readonly id: ViewId;
  /** „Westen“, „Über dir“ */
  readonly name: string;
  readonly route: CompassRoute | ZenithRoute;
}

export interface Plan {
  /** The time the directions were chosen for, and where the slider starts. */
  readonly start: Date;
  readonly meeting: Meeting;
  /** The direction with the most visible band first; „Über dir“ last. */
  readonly offers: readonly DirectionOffer[];
}

/** Where the slider starts: the middle of the best time, else of the dark span, else the darkest moment. */
export function startTime(night: Night): Date {
  if (night.best) {
    return spanMiddle(night.best);
  }
  return night.dark ? spanMiddle(night.dark) : night.darkest;
}

export type Sky = (p: { ra: number; dec: number }) => SkyPosition;

const POLE = galacticToEquatorial(0, 90);

/** Galactic latitude of a star, to know whether it lies in the band. */
function galacticLatitude(ra: number, dec: number): number {
  const r = Math.PI / 180;
  const s = Math.sin(dec * r) * Math.sin(POLE.dec * r) + Math.cos(dec * r) * Math.cos(POLE.dec * r) * Math.cos((ra - POLE.ra) * r);
  return Math.asin(s) / r;
}

const BAND_POINTERS = STARS.filter((s) => s.pointer && Math.abs(galacticLatitude(s.ra, s.dec)) <= 12).map((s) => s.id);

/**
 * The meeting point: the first figure of MEETING_ORDER within 30° of the zenith,
 * else the highest pointer star in the band.
 */
export function meetingPoint(sky: Sky): Meeting {
  for (const id of MEETING_ORDER) {
    const f = figure(id);
    if (sky(star(f.label)).alt >= 90 - ZENITH_REACH) {
      return { star: f.label, figure: id, spoken: f.spoken, overhead: true };
    }
  }
  const highest = BAND_POINTERS.reduce((a, b) => (sky(star(b)).alt > sky(star(a)).alt ? b : a));
  return { star: highest, figure: null, spoken: star(highest).name, overhead: false };
}

/** „Fast genau über dir steht das W der Kassiopeia. Weiter geht es unter „Über dir“.“ */
export function meetingSentence(meeting: Meeting, sky: Sky, withZenith: boolean): string {
  const p = sky(star(meeting.star));
  if (!meeting.overhead) {
    return `Das Band steigt bis zu ${meeting.spoken}, ${heightWords(p.alt)}.`;
  }
  const where = p.alt >= 80 ? 'Fast genau über dir' : 'Hoch über dir';
  const spoken = meeting.spoken.replace(/^den /, 'der ');
  const sentence = `${where} steht ${spoken}.`;
  return withZenith ? `${sentence} Weiter geht es unter „Über dir“.` : sentence;
}

function pointOf(id: StarId | 'andromeda') {
  return id === 'andromeda' ? SKY_POINTS.andromeda : star(id);
}

export function routeContext(sky: Sky, direction: CompassDirection, meeting: Meeting): RouteContext {
  const pos = (id: StarId | 'andromeda') => sky(pointOf(id));
  return {
    direction,
    meeting,
    pos,
    height: (id) => heightWords(pos(id).alt),
    step: (from, to) => {
      const s = relativeStep(pos(from), pos(to));
      return s.charAt(0).toUpperCase() + s.slice(1);
    },
    towards: (id) => `Richtung ${compassWord(pos(id).az).name}`,
  };
}

const high = (sky: Sky, ids: readonly StarId[]) => ids.every((id) => sky(star(id)).alt >= MIN_STAR_ALTITUDE);

/** A compass route fits a direction when its stars are high enough and its first star is in the view. */
export function compassRouteFits(route: CompassRoute, dir: Compass, sky: Sky): boolean {
  if (!route.sectors.includes(dir) || !high(sky, route.stars)) {
    return false;
  }
  return Math.abs(azimuthOffset(sky(star(route.stars[0])).az, compass(dir).az)) <= VIEW_HALF_WIDTH;
}

export function compassRouteFor(dir: Compass, sky: Sky): CompassRoute | null {
  return COMPASS_ROUTES.find((r) => compassRouteFits(r, dir, sky)) ?? null;
}

export function zenithRouteFor(meeting: Meeting): ZenithRoute | null {
  return meeting.overhead ? (ZENITH_ROUTES.find((r) => r.figure === meeting.figure) ?? null) : null;
}

/** The directions offered tonight: the two compass directions with the most band that have a route, and „Über dir“. */
export function planFor(place: GeoPoint, night: Night): Plan {
  const start = startTime(night);
  const sky = skyAt(place, start);
  const samples: BandSample[] = bandSamples(sky);
  const meeting = meetingPoint(sky);
  const scores = sectorScores(samples);
  const offers: DirectionOffer[] = [];
  const ranked = [...COMPASS].sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0));
  for (const dir of ranked) {
    if (offers.length === 2 || (scores.get(dir.id) ?? 0) === 0) {
      break;
    }
    const route = compassRouteFor(dir.id, sky);
    if (route) {
      offers.push({ id: dir.id, name: dir.name, route });
    }
  }
  const zenith = bandNearZenith(samples) ? zenithRouteFor(meeting) : null;
  if (zenith) {
    offers.push({ id: 'zenit', name: 'Über dir', route: zenith });
  }
  return { start, meeting, offers };
}

export interface FilledStep extends StepText {
  readonly number: number;
}

export interface FilledRoute {
  /** The three steps, or `null` when a route star stands too low at this time. */
  readonly steps: readonly FilledStep[] | null;
  /** The sentence shown instead of the steps. */
  readonly tooLow?: string;
}

/** A route's steps at the time shown, with calculated heights; or the sentence that a star stands too low. */
export function fillRoute(offer: DirectionOffer, plan: Plan, sky: Sky, clock: string): FilledRoute {
  const route = offer.route;
  const low = route.stars.find((id) => sky(star(id)).alt < MIN_STAR_ALTITUDE);
  if (low) {
    return { steps: null, tooLow: `Um ${clock} Uhr steht ${star(low).name} zu tief. Schieb die Zeit zurück oder wähl eine andere Blickrichtung.` };
  }
  const direction = offer.id === 'zenit' ? COMPASS[0] : compass(offer.id);
  const c = routeContext(sky, direction, plan.meeting);
  const hasZenith = plan.offers.some((o) => o.id === 'zenit');
  const steps: StepText[] =
    route.kind === 'zenith'
      ? [...route.steps(c)]
      : [...route.steps(c), { title: 'Folge dem Band nach oben.', text: meetingSentence(plan.meeting, sky, hasZenith), at: 'meeting' as StepAnchor }];
  return { steps: steps.map((s, i) => ({ ...s, number: i + 1 })) };
}

/** Fallback when no written route fits the moment. */
export const BAND_FALLBACK = 'Such einen blassen, grauen Streifen hoch am Himmel, weg vom hellen Horizont. Schau knapp daneben, dann wird er deutlicher.';

/**
 * The steps of the Milky Way card at a moment: the written route for the compass direction with the most band above
 * 15° (or „Über dir“ when only that fits), each step as one sentence pair, ending at the meeting point.
 */
export function milkyWaySteps(place: GeoPoint, at: Date): string[] | null {
  const sky = skyAt(place, at);
  const samples = bandSamples(sky);
  const meeting = meetingPoint(sky);
  const scores = sectorScores(samples);
  const ranked = [...COMPASS].filter((c) => (scores.get(c.id) ?? 0) > 0).sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0));
  let offer: DirectionOffer | null = null;
  for (const dir of ranked) {
    const route = compassRouteFor(dir.id, sky);
    if (route) {
      offer = { id: dir.id, name: dir.name, route };
      break;
    }
  }
  if (!offer && bandNearZenith(samples)) {
    const zenith = zenithRouteFor(meeting);
    offer = zenith ? { id: 'zenit', name: 'Über dir', route: zenith } : null;
  }
  if (!offer) {
    return null;
  }
  const filled = fillRoute(offer, { start: at, meeting, offers: [offer] }, sky, '');
  return filled.steps ? filled.steps.map((s) => `${s.title} ${s.text}`) : null;
}
