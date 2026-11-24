import { FactSheetContent } from '../../core/fact-sheet';
import { CREDITS } from '../../outward-journey/data/credits';

/** The parts of the page, from top to bottom. */
export const SECTIONS = ['runde', 'zurueck'] as const;
export type Section = (typeof SECTIONS)[number];

export const SECTION_TITLES: Readonly<Record<Section, string>> = {
  runde: 'Eine Runde',
  zurueck: 'Zurückdrehen',
};

const milkyWay = CREDITS['milky-way'];
const PICTURE = { kind: 'Bild (Rekonstruktion)', source: `${milkyWay.source} · ${milkyWay.licence}` };

/** "Wie genau weiss man das?" per part. The branch to "Das Unsichtbare" is offered in free exploration only. */
export const SECTION_FACTS: Readonly<Record<Section, FactSheetContent>> = {
  runde: {
    kicker: 'Eine Runde',
    facts: [
      'Die Sonne zieht mit allen Planeten, also mit dem ganzen Sonnensystem, um das Zentrum der Milchstrasse, mit rund 230 Kilometern pro Sekunde.',
      'Alles um uns fliegt mit: die Erde, die Luft, die Nachbarsterne. Ohne Ruck und ohne Bremsen spürt man keine Geschwindigkeit, wie in einem ruhig fliegenden Flugzeug.',
      'Die Sonne ist ca. 26.000 Lichtjahre vom Zentrum der Milchstrasse entfernt.',
      'Ein galaktisches Jahr dauert je nach Messung etwa 210 bis 250 Millionen Jahre. Die Anwendung rechnet mit 230 Millionen Jahren.',
      'Die Bahn ist im Bild als Kreis vereinfacht. Die Sonne kreuzt dabei alle 30 bis 40 Millionen Jahre die Mitte der Scheibe.',
      'Eigentlich ist die Sonne zu schnell: Die sichtbaren Sterne und das Gas reichen nicht aus, um sie auf ihrer Bahn zu halten.',
    ],
    sources: [PICTURE],
    branches: [{ label: 'Was hält die Sonne auf ihrer Bahn?', slug: 'das-unsichtbare' }],
  },
  zurueck: {
    kicker: 'Zurückdrehen',
    facts: [
      'Die Runden sind die Zeitspanne geteilt durch 230 Millionen Jahre.',
      'Die feinen Ringe zeigen, wie viele Runden die Sonne zu der Zeit schon gedreht hatte. Sie ist rund 4,6 Milliarden Jahre alt: Mit 230 Millionen Jahren pro Runde sind das rund 20 Runden, mit den gemessenen 210 bis 250 Millionen Jahren wären es 18 bis 22.',
      'Im Bild stehen die Spiralarme still, nur die Sonne wandert. In Wirklichkeit drehen sich die Arme langsamer mit.',
      'Die kleine Erdkugel ist eine vereinfachte Zeichnung, keine Rekonstruktion: Sie zeigt nur ungefähr, wo Land, Meer und Eis lagen.',
      'Menschen unserer Art gibt es seit rund 300.000 Jahren: gut ein Achtel Prozent einer Runde, ein halbes Grad auf der Bahn.',
      'Die Nachbarsterne fliegen fast im selben Tempo mit. Darum ist Proxima Centauri trotzdem noch unser nächster Nachbar.',
      'Das Bild der Milchstrasse ist eine Rekonstruktion aus Messdaten. Niemand hat die Milchstrasse je von aussen fotografiert.',
    ],
    sources: [PICTURE],
  },
};

/** The facts of a part, without branches in the main journey. */
export function factsFor(section: Section, withBranches: boolean): FactSheetContent {
  const content = SECTION_FACTS[section];
  return withBranches ? content : { ...content, branches: [] };
}
