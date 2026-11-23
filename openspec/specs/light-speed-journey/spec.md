# light-speed-journey Specification

## Purpose

Modul B "Reisen mit Lichtgeschwindigkeit": a travel planner in which users choose a place from Modul A and a speed as a percentage of the speed of light, and see how long the journey takes on Earth and on board and how many generations it would need, so that distances become lifetimes.

## Requirements

### Requirement: Module entry
Activating "Eintauchen" for "Reisen mit Lichtgeschwindigkeit" on the home screen SHALL open the Modul B experience at its module address in its free-exploration variant. The page SHALL be in German and have the document title "Reisen mit Lichtgeschwindigkeit · Die Milchstrasse erleben", and keyboard focus SHALL move to its main heading. Without a destination in the address it SHALL start with Proxima Centauri at 10 % of the speed of light. It SHALL NOT ask for the user's location. A visible "Zurück zum Himmel" control SHALL return to the home screen at any time.

#### Scenario: Enter from the home screen
- **WHEN** the user selects the "Reisen mit Lichtgeschwindigkeit" star and activates "Eintauchen"
- **THEN** the travel planner opens with Proxima Centauri and 10 % and the title "Reisen mit Lichtgeschwindigkeit · Die Milchstrasse erleben"

#### Scenario: No location request
- **WHEN** the module opens and is used with every destination
- **THEN** the browser is never asked for the device location

### Requirement: Three steps on one screen
The planner SHALL show three steps on one screen, all visible at the same time: "Ziel" (destination), "Tempo" (speed) and "Ankunft" (arrival). Changing the destination or the speed SHALL recalculate the arrival at once. Nothing SHALL start or change by itself.

#### Scenario: Immediate recalculation
- **WHEN** the user changes the speed from 10 % to 20 % with Proxima Centauri as destination
- **THEN** the arrival shows 21,2 years on Earth without any further action

### Requirement: Destinations from Modul A
The destination SHALL be chosen from every place shown in Modul A: the Earth, the Moon, the Sun, the eight planets, Voyager 1, the Sun's nine neighbouring stars (Proxima Centauri, Alpha Centauri A and B, Barnards Pfeilstern, Luhman 16, WISE 0855-0714, Wolf 359, Lalande 21185, Sirius), the Orion, Sagittarius, Perseus and Scutum-Centaurus arms, Sagittarius A*, the Milky Way, the Large and Small Magellanic Clouds, Andromeda, the Triangulum galaxy, and the eight places of the universe (Laniakea, Boötes-Leerraum, Geschosshaufen, Webbs erstes Deep Field, Herkules-Corona-Borealis-Mauer, TON 618, JADES-GS-z14-0, Kosmischer Mikrowellenhintergrund). The list SHALL be grouped by the stages of Modul A, show each place's distance, and be searchable by name. Distances SHALL be those of Modul A; for the planets the planner SHALL use the closest approach to the Earth (Merkur 77, Venus 38, Mars 55, Jupiter 588 Mio. km; Saturn 1,2, Uranus 2,6, Neptun 4,3 Mrd. km) and say so ("bei günstigster Stellung").

#### Scenario: Grouped and searchable
- **WHEN** the user opens the destination list and types "andro"
- **THEN** only "Andromeda" is offered, under "Die Lokale Gruppe", with "ca. 2,5 Mio. Lichtjahre"

#### Scenario: Planet distance explained
- **WHEN** the user chooses Mars
- **THEN** the destination shows 55 Mio. km and the note that this is the closest approach

### Requirement: Speed selection
The speed SHALL be set as a percentage of the speed of light between 0,001 % and 99,9999 %, with a slider on which every power of ten below 10 % takes the same space and the range from 10 % to 99,9999 % is spread finely, and with a number field for an exact value. Values outside the range SHALL be clamped to it. The planner SHALL offer these presets: Voyager 1 (0,0057 %, its real speed) and the target speeds of interstellar projects, Orion (3,3 %), Longshot (4,5 %), Daedalus (12 %) and Starshot (20 %); where a project names a range, its maximum SHALL be used. Below the slider it SHALL show the speed in km/s and a short hint that only light itself travels at the speed of light.

#### Scenario: Preset
- **WHEN** the user activates "Voyager 1"
- **THEN** the speed reads 0,0057 % and about 17 km/s

#### Scenario: Out of range
- **WHEN** the user types "100" into the number field
- **THEN** the speed is set to 99,9999 % and the hint about the speed of light is shown

### Requirement: Travel calculation
The planner SHALL calculate with a constant speed and without acceleration or braking:
- duration on Earth = distance in light-years ÷ speed as a fraction of the speed of light;
- duration on board = duration on Earth × √(1 − v²/c²);
- generations = 1 if the duration is at most 50 years, otherwise the duration ÷ 25, rounded up; on board from the duration on board, on Earth from the duration on Earth;
- arrival year = the current year + the duration on Earth, shown only below 100.000 years.
Places the user is already in (Earth, Orion arm, Milky Way, Laniakea) SHALL have no journey. For Boötes-Leerraum, Geschosshaufen and Webbs erstes Deep Field the durations SHALL be shown as lower bounds ("mindestens …") with a note that space keeps expanding during the journey. Herkules-Corona-Borealis-Mauer, TON 618, JADES-GS-z14-0 and the cosmic microwave background SHALL be unreachable at any speed.

#### Scenario: Values of the concept
- **WHEN** the planner calculates these journeys
- **THEN** it shows:

| Destination | Speed | On Earth | On board | Generations on board | Generations on Earth |
| --- | --- | --- | --- | --- | --- |
| Proxima Centauri | 0,0057 % | 74.772 Jahre | 74.772 Jahre | 2.991 | 2.991 |
| Proxima Centauri | 1 % | 424 Jahre | 424 Jahre | 17 | 17 |
| Proxima Centauri | 20 % | 21,2 Jahre | 20,8 Jahre | 1 | 1 |
| Sirius | 10 % | 86 Jahre | 85,6 Jahre | 4 | 4 |
| Sagittarius A* | 99 % | 26.263 Jahre | 3.705 Jahre | 149 | 1.051 |
| Sagittarius A* | 99,9999 % | 26.000 Jahre | 36,8 Jahre | 1 | 1.041 |

#### Scenario: Short journey
- **WHEN** the destination is the Moon and the speed is 0,0057 %
- **THEN** the duration reads about 6,3 Stunden, both on Earth and on board

#### Scenario: Lower bound
- **WHEN** the destination is the Geschosshaufen
- **THEN** the durations start with "mindestens" and a note explains that space keeps expanding

#### Scenario: Unreachable
- **WHEN** the destination is TON 618 at any speed
- **THEN** no duration and no generations are shown, and the result says that it can never be reached

### Requirement: Arrival presentation
The arrival SHALL show the duration on board and the duration on Earth (in this order, like the generations below them), the generations on board and on Earth, and the arrival year. Nothing in the planner SHALL move by itself; there is no animated picture of the journey. Durations SHALL use the most familiar unit (Sekunden, Minuten, Stunden, Tage, Jahre, Mio. Jahre, Mrd. Jahre) in German number format. Below them, a row of figures SHALL show the generations on board, one figure per generation, or per 10, 100, 1.000 … generations when there are more than 20, with a legend saying which. A history anchor SHALL put the number of generations on board into perspective, choosing the nearest of: 3 (der Zweite Weltkrieg), 17 (Galileis erster Blick durchs Fernrohr), 21 (die Fahrt des Kolumbus), 81 (die Zeit der Römer), 183 (der Bau der grossen Pyramide von Gizeh), 1.440 (die Höhlenmalereien von Chauvet), 12.000 (der Anfang unserer Art); above 30.000 it SHALL say that this is more than the history of our species. A closing sentence SHALL fit the outcome:

| Outcome | Sentence |
| --- | --- |
| Already there | „Du musst nicht reisen. Du bist schon da, und das schon dein ganzes Leben.“ |
| Under one day on Earth | „Ein Wimpernschlag. Kein Gepäck nötig.“ |
| At most 50 years on board and one generation on Earth | „Wer abfliegt, kommt an.“ |
| At most 50 years on board and more than one generation on Earth | „Du kommst an. Aber zu Hause kennt dich niemand mehr.“ |
| More than 50 years on board | „Wer abfliegt, kommt nie an. Erst die Enkel, die Urenkel, die Ururenkel.“ |
| Unreachable | „Nie. Selbst das Licht kommt dort nicht mehr an. Das Universum wächst schneller, als du dich näherst.“ |

#### Scenario: Generations and history
- **WHEN** the destination is Proxima Centauri at 1 %
- **THEN** 17 figures are shown with the anchor about Galilei's first look through a telescope

#### Scenario: Many generations
- **WHEN** the destination is Proxima Centauri at 0,0057 %
- **THEN** at most 20 figures are shown, the legend says how many generations one figure stands for, and the sentence is „Wer abfliegt, kommt nie an. Erst die Enkel, die Urenkel, die Ururenkel.“

#### Scenario: Time dilation
- **WHEN** the destination is Sagittarius A* at 99,9999 %
- **THEN** one generation on board, 1.041 generations on Earth and „Du kommst an. Aber zu Hause kennt dich niemand mehr.“ are shown

#### Scenario: Already there
- **WHEN** the destination is the Orion arm
- **THEN** only „Du musst nicht reisen. Du bist schon da, und das schon dein ganzes Leben.“ is shown

### Requirement: Fact sheet
A "Wie genau weiss man das?" control SHALL open a fact sheet that explains the calculation (constant speed, no acceleration, braking or energy; time dilation; 25 years per generation; closest approach for planets; expansion of space for far places) and names the sources of the speed of Voyager 1 and of the projects' target speeds, saying that the projects were never built. It SHALL close with its close control or Escape and return focus to its opener.

#### Scenario: Calculation disclosed
- **WHEN** the user opens the fact sheet
- **THEN** it states that the journey runs at constant speed without acceleration and braking and that a generation counts 25 years

### Requirement: Way back to Modul A
When the planner was opened from a close-up in Modul A, the destination SHALL be that object, and a "Zurück zu …" control naming the object SHALL return to Modul A at the stage the user came from, with that close-up open again.

#### Scenario: Round trip
- **WHEN** the user opens Sirius in Modul A, activates "Wie lange bräuchte ich dorthin?" and then "Zurück zu Sirius"
- **THEN** Modul A shows "Benachbarte Sternensysteme" with the Sirius close-up open

### Requirement: Birth-year line
When a birth year is stored on the device (entered in Modul A), the arrival SHALL add a line about a journey that started at the user's birth: how far along the journey the user would be today, or that they would already have arrived. Without a stored birth year the line SHALL NOT be shown, and the planner SHALL NOT ask for it.

#### Scenario: Started at birth
- **WHEN** the stored birth year is 1996, today is in 2026, and the destination is Proxima Centauri at 20 %
- **THEN** a line says that a journey started at birth would arrive in about 21 years from then, so the user would already have arrived

### Requirement: Share
A "Bild teilen" control SHALL open the travel card with the current destination, speed, duration on Earth and generations on board, and a picture of the destination with its credit.

#### Scenario: Travel card
- **WHEN** the destination is Proxima Centauri at 1 % and the user activates "Bild teilen"
- **THEN** the card reads "Nach Proxima Centauri mit 1 % der Lichtgeschwindigkeit: 424 Jahre." and, in a paragraph below, "An Bord vergehen dabei 17 Generationen."

### Requirement: Two variants
The module SHALL support two variants:
- **Freies Erkunden** (used at the module address): all destinations, the free speed selection, the fact sheet, the birth-year line and sharing.
- **Hauptreise** (for embedding in the later guided journey): the destination is fixed to Proxima Centauri, and the user steps with "Weiter" through three speeds, 0,0057 %, 20 % and 99 %, each with its arrival. After the third, "Weiter" signals completion to the embedding journey. There is no destination list, no free slider, no sharing and no birth-year line.

#### Scenario: Main-journey variant
- **WHEN** the module runs in the main-journey variant
- **THEN** it shows Proxima Centauri at 0,0057 %, then at 20 %, then at 99 %, each after "Weiter", and then signals completion

### Requirement: Completion marks the module explored
Showing a travel result (not "already there" and not "unreachable") SHALL mark the module as explored, so the home screen shows its star in the explored style.

#### Scenario: Brighter star
- **WHEN** the user has seen a travel result and goes back to the home screen
- **THEN** the "Reisen mit Lichtgeschwindigkeit" star is shown in the explored style

### Requirement: Haptics and silence
The module SHALL NOT play any sound. On devices that support vibration and with vibration switched on (the setting shared with Modul A), it SHALL give one short pulse when a new result has settled (after choosing a destination or a preset, or after releasing the slider), and no other vibration.

#### Scenario: Pulse on result
- **WHEN** the user chooses a preset on a device with vibration on
- **THEN** exactly one short pulse is triggered

### Requirement: Accessibility
The module SHALL meet WCAG 2.1 AA and report zero automated accessibility (axe) violations, with and without the open destination list and fact sheet. Every function SHALL be operable with the keyboard and with single taps. The slider SHALL be a real slider whose value text names the percentage. The arrival SHALL be announced to assistive technology once when it changes, not continuously while the slider moves. The generation figures SHALL have a text alternative with the number of generations. Controls SHALL have visible focus indicators and touch targets of at least 44 × 44 CSS px; text SHALL keep a contrast ratio of at least 4.5:1.

#### Scenario: Automated check
- **WHEN** an axe scan runs on the planner, with the destination list open and with the fact sheet open
- **THEN** it reports zero violations

#### Scenario: Keyboard only
- **WHEN** a keyboard user tabs to the slider and presses Arrow-Right
- **THEN** the speed increases and the arrival is announced once after the change

### Requirement: Responsive layout
The module SHALL work from 320 px wide phones to desktop screens without horizontal scrolling, with all three steps reachable and nothing cut off. On wide screens the steps SHALL sit beside the arrival.

#### Scenario: Small phone
- **WHEN** the module is shown at 320 × 640 px
- **THEN** there is no horizontal scrolling and destination, speed and arrival are readable

### Requirement: Privacy and loading
The module SHALL work without an account and SHALL NOT load resources from third-party servers. It SHALL use no personal data except the optional birth year already stored on the device.

#### Scenario: No third-party requests
- **WHEN** the user uses the planner with several destinations and shares a card
- **THEN** every requested resource comes from the application's own origin
