import { FactSheetContent } from '../../core/fact-sheet';
import { PICTURE_IDS, picture } from './pictures';

/** Every picture credit, once per author and licence. */
const PICTURE_CREDITS = [...new Set(PICTURE_IDS.map((id) => `${picture(id).author}, ${picture(id).licence}`))].join(' · ');

/** „Wie genau weiss man das?“ for Heute Nacht. */
export const TONIGHT_FACTS: FactSheetContent = {
  kicker: 'Heute Nacht',
  facts: [
    'Ganz dunkel ist es erst, wenn die Sonne 18 Grad unter dem Horizont steht. In Hamburg passiert das von etwa Ende Mai bis Ende Juli gar nicht: Dort bleibt es die ganze Nacht ein wenig hell. Planeten und die hellsten Sterne siehst du schon in der Dämmerung, wenn die Sonne 6 bis 10 Grad unter dem Horizont steht.',
    'Der Mond stört, weil sein Licht den ganzen Himmel aufhellt. Schon ein halber Mond verschluckt das schwache Band der Milchstrasse und blasse Nebel wie die Andromedagalaxie. Planeten und helle Sterne bleiben gut sichtbar.',
    'Sterne funkeln, weil ihr Licht als winziger Punkt durch die unruhige Luft kommt. Planeten sind kleine Scheiben, ihr Licht flackert kaum. So unterscheidest du sie.',
    'Wie dunkel es an deinem Ort ist, wählst du selbst. Die Anwendung schlägt eine Stufe nach der Art des Ortes vor, kennt aber keine Karte der Lichtverschmutzung und auch nicht die Strassenlaterne neben dir.',
    'Übers Jahr ändert sich das Band: Im Sommer schauen wir am Abend zum Zentrum der Milchstrasse, wo die meisten Sterne stehen. Im Winter schauen wir nach aussen, dort ist das Band dünner und blasser.',
    'An einem wirklich dunklen Ort siehst du mit blossem Auge etwa 2.000 bis 3.000 Sterne gleichzeitig, mitten in der Stadt nur wenige Dutzend.',
    'Eine Faust am ausgestreckten Arm deckt etwa 10 Grad des Himmels ab, vom Horizont bis über deinen Kopf sind es neun Fäuste.',
    'Alle Zeiten und Positionen sind für deinen Ort berechnet, nicht beobachtet. Wolken, Dunst, Berge und Häuser am Horizont kennt die Rechnung nicht.',
  ],
  sources: [
    { kind: 'Orte', source: 'GeoNames, CC BY 4.0' },
    { kind: 'Sternpositionen', source: 'Yale Bright Star Catalogue' },
    { kind: 'Sonne, Mond und Planeten', source: 'Astronomy Engine, MIT-Lizenz' },
    { kind: 'Bilder (Wikimedia Commons)', source: PICTURE_CREDITS },
  ],
};
