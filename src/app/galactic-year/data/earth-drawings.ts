/**
 * Simplified drawings of the Earth in its history, in a 100 × 100 box with the globe of radius 48 in the middle,
 * seen roughly over the Atlantic. They are the app's own sketches after textbook maps, not reconstructions:
 * the continents, and on them deserts, forests, mountains, ice and lava, so the changes read at a glance.
 */

/** A region on the land (desert, forest, mountains, ice, lava, a rift with water). */
export interface LandDetail {
  readonly path: string;
  readonly fill: string;
}

/** The land of one time: its outline and the regions on it. */
export interface Geography {
  readonly landPath: string;
  readonly details: readonly LandDetail[];
}

const DESERT = '#c8a46a';
const DRY = '#b89b62';
const FOREST = '#4b7a3c';
const RAINFOREST = '#3f6e36';
const MOUNTAIN = '#7a6a4f';
const ICE = '#eef3f7';
const RIFT = '#2a5b8f';
const ROCK = '#6c5c4b';
const LAVA = '#f0a040';
const CRUST = '#4a1c0c';

export const GEO = {
  /** Today, seen over the Atlantic: the Americas, Greenland, Europe, Africa with Madagascar, a part of Arabia. */
  today: {
    landPath:
      'M10 22 C16 16 26 14 32 18 C36 20 38 24 36 28 C40 30 42 34 38 37 C34 38 33 42 30 44 C28 46 27 49 24 48 C21 46 20 42 17 40 C13 38 9 34 8 30 C7 27 8 24 10 22 Z ' +
      'M24 48 C26 50 28 52 30 54 C29 55 27 54 25 52 Z ' +
      'M30 54 C34 52 40 53 43 57 C46 60 45 64 42 68 C40 72 37 77 35 82 C34 85 32 86 31 83 C30 78 30 73 29 68 C28 63 28 58 30 54 Z ' +
      'M34 8 C38 6 44 7 45 10 C44 14 40 16 37 15 C34 13 33 10 34 8 Z ' +
      'M58 18 C62 15 68 15 72 17 C74 20 72 23 69 24 C67 26 64 27 62 29 C60 30 57 29 56 27 C55 24 56 21 58 18 Z ' +
      'M53 20 C55 19 56 21 55 23 C53 24 52 22 53 20 Z ' +
      'M62 12 C65 9 69 9 70 12 C69 15 66 16 64 16 Z ' +
      'M56 32 C61 30 68 31 73 33 C77 36 80 40 79 44 C78 48 76 52 73 56 C71 60 70 64 67 68 C65 71 62 72 61 69 C60 64 59 60 57 56 C55 52 52 48 52 43 C52 38 53 34 56 32 Z ' +
      'M76 62 C78 61 79 63 78 66 C77 68 75 67 75 65 Z ' +
      'M80 36 C84 35 88 38 88 42 C86 44 83 43 81 41 Z',
    details: [
      { path: 'M57 35 C63 33 71 34 77 37 C79 40 75 43 69 43 C63 43 58 41 57 38 Z M81 37 C84 37 87 39 86 41 C84 42 82 41 81 39 Z', fill: DESERT },
      { path: 'M32 57 C37 56 42 58 42 62 C39 64 35 64 32 61 Z M62 50 C66 49 70 51 69 54 C66 56 63 55 62 53 Z', fill: RAINFOREST },
      { path: 'M28 30 C32 29 35 32 33 35 C30 36 28 34 28 30 Z M60 20 C64 19 67 20 66 23 C63 24 61 23 60 21 Z', fill: FOREST },
      { path: 'M14 26 C16 24 18 28 19 34 C20 38 18 40 16 37 C15 33 14 30 14 26 Z M30 60 C31 64 31 70 32 76 C33 80 32 82 31 79 C30 74 29 68 29 62 Z', fill: MOUNTAIN },
      { path: 'M35 9 C38 7 43 8 44 10 C43 13 40 14 37 14 C35 12 34 10 35 9 Z', fill: ICE },
    ],
  },
  /** 66 million years ago: a sea splits North America, Europe is islands, India drifts north. */
  lateCretaceous: {
    landPath:
      'M12 24 C16 18 22 16 25 20 C26 26 24 34 22 40 C20 44 17 42 15 38 C12 34 11 28 12 24 Z ' +
      'M28 20 C33 18 38 21 39 26 C40 31 37 36 33 38 C30 38 28 34 28 29 Z ' +
      'M37 9 C41 7 46 8 46 11 C45 14 41 15 38 14 Z ' +
      'M33 54 C37 52 43 53 45 57 C47 61 45 66 42 70 C40 74 37 78 35 80 C33 77 32 71 31 65 C31 60 31 56 33 54 Z ' +
      'M56 20 C60 18 64 19 65 22 C63 25 59 25 57 23 Z M66 16 C69 15 72 17 71 20 C69 21 67 20 66 18 Z ' +
      'M54 34 C60 31 67 32 72 35 C76 39 77 44 75 49 C73 54 71 59 68 64 C66 68 63 69 62 66 C60 61 58 56 56 52 C53 47 51 41 54 34 Z ' +
      'M82 52 C85 51 87 54 86 58 C85 61 83 61 82 58 Z',
    details: [
      { path: 'M56 44 C62 42 70 44 72 48 C68 52 62 52 58 50 Z M34 58 C38 57 42 59 41 63 C38 65 35 64 34 61 Z', fill: RAINFOREST },
      { path: 'M58 36 C64 34 70 36 71 39 C66 41 61 40 58 38 Z', fill: DRY },
      { path: 'M14 26 C16 25 18 29 18 34 C17 37 15 35 14 31 Z', fill: MOUNTAIN },
    ],
  },
  /** 115 million years ago: the South Atlantic is a narrow sea, North America lies close to Europe. */
  earlyCretaceous: {
    landPath:
      'M14 22 C20 16 30 15 36 19 C40 24 38 31 34 36 C30 39 24 40 20 38 C15 35 12 29 14 22 Z ' +
      'M44 18 C49 15 56 16 59 19 C58 23 53 25 48 24 C45 23 43 21 44 18 Z ' +
      'M36 50 C40 48 45 50 47 54 C48 60 46 66 43 71 C41 75 38 78 36 76 C34 70 33 63 33 57 C33 53 34 51 36 50 Z ' +
      'M50 34 C57 31 65 32 70 36 C74 40 74 46 72 51 C70 57 67 62 63 66 C60 68 57 67 56 63 C54 58 51 54 49 50 C47 44 47 38 50 34 Z ' +
      'M66 70 C70 69 73 72 72 76 C69 78 66 77 65 74 Z',
    details: [
      { path: 'M52 44 C58 42 64 43 67 46 C63 50 56 50 53 48 Z M37 56 C41 55 44 57 43 61 C40 62 38 61 37 59 Z', fill: RAINFOREST },
      { path: 'M55 36 C61 34 67 36 68 39 C63 41 58 40 55 38 Z', fill: DRY },
      { path: 'M17 24 C19 22 21 26 21 31 C20 34 18 32 17 28 Z', fill: MOUNTAIN },
    ],
  },
  /** 150 to 180 million years ago: Pangaea tears into Laurasia in the north and Gondwana in the south. */
  pangaeaSplit: {
    landPath:
      'M16 24 C24 16 38 13 52 14 C64 15 74 19 78 26 C76 31 68 32 60 32 C52 33 44 34 36 35 C28 36 20 33 17 29 Z ' +
      'M22 44 C32 40 46 40 58 42 C68 44 76 48 78 55 C78 63 72 70 64 75 C56 79 46 80 38 77 C30 73 24 66 22 58 C21 52 21 47 22 44 Z',
    details: [
      { path: 'M30 48 C40 46 50 48 54 52 C48 56 38 56 31 53 Z', fill: DESERT },
      { path: 'M24 26 C32 22 40 22 44 26 C38 29 30 30 25 29 Z M58 62 C64 60 70 62 70 66 C66 70 60 69 57 66 Z', fill: FOREST },
      { path: 'M40 44 C41 52 42 60 41 70 C40 70 39 62 39 52 C39 48 39 46 40 44 Z', fill: RIFT },
    ],
  },
  /** 230 to 252 million years ago: one supercontinent, open to the east around the Tethys sea. */
  pangaea: {
    landPath:
      'M22 26 C28 18 40 14 52 15 C62 16 72 20 77 27 C80 33 78 40 72 44 C66 47 58 47 54 50 C58 53 66 55 70 60 C72 66 68 72 60 76 C52 80 42 80 34 76 C27 72 23 64 22 56 C21 48 23 40 22 34 C21 31 21 28 22 26 Z',
    details: [
      { path: 'M30 36 C38 32 48 32 54 36 C52 42 44 44 36 43 C31 42 29 39 30 36 Z M34 60 C42 58 52 60 56 64 C50 68 40 68 35 65 Z', fill: DESERT },
      { path: 'M40 46 C46 45 50 47 50 50 C46 52 41 51 40 48 Z', fill: MOUNTAIN },
      { path: 'M24 28 C28 22 36 19 42 19 C38 23 30 27 25 31 Z M60 72 C64 70 66 72 64 74 C61 76 58 75 60 72 Z', fill: FOREST },
    ],
  },
  /** 252 million years ago: Pangaea with the huge volcanic fields of Siberia. */
  pangaeaVolcanic: {
    landPath:
      'M22 26 C28 18 40 14 52 15 C62 16 72 20 77 27 C80 33 78 40 72 44 C66 47 58 47 54 50 C58 53 66 55 70 60 C72 66 68 72 60 76 C52 80 42 80 34 76 C27 72 23 64 22 56 C21 48 23 40 22 34 C21 31 21 28 22 26 Z',
    details: [
      { path: 'M30 36 C38 32 48 32 54 36 C52 42 44 44 36 43 C31 42 29 39 30 36 Z M34 60 C42 58 52 60 56 64 C50 68 40 68 35 65 Z', fill: DESERT },
      { path: 'M58 20 C64 18 70 21 69 26 C66 29 60 28 58 25 Z', fill: '#b5482a' },
      { path: 'M40 46 C46 45 50 47 50 50 C46 52 41 51 40 48 Z', fill: MOUNTAIN },
    ],
  },
  /** 300 million years ago: the continents close up, coal forests along the equator, ice in the south. */
  pangaeaForming: {
    landPath:
      'M18 26 C26 18 40 15 54 17 C64 19 70 24 70 30 C66 35 56 36 46 37 C36 38 26 37 20 33 Z ' +
      'M24 44 C34 40 48 40 60 42 C70 45 78 50 78 58 C76 66 68 73 58 77 C48 80 38 78 31 73 C25 67 22 58 22 50 Z',
    details: [
      { path: 'M20 30 C30 32 44 33 58 32 C64 31 68 30 70 30 C68 34 58 36 46 37 C34 38 24 36 20 33 Z M24 44 C36 41 50 41 62 43 C56 47 40 48 28 48 Z', fill: RAINFOREST },
      { path: 'M40 70 C48 68 58 70 62 74 C54 78 44 78 38 75 Z', fill: ICE },
    ],
  },
  /** 375 million years ago: the great southern continent Gondwana, small continents in the north, first forests. */
  gondwanaForests: {
    landPath:
      'M18 54 C28 46 44 46 58 50 C70 54 78 62 76 72 C72 80 60 86 46 86 C32 85 22 78 18 68 C16 62 16 58 18 54 Z ' +
      'M30 24 C38 20 50 21 54 26 C52 32 44 34 36 33 C30 31 28 27 30 24 Z ' +
      'M62 22 C68 20 74 23 73 28 C70 31 64 30 62 27 Z',
    details: [
      { path: 'M32 26 C38 24 46 25 48 28 C44 31 37 31 33 29 Z M24 56 C32 52 42 52 48 55 C42 59 32 60 26 59 Z', fill: FOREST },
      { path: 'M50 64 C56 62 62 64 62 68 C58 71 52 70 50 67 Z', fill: ROCK },
    ],
  },
  /** 445 to 460 million years ago: Gondwana near the South Pole, the land still bare. */
  gondwana: {
    landPath:
      'M18 54 C28 46 44 46 58 50 C70 54 78 62 76 72 C72 80 60 86 46 86 C32 85 22 78 18 68 C16 62 16 58 18 54 Z ' +
      'M30 24 C38 20 50 21 54 26 C52 32 44 34 36 33 C30 31 28 27 30 24 Z ' +
      'M62 22 C68 20 74 23 73 28 C70 31 64 30 62 27 Z',
    details: [
      { path: 'M24 58 C30 56 36 58 36 62 C32 65 26 64 24 61 Z M50 64 C56 62 62 64 62 68 C58 71 52 70 50 67 Z', fill: ROCK },
    ],
  },
  /** 540 to 575 million years ago: the pieces of Gondwana come together; the land is bare rock. */
  scattered: {
    landPath:
      'M20 58 C28 52 40 52 50 56 C56 60 56 68 50 74 C42 80 30 78 24 72 C19 67 18 62 20 58 Z ' +
      'M56 50 C62 48 68 51 68 56 C66 60 60 60 57 57 Z ' +
      'M30 28 C37 25 45 27 46 32 C43 36 35 36 31 33 Z ' +
      'M58 26 C64 24 70 27 69 32 C66 34 61 33 59 30 Z',
    details: [{ path: 'M26 62 C32 60 38 62 38 66 C34 69 28 68 26 65 Z M60 52 C63 51 65 53 64 55 C62 56 60 55 60 53 Z', fill: ROCK }],
  },
  /** 690 million years ago: Snowball Earth, the land under ice. */
  snowball: {
    landPath: 'M30 34 C36 29 46 29 54 34 C52 40 47 45 40 46 C34 46 30 42 30 34 Z M56 46 C62 44 69 47 70 54 C68 60 62 63 56 59 C53 55 53 50 56 46 Z',
    details: [{ path: 'M34 36 C40 33 48 34 50 37 C46 41 40 42 35 40 Z M58 49 C62 48 66 50 66 54 C63 57 59 57 57 54 Z', fill: ICE }],
  },
  /** 920 million to 1,1 billion years ago: the supercontinent Rodinia, with a rift where it will break apart. */
  rodinia: {
    landPath:
      'M26 36 C32 26 46 24 58 28 C68 31 76 38 75 48 C74 58 68 66 58 69 C48 72 36 70 29 63 C24 57 23 50 25 44 C25 41 25 38 26 36 Z',
    details: [
      { path: 'M44 30 C46 40 47 52 46 66 C45 66 44 54 43 42 C43 36 43 32 44 30 Z', fill: RIFT },
      { path: 'M32 44 C38 42 44 44 44 48 C40 52 34 52 31 49 Z M52 56 C58 54 64 56 64 60 C60 63 54 62 52 59 Z', fill: ROCK },
    ],
  },
  /** 2 to 2,4 billion years ago: small early continents in a wide ocean. */
  smallContinents: {
    landPath:
      'M30 34 C34 30 40 30 44 34 C42 40 36 42 30 40 C28 38 28 36 30 34 Z ' +
      'M56 46 C60 43 65 44 66 50 C64 55 59 56 55 53 C53 51 54 48 56 46 Z ' +
      'M38 60 C42 57 46 59 46 63 C44 66 39 66 36 64 Z ' +
      'M64 30 C67 28 70 30 69 33 C67 35 64 34 64 32 Z',
    details: [{ path: 'M33 35 C37 34 40 35 40 37 C37 39 34 38 33 36 Z M58 48 C61 47 63 49 62 51 C60 52 58 51 58 49 Z', fill: ROCK }],
  },
  /** 3,7 to 4,4 billion years ago: a dark ocean with a few volcanic islands. */
  islands: {
    landPath:
      'M40 40 C43 37 47 39 47 42 C45 45 41 44 40 40 Z ' +
      'M60 56 C62 53 66 54 66 57 C64 60 61 60 60 56 Z ' +
      'M30 62 C32 60 35 61 35 63 C33 65 31 64 30 62 Z ' +
      'M54 30 C56 29 58 30 57 32 C56 33 54 32 54 30 Z',
    details: [{ path: 'M42 40 C43 39 45 40 44 41 C43 42 42 41 42 40 Z M62 56 C63 55 64 56 63 57 C62 58 62 57 62 56 Z', fill: LAVA }],
  },
  /** 4,5 to 4,6 billion years ago: a glowing ball with a thin, cracked crust. */
  molten: {
    landPath: 'M22 34 C32 28 44 30 52 38 C46 46 34 48 24 44 C20 42 20 37 22 34 Z M48 58 C58 52 70 54 76 62 C70 70 58 72 50 67 C46 64 46 61 48 58 Z M60 24 C66 22 72 26 70 30 C66 32 61 30 60 27 Z',
    details: [
      { path: 'M24 38 C32 36 40 38 48 40 C40 41 32 41 25 40 Z M50 62 C58 60 66 61 72 63 C64 64 56 64 51 63 Z', fill: CRUST },
      { path: 'M30 60 C34 58 38 60 37 63 C34 65 31 64 30 62 Z', fill: LAVA },
    ],
  },
} satisfies Record<string, Geography>;
