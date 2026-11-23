import { formatCount } from './format';

/**
 * The rules of the travel calculation, in one place, so that the open questions of the concept
 * (for example 30 instead of 25 years per generation) change one value.
 */
export const TRAVEL_RULES = {
  /** Years per generation. */
  generationYears: 25,
  /** A journey of up to this many years counts as one generation: who leaves young, arrives. */
  oneGenerationUpTo: 50,
  /** The arrival year is shown only for journeys shorter than this. */
  arrivalYearBelow: 100_000,
  /** At most this many generation figures are drawn; beyond, one figure stands for 10, 100 … generations. */
  maxFigures: 20,
  /** Above this many generations, the history anchor says that it is longer than our species exists. */
  beyondHistory: 30_000,
  anchors: [
    { generations: 3, text: 'der Zweite Weltkrieg' },
    { generations: 17, text: 'Galileis erster Blick durchs Fernrohr' },
    { generations: 21, text: 'die Fahrt des Kolumbus' },
    { generations: 81, text: 'die Zeit der Römer' },
    { generations: 183, text: 'der Bau der grossen Pyramide von Gizeh' },
    { generations: 1440, text: 'die Höhlenmalereien von Chauvet' },
    { generations: 12_000, text: 'der Anfang unserer Art' },
  ],
} as const;

export const OUTCOMES = {
  here: 'Du musst nicht reisen. Du bist schon da, und das schon dein ganzes Leben.',
  blink: 'Ein Wimpernschlag. Kein Gepäck nötig.',
  arrive: 'Wer abfliegt, kommt an.',
  arriveAlone: 'Du kommst an. Aber zu Hause kennt dich niemand mehr.',
  generations: 'Wer abfliegt, kommt nie an. Erst die Enkel, die Urenkel, die Ururenkel.',
  never: 'Nie. Selbst das Licht kommt dort nicht mehr an. Das Universum wächst schneller, als du dich näherst.',
} as const;

/** How a destination can be reached: already there, a journey (possibly a lower bound), or never. */
export type Reach =
  | { readonly kind: 'here' }
  | { readonly kind: 'never' }
  | { readonly kind: 'journey'; readonly lightYears: number; readonly lowerBound?: boolean };

export type TravelResult =
  | { readonly kind: 'here' | 'never'; readonly outcome: string }
  | {
      readonly kind: 'journey';
      readonly earthYears: number;
      readonly boardYears: number;
      readonly generationsBoard: number;
      readonly generationsEarth: number;
      /** Calendar year of the arrival on Earth's clock, when it still means something. */
      readonly arrivalYear: number | null;
      readonly lowerBound: boolean;
      readonly outcome: string;
      readonly anchor: string | null;
      readonly figures: { readonly count: number; readonly unit: number };
      readonly birthLine: string | null;
    };

const SECONDS_PER_YEAR = 365.25 * 86400;
const MS_PER_YEAR = SECONDS_PER_YEAR * 1000;

/** Generations needed for a duration: one up to 50 years, else 25 years each, rounded up. */
export function generations(years: number): number {
  return years <= TRAVEL_RULES.oneGenerationUpTo ? 1 : Math.ceil(years / TRAVEL_RULES.generationYears);
}

/** The history anchor nearest to a number of generations (on a logarithmic scale). */
export function historyAnchor(gens: number): string | null {
  if (gens <= 1) {
    return null;
  }
  if (gens > TRAVEL_RULES.beyondHistory) {
    return `${formatCount(gens)} Generationen: mehr, als es Menschen unserer Art überhaupt gibt (rund 12.000 Generationen).`;
  }
  const nearest = TRAVEL_RULES.anchors.reduce((best, a) =>
    Math.abs(Math.log(a.generations / gens)) < Math.abs(Math.log(best.generations / gens)) ? a : best,
  );
  return `${formatCount(gens)} Generationen: Ungefähr so weit zurück liegt ${nearest.text}.`;
}

/** How many figures to draw and how many generations one figure stands for (1, 10, 100 …). */
export function figuresFor(gens: number): { count: number; unit: number } {
  let unit = 1;
  while (gens / unit > TRAVEL_RULES.maxFigures) {
    unit *= 10;
  }
  return { count: Math.ceil(gens / unit), unit };
}

function outcomeFor(earthYears: number, boardYears: number, generationsEarth: number): string {
  if (earthYears * SECONDS_PER_YEAR < 86_400) {
    return OUTCOMES.blink;
  }
  if (boardYears <= TRAVEL_RULES.oneGenerationUpTo) {
    return generationsEarth > 1 ? OUTCOMES.arriveAlone : OUTCOMES.arrive;
  }
  return OUTCOMES.generations;
}

/** A journey started at birth (1 July of the birth year): already arrived, or how far along it would be today. */
function birthLineFor(earthYears: number, birthYear: number, now: Date): string {
  const born = Date.UTC(birthYear, 6, 1);
  const elapsed = (now.getTime() - born) / MS_PER_YEAR;
  if (elapsed >= earthYears) {
    const year = Math.floor(birthYear + 0.5 + earthYears);
    return `Wärst du bei deiner Geburt aufgebrochen, wärst du schon angekommen: im Jahr ${year}.`;
  }
  const share = (elapsed / earthYears) * 100;
  const shown = share < 0.01 ? 'noch nicht einmal 0,01 %' : `${share.toLocaleString('de-DE', { maximumSignificantDigits: 2 })} %`;
  return `Wärst du bei deiner Geburt aufgebrochen, hättest du heute ${shown} des Weges geschafft.`;
}

/**
 * The journey to a destination at a speed `beta` (fraction of c): constant speed, no acceleration or braking.
 * Time on board follows the time dilation of special relativity.
 */
export function travel(reach: Reach, beta: number, now: Date, birthYear: number | null = null): TravelResult {
  if (reach.kind === 'here') {
    return { kind: 'here', outcome: OUTCOMES.here };
  }
  if (reach.kind === 'never') {
    return { kind: 'never', outcome: OUTCOMES.never };
  }
  const earthYears = reach.lightYears / beta;
  const boardYears = earthYears * Math.sqrt(1 - beta * beta);
  const generationsBoard = generations(boardYears);
  const generationsEarth = generations(earthYears);
  const lowerBound = reach.lowerBound === true;
  return {
    kind: 'journey',
    earthYears,
    boardYears,
    generationsBoard,
    generationsEarth,
    arrivalYear: earthYears < TRAVEL_RULES.arrivalYearBelow ? Math.floor(now.getUTCFullYear() + earthYears) : null,
    lowerBound,
    outcome: outcomeFor(earthYears, boardYears, generationsEarth),
    anchor: historyAnchor(generationsBoard),
    figures: figuresFor(generationsBoard),
    birthLine: birthYear !== null && !lowerBound ? birthLineFor(earthYears, birthYear, now) : null,
  };
}
