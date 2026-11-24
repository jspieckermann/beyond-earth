import { GEO, LandDetail } from './earth-drawings';

/** A simplified drawing of the Earth at a station, in a 100 × 100 box with the globe of radius 48 in the middle. */
export interface EarthDrawing {
  readonly ocean: string;
  readonly land: string;
  /** SVG path of the land masses; empty for none. */
  readonly landPath: string;
  /** Regions on the land: deserts, forests, mountains, ice, lava, rifts. */
  readonly details: readonly LandDetail[];
  /** How far the polar ice reaches from the top and from the bottom of the globe (0 = no ice). */
  readonly iceNorth: number;
  readonly iceSouth: number;
}

/** Main stations are the large dots on the slider; in-between stations fill the gaps with further events. */
export type StationKind = 'haupt' | 'zwischen';

/** A place on the Sun's orbit where the Sun rests while turning back, and the state of the Earth at that time. */
export interface Station {
  readonly id: string;
  readonly kind: StationKind;
  /** Rounds back. */
  readonly rounds: number;
  /** One of the stations of the main journey (today, 1, 2, 3 rounds). */
  readonly main: boolean;
  /** The event in a few words, shown while the Sun passes by. */
  readonly title: string;
  readonly time: string;
  /** The time for assistive technology ("vor 230 Millionen Jahren"). */
  readonly timeLong: string;
  readonly roundsText: string;
  readonly sentence: string;
  /** "Die Erde damals: …" */
  readonly caption: string;
  /** The Earth at this time; the globe blends between neighbouring stations. */
  readonly earth: EarthDrawing;
}

const OCEAN = '#1f4f86';
const DEEP = '#1d4a7e';
const R = 230e6;

export const STATIONS: readonly Station[] = [
  {
    id: 'heute',
    kind: 'haupt',
    rounds: 0,
    main: true,
    title: 'Heute',
    time: 'heute',
    timeLong: 'heute',
    roundsText: 'auf dem Weg',
    sentence: 'Hier sind wir. Auf dem Weg, wie immer.',
    caption: 'die Erde, wie wir sie kennen.',
    earth: { ocean: OCEAN, land: '#6f8f4e', ...GEO.today, iceNorth: 8, iceSouth: 8 },
  },
  {
    id: 'vormenschen',
    kind: 'zwischen',
    rounds: 6e6 / R,
    main: false,
    title: 'Die ersten Vormenschen',
    time: 'vor 6 Mio. Jahren',
    timeLong: 'vor 6 Millionen Jahren',
    roundsText: '0,03 Runden',
    sentence: 'In Afrika richten sich die ersten Vormenschen auf.',
    caption: 'Die Kontinente liegen fast wie heute. In Afrika weichen Wälder der Savanne.',
    earth: { ocean: OCEAN, land: '#76904e', ...GEO.today, iceNorth: 4, iceSouth: 8 },
  },
  {
    id: 'antarktis-vereist',
    kind: 'zwischen',
    rounds: 34e6 / R,
    main: false,
    title: 'Die Antarktis vereist',
    time: 'vor 34 Mio. Jahren',
    timeLong: 'vor 34 Millionen Jahren',
    roundsText: '0,15 Runden',
    sentence: 'Am Südpol wächst zum ersten Mal ein dicker Eispanzer.',
    caption: 'Die Antarktis trennt sich von Südamerika und vereist.',
    earth: { ocean: OCEAN, land: '#7b8f4e', ...GEO.today, iceNorth: 0, iceSouth: 6 },
  },
  {
    id: 'dinosaurier-ende',
    kind: 'haupt',
    rounds: 66e6 / R,
    main: false,
    title: 'Das Ende der Dinosaurier',
    time: 'vor 66 Mio. Jahren',
    timeLong: 'vor 66 Millionen Jahren',
    roundsText: 'gut ¼ Runde',
    sentence: 'Ein Viertel Runde. Seitdem gibt es Platz für Säugetiere. Für uns.',
    caption: 'Ein Asteroid schlägt ein, die grossen Dinosaurier sterben aus.',
    earth: { ocean: OCEAN, land: '#7d8f4e', ...GEO.lateCretaceous, iceNorth: 0, iceSouth: 0 },
  },
  {
    id: 'halbe-runde',
    kind: 'haupt',
    rounds: 0.5,
    main: false,
    title: 'Die ersten Blumen',
    time: 'vor 115 Mio. Jahren',
    timeLong: 'vor 115 Millionen Jahren',
    roundsText: '½ Runde',
    sentence: 'Auf der anderen Seite der Galaxie: Die Erde beginnt zu blühen.',
    caption: 'Dinosaurier überall, die ersten Blumen breiten sich aus.',
    earth: { ocean: OCEAN, land: '#6f8a4a', ...GEO.earlyCretaceous, iceNorth: 0, iceSouth: 0 },
  },
  {
    id: 'archaeopteryx',
    kind: 'zwischen',
    rounds: 150e6 / R,
    main: false,
    title: 'Archaeopteryx',
    time: 'vor 150 Mio. Jahren',
    timeLong: 'vor 150 Millionen Jahren',
    roundsText: '0,65 Runden',
    sentence: 'Ein Dinosaurier mit Federn hebt ab: Archaeopteryx.',
    caption: 'Riesige Dinosaurier, warmes Klima, kaum Eis.',
    earth: { ocean: OCEAN, land: '#7a8a4a', ...GEO.pangaeaSplit, iceNorth: 0, iceSouth: 0 },
  },
  {
    id: 'pangaea-zerbricht',
    kind: 'zwischen',
    rounds: 180e6 / R,
    main: false,
    title: 'Pangäa zerbricht',
    time: 'vor 180 Mio. Jahren',
    timeLong: 'vor 180 Millionen Jahren',
    roundsText: '0,78 Runden',
    sentence: 'Pangäa beginnt zu zerbrechen. Der Atlantik ist ein schmaler Graben.',
    caption: 'Der Superkontinent reisst auf.',
    earth: { ocean: DEEP, land: '#8c7f4c', ...GEO.pangaeaSplit, iceNorth: 0, iceSouth: 0 },
  },
  {
    id: 'eine-runde',
    kind: 'haupt',
    rounds: 1,
    main: true,
    title: 'Pangäa und die ersten Dinosaurier',
    time: 'vor 230 Mio. Jahren',
    timeLong: 'vor 230 Millionen Jahren',
    roundsText: '1 Runde',
    sentence: 'Als die Sonne das letzte Mal an dieser Stelle war, gingen die ersten Dinosaurier über die Erde.',
    caption: 'Ein einziger grosser Kontinent, Pangäa. Die ersten Dinosaurier.',
    earth: { ocean: DEEP, land: '#a07a4a', ...GEO.pangaea, iceNorth: 0, iceSouth: 0 },
  },
  {
    id: 'grosses-sterben',
    kind: 'zwischen',
    rounds: 252e6 / R,
    main: false,
    title: 'Das grosse Sterben',
    time: 'vor 252 Mio. Jahren',
    timeLong: 'vor 252 Millionen Jahren',
    roundsText: '1,1 Runden',
    sentence: 'Fast alles Leben im Meer stirbt aus. Danach beginnt alles neu.',
    caption: 'Pangäa ist heiss und trocken, riesige Vulkane brechen aus.',
    earth: { ocean: '#24456e', land: '#a8704a', ...GEO.pangaeaVolcanic, iceNorth: 0, iceSouth: 0 },
  },
  {
    id: 'kohlewaelder',
    kind: 'zwischen',
    rounds: 300e6 / R,
    main: false,
    title: 'Die Kohlewälder',
    time: 'vor 300 Mio. Jahren',
    timeLong: 'vor 300 Millionen Jahren',
    roundsText: '1,3 Runden',
    sentence: 'Riesige Wälder wachsen, Libellen werden so gross wie Möwen.',
    caption: 'Die Kontinente wachsen zu Pangäa zusammen. Im Süden liegt viel Eis.',
    earth: { ocean: DEEP, land: '#5f7f45', ...GEO.pangaeaForming, iceNorth: 0, iceSouth: 16 },
  },
  {
    id: 'fische-an-land',
    kind: 'zwischen',
    rounds: 375e6 / R,
    main: false,
    title: 'Fische gehen an Land',
    time: 'vor 375 Mio. Jahren',
    timeLong: 'vor 375 Millionen Jahren',
    roundsText: '1,6 Runden',
    sentence: 'Ein Fisch stemmt sich auf seine Flossen und kriecht an Land.',
    caption: 'Grosse Kontinente im Süden, die ersten Wälder.',
    earth: { ocean: DEEP, land: '#6f7c4c', ...GEO.gondwanaForests, iceNorth: 0, iceSouth: 0 },
  },
  {
    id: 'ordovizium',
    kind: 'zwischen',
    rounds: 445e6 / R,
    main: false,
    title: 'Massensterben im Ordovizium',
    time: 'vor 445 Mio. Jahren',
    timeLong: 'vor 445 Millionen Jahren',
    roundsText: '1,9 Runden',
    sentence: 'Eine Eiszeit beendet das Leben vieler Meerestiere.',
    caption: 'Der Grosskontinent Gondwana liegt am Südpol unter Eis.',
    earth: { ocean: DEEP, land: '#8a7a66', ...GEO.gondwana, iceNorth: 0, iceSouth: 22 },
  },
  {
    id: 'zwei-runden',
    kind: 'haupt',
    rounds: 2,
    main: true,
    title: 'Die ersten Landpflanzen',
    time: 'vor 460 Mio. Jahren',
    timeLong: 'vor 460 Millionen Jahren',
    roundsText: '2 Runden',
    sentence: 'Zwei Runden zurück: Das Land ist kahl und still.',
    caption: 'Leben gibt es fast nur im Meer. Die ersten winzigen Pflanzen wagen sich an Land.',
    earth: { ocean: DEEP, land: '#8a7a66', ...GEO.gondwana, iceNorth: 0, iceSouth: 8 },
  },
  {
    id: 'kambrium',
    kind: 'zwischen',
    rounds: 540e6 / R,
    main: false,
    title: 'Die Kambrische Explosion',
    time: 'vor 540 Mio. Jahren',
    timeLong: 'vor 540 Millionen Jahren',
    roundsText: '2,3 Runden',
    sentence: 'Plötzlich gibt es Tiere mit Augen, Beinen und Panzern.',
    caption: 'Das Land ist leer, das Meer voller neuer Tiere.',
    earth: { ocean: DEEP, land: '#8f7d68', ...GEO.scattered, iceNorth: 0, iceSouth: 0 },
  },
  {
    id: 'ediacara',
    kind: 'zwischen',
    rounds: 575e6 / R,
    main: false,
    title: 'Ediacara',
    time: 'vor 575 Mio. Jahren',
    timeLong: 'vor 575 Millionen Jahren',
    roundsText: '2,5 Runden',
    sentence: 'Die ersten grossen Lebewesen: weiche Wesen wie Wedel und Scheiben.',
    caption: 'Nach dem Eis wird es wieder warm.',
    earth: { ocean: DEEP, land: '#8a7b6a', ...GEO.scattered, iceNorth: 4, iceSouth: 6 },
  },
  {
    id: 'drei-runden',
    kind: 'haupt',
    rounds: 3,
    main: true,
    title: 'Schneeball Erde',
    time: 'vor 690 Mio. Jahren',
    timeLong: 'vor 690 Millionen Jahren',
    roundsText: '3 Runden',
    sentence: 'Drei Runden zurück: eine weisse Kugel aus Eis.',
    caption: 'Schneeball Erde, Eis bis fast an den Äquator. Es gibt noch keine Tiere.',
    earth: { ocean: '#cfdde6', land: '#b9c3ca', ...GEO.snowball, iceNorth: 42, iceSouth: 42 },
  },
  {
    id: 'vier-runden',
    kind: 'haupt',
    rounds: 4,
    main: false,
    title: 'Der Urkontinent Rodinia',
    time: 'vor 920 Mio. Jahren',
    timeLong: 'vor 920 Millionen Jahren',
    roundsText: '4 Runden',
    sentence: 'Vier Runden zurück: Die Erde gehört den Winzigen.',
    caption: 'Der Urkontinent Rodinia. Einzeller und erste einfache Algen.',
    earth: { ocean: DEEP, land: '#7d6a58', ...GEO.rodinia, iceNorth: 0, iceSouth: 0 },
  },
  {
    id: 'mehrzeller',
    kind: 'zwischen',
    rounds: 1.1e9 / R,
    main: false,
    title: 'Die ersten Mehrzeller',
    time: 'vor 1,1 Mrd. Jahren',
    timeLong: 'vor 1,1 Milliarden Jahren',
    roundsText: '4,8 Runden',
    sentence: 'Zum ersten Mal bestehen Lebewesen aus vielen Zellen: rote Algen.',
    caption: 'Der Urkontinent Rodinia wächst zusammen.',
    earth: { ocean: DEEP, land: '#7a6656', ...GEO.rodinia, iceNorth: 0, iceSouth: 0 },
  },
  {
    id: 'zellkern',
    kind: 'zwischen',
    rounds: 2e9 / R,
    main: false,
    title: 'Zellen mit Zellkern',
    time: 'vor 2 Mrd. Jahren',
    timeLong: 'vor 2 Milliarden Jahren',
    roundsText: '8,7 Runden',
    sentence: 'Eine neue Art Zelle entsteht: mit Zellkern. Aus ihr werden später Pflanzen, Tiere und wir.',
    caption: 'Kleine Kontinente in einem weiten Meer.',
    earth: { ocean: '#244a6e', land: '#6e5e50', ...GEO.smallContinents, iceNorth: 0, iceSouth: 0 },
  },
  {
    id: 'sauerstoff',
    kind: 'zwischen',
    rounds: 2.4e9 / R,
    main: false,
    title: 'Sauerstoff in der Luft',
    time: 'vor 2,4 Mrd. Jahren',
    timeLong: 'vor 2,4 Milliarden Jahren',
    roundsText: '10,4 Runden',
    sentence: 'Winzige Algen füllen die Luft mit Sauerstoff. Für viele Lebewesen ist er Gift.',
    caption: 'Das Eisen im Meer rostet, die Erde vereist für lange Zeit.',
    earth: { ocean: '#3c4f66', land: '#7a5a48', ...GEO.smallContinents, iceNorth: 20, iceSouth: 20 },
  },
  {
    id: 'sechzehn-runden',
    kind: 'haupt',
    rounds: 16,
    main: false,
    title: 'Das erste Leben',
    time: 'vor 3,7 Mrd. Jahren',
    timeLong: 'vor 3,7 Milliarden Jahren',
    roundsText: '16 Runden',
    sentence: 'Sechzehn Runden zurück: irgendwo im Meer das erste Leben.',
    caption: 'Fast nur Meer, ein paar Vulkaninseln. Die ältesten Spuren von Leben.',
    earth: { ocean: '#2a3d4f', land: '#4a4038', ...GEO.islands, iceNorth: 0, iceSouth: 0 },
  },
  {
    id: 'erste-ozeane',
    kind: 'zwischen',
    rounds: 4.4e9 / R,
    main: false,
    title: 'Die ersten Ozeane',
    time: 'vor 4,4 Mrd. Jahren',
    timeLong: 'vor 4,4 Milliarden Jahren',
    roundsText: '19,1 Runden',
    sentence: 'Es regnet. Zum ersten Mal gibt es Ozeane.',
    caption: 'Ein dunkles Meer, kaum Land.',
    earth: { ocean: '#33343f', land: '#4a3a34', ...GEO.islands, iceNorth: 0, iceSouth: 0 },
  },
  {
    id: 'mond-entsteht',
    kind: 'zwischen',
    rounds: 4.5e9 / R,
    main: false,
    title: 'Der Mond entsteht',
    time: 'vor 4,5 Mrd. Jahren',
    timeLong: 'vor 4,5 Milliarden Jahren',
    roundsText: '19,6 Runden',
    sentence: 'Ein Himmelskörper prallt auf die Erde. Aus den Trümmern entsteht der Mond.',
    caption: 'Die Erde glüht nach dem Zusammenstoss.',
    earth: { ocean: '#9c3d1c', land: '#d4742c', ...GEO.molten, iceNorth: 0, iceSouth: 0 },
  },
  {
    id: 'zwanzig-runden',
    kind: 'haupt',
    rounds: 20,
    main: false,
    title: 'Sonne und Erde entstehen',
    time: 'vor 4,6 Mrd. Jahren',
    timeLong: 'vor 4,6 Milliarden Jahren',
    roundsText: '20 Runden',
    sentence: 'Zwanzig Runden. Weiter zurück gibt es uns nicht.',
    caption: 'Die Sonne und die Erde entstehen. Die Erde ist eine glühende Kugel.',
    earth: { ocean: '#b4471c', land: '#e0822f', ...GEO.molten, iceNorth: 0, iceSouth: 0 },
  },
];

/** The stations of a variant: all for free exploration, today and 1, 2, 3 rounds for the main journey. */
export function stationsFor(mainJourney: boolean): readonly Station[] {
  return mainJourney ? STATIONS.filter((s) => s.main) : STATIONS;
}

/** A station that lies a whole number of rounds back (1, 2, 3, 4, 16, 20): settling there gives a pulse. */
export function isFullRound(station: Station): boolean {
  return station.rounds > 0 && Number.isInteger(station.rounds);
}
