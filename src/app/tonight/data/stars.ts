/**
 * Bright stars used to point the way, with J2000 positions from the Yale Bright Star Catalogue (public domain),
 * and the lines of the figures they belong to. Right ascension and declination in degrees.
 */
export interface Star {
  readonly id: StarId;
  /** German name as said in the steps. */
  readonly name: string;
  readonly ra: number;
  readonly dec: number;
  readonly mag: number;
  /** A pointer star: labelled in the drawings and used in routes. */
  readonly pointer?: boolean;
}

const STAR_LIST = [
  // Sommerdreieck, Leier, Schwan
  { id: 'wega', name: 'Wega', ra: 279.2347, dec: 38.7837, mag: 0.03, pointer: true },
  { id: 'deneb', name: 'Deneb', ra: 310.358, dec: 45.2803, mag: 1.25, pointer: true },
  { id: 'atair', name: 'Atair', ra: 297.6958, dec: 8.8683, mag: 0.77, pointer: true },
  { id: 'sadr', name: 'Sadr', ra: 305.5571, dec: 40.2567, mag: 2.23, pointer: true },
  { id: 'albireo', name: 'Albireo', ra: 292.6803, dec: 27.9597, mag: 3.08 },
  { id: 'gienah', name: 'Gienah', ra: 311.5528, dec: 33.9703, mag: 2.48 },
  { id: 'delta-cyg', name: 'Delta Cygni', ra: 296.2437, dec: 45.1308, mag: 2.87 },
  // Kassiopeia
  { id: 'caph', name: 'Caph', ra: 2.2945, dec: 59.1498, mag: 2.27 },
  { id: 'schedar', name: 'Schedar', ra: 10.1268, dec: 56.5373, mag: 2.24, pointer: true },
  { id: 'gamma-cas', name: 'Kassiopeia', ra: 14.1772, dec: 60.7167, mag: 2.47, pointer: true },
  { id: 'ruchbah', name: 'Ruchbah', ra: 21.454, dec: 60.2353, mag: 2.68 },
  { id: 'segin', name: 'Segin', ra: 28.5989, dec: 63.6701, mag: 3.37 },
  // Perseus
  { id: 'mirfak', name: 'Mirfak', ra: 51.0807, dec: 49.8612, mag: 1.79, pointer: true },
  { id: 'algol', name: 'Algol', ra: 47.0422, dec: 40.9556, mag: 2.12, pointer: true },
  { id: 'gamma-per', name: 'Gamma Persei', ra: 46.1991, dec: 53.5064, mag: 2.93 },
  { id: 'delta-per', name: 'Delta Persei', ra: 55.7313, dec: 47.7875, mag: 3.01 },
  { id: 'epsilon-per', name: 'Epsilon Persei', ra: 59.4635, dec: 40.0102, mag: 2.89 },
  // Fuhrmann
  { id: 'kapella', name: 'Kapella', ra: 79.1723, dec: 45.998, mag: 0.08, pointer: true },
  { id: 'menkalinan', name: 'Menkalinan', ra: 89.8822, dec: 44.9474, mag: 1.9, pointer: true },
  { id: 'theta-aur', name: 'Theta Aurigae', ra: 89.9303, dec: 37.2126, mag: 2.62 },
  { id: 'elnath', name: 'Elnath', ra: 81.573, dec: 28.6074, mag: 1.65, pointer: true },
  { id: 'hassaleh', name: 'Hassaleh', ra: 74.2484, dec: 33.1661, mag: 2.69 },
  // Grosser Wagen und Polarstern
  { id: 'polarstern', name: 'Polarstern', ra: 37.9546, dec: 89.2641, mag: 1.98, pointer: true },
  { id: 'dubhe', name: 'Dubhe', ra: 165.932, dec: 61.751, mag: 1.79, pointer: true },
  { id: 'merak', name: 'Merak', ra: 165.4603, dec: 56.3824, mag: 2.37 },
  { id: 'phecda', name: 'Phecda', ra: 178.4577, dec: 53.6948, mag: 2.44 },
  { id: 'megrez', name: 'Megrez', ra: 183.8565, dec: 57.0326, mag: 3.31 },
  { id: 'alioth', name: 'Alioth', ra: 193.5073, dec: 55.9598, mag: 1.77, pointer: true },
  { id: 'mizar', name: 'Mizar', ra: 200.9814, dec: 54.9254, mag: 2.27, pointer: true },
  { id: 'alkaid', name: 'Alkaid', ra: 206.8852, dec: 49.3133, mag: 1.86 },
  // Adler
  { id: 'tarazed', name: 'Tarazed', ra: 296.5649, dec: 10.6133, mag: 2.72 },
  { id: 'alshain', name: 'Alshain', ra: 298.8282, dec: 6.4068, mag: 3.71 },
  { id: 'zeta-aql', name: 'Zeta Aquilae', ra: 286.3526, dec: 13.8635, mag: 2.99 },
  { id: 'delta-aql', name: 'Delta Aquilae', ra: 291.3746, dec: 3.1148, mag: 3.36 },
  { id: 'lambda-aql', name: 'Lambda Aquilae', ra: 286.5623, dec: -4.8826, mag: 3.44 },
  // Orion und Wintersterne
  { id: 'beteigeuze', name: 'Beteigeuze', ra: 88.7929, dec: 7.4071, mag: 0.42, pointer: true },
  { id: 'rigel', name: 'Rigel', ra: 78.6345, dec: -8.2016, mag: 0.13, pointer: true },
  { id: 'bellatrix', name: 'Bellatrix', ra: 81.2828, dec: 6.3497, mag: 1.64 },
  { id: 'saiph', name: 'Saiph', ra: 86.9391, dec: -9.6696, mag: 2.06 },
  { id: 'alnitak', name: 'Alnitak', ra: 85.1897, dec: -1.9426, mag: 1.77 },
  { id: 'alnilam', name: 'Alnilam', ra: 84.0534, dec: -1.2019, mag: 1.69, pointer: true },
  { id: 'mintaka', name: 'Mintaka', ra: 83.0017, dec: -0.2991, mag: 2.23 },
  { id: 'sirius', name: 'Sirius', ra: 101.2872, dec: -16.7161, mag: -1.46, pointer: true },
  { id: 'prokyon', name: 'Prokyon', ra: 114.8255, dec: 5.225, mag: 0.34, pointer: true },
  { id: 'aldebaran', name: 'Aldebaran', ra: 68.9802, dec: 16.5093, mag: 0.85, pointer: true },
  { id: 'plejaden', name: 'Plejaden', ra: 56.8712, dec: 24.1051, mag: 2.87, pointer: true },
  // Zwillinge
  { id: 'kastor', name: 'Kastor', ra: 113.6495, dec: 31.8883, mag: 1.58, pointer: true },
  { id: 'pollux', name: 'Pollux', ra: 116.329, dec: 28.0262, mag: 1.14, pointer: true },
  { id: 'alhena', name: 'Alhena', ra: 99.428, dec: 16.3993, mag: 1.93 },
  // Skorpion
  { id: 'antares', name: 'Antares', ra: 247.3519, dec: -26.432, mag: 1.06, pointer: true },
  { id: 'dschubba', name: 'Dschubba', ra: 240.0833, dec: -22.6217, mag: 2.32 },
  { id: 'beta-sco', name: 'Acrab', ra: 241.3593, dec: -19.8055, mag: 2.62 },
  { id: 'sigma-sco', name: 'Sigma Scorpii', ra: 245.2971, dec: -25.5928, mag: 2.89 },
  { id: 'tau-sco', name: 'Tau Scorpii', ra: 248.9706, dec: -28.216, mag: 2.82 },
  { id: 'epsilon-sco', name: 'Epsilon Scorpii', ra: 252.5409, dec: -34.2932, mag: 2.29 },
  { id: 'shaula', name: 'Shaula', ra: 263.4022, dec: -37.1038, mag: 1.63, pointer: true },
  // Schütze (die Teekanne)
  { id: 'kaus-australis', name: 'Kaus Australis', ra: 276.043, dec: -34.3846, mag: 1.85 },
  { id: 'kaus-media', name: 'Kaus Media', ra: 275.2485, dec: -29.8281, mag: 2.7, pointer: true },
  { id: 'kaus-borealis', name: 'Kaus Borealis', ra: 276.9927, dec: -25.4217, mag: 2.81 },
  { id: 'nunki', name: 'Nunki', ra: 283.8164, dec: -26.2967, mag: 2.02, pointer: true },
  { id: 'phi-sgr', name: 'Phi Sagittarii', ra: 281.4141, dec: -26.9908, mag: 3.17 },
  { id: 'tau-sgr', name: 'Tau Sagittarii', ra: 286.735, dec: -27.6704, mag: 3.32 },
  { id: 'ascella', name: 'Ascella', ra: 285.653, dec: -29.8801, mag: 2.6 },
  { id: 'alnasl', name: 'Alnasl', ra: 271.452, dec: -30.4241, mag: 2.99 },
  // Frühling
  { id: 'arktur', name: 'Arktur', ra: 213.9153, dec: 19.1824, mag: -0.05, pointer: true },
  { id: 'regulus', name: 'Regulus', ra: 152.093, dec: 11.9672, mag: 1.36, pointer: true },
] as const satisfies readonly (Omit<Star, 'id'> & { id: string })[];

export type StarId = (typeof STAR_LIST)[number]['id'];

export const STARS: readonly Star[] = STAR_LIST;

const BY_ID = new Map<string, Star>(STARS.map((s) => [s.id, s]));

export function star(id: StarId): Star {
  return BY_ID.get(id) as Star;
}

export function isStarId(id: string): id is StarId {
  return BY_ID.has(id);
}

/** A figure people recognise, with its lines and the star its name is written at. */
export interface Figure {
  readonly id: FigureId;
  readonly name: string;
  /** "das W der Kassiopeia", "das Kreuz des Schwans": how the steps speak of it. */
  readonly spoken: string;
  readonly label: StarId;
  readonly lines: readonly (readonly [StarId, StarId])[];
}

export type FigureId =
  | 'kassiopeia'
  | 'schwan'
  | 'perseus'
  | 'fuhrmann'
  | 'grosser-wagen'
  | 'sommerdreieck'
  | 'adler'
  | 'orion'
  | 'zwillinge'
  | 'skorpion'
  | 'schuetze';

export const FIGURES: readonly Figure[] = [
  {
    id: 'kassiopeia',
    name: 'Kassiopeia',
    spoken: 'das W der Kassiopeia',
    label: 'gamma-cas',
    lines: [
      ['caph', 'schedar'],
      ['schedar', 'gamma-cas'],
      ['gamma-cas', 'ruchbah'],
      ['ruchbah', 'segin'],
    ],
  },
  {
    id: 'schwan',
    name: 'Schwan',
    spoken: 'das Kreuz des Schwans',
    label: 'sadr',
    lines: [
      ['deneb', 'sadr'],
      ['sadr', 'albireo'],
      ['delta-cyg', 'sadr'],
      ['sadr', 'gienah'],
    ],
  },
  {
    id: 'perseus',
    name: 'Perseus',
    spoken: 'den Bogen des Perseus',
    label: 'mirfak',
    lines: [
      ['gamma-per', 'mirfak'],
      ['mirfak', 'delta-per'],
      ['delta-per', 'epsilon-per'],
      ['mirfak', 'algol'],
    ],
  },
  {
    id: 'fuhrmann',
    name: 'Fuhrmann',
    spoken: 'das Fünfeck des Fuhrmanns',
    label: 'kapella',
    lines: [
      ['kapella', 'menkalinan'],
      ['menkalinan', 'theta-aur'],
      ['theta-aur', 'elnath'],
      ['elnath', 'hassaleh'],
      ['hassaleh', 'kapella'],
    ],
  },
  {
    id: 'grosser-wagen',
    name: 'Grosser Wagen',
    spoken: 'den Grossen Wagen',
    label: 'megrez',
    lines: [
      ['dubhe', 'merak'],
      ['merak', 'phecda'],
      ['phecda', 'megrez'],
      ['megrez', 'dubhe'],
      ['megrez', 'alioth'],
      ['alioth', 'mizar'],
      ['mizar', 'alkaid'],
    ],
  },
  {
    id: 'sommerdreieck',
    name: 'Sommerdreieck',
    spoken: 'das Sommerdreieck',
    label: 'wega',
    lines: [
      ['wega', 'deneb'],
      ['deneb', 'atair'],
      ['atair', 'wega'],
    ],
  },
  {
    id: 'adler',
    name: 'Adler',
    spoken: 'den Adler',
    label: 'tarazed',
    lines: [
      ['tarazed', 'atair'],
      ['atair', 'alshain'],
      ['atair', 'delta-aql'],
      ['delta-aql', 'lambda-aql'],
      ['delta-aql', 'zeta-aql'],
    ],
  },
  {
    id: 'orion',
    name: 'Orion',
    spoken: 'den Orion mit seinen drei Gürtelsternen',
    label: 'alnilam',
    lines: [
      ['beteigeuze', 'bellatrix'],
      ['beteigeuze', 'alnitak'],
      ['bellatrix', 'mintaka'],
      ['alnitak', 'alnilam'],
      ['alnilam', 'mintaka'],
      ['alnitak', 'saiph'],
      ['mintaka', 'rigel'],
    ],
  },
  {
    id: 'zwillinge',
    name: 'Zwillinge',
    spoken: 'die Zwillinge Kastor und Pollux',
    label: 'pollux',
    lines: [
      ['kastor', 'pollux'],
      ['pollux', 'alhena'],
    ],
  },
  {
    id: 'skorpion',
    name: 'Skorpion',
    spoken: 'den Skorpion',
    label: 'antares',
    lines: [
      ['beta-sco', 'dschubba'],
      ['dschubba', 'sigma-sco'],
      ['sigma-sco', 'antares'],
      ['antares', 'tau-sco'],
      ['tau-sco', 'epsilon-sco'],
      ['epsilon-sco', 'shaula'],
    ],
  },
  {
    id: 'schuetze',
    name: 'Schütze',
    spoken: 'die Teekanne des Schützen',
    label: 'kaus-media',
    lines: [
      ['kaus-australis', 'kaus-media'],
      ['kaus-media', 'kaus-borealis'],
      ['kaus-media', 'alnasl'],
      ['alnasl', 'kaus-australis'],
      ['kaus-australis', 'ascella'],
      ['ascella', 'phi-sgr'],
      ['phi-sgr', 'kaus-media'],
      ['phi-sgr', 'nunki'],
      ['nunki', 'tau-sgr'],
      ['tau-sgr', 'ascella'],
    ],
  },
];

export function figure(id: FigureId): Figure {
  return FIGURES.find((f) => f.id === id) as Figure;
}

/** Stars of a figure, each once. */
export function figureStars(f: Figure): StarId[] {
  return [...new Set(f.lines.flat())];
}

/** Two sky points that are not stars: the Andromeda galaxy (M31) and the direction of the galactic centre. */
export const SKY_POINTS = {
  andromeda: { name: 'Andromeda', ra: 10.6847, dec: 41.269 },
  zentrum: { name: 'Zentrum der Milchstrasse', ra: 266.405, dec: -28.9362 },
} as const;
