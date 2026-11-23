/** What kind of picture or data a credit stands for; reconstructions and simulations are labelled as such. */
export type CreditKind = 'photo' | 'data' | 'reconstruction' | 'simulation' | 'illustration';

export interface Credit {
  readonly title: string;
  readonly source: string;
  readonly licence: string;
  readonly url: string;
  readonly kind: CreditKind;
}

const SSS = 'Solar System Scope (INOVE), nach Aufnahmen und Daten der NASA';
const SSS_LICENCE = 'CC BY 4.0';
const SSS_URL = 'https://www.solarsystemscope.com/textures/';

/**
 * Sources of every picture and data set used in Modul A. The files under public/journey are made
 * from these sources by scripts/build-journey-assets.mjs; review notes: credits-review.md in the change.
 */
export const CREDITS = {
  'earth-day': { title: 'Die Erde bei Tag', source: SSS, licence: SSS_LICENCE, url: SSS_URL, kind: 'photo' },
  'earth-night': { title: 'Die Erde bei Nacht (Lichter der Städte)', source: SSS, licence: SSS_LICENCE, url: SSS_URL, kind: 'photo' },
  'sun-texture': { title: 'Die Sonne (Oberfläche)', source: SSS, licence: SSS_LICENCE, url: SSS_URL, kind: 'photo' },
  moon: { title: 'Der Mond', source: SSS, licence: SSS_LICENCE, url: SSS_URL, kind: 'photo' },
  mercury: { title: 'Merkur', source: SSS, licence: SSS_LICENCE, url: SSS_URL, kind: 'photo' },
  venus: { title: 'Venus (Wolkendecke)', source: SSS, licence: SSS_LICENCE, url: SSS_URL, kind: 'photo' },
  mars: { title: 'Mars', source: SSS, licence: SSS_LICENCE, url: SSS_URL, kind: 'photo' },
  jupiter: { title: 'Jupiter', source: SSS, licence: SSS_LICENCE, url: SSS_URL, kind: 'photo' },
  saturn: { title: 'Saturn', source: SSS, licence: SSS_LICENCE, url: SSS_URL, kind: 'photo' },
  uranus: { title: 'Uranus', source: SSS, licence: SSS_LICENCE, url: SSS_URL, kind: 'photo' },
  neptune: { title: 'Neptun', source: SSS, licence: SSS_LICENCE, url: SSS_URL, kind: 'photo' },
  voyager: {
    title: 'Voyager 1',
    source: 'NASA/JPL',
    licence: 'Gemeinfrei',
    url: 'https://commons.wikimedia.org/wiki/File:Voyager_spacecraft.jpg',
    kind: 'illustration',
  },
  stars: {
    title: 'Sternpositionen (HYG-Datenbank v4.1, aus Gaia, Hipparcos und Yale)',
    source: 'David Nash / astronexus',
    licence: 'CC BY-SA 4.0',
    url: 'https://github.com/astronexus/HYG-Database',
    kind: 'data',
  },
  'orion-arm': {
    title: 'Der Orion-Arm (Ausschnitt der Milchstrassen-Rekonstruktion)',
    source: 'NASA/JPL-Caltech/ESO/R. Hurt',
    licence: 'Gemeinfrei',
    url: 'https://commons.wikimedia.org/wiki/File:Artist%E2%80%99s_impression_of_the_Milky_Way.jpg',
    kind: 'reconstruction',
  },
  'sgr-a': {
    title: 'Sagittarius A*',
    source: 'EHT Collaboration',
    licence: 'CC BY 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:EHT_Saggitarius_A_black_hole.tif',
    kind: 'photo',
  },
  'milky-way': {
    title: 'Die Milchstrasse von oben',
    source: 'NASA/JPL-Caltech/ESO/R. Hurt',
    licence: 'Gemeinfrei',
    url: 'https://commons.wikimedia.org/wiki/File:Artist%E2%80%99s_impression_of_the_Milky_Way.jpg',
    kind: 'reconstruction',
  },
  andromeda: {
    title: 'Die Andromeda-Galaxie',
    source: 'Adam Evans',
    licence: 'CC BY 2.0',
    url: 'https://commons.wikimedia.org/wiki/File:Andromeda_Galaxy_(with_h-alpha).jpg',
    kind: 'photo',
  },
  triangulum: {
    title: 'Die Dreiecksgalaxie (M33)',
    source: 'ESO',
    licence: 'CC BY 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:VST_snaps_a_very_detailed_view_of_the_Triangulum_Galaxy.jpg',
    kind: 'photo',
  },
  lmc: {
    title: 'Die Grosse Magellansche Wolke',
    source: 'ESO',
    licence: 'CC BY 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:LMC_snapped_by_the_ESO_1-metre_Schmidt_telescope.jpg',
    kind: 'photo',
  },
  smc: {
    title: 'Die Kleine Magellansche Wolke',
    source: 'ESA/Hubble und Digitized Sky Survey 2',
    licence: 'CC BY 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Small_Magellanic_Cloud_(Digitized_Sky_Survey_2).jpg',
    kind: 'photo',
  },
  'local-group': {
    title: 'Die Lokale Gruppe',
    source: 'Eigene schematische Darstellung',
    licence: 'Darstellung frei',
    url: 'https://en.wikipedia.org/wiki/Local_Group',
    kind: 'illustration',
  },
  'cosmic-web': {
    title: 'Das kosmische Netz (Millennium-Simulation)',
    source: 'Volker Springel / Max-Planck-Institut für Astrophysik',
    licence: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Cosmic_web.jpg',
    kind: 'simulation',
  },
  laniakea: {
    title: 'Der Laniakea-Superhaufen (nach der Karte von Tully et al. 2014)',
    source: 'UniViki',
    licence: 'CC BY 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Laniakea_Supercluster_(Cropped).png',
    kind: 'illustration',
  },
  'bullet-cluster': {
    title: 'Der Geschosshaufen (1E 0657-56)',
    source: 'Röntgen: NASA/CXC/M. Markevitch et al.; Optisch: NASA/STScI, Magellan/U. Arizona/D. Clowe et al.; Massenkarte: NASA/STScI, ESO WFI, Magellan/U. Arizona/D. Clowe et al.',
    licence: 'Gemeinfrei',
    url: 'https://commons.wikimedia.org/wiki/File:Visible-Light_and_X-Ray_Composite_Image_of_Galaxy_Cluster_1E_0657-556_(2006-39-1981).jpg',
    kind: 'photo',
  },
  'webb-deep-field': {
    title: 'Webbs erstes Deep Field (SMACS 0723)',
    source: 'NASA, ESA, CSA und STScI',
    licence: 'Gemeinfrei',
    url: "https://commons.wikimedia.org/wiki/File:Webb's_First_Deep_Field.jpg",
    kind: 'photo',
  },
  'jades-gs-z14-0': {
    title: 'Die Galaxie JADES-GS-z14-0',
    source: 'NASA, ESA, CSA, STScI, B. Robertson (UC Santa Cruz), B. Johnson (CfA), S. Tacchella (Cambridge), P. Cargile (CfA)',
    licence: 'CC BY 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Webb_finds_most_distant_known_galaxy_(JADES-GS-z14-0_annotated_pullout_NIRCam_image)_(jades4).jpg',
    kind: 'photo',
  },
  'ton-618': {
    title: 'Der Quasar TON 618',
    source: 'Sloan Digital Sky Survey, Apache Point Observatory, Astrophysical Research Consortium',
    licence: 'CC BY 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:TON_618_SDSS9_version_2.jpg',
    kind: 'photo',
  },
  cmb: {
    title: 'Der kosmische Mikrowellenhintergrund',
    source: 'ESA und die Planck-Kollaboration',
    licence: 'CC BY 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Cosmic_Microwave_Background_(CMB).jpeg',
    kind: 'data',
  },
} as const satisfies Record<string, Credit>;

export type CreditId = keyof typeof CREDITS;

export const CREDIT_KIND_LABEL: Readonly<Record<CreditKind, string>> = {
  photo: 'Aufnahme',
  data: 'Messdaten',
  reconstruction: 'Rekonstruktion',
  simulation: 'Simulation',
  illustration: 'Illustration',
};

/** Files under public/journey that each credit stands for (checked by a unit test against the manifest). */
export const CREDIT_FILES: Readonly<Partial<Record<CreditId, readonly string[]>>> = {
  'earth-day': ['tex/earth-day-1024.webp', 'tex/earth-day-2048.webp', 'tex/erde-1024.webp', 'tex/erde-2048.webp'],
  'earth-night': ['tex/earth-night-1024.webp', 'tex/earth-night-2048.webp'],
  'sun-texture': ['tex/sonne-1024.webp'],
  moon: ['tex/mond-1024.webp'],
  mercury: ['tex/merkur-1024.webp'],
  venus: ['tex/venus-1024.webp'],
  mars: ['tex/mars-1024.webp'],
  jupiter: ['tex/jupiter-1024.webp'],
  saturn: ['tex/saturn-1024.webp'],
  uranus: ['tex/uranus-1024.webp'],
  neptune: ['tex/neptun-1024.webp'],
  voyager: ['img/voyager-120.webp', 'img/voyager-480.webp'],
  stars: ['data/stars.json'],
  'orion-arm': ['img/orion-arm-960.webp'],
  'sgr-a': ['img/sgr-a-240.webp', 'img/sgr-a-480.webp'],
  'milky-way': ['img/milky-way-480.webp', 'img/milky-way-960.webp', 'img/milky-way-1920.webp'],
  andromeda: ['img/andromeda-960.webp'],
  'cosmic-web': ['img/cosmic-web-678.webp'],
  triangulum: ['img/triangulum-480.webp', 'img/triangulum-960.webp'],
  lmc: ['img/lmc-480.webp', 'img/lmc-960.webp'],
  smc: ['img/smc-480.webp', 'img/smc-960.webp'],
  laniakea: ['img/laniakea-480.webp'],
  'bullet-cluster': ['img/bullet-cluster-480.webp', 'img/bullet-cluster-960.webp'],
  'webb-deep-field': ['img/webb-deep-field-480.webp', 'img/webb-deep-field-960.webp'],
  'jades-gs-z14-0': ['img/jades-gs-z14-0-480.webp', 'img/jades-gs-z14-0-960.webp'],
  'ton-618': ['img/ton-618-480.webp'],
  cmb: ['img/cmb-480.webp', 'img/cmb-960.webp'],
};
