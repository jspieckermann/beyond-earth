# outward-journey Specification

## Purpose

Modul A "Die Reise nach draussen": one continuous, user-driven zoom that starts with the whole Earth and widens step by step to the observable universe, so that users feel how every step outwards makes everything before it tiny, while the Earth is never lost.

## Requirements

### Requirement: Module entry
Activating "Eintauchen" for "Die Reise nach draussen" on the home screen SHALL open the Modul A experience at its module address in its free-exploration variant. The page SHALL be in German and have the document title "Die Reise nach draussen · Die Milchstrasse erleben". It SHALL start at the stage "Die Erde" and move keyboard focus to its main heading, unless the address names a stage and a close-up to return to (coming back from "Reisen mit Lichtgeschwindigkeit"): then it SHALL start resting at that stage with that close-up open and focus on the close-up's back control. An address naming an unknown stage or close-up SHALL start at "Die Erde". It SHALL NOT ask for the user's location. A visible "Zurück zum Himmel" control SHALL return to the home screen at any time.

#### Scenario: Enter from the home screen
- **WHEN** the user selects the Modul A star and activates "Eintauchen"
- **THEN** the Modul A experience opens at "Die Erde" with the title "Die Reise nach draussen · Die Milchstrasse erleben"

#### Scenario: Return from Modul B
- **WHEN** the user comes back from "Reisen mit Lichtgeschwindigkeit" with "Zurück zu Andromeda"
- **THEN** Modul A rests at "Die Lokale Gruppe" with the Andromeda close-up open

#### Scenario: Unknown return address
- **WHEN** the address names a close-up that does not exist
- **THEN** Modul A opens at "Die Erde"

#### Scenario: No location request
- **WHEN** the module opens and is used through all stages
- **THEN** the browser is never asked for the device location

#### Scenario: Leave at any time
- **WHEN** the user activates "Zurück zum Himmel" at any stage
- **THEN** the home screen is shown

### Requirement: One continuous view
The module SHALL be a single view without screen or page changes. Zooming out SHALL widen the same picture so that new content comes into view while earlier content stays in place and only becomes smaller. The seven stages SHALL appear in this order of growing scale: 1 "Die Erde", 2 "Erde und Mond", 3 "Das Sonnensystem", 4 "Benachbarte Sternensysteme", 5 "Die ganze Milchstrasse", 6 "Die Lokale Gruppe", 7 "Das ganze Universum". The Orion arm and the galactic centre are not stages of their own: they are selectable places at "Die ganze Milchstrasse", and Andromeda is a selectable galaxy at "Die Lokale Gruppe".

#### Scenario: Stage order
- **WHEN** the user zooms out from "Die Erde" until the end
- **THEN** the view settles at the stages in exactly this order: Die Erde, Erde und Mond, Das Sonnensystem, Benachbarte Sternensysteme, Die ganze Milchstrasse, Die Lokale Gruppe, Das ganze Universum

#### Scenario: Nothing is replaced
- **WHEN** the user zooms from "Die Erde" to "Erde und Mond"
- **THEN** the Earth stays in the picture, smaller, and the Moon comes into view on its orbit
- **AND** the address of the page does not change

### Requirement: User-driven stepless zoom
The zoom SHALL be stepless and logarithmic, so that each factor of distance takes the same zoom movement at every scale. Users SHALL be able to zoom out and back in with a two-finger pinch, the scroll wheel, a vertical drag on the picture (dragging up zooms out), the keyboard (Arrow-Up/Page-Down and "+" out, Arrow-Down/Page-Up and "−" in) and the scale bar. When the user lets go, the view SHALL ease into the nearest stage in the direction of the last movement. The view SHALL never move to another stage by itself without a user action. Zooming in SHALL stop at "Die Erde", and zooming out SHALL stop at "Das ganze Universum".

#### Scenario: Snap after release
- **WHEN** the user drags up from "Die Erde" by a small amount and lets go
- **THEN** the view eases into "Erde und Mond" and stays there

#### Scenario: Back at any time
- **WHEN** the user is at "Das Sonnensystem" and scrolls the wheel up
- **THEN** the view zooms back in towards "Erde und Mond"

#### Scenario: No automatic movement
- **WHEN** the user stays at any stage without input for 60 seconds
- **THEN** the view is still at that stage

#### Scenario: Keyboard only
- **WHEN** a keyboard user presses Arrow-Up at "Die Erde"
- **THEN** the view moves to "Erde und Mond"

### Requirement: Texts at stages only
Each stage SHALL have a title, a poetic line, an Aha comparison and a fact sheet. When the view rests at a stage, the title, the poetic line and the Aha comparison SHALL appear together and without delay, directly in the picture, without boxes; this includes "Das ganze Universum". Below them a "Wie genau weiss man das?" control SHALL be offered. While the view is moving between stages, all stage texts SHALL be hidden, and only the current distance SHALL be shown, large and centred. At the start, a quiet hint SHALL explain how to zoom out. It SHALL disappear after the first zoom. The texts SHALL be those of the concept:

| Stage | Poetic line | Aha comparison |
| --- | --- | --- |
| Die Erde | „Jeder Mensch, den du je gekannt hast, hat auf dieser Kugel gelebt.“ | Licht umrundet die Erde 7,5-mal in einer Sekunde. |
| Erde und Mond | „Weiter als bis knapp hinter den Mond sind Menschen nie gekommen.“ | Alle anderen Planeten passen nebeneinander fast in die Lücke zwischen Erde und Mond. |
| Das Sonnensystem | „Acht Welten. Und fast alles dazwischen ist leer.“ | Mit dem Auto bei 100 km/h ohne Pause wäre man 171 Jahre bis zur Sonne unterwegs. |
| Benachbarte Sternensysteme | „Unsere nächsten Nachbarn. Und dazwischen: nichts.“ | Voyager 1, unser schnellstes fernes Raumschiff, bräuchte bis hierher rund 75.000 Jahre. |
| Die ganze Milchstrasse | „Das ist sie. Unsere Galaxie. Und irgendwo darin, viel zu klein, um sie zu sehen: die Erde.“ | Wäre die Milchstrasse so gross wie Europa, wäre unser ganzes Sonnensystem bis Neptun etwa ein Kronkorken. |
| Die Lokale Gruppe | „Unsere Nachbarschaft. Und zum ersten Mal ist es hier nicht leer.“ | Wäre die Milchstrasse eine Münze, läge Andromeda nur gut einen halben Meter entfernt. |
| Das ganze Universum | „Und das ist nur der Teil, dessen Licht uns schon erreicht hat.“ | Es gibt wahrscheinlich mehr Galaxien im Universum als Sterne in der Milchstrasse. |

#### Scenario: Wonder first, then understanding
- **WHEN** the view settles at "Die ganze Milchstrasse"
- **THEN** the title, the poetic line and the Aha comparison about the Kronkorken appear at once, with "Wie genau weiss man das?" below them

#### Scenario: No delay at the universe
- **WHEN** the view settles at "Das ganze Universum"
- **THEN** its title, poetic line and Aha comparison appear at once, together with "Und jetzt zurück. Nach Hause."

#### Scenario: Only the distance while moving
- **WHEN** the user is zooming between "Benachbarte Sternensysteme" and "Die ganze Milchstrasse"
- **THEN** no stage text is visible, and the current distance is shown large in the centre

#### Scenario: Start hint
- **WHEN** the module opens
- **THEN** a hint explains how to zoom out
- **AND** after the first zoom movement the hint is no longer shown

### Requirement: Fact sheet
"Wie genau weiss man das?" SHALL open the facts of the current stage on a translucent sheet over the picture, with the picture staying visible above it. The sheet SHALL list the stage's facts from the concept and name the image source. Where a picture is drawn larger than to scale or as a time-lapse, the facts SHALL say so. It SHALL close with its close control, with Escape, or when the user zooms. Focus SHALL move into the sheet when it opens and back to its opener when it closes.

#### Scenario: Facts at the Milky Way
- **WHEN** the user opens the facts at "Die ganze Milchstrasse"
- **THEN** the sheet states a diameter of about 100.000 Lichtjahre, 100 to 400 Milliarden Sterne, and that no one has ever photographed the Milky Way from outside and the picture is a reconstruction
- **AND** it names the image source

#### Scenario: Close with Escape
- **WHEN** the fact sheet is open and the user presses Escape
- **THEN** the sheet closes and focus returns to "Wie genau weiss man das?"

### Requirement: Distance and light time
The current distance SHALL always be visible in its most familiar unit (km, Mio. km, Mrd. km, Lichtjahre, Mio. Lichtjahre, Mrd. Lichtjahre), with the light time below it, both in German number format. During zooming they SHALL change continuously. At rest the values SHALL be:

| Stage | Distance | Light time |
| --- | --- | --- |
| Die Erde | 12.742 km | 0,04 s |
| Erde und Mond | 384.400 km | 1,3 s |
| Das Sonnensystem | 4,5 Mrd. km | 4 h 10 min |
| Benachbarte Sternensysteme | 4,24 Lichtjahre | 4,2 Jahre |
| Die ganze Milchstrasse | 100.000 Lichtjahre | 100.000 Jahre |
| Die Lokale Gruppe | 10 Mio. Lichtjahre | 10 Mio. Jahre |
| Das ganze Universum | 93 Mrd. Lichtjahre | seit 13,8 Mrd. Jahren |

#### Scenario: Values at a stage
- **WHEN** the view rests at "Erde und Mond"
- **THEN** the distance reads "384.400 km" and the light time "1,3 s"

#### Scenario: Values change while zooming
- **WHEN** the user zooms from "Das Sonnensystem" towards "Benachbarte Sternensysteme"
- **THEN** the shown distance grows continuously from "4,5 Mrd. km" towards "4,24 Lichtjahre"

### Requirement: Scale bar with stages
A scale bar on the edge SHALL name all seven stages in order, from "Erde" at the bottom to "Universum" at the top. It SHALL mark the current position continuously and highlight the stage the view rests at. Dragging along the bar SHALL zoom. Activating a stage name SHALL fly the view to that stage. Jumping via the bar SHALL be available from the start, without first completing the module. Where the stages are listed behind a "Stufen" control (short phones), choosing a stage or closing the list SHALL return keyboard focus to "Stufen", and when the bar switches between its full and compact form while it has focus, focus SHALL stay in the bar, so the travel keys keep working.

#### Scenario: Jump to a stage
- **WHEN** the user activates "Lokale Gruppe" on the scale bar at "Die Erde"
- **THEN** the view flies through the stages in between and settles at "Die Lokale Gruppe"

#### Scenario: Current stage highlighted
- **WHEN** the view rests at "Erde und Mond"
- **THEN** "Mond" is highlighted on the scale bar and no other stage is

### Requirement: The Earth stays findable and selectable
Up to the solar system the Earth SHALL be drawn as a sphere with its name ("Erde") next to it. From the way out of the solar system to the edge of the universe, the Earth SHALL be marked as a small, calmly glowing point labelled "Erde", even when it would be smaller than a pixel; the marker SHALL fade in only there, so it never covers the Earth sphere. When the Earth is outside the visible area, the marker SHALL stay at the edge of the screen and point towards the Earth. The marker SHALL never cover the stage texts. In free exploration the Earth SHALL be selectable at every stage except "Die Erde": at "Erde und Mond" and "Das Sonnensystem" through its sphere and its name, from "Benachbarte Sternensysteme" outwards through the marker. Selecting it SHALL open the Earth close-up, which returns to the stage it was opened from.

#### Scenario: Never lost
- **WHEN** the view rests at "Das ganze Universum"
- **THEN** a point labelled "Erde" is visible

#### Scenario: Earth off-screen
- **WHEN** the Earth lies outside the visible area
- **THEN** the Earth marker is shown at the edge of the screen with a direction hint towards the Earth

#### Scenario: Earth from far away
- **WHEN** the user selects the Earth marker at "Die Lokale Gruppe"
- **THEN** the Earth close-up opens, and its back control "Lokale Gruppe" returns to "Die Lokale Gruppe"

#### Scenario: Not at the first stage
- **WHEN** the view rests at "Die Erde"
- **THEN** no Earth marker and no "Erde ansehen" control is offered

### Requirement: Stretched emptiness
The zoom from "Das Sonnensystem" to "Benachbarte Sternensysteme" SHALL feel deliberately long. When it is played as a flight (after release, a jump or the way home), it SHALL take at least 6 seconds. During that stretch, nothing SHALL appear except the Earth marker, the distance and the scale bar.

#### Scenario: Nothing for a while
- **WHEN** the view snaps from "Das Sonnensystem" outwards to "Benachbarte Sternensysteme"
- **THEN** the flight takes at least 6 seconds, in which only the Earth marker, the distance and the scale bar are visible

### Requirement: Stage pictures and details
Each stage SHALL show the following:
- **Die Erde:** the whole Earth with its day and night sides as they are right now, and city lights on the night side. While the view rests there, the Earth SHALL turn slowly eastwards as a time-lapse (one turn in two minutes) under the fixed Sun, so the continents move through day and night; the fact sheet SHALL say that this is a time-lapse. It SHALL stand still under reduced motion and while a close-up is open.
- **Erde und Mond:** Earth and Moon as spheres with their real surfaces, at their true distance. The spheres SHALL be drawn about six times larger than to scale, with their true size ratio, and lit by the Sun from the same side as the Earth's day side. A "Planeten in die Lücke" control lets the seven other planets glide one after another into the gap; while they are there, Earth and Moon SHALL shrink to their true size so the comparison is right. The fact sheet SHALL say that the spheres are enlarged.
- **Das Sonnensystem:** the Sun as a glowing sphere with its surface, the orbits of all eight planets, and the planets on them as spheres with their real surfaces, each lit from the side facing the Sun, Saturn with its rings, each labelled with its name. Sun and planets SHALL be drawn much larger than to the scale of the orbits, and the fact sheet SHALL say so. Voyager 1 is the smallest object at the edge.
- **Benachbarte Sternensysteme:** after the emptiness, the Sun as a point and its neighbours up to Sirius at their true distances from the Sun (directions simplified): Alpha Centauri A and B, Proxima Centauri, Barnards Pfeilstern, Luhman 16, WISE 0855-0714, Wolf 359, Lalande 21185 and Sirius, with a ring marking 5 light-years.
- **On the way to the Milky Way:** thousands of real stars from the star catalogue drift apart in depth. No constellation lines are drawn.
- **Die ganze Milchstrasse:** the galaxy seen from above (a reconstruction), with the Scutum-Centaurus, Sagittarius, Orion and Perseus arms and Sagittarius A* marked, and the extra line that the disc is, in proportion, as flat as a CD.
- **Die Lokale Gruppe:** a schematic drawing that fills most of the screen width: the Milky Way, Andromeda, the Triangulum galaxy, the two Magellanic Clouds and many dwarf galaxies inside a dashed boundary, marked in its fact sheet as a schematic drawing and not a picture.
- **Das ganze Universum:** a web of filaments, knots and voids of galaxy clusters (a simulation), with these giant structures and remarkable places marked: the Laniakea supercluster, the Bullet Cluster ("Geschosshaufen"), the Boötes Void, the Hercules–Corona Borealis Great Wall, Webb's First Deep Field, the galaxy JADES-GS-z14-0, the quasar TON 618 and the cosmic microwave background. Their places in the picture are schematic.

#### Scenario: Planets into the gap
- **WHEN** the user activates "Planeten in die Lücke" at "Erde und Mond"
- **THEN** the seven other planets glide one after another into the gap between Earth and Moon and almost fill it
- **AND** Earth and Moon shrink to their true size

#### Scenario: Day and night now
- **WHEN** the module opens at 12:00 UTC
- **THEN** the Earth's day side faces the Sun as it does at 12:00 UTC

#### Scenario: The Earth turns
- **WHEN** the view rests at "Die Erde" for 10 seconds and the system does not request reduced motion
- **THEN** the continents have moved eastwards, while the boundary between day and night stays where it is

#### Scenario: Planets lit by the Sun
- **WHEN** the view rests at "Das Sonnensystem"
- **THEN** every planet is a sphere whose bright side faces the Sun

### Requirement: Planet close-ups
At "Das Sonnensystem" in free exploration, every planet SHALL be selectable through its sphere and its name. Selecting a planet SHALL zoom into the same picture until the planet fills the view. It SHALL then show the planet's name, its distance to the Sun and light time, its poetic line and its Aha comparison from the concept, and a fact sheet with diameter, length of day, length of year, temperature and light time. The planet SHALL be rotatable by dragging, or with Arrow-Left and Arrow-Right while it has focus. At Jupiter (Io, Europa, Ganymed, Kallisto) and Saturn (Titan, Enceladus), the large moons SHALL be selectable and each show one sentence. While a close-up is open, zoom gestures and travel keys SHALL NOT move the journey, and the rest of the view SHALL NOT be operable. Only the back control (or Escape, its keyboard equivalent) SHALL return to the stage. In free exploration the Moon at "Erde und Mond" and the Sun at "Das Sonnensystem" SHALL be selectable in the same way, through their spheres and names, and open the same close-up with their own distance to the Earth, light time, line, Aha and fact sheet, but without the age. The Sun SHALL glow by itself instead of being lit from the side. The Moon close-up SHALL return to "Erde und Mond" with a "Zurück zu Erde und Mond" control (or Escape). Voyager 1 at "Das Sonnensystem" SHALL be selectable as well and open the same close-up with a picture of the probe instead of the rotatable sphere, its distance to the Earth (about 25,9 Mrd. km), light time (about one day), line, Aha and fact sheet, without the age. The names shown next to the planets, the Sun, the Moon, the Earth and Voyager 1 SHALL be part of their selectable area, and no overlay (header, distance, scale bar) SHALL cover a name, at any supported screen size. Voyager 1 SHALL sit outside Neptune's orbit, but never under the header.

#### Scenario: Mars close-up
- **WHEN** the user selects Mars at "Das Sonnensystem"
- **THEN** Mars fills the view with "228 Mio. km", "13 min", „Eine rote Wüste. Und der Sonnenuntergang ist hier blau.“ and the Olympus Mons comparison
- **AND** "Zurück zum Sonnensystem" returns to "Das Sonnensystem"

#### Scenario: Select a planet by its name
- **WHEN** the user taps the name "Jupiter" at "Das Sonnensystem" on a 390 px wide phone
- **THEN** the Jupiter close-up opens

#### Scenario: Moon close-up
- **WHEN** the user selects the Moon or its name at "Erde und Mond"
- **THEN** the Moon fills the view with "384.400 km" to the Earth and "1,3 s", and no age is offered
- **AND** "Zurück zu Erde und Mond" returns to "Erde und Mond"

#### Scenario: Sun close-up
- **WHEN** the user selects the Sun at "Das Sonnensystem"
- **THEN** the glowing Sun fills the view with "150 Mio. km" to the Earth and "8 min 20 s", and no age is offered
- **AND** "Zurück zum Sonnensystem" returns to "Das Sonnensystem"

#### Scenario: Voyager 1 close-up
- **WHEN** the user selects Voyager 1 at "Das Sonnensystem"
- **THEN** a picture of the probe is shown with "ca. 25,9 Mrd. km" to the Earth and „Das am weitesten entfernte Ding, das Menschen je gebaut haben.“, and no age is offered
- **AND** "Zurück zum Sonnensystem" returns to "Das Sonnensystem"

#### Scenario: Zooming inside the close-up stays there
- **WHEN** the Mars close-up is open and the user scrolls the wheel or presses Page-Down
- **THEN** the close-up stays open and the journey does not move

#### Scenario: Rotate with the keyboard
- **WHEN** the Mars close-up has focus and the user presses Arrow-Right
- **THEN** Mars turns visibly

#### Scenario: Select a moon
- **WHEN** the user selects Europa in the Jupiter close-up
- **THEN** one sentence about Europa's ocean under the ice is shown

### Requirement: Close-ups beyond the solar system
In free exploration, the marked objects of the outer stages SHALL be selectable through their mark and their name and open the same close-up, with name, distance, light time where meaningful, poetic line, Aha and fact sheet, and a back control to their stage ("Zurück zu den benachbarten Sternensystemen", "Zurück zur Milchstrasse", "Zurück zur Stufe Lokale Gruppe", "Zurück zur Stufe Universum"):
- **Benachbarte Sternensysteme:** the Sun and the nine neighbouring stars, shown as glowing spheres. The Sun returns to this stage when it was opened here.
- **Die ganze Milchstrasse:** Sagittarius A* (with the Event Horizon Telescope image) and the four arms (with the reconstruction or its crop around the Sun for the Orion arm).
- **Die Lokale Gruppe:** the Milky Way, Andromeda, the Triangulum galaxy and the Large and Small Magellanic Clouds, each with a picture.
- **Das ganze Universum:** the eight places listed under "Stage pictures and details", each with a picture: Laniakea (an illustration after Tully et al.), the Bullet Cluster, Webb's First Deep Field, JADES-GS-z14-0 and TON 618 (photos), the cosmic microwave background (the Planck sky map). The Boötes Void and the Great Wall have never been photographed; they SHALL show the cosmic-web simulation, and their facts SHALL say that there is no photo.
Marks and their names SHALL keep a target of at least 24 × 24 CSS px and SHALL NOT be covered by the scale bar or the distance readout while the view rests at the stage.

#### Scenario: A galaxy of the Local Group
- **WHEN** the user selects "Andromeda" at "Die Lokale Gruppe"
- **THEN** a photo of the Andromeda galaxy is shown with "ca. 2,5 Millionen Lichtjahre"
- **AND** "Zurück zur Stufe Lokale Gruppe" returns to "Die Lokale Gruppe"

#### Scenario: A place without a photo
- **WHEN** the user selects "Boötes-Leerraum" at "Das ganze Universum"
- **THEN** the cosmic-web simulation is shown, and its facts say that there is no photo of the void

#### Scenario: The heaviest black holes
- **WHEN** the user selects "TON 618" at "Das ganze Universum"
- **THEN** the survey photo with the quasar as a blue point is shown, with its distance and the mass of its black hole in the Aha

### Requirement: Age on other planets
In a planet close-up the user SHALL be able to enter a birth year (optional, a four-digit year from 1900 up to the current year). The age on Earth SHALL be counted from 1 July of the birth year to today. Each planet close-up SHALL then show how old the user would be in that planet's years: one decimal place below 10, whole numbers from 10 upwards. The orbital periods are Mercury 0.241, Venus 0.615, Earth 1, Mars 1.881, Jupiter 11.86, Saturn 29.46, Uranus 84.01 and Neptune 164.8 Earth years. The birth year SHALL be stored only on the device and SHALL be removable. An invalid year SHALL show an inline error and no age.

#### Scenario: Age on Mars and Jupiter
- **WHEN** today is 20 Nov 2026 and the user enters the birth year 1996
- **THEN** the Mars close-up shows an age of 16 and the Jupiter close-up an age of 2,6

#### Scenario: Invalid year
- **WHEN** the user enters "3000"
- **THEN** an error explains the allowed range and no planet age is shown

#### Scenario: Remembered year
- **WHEN** the user entered 1996 earlier and opens a planet close-up again on the same device
- **THEN** the age is shown without entering the year again

### Requirement: Way home and end
At "Das ganze Universum", "Und jetzt zurück. Nach Hause." SHALL appear as a control together with the stage texts. Activating it SHALL play a return flight of about 10 seconds through all stages, lingering in the emptiness. Zooming back by hand SHALL also be possible. When the view arrives at "Die Erde" after having been at "Das ganze Universum", it SHALL show "All das. Und mittendrin: wir." In free exploration it SHALL then offer three paths: "Nochmal reisen" (from the Earth again), "Zu einer Stufe springen" (focus moves to the scale bar) and "Bild teilen" (share cards).

#### Scenario: Return flight
- **WHEN** the view rests at "Das ganze Universum" and the user activates "Und jetzt zurück. Nach Hause."
- **THEN** the view flies back through all stages in about 10 seconds and settles at "Die Erde" with "All das. Und mittendrin: wir."
- **AND** "Nochmal reisen", "Zu einer Stufe springen" and "Bild teilen" are offered

#### Scenario: Nothing moves on its own
- **WHEN** the view rests at "Das ganze Universum" and the user does nothing
- **THEN** no return flight starts

### Requirement: Completion marks the module explored
Reaching "Das ganze Universum" and arriving back at "Die Erde" in the same visit SHALL mark Modul A as explored, so the home screen shows its star in the explored style.

#### Scenario: Brighter star
- **WHEN** the user has been at "Das ganze Universum", returns to "Die Erde" and then goes back to the home screen
- **THEN** the "Die Reise nach draussen" star is shown in the explored style

### Requirement: Branches and travel links
In free exploration the module SHALL offer these optional branches, each leading to the named module's destination:
- in the fact sheet of "Das Sonnensystem", "Mit Lichtgeschwindigkeit weiterreisen" leads to the travel planner "Reisen mit Lichtgeschwindigkeit" (B), with Proxima Centauri as destination;
- in every close-up (planets, Moon, Sun, Earth, Voyager 1, neighbouring stars, parts of the Milky Way, galaxies of the Local Group and places of the universe), "Wie lange bräuchte ich dorthin?" leads to "Reisen mit Lichtgeschwindigkeit" (B) with that object as destination, remembering the stage and close-up to return to;
- at "Die Lokale Gruppe", "Licht als Zeitmaschine" leads to "Licht als Zeitmaschine" (C);
- in the fact sheet of "Die ganze Milchstrasse", "Wie lange dauert eine Runde um die Galaxie?" leads to "Das galaktische Jahr" (E) and "Was verbirgt der Staub?" to "Das Unsichtbare" (F).
"Benachbarte Sternensysteme" SHALL NOT offer a branch to "Die Sandkorn-Welt", which no longer exists.

#### Scenario: No branch to the sand-grain world
- **WHEN** the view rests at "Benachbarte Sternensysteme"
- **THEN** no "Wie leer ist das wirklich?" branch is shown

#### Scenario: How long to get there
- **WHEN** the user opens the Andromeda close-up at "Die Lokale Gruppe" and activates "Wie lange bräuchte ich dorthin?"
- **THEN** the travel planner opens with Andromeda as destination

#### Scenario: Light-time branch
- **WHEN** the user activates "Mit Lichtgeschwindigkeit weiterreisen" in the fact sheet of "Das Sonnensystem"
- **THEN** the travel planner opens with Proxima Centauri as destination

### Requirement: Two variants
The module SHALL support two variants with the same seven stages:
- **Freies Erkunden** (used at the module address): close-ups, moons, age, branches and the end paths are offered, and the fact control is visible at every stage.
- **Hauptreise** (for embedding in the later guided journey): no close-ups, moons or branches. The fact control is collapsed to a small icon but still reachable. At the end it offers "Weiter", which signals completion to the embedding journey together with the line „Jetzt fliegst du selbst. So schnell, wie es überhaupt geht.“

#### Scenario: Main-journey variant
- **WHEN** the module runs in the main-journey variant and the view rests at "Das Sonnensystem"
- **THEN** the planets cannot be selected and no branches are shown

### Requirement: No sound
The module SHALL NOT play any sound and SHALL NOT read any text aloud. It SHALL offer no sound or narration controls.

#### Scenario: Silent journey
- **WHEN** the user travels from "Die Erde" to "Das ganze Universum" and back
- **THEN** no audio is played and no speech is produced

### Requirement: Haptics
On devices that support vibration, the module SHALL give one short pulse when the view snaps into a stage, and no other vibration. Vibration SHALL be switchable off in a small settings panel ("Weitere Einstellungen"), and the choice SHALL persist on the device. The panel SHALL hold only this setting.

#### Scenario: Pulse on snap
- **WHEN** the view snaps into a stage on a device with vibration on
- **THEN** exactly one short pulse is triggered

### Requirement: Real imagery and honesty
The module SHALL use real imagery or data where it exists: Solar System Scope textures based on NASA imagery for the Earth (day and night), Moon, Sun and planets, star positions from a Gaia/Hipparcos-based catalogue, the Event Horizon Telescope image of Sagittarius A*, photos of Andromeda, the Triangulum galaxy and the Magellanic Clouds, Chandra/Hubble, Webb and Sloan survey images for the places of the universe, and the Planck map of the cosmic microwave background. Reconstructions, illustrations and simulations (Voyager 1, the Milky Way and the Orion arm from outside, the Local Group, Laniakea, the cosmic web) SHALL be marked as such in their fact sheet. Pictures drawn larger than to scale (Erde und Mond, Sonnensystem) and the time-lapse of the turning Earth SHALL be explained in the facts. Every picture SHALL name its source in its fact sheet, and a "Bildnachweise" list SHALL be reachable from the module.

#### Scenario: Simulation labelled
- **WHEN** the user opens the facts at "Das ganze Universum"
- **THEN** they state that the picture is a simulation based on measurements and name its source

#### Scenario: Credits reachable
- **WHEN** the user opens "Bildnachweise"
- **THEN** every picture used in the module is listed with its source and licence

### Requirement: Reduced motion
When the system requests reduced motion, the module SHALL replace continuous zoom animations and flights with short cross-fades between stages. The Earth SHALL NOT turn, the Earth marker SHALL NOT pulse, and the return flight SHALL be a sequence of short fades. Stepless zooming by direct manipulation (drag, wheel, pinch, scale bar) SHALL remain possible. The stretched emptiness SHALL keep its duration, but nothing SHALL move during it.

#### Scenario: Cross-fade on jump
- **WHEN** reduced motion is requested and the user activates "Milchstrasse" on the scale bar at "Die Erde"
- **THEN** the view changes to "Die ganze Milchstrasse" by a short cross-fade without a continuous zoom

### Requirement: Journey accessibility
The module SHALL meet WCAG 2.1 AA and report zero automated accessibility (axe) violations at every stage, with and without an open fact sheet, and in a close-up. Every function SHALL be operable with the keyboard and with single taps; no gesture SHALL be the only way. The picture SHALL have a text alternative describing the current stage. Each stage SHALL be announced to assistive technology with its title and poetic line when the view settles there, and the Aha comparison when it appears. Moving between stages SHALL NOT be announced continuously. Text over imagery SHALL keep a contrast ratio of at least 4.5:1. Controls SHALL have visible focus indicators and touch targets of at least 44 × 44 CSS px; marks inside the picture SHALL have targets of at least 24 × 24 CSS px.

#### Scenario: Automated check
- **WHEN** an axe scan runs at "Die Erde", "Das Sonnensystem", the Mars close-up, "Die ganze Milchstrasse" with an open fact sheet and "Das ganze Universum"
- **THEN** it reports zero violations

#### Scenario: Stage announced
- **WHEN** a screen-reader user moves to "Die ganze Milchstrasse" with the scale bar
- **THEN** "Die ganze Milchstrasse" and its poetic line are announced once

### Requirement: Journey responsive layout
The module SHALL fill the viewport and work from 320 px wide phones to desktop screens without horizontal scrolling. The stage texts, the distance, the scale bar and the controls SHALL NOT overlap each other and SHALL NOT be cut off. Labels inside the picture SHALL NOT be covered by the scale bar or the distance readout while the view rests at a stage.

#### Scenario: Small phone
- **WHEN** the module is shown at 320 × 640 px at "Die ganze Milchstrasse" with the Aha visible
- **THEN** there is no horizontal scrolling, and the title, poetic line, Aha, distance and scale bar are fully visible and do not overlap

#### Scenario: Desktop
- **WHEN** the module is shown at 1440 × 900 px
- **THEN** the picture fills the window, the scale bar sits at the right edge, and the texts sit at the lower left

### Requirement: Journey privacy and loading
The module SHALL work without an account and SHALL NOT load resources from third-party servers. All imagery and data SHALL come from the application's own origin. Imagery SHALL load progressively: surface textures of the Moon, the Sun and the planets SHALL load only when the view approaches their stage, so the whole module is not loaded up front.

#### Scenario: No third-party requests
- **WHEN** the user zooms from "Die Erde" to "Das ganze Universum" and back
- **THEN** every requested resource comes from the application's own origin
