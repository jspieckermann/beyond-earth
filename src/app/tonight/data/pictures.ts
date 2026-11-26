import MANIFEST from './pictures.json';
import SOURCES from './picture-sources.json';

/**
 * The pictures of „Heute Nacht“: for every object a photo as seen with the naked eye, with the object marked, and a
 * small thumbnail (or a drawing, see objects.ts). Files are built by scripts/build-pictures.mjs into public/tonight/img/;
 * marks are given in pixels of those files. Only freely licensed pictures, credited below each one.
 */

export type PictureId = keyof typeof SOURCES;

/** Licences the app accepts for pictures. */
export const ALLOWED_LICENCES = ['gemeinfrei', 'CC0', 'CC BY 2.0', 'CC BY 3.0', 'CC BY 4.0', 'CC BY-SA 3.0', 'CC BY-SA 3.0 IGO', 'CC BY-SA 4.0'] as const;
export type Licence = (typeof ALLOWED_LICENCES)[number];

export interface Credit {
  readonly author: string;
  readonly licence: Licence;
}

export interface Picture extends Credit {
  readonly id: PictureId;
  readonly width: number;
  readonly height: number;
  /** The Commons page of the original. */
  readonly source: string;
}

/** A ring with a name, in picture pixels. `r: 0` draws only the name. */
export interface Mark {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly label: string;
  /** An orientation point: thinner, dashed, quieter label. */
  readonly minor?: boolean;
  /** Name above the ring instead of below. */
  readonly above?: boolean;
}

/** A line through the stars of a figure, in picture pixels. */
export interface FigureLine {
  readonly points: readonly (readonly [number, number])[];
  /** A pointer rather than a figure line (e.g. the arc to Arktur). */
  readonly dashed?: boolean;
  /** Small rings on the points. */
  readonly stars?: boolean;
}

/** The naked-eye photo of one object, with its marks. */
export interface EyeView {
  readonly picture: Picture;
  readonly caption: string;
  readonly marks: readonly Mark[];
  readonly lines?: readonly FigureLine[];
}

const CREDITS: Record<PictureId, Credit> = {
  'eye-mond': { author: 'Henry Sattink Rath', licence: 'CC BY-SA 3.0' },
  'eye-saturn': { author: 'Thomas Bresson', licence: 'CC BY 3.0' },
  'eye-plejaden': { author: 'Uroš Novina', licence: 'CC BY 2.0' },
  'eye-kassiopeia': { author: 'Thomas Bresson', licence: 'CC BY 3.0' },
  'eye-sommerdreieck': { author: 'Thomas Bresson', licence: 'CC BY 3.0' },
  'eye-orion': { author: 'Martinbernardi', licence: 'CC BY 4.0' },
  'eye-jupiter-mars': { author: 'Zavijava2', licence: 'CC0' },
  'eye-venus': { author: 'ESO/Zdenek Bardon', licence: 'CC BY-SA 4.0' },
  'eye-wagen': { author: 'Astroval1', licence: 'CC BY-SA 4.0' },
  'eye-arktur': { author: 'E. Slawik/NOIRLab/NSF/AURA/M. Zamani', licence: 'CC BY 4.0' },
  'eye-sirius': { author: 'kronerda', licence: 'CC BY 2.0' },
  'eye-andromeda': { author: 'W. Carter', licence: 'CC BY 4.0' },
  'eye-skorpion': { author: 'E. Slawik/NOIRLab/NSF/AURA/M. Zamani', licence: 'CC BY 4.0' },
  'eye-milchstrasse': { author: 'Giles Laurent', licence: 'CC BY-SA 4.0' },
  'close-mond': { author: 'Gregory H. Revera', licence: 'CC BY-SA 3.0' },
  'close-saturn': { author: 'NASA/JPL/Space Science Institute', licence: 'gemeinfrei' },
  'close-plejaden': { author: 'NASA, ESA, AURA/Caltech', licence: 'gemeinfrei' },
  'close-jupiter': { author: 'NASA, ESA, A. Simon (GSFC)', licence: 'gemeinfrei' },
  'close-mars': { author: 'ESA & MPS for OSIRIS Team', licence: 'CC BY-SA 3.0 IGO' },
  'close-orion': { author: 'Rogelio Bernal Andreo', licence: 'CC BY-SA 3.0' },
  'close-venus': { author: 'NASA, Ricardo Nunes', licence: 'gemeinfrei' },
  'close-milchstrasse': { author: 'Bruno Gilli/ESO', licence: 'CC BY 4.0' },
  'close-andromeda': { author: 'Adam Evans', licence: 'CC BY 2.0' },
};

/** Sizes as stated for the marks; the unit test checks them against the built files. */
const SIZES: Record<PictureId, readonly [number, number]> = {
  'eye-mond': [750, 640],
  'eye-saturn': [960, 763],
  'eye-plejaden': [960, 640],
  'eye-kassiopeia': [960, 987],
  'eye-sommerdreieck': [960, 1240],
  'eye-orion': [960, 641],
  'eye-jupiter-mars': [960, 596],
  'eye-venus': [960, 640],
  'eye-wagen': [960, 640],
  'eye-arktur': [960, 960],
  'eye-sirius': [960, 638],
  'eye-andromeda': [960, 540],
  'eye-skorpion': [960, 960],
  'eye-milchstrasse': [960, 640],
  'close-mond': [960, 912],
  'close-saturn': [960, 465],
  'close-plejaden': [960, 692],
  'close-jupiter': [940, 940],
  'close-mars': [960, 960],
  'close-orion': [960, 1480],
  'close-venus': [480, 480],
  'close-milchstrasse': [960, 291],
  'close-andromeda': [960, 631],
};

export const PICTURE_SOURCES: Readonly<Record<PictureId, { readonly file: string; readonly thumbOnly?: boolean }>> = SOURCES;
export const PICTURE_MANIFEST: Readonly<Record<string, { readonly width: number; readonly height: number; readonly bytes: number; readonly thumbBytes?: number }>> = MANIFEST;
export const PICTURE_IDS = Object.keys(SOURCES) as PictureId[];

export function picture(id: PictureId): Picture {
  const [width, height] = SIZES[id];
  return { id, width, height, ...CREDITS[id], source: `https://commons.wikimedia.org/wiki/File:${SOURCES[id].file.replace(/ /g, '_')}` };
}

/** Where a picture is served. */
export const pictureUrl = (id: PictureId) => `tonight/img/${id}.webp`;
export const thumbUrl = (id: PictureId) => `tonight/img/${id}-thumb.webp`;

export type EyeKey =
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
  | 'andromeda'
  | 'jupiter+mars';

export const EYE_VIEWS: Record<EyeKey, EyeView> = {
  mond: {
    picture: picture('eye-mond'),
    caption: 'Der Vollmond in einer klaren Nacht zwischen Birken. Er überstrahlt die meisten Sterne.',
    marks: [{ x: 282, y: 348, r: 44, label: 'Mond', above: true }],
  },
  saturn: {
    picture: picture('eye-saturn'),
    caption: 'Saturn ist der unauffällige Punkt links oben. Unten der Mond, dazu Mars und Spika.',
    marks: [
      { x: 222, y: 116, r: 24, label: 'Saturn' },
      { x: 624, y: 584, r: 44, label: 'Mond', minor: true },
      { x: 700, y: 374, r: 18, label: 'Mars', minor: true },
      { x: 138, y: 306, r: 18, label: 'Spika', minor: true },
    ],
  },
  plejaden: {
    picture: picture('eye-plejaden'),
    caption: 'Rechts unter der hellen Venus das kleine Knäuel der Plejaden, rechts oben Kapella.',
    marks: [
      { x: 284, y: 461, r: 40, label: 'Plejaden' },
      { x: 207, y: 322, r: 22, label: 'Venus', minor: true, above: true },
      { x: 373, y: 75, r: 18, label: 'Kapella', minor: true },
    ],
  },
  kapella: {
    picture: picture('eye-plejaden'),
    caption: 'Kapella ist der helle Stern rechts oberhalb der Venus.',
    marks: [
      { x: 373, y: 75, r: 26, label: 'Kapella' },
      { x: 207, y: 322, r: 22, label: 'Venus', minor: true },
      { x: 284, y: 461, r: 32, label: 'Plejaden', minor: true },
    ],
  },
  kassiopeia: {
    picture: picture('eye-kassiopeia'),
    caption: 'Das W der Kassiopeia über Büschen, an einem dunklen Ort.',
    marks: [{ x: 560, y: 200, r: 0, label: 'Kassiopeia', above: true }],
    lines: [{ points: [[604, 136], [680, 302], [507, 345], [485, 480], [315, 545]], stars: true }],
  },
  sommerdreieck: {
    picture: picture('eye-sommerdreieck'),
    caption: 'Das Sommerdreieck in einer dunklen Sommernacht: Wega rechts oben, Deneb links oben, Atair unten.',
    marks: [
      { x: 846, y: 158, r: 28, label: 'Wega' },
      { x: 152, y: 90, r: 26, label: 'Deneb' },
      { x: 330, y: 1162, r: 26, label: 'Atair', above: true },
    ],
    lines: [{ points: [[846, 158], [152, 90], [330, 1162], [846, 158]], dashed: true }],
  },
  orion: {
    picture: picture('eye-orion'),
    caption: 'Weitwinkelfoto des Orion. Es zeigt etwas mehr Sterne, als das Auge sieht.',
    marks: [
      { x: 478, y: 332, r: 72, label: 'Gürtel' },
      { x: 300, y: 325, r: 44, label: 'Orionnebel', above: true },
      { x: 850, y: 180, r: 24, label: 'Beteigeuze', minor: true },
      { x: 160, y: 522, r: 24, label: 'Rigel', minor: true },
    ],
  },
  jupiter: {
    picture: picture('eye-jupiter-mars'),
    caption: 'Jupiter am rechten Rand, dicht darüber Mars, am 15. November 2026. Links unter ihnen Regulus im Löwen.',
    marks: [
      { x: 881, y: 277, r: 18, label: 'Jupiter' },
      { x: 877, y: 240, r: 14, label: 'Mars', minor: true, above: true },
      { x: 774, y: 351, r: 16, label: 'Regulus', minor: true },
    ],
  },
  mars: {
    picture: picture('eye-jupiter-mars'),
    caption: 'Mars am rechten Rand, dicht unter ihm der hellere Jupiter, am 15. November 2026.',
    marks: [
      { x: 877, y: 240, r: 14, label: 'Mars', above: true },
      { x: 881, y: 277, r: 18, label: 'Jupiter', minor: true },
    ],
  },
  'jupiter+mars': {
    picture: picture('eye-jupiter-mars'),
    caption: 'Jupiter und Mars am 15. November 2026, am rechten Rand. Links unter ihnen Regulus im Löwen.',
    marks: [
      { x: 881, y: 277, r: 18, label: 'Jupiter' },
      { x: 877, y: 240, r: 14, label: 'Mars', above: true },
      { x: 774, y: 351, r: 16, label: 'Regulus', minor: true },
    ],
  },
  venus: {
    picture: picture('eye-venus'),
    caption: 'Venus als hellster Punkt links über dem Horizont, darüber die Milchstrasse. Aufgenommen in der Atacama in Chile, wo der Himmel besonders dunkel ist.',
    marks: [{ x: 127, y: 306, r: 22, label: 'Venus', above: true }],
  },
  wagen: {
    picture: picture('eye-wagen'),
    caption: 'Der Grosse Wagen über dem Geysir Old Faithful im Yellowstone-Park. Der Polarstern liegt ausserhalb des Bildes, oben in Verlängerung der hinteren Kante.',
    marks: [{ x: 640, y: 120, r: 0, label: 'Grosser Wagen' }],
    lines: [
      { points: [[755, 161], [763, 250], [638, 291], [597, 230], [755, 161]], stars: true },
      { points: [[597, 230], [510, 225], [440, 215], [348, 268]], stars: true },
    ],
  },
  arktur: {
    picture: picture('eye-arktur'),
    caption: 'Weitwinkelfoto mit weich gezeichneten Sternen, damit die hellen hervortreten. Oben rechts die Deichsel des Grossen Wagens.',
    marks: [
      { x: 561, y: 663, r: 32, label: 'Arktur' },
      { x: 760, y: 140, r: 0, label: 'Deichsel des Wagens', minor: true },
    ],
    lines: [
      { points: [[890, 40], [732, 48], [660, 78], [612, 177]], stars: true },
      { points: [[606, 215], [585, 420], [566, 625]], dashed: true },
    ],
  },
  sirius: {
    picture: picture('eye-sirius'),
    caption: 'Sirius links unten, rechts der Orion zwischen kahlen Bäumen, in einer Winternacht.',
    marks: [
      { x: 321, y: 453, r: 28, label: 'Sirius' },
      { x: 624, y: 348, r: 56, label: 'Orion', minor: true, above: true },
    ],
    lines: [{ points: [[569, 367], [349, 443]], dashed: true }],
  },
  skorpion: {
    picture: picture('eye-skorpion'),
    caption: 'Weitwinkelfoto aus dem Süden, mit weich gezeichneten Sternen. Von Deutschland aus steht der Skorpion tief über dem Horizont, den Schwanz siehst du meist nicht. Die farbigen Wolken zeigt nur die Kamera.',
    marks: [{ x: 578, y: 437, r: 30, label: 'Antares', above: true }],
    lines: [
      { points: [[705, 305], [725, 370], [728, 440], [728, 510]], stars: true },
      { points: [[725, 370], [620, 425], [578, 437], [548, 477], [482, 600], [470, 685], [462, 770], [390, 798], [290, 800], [258, 718], [300, 672]] },
    ],
  },
  andromeda: {
    picture: picture('eye-andromeda'),
    caption: 'Die Andromedagalaxie in einer dunklen Nacht in Schweden. Die Kamera zeigt den hellen Kern als Fleck, mit dem Auge ist er blasser.',
    marks: [{ x: 320, y: 283, r: 40, label: 'Andromeda' }],
  },
  milchstrasse: {
    picture: picture('eye-milchstrasse'),
    caption: 'Die Milchstrasse über dem Oeschinensee in der Schweiz. Das Foto ist länger belichtet: Mit dem Auge ist das Band blasser und ohne Farben.',
    marks: [{ x: 760, y: 120, r: 0, label: 'Milchstrasse' }],
    lines: [{ points: [[700, 132], [610, 170]] }],
  },
};

/** Thumbnails of the objects without a drawing; only the 128 px square is built (`thumbOnly`). */
export const THUMBS: Partial<Record<EyeKey, PictureId>> = {
  mond: 'close-mond',
  saturn: 'close-saturn',
  plejaden: 'close-plejaden',
  jupiter: 'close-jupiter',
  mars: 'close-mars',
  venus: 'close-venus',
  orion: 'close-orion',
  milchstrasse: 'close-milchstrasse',
  andromeda: 'close-andromeda',
};
