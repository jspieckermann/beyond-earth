import { Compass, CompassDirection } from '../engine/directions';
import { SkyPosition } from '../engine/ephemeris';
import { FigureId, StarId } from './stars';

/** Where a step's number is drawn: at a star, or where the band leads to the meeting point. */
export type StepAnchor = StarId | 'meeting';

export interface StepText {
  /** Bold first sentence, e.g. „Dreh dich nach Westen.“ */
  readonly title: string;
  readonly text: string;
  readonly at: StepAnchor;
}

/** The figure (or star) all routes of a night end at. */
export interface Meeting {
  readonly star: StarId;
  readonly figure: FigureId | null;
  /** „das W der Kassiopeia“, or a star's name. */
  readonly spoken: string;
  /** Within 30° of the zenith, so „Über dir“ starts there. */
  readonly overhead: boolean;
}

/** What a route's texts can ask for; heights and directions are calculated for the time shown. */
export interface RouteContext {
  readonly direction: CompassDirection;
  readonly meeting: Meeting;
  pos(id: StarId | 'andromeda'): SkyPosition;
  /** „gut drei Fäuste hoch“ */
  height(id: StarId): string;
  /** „Zwei Fäuste höher, etwas nach links“ (capitalised) */
  step(from: StarId, to: StarId): string;
  /** „Richtung Westen“ from the zenith view */
  towards(id: StarId | 'andromeda'): string;
}

/** A route along compass directions, written for the app; the last step („Folge dem Band nach oben.“) is shared. */
export interface CompassRoute {
  readonly id: string;
  readonly kind: 'compass';
  readonly sectors: readonly Compass[];
  /** Pointer stars that must be at least 10° high. The first must be in the view. */
  readonly stars: readonly StarId[];
  steps(c: RouteContext): readonly [StepText, StepText];
}

/** An „Über dir“ route, starting at its meeting figure. */
export interface ZenithRoute {
  readonly id: string;
  readonly kind: 'zenith';
  readonly figure: FigureId;
  readonly stars: readonly StarId[];
  steps(c: RouteContext): readonly [StepText, StepText, StepText];
}

const turn = (c: RouteContext) => `Dreh dich ${c.direction.towards}.`;

export const COMPASS_ROUTES: readonly CompassRoute[] = [
  {
    id: 'schwan',
    kind: 'compass',
    sectors: ['W', 'NW', 'SW', 'N', 'NO', 'O'],
    stars: ['wega', 'deneb'],
    steps: (c) => [
      { title: turn(c), text: `Der hellste Stern dort, ${c.height('wega')}, ist Wega.`, at: 'wega' },
      { title: `${c.step('wega', 'deneb')}.`, text: 'Fünf Sterne bilden ein Kreuz, den Schwan, mit Deneb an der Spitze. Das Band läuft mitten hindurch.', at: 'deneb' },
    ],
  },
  {
    id: 'perseus-kapella',
    kind: 'compass',
    sectors: ['NO', 'O', 'N', 'NW'],
    stars: ['kapella', 'mirfak'],
    steps: (c) => [
      { title: turn(c), text: `${c.height('kapella')} leuchtet ein heller, leicht gelblicher Stern: Kapella.`.replace(/^./, (s) => s.toUpperCase()), at: 'kapella' },
      { title: `${c.step('kapella', 'mirfak')}: ein Bogen schwächerer Sterne.`, text: 'Das ist der Perseus. Das Band läuft durch ihn hindurch.', at: 'mirfak' },
    ],
  },
  {
    id: 'zwillinge-fuhrmann',
    kind: 'compass',
    sectors: ['O', 'NO', 'SO', 'W', 'NW'],
    stars: ['pollux', 'kapella'],
    steps: (c) => [
      { title: turn(c), text: `Zwei gleich helle Sterne nebeneinander, ${c.height('pollux')}: Kastor und Pollux, die Zwillinge.`, at: 'pollux' },
      { title: `${c.step('pollux', 'kapella')}: Kapella.`, text: 'Sie ist der hellste Stern im Fünfeck des Fuhrmanns. Das Band läuft zwischen den Zwillingen und Kapella hindurch.', at: 'kapella' },
    ],
  },
  {
    id: 'orion',
    kind: 'compass',
    sectors: ['SO', 'S', 'O', 'SW', 'W'],
    stars: ['alnilam', 'beteigeuze', 'kapella'],
    steps: (c) => [
      { title: turn(c), text: `Drei Sterne in einer kurzen Reihe, ${c.height('alnilam')}: der Gürtel des Orion. Darüber leuchtet rötlich Beteigeuze.`, at: 'beteigeuze' },
      { title: `${c.step('beteigeuze', 'kapella')}: Kapella.`, text: 'Das Band läuft gleich neben Beteigeuze vorbei und steigt zu Kapella hinauf. Hier ist es blass, weil du aus der Milchstrasse hinausschaust.', at: 'kapella' },
    ],
  },
  {
    id: 'adler',
    kind: 'compass',
    sectors: ['SO', 'S', 'SW', 'O'],
    stars: ['atair', 'deneb'],
    steps: (c) => [
      { title: turn(c), text: `Ein heller Stern mit einem schwächeren Begleiter auf jeder Seite, ${c.height('atair')}: Atair im Adler.`, at: 'atair' },
      { title: `${c.step('atair', 'deneb')}: Deneb.`, text: 'Er steht an der Spitze des Schwans. Das Band fliesst von Atair zu ihm hinauf, mitten durch das Sommerdreieck.', at: 'deneb' },
    ],
  },
  {
    id: 'schuetze',
    kind: 'compass',
    sectors: ['S', 'SW', 'SO'],
    stars: ['nunki', 'atair'],
    steps: (c) => [
      {
        title: turn(c),
        text: `Tief über dem Horizont, ${c.height('nunki')}, stehen acht Sterne wie eine Teekanne: der Schütze. Dahinter liegt das Zentrum der Milchstrasse.`,
        at: 'nunki',
      },
      { title: `${c.step('nunki', 'atair')}: Atair.`, text: 'Das Band steigt wie Dampf aus der Teekanne und läuft links an Atair vorbei nach oben.', at: 'atair' },
    ],
  },
  {
    id: 'kassiopeia-polarstern',
    kind: 'compass',
    sectors: ['N', 'NW', 'NO'],
    stars: ['polarstern', 'schedar'],
    steps: (c) => [
      { title: turn(c), text: `Ein einzelner, mittelheller Stern, ${c.height('polarstern')}: der Polarstern. Er bleibt die ganze Nacht an seinem Platz.`, at: 'polarstern' },
      { title: `${c.step('polarstern', 'schedar')}: ein grosses W.`, text: 'Das ist die Kassiopeia. Das Band läuft mitten hindurch.', at: 'schedar' },
    ],
  },
  {
    id: 'kassiopeia-perseus',
    kind: 'compass',
    sectors: ['NO', 'N', 'O', 'NW'],
    stars: ['schedar', 'mirfak'],
    steps: (c) => [
      { title: turn(c), text: `Fünf helle Sterne in Form eines W, ${c.height('schedar')}: die Kassiopeia.`, at: 'schedar' },
      { title: `${c.step('schedar', 'mirfak')}: ein Bogen schwächerer Sterne.`, text: 'Das ist der Perseus. Das Band verbindet die beiden Sternbilder.', at: 'mirfak' },
    ],
  },
];

export const ZENITH_ROUTES: readonly ZenithRoute[] = [
  {
    id: 'zenit-kassiopeia',
    kind: 'zenith',
    figure: 'kassiopeia',
    stars: ['gamma-cas', 'deneb', 'mirfak'],
    steps: (c) => [
      { title: 'Über dir: ein grosses W.', text: 'Fünf helle Sterne, die Kassiopeia. Das Band läuft mitten hindurch.', at: 'gamma-cas' },
      { title: 'Folge dem Schleier quer über dich.', text: `${c.towards('deneb')} zu Deneb, ${c.towards('mirfak')} zum Perseus. Hier oben ist das Band am deutlichsten, weil kein Dunst davor liegt.`, at: 'deneb' },
      { title: `Gut eine Faust neben dem W, ${c.towards('andromeda')}:`, text: 'ein kleiner, länglicher Nebelfleck. Das ist Andromeda. Am besten siehst du ihn, wenn du knapp daneben schaust.', at: 'schedar' },
    ],
  },
  {
    id: 'zenit-schwan',
    kind: 'zenith',
    figure: 'schwan',
    stars: ['sadr', 'atair', 'schedar', 'wega'],
    steps: (c) => [
      { title: 'Über dir: ein grosses Kreuz.', text: 'Das ist der Schwan mit Deneb an der Spitze. Das Band läuft der Länge nach hindurch.', at: 'sadr' },
      { title: 'Folge dem Schleier quer über dich.', text: `${c.towards('atair')} zum Adler, ${c.towards('schedar')} zur Kassiopeia. Hier oben ist das Band am deutlichsten, weil kein Dunst davor liegt.`, at: 'deneb' },
      { title: `Neben dem Kreuz, ${c.towards('wega')}:`, text: 'Wega, der hellste Stern hier oben. Mit Deneb und Atair bildet sie das Sommerdreieck.', at: 'wega' },
    ],
  },
  {
    id: 'zenit-fuhrmann',
    kind: 'zenith',
    figure: 'fuhrmann',
    stars: ['kapella', 'mirfak', 'beteigeuze', 'plejaden'],
    steps: (c) => [
      { title: 'Über dir: Kapella.', text: 'Der helle, gelbliche Stern ist die Spitze eines Fünfecks, des Fuhrmanns. Das Band läuft hindurch.', at: 'kapella' },
      { title: 'Folge dem Schleier quer über dich.', text: `${c.towards('mirfak')} zum Perseus, ${c.towards('beteigeuze')} zum Orion. Das Winterband ist blasser, weil du aus der Milchstrasse hinausschaust.`, at: 'mirfak' },
      { title: `Etwas abseits, ${c.towards('plejaden')}:`, text: 'ein kleines, dichtes Häufchen Sterne. Das sind die Plejaden, das Siebengestirn.', at: 'plejaden' },
    ],
  },
  {
    id: 'zenit-perseus',
    kind: 'zenith',
    figure: 'perseus',
    stars: ['mirfak', 'kapella', 'schedar', 'plejaden'],
    steps: (c) => [
      { title: 'Über dir: ein Bogen von Sternen.', text: 'Das ist der Perseus mit Mirfak in der Mitte. Das Band läuft durch ihn hindurch.', at: 'mirfak' },
      { title: 'Folge dem Schleier quer über dich.', text: `${c.towards('kapella')} zu Kapella, ${c.towards('schedar')} zum W der Kassiopeia.`, at: 'kapella' },
      { title: `Etwas abseits, ${c.towards('plejaden')}:`, text: 'ein kleines, dichtes Häufchen Sterne. Das sind die Plejaden, das Siebengestirn.', at: 'plejaden' },
    ],
  },
];
