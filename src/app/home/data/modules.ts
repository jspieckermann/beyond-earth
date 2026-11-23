import { ModuleId } from '../../core/models';

/** Width and height of the sky stage the module positions are expressed in. */
export const SKY_WIDTH = 390;
export const SKY_HEIGHT = 600;

export interface SkyModule {
  readonly id: ModuleId;
  /** Full title, also the star's accessible name. */
  readonly title: string;
  /** Short label shown next to the star. */
  readonly short: string;
  /** One poetic line for the preview. */
  readonly line: string;
  /** URL segment of the module destination. */
  readonly slug: string;
  /** Star position in sky-stage coordinates (SKY_WIDTH × SKY_HEIGHT). */
  readonly x: number;
  readonly y: number;
  /** Which side of the star its label sits on. */
  readonly labelSide: 'left' | 'right';
  /** Star position on tablet and desktop, normalized (0–1) to the sky region; labels sit to the right. */
  readonly wide: { readonly x: number; readonly y: number };
}

/** On tablet and desktop the preview always opens here (normalized), in the empty sky below the band. */
export const WIDE_PREVIEW_ANCHOR = { x: 0.6, y: 0.655 } as const;

/** The six modules along the Milky Way band, in journey order from lower left to upper right (A, B, D, C, F, E). */
export const SKY_MODULES: readonly SkyModule[] = [
  {
    id: 'A',
    title: 'Die Reise nach draussen',
    short: 'Reise nach draussen',
    line: 'Von deiner Haustür bis an den Rand der Galaxie.',
    slug: 'reise-nach-draussen',
    x: 43,
    y: 531,
    labelSide: 'right',
    wide: { x: 0.09, y: 0.87 },
  },
  {
    id: 'B',
    title: 'Reisen mit Lichtgeschwindigkeit',
    short: 'Lichtgeschwindigkeit',
    line: 'Acht Minuten bis zur Sonne. Dann weiter.',
    slug: 'lichtgeschwindigkeit',
    x: 123,
    y: 505,
    labelSide: 'right',
    wide: { x: 0.2, y: 0.785 },
  },
  {
    id: 'D',
    title: 'Sterne zählen',
    short: 'Sterne zählen',
    line: 'Eins. Zwei. Drei. Und dann noch Tausende Jahre lang.',
    slug: 'sterne-zaehlen',
    x: 223,
    y: 398,
    labelSide: 'right',
    wide: { x: 0.4, y: 0.6 },
  },
  {
    id: 'C',
    title: 'Licht als Zeitmaschine',
    short: 'Zeitmaschine',
    line: 'Dein Geburtsstern wartet auf dich.',
    slug: 'zeitmaschine',
    x: 238,
    y: 314,
    labelSide: 'right',
    wide: { x: 0.48, y: 0.47 },
  },
  {
    id: 'F',
    title: 'Das Unsichtbare',
    short: 'Das Unsichtbare',
    line: 'Was hinter dem Staub liegt.',
    slug: 'das-unsichtbare',
    x: 319,
    y: 290,
    labelSide: 'left',
    wide: { x: 0.6, y: 0.405 },
  },
  {
    id: 'E',
    title: 'Das galaktische Jahr',
    short: 'Das galaktische Jahr',
    line: 'Eine Runde um das Zentrum. Damals: die ersten Dinosaurier.',
    slug: 'galaktisches-jahr',
    x: 339,
    y: 209,
    labelSide: 'left',
    wide: { x: 0.71, y: 0.26 },
  },
];

export function findModuleBySlug(slug: string | null | undefined): SkyModule | undefined {
  return SKY_MODULES.find((module) => module.slug === slug);
}
