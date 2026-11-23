import { FactSheetContent } from '../../core/fact-sheet';
import { TRAVEL_RULES } from '../engine/travel';

/** "Wie genau weiss man das?" of Modul B: how the planner calculates and what it leaves out. */
export const LIGHT_SPEED_FACTS: FactSheetContent = {
  kicker: 'Reisen mit Lichtgeschwindigkeit',
  facts: [
    'Gerechnet wird mit gleichbleibendem Tempo vom Start bis zum Ziel: ohne Beschleunigen, ohne Bremsen und ohne die Frage, woher die Energie käme.',
    'Dauer auf der Erde = Entfernung in Lichtjahren ÷ Tempo als Anteil der Lichtgeschwindigkeit.',
    'An Bord vergeht weniger Zeit (Zeitdilatation der speziellen Relativitätstheorie): Dauer an Bord = Dauer auf der Erde × √(1 − v²/c²). Unter 10 % ist der Unterschied winzig, nahe 100 % riesig.',
    `Eine Generation zählt ${TRAVEL_RULES.generationYears} Jahre. Eine Reise bis ${TRAVEL_RULES.oneGenerationUpTo} Jahre schafft eine einzige Generation: Wer jung aufbricht, kommt an.`,
    'Für die Planeten gilt der kleinste Abstand zur Erde, bei günstigster Stellung. Meist sind sie viel weiter weg.',
    'Sehr ferne Orte entfernen sich, während man reist, weil sich der Raum ausdehnt. Für Boötes-Leerraum, Geschosshaufen und Webbs erstes Deep Field ist die Dauer darum nur eine Untergrenze. Was hinter dem kosmischen Ereignishorizont liegt, erreicht man nie, nicht einmal mit Licht.',
    'Voyager 1 fliegt rund 17 km/s schnell, das sind etwa 0,0057 % der Lichtgeschwindigkeit. Sie ist die einzige Vorgabe, die wirklich fliegt.',
    'Die übrigen Vorgaben sind Zielwerte von Projekten, die nie gebaut wurden: Orion, ein Raumschiff mit Atombomben-Pulsantrieb nach Freeman Dyson (1968), rund 3,3 %; Longshot von US Naval Academy und NASA (1988), rund 4,5 %; Daedalus der British Interplanetary Society (1973–1978), rund 12 %; Breakthrough Starshot mit winzigen Lichtsegel-Sonden, 15 bis 20 %. Wo eine Spanne genannt ist, gilt hier der Höchstwert.',
  ],
  sources: [
    { kind: 'Messdaten', source: 'NASA/JPL (Voyager 1)' },
    { kind: 'Projektziel', source: 'F. Dyson, Physics Today 1968 (Orion)' },
    { kind: 'Projektziel', source: 'US Naval Academy/NASA 1988 (Longshot)' },
    { kind: 'Projektziel', source: 'British Interplanetary Society 1978 (Daedalus)' },
    { kind: 'Projektziel', source: 'Breakthrough Initiatives (Starshot)' },
  ],
};
