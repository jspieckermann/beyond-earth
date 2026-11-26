import { DarknessLevel } from '../../core/models';
import { Planet } from '../engine/ephemeris';
import { EyeKey } from './pictures';
import { FigureId, StarId, figure } from './stars';

/**
 * The objects „Heute Nacht“ knows: things that can be found with the naked eye from Central Europe.
 * Texts are written for the app; directions and heights are filled in for the chosen moment.
 */

export type ObjectId =
  | 'mond'
  | 'venus'
  | 'jupiter'
  | 'mars'
  | 'saturn'
  | 'wagen'
  | 'kassiopeia'
  | 'sommerdreieck'
  | 'kapella'
  | 'arktur'
  | 'orion'
  | 'sirius'
  | 'plejaden'
  | 'skorpion'
  | 'milchstrasse'
  | 'andromeda';

/** „Sofort“, „Leicht“, „Etwas Übung“ */
export type Ease = 'sofort' | 'leicht' | 'uebung';

export const EASE_WORDS: Record<Ease, string> = { sofort: 'Sofort', leicht: 'Leicht', uebung: 'Etwas Übung' };
export const EASE_ORDER: readonly Ease[] = ['sofort', 'leicht', 'uebung'];

/** Where an object's position comes from. */
export type PositionSource =
  | { readonly kind: 'body'; readonly body: 'moon' | Planet }
  | { readonly kind: 'star'; readonly star: StarId }
  | { readonly kind: 'point'; readonly point: 'andromeda' }
  | { readonly kind: 'band' };

/** What the texts of an object can ask for at the chosen moment. */
export interface StepContext {
  /** „Süden“ */
  readonly dir: string;
  /** „nach Süden“ */
  readonly towards: string;
  /** „Vier Fäuste“ */
  readonly fists: string;
  /** At least 70° high. */
  readonly overhead: boolean;
  readonly darkness: DarknessLevel;
  /** Lit fraction of the Moon, 0 to 1. */
  readonly moonFraction: number;
  /** „Abends“ before midnight, used for Venus as evening or morning star. */
  readonly evening: boolean;
  /** Altitude of a star at the moment. */
  starAlt(id: StarId): number;
  /** „Zwei Fäuste höher, etwas nach links“ from one star to another. */
  rel(from: StarId, to: StarId): string;
}

/** Stars and lines of a figure, drawn small as the thumbnail of constellations and stars. */
export interface Drawing {
  readonly stars: readonly StarId[];
  readonly lines: readonly (readonly [StarId, StarId])[];
}

export interface SkyObject {
  readonly id: ObjectId;
  readonly name: string;
  readonly kind: string | ((c: StepContext) => string);
  readonly ease: Ease;
  readonly minDarkness: DarknessLevel;
  /** The Moon above the horizon and more than a quarter lit hides it. */
  readonly moonSensitive: boolean;
  /** The Sun must be at least this far below the horizon (negative degrees). */
  readonly sunLimit: number;
  readonly position: PositionSource;
  /** For ordering; planets and the Moon use their calculated magnitude. */
  readonly magnitude: number;
  /** „Mit dem Auge:“ */
  readonly eye: string | ((c: StepContext) => string);
  /** „So findest du es“; `null` for the Milky Way, whose steps are a route to the band. */
  readonly steps: ((c: StepContext) => readonly string[]) | null;
  /** Naked-eye photo with marks. */
  readonly eyeView: EyeKey;
  /** The thumbnail: a small photo, or for constellations and stars a drawing of the figure. */
  readonly look: { readonly thumb: EyeKey } | { readonly drawing: Drawing };
  /** How a planet is described when it shares a card with another one. */
  readonly pairHint?: string;
  /** An extra step a planet keeps when it shares a card. */
  readonly pairExtra?: string;
}

/** The Moon shows as soon as the Sun has set (and often by day). */
const SUN_MOON = 0;
/** Venus and Jupiter shine through bright twilight. */
const SUN_BRILLIANT = -3;
/** Mars and Saturn show at the end of civil twilight. */
const SUN_PLANETS = -6;
/** Single bright stars (magnitude about 1 or brighter). */
const SUN_BRIGHT = -8;
/** Figures of stars of about the second magnitude. */
const SUN_STARS = -9;
/** Faint, extended objects need a fully dark sky. */
const SUN_DARK = -18;

/** „Schau nach Süden, vier Fäuste hoch.“, or overhead „Leg den Kopf in den Nacken, fast genau über dir.“ */
const lookAt = (c: StepContext) =>
  c.overhead ? 'Leg den Kopf in den Nacken: fast genau über dir.' : `Schau ${c.towards}, ${c.fists.toLowerCase()} hoch.`;

const lines = (...ids: FigureId[]) => ids.flatMap((id) => figure(id).lines);
const starsOf = (pairs: readonly (readonly [StarId, StarId])[]) => [...new Set(pairs.flat())];

function drawing(pairs: readonly (readonly [StarId, StarId])[], extra: readonly StarId[] = []): Drawing {
  return { stars: [...new Set([...starsOf(pairs), ...extra])], lines: pairs };
}

function moonKind(c: StepContext): string {
  const f = c.moonFraction;
  if (f > 0.97) {
    return 'Vollmond';
  }
  if (f > 0.6) {
    return 'fast voll';
  }
  if (f > 0.4) {
    return 'Halbmond';
  }
  return 'Sichel';
}

export const OBJECTS: readonly SkyObject[] = [
  {
    id: 'mond',
    name: 'Mond',
    kind: moonKind,
    ease: 'sofort',
    minDarkness: 1,
    moonSensitive: false,
    sunLimit: SUN_MOON,
    position: { kind: 'body', body: 'moon' },
    magnitude: -12,
    eye: (c) =>
      c.moonFraction > 0.6
        ? 'Eine helle Scheibe mit dunklen Flecken, dem „Mondgesicht“. Die Flecken sind Ebenen aus erstarrter Lava.'
        : 'Eine helle Sichel. Oft leuchtet der Rest der Scheibe schwach grau: Das ist Licht, das die Erde zurückwirft.',
    steps: (c) => [
      `${lookAt(c)} Du findest ihn sofort, er ist das Hellste am Himmel.`,
      'Achte auf die dunklen Flecken. Mit einem Fernglas siehst du an der Grenze zwischen hell und dunkel Krater.',
      'Er geht jeden Abend etwa eine Stunde später auf und wandert dabei ein Stück weiter zwischen den Sternen.',
    ],
    eyeView: 'mond',
    look: { thumb: 'mond' },
  },
  {
    id: 'venus',
    name: 'Venus',
    kind: (c) => (c.evening ? 'Planet · Abendstern' : 'Planet · Morgenstern'),
    ease: 'sofort',
    minDarkness: 1,
    moonSensitive: false,
    sunLimit: SUN_BRILLIANT,
    position: { kind: 'body', body: 'venus' },
    magnitude: -4,
    eye: 'Der hellste Punkt am Himmel nach dem Mond. Sie strahlt so, dass man sie für ein Flugzeug hält.',
    steps: (c) => [
      `Dreh dich ${c.towards}.`,
      `${c.fists} über dem Horizont: ein strahlend heller, ruhiger Punkt. Das ist Venus.`,
      'Ein Dach oder Baum als Vergleich hilft: Venus blinkt nicht und zieht nicht wie ein Flugzeug über den Himmel.',
    ],
    eyeView: 'venus',
    look: { thumb: 'venus' },
    pairHint: 'ein strahlend heller, ruhiger Punkt',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    kind: 'Planet',
    ease: 'sofort',
    minDarkness: 1,
    moonSensitive: false,
    sunLimit: SUN_BRILLIANT,
    position: { kind: 'body', body: 'jupiter' },
    magnitude: -2.2,
    eye: 'Ein sehr heller, ruhiger Punkt, heller als jeder Stern. Seine Monde zeigt erst ein Fernglas.',
    steps: (c) => [
      `Dreh dich ${c.towards}.`,
      `${c.fists} hoch: ein sehr heller, ruhiger Punkt. Heller sind nur Mond und Venus.`,
      'Mit einem Fernglas, ruhig aufgestützt: bis zu vier winzige Pünktchen neben Jupiter. Das sind seine grossen Monde.',
    ],
    eyeView: 'jupiter',
    look: { thumb: 'jupiter' },
    pairHint: 'ein sehr heller, ruhiger Punkt',
    pairExtra: 'Mit einem Fernglas, ruhig aufgestützt: bis zu vier winzige Pünktchen neben Jupiter. Das sind seine grossen Monde.',
  },
  {
    id: 'mars',
    name: 'Mars',
    kind: 'Planet',
    ease: 'leicht',
    minDarkness: 1,
    moonSensitive: false,
    sunLimit: SUN_PLANETS,
    position: { kind: 'body', body: 'mars' },
    magnitude: 0.5,
    eye: 'Ein deutlich rötlicher Punkt. Wie hell er ist, ändert sich übers Jahr stark.',
    steps: (c) => [
      `Dreh dich ${c.towards}.`,
      `${c.fists} hoch: ein Punkt, der deutlich rötlich leuchtet. Das ist Mars.`,
      'Er funkelt kaum. Sterne flackern, Planeten leuchten ruhig.',
    ],
    eyeView: 'mars',
    look: { thumb: 'mars' },
    pairHint: 'ein schwächerer, rötlicher Punkt',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    kind: 'Planet',
    ease: 'leicht',
    minDarkness: 1,
    moonSensitive: false,
    sunLimit: SUN_PLANETS,
    position: { kind: 'body', body: 'saturn' },
    magnitude: 0.6,
    eye: 'Ein ruhiger, gelblicher Punkt. Den Ring siehst du erst in einem kleinen Teleskop.',
    steps: (c) => [
      `Dreh dich ${c.towards}.`,
      `${c.fists} hoch steht ein gelblicher Punkt, der hellste weit und breit. Um ihn herum gibt es kaum helle Sterne.`,
      'Er funkelt nicht. Sterne flackern, Planeten leuchten ruhig. So erkennst du ihn sicher.',
    ],
    eyeView: 'saturn',
    look: { thumb: 'saturn' },
    pairHint: 'ein gelblicher, ruhiger Punkt',
  },
  {
    id: 'wagen',
    name: 'Grosser Wagen',
    kind: 'Sternbild · mit dem Polarstern',
    ease: 'leicht',
    minDarkness: 1,
    moonSensitive: false,
    sunLimit: SUN_STARS,
    position: { kind: 'star', star: 'megrez' },
    magnitude: 1.8,
    eye: 'Sieben helle Sterne: Vier bilden einen Kasten, drei eine gebogene Deichsel. Der Polarstern ist nicht besonders hell, aber er steht immer an derselben Stelle.',
    steps: (c) => [
      lookAt(c),
      'Suche sieben helle Sterne in Form eines grossen Wagens oder eines Topfes mit Stiel.',
      'Verlängere die hintere Kante des Kastens, weg vom Kasten, etwa fünfmal so weit. Dort steht der Polarstern.',
      'Der Polarstern zeigt dir immer genau nach Norden.',
    ],
    eyeView: 'wagen',
    look: { drawing: drawing([...lines('grosser-wagen'), ['dubhe', 'polarstern']]) },
  },
  {
    id: 'kassiopeia',
    name: 'Kassiopeia',
    kind: 'Sternbild · das „Himmels-W“',
    ease: 'leicht',
    minDarkness: 2,
    moonSensitive: false,
    sunLimit: SUN_STARS,
    position: { kind: 'star', star: 'gamma-cas' },
    magnitude: 2.2,
    eye: 'Fünf etwa gleich helle Sterne, die ein grosses W bilden. Je nach Uhrzeit steht es auf dem Kopf, dann ist es ein M.',
    steps: (c) => [
      lookAt(c),
      'Suche fünf Sterne in einer Zickzack-Linie, etwa so breit wie deine Hand am ausgestreckten Arm.',
      'Hilfe: Der Polarstern steht immer genau im Norden, gut fünf Fäuste hoch. Das W liegt auf der anderen Seite des Polarsterns als der Grosse Wagen.',
    ],
    eyeView: 'kassiopeia',
    look: { drawing: drawing(lines('kassiopeia')) },
  },
  {
    id: 'sommerdreieck',
    name: 'Sommerdreieck',
    kind: 'Wega, Deneb und Atair',
    ease: 'leicht',
    minDarkness: 1,
    moonSensitive: false,
    sunLimit: SUN_BRIGHT,
    position: { kind: 'star', star: 'wega' },
    magnitude: 0.03,
    eye: 'Drei helle Sterne in einem grossen Dreieck. Wega ist der hellste, bläulich-weiss. Deneb sitzt an der Spitze eines grossen Kreuzes.',
    steps: (c) => [
      c.overhead ? 'Leg den Kopf in den Nacken.' : `Dreh dich ${c.towards}.`,
      `${c.overhead ? 'Fast genau über dir' : `${c.fists} hoch`}: der hellste Stern dort ist Wega.`,
      `${c.rel('wega', 'deneb')}: Deneb, an der Spitze eines grossen Kreuzes aus fünf Sternen, des Schwans.`,
      c.starAlt('atair') >= 10 ? `${c.rel('wega', 'atair')} von Wega aus: Atair, das dritte Eck.` : 'Das dritte Eck, Atair, steht jetzt zu tief.',
    ],
    eyeView: 'sommerdreieck',
    look: { drawing: drawing([...lines('schwan'), ['wega', 'deneb'], ['deneb', 'atair'], ['atair', 'wega']]) },
  },
  {
    id: 'kapella',
    name: 'Kapella',
    kind: 'heller Stern im Fuhrmann',
    ease: 'leicht',
    minDarkness: 1,
    moonSensitive: false,
    sunLimit: SUN_BRIGHT,
    position: { kind: 'star', star: 'kapella' },
    magnitude: 0.08,
    eye: 'Ein heller, leicht gelblicher Stern. Tief am Horizont blitzt er manchmal rot und grün.',
    steps: (c) => [
      lookAt(c),
      'Dort leuchtet der hellste Stern weit und breit. Das ist Kapella.',
      'Sie ist die Spitze eines grossen Fünfecks aus hellen Sternen, des Fuhrmanns.',
    ],
    eyeView: 'kapella',
    look: { drawing: drawing(lines('fuhrmann')) },
  },
  {
    id: 'arktur',
    name: 'Arktur',
    kind: 'heller Stern im Bootes',
    ease: 'leicht',
    minDarkness: 1,
    moonSensitive: false,
    sunLimit: SUN_BRIGHT,
    position: { kind: 'star', star: 'arktur' },
    magnitude: -0.05,
    eye: 'Ein heller, deutlich orangefarbener Stern.',
    steps: (c) => [
      'Finde zuerst die gebogene Deichsel des Grossen Wagens.',
      'Folge ihrem Bogen weiter, etwa drei Fäuste.',
      `Dort, im ${c.dir}, ${c.fists.toLowerCase()} hoch: ein heller, orangefarbener Stern. Das ist Arktur. „Folge dem Bogen zum Arktur“, sagen Sternfreunde.`,
    ],
    eyeView: 'arktur',
    look: { drawing: drawing([...lines('grosser-wagen'), ['alkaid', 'arktur']], ['arktur']) },
  },
  {
    id: 'orion',
    name: 'Orion',
    kind: (c) => (c.darkness >= 3 ? 'Sternbild mit Orionnebel' : 'Sternbild'),
    ease: 'leicht',
    minDarkness: 1,
    moonSensitive: false,
    sunLimit: SUN_STARS,
    position: { kind: 'star', star: 'alnilam' },
    magnitude: 0.4,
    eye: (c) =>
      c.darkness >= 3
        ? 'Drei gleich helle Sterne in einer Reihe, der Gürtel. Darunter ein schwacher grauer Hauch: der Orionnebel.'
        : 'Drei gleich helle Sterne in einer Reihe, der Gürtel, dazu vier helle Sterne darum herum.',
    steps: (c) => [
      `Dreh dich ${c.towards}.`,
      `${c.fists} hoch: drei gleich helle Sterne dicht in einer Reihe. Das ist der Gürtel des Orion.`,
      'Auf der einen Seite des Gürtels der rötliche Beteigeuze, auf der anderen der bläuliche Rigel.',
      c.darkness >= 3
        ? 'Am Gürtel hängen drei schwache Sterne, das Schwert. Der mittlere ist ein Nebel, in dem neue Sonnen entstehen.'
        : 'Am Gürtel hängen drei schwache Sterne, das Schwert. Den Nebel darin siehst du erst an einem dunkleren Ort.',
    ],
    eyeView: 'orion',
    look: { thumb: 'orion' },
  },
  {
    id: 'sirius',
    name: 'Sirius',
    kind: 'hellster Stern am Himmel',
    ease: 'leicht',
    minDarkness: 1,
    moonSensitive: false,
    sunLimit: SUN_BRIGHT,
    position: { kind: 'star', star: 'sirius' },
    magnitude: -1.46,
    eye: 'Ein sehr heller, weisser Stern. Tief am Horizont funkelt er in allen Farben.',
    steps: (c) => [
      `Dreh dich ${c.towards}.`,
      `${c.fists} hoch: der hellste Stern weit und breit. Das ist Sirius.`,
      'Zur Probe: Verlängere die Reihe der drei Gürtelsterne des Orion, weg vom rötlichen Aldebaran. Sie zeigt auf Sirius.',
    ],
    eyeView: 'sirius',
    look: { drawing: drawing([...lines('orion'), ['alnitak', 'sirius']], ['sirius']) },
  },
  {
    id: 'plejaden',
    name: 'Plejaden',
    kind: 'Sternhaufen · Siebengestirn',
    ease: 'leicht',
    minDarkness: 1,
    moonSensitive: false,
    sunLimit: SUN_STARS,
    position: { kind: 'star', star: 'plejaden' },
    magnitude: 1.6,
    eye: 'Ein enges Grüppchen aus fünf bis sieben Sternen, wie ein winziger Wagen. Die blauen Schleier zeigt nur die Kamera.',
    steps: (c) => [
      `Dreh dich ${c.towards}.`,
      `${c.overhead ? 'Fast genau über dir' : `${c.fists} hoch`}: ein kleines, enges Knäuel aus Sternen. Es sieht beim ersten Blick wie ein Nebelfleck aus.`,
      'Schau knapp daneben. Dann zerfällt der Fleck in einzelne Sterne. Wie viele zählst du?',
    ],
    eyeView: 'plejaden',
    look: { thumb: 'plejaden' },
  },
  {
    id: 'skorpion',
    name: 'Skorpion',
    kind: 'Sternbild mit Antares · tief im Süden',
    ease: 'leicht',
    minDarkness: 1,
    moonSensitive: false,
    sunLimit: SUN_BRIGHT,
    position: { kind: 'star', star: 'antares' },
    magnitude: 1.06,
    eye: 'Ein heller, deutlich rötlicher Stern tief im Süden: Antares, das „Herz des Skorpions“. Daneben ein kurzer Bogen schwächerer Sterne.',
    steps: (c) => [
      `Schau ${c.towards}, ${c.fists.toLowerCase()} hoch, knapp über Bäume und Dächer.`,
      'Dort leuchtet ein heller, rötlicher Stern. Das ist Antares, das Herz des Skorpions. Sein Name heisst „Gegenspieler des Mars“, weil er so rot ist.',
      'Rechts darüber stehen drei Sterne in einem kurzen, fast senkrechten Bogen: der Kopf des Skorpions.',
      'Links hinter dem Skorpion, noch tiefer, liegt das Zentrum unserer Milchstrasse.',
    ],
    eyeView: 'skorpion',
    look: { drawing: drawing(lines('skorpion')) },
  },
  {
    id: 'milchstrasse',
    name: 'Milchstrasse',
    kind: 'unsere Galaxie, von innen',
    ease: 'uebung',
    minDarkness: 3,
    moonSensitive: true,
    sunLimit: SUN_DARK,
    position: { kind: 'band' },
    magnitude: 5,
    eye: (c) =>
      c.darkness >= 5
        ? 'Ein heller Streifen mit Struktur: helle Wolken und dunkle Staubbänder. Ohne Farben, aber eindrucksvoll.'
        : c.darkness === 4
          ? 'Ein deutlicher, heller Streifen von Horizont zu Horizont, ohne Farben, wie eine lange Wolke.'
          : 'Ein blasser, grauer Schleier, wie eine dünne Wolke, die nicht weiterzieht. Ohne Farben. Er wird deutlicher, wenn du knapp daneben schaust.',
    steps: null,
    eyeView: 'milchstrasse',
    look: { thumb: 'milchstrasse' },
  },
  {
    id: 'andromeda',
    name: 'Andromedagalaxie',
    kind: 'Galaxie · 2,5 Millionen Lichtjahre',
    ease: 'uebung',
    minDarkness: 3,
    moonSensitive: true,
    sunLimit: SUN_DARK,
    position: { kind: 'point', point: 'andromeda' },
    magnitude: 3.4,
    eye: 'Ein kleiner, länglicher, grauer Nebelfleck. Am besten siehst du ihn, wenn du knapp daneben schaust.',
    steps: (c) => [
      'Finde zuerst das W der Kassiopeia.',
      'Die tiefere Spitze des W, bei Schedar, zeigt wie ein Pfeil zur Andromeda, etwa anderthalb Fäuste weiter.',
      `${c.overhead ? 'Fast genau über dir' : `Im ${c.dir}, ${c.fists.toLowerCase()} hoch`}: ein kleiner, länglicher Nebelfleck. Sein Licht war 2,5 Millionen Jahre unterwegs.`,
    ],
    eyeView: 'andromeda',
    look: { thumb: 'andromeda' },
  },
];

export function skyObject(id: ObjectId): SkyObject {
  return OBJECTS.find((o) => o.id === id) as SkyObject;
}
