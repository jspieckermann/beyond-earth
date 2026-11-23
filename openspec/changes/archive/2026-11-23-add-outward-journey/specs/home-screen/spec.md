## MODIFIED Requirements

### Requirement: Placeholder destinations
Until the linked features exist, every destination reachable from the home screen (each module, the journey, Heute Nacht, Meine Sterne, settings) SHALL show a calm placeholder page naming the destination and offering a way back to the home screen. A destination whose feature exists SHALL open that feature instead. Modul A "Die Reise nach draussen" SHALL open its experience.

#### Scenario: Visit a placeholder and return
- **WHEN** the user activates "Eintauchen" for "Das Unsichtbare"
- **THEN** a page titled "Das Unsichtbare" with a note that it is coming soon is shown
- **AND** activating its back link returns to the home screen

#### Scenario: Modul A is no longer a placeholder
- **WHEN** the user activates "Eintauchen" for "Die Reise nach draussen"
- **THEN** the Modul A experience opens instead of a placeholder page

### Requirement: Module preview
Selecting a module star SHALL mark it as selected (a visible ring) and open a preview next to it showing its exploration status ("Schon vertieft" or "Noch nicht vertieft"), the full module title, one poetic line, and an "Eintauchen" button. The title and the poetic line SHALL always be shown in full: the preview SHALL be large enough for a two-line title and the whole line, SHALL grow with its text (for example with larger system text) instead of cutting it off, and long words SHALL break instead of running out of the preview. At most one module SHALL be selected at a time. The preview SHALL stay within the screen and SHALL NOT cover the selected star. On the phone layout the preview opens next to the selected star. On tablet and desktop layouts the preview SHALL always open at the same place in the empty sky below the band, SHALL be connected to the selected star by a thin decorative line, and SHALL NOT cover any module star. Activating "Eintauchen" SHALL open that module's destination.

#### Scenario: Select a star
- **WHEN** no star is selected and the user activates the "Die Sandkorn-Welt" star
- **THEN** the star is shown as selected
- **AND** a preview shows "Noch nicht vertieft" or "Schon vertieft", "Die Sandkorn-Welt", its poetic line and an "Eintauchen" button

#### Scenario: Switch selection
- **WHEN** "Die Sandkorn-Welt" is selected and the user activates the "Sterne zählen" star
- **THEN** only "Sterne zählen" is selected and the preview shows "Sterne zählen"

#### Scenario: Close the preview
- **WHEN** a preview is open and the user presses Escape, activates the selected star again, or activates an empty area of the sky
- **THEN** the preview closes and no star is selected
- **AND** if the preview was closed with Escape, keyboard focus returns to the star that was selected

#### Scenario: Enter a module
- **WHEN** the preview for "Die Sandkorn-Welt" is open and the user activates "Eintauchen"
- **THEN** the "Die Sandkorn-Welt" module destination is shown

#### Scenario: Preview near the screen edge
- **WHEN** the user selects the star nearest the top-right edge ("Das galaktische Jahr") on a 320 px wide screen
- **THEN** the preview is fully visible and does not overlap the selected star

#### Scenario: Nothing cut off
- **WHEN** the user selects any of the seven module stars on a 320 × 640 or 390 × 844 phone, a 768 × 1024 or 834 × 1194 tablet, or a 1024 × 768 or 1440 × 900 screen
- **THEN** the status, the full title, the whole poetic line and "Eintauchen" are visible inside the preview

#### Scenario: Preview on large screens
- **WHEN** the user selects any module star on a 1440 × 900 desktop or an 834 × 1194 tablet
- **THEN** the preview appears at the same place below the band, connected to the star by a line
- **AND** it covers none of the seven module stars, and every other star can still be selected directly
