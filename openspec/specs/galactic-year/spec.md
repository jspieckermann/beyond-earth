# galactic-year Specification

## Purpose

Modul C "Das galaktische Jahr": on one page, users learn that the whole Solar System races around the centre of the Milky Way and how long one round takes, and turn the Sun back along its orbit round by round to see what the Earth looked like at each station, so that Earth's history gets a measure in rounds of the galaxy.

## Requirements

### Requirement: Module entry
Activating "Eintauchen" for "Das galaktische Jahr" on the home screen, or "Wie lange dauert eine Runde um die Galaxie?" in Modul A, SHALL open the Modul C experience at its module address in its free-exploration variant. The page SHALL be in German, have the document title "Das galaktische Jahr · Die Milchstrasse erleben", start at its top with the Sun at today's place and move keyboard focus to its main heading. It SHALL NOT ask for the user's location. A visible "Zurück zum Himmel" control SHALL return to the home screen at any time.

#### Scenario: Enter from the home screen
- **WHEN** the user selects the "Das galaktische Jahr" star and activates "Eintauchen"
- **THEN** Modul C opens with the title "Das galaktische Jahr · Die Milchstrasse erleben" and focus on its main heading

#### Scenario: Enter from Modul A
- **WHEN** the user activates "Wie lange dauert eine Runde um die Galaxie?" in the fact sheet of "Die ganze Milchstrasse"
- **THEN** Modul C opens at the top of its page

#### Scenario: No location request
- **WHEN** the module opens and is used through all its parts
- **THEN** the browser is never asked for the device location

### Requirement: One page with two parts
The module SHALL be a single page with two parts, one below the other, each with its own heading: "Eine Runde" and "Zurückdrehen". There SHALL be no further scenes or steps; in particular, there is no homecoming into the Orion arm. Together with the parts (between them on phones and upright tablets, beside them on wide screens), one picture SHALL show the Milky Way seen from above (the reconstruction used at Modul A's stage "Die ganze Milchstrasse") with the Sun's orbit drawn as a circle around the centre and the Earth's position marked by a small glowing point; while the Sun is at today's place, a short arrow SHALL show its direction of motion. The picture SHALL stay in view while the page scrolls. Nothing SHALL change unless the user moves it, except the Sun's short glide to a station.

#### Scenario: Two parts on one page
- **WHEN** the module opens
- **THEN** the headings "Eine Runde" and "Zurückdrehen" are shown on one page, together with the picture of the orbit, and there is no part "Spüren" and no distance counter

#### Scenario: No homecoming
- **WHEN** the user uses every part of the page
- **THEN** no Orion-arm close-up and no third part are shown

#### Scenario: Nothing changes by itself
- **WHEN** the user waits two minutes without any input
- **THEN** the Sun is still at today's place and nothing has been announced


### Requirement: One round
The part "Eine Runde" SHALL make clear what one round is: the way of the whole Solar System, the Sun with all its planets, once around the centre of the Milky Way, at about 230 km per second. It SHALL show "230 Millionen Jahre", the line „Die Sonne zieht mit allen Planeten um das Zentrum der Milchstrasse. Für eine Runde braucht sie 230 Millionen Jahre.“, the explanation „Eine Runde, ein galaktisches Jahr, ist der Weg unseres ganzen Sonnensystems einmal um das Zentrum der Milchstrasse. Dabei rast es mit rund 230 Kilometern pro Sekunde: in einer Sekunde fast von Hamburg nach Berlin, Luftlinie.“, the comparison „Seit ihrer Geburt hat die Sonne rund zwanzig Runden gedreht. Ein Mensch, der 80 wird, erlebt von einer einzigen Runde gut ein Dreimillionstel.“ and the addition „Dabei schwingt die Sonne langsam auf und ab, wie ein Pferd auf einem Karussell.“

#### Scenario: One round explained
- **WHEN** the module opens
- **THEN** "Eine Runde" shows "230 Millionen Jahre", says that one round is the way of the whole Solar System around the centre of the Milky Way, and names the speed of about 230 km per second

### Requirement: Turning back
In the part "Zurückdrehen" the user SHALL turn the Sun back along its orbit with a time slider or by dragging the Sun along the orbit in the picture. The Sun SHALL move against its direction of motion, and the time back SHALL be shown large ("vor 115 Mio. Jahren") together with the rounds back ("1 Runde zurück", "2 Runden zurück") and, in a smaller line below, the rounds the Sun had completed around the centre by then ("Bis heute: rund 20 Runden um das Zentrum" at today, "Bis dahin: 19 Runden um das Zentrum" one round back, "Bis dahin: noch keine Runde" at its formation). Above the slider, below the time and the rounds, the title, sentence and caption of the station closest to the Sun SHALL always be shown; while the user moves, they SHALL change as the Sun passes the stations, and no text SHALL disappear. Each of these texts SHALL have a fixed room that fits its longest version at the current screen width and no more (title one line; sentence two lines, three on phones narrower than 480 px; caption two lines, three on phones narrower than 360 px), with little space between the texts and the slider, and the time SHALL stay on one line, so that the slider below never moves while it is used. The slider's label ("Zieh die Sonne zurück auf ihrer Bahn") SHALL be available to assistive technology but not shown. The time, the rounds and the Earth SHALL change continuously; when the user lets go, the Sun SHALL glide to the nearest station. The arrow keys SHALL move from station to station, Page-Up and Page-Down from main station to main station, Home and End to today and to the oldest station. The slider SHALL always span the whole range, from today to the oldest station (20 rounds; 3 rounds in the main journey), as one ray made of two linear parts: the first 5 rounds, where most stations lie, SHALL fill 70 % of its width, and the rounds from 5 to 20 the remaining 30 %. Within each part equal distances SHALL mean equal time; a slider that ends within the first 5 rounds is simply linear. Under the slider a ruler SHALL show, in the first part, a tick for every quarter round and a label for every round ("heute", "1" … "5", with "5" emphasised where the second part begins), and beyond it a tick for every round and a label for every fifth round ("10", "15", "20"), followed by the unit "Runden · 1 Runde = 230 Mio. Jahre". Every station SHALL be shown on the ruler as a dot at its true place, main stations larger than in-between stations. One dot SHALL be highlighted: while the user moves the slider or drags the Sun, the station the Sun will snap to when let go, moving along with it; otherwise the station the Sun rests at or glides to. The stretch of orbit travelled back SHALL be drawn as a bright arc, and every round the Sun had completed around the centre at the time shown (the Sun's age of 4,6 billion years minus the time back, in whole rounds) SHALL be drawn as a fine ring close to the orbit, the rings lying close together like growth rings. The rings SHALL follow the time: today there are 20, turning back removes a ring with each full round, turning forward adds it again, and at the Sun's formation there is none.

There SHALL be nine main stations:

| Station | Rounds back | Time shown | Sentence | Earth then |
| --- | --- | --- | --- | --- |
| Heute | 0 | heute | „Hier sind wir. Auf dem Weg, wie immer.“ | die Erde, wie wir sie kennen |
| Ende der Dinosaurier | 66 ÷ 230 | vor 66 Mio. Jahren | „Ein Viertel Runde. Seitdem gibt es Platz für Säugetiere. Für uns.“ | Ein Asteroid schlägt ein, die grossen Dinosaurier sterben aus. |
| Eine halbe Runde | ½ | vor 115 Mio. Jahren | „Auf der anderen Seite der Galaxie: Die Erde beginnt zu blühen.“ | Dinosaurier überall, die ersten Blumen breiten sich aus. |
| Eine Runde | 1 | vor 230 Mio. Jahren | „Als die Sonne das letzte Mal an dieser Stelle war, gingen die ersten Dinosaurier über die Erde.“ | Ein einziger grosser Kontinent, Pangäa. Die ersten Dinosaurier. |
| Zwei Runden | 2 | vor 460 Mio. Jahren | „Zwei Runden zurück: Das Land ist kahl und still.“ | Leben gibt es fast nur im Meer. Die ersten winzigen Pflanzen wagen sich an Land. |
| Drei Runden | 3 | vor 690 Mio. Jahren | „Drei Runden zurück: eine weisse Kugel aus Eis.“ | Schneeball Erde, Eis bis fast an den Äquator. Es gibt noch keine Tiere. |
| Vier Runden | 4 | vor 920 Mio. Jahren | „Vier Runden zurück: Die Erde gehört den Winzigen.“ | Der Urkontinent Rodinia. Einzeller und erste einfache Algen. |
| Sechzehn Runden | 16 | vor 3,7 Mrd. Jahren | „Sechzehn Runden zurück: irgendwo im Meer das erste Leben.“ | Fast nur Meer, ein paar Vulkaninseln. Die ältesten Spuren von Leben. |
| Zwanzig Runden | 20 | vor 4,6 Mrd. Jahren | „Zwanzig Runden. Weiter zurück gibt es uns nicht.“ | Die Sonne und die Erde entstehen. Die Erde ist eine glühende Kugel. |

and fifteen in-between stations, each with a title, a sentence and a caption:

| Time shown | Title | Sentence |
| --- | --- | --- |
| vor 6 Mio. Jahren | Die ersten Vormenschen | „In Afrika richten sich die ersten Vormenschen auf.“ |
| vor 34 Mio. Jahren | Die Antarktis vereist | „Am Südpol wächst zum ersten Mal ein dicker Eispanzer.“ |
| vor 150 Mio. Jahren | Archaeopteryx | „Ein Dinosaurier mit Federn hebt ab: Archaeopteryx.“ |
| vor 180 Mio. Jahren | Pangäa zerbricht | „Pangäa beginnt zu zerbrechen. Der Atlantik ist ein schmaler Graben.“ |
| vor 252 Mio. Jahren | Das grosse Sterben | „Fast alles Leben im Meer stirbt aus. Danach beginnt alles neu.“ |
| vor 300 Mio. Jahren | Die Kohlewälder | „Riesige Wälder wachsen, Libellen werden so gross wie Möwen.“ |
| vor 375 Mio. Jahren | Fische gehen an Land | „Ein Fisch stemmt sich auf seine Flossen und kriecht an Land.“ |
| vor 445 Mio. Jahren | Massensterben im Ordovizium | „Eine Eiszeit beendet das Leben vieler Meerestiere.“ |
| vor 540 Mio. Jahren | Die Kambrische Explosion | „Plötzlich gibt es Tiere mit Augen, Beinen und Panzern.“ |
| vor 575 Mio. Jahren | Ediacara | „Die ersten grossen Lebewesen: weiche Wesen wie Wedel und Scheiben.“ |
| vor 1,1 Mrd. Jahren | Die ersten Mehrzeller | „Zum ersten Mal bestehen Lebewesen aus vielen Zellen: rote Algen.“ |
| vor 2 Mrd. Jahren | Zellen mit Zellkern | „Eine neue Art Zelle entsteht: mit Zellkern. Aus ihr werden später Pflanzen, Tiere und wir.“ |
| vor 2,4 Mrd. Jahren | Sauerstoff in der Luft | „Winzige Algen füllen die Luft mit Sauerstoff. Für viele Lebewesen ist er Gift.“ |
| vor 4,4 Mrd. Jahren | Die ersten Ozeane | „Es regnet. Zum ersten Mal gibt es Ozeane.“ |
| vor 4,5 Mrd. Jahren | Der Mond entsteht | „Ein Himmelskörper prallt auf die Erde. Aus den Trümmern entsteht der Mond.“ |

The Sun SHALL be brought back to today with the slider, by dragging it or with the Home key; there is no separate button for it.

#### Scenario: One round back
- **WHEN** the user moves the time slider to "1 Runde" and lets go
- **THEN** the Sun stands at the same place on the orbit as today, "vor 230 Mio. Jahren" and „Als die Sonne das letzte Mal an dieser Stelle war, gingen die ersten Dinosaurier über die Erde.“ are shown, "Bis dahin: 19 Runden um das Zentrum" is shown, and 19 rings are drawn around the orbit

#### Scenario: Half a round
- **WHEN** the Sun rests at "vor 115 Mio. Jahren"
- **THEN** it stands on the opposite side of the centre from today, and a bright arc of half the orbit leads back to today's position

#### Scenario: In-between station
- **WHEN** a keyboard user focuses the time slider at today and presses Arrow-Right
- **THEN** the Sun settles at "vor 6 Mio. Jahren" with „In Afrika richten sich die ersten Vormenschen auf.“

#### Scenario: Main stations with the page keys
- **WHEN** the Sun rests at "vor 6 Mio. Jahren" and the user presses Page-Up
- **THEN** the Sun settles at the next main station "vor 66 Mio. Jahren"

#### Scenario: One ray, first 5 rounds stretched
- **WHEN** the module opens
- **THEN** the ruler is labelled "heute", "1", "2", "3", "4", "5", "10", "15" and "20", the dot of the station one round back sits at 14 % of the slider's width, and the label "5" sits at 70 %

#### Scenario: Events while moving
- **WHEN** the user moves the slider to about 217 million years back without letting go
- **THEN** "Pangäa und die ersten Dinosaurier" and its sentence are shown as the closest station, no text has disappeared, and nothing is announced

#### Scenario: Snap target highlighted
- **WHEN** the user moves the slider to about 217 million years back without letting go
- **THEN** the dot of "vor 230 Mio. Jahren" is highlighted as the station the Sun will snap to, and no other dot is highlighted

#### Scenario: Snap on release
- **WHEN** the user drags the Sun to about 130 million years back and lets go
- **THEN** the Sun glides to the nearest station "vor 115 Mio. Jahren" and its sentence appears

#### Scenario: Rings follow the Sun
- **WHEN** the user has turned back three rounds and then moves the Sun forward to "vor 460 Mio. Jahren"
- **THEN** 17 rings are drawn at three rounds back and 18 at "vor 460 Mio. Jahren"
- **AND** after moving back to today 20 rings are drawn and "Bis heute: rund 20 Runden um das Zentrum" is shown
- **AND** at "vor 4,6 Mrd. Jahren" no ring is drawn

### Requirement: The Earth of the past
A small globe in the corner of the picture SHALL show the Earth at the Sun's current place in a simplified but detailed drawing for every station: the outlines of the continents of that time, on them regions such as deserts, forests, mountains, ice and lava, a lighter fringe of shallow water along the coasts, polar caps with a curved edge and a thin atmosphere (for example today's continents with the Sahara, the Amazon, the Andes and Greenland's ice; Pangaea with its inland deserts at one round back; almost all ice at three rounds back; a glowing ball with a cracked crust at twenty rounds back). Between two stations the globe SHALL change continuously: the land of the younger station, with its regions, fades out while the land of the older one fades in, the colour of the ocean changes gradually, and the polar ice grows or shrinks smoothly. A caption "Die Erde damals: …" in "Zurückdrehen" SHALL describe it with the text of the closest station.

#### Scenario: Pangaea
- **WHEN** the Sun settles at "vor 230 Mio. Jahren"
- **THEN** the globe shows a single large continent and the caption reads "Die Erde damals: Ein einziger grosser Kontinent, Pangäa. Die ersten Dinosaurier."

#### Scenario: Today in detail
- **WHEN** the Sun rests at today's place
- **THEN** the globe shows today's continents with a desert, rainforests, mountains and Greenland's ice

#### Scenario: Snowball Earth
- **WHEN** the Sun settles at "vor 690 Mio. Jahren"
- **THEN** the globe is almost entirely white with ice

#### Scenario: Continents drift
- **WHEN** the user moves the slider halfway between two stations with different land without letting go
- **THEN** the globe shows the land of both stations, each half faded




### Requirement: No buttons under the slider
"Zurückdrehen" SHALL offer no buttons besides "Wie genau weiss man das?": no magnifier ("Wo bleiben wir Menschen?"), no "Zurück nach heute", no "Bild teilen" and no link to Modul A. In free exploration the page SHALL end after "Zurückdrehen"; "Zurück zum Himmel" leads away from it.

#### Scenario: Only the slider and the facts
- **WHEN** the Sun rests at any station in free exploration
- **THEN** the only button in "Zurückdrehen" is "Wie genau weiss man das?", and none of "Wo bleiben wir Menschen?", "Zurück nach heute", "Bild teilen" or "Zur Milchstrasse in Modul A" is shown

### Requirement: Calculation
The module SHALL calculate with a circular orbit at a constant 230 km/s and 230 million years per round (the galactic year), relative to the galactic centre:
- rounds = time span ÷ 230 million years;
- rounds completed by a time = (4,6 billion years − time back) ÷ 230 million years, rounded down, never below 0 (20 today);
- distance = time span × 230 km/s, with one year = 365,25 days;
- distances SHALL be shown in kilometres in German number format below 1 billion km, and from there in "Milliarden Kilometer", with one decimal below 10 billion and as whole numbers above;
- an age in galactic years SHALL be shown with two significant digits.
Positions on the orbit SHALL follow the rounds: a whole number of rounds back puts the Sun at today's place, half a round at the opposite side.

#### Scenario: Values of the concept
- **WHEN** the module calculates these spans
- **THEN** it gives:

| Span | Distance | Rounds |
| --- | --- | --- |
| 1 second | 230 km | – |
| 1 hour | 828.000 km | – |
| 1 year | 7,3 Milliarden Kilometer | – |
| 30 years | 218 Milliarden Kilometer | 0,00000013 |
| 66 million years | – | 0,29 |
| 300.000 years | – | 0,13 % of a round, about half a degree |
| 4,6 billion years | – | 20 |

### Requirement: Fact sheet
Each part SHALL offer "Wie genau weiss man das?", which opens a fact sheet with that part's facts and closes with its close control or Escape, returning focus to the control that opened it:
- **Eine Runde:** that the Sun moves with all its planets, the whole Solar System, around the centre at about 230 km/s; why the motion is not felt (everything around us moves along, like in a calmly flying plane); the distance to the centre of about 26.000 light-years; that measurements give a galactic year of about 210 to 250 million years and the module uses 230; that the orbit is drawn as a circle and the Sun crosses the middle of the disc every 30 to 40 million years; that the visible stars and gas are not enough to hold the Sun on its orbit, with a branch "Was hält die Sonne auf ihrer Bahn?" to "Das Unsichtbare" (F).
- **Zurückdrehen:** how rounds are calculated; that the fine rings show the rounds the Sun had completed by the time shown, and that "about 20" is rounded: with the measured 210 to 250 million years per round it would be 18 to 22; that the spiral arms stand still in the picture although in reality they turn more slowly; that the Earth globes are simplified drawings, not reconstructions; that our species exists for about 300.000 years, about an eighth of a percent of a round; that the neighbouring stars move along at almost the same speed; that the Milky Way picture is a reconstruction from measurements, with its source (NASA/JPL-Caltech/ESO/R. Hurt).

#### Scenario: Calculation disclosed
- **WHEN** the user opens the fact sheet of "Eine Runde"
- **THEN** it states that the module uses 230 million years per round and that measurements range from about 210 to 250 million years

#### Scenario: Drawings labelled
- **WHEN** the user opens the fact sheet of "Zurückdrehen"
- **THEN** it states that the Earth globes are simplified drawings and names the source of the Milky Way picture

#### Scenario: Branch to the invisible
- **WHEN** the user activates "Was hält die Sonne auf ihrer Bahn?" in the fact sheet of "Eine Runde"
- **THEN** the destination of "Das Unsichtbare" is shown

### Requirement: No distance since birth
The module SHALL NOT show a distance travelled since the user's birth or an age in galactic years, also when a birth year is stored on the device; such numbers say little to the user.

#### Scenario: Birth year stored
- **WHEN** a birth year is stored on the device
- **THEN** no line about the distance since birth or the age in galactic years is shown


### Requirement: Two variants
The module SHALL support two variants:
- **Freies Erkunden** (used at the module address): all main and in-between stations, and the fact sheets with their branch.
- **Hauptreise** (for embedding in the later guided journey): the same page with only the stations today, 1, 2 and 3 rounds back; no branch. At the end of the page it SHALL show „Und all das kannst du sehen. Heute Nacht, über dir.“ and "Weiter: Rausgehen", which signals completion to the embedding journey.

#### Scenario: Main-journey variant
- **WHEN** the module runs in the main-journey variant
- **THEN** the time slider offers only today, 1, 2 and 3 rounds back

#### Scenario: Completion signalled
- **WHEN** the user activates "Weiter: Rausgehen" in the main-journey variant
- **THEN** the module signals completion to the embedding journey

### Requirement: Completion marks the module explored
Turning the Sun back at least one full round (the Sun settling at a station one or more rounds back) SHALL mark the module as explored, so the home screen shows its star in the explored style.

#### Scenario: Brighter star
- **WHEN** the user has turned the Sun back one round and goes back to the home screen
- **THEN** the "Das galaktische Jahr" star is shown in the explored style

#### Scenario: Not yet explored
- **WHEN** the user has turned the Sun back only half a round
- **THEN** the module is not marked as explored

### Requirement: Haptics and silence
The module SHALL NOT play any sound and SHALL NOT read any text aloud. On devices that support vibration and with vibration switched on (the setting shared with Modul A and B), it SHALL give one short pulse when the Sun settles at a station that lies a whole number of rounds back (1, 2, 3, 4, 16 or 20), and no other vibration.

#### Scenario: Pulse on a full round
- **WHEN** the Sun settles at "vor 460 Mio. Jahren" on a device with vibration on
- **THEN** exactly one short pulse is triggered

#### Scenario: No pulse on a part round
- **WHEN** the Sun settles at "vor 115 Mio. Jahren"
- **THEN** no pulse is triggered

### Requirement: Reduced motion
When the system requests reduced motion, the Sun SHALL jump to a station instead of gliding. Turning back with the slider or by dragging SHALL remain possible.

#### Scenario: Jump instead of glide
- **WHEN** reduced motion is requested and the user lets go of the slider between two stations
- **THEN** the Sun appears at the nearest station without a gliding movement

### Requirement: Accessibility
The module SHALL meet WCAG 2.1 AA and report zero automated accessibility (axe) violations, with and without an open fact sheet. Every function SHALL be operable with the keyboard and with single taps; dragging the Sun SHALL never be the only way. The time slider SHALL be a real slider whose value text names the time back ("vor 230 Millionen Jahren"). The picture and the Earth globe SHALL have text alternatives describing the current station. A station's time and sentence SHALL be announced once when the Sun settles there, not while it moves. Controls SHALL have visible focus indicators and touch targets of at least 44 × 44 CSS px; text SHALL keep a contrast ratio of at least 4.5:1; the orbit, arc and rings SHALL be distinguishable without colour.

#### Scenario: Automated check
- **WHEN** an axe scan runs on the page, with the fact sheet of "Eine Runde" open and with the Sun twenty rounds back
- **THEN** it reports zero violations

#### Scenario: Keyboard only
- **WHEN** a keyboard user focuses the time slider and presses Arrow-Right
- **THEN** the Sun settles at the next station back and its time and sentence are announced once


### Requirement: Responsive layout
The module SHALL work from 320 px wide phones to desktop screens without horizontal scrolling, with nothing cut off. On phones and upright tablets the page SHALL show, in this order, "Eine Runde", the picture and "Zurückdrehen"; once scrolled to, the picture SHALL stay at the top of the screen while "Zurückdrehen" scrolls beneath it. On wide screens (and tablets held sideways) the parts SHALL sit in a column on the left and the picture SHALL stay in view on the right.

#### Scenario: Order on phones and tablets
- **WHEN** the module is shown at 390 × 844 px or 834 × 1194 px
- **THEN** "Eine Runde" comes first, then the picture, then "Zurückdrehen"

#### Scenario: Small phone
- **WHEN** the module is shown at 320 × 640 px and the user scrolls to the time slider
- **THEN** there is no horizontal scrolling, and the picture, the Earth globe, the time and the slider are fully visible together

#### Scenario: Desktop
- **WHEN** the module is shown at 1440 × 900 px
- **THEN** the parts sit in a left column and the galaxy stays in view to the right

### Requirement: Privacy and loading
The module SHALL work without an account and SHALL NOT load resources from third-party servers. It SHALL use no personal data.

#### Scenario: No third-party requests
- **WHEN** the user turns the Sun back through all stations
- **THEN** every requested resource comes from the application's own origin

### Requirement: A calm slider
Using the time slider SHALL NOT move the slider itself or make texts disappear. The slider SHALL keep its place on the page while the Sun moves and while the texts above it change, and every one of these texts SHALL fit its fixed room.

#### Scenario: Slider keeps its place
- **WHEN** the module is shown 320, 390, 430, 834, 1024 or 1440 px wide and the user steps through all 24 stations
- **THEN** the slider stays at the same height on the page throughout, and no station text overflows its room

#### Scenario: Texts stay visible
- **WHEN** the user moves the slider without letting go
- **THEN** the title, sentence and caption of the closest station stay visible and change only in their content
