import { LIGHT_YEAR_M } from '../engine/format';
import { Point } from '../engine/zoom-math';
import { CreditId } from './credits';

export type StageId =
  | 'erde'
  | 'mond'
  | 'sonnensystem'
  | 'alpha-centauri'
  | 'milchstrasse'
  | 'lokale-gruppe'
  | 'universum';

/** A link from a stage to another module. */
export interface Branch {
  readonly label: string;
  /** Slug of the target module (see the home screen's module catalog). */
  readonly slug: string;
  /** Query of the link, e.g. the destination of the travel planner. */
  readonly queryParams?: Readonly<Record<string, string>>;
}

export interface Stage {
  readonly id: StageId;
  /** Short name on the scale bar. */
  readonly label: string;
  readonly title: string;
  /** The poetic line. */
  readonly line: string;
  readonly aha: string;
  /** Optional extra comparison shown after the Aha. */
  readonly extra?: string;
  readonly facts: readonly string[];
  /** Characteristic distance or size of the stage, in metres. */
  readonly distanceM: number;
  /** Where the Earth sits relative to the focus point at this stage, in base units. */
  readonly earthOffset: Point;
  /** Text alternative of the picture at this stage. */
  readonly alt: string;
  /** Credit entries of the pictures and data shown at this stage. */
  readonly credits: readonly CreditId[];
  readonly branch?: Branch;
  /** Branches offered inside the fact sheet instead of next to the texts. */
  readonly factBranches?: readonly Branch[];
}

const LY = LIGHT_YEAR_M;
const CENTRE: Point = { x: 0, y: 0 };

/** The seven stages of the outward journey, from the Earth to the observable universe. */
export const STAGES: readonly Stage[] = [
  {
    id: 'erde',
    label: 'Erde',
    title: 'Die Erde',
    line: '„Jeder Mensch, den du je gekannt hast, hat auf dieser Kugel gelebt.“',
    aha: 'Licht umrundet die Erde 7,5-mal in einer Sekunde.',
    extra: 'Wäre die Erde ein Apfel, wäre die Luft zum Atmen dünner als seine Schale.',
    facts: ['Durchmesser 12.742 km, Umfang 40.075 km', 'Lichtgeschwindigkeit 299.792 km pro Sekunde', 'Tag- und Nachtseite zeigen den jetzigen Stand der Sonne.', 'Die Drehung läuft im Zeitraffer: eine Umdrehung in zwei Minuten statt in 24 Stunden.'],
    distanceM: 1.2742e7,
    earthOffset: CENTRE,
    alt: 'Die ganze Erde. Eine Seite liegt im Tageslicht, auf der Nachtseite leuchten die Städte.',
    credits: ['earth-day', 'earth-night'],
  },
  {
    id: 'mond',
    label: 'Mond',
    title: 'Erde und Mond',
    line: '„Weiter als bis knapp hinter den Mond sind Menschen nie gekommen.“',
    aha: 'Alle anderen Planeten passen nebeneinander fast in die Lücke zwischen Erde und Mond.',
    facts: [
      'Mittlerer Abstand 384.400 km',
      'Licht braucht 1,3 Sekunden',
      'Die Planeten passen nur bei grösstem Mondabstand ganz in die Lücke.',
      'Erde und Mond sind hier gut sechsmal grösser gezeichnet, damit man sie als Kugeln sieht; ihr Grössenverhältnis und der Abstand stimmen. Bei „Planeten in die Lücke“ schrumpfen sie auf ihre echte Grösse.',
    ],
    distanceM: 3.844e8,
    earthOffset: CENTRE,
    alt: 'Die Erde als blaue Kugel mit Tag- und Nachtseite, weit entfernt auf seiner Bahn der Mond als kleine graue Kugel. Der Abstand ist echt, die beiden Kugeln sind vergrössert.',
    credits: ['earth-day', 'earth-night', 'moon'],
  },
  {
    id: 'sonnensystem',
    label: 'Sonnensystem',
    title: 'Das Sonnensystem',
    line: '„Acht Welten. Und fast alles dazwischen ist leer.“',
    aha: 'Mit dem Auto bei 100 km/h ohne Pause wäre man 171 Jahre bis zur Sonne unterwegs.',
    facts: [
      '1 Astronomische Einheit = 149,6 Mio. km, Licht braucht 8 min 20 s',
      'Die Sonne hat den 109-fachen Erddurchmesser und enthält rund 99,86 % der Masse des Sonnensystems.',
      'Voyager 1 ist seit 1977 unterwegs und hat im November 2026 als erstes menschengemachtes Objekt einen Lichttag Entfernung erreicht.',
      'Sonne und Planeten sind viel grösser gezeichnet als im Massstab der Bahnen: Sonst wären sie hier unsichtbar klein.',
    ],
    distanceM: 4.5e12,
    earthOffset: CENTRE,
    alt: 'Die Sonne, darum die Bahnen der acht Planeten mit den Planeten als kleine Kugeln darauf, jeweils von der Sonne her beleuchtet. Am Rand die Sonde Voyager 1.',
    credits: ['sun-texture', 'voyager', 'mercury', 'venus', 'earth-day', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'],
    factBranches: [{ label: 'Mit Lichtgeschwindigkeit weiterreisen', slug: 'lichtgeschwindigkeit', queryParams: { ziel: 'proxima' } }],
  },
  {
    id: 'alpha-centauri',
    label: 'Benachbarte Sternensysteme',
    title: 'Benachbarte Sternensysteme',
    line: '„Unsere nächsten Nachbarn. Und dazwischen: nichts.“',
    aha: 'Voyager 1, unser schnellstes fernes Raumschiff, bräuchte bis hierher rund 75.000 Jahre.',
    facts: [
      'Proxima Centauri ist 4,24 Lichtjahre entfernt, das sind ca. 40 Billionen km.',
      'Alpha Centauri A und B sind ca. 4,37 Lichtjahre entfernt.',
      'Proxima ist ein Roter Zwerg und mit blossem Auge nicht sichtbar.',
      'Bis Sirius in 8,6 Lichtjahren folgen Barnards Pfeilstern, Luhman 16, WISE 0855-0714, Wolf 359 und Lalande 21185. Die Abstände zur Sonne sind massstabsgetreu, die Richtungen vereinfacht.',
    ],
    distanceM: 4.24 * LY,
    earthOffset: CENTRE,
    alt: 'Dunkelheit. Die Sonne ist ein heller Punkt. Am nächsten leuchten der Doppelstern Alpha Centauri und der schwache rote Proxima Centauri, weiter draussen Barnards Pfeilstern, die Braunen Zwerge Luhman 16 und WISE 0855-0714, die Roten Zwerge Wolf 359 und Lalande 21185 und der helle Sirius. Ein Ring markiert 5 Lichtjahre Abstand zur Sonne.',
    credits: ['stars'],
  },
  {
    id: 'milchstrasse',
    label: 'Milchstrasse',
    title: 'Die ganze Milchstrasse',
    line: '„Das ist sie. Unsere Galaxie. Und irgendwo darin, viel zu klein, um sie zu sehen: die Erde.“',
    aha: 'Wäre die Milchstrasse so gross wie Europa, wäre unser ganzes Sonnensystem bis Neptun etwa ein Kronkorken.',
    extra: 'Die Scheibe ist im Verhältnis so flach wie eine CD.',
    facts: [
      'Durchmesser ca. 100.000 Lichtjahre, Scheibe ca. 1.000 Lichtjahre dick, 100 bis 400 Milliarden Sterne',
      'Der nächste Stern läge im Europa-Modell 170 m neben dem Kronkorken.',
      'Niemand hat die Milchstrasse je von aussen fotografiert. Das Bild ist eine Rekonstruktion aus Messdaten.',
      'Wo genau die Arme verlaufen, ist noch Gegenstand der Forschung: Wir sehen sie nur von innen, durch Staub hindurch.',
    ],
    distanceM: 100_000 * LY,
    // The Earth sits just below the focus, so the arms around it stay clear of the stage texts on small phones.
    earthOffset: { x: 0, y: 40 },
    alt: 'Rekonstruktion: die Milchstrasse von oben, ein heller, länglicher Kern mit Spiralarmen. Beschriftet sind der Scutum-Centaurus-Arm, der Sagittarius-Arm, der Orion-Arm mit der Erde und der Perseus-Arm. In der Mitte ist das Schwarze Loch Sagittarius A* markiert.',
    credits: ['milky-way'],
    factBranches: [
      { label: 'Wie lange dauert eine Runde um die Galaxie?', slug: 'galaktisches-jahr' },
      { label: 'Was verbirgt der Staub?', slug: 'das-unsichtbare' },
    ],
  },
  {
    id: 'lokale-gruppe',
    label: 'Lokale Gruppe',
    title: 'Die Lokale Gruppe',
    line: '„Unsere Nachbarschaft. Und zum ersten Mal ist es hier nicht leer.“',
    aha: 'Wäre die Milchstrasse eine Münze, läge Andromeda nur gut einen halben Meter entfernt.',
    extra: 'Wäre die Sonne eine Münze, läge der nächste Stern Hunderte Kilometer weit weg. Sterne stehen einsam, Galaxien fast dicht.',
    facts: [
      'Durchmesser der Lokalen Gruppe ca. 10 Millionen Lichtjahre',
      'Über 80 bekannte Mitglieder, die meisten davon Zwerggalaxien',
      'Das Bild ist eine schematische Darstellung, keine Aufnahme.',
    ],
    distanceM: 1e7 * LY,
    earthOffset: CENTRE,
    alt: 'Über 80 Galaxien als leuchtende Flecken, die Milchstrasse und Andromeda als die grössten, dazu die Dreiecksgalaxie und die Magellanschen Wolken.',
    credits: ['local-group'],
    branch: { label: 'Licht als Zeitmaschine', slug: 'zeitmaschine' },
  },
  {
    id: 'universum',
    label: 'Universum',
    title: 'Das ganze Universum',
    line: '„Und das ist nur der Teil, dessen Licht uns schon erreicht hat.“',
    aha: 'Es gibt wahrscheinlich mehr Galaxien im Universum als Sterne in der Milchstrasse.',
    facts: [
      'Das beobachtbare Universum hat einen Durchmesser von ca. 93 Milliarden Lichtjahren.',
      'Es ist erst 13,8 Milliarden Jahre alt, aber der Raum hat sich seitdem ausgedehnt.',
      'Das Bild ist eine Simulation auf Grundlage von Messdaten.',
    ],
    distanceM: 93e9 * LY,
    earthOffset: CENTRE,
    alt: 'Ein Netz aus leuchtenden Fäden und Knoten aus Galaxienhaufen, dazwischen grosse Leerräume. Markiert sind der Laniakea-Superhaufen, der Geschosshaufen, der Boötes-Leerraum, die Herkules-Corona-Borealis-Mauer, Webbs erstes Deep Field, die ferne Galaxie JADES-GS-z14-0, der Quasar TON 618 und der kosmische Mikrowellenhintergrund.',
    credits: ['cosmic-web'],
  },
];

export const STAGE_DISTANCES = STAGES.map((s) => s.distanceM);
export const STAGE_OFFSETS = STAGES.map((s) => s.earthOffset);

/** The way-home line shown when arriving back at the Earth. */
export const HOME_LINE = '„All das. Und mittendrin: wir.“';
/** Hand-over line to Modul C at the end of the main-journey variant. */
export const HANDOVER_LINE = '„Jetzt fliegst du selbst. So schnell, wie es überhaupt geht.“';
