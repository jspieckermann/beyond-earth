## MODIFIED Requirements

### Requirement: Module entry
Activating "Eintauchen" for "Die Reise nach draussen" on the home screen SHALL open the Modul A experience at its module address in its free-exploration variant. The page SHALL be in German and have the document title "Die Reise nach draussen · Die Milchstrasse erleben". It SHALL start at the stage "Die Erde" and move keyboard focus to its main heading, unless the address names a stage to return to (coming back from another module): then it SHALL start resting at that stage. If the address also names a close-up of that stage (coming back from "Reisen mit Lichtgeschwindigkeit"), that close-up SHALL be open with focus on its back control; without a close-up, or with a close-up that does not exist, no close-up SHALL be open and focus SHALL be on the main heading. An address naming an unknown stage SHALL start at "Die Erde". It SHALL NOT ask for the user's location. A visible "Zurück zum Himmel" control SHALL return to the home screen at any time.

#### Scenario: Enter from the home screen
- **WHEN** the user selects the Modul A star and activates "Eintauchen"
- **THEN** the Modul A experience opens at "Die Erde" with the title "Die Reise nach draussen · Die Milchstrasse erleben"

#### Scenario: Return from Modul B
- **WHEN** the user comes back from "Reisen mit Lichtgeschwindigkeit" with "Zurück zu Andromeda"
- **THEN** Modul A rests at "Die Lokale Gruppe" with the Andromeda close-up open

#### Scenario: Return to a stage without a close-up
- **WHEN** the address names only the stage "Die ganze Milchstrasse"
- **THEN** Modul A rests at "Die ganze Milchstrasse" without an open close-up

#### Scenario: Unknown return address
- **WHEN** the address names a stage that does not exist
- **THEN** Modul A opens at "Die Erde"

#### Scenario: No location request
- **WHEN** the module opens and is used through all stages
- **THEN** the browser is never asked for the device location

#### Scenario: Leave at any time
- **WHEN** the user activates "Zurück zum Himmel" at any stage
- **THEN** the home screen is shown

### Requirement: Branches and travel links
In free exploration the module SHALL offer these optional branches, each leading to the named module's destination:
- in the fact sheet of "Das Sonnensystem", "Mit Lichtgeschwindigkeit weiterreisen" leads to the travel planner "Reisen mit Lichtgeschwindigkeit" (B), with Proxima Centauri as destination;
- in every close-up (planets, Moon, Sun, Earth, Voyager 1, neighbouring stars, parts of the Milky Way, galaxies of the Local Group and places of the universe), "Wie lange bräuchte ich dorthin?" leads to "Reisen mit Lichtgeschwindigkeit" (B) with that object as destination, remembering the stage and close-up to return to;
- at "Die Lokale Gruppe", "Licht als Zeitmaschine" leads to "Licht als Zeitmaschine" (D);
- in the fact sheet of "Die ganze Milchstrasse", "Wie lange dauert eine Runde um die Galaxie?" leads to "Das galaktische Jahr" (C) and "Was verbirgt der Staub?" to "Das Unsichtbare" (F).
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
