import { CreditId } from './credits';
import { StageId } from './stages';

export type PlanetId = 'merkur' | 'venus' | 'erde' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptun';
export type MoonId = 'io' | 'europa' | 'ganymed' | 'kallisto' | 'titan' | 'enceladus';

export interface PlanetFacts {
  readonly diameter: string;
  readonly day: string;
  readonly year: string;
  readonly temperature: string;
  readonly light: string;
}

export interface Planet {
  readonly id: PlanetId;
  readonly name: string;
  /** "dem"/"der" form used in sentences such as "Auf dem Mars wäre ich 16." */
  readonly dative: string;
  /** Distance to the Sun, as shown. */
  readonly distance: string;
  readonly light: string;
  readonly line: string;
  readonly aha: string;
  readonly facts: PlanetFacts;
  /** Orbital period in Earth years. */
  readonly period: number;
  /** Position in the solar-system layer (base units, relative to the Earth) and drawing. */
  readonly orbit: { readonly x: number; readonly y: number; readonly size: number; readonly color: string };
  readonly moons: readonly MoonId[];
  readonly credit: CreditId;
  readonly alt: string;
}

export interface Moon {
  readonly id: MoonId;
  readonly name: string;
  readonly line: string;
}

/** The Sun in the solar-system layer, relative to the Earth (base units). */
export const SUN_OFFSET = { x: -48, y: 0 } as const;
/** Orbit radii in the solar-system layer (base units), Mercury to Neptune. */
export const ORBIT_RADII = [18, 34, 48, 72, 120, 152, 184, 212] as const;
/** Radius of the asteroid belt in the solar-system layer. */
export const BELT_RADIUS = 92;

export const PLANETS: readonly Planet[] = [
  {
    id: 'merkur',
    name: 'Merkur',
    dative: 'dem Merkur',
    distance: '58 Mio. km',
    light: '3 min',
    line: '„Tagsüber würde hier Blei schmelzen. Nachts ist es kälter als jeder Winter auf der Erde.“',
    aha: 'Bis 430 °C am Tag, bis −180 °C in der Nacht.',
    facts: { diameter: '4.879 km', day: '176 Erdtage', year: '88 Erdtage', temperature: '−180 bis 430 °C', light: '3 min' },
    period: 0.241,
    orbit: { x: -64, y: -9, size: 7, color: '#b7aea4' },
    moons: [],
    credit: 'mercury',
    alt: 'Merkur, eine graue, von Kratern übersäte Kugel.',
  },
  {
    id: 'venus',
    name: 'Venus',
    dative: 'der Venus',
    distance: '108 Mio. km',
    light: '6 min',
    line: '„Der hellste Stern am Abendhimmel ist kein Stern. Er ist ein Glutofen.“',
    aha: 'Mit 465 °C heisser als Merkur, obwohl weiter von der Sonne entfernt. Sie dreht sich langsamer um sich selbst, als sie die Sonne umrundet.',
    facts: { diameter: '12.104 km', day: '117 Erdtage', year: '225 Erdtage', temperature: '465 °C', light: '6 min' },
    period: 0.615,
    orbit: { x: -65, y: 29, size: 10, color: '#e9cf96' },
    moons: [],
    credit: 'venus',
    alt: 'Venus, eine blassgelbe Kugel unter dichten Wolken.',
  },
  {
    id: 'erde',
    name: 'Erde',
    dative: 'der Erde',
    distance: '150 Mio. km',
    light: '8 min 20 s',
    line: '„Der einzige Ort, an dem wir Leben kennen.“',
    aha: '',
    facts: { diameter: '12.742 km', day: '24 Stunden', year: '365,25 Tage', temperature: 'im Mittel 15 °C', light: '8 min 20 s' },
    period: 1,
    orbit: { x: 0, y: 0, size: 11, color: '#4f93d4' },
    moons: [],
    credit: 'earth-day',
    alt: 'Die Erde mit Ozeanen, Kontinenten und Wolken.',
  },
  {
    id: 'mars',
    name: 'Mars',
    dative: 'dem Mars',
    distance: '228 Mio. km',
    light: '13 min',
    line: '„Eine rote Wüste. Und der Sonnenuntergang ist hier blau.“',
    aha: 'Der Vulkan Olympus Mons ist rund 22 km hoch, zweieinhalbmal so hoch wie der Mount Everest.',
    facts: { diameter: '6.779 km', day: '24 h 40 min', year: '687 Erdtage', temperature: '−140 bis 20 °C', light: '13 min' },
    period: 1.881,
    orbit: { x: -12, y: -62, size: 8, color: '#d06a3a' },
    moons: [],
    credit: 'mars',
    alt: 'Mars, eine rostrote Wüstenkugel mit dunklen Ebenen und einer hellen Polkappe.',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    dative: 'dem Jupiter',
    distance: '778 Mio. km',
    light: '43 min',
    line: '„Ein Riese aus Gas. Sein roter Fleck ist ein Sturm, grösser als die Erde.“',
    aha: 'Über 1.300 Erden passen hinein. Er hat mehr als doppelt so viel Masse wie alle anderen Planeten zusammen.',
    facts: { diameter: '139.820 km', day: '9 h 56 min', year: '11,9 Erdjahre', temperature: '−110 °C an den Wolken', light: '43 min' },
    period: 11.86,
    orbit: { x: 44, y: 77, size: 20, color: '#d8b48a' },
    moons: ['io', 'europa', 'ganymed', 'kallisto'],
    credit: 'jupiter',
    alt: 'Jupiter mit hellen und dunklen Wolkenbändern und dem Grossen Roten Fleck.',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    dative: 'dem Saturn',
    distance: '1,43 Mrd. km',
    light: '1 h 20 min',
    line: '„Ringe aus Eis, Hunderttausende Kilometer gross und oft nur so dick wie ein Haus.“',
    aha: 'Saturn ist leichter als Wasser. In einer riesigen Badewanne würde er schwimmen.',
    facts: { diameter: '116.460 km', day: '10 h 34 min', year: '29,5 Erdjahre', temperature: '−140 °C an den Wolken', light: '1 h 20 min' },
    period: 29.46,
    orbit: { x: -146, y: -116, size: 16, color: '#e6d29e' },
    moons: ['titan', 'enceladus'],
    credit: 'saturn',
    alt: 'Saturn, eine blassgelbe Kugel mit hellen Ringen aus Eis.',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    dative: 'dem Uranus',
    distance: '2,87 Mrd. km',
    light: '2 h 40 min',
    line: '„Ein Planet, der auf der Seite liegt.“',
    aha: 'An seinen Polen dauert ein Tag 42 Jahre, danach folgen 42 Jahre Nacht.',
    facts: { diameter: '50.724 km', day: '17 h 14 min', year: '84 Erdjahre', temperature: '−195 °C', light: '2 h 40 min' },
    period: 84.01,
    orbit: { x: -111, y: 173, size: 12, color: '#9fd6dd' },
    moons: [],
    credit: 'uranus',
    alt: 'Uranus, eine fast strukturlose blassblaue Kugel.',
  },
  {
    id: 'neptun',
    name: 'Neptun',
    dative: 'dem Neptun',
    distance: '4,5 Mrd. km',
    light: 'gut 4 h',
    line: '„Gefunden mit Papier und Bleistift, bevor ihn je ein Mensch gesehen hat.“',
    aha: 'Seit seiner Entdeckung 1846 hat er die Sonne erst ein einziges Mal umrundet. Seine Winde erreichen bis zu 2.000 km/h.',
    facts: { diameter: '49.244 km', day: '16 h 6 min', year: '165 Erdjahre', temperature: '−200 °C', light: 'gut 4 h' },
    period: 164.8,
    orbit: { x: -154, y: -184, size: 12, color: '#5f86e0' },
    moons: [],
    credit: 'neptune',
    alt: 'Neptun, eine tiefblaue Kugel mit hellen Wolkenstreifen.',
  },
];

export const MOONS: Readonly<Record<MoonId, Moon>> = {
  io: { id: 'io', name: 'Io', line: 'Auf Io brechen mehr Vulkane aus als irgendwo sonst im Sonnensystem.' },
  europa: { id: 'europa', name: 'Europa', line: 'Unter Europas Eispanzer liegt ein Ozean, wohl mit mehr Wasser als alle Meere der Erde.' },
  ganymed: { id: 'ganymed', name: 'Ganymed', line: 'Der grösste Mond des Sonnensystems, grösser als der Planet Merkur.' },
  kallisto: { id: 'kallisto', name: 'Kallisto', line: 'Seine Krater sind so alt wie das Sonnensystem selbst.' },
  titan: { id: 'titan', name: 'Titan', line: 'Auf Titan gibt es Seen und Flüsse, doch statt Wasser fliesst dort flüssiges Methan.' },
  enceladus: { id: 'enceladus', name: 'Enceladus', line: 'Aus seinem Südpol schiessen Fontänen aus Wasser ins All.' },
};

export function findPlanet(id: PlanetId): Planet {
  const planet = PLANETS.find((p) => p.id === id);
  if (!planet) {
    throw new Error(`Unknown planet ${id}`);
  }
  return planet;
}

/** The three stars of the Alpha Centauri system and the next star systems around the Sun. */
export type StarId =
  | 'alpha-centauri-a'
  | 'alpha-centauri-b'
  | 'proxima'
  | 'barnard'
  | 'luhman-16'
  | 'wise-0855'
  | 'wolf-359'
  | 'lalande-21185'
  | 'sirius';

/** The labelled spiral arms of the Milky Way and its central black hole. */
export type GalaxyPartId = 'sgr-a' | 'scutum-centaurus-arm' | 'sagittarius-arm' | 'orion-arm' | 'perseus-arm';

/** The galaxies of the Local Group that are named in the picture. */
export type GalaxyId = 'milchstrasse' | 'andromeda' | 'dreiecksgalaxie' | 'grosse-magellansche-wolke' | 'kleine-magellansche-wolke';

/** The giant structures and remarkable places named in the picture of the whole universe. */
export type CosmicId =
  | 'laniakea'
  | 'bootes-leerraum'
  | 'herkules-mauer'
  | 'geschosshaufen'
  | 'webb-deep-field'
  | 'jades-gs-z14-0'
  | 'ton-618'
  | 'mikrowellenhintergrund';

/** Everything that can be looked at up close: planets, Moon, Sun, Voyager 1, neighbouring stars, parts of the Milky Way, galaxies and cosmic structures. */
export type BodyId = PlanetId | StarId | GalaxyPartId | GalaxyId | CosmicId | 'mond' | 'sonne' | 'voyager';

/** A body in the close-up view. */
export interface Body {
  readonly id: BodyId;
  readonly name: string;
  /** Distance as shown, and what it is measured to ("zur Sonne", "zur Erde"). */
  readonly distance: string;
  readonly reference: string;
  readonly light: string;
  readonly line: string;
  readonly aha: string;
  /** Lines of the fact sheet. */
  readonly facts: readonly string[];
  /** The planet behind this body, when there is one (age, dative form, orbital period). */
  readonly planet?: Planet;
  readonly color: string;
  readonly moons: readonly MoonId[];
  /** Base name of the texture under journey/tex. */
  readonly texture: string;
  /** Glows by itself instead of being lit from the side (the Sun and other stars). */
  readonly emissive?: boolean;
  /** Colour the texture is tinted with (stars that share the Sun's surface texture). */
  readonly tint?: string;
  /** A picture shown instead of the rotatable sphere (Voyager 1), under journey/img. */
  readonly picture?: { readonly src: string; readonly width: number; readonly height: number };
  readonly credit: CreditId;
  readonly alt: string;
  /** The stage the close-up returns to (shown), and the back control's accessible name. */
  readonly backTo: string;
  readonly backLabel: string;
}

const MOON: Body = {
  id: 'mond',
  backTo: 'Erde und Mond',
  backLabel: 'Zurück zu Erde und Mond',
  name: 'Mond',
  distance: '384.400 km',
  reference: 'zur Erde',
  light: '1,3 s',
  line: '„Der einzige andere Ort, auf dem Menschen je gestanden haben.“',
  aha: 'Zwölf Menschen sind auf ihm gelaufen, zwischen 1969 und 1972. Seitdem war niemand mehr dort.',
  facts: [
    'Durchmesser 3.474 km, gut ein Viertel der Erde',
    'Er umkreist die Erde in 27,3 Tagen und zeigt ihr dabei immer dieselbe Seite.',
    'Temperatur −170 °C in der Nacht bis 120 °C am Tag',
    'Er entfernt sich jedes Jahr um knapp 4 cm von der Erde.',
    'Licht von hier braucht 1,3 Sekunden bis zur Erde.',
  ],
  color: '#c9c6bd',
  moons: [],
  texture: 'mond',
  credit: 'moon',
  alt: 'Der Mond, eine graue Kugel mit hellen Hochländern, dunklen Ebenen und Kratern.',
};

const SUN: Body = {
  id: 'sonne',
  backTo: 'Sonnensystem',
  backLabel: 'Zurück zum Sonnensystem',
  name: 'Sonne',
  distance: '150 Mio. km',
  reference: 'zur Erde',
  light: '8 min 20 s',
  line: '„Ein Stern wie Milliarden andere. Für uns der einzige, der zählt.“',
  aha: 'Über eine Million Erden hätten in ihr Platz.',
  facts: [
    'Durchmesser 1,39 Mio. km, das 109-Fache der Erde',
    'Sie enthält rund 99,86 % der Masse des Sonnensystems.',
    'An der Oberfläche ca. 5.500 °C, im Kern ca. 15 Mio. °C',
    'Sie ist ca. 4,6 Milliarden Jahre alt.',
    'Ihr Licht braucht 8 min 20 s bis zur Erde.',
  ],
  color: '#ffb347',
  moons: [],
  texture: 'sonne',
  emissive: true,
  credit: 'sun-texture',
  alt: 'Die Sonne, eine glühende orange Kugel mit hellen, brodelnden Flecken.',
};

const VOYAGER: Body = {
  id: 'voyager',
  backTo: 'Sonnensystem',
  backLabel: 'Zurück zum Sonnensystem',
  name: 'Voyager 1',
  distance: 'ca. 25,9 Mrd. km',
  reference: 'zur Erde',
  light: 'ca. 1 Tag',
  line: '„Das am weitesten entfernte Ding, das Menschen je gebaut haben.“',
  aha: 'Seit 1977 unterwegs, mit rund 61.000 km/h. Ein Funkspruch zu ihr braucht jetzt einen ganzen Tag, die Antwort noch einen.',
  facts: [
    'Gestartet am 5. September 1977, gebaut für eine Reise von wenigen Jahren',
    'Geschwindigkeit rund 17 km/s, gut 61.000 km/h',
    'Seit August 2012 im interstellaren Raum, jenseits des Sonnenwinds',
    'Am 14. Februar 1990 fotografierte sie die Erde aus 6 Mrd. km Entfernung als winzigen Punkt („Pale Blue Dot“).',
    'An Bord: eine goldene Schallplatte mit Grüssen in 55 Sprachen, Musik und Geräuschen der Erde',
    'Im November 2026 erreicht sie als erstes menschengemachtes Objekt einen Lichttag Entfernung.',
  ],
  color: '#cfd6e6',
  moons: [],
  texture: '',
  picture: { src: 'journey/img/voyager-480.webp', width: 480, height: 396 },
  credit: 'voyager',
  alt: 'Die Raumsonde Voyager 1 vor dem Sternenhimmel: eine grosse weisse Parabolantenne, darunter der goldene Sondenkörper und lange Messausleger.',
};

const ALPHA_CENTAURI_BACK = { backTo: 'Benachbarte Sternensysteme', backLabel: 'Zurück zu den benachbarten Sternensystemen' } as const;

const STARS: Readonly<Record<StarId, Body>> = {
  'alpha-centauri-a': {
    id: 'alpha-centauri-a',
    ...ALPHA_CENTAURI_BACK,
    name: 'Alpha Centauri A',
    distance: 'ca. 4,37 Lichtjahre',
    reference: 'zur Erde',
    light: 'ca. 4 Jahre 4 Monate',
    line: '„Eine zweite Sonne, fast genau wie unsere.“',
    aha: 'Von hier aus gesehen wäre unsere Sonne ein heller Stern im Sternbild Kassiopeia.',
    facts: [
      'Durchmesser ca. 1,7 Mio. km, gut das 1,2-Fache der Sonne',
      'Ein gelber Stern derselben Art wie die Sonne, mit etwas mehr Masse',
      'An der Oberfläche ca. 5.500 °C, sie leuchtet rund 1,5-mal so hell wie die Sonne.',
      'A und B umkreisen einander in knapp 80 Jahren.',
      'Ihr Licht braucht ca. 4,37 Jahre bis zur Erde.',
    ],
    color: '#ffe7b0',
    moons: [],
    texture: 'sonne',
    emissive: true,
    credit: 'stars',
    alt: 'Alpha Centauri A, eine glühende gelbe Kugel, ähnlich der Sonne.',
  },
  'alpha-centauri-b': {
    id: 'alpha-centauri-b',
    ...ALPHA_CENTAURI_BACK,
    name: 'Alpha Centauri B',
    distance: 'ca. 4,37 Lichtjahre',
    reference: 'zur Erde',
    light: 'ca. 4 Jahre 4 Monate',
    line: '„Die kleinere, orange Schwester. Zusammen leuchten beide als dritthellster Stern am Nachthimmel.“',
    aha: 'Der Abstand zwischen A und B schwankt zwischen etwa der Entfernung Sonne–Saturn und Sonne–Pluto.',
    facts: [
      'Durchmesser ca. 1,2 Mio. km, knapp neun Zehntel der Sonne',
      'Ein orangefarbener Stern, etwas kühler und kleiner als die Sonne',
      'An der Oberfläche ca. 5.000 °C, sie leuchtet halb so hell wie die Sonne.',
      'Abstand zu A zwischen ca. 11 und 36 Astronomischen Einheiten',
      'Ihr Licht braucht ca. 4,37 Jahre bis zur Erde.',
    ],
    color: '#ffbe6b',
    moons: [],
    texture: 'sonne',
    emissive: true,
    tint: '#ffb066',
    credit: 'stars',
    alt: 'Alpha Centauri B, eine glühende orange Kugel.',
  },
  proxima: {
    id: 'proxima',
    ...ALPHA_CENTAURI_BACK,
    name: 'Proxima Centauri',
    distance: 'ca. 4,24 Lichtjahre',
    reference: 'zur Erde',
    light: 'ca. 4 Jahre 3 Monate',
    line: '„Der nächste Stern nach der Sonne. Und doch zu schwach, um ihn mit blossem Auge zu sehen.“',
    aha: 'Um Proxima kreist ein Planet, Proxima b, in einem Abstand, bei dem es flüssiges Wasser geben könnte. Ein Jahr dauert dort nur gut 11 Tage.',
    facts: [
      'Durchmesser ca. 210.000 km, nur anderthalbmal so gross wie Jupiter',
      'Ein Roter Zwerg mit gut einem Achtel der Masse der Sonne',
      'An der Oberfläche ca. 2.800 °C; heftige Strahlungsausbrüche lassen ihn immer wieder aufleuchten.',
      'Er umkreist A und B in rund 13.000 Astronomischen Einheiten Abstand, eine Runde dauert über 500.000 Jahre.',
      'Sein Licht braucht ca. 4,24 Jahre bis zur Erde.',
    ],
    color: '#ff6a45',
    moons: [],
    texture: 'sonne',
    emissive: true,
    tint: '#ff5a3a',
    credit: 'stars',
    alt: 'Proxima Centauri, eine kleine, glühende rote Kugel.',
  },
  barnard: {
    id: 'barnard',
    ...ALPHA_CENTAURI_BACK,
    name: 'Barnards Pfeilstern',
    distance: 'ca. 6 Lichtjahre',
    reference: 'zur Erde',
    light: 'ca. 6 Jahre',
    line: '„Der Stern, der am schnellsten über unseren Himmel zieht.“',
    aha: 'In rund 180 Jahren wandert er am Himmel um eine ganze Vollmondbreite weiter. Und er kommt näher: In knapp 10.000 Jahren ist er nur noch 3,8 Lichtjahre entfernt.',
    facts: [
      'Ein Roter Zwerg, ein Einzelstern mit gut einem Sechstel der Masse der Sonne',
      'Durchmesser ca. 260.000 km, knapp doppelt so gross wie Jupiter',
      'An der Oberfläche ca. 2.900 °C, mit blossem Auge nicht sichtbar',
      'Seit 2024 und 2025 kennt man vier kleine Planeten, die ihn sehr eng umkreisen.',
      'Sein Licht braucht ca. 6 Jahre bis zur Erde.',
    ],
    color: '#ff7a55',
    moons: [],
    texture: 'sonne',
    emissive: true,
    tint: '#ff6040',
    credit: 'stars',
    alt: 'Barnards Pfeilstern, eine kleine, glühende rote Kugel.',
  },
  'luhman-16': {
    id: 'luhman-16',
    ...ALPHA_CENTAURI_BACK,
    name: 'Luhman 16',
    distance: 'ca. 6,5 Lichtjahre',
    reference: 'zur Erde',
    light: 'ca. 6,5 Jahre',
    line: '„Zwei gescheiterte Sterne: zu gross für Planeten, zu klein, um wie eine Sonne zu leuchten.“',
    aha: 'Erst 2013 entdeckt, obwohl so nah. Auf einem der beiden hat man schon Wetter beobachtet: Wolkenbänder, die sich innerhalb von Stunden verändern.',
    facts: [
      'Zwei Braune Zwerge, jeder etwa so gross wie Jupiter, aber rund 30-mal so schwer',
      'Für die Kernfusion wie in der Sonne reicht ihre Masse nicht; sie glühen nur schwach nach.',
      'Sie umkreisen einander in rund 27 Jahren, im Abstand von etwa 3,5 Astronomischen Einheiten.',
      'An der Oberfläche ca. 1.000 °C, so heiss wie Lava',
      'Ihr Licht braucht ca. 6,5 Jahre bis zur Erde.',
    ],
    color: '#c0603a',
    moons: [],
    texture: 'saturn',
    emissive: true,
    tint: '#b4502e',
    credit: 'stars',
    alt: 'Luhman 16, eine dunkel rotbraun glimmende Kugel mit Wolkenbändern.',
  },
  'wise-0855': {
    id: 'wise-0855',
    ...ALPHA_CENTAURI_BACK,
    name: 'WISE 0855-0714',
    distance: 'ca. 7,3 Lichtjahre',
    reference: 'zur Erde',
    light: 'ca. 7,3 Jahre',
    line: '„So kalt wie ein Wintertag auf der Erde. Und ganz allein, ohne Sonne.“',
    aha: 'Er leuchtet fast nur im Infraroten, für unsere Augen ist er unsichtbar. Das Weltraumteleskop James Webb hat in seiner Luft Wasserdampf gefunden.',
    facts: [
      'Der kälteste bekannte Braune Zwerg, entdeckt 2014',
      'Etwa so gross wie Jupiter, mit einigen Jupitermassen',
      'Temperatur ungefähr −20 °C; in seiner Luft gibt es wohl Wolken aus Wassereis.',
      'Er kreist um keinen Stern, sondern zieht allein durch die Milchstrasse.',
      'Sein Licht braucht ca. 7,3 Jahre bis zur Erde.',
    ],
    color: '#8a4636',
    moons: [],
    texture: 'saturn',
    emissive: true,
    tint: '#6e3428',
    credit: 'stars',
    alt: 'WISE 0855-0714, eine sehr dunkle, rotbraune Kugel mit schwachen Wolkenbändern.',
  },
  'wolf-359': {
    id: 'wolf-359',
    ...ALPHA_CENTAURI_BACK,
    name: 'Wolf 359',
    distance: 'ca. 7,9 Lichtjahre',
    reference: 'zur Erde',
    light: 'ca. 7,9 Jahre',
    line: '„Ein winziger, unruhiger Roter Zwerg, der immer wieder aufflackert.“',
    aha: 'Bei seinen Strahlungsausbrüchen wird er innerhalb von Minuten um ein Vielfaches heller.',
    facts: [
      'Ein Roter Zwerg mit gut einem Zehntel der Masse der Sonne',
      'Durchmesser ca. 220.000 km, nur anderthalbmal so gross wie Jupiter',
      'An der Oberfläche ca. 2.500 °C; er leuchtet nur mit einem Tausendstel der Kraft der Sonne.',
      'Benannt nach dem Astronomen Max Wolf, der ihn 1918 auf Fotoplatten fand',
      'Sein Licht braucht ca. 7,9 Jahre bis zur Erde.',
    ],
    color: '#ff6a45',
    moons: [],
    texture: 'sonne',
    emissive: true,
    tint: '#ff5030',
    credit: 'stars',
    alt: 'Wolf 359, eine kleine, glühende rote Kugel.',
  },
  'lalande-21185': {
    id: 'lalande-21185',
    ...ALPHA_CENTAURI_BACK,
    name: 'Lalande 21185',
    distance: 'ca. 8,3 Lichtjahre',
    reference: 'zur Erde',
    light: 'ca. 8,3 Jahre',
    line: '„Der hellste Rote Zwerg am Nordhimmel. Mit einem Fernglas kann man ihn sehen.“',
    aha: 'Er nähert sich uns: In rund 20.000 Jahren ist er nur noch etwa 4,7 Lichtjahre entfernt.',
    facts: [
      'Ein Roter Zwerg mit rund 40 % der Masse der Sonne',
      'Durchmesser ca. 550.000 km, gut ein Drittel der Sonne',
      'An der Oberfläche ca. 3.300 °C',
      'Er steht im Sternbild Grosser Bär; man kennt zwei Planeten, die ihn umkreisen.',
      'Sein Licht braucht ca. 8,3 Jahre bis zur Erde.',
    ],
    color: '#ff8a5a',
    moons: [],
    texture: 'sonne',
    emissive: true,
    tint: '#ff7048',
    credit: 'stars',
    alt: 'Lalande 21185, eine glühende rotorange Kugel.',
  },
  sirius: {
    id: 'sirius',
    ...ALPHA_CENTAURI_BACK,
    name: 'Sirius',
    distance: 'ca. 8,6 Lichtjahre',
    reference: 'zur Erde',
    light: 'ca. 8,6 Jahre',
    line: '„Der hellste Stern am Nachthimmel. Und er hat einen fast unsichtbaren Begleiter.“',
    aha: 'Sirius B ist ein Weisser Zwerg: so schwer wie die Sonne, aber kaum grösser als die Erde. Ein Teelöffel seiner Materie wöge mehrere Tonnen.',
    facts: [
      'Ein Doppelstern: Sirius A und der Weisse Zwerg Sirius B umkreisen einander in rund 50 Jahren.',
      'Sirius A hat den 1,7-fachen Durchmesser der Sonne und leuchtet rund 25-mal so hell.',
      'An der Oberfläche von Sirius A ca. 9.700 °C, darum leuchtet er weiss-bläulich.',
      'Sirius B ist der ausgebrannte Rest eines Sterns, etwa so gross wie die Erde.',
      'Sein Licht braucht ca. 8,6 Jahre bis zur Erde.',
    ],
    color: '#e4ecff',
    moons: [],
    texture: 'sonne',
    emissive: true,
    tint: '#e8efff',
    credit: 'stars',
    alt: 'Sirius A, eine grosse, weiss-bläulich glühende Kugel.',
  },
};

export function isStarId(id: BodyId): id is StarId {
  return id in STARS;
}

const MILKY_WAY_BACK = { backTo: 'Milchstrasse', backLabel: 'Zurück zur Milchstrasse' } as const;
const MILKY_WAY_PICTURE = { src: 'journey/img/milky-way-960.webp', width: 960, height: 960 } as const;

/** Parts of the Milky Way: shown as pictures, not as rotatable spheres. */
const GALAXY_PARTS: Readonly<Record<GalaxyPartId, Body>> = {
  'sgr-a': {
    id: 'sgr-a',
    ...MILKY_WAY_BACK,
    name: 'Sagittarius A*',
    distance: 'ca. 26.000 Lichtjahre',
    reference: 'zur Erde',
    light: 'ca. 26.000 Jahre',
    line: '„Im Herzen unserer Galaxie: etwas, aus dem nicht einmal Licht entkommt.“',
    aha: 'Rund 4 Millionen Sonnenmassen, zusammengedrückt auf einen Raum, der in die Bahn des Merkur passen würde.',
    facts: [
      'Ein supermassereiches Schwarzes Loch mit rund 4 Millionen Sonnenmassen',
      'Man kennt seine Masse, weil Sterne es in wenigen Jahren umrunden; der Stern S2 braucht nur 16 Jahre für eine Runde.',
      'Für diese Messungen gab es 2020 den Nobelpreis für Physik (Reinhard Genzel und Andrea Ghez).',
      '2022 zeigte das Event Horizon Telescope das erste Bild seines Schattens, umgeben von einem Ring aus Licht.',
      'Sein Licht braucht ca. 26.000 Jahre bis zur Erde.',
    ],
    color: '#ffb066',
    moons: [],
    texture: '',
    picture: { src: 'journey/img/sgr-a-480.webp', width: 480, height: 480 },
    credit: 'sgr-a',
    alt: 'Aufnahme des Event Horizon Telescope: ein orange leuchtender Ring aus heissem Gas um einen dunklen Schatten in der Mitte.',
  },
  'scutum-centaurus-arm': {
    id: 'scutum-centaurus-arm',
    ...MILKY_WAY_BACK,
    name: 'Scutum-Centaurus-Arm',
    distance: 'ca. 10.000 Lichtjahre',
    reference: 'zur Erde, Richtung Zentrum',
    light: '',
    line: '„Einer der beiden grossen Arme. Er beginnt am Ende des Balkens im Zentrum.“',
    aha: 'Zusammen mit dem Perseus-Arm trägt er die meisten älteren Sterne der Scheibe. Die anderen Arme sind vor allem Gas und junge Sterne.',
    facts: [
      'Einer der zwei Hauptarme der Milchstrasse',
      'Er entspringt am nahen Ende des Balkens und windet sich um die ganze Galaxie.',
      'Das Weltraumteleskop Spitzer zählte 2008 im Infraroten die Sterne in der Scheibe und zeigte: Hier und im Perseus-Arm stehen die meisten.',
      'Von der Erde aus blicken wir in Richtung der Sternbilder Schild (Scutum) und Zentaur (Centaurus) auf ihn.',
    ],
    color: '#b8c4ff',
    moons: [],
    texture: '',
    picture: MILKY_WAY_PICTURE,
    credit: 'milky-way',
    alt: 'Rekonstruktion der Milchstrasse von oben. Der Scutum-Centaurus-Arm windet sich vom Ende des Balkens um die Galaxie.',
  },
  'sagittarius-arm': {
    id: 'sagittarius-arm',
    ...MILKY_WAY_BACK,
    name: 'Sagittarius-Arm',
    distance: 'ca. 5.000 Lichtjahre',
    reference: 'zur Erde, Richtung Zentrum',
    light: '',
    line: '„Der nächste Arm zwischen uns und dem Zentrum. Voller leuchtender Gaswolken.“',
    aha: 'Hier liegen der Adlernebel mit den berühmten „Säulen der Schöpfung“ und der Lagunennebel, Orte, an denen gerade neue Sterne entstehen.',
    facts: [
      'Auch Sagittarius-Carina-Arm genannt, ein kleinerer Arm',
      'Er liegt zwischen dem Orion-Arm und dem Zentrum der Galaxie.',
      'Viele Sternentstehungsgebiete: Adlernebel, Lagunennebel, Carinanebel',
      'Von der Erde aus sehen wir ihn in Richtung der Sternbilder Schütze (Sagittarius) und Kiel des Schiffs (Carina).',
    ],
    color: '#b8c4ff',
    moons: [],
    texture: '',
    picture: MILKY_WAY_PICTURE,
    credit: 'milky-way',
    alt: 'Rekonstruktion der Milchstrasse von oben. Der Sagittarius-Arm verläuft zwischen der Sonne und dem hellen Zentrum.',
  },
  'orion-arm': {
    id: 'orion-arm',
    ...MILKY_WAY_BACK,
    name: 'Orion-Arm',
    distance: 'Hier wohnen wir',
    reference: 'die Sonne liegt mittendrin',
    light: '',
    line: '„Unser Zuhause in der Galaxie. Kein grosser Arm, sondern ein stiller Seitenarm.“',
    aha: 'Fast jeder Stern, den du nachts siehst, gehört zu diesem Arm.',
    facts: [
      'Ein kleinerer Nebenarm, ca. 10.000 Lichtjahre lang und ca. 3.500 Lichtjahre breit',
      'Er liegt zwischen dem Sagittarius-Arm und dem Perseus-Arm.',
      'In ihm liegen der Orionnebel, Beteigeuze und Rigel, daher sein Name.',
      'Lange hielt man ihn für einen blossen Ausläufer; neuere Messungen zeigen, dass er grösser ist als gedacht.',
    ],
    color: '#b8c4ff',
    moons: [],
    texture: '',
    picture: { src: 'journey/img/orion-arm-960.webp', width: 960, height: 960 },
    credit: 'orion-arm',
    alt: 'Ausschnitt der Milchstrassen-Rekonstruktion um die Sonne: ein Band aus Sternen und leuchtenden Gaswolken.',
  },
  'perseus-arm': {
    id: 'perseus-arm',
    ...MILKY_WAY_BACK,
    name: 'Perseus-Arm',
    distance: 'ca. 6.400 Lichtjahre',
    reference: 'zur Erde, nach aussen',
    light: '',
    line: '„Der grosse Arm jenseits von uns, auf der Aussenseite der Galaxie.“',
    aha: 'Im Perseus-Arm liegt der Krebsnebel: die Wolke einer Sternexplosion, die Menschen im Jahr 1054 sogar am Tag sahen.',
    facts: [
      'Einer der zwei Hauptarme der Milchstrasse',
      'Er entspringt am fernen Ende des Balkens und läuft aussen an der Sonne vorbei.',
      'Hier liegen der Doppelsternhaufen h und χ Persei und der Krebsnebel.',
      'Von der Erde aus sehen wir ihn in Richtung der Sternbilder Perseus und Kassiopeia.',
    ],
    color: '#b8c4ff',
    moons: [],
    texture: '',
    picture: MILKY_WAY_PICTURE,
    credit: 'milky-way',
    alt: 'Rekonstruktion der Milchstrasse von oben. Der Perseus-Arm läuft aussen an der Sonne vorbei um die Galaxie.',
  },
};

export function isGalaxyPartId(id: BodyId): id is GalaxyPartId {
  return id in GALAXY_PARTS;
}

const LOCAL_GROUP_BACK = { backTo: 'Lokale Gruppe', backLabel: 'Zurück zur Stufe Lokale Gruppe' } as const;

/** The named galaxies of the Local Group: shown as pictures. */
const GALAXIES: Readonly<Record<GalaxyId, Body>> = {
  milchstrasse: {
    id: 'milchstrasse',
    ...LOCAL_GROUP_BACK,
    name: 'Milchstrasse',
    distance: 'Hier wohnen wir',
    reference: 'die Erde liegt in ihr',
    light: '',
    line: '„Unsere Galaxie. Von hier aus gesehen nur einer von vielen Lichtflecken.“',
    aha: 'Die Sonne braucht rund 230 Millionen Jahre für eine Runde um das Zentrum. Als sie zuletzt hier stand, gab es noch keine Dinosaurier.',
    facts: [
      'Durchmesser ca. 100.000 Lichtjahre, 100 bis 400 Milliarden Sterne',
      'Eine Balkenspiralgalaxie, die zweitgrösste der Lokalen Gruppe',
      'Die Sonne liegt ca. 26.000 Lichtjahre vom Zentrum entfernt.',
      'Das Bild ist eine Rekonstruktion aus Messdaten: Niemand hat die Milchstrasse je von aussen fotografiert.',
    ],
    color: '#fff0cd',
    moons: [],
    texture: '',
    picture: MILKY_WAY_PICTURE,
    credit: 'milky-way',
    alt: 'Rekonstruktion der Milchstrasse von oben: ein heller, länglicher Kern mit Spiralarmen.',
  },
  andromeda: {
    id: 'andromeda',
    ...LOCAL_GROUP_BACK,
    name: 'Andromeda',
    distance: 'ca. 2,5 Millionen Lichtjahre',
    reference: 'zur Erde',
    light: 'ca. 2,5 Mio. Jahre',
    line: '„Die grösste Galaxie der Lokalen Gruppe. Und sie kommt auf uns zu.“',
    aha: 'In rund 4 bis 5 Milliarden Jahren stossen Andromeda und die Milchstrasse zusammen. Die Sterne selbst prallen dabei fast nie aufeinander, so viel Platz ist zwischen ihnen.',
    facts: [
      'Durchmesser ca. 150.000 bis 200.000 Lichtjahre, rund 1 Billion Sterne',
      'Sie nähert sich der Milchstrasse mit ca. 110 km pro Sekunde.',
      'Das Fernste, was man mit blossem Auge sehen kann: ein schwacher, länglicher Fleck am Herbsthimmel',
      'Ihr Licht braucht ca. 2,5 Millionen Jahre bis zur Erde.',
    ],
    color: '#fff0d2',
    moons: [],
    texture: '',
    picture: { src: 'journey/img/andromeda-960.webp', width: 960, height: 631 },
    credit: 'andromeda',
    alt: 'Foto der Andromeda-Galaxie: eine schräg gesehene, helle Spiralscheibe mit dunklen Staubbändern.',
  },
  dreiecksgalaxie: {
    id: 'dreiecksgalaxie',
    ...LOCAL_GROUP_BACK,
    name: 'Dreiecksgalaxie',
    distance: 'ca. 2,7 Millionen Lichtjahre',
    reference: 'zur Erde',
    light: 'ca. 2,7 Mio. Jahre',
    line: '„Die kleine Schwester: die dritte grosse Spiralgalaxie der Lokalen Gruppe.“',
    aha: 'Unter sehr dunklem Himmel ist sie gerade noch mit blossem Auge zu erahnen. Sie ist eines der fernsten Dinge, die man überhaupt ohne Fernrohr sehen kann.',
    facts: [
      'Auch M33 genannt, im Sternbild Dreieck (Triangulum)',
      'Durchmesser ca. 60.000 Lichtjahre, rund 40 Milliarden Sterne',
      'Wahrscheinlich ein Begleiter von Andromeda',
      'Die rosa Flecken sind Gaswolken, in denen gerade neue Sterne entstehen.',
      'Ihr Licht braucht ca. 2,7 Millionen Jahre bis zur Erde.',
    ],
    color: '#dce1ff',
    moons: [],
    texture: '',
    picture: { src: 'journey/img/triangulum-960.webp', width: 960, height: 960 },
    credit: 'triangulum',
    alt: 'Foto der Dreiecksgalaxie: eine lockere, bläulich-weisse Spirale mit vielen rosa leuchtenden Gaswolken.',
  },
  'grosse-magellansche-wolke': {
    id: 'grosse-magellansche-wolke',
    ...LOCAL_GROUP_BACK,
    name: 'Grosse Magellansche Wolke',
    distance: 'ca. 160.000 Lichtjahre',
    reference: 'zur Erde',
    light: 'ca. 160.000 Jahre',
    line: '„Eine Zwerggalaxie, die die Milchstrasse begleitet. Vom Süden aus ein heller Fleck am Nachthimmel.“',
    aha: '1987 explodierte in ihr ein Stern. Die Supernova 1987A war die nächste, die Menschen seit der Erfindung des Fernrohrs gesehen haben.',
    facts: [
      'Durchmesser ca. 30.000 Lichtjahre, rund 30 Milliarden Sterne',
      'Nur von der Südhalbkugel aus zu sehen, mit blossem Auge',
      'In ihr liegt der Tarantelnebel, das hellste Sternentstehungsgebiet der Lokalen Gruppe (der helle rosa Fleck links).',
      'Benannt nach Ferdinand Magellan, dessen Mannschaft sie 1519 auf der ersten Weltumsegelung beschrieb.',
      'Ihr Licht braucht ca. 160.000 Jahre bis zur Erde.',
    ],
    color: '#dce1ff',
    moons: [],
    texture: '',
    picture: { src: 'journey/img/lmc-960.webp', width: 960, height: 1049 },
    credit: 'lmc',
    alt: 'Foto der Grossen Magellanschen Wolke: ein breites, bläuliches Sternenband mit rosa leuchtenden Gaswolken.',
  },
  'kleine-magellansche-wolke': {
    id: 'kleine-magellansche-wolke',
    ...LOCAL_GROUP_BACK,
    name: 'Kleine Magellansche Wolke',
    distance: 'ca. 200.000 Lichtjahre',
    reference: 'zur Erde',
    light: 'ca. 200.000 Jahre',
    line: '„Die kleinere der beiden Wolken. An ihr lernten wir, das Universum zu vermessen.“',
    aha: 'Henrietta Leavitt fand hier 1912 heraus, wie man aus dem Blinken bestimmter Sterne ihre Entfernung bestimmt. Damit wurde später gezeigt, dass Andromeda weit ausserhalb der Milchstrasse liegt.',
    facts: [
      'Eine Zwerggalaxie mit einigen hundert Millionen Sternen',
      'Nur von der Südhalbkugel aus zu sehen, mit blossem Auge',
      'Sie wird von der Grossen Magellanschen Wolke und der Milchstrasse verformt.',
      'Ihr Licht braucht ca. 200.000 Jahre bis zur Erde.',
    ],
    color: '#dce1ff',
    moons: [],
    texture: '',
    picture: { src: 'journey/img/smc-960.webp', width: 960, height: 998 },
    credit: 'smc',
    alt: 'Foto der Kleinen Magellanschen Wolke: ein unregelmässiger, grünlich-weisser Sternennebel mit einzelnen rötlichen Gaswolken.',
  },
};

export function isGalaxyId(id: BodyId): id is GalaxyId {
  return id in GALAXIES;
}

const UNIVERSE_BACK = { backTo: 'Universum', backLabel: 'Zurück zur Stufe Universum' } as const;
const COSMIC_WEB_PICTURE = { src: 'journey/img/cosmic-web-678.webp', width: 678, height: 452 } as const;

/** The giant structures and remarkable places of the whole universe: shown as pictures. */
const COSMIC: Readonly<Record<CosmicId, Body>> = {
  laniakea: {
    id: 'laniakea',
    ...UNIVERSE_BACK,
    name: 'Laniakea-Superhaufen',
    distance: 'Hier wohnen wir',
    reference: 'die Milchstrasse liegt an seinem Rand',
    light: '',
    line: '„Unser Zuhause im ganz Grossen: ein Strom aus rund 100.000 Galaxien.“',
    aha: 'Laniakea ist Hawaiianisch und heisst „unermesslicher Himmel“. Alle seine Galaxien, auch unsere, treiben auf einen gemeinsamen Punkt zu: den Grossen Attraktor.',
    facts: [
      'Durchmesser ca. 520 Millionen Lichtjahre, rund 100.000 Galaxien',
      'Entdeckt 2014 von R. Brent Tully und Kollegen, aus den Bewegungen von über 8.000 Galaxien',
      'Die ganze Lokale Gruppe ist darin nur ein winziger Fleck am Rand.',
      'Das Bild ist eine Illustration nach der Karte von Tully und Kollegen: Die Linien zeigen, wohin die Galaxien strömen.',
    ],
    color: '#ffd27a',
    moons: [],
    texture: '',
    picture: { src: 'journey/img/laniakea-480.webp', width: 480, height: 598 },
    credit: 'laniakea',
    alt: 'Illustration des Laniakea-Superhaufens: eine goldene Wolke, in der helle Linien wie Flüsse auf einen Punkt zulaufen, ringsum blaue Linien benachbarter Superhaufen.',
  },
  'bootes-leerraum': {
    id: 'bootes-leerraum',
    ...UNIVERSE_BACK,
    name: 'Boötes-Leerraum',
    distance: 'ca. 700 Millionen Lichtjahre',
    reference: 'zur Erde',
    light: 'ca. 700 Mio. Jahre',
    line: '„Ein Loch im Universum. Fast nichts, auf 330 Millionen Lichtjahren.“',
    aha: 'Läge die Milchstrasse in seiner Mitte, hätten wir erst in den 1960er-Jahren erfahren, dass es überhaupt andere Galaxien gibt.',
    facts: [
      'Durchmesser ca. 330 Millionen Lichtjahre, einer der grössten bekannten Leerräume',
      'Wo man Tausende Galaxien erwarten würde, kennt man nur rund 60.',
      'Entdeckt 1981 von Robert Kirshner und Kollegen, im Sternbild Bärenhüter (Boötes)',
      'Vom Leerraum selbst gibt es kein Foto. Das Bild ist eine Simulation des kosmischen Netzes: Die dunklen Flecken sind Leerräume wie dieser.',
    ],
    color: '#8f7cff',
    moons: [],
    texture: '',
    picture: COSMIC_WEB_PICTURE,
    credit: 'cosmic-web',
    alt: 'Simulation des kosmischen Netzes: leuchtende Fäden aus Galaxien, dazwischen grosse dunkle Leerräume.',
  },
  'herkules-mauer': {
    id: 'herkules-mauer',
    ...UNIVERSE_BACK,
    name: 'Herkules-Corona-Borealis-Mauer',
    distance: 'ca. 10 Milliarden Lichtjahre',
    reference: 'zur Erde',
    light: 'ca. 10 Mrd. Jahre',
    line: '„Vielleicht das grösste Gebilde im Universum: rund 10 Milliarden Lichtjahre lang.“',
    aha: 'Licht bräuchte von einem Ende zum anderen mehr als doppelt so lange, wie es die Erde schon gibt.',
    facts: [
      'Länge ca. 10 Milliarden Lichtjahre',
      'Entdeckt 2013 durch eine auffällige Häufung von Gammablitzen in den Sternbildern Herkules und Nördliche Krone (Corona Borealis)',
      'Ob sie wirklich ein zusammenhängendes Gebilde ist, ist unter Fachleuten umstritten.',
      'Von ihr gibt es kein Foto. Das Bild ist eine Simulation des kosmischen Netzes: Die hellen Fäden zeigen, wie solche Wände aus Galaxien aussehen.',
    ],
    color: '#ff9fd0',
    moons: [],
    texture: '',
    picture: COSMIC_WEB_PICTURE,
    credit: 'cosmic-web',
    alt: 'Simulation des kosmischen Netzes: leuchtende Fäden und Wände aus Galaxien, dazwischen dunkle Leerräume.',
  },
  geschosshaufen: {
    id: 'geschosshaufen',
    ...UNIVERSE_BACK,
    name: 'Geschosshaufen',
    distance: 'ca. 3,7 Milliarden Lichtjahre',
    reference: 'zur Erde',
    light: 'ca. 3,7 Mrd. Jahre',
    line: '„Zwei Galaxienhaufen, die mitten durcheinander hindurchgerast sind.“',
    aha: 'Hier sieht man, dass es Dunkle Materie gibt: Das heisse Gas (rosa) wurde beim Zusammenstoss gebremst, doch der grösste Teil der Masse (blau) flog einfach weiter.',
    facts: [
      'Auch Bullet Cluster oder 1E 0657-56 genannt, im Sternbild Kiel des Schiffs (Carina)',
      'Der kleinere Haufen raste mit mehreren tausend Kilometern pro Sekunde durch den grösseren.',
      'Rosa: heisses Gas, gemessen mit dem Röntgenteleskop Chandra',
      'Blau: wo die meiste Masse steckt, ermittelt daraus, wie stark sie das Licht von Galaxien dahinter verbiegt',
      'Das Bild ist eine Aufnahme, eingefärbt nach Messdaten.',
    ],
    color: '#c58cff',
    moons: [],
    texture: '',
    picture: { src: 'journey/img/bullet-cluster-960.webp', width: 960, height: 694 },
    credit: 'bullet-cluster',
    alt: 'Aufnahme des Geschosshaufens: viele Galaxien als helle Punkte, darüber zwei rosa Gaswolken und links und rechts davon zwei blaue Wolken.',
  },
  'webb-deep-field': {
    id: 'webb-deep-field',
    ...UNIVERSE_BACK,
    name: 'Webbs erstes Deep Field',
    distance: 'ca. 4,6 Milliarden Lichtjahre',
    reference: 'zum Galaxienhaufen in der Mitte',
    light: 'ca. 4,6 Mrd. Jahre',
    line: '„Ein Sandkorn am ausgestreckten Arm. Und dahinter: Tausende Galaxien.“',
    aha: 'Das Bild zeigt ein Stück Himmel, so klein wie ein Sandkorn am ausgestreckten Arm. Darin leuchten Tausende Galaxien, jede mit Milliarden Sternen.',
    facts: [
      'Das erste Farbbild des James-Webb-Weltraumteleskops, veröffentlicht im Juli 2022',
      'In der Mitte steht der Galaxienhaufen SMACS 0723.',
      'Seine Masse wirkt wie eine Lupe: Die langgezogenen Bögen sind Galaxien weit dahinter, deren Licht verbogen wird.',
      'Belichtet wurde rund 12,5 Stunden lang.',
    ],
    color: '#ffcf9a',
    moons: [],
    texture: '',
    picture: { src: 'journey/img/webb-deep-field-960.webp', width: 960, height: 980 },
    credit: 'webb-deep-field',
    alt: 'Aufnahme des James-Webb-Teleskops: Tausende Galaxien als helle Flecken und orange Bögen, dazwischen einige Sterne mit langen Strahlenzacken.',
  },
  'jades-gs-z14-0': {
    id: 'jades-gs-z14-0',
    ...UNIVERSE_BACK,
    name: 'JADES-GS-z14-0',
    distance: 'ca. 34 Milliarden Lichtjahre',
    reference: 'zur Erde, heute',
    light: 'ca. 13,5 Mrd. Jahre',
    line: '„Wir sehen sie so, wie sie 290 Millionen Jahre nach dem Urknall war.“',
    aha: 'Ihr Licht war schon 9 Milliarden Jahre unterwegs, als die Erde entstand.',
    facts: [
      'Entdeckt 2024 mit dem James-Webb-Weltraumteleskop, eine der fernsten bekannten Galaxien',
      'Weil sich das Universum ausdehnt, ist sie heute viel weiter entfernt, als ihr Licht gereist ist.',
      'Schon damals war sie rund 1.600 Lichtjahre gross und überraschend hell. So früh hatte das niemand erwartet.',
      'Im Bild: ein Himmelsausschnitt voller Galaxien. Das vergrösserte Kästchen zeigt sie als rötlichen Fleck beim Pfeil, kaum mehr als ein paar Pixel.',
    ],
    color: '#ff8a5c',
    moons: [],
    texture: '',
    picture: { src: 'journey/img/jades-gs-z14-0-960.webp', width: 960, height: 938 },
    credit: 'jades-gs-z14-0',
    alt: 'Aufnahme des James-Webb-Teleskops: ein Himmelsausschnitt voller kleiner Galaxien. Ein vergrössertes Kästchen zeigt JADES-GS-z14-0 als rötlichen Fleck, auf den ein Pfeil zeigt.',
  },
  'ton-618': {
    id: 'ton-618',
    ...UNIVERSE_BACK,
    name: 'TON 618',
    distance: 'ca. 18 Milliarden Lichtjahre',
    reference: 'zur Erde, heute',
    light: 'ca. 10,8 Mrd. Jahre',
    line: '„Ein Lichtpunkt wie ein Stern. Dahinter: eines der schwersten Schwarzen Löcher, die man kennt.“',
    aha: 'Sein Schwarzes Loch wiegt rund 40 Milliarden Sonnen. Unser Sonnensystem bis zum Neptun passte mehr als zehnmal nebeneinander in seinen Ereignishorizont.',
    facts: [
      'Ein Quasar: Gas stürzt in das Schwarze Loch und wird dabei so heiss, dass es heller leuchtet als Tausende Milchstrassen zusammen.',
      'Masse des Schwarzen Lochs rund 40 Milliarden Sonnenmassen, ältere Schätzungen lagen bei 66 Milliarden',
      'Aufgeführt 1957 in einem Katalog schwacher blauer Sterne. Erst 1970 erkannte man, dass er ein Quasar ist.',
      'Im Sternbild Jagdhunde (Canes Venatici). Sein Licht war ca. 10,8 Milliarden Jahre unterwegs.',
      'Das Bild ist eine echte Aufnahme: Der blaue Punkt in der Mitte ist TON 618. Das Schwarze Loch selbst ist viel zu klein und zu weit weg, um es zu sehen.',
    ],
    color: '#9fc4ff',
    moons: [],
    texture: '',
    picture: { src: 'journey/img/ton-618-480.webp', width: 480, height: 480 },
    credit: 'ton-618',
    alt: 'Himmelsaufnahme des Sloan Digital Sky Survey: in der Mitte ein einzelner hellblauer Lichtpunkt, ringsum einige schwache Sterne und Galaxien.',
  },
  mikrowellenhintergrund: {
    id: 'mikrowellenhintergrund',
    ...UNIVERSE_BACK,
    name: 'Kosmischer Mikrowellenhintergrund',
    distance: 'ca. 46 Milliarden Lichtjahre',
    reference: 'am Rand des Sichtbaren, heute',
    light: 'ca. 13,8 Mrd. Jahre',
    line: '„Das älteste Licht, das es gibt. Weiter zurück kann niemand sehen.“',
    aha: 'Ein kleiner Teil des Rauschens in alten Fernsehern kam von diesem Licht: einem Nachglühen des Urknalls.',
    facts: [
      'Ausgesandt ca. 380.000 Jahre nach dem Urknall, als das Universum durchsichtig wurde',
      'Heute nur noch 2,7 Grad über dem absoluten Nullpunkt, also rund −270 °C',
      'Die Farbflecken sind winzige Temperaturunterschiede von wenigen Hunderttausendstel Grad: die Keime aller späteren Galaxien.',
      '1965 zufällig entdeckt von Arno Penzias und Robert Wilson. Zuerst hielten sie das Rauschen für eine Störung ihrer Antenne.',
      'Die Karte zeigt den ganzen Himmel, gemessen vom Satelliten Planck.',
    ],
    color: '#7fb6ff',
    moons: [],
    texture: '',
    picture: { src: 'journey/img/cmb-960.webp', width: 960, height: 480 },
    credit: 'cmb',
    alt: 'Himmelskarte des Satelliten Planck: ein Oval voller feiner blauer und oranger Flecken.',
  },
};

export function isCosmicId(id: BodyId): id is CosmicId {
  return id in COSMIC;
}

/** The close-up form of a planet. */
function planetBody(p: Planet): Body {
  const f = p.facts;
  return {
    id: p.id,
    name: p.name,
    distance: p.distance,
    reference: 'zur Sonne',
    backTo: 'Sonnensystem',
    backLabel: 'Zurück zum Sonnensystem',
    light: p.light,
    line: p.line,
    aha: p.aha,
    facts: [`Durchmesser ${f.diameter}`, `Ein Tag dauert ${f.day}, ein Jahr ${f.year}.`, `Temperatur ${f.temperature}`, `Licht von der Sonne braucht ${f.light}.`],
    planet: p,
    color: p.orbit.color,
    moons: p.moons,
    texture: p.id,
    credit: p.credit,
    alt: p.alt,
  };
}

export function isPlanetId(id: BodyId): id is PlanetId {
  return PLANETS.some((p) => p.id === id);
}

/** Whether a text (e.g. from the address) names a body that has a close-up. */
export function isBodyId(id: string | null | undefined): id is BodyId {
  if (!id) {
    return false;
  }
  const body = id as BodyId;
  return (
    id === 'mond' || id === 'sonne' || id === 'voyager' || isPlanetId(body) || isStarId(body) || isGalaxyPartId(body) || isGalaxyId(body) || isCosmicId(body)
  );
}

/** Where a close-up returns to, per stage: the Earth can be opened from every stage after the first. */
const STAGE_BACK: Readonly<Record<Exclude<StageId, 'erde'>, { readonly backTo: string; readonly backLabel: string }>> = {
  mond: { backTo: MOON.backTo, backLabel: MOON.backLabel },
  sonnensystem: { backTo: SUN.backTo, backLabel: SUN.backLabel },
  'alpha-centauri': ALPHA_CENTAURI_BACK,
  milchstrasse: MILKY_WAY_BACK,
  'lokale-gruppe': LOCAL_GROUP_BACK,
  universum: UNIVERSE_BACK,
};

/**
 * The body shown in the close-up view. `stage` is the stage it was opened from: the Sun can also be
 * selected at Alpha Centauri and then returns there.
 */
export function findBody(id: BodyId, stage?: StageId): Body {
  if (id === 'sonne' && stage === 'alpha-centauri') {
    return { ...SUN, ...ALPHA_CENTAURI_BACK };
  }
  if (id === 'erde' && stage && stage !== 'erde') {
    return { ...planetBody(findPlanet('erde')), ...STAGE_BACK[stage] };
  }
  if (isStarId(id)) {
    return STARS[id];
  }
  if (isGalaxyPartId(id)) {
    return GALAXY_PARTS[id];
  }
  if (isGalaxyId(id)) {
    return GALAXIES[id];
  }
  if (isCosmicId(id)) {
    return COSMIC[id];
  }
  if (id === 'mond') {
    return MOON;
  }
  if (id === 'sonne') {
    return SUN;
  }
  if (id === 'voyager') {
    return VOYAGER;
  }
  return planetBody(findPlanet(id));
}
