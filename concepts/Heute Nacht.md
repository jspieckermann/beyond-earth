# Heute Nacht: Was du am eigenen Himmel siehst

Nov 24, 2026 · @Joerg · Verfeinerung der Heute-Nacht-Funktion aus „Konzept Die Milchstrasse erleben“ · überarbeitet am 26. Nov 2026 nach dem zweiten Mockup (Ort, dann Liste der sichtbaren Objekte, ohne Mission) und nach dem dritten Mockup: alles auf einer Seite, nur dunkle Nachtfotos, ohne Nahaufnahmen und Zeichnungen in den Karten; Nachtmodus nur in den Einstellungen

## Ziel und Rolle im Erlebnis

Die Module zeigen die Milchstrasse auf dem Bildschirm. Heute Nacht holt den Himmel an den echten Ort. Die Funktion beantwortet eine einfache Frage: **Was kann ich heute Nacht von hier aus mit blossem Auge sehen, und wie finde ich es?** Die Milchstrasse ist eines dieser Dinge, das wichtigste, aber nicht das einzige. In einer Vollmondnacht oder in der Stadt bleibt so trotzdem etwas zum Hochschauen: der Mond, die Planeten, helle Sterne und Sternbilder.

- **Platz in der Hauptreise:** Akt 6 „Rausgehen“, der Abschluss der Reise. Nach dem galaktischen Jahr (C) heisst es: „Und all das kannst du sehen. Heute Nacht, über dir.“
- **Platz auf dem Startbildschirm:** die Karte „Heute Nacht“ unter dem Band. Sie zeigt den Ort, die Bedingungen und das Highlight der Nacht. Ohne Ort fragt sie: „Wo stehst du heute Nacht?“
- **Lernziel:** Nach der Funktion können Nutzer sagen: „Heute steht Saturn im Süden, vier Fäuste hoch. Er funkelt nicht, daran erkenne ich ihn. Die Milchstrasse sehe ich heute nicht, weil der Mond zu hell ist. Am Samstag geht es für zwei Stunden.“
- **Gefühl am Ende:** Lust, die Jacke anzuziehen und rauszugehen.
- **Didaktischer Kern:** Persönlicher Bezug und ehrliche Erwartung. Mein Ort, meine Nacht, und ich weiss, wie es draussen wirklich aussieht.

## Die Idee in einem Satz

*„Heute Nacht siehst du sieben Dinge mit blossem Auge. Hier ist, wo sie stehen.“*

## Aufbau: eine Seite

Heute Nacht ist eine ruhige Seite in einer Spalte, ohne Schritte und ohne Tabs. Von oben nach unten:

1. **Dein Ort:** ein Feld für den Ort und darunter, wie dunkel es dort ist.
2. **Was du siehst:** die Bedingungen der Nacht, die Wahl der Uhrzeit mit einem Satz dazu, die Liste der sichtbaren Objekte mit Anleitung und Bildern, dann was heute nicht zu sehen ist und warum, die nächste gute Nacht für die Milchstrasse und kurze Tipps.

- **Ohne Ort** steht nur der obere Teil da. Sobald ein Ort gewählt ist, erscheint die Liste darunter, ohne weiteren Knopf.
- **Wer schon einen Ort gewählt hat,** sieht beim Öffnen sofort beides: oben den Ort, darunter die Liste.
- **Handy zuerst:** eine Spalte, höchstens 34rem breit, auch auf Tablet und Desktop. Das Handy ist das Gerät, das man nach draussen mitnimmt.
- **Zurück** geht es über das Schliessen-Symbol oben links („Zurück zum Himmel“).
- **Einstellungen** erreicht man über das Zahnrad oben rechts, an derselben Stelle wie auf dem Startbildschirm und auf jeder anderen Seite. Einen eigenen Schalter für den Nachtmodus hat die Seite nicht.

## Dein Ort

Ohne Ort gibt es keine Liste. Die Funktion fragt deshalb zuerst, aber nur freiwillig und ohne Druck. Überschrift: „Wo stehst du heute Nacht?“

- **Ein Feld für alles:** „Stadt oder Ort suchen“ ist ein einziges Textfeld mit Ortsnadel. Es zeigt den gewählten Ort („Hamburg“, fett), dient zum Suchen und lässt sich mit einem × leeren. Darunter steht klein die Art oder Region des Ortes, ohne Ort der Hinweis „Der Ort bleibt nur auf diesem Gerät, auf ein paar Kilometer gerundet.“
- **Suchen:** Ein Tippen ins Feld markiert den Namen, sodass man ihn einfach überschreibt. Unter dem Feld klappt eine Trefferliste auf (Name und Region, Sternenparks als „Sternenpark · …“), ab zwei Buchstaben, höchstens acht Treffer. Ohne Eingabe zeigt sie den gewählten Ort und zwei Sternenparks als Vorschlag. Nach der Wahl schliesst sie sich: Sichtbar bleibt nur der gewählte Ort, keine weiteren Möglichkeiten. Die Liste wird mit der Anwendung ausgeliefert: alle Orte in Deutschland, Österreich und der Schweiz ab etwa 15.000 Einwohnern (aus GeoNames) und die ausgewiesenen Sternenparks der drei Länder. Die Suche fragt keinen Dienst.
- **„Meinen Standort verwenden“** ist ein kleiner Knopf direkt unter dem Feld. Erst ein Tippen darauf fragt das Gerät nach dem Standort. Die Anwendung fragt nie von sich aus. Danach steht im Feld „Dein Standort“ und in Klammern der nächste Ort der mitgelieferten Liste, wenn er höchstens 25 km entfernt ist, zum Beispiel „Dein Standort (Hamburg)“. Gesucht wird auf dem Gerät, kein Dienst wird gefragt.
- **Genauigkeit:** Ein ungefährer Ort reicht. Der Standort wird auf einige Kilometer gerundet, bevor er gespeichert wird.
- **„Wie dunkel ist es dort?“** folgt direkt darunter, sobald ein Ort gewählt ist, als Auswahlliste zum Aufklappen. Zugeklappt zeigt sie nur die gewählte Stufe, aufgeklappt alle fünf untereinander, in derselben Form: fünf Punkte, ein Name und ein Satz, was man dort sieht. Die gewählte Stufe trägt einen Haken.

| Stufe | Name | Was man sieht |
| --- | --- | --- |
| 1 von 5 | Mitten in der Stadt | Einige helle Sterne. Planeten und Mond gut. |
| 2 von 5 | Stadtrand, Vorort | Die Sternbilder. Vom Band höchstens eine Ahnung. |
| 3 von 5 | Land, nahe einer Stadt | Das Band als blasser Schleier, hoch oben. |
| 4 von 5 | Auf dem Land | Das Band deutlich, von Horizont zu Horizont. |
| 5 von 5 | Sehr dunkel: Sternenpark, Gebirge, Insel | Das Band mit Struktur und dunklen Staubbändern. |

- **Vorschlag für die Stufe:** Bei einer Stadt ist Stufe 2 vorgewählt, bei einer Grossstadt ab etwa 500.000 Einwohnern Stufe 1, bei einem Sternenpark Stufe 5, beim eigenen Standort Stufe 2. Darunter steht klein, warum: „Vorgeschlagen für eine Grossstadt.“ Die Nutzer können die Stufe jederzeit ändern, dann verschwindet der Satz. Eine Karte der Lichtverschmutzung gibt es in der ersten Fassung nicht. Sie kann den Vorschlag später ersetzen, ohne dass sich die Seite ändert.
- **Kein Weiter-Knopf:** Ort und Stufe gelten sofort. Die Liste darunter folgt jeder Änderung.
- **Gespeichert** werden Ort und Stufe nur auf dem Gerät, ohne Konto. Beim nächsten Öffnen sind sie wieder da. Einen Knopf „Ort vergessen“ gibt es nicht mehr (entfernt am 26. Nov 2026); wer einen anderen Ort will, wählt ihn einfach.
- **Mehrere Orte** sind nicht nötig. Wer einen dunkleren Ort ausprobieren will, wählt ihn einfach. Der zuletzt gewählte gilt.

## Was du siehst

### Bedingungen

Unter dem Ort fasst ein schlichter Kasten mit feinem Rand die Bedingungen der Nacht in zwei Zeilen zusammen, jede mit einem kleinen Symbol:

| Zeile | Beispiel | Bedeutung |
| --- | --- | --- |
| Dunkelheit | „**Dunkel ab 18:15 Uhr**“ | Ende der astronomischen Dämmerung |
| Mond | „**Mond 94 %**, fast voll, ab 17:15 Uhr am Himmel“ | beleuchteter Anteil, Phase und Auf- oder Untergang; hervorgehoben, wenn er stört |

Die Dunkelheit des Ortes steht hier nicht noch einmal, die Auswahl darüber zeigt sie schon.

### Wann schaust du?

Drei Knöpfe wählen den Zeitpunkt: **Abends**, **Mitternacht** und **Morgens**, jeweils mit der Uhrzeit („Abends · 20 Uhr“). Die Liste, alle Richtungen und Höhen passen sich an. Vorgewählt ist der nächste Zeitpunkt, der noch vor einem liegt oder weniger als eine Stunde vorbei ist, tagsüber „Abends“. Wie die Zeitpunkte berechnet werden, steht unter „Rechenregeln“.

Direkt unter den Knöpfen fasst ein Satz in der poetischen Sprache der Anwendung zusammen, was das zum gewählten Zeitpunkt bedeutet:

| Lage | Satz |
| --- | --- |
| Mond stört | *„Um 20 Uhr siehst du 6 Dinge mit blossem Auge. Der helle Mond schluckt heute alles Blasse, Planeten und helle Sterne strahlen trotzdem.“* |
| Dunkel, Band sichtbar | *„Um 21 Uhr siehst du 9 Dinge mit blossem Auge. Heute ist eine Nacht für die Milchstrasse.“* |
| Dunkel, Ort zu hell | *„Um 21 Uhr siehst du 6 Dinge mit blossem Auge. Für die Milchstrasse ist deine Stadt zu hell.“* |
| Keine echte Nacht (Hochsommer im Norden) | *„Im Juni wird es hier nicht ganz dunkel. Mond, Planeten und die hellsten Sterne siehst du trotzdem.“* |
| Kaum etwas zu sehen | *„Zu dieser Zeit ist von hier kaum etwas zu sehen.“* |

Die Seite spricht nie vom Wetter, solange es keine Wettervorhersage gibt (siehe offene Fragen). Sie setzt immer einen klaren Himmel voraus.

### Mit dem Auge zu sehen

Das Herz der Seite ist die Liste der Objekte, die zur gewählten Zeit am gewählten Ort mit blossem Auge sichtbar sind. Jede Zeile ist eine Karte, die sich aufklappen lässt.

**Zugeklappt** zeigt die Karte:
- ein kleines Vorschaubild,
- den Namen und die Art („Saturn · Planet“, „Plejaden · Sternhaufen · Siebengestirn“),
- die Lage in Worten: Himmelsrichtung und Höhe in Fäusten („Süden · Vier Fäuste hoch“, „Fast genau über dir“),
- wie leicht es zu finden ist: „Sofort“, „Leicht“ oder „Etwas Übung“.

**Aufgeklappt** kommen dazu, in dieser Reihenfolge:
1. **„Mit dem blossen Auge“:** ein echtes Foto ohne Teleskop, wie man den Himmel draussen sieht, meist mit Landschaft. Darin ist die Stelle markiert (siehe „Bilder“).
2. **„Mit dem Auge:“** ein Satz, wie es wirklich aussieht, zum Beispiel: „Ein ruhiger, gelblicher Punkt. Den Ring siehst du erst in einem kleinen Teleskop.“
3. **„So findest du es“:** drei bis vier nummerierte Schritte, von der Himmelsrichtung über die Höhe zu einem Merkmal, an dem man es sicher erkennt. Richtung und Höhe passen sich der gewählten Zeit an.
4. **„Sichtbar:“** die Zeitspanne der Nacht („bis 2:40 Uhr“, „die ganze Nacht“, „ab etwa 23 Uhr“).

Die erste Karte ist aufgeklappt, alle anderen sind zu. Ein Tippen klappt eine Karte auf oder zu. Jede Karte klappt für sich: Beim Aufklappen schliesst sich keine andere, alles darunter rückt nach unten, und die Seite scrollt nicht von selbst.

**Beispiel Saturn, 26. November, Hamburg, 20 Uhr:**
1. „Dreh dich nach Süden.“
2. „Vier Fäuste hoch steht ein gelblicher Punkt, der hellste weit und breit. Um ihn herum gibt es kaum helle Sterne.“
3. „Er funkelt nicht. Sterne flackern, Planeten leuchten ruhig. So erkennst du ihn sicher.“

**Beispiel Jupiter und Mars, Mitternacht:**
1. „Dreh dich nach Osten.“
2. „Eine Faust hoch: ein sehr heller, ruhiger Punkt. Das ist Jupiter.“
3. „Eine halbe Faust daneben ein schwächerer, rötlicher Punkt: Mars. Der helle Stern ganz in der Nähe ist Regulus im Löwen.“
4. „Mit einem Fernglas, ruhig aufgestützt: bis zu vier winzige Pünktchen neben Jupiter. Das sind seine grossen Monde.“

**Reihenfolge der Liste:** Die Milchstrasse steht oben, wenn sie sichtbar ist. Danach folgen die Objekte, die „Sofort“ zu finden sind, dann „Leicht“, dann „Etwas Übung“, innerhalb einer Gruppe das hellste zuerst.

### Heute nicht zu sehen

Unter der Liste stehen die Objekte, die heute Nacht nicht zu sehen sind, jeweils mit einem Grund. So lernt man nebenbei, was die Sicht bestimmt:

| Grund | Text |
| --- | --- |
| Mond zu hell | **„Der fast volle Mond überstrahlt sie.“** |
| Ort zu hell | **„Dein Ort ist zu hell.“** Dafür braucht es Dunkelheit 3 von 5. |
| Geht später auf | **„Noch nicht aufgegangen.“** Kommt um 23:50 Uhr im Osten hoch. |
| Schon untergegangen | **„Schon untergegangen.“** Unter dem Horizont seit 2:40 Uhr. |
| Zu tief | **„Zu tief am Horizont.“** Ab 5:30 Uhr steht es hoch genug, oder: Bäume und Dunst verdecken es. |

Hier stehen nur Objekte, die heute Nacht in Frage kommen: die zu einer anderen Zeit der Nacht sichtbar sind oder die nur Mond, Dämmerung oder ein heller Ort verbergen. Was die ganze Nacht unter dem Horizont bleibt, fehlt ganz. Die Milchstrasse steht immer hier, wenn sie nicht in der Liste oben steht.

### Die nächste gute Nacht für die Milchstrasse

Ist die Milchstrasse heute nicht zu sehen, nennt ein hervorgehobener Kasten die nächste gute Nacht. Man soll nie nur ein Nein bekommen:

*„Nächste gute Nacht für die Milchstrasse: Samstag, 28. November, 18:15 bis 20:20 Uhr. Dann geht der Mond erst um 20:20 Uhr auf.“* Ist der Ort zu hell, folgt: *„Fahr dafür aus der Stadt raus, ab Dunkelheit 3 siehst du das Band.“*

### Bevor du rausgehst

Drei kurze Tipps, immer dieselben:

- **Gib deinen Augen 20 Minuten.** Jeder Blick aufs helle Handy setzt die Zeit zurück.
- **Eine Faust** am ausgestreckten Arm sind etwa 10°. Vom Horizont bis über deinen Kopf sind es neun Fäuste.
- **Stell dich so, dass der Mond hinter dir steht** oder hinter einem Haus. Dann siehst du mehr. (Nur wenn der Mond am Himmel steht.)

Darunter führt „Wie genau weiss man das?“ in die Faktenebene.

## Die Objekte

Die erste Fassung kennt eine feste, kleine Auswahl von Objekten, die man mit blossem Auge sicher findet. Für jedes ist geschrieben: Art, Schwierigkeit, Satz „Mit dem Auge“, Schritte „So findest du es“, Bilder. Die Auswahl deckt das ganze Jahr ab: In jeder klaren Nacht in Mitteleuropa sind mindestens fünf davon zu sehen.

| Objekt | Art | Schwierigkeit | Mindest-Dunkelheit | Mond stört |
| --- | --- | --- | --- | --- |
| Mond | Mond, mit Phase | Sofort | 1 | – |
| Venus | Planet, Abend- oder Morgenstern | Sofort | 1 | nein |
| Jupiter | Planet | Sofort | 1 | nein |
| Mars | Planet | Leicht | 1 | nein |
| Saturn | Planet | Leicht | 1 | nein |
| Grosser Wagen und Polarstern | Sternbild | Leicht | 1 | nein |
| Kassiopeia | Sternbild, das „Himmels-W“ | Leicht | 2 | nein |
| Sommerdreieck (Wega, Deneb, Atair) | drei helle Sterne | Leicht | 1 | nein |
| Kapella | heller Stern im Fuhrmann | Leicht | 1 | nein |
| Arktur | heller Stern im Bootes | Leicht | 1 | nein |
| Orion mit Orionnebel | Sternbild | Leicht | 1 (Nebel ab 3) | nur der Nebel |
| Sirius | hellster Stern | Leicht | 1 | nein |
| Plejaden | Sternhaufen | Leicht | 1 | nein |
| Skorpion mit Antares | Sternbild, tief im Süden (Sommer) | Leicht | 1 | nein |
| Milchstrasse | das Band | Etwas Übung | 3 | ja |
| Andromedagalaxie | Galaxie, Nebelfleck | Etwas Übung | 3 | ja |

- **Steht ein Planet nah bei einem anderen** (unter 5°), werden beide eine Karte, zum Beispiel „Jupiter und Mars · zwei Planeten nebeneinander“.
- **Merkur** fehlt in der ersten Fassung: Er steht immer tief in der Dämmerung und ist selten sicher zu finden.
- **Die Milchstrasse** nutzt für „So findest du es“ die Wege zum Band, wie sie bisher unter „Wo am Himmel“ beschrieben waren: drei Schritte von einem hellen Wegweiser-Stern zum Band, für die Himmelsrichtung, in der das Band heute am deutlichsten ist, mit dem gemeinsamen Treffpunkt nahe dem Punkt über einem (im Herbst das W der Kassiopeia). Ihr Satz „Mit dem Auge“ passt sich der Dunkelheitsstufe an: „Ein blasser, grauer Schleier, wie eine dünne Wolke, die nicht weiterzieht. Ohne Farben. Er wird deutlicher, wenn du knapp daneben schaust.“
- **Ausserhalb Mitteleuropas** (unter 45° oder über 56° Nord) zeigt die Seite die Liste trotzdem, denn die Rechnung gilt überall. Die Schritte „So findest du es“ sind aber für Mitteleuropa geschrieben. Für andere Orte zeigt jede Karte nur Richtung und Höhe und einen ruhigen Satz, dass es die Anleitung für diesen Ort noch nicht gibt.

## Bilder

Jedes Objekt hat ein Foto, wie man es mit blossem Auge sieht. Es setzt die Erwartung richtig: Es zeigt, was man draussen wirklich findet. Eine Nahaufnahme durch ein Teleskop oder von einer Raumsonde und eine Zeichnung des Sternbilds gibt es in der Karte nicht mehr (entfernt am 26. Nov 2026): Die Nahaufnahme zeigt etwas, das man draussen nicht sieht, und die Figur eines Sternbilds ist schon im Foto eingezeichnet.

- **„Mit dem blossen Auge“:** ein echtes Foto ohne Teleskop, kurz belichtet oder mit Weitwinkel, möglichst mit Horizont, Bäumen oder Häusern. **Nur echte, dunkle Nachtbilder:** keine Dämmerung, kein blauer oder roter Himmel, keine von Stadtlicht grau aufgehellten Wolken. Eine Ausnahme ist die Venus: Bei uns steht sie nie in tiefer Nacht, ihr Foto stammt daher aus der Atacama in Chile, wo sie über dunklem Himmel zu sehen ist; die Bildunterschrift sagt das. Darin ist die Stelle markiert:
  - ein Kreis mit Namen um das gesuchte Objekt,
  - kleinere, gestrichelte Kreise mit Namen für Orientierungspunkte daneben (bei den Plejaden zum Beispiel Venus und Kapella),
  - bei Sternbildern eine Linie durch die Sterne der Figur, etwa das W der Kassiopeia.
  Die Markierungen sind in den Bildkoordinaten gespeichert und skalieren mit dem Bild. Ohne Markierung ist ein Sternenhimmel für Laien wenig aussagekräftig.
- **Vorschaubild:** Die zugeklappte Karte zeigt ein kleines Bild, bei Mond, Planeten, Plejaden, Orion, Milchstrasse und Andromeda ein kleines Foto, bei Sternbildern und Sternen eine kleine Zeichnung der Figur aus den echten Sternpositionen (Norden oben, Osten links).
- **Unter jedem Bild** stehen ein Satz zum Bild, die Urheber und die Lizenz.
- **Nur frei lizenzierte Bilder:** gemeinfrei, CC0, CC BY oder CC BY-SA. Die Bilder werden mit der Anwendung ausgeliefert, nicht von fremden Servern geladen.
- **Ehrlich bleiben:** Zeigt ein Foto mehr als das Auge, sagt die Bildunterschrift es („Weitwinkelfoto des Orion. Es zeigt etwas mehr Sterne, als das Auge sieht.“). Keine Fotos des Bandes, die schöner sind als das, was man wirklich sieht.
- **Im Nachtmodus** werden alle Bilder rot eingefärbt und abgedunkelt, die Markierungen bleiben lesbar.

Die erste Fassung nutzt ausgewählte Fotos von Wikimedia Commons. Ersetzt wurden am 26. Nov 2026 alle Fotos, die Dämmerung oder einen aufgehellten Himmel zeigten (Mond, Saturn, Sommerdreieck, Jupiter und Mars, Venus, Grosser Wagen, Sirius, Andromeda). Für später wäre eine einheitliche Reihe aus Mitteleuropa schöner (siehe offene Fragen).

## Nachtmodus

Draussen soll das Handy die Augen nicht blenden. Der Nachtmodus färbt die ganze Anwendung dunkelrot auf Schwarz, ohne Weiss und ohne Blau. Er lässt sich **nur in den Einstellungen** ein- und ausschalten (Zahnrad oben rechts, Schalter „Nachtmodus“; „Zurück“ führt von dort wieder auf die Seite, von der man kam), nicht auf dieser Seite und nicht auf dem Startbildschirm (entschieden am 26. Nov 2026). Solange er aus ist, verweist ein Tipp unter „Bevor du rausgehst“ auf die Einstellungen: „Nachtmodus: In den Einstellungen färbst du die Anwendung rot, damit sie draussen nicht blendet.“ Der Modus bleibt aktiv, bis man ihn dort ausschaltet, auch in den Modulen. Animationen und Bilder werden darin gedimmt und rot eingefärbt. Die Bildschirmhelligkeit selbst kann die Anwendung nicht verändern. Ein Hinweis bittet darum, sie herunterzudrehen.

## Zwei Fassungen: Hauptreise und freies Erkunden

| Fassung | Inhalt | Ende |
| --- | --- | --- |
| Hauptreise, Akt 6 „Rausgehen“ | Der Abschlusssatz, der Ort (überspringbar, solange keiner gewählt ist), die Bedingungen, der Satz und die ersten drei Objekte, zugeklappt; ohne Zeitpunkte | „Die Reise endet hier. Die Milchstrasse nicht.“ und zurück zum Startbildschirm |
| Freies Erkunden | die ganze Seite | „Zurück zum Himmel“ |

Wer in der Hauptreise keinen Ort angibt, sieht einen Satz ohne Ort: „Such dir heute Nacht einen dunklen Platz, weg von Strassenlaternen, und schau nach oben.“

## Die Karte auf dem Startbildschirm

Die Karte zeigt eine Kurzfassung der Seite und öffnet sie beim Antippen. Ihr Inhalt kommt aus denselben Rechnungen:

- **Ohne Ort:** „Wo stehst du heute Nacht?“ und „Ort wählen“.
- **Mit Ort:** „HEUTE NACHT · HAMBURG“, ab wann es dunkel ist („ab 18:15 Uhr“), die Dunkelheit als fünf Punkte, die Mondzeile und das **Highlight der Nacht** mit Lage: „7 Dinge mit blossem Auge, zum Beispiel Saturn im Süden.“
- **Das Highlight** ist die Milchstrasse, wenn sie sichtbar ist, sonst der hellste Planet zum vorgewählten Zeitpunkt, sonst der hellste Planet zu einem anderen Zeitpunkt der Nacht, sonst das erste Objekt der Liste. Der Mond ist nie das Highlight.
- **Ist die Milchstrasse heute nicht zu sehen,** nennt die Karte die nächste gute Nacht für sie: „Die Milchstrasse: wieder am Samstag.“
- **Sichtbarer Weg auf die Seite:** Die Karte endet immer mit einem Hinweis zum Antippen, ohne Ort „Ort wählen ›“, mit Ort „Was du heute siehst ›“. Die ganze Karte ist der Link.

## Faktenebene

„Wie genau weiss man das?“ am Ende der Seite erklärt:

- **Wann es dunkel ist:** Erst wenn die Sonne 18 Grad unter dem Horizont steht, ist die Dämmerung ganz vorbei. In Hamburg passiert das von Ende Mai bis Ende Juli gar nicht: Dort bleibt es die ganze Nacht ein wenig hell. In Süddeutschland wird es auch im Juni gerade noch dunkel genug. Planeten und helle Sterne sieht man schon in der Dämmerung.
- **Warum der Mond stört:** Sein Licht macht den ganzen Himmel heller. Schon ein Halbmond verschluckt das schwache Band und blasse Nebel. Planeten und helle Sterne bleiben sichtbar.
- **Planeten oder Sterne:** Sterne funkeln, weil ihr Licht als winziger Punkt durch die unruhige Luft kommt. Planeten sind kleine Scheiben, ihr Licht flackert kaum.
- **Die Dunkelheitsstufe** wählst du selbst. Die Anwendung kennt keine Karte der Lichtverschmutzung und auch nicht die Strassenlaterne neben dir.
- **Quellen:** die Ortsliste aus GeoNames (CC BY 4.0), die Sternpositionen aus dem Yale Bright Star Catalogue, Sonne, Mond und Planeten aus astronomy-engine, die Bilder mit Urhebern und Lizenzen.
- **Warum das Band sich übers Jahr ändert:** Im Sommer schauen wir am Abend Richtung Zentrum der Milchstrasse, wo die meisten Sterne sind. Im Winter schauen wir nach aussen, dort ist das Band dünner und blasser.
- **Wie viele Sterne man sieht:** Ohne Fernglas an einem sehr dunklen Ort ein paar tausend gleichzeitig, mitten in der Stadt nur einige Dutzend.
- **Die Zeiten** sind berechnet, nicht beobachtet. Wolken, Dunst und Berge am Horizont kennt die Anwendung nicht.

## Rechenregeln

Alle Angaben sind auf dem Gerät aus Ort, Datum und Uhrzeit berechenbar, ausser der Dunkelheit des Ortes.

- **Dunkel:** Sonne mindestens 18° unter dem Horizont (Ende der astronomischen Dämmerung). Das ist die Zeit der Zeile „Dunkel ab …“.
- **Zeitpunkte:** „Abends“ ist das Ende der nautischen Dämmerung (Sonne 12° unter dem Horizont), frühestens aber 20 Uhr, auf die volle Stunde gerundet. „Mitternacht“ ist die Mitte zwischen Sonnenuntergang und Sonnenaufgang, auf die volle Stunde gerundet. „Morgens“ ist der Beginn der nautischen Dämmerung, auf die volle Stunde abgerundet. Erreicht die Sonne nachts keine 12° unter dem Horizont, gilt für alle drei der dunkelste Moment ±2 Stunden.
- **Sichtbar** ist ein Objekt zum gewählten Zeitpunkt, wenn alle Bedingungen erfüllt sind:
  - Es steht mindestens 10° über dem Horizont.
  - Die Dunkelheit des Ortes erreicht seine Mindeststufe.
  - Die Sonne steht tief genug: für den Mond unter dem Horizont, für Venus und Jupiter 3° darunter, für Mars und Saturn 6°, für einzelne helle Sterne, das Sommerdreieck und den Skorpion 8°, für die übrigen Sternbilder und die Plejaden 9°, für Milchstrasse und Andromeda 18°.
  - Bei Objekten, die der Mond stört: Der Mond stört nicht.
- **Mond stört,** wenn er über dem Horizont steht und mehr als ein Viertel beleuchtet ist. Eine dünne Sichel stört nicht.
- **Grund für „Heute nicht zu sehen“:** der erste zutreffende in dieser Reihenfolge: Ort zu hell, Mond zu hell, Dämmerung, noch nicht aufgegangen, schon untergegangen, zu tief.
- **Sichtbar-Spanne:** die Zeit der Nacht, in der das Objekt nach diesen Regeln sichtbar ist, auf 5 Minuten gerundet, in Worten („die ganze Nacht“, „bis 2:40 Uhr“, „ab etwa 23 Uhr“).
- **Nächste gute Nacht für die Milchstrasse:** die nächste Nacht innerhalb von 30 Tagen mit einer Spanne von mindestens einer Stunde, in der es dunkel ist und der Mond nicht stört. Ist die Dunkelheit des Ortes unter 3, kommt der Hinweis auf einen dunkleren Ort dazu.
- **Lage:** Richtung als eine von acht Himmelsrichtungen. Höhe in Fäusten: Höhe ÷ 10°, gerundet und in Worten gesagt („Vier Fäuste hoch“). Ab 70° heisst es „Fast genau über dir“. Bei Sternbildern gilt die Lage eines festgelegten Hauptsterns oder der Mitte der Figur.
- **Schritte „So findest du es“:** für jedes Objekt geschriebene Texte mit Platzhaltern für Richtung und Höhe. Hängt ein Schritt von der Lage ab (etwa „Leg den Kopf in den Nacken“ ab 70°), gibt es dafür eine eigene Fassung.
- **Uhrzeiten:** Ortszeit des gewählten Ortes, auf 5 Minuten gerundet.
- **Ein Test** prüft für jede Nacht des Jahres auf 45°, 50° und 56° Nord, dass bei Dunkelheit 2 zu mindestens einem Zeitpunkt fünf Objekte sichtbar sind.

## Stille und Haptik

- **Kein Ton,** wie überall in der Anwendung.
- **Keine Benachrichtigungen** in der ersten Fassung. Der Anlass zur Rückkehr ist die Karte auf dem Startbildschirm, nicht ein Signal aufs Handy (siehe offene Fragen).

## Barrierefreiheit

- Alles, was die Bilder zeigen, steht auch in Worten daneben: Lage, „Mit dem Auge“ und die Schritte. Jedes Foto hat einen Alternativtext, der sagt, was markiert ist.
- Beim Öffnen liegt der Fokus auf der Frage „Wo stehst du heute Nacht?“.
- Das Ortsfeld ist ein Kombinationsfeld mit Trefferliste: Pfeiltasten wählen, Enter übernimmt, Escape schliesst. Die Zahl der Treffer wird angesagt.
- Die Dunkelheit ist eine Auswahlliste zum Aufklappen (Kombinationsfeld mit Liste): Pfeiltasten, Pos1 und Ende wählen, Enter oder Leertaste übernimmt, Escape schliesst. Die Punkte sind nur Schmuck, Name und Satz stehen als Text daneben.
- Die Karten sind Knöpfe mit „aufgeklappt“ oder „zugeklappt“. Die Zeitknöpfe zeigen, welcher gedrückt ist. Der Satz unter ihnen wird beim Wechsel angesagt.
- Der Nachtmodus hält die Kontrastregeln ein: Rot auf Schwarz mit ausreichendem Kontrast.
- Reduzierte Bewegung: Karten klappen ohne Animation auf.

## Datenschutz

- Kein Ort ohne ausdrückliche Wahl, kein Standort ohne Tippen auf „Meinen Standort verwenden“.
- Der Ort bleibt auf dem Gerät, gerundet auf einige Kilometer. Er wird an niemanden gesendet.
- Alles wird auf dem Gerät berechnet. Ortsliste, Sterne, Bilder und Rechnung kommen mit der Anwendung; kein Dienst wird gefragt.
- Gespeichert wird nur der zuletzt gewählte Ort, gerundet und nur auf dem Gerät.

## Bewusst weggelassen

- **Die Mission der Nacht:** Die Liste selbst ist der Anlass zum Hochschauen. Jedes Objekt ist eine kleine Aufgabe, ohne dass man sie so nennen muss.
- **Der Zeitstrahl der Nacht** und die **Blickrichtungen mit gezeichnetem Band:** Die drei Zeitpunkte, die Bedingungen und die Sichtbar-Spanne jeder Karte sagen dasselbe einfacher.
- **Schritte oder Tabs („1 Dein Ort“, „2 Was du siehst“) und ein Weiter-Knopf:** Ort und Liste stehen auf einer Seite, die Liste folgt dem Ort sofort.
- **Volle Sternkarte, Planetarium und eine Himmelskarte von oben:** Das können Stellarium und andere besser, und eine Karte von oben ist für Laien schwer zu lesen.
- **Kompass und Kamera („Halte das Handy an den Himmel“):** Sie brauchen Sensoren und Berechtigungen und machen das Handy draussen hell. Die Anleitung arbeitet stattdessen mit Himmelsrichtungen und Fäusten.
- **Objekte, die nur mit Fernglas oder Teleskop zu sehen sind.** Das Fernglas kommt höchstens als Zusatz in einem Schritt vor.
- **Punkte, Ranglisten und Abzeichen.**
- **Fotos teilen** in der ersten Fassung. Teilen lässt sich später als Karte ergänzen („Heute Nacht habe ich Saturn gesehen.“).

## Offene Fragen und Fachprüfung

- [ ] **Bilder:** Woher kommt eine einheitliche Reihe von Fotos „Mit dem blossen Auge“, am besten aus Mitteleuropa und mit Landschaft? Eigene Aufnahmen, eine Partner-Sternwarte oder ausgewählte Bilder von Wikimedia Commons? Die jetzige Auswahl ist dunkel, aber uneinheitlich: Sie stammt aus Frankreich, Schweden, den USA, Chile und Deutschland, und Saturn ist darin ein unauffälliger Punkt.
- [x] **Bildgrösse:** ein Foto je Objekt, höchstens 960 px breit, zusammen etwa 1,3 MB, erst beim Aufklappen geladen. Entschieden am 26. Nov 2026.
- [ ] **Wetter:** Eine Wolkenvorhersage würde die Liste ehrlicher machen. Sie braucht einen externen Dienst. Ohne sie setzt die Seite einen klaren Himmel voraus.
- [x] **Quelle der Dunkelheit (erste Fassung):** Die Nutzer wählen die Stufe selbst, mit einem Vorschlag nach Art des Ortes. Entschieden am 24. Nov 2026, Vorschlag ergänzt am 26. Nov 2026.
- [ ] **Karte der Lichtverschmutzung:** Welche Karte darf später verwendet werden (Lizenz, Auflösung, Aktualität), und wie wird sie auf die fünf Stufen abgebildet? Erst mit ihr kommt „Ein dunklerer Ort in der Nähe“.
- [x] **Ortssuche:** eine eigene Liste auf dem Gerät (GeoNames, Orte ab etwa 15.000 Einwohnern in Deutschland, Österreich und der Schweiz, dazu die Sternenparks). Entschieden am 24. Nov 2026. Offen bleibt, ob kleinere Orte dazukommen sollen.
- [x] **Mission der Nacht:** entfällt. Entschieden am 26. Nov 2026.
- [ ] **Benachrichtigungen:** Soll es eine freiwillige Erinnerung geben („Heute Nacht ist eine gute Nacht für die Milchstrasse“)? Sie wäre ein starker Rückkehranlass, passt aber nur bedingt zur ruhigen Tonalität.
- [ ] **Besondere Ereignisse:** Sollen Sternschnuppenströme (Perseiden, Geminiden), Mondfinsternisse oder enge Begegnungen von Planeten als eigene Karte oben erscheinen?
- [ ] **Andere Regionen und Südhalbkugel:** Die Rechnungen gelten weltweit, die Schritte sind für Mitteleuropa (45° bis 56° Nord) geschrieben. Für andere Orte braucht es eigene Texte und andere Objekte (etwa das Kreuz des Südens).
- [ ] **Sternenparks und Sternwarten:** Woher kommt die Liste, und wer hält sie aktuell? Hier liegt die Zusammenarbeit mit Partnern aus dem Gesamtkonzept.
- [ ] **Schwellen prüfen:** Ab welcher Mondphase stört der Mond wirklich? Ab welcher Dunkelheitsstufe sind Band, Andromeda und Orionnebel sicher sichtbar? Reichen die Sonnentiefen von 0° bis 9° für Mond, Planeten, helle Sterne und Sternbilder? Die Werte oben sind Annahmen.
- [ ] **Fachliche Prüfung** aller Aussagen der Faktenebene, der Sätze „Mit dem Auge“ und der Schritte, besonders der Höhen und Richtungen in den Beispielen (gerechnet für Hamburg, 53,5° Nord, 26. November 2026) und der Grenzen der hellen Sommernächte.
