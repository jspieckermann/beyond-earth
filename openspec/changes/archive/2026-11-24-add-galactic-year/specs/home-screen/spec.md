## MODIFIED Requirements

### Requirement: Placeholder destinations
Until the linked features exist, every destination reachable from the home screen (each module, the journey, Heute Nacht, Meine Sterne, settings) SHALL show a calm placeholder page naming the destination and offering a way back to the home screen. A destination whose feature exists SHALL open that feature instead. Modul A "Die Reise nach draussen", Modul B "Reisen mit Lichtgeschwindigkeit" and Modul C "Das galaktische Jahr" SHALL open their experiences. The address of the removed module "Die Sandkorn-Welt" SHALL lead back to the home screen like any unknown module address.

#### Scenario: Visit a placeholder and return
- **WHEN** the user activates "Eintauchen" for "Das Unsichtbare"
- **THEN** a page titled "Das Unsichtbare" with a note that it is coming soon is shown
- **AND** activating its back link returns to the home screen

#### Scenario: Modul A is no longer a placeholder
- **WHEN** the user activates "Eintauchen" for "Die Reise nach draussen"
- **THEN** the Modul A experience opens instead of a placeholder page

#### Scenario: Travel planner is no longer a placeholder
- **WHEN** the user activates "Eintauchen" for "Reisen mit Lichtgeschwindigkeit"
- **THEN** the travel planner opens instead of a placeholder page

#### Scenario: Galactic year is no longer a placeholder
- **WHEN** the user activates "Eintauchen" for "Das galaktische Jahr"
- **THEN** the Modul C experience opens instead of a placeholder page

#### Scenario: Removed module
- **WHEN** the user opens the address of "Die Sandkorn-Welt"
- **THEN** the home screen is shown

### Requirement: Six module stars along the band
The home screen SHALL show the six experience modules as six selectable stars placed along the Milky Way band, from lower left to upper right: A "Die Reise nach draussen", B "Reisen mit Lichtgeschwindigkeit", C "Das galaktische Jahr", E "Sterne zählen", D "Licht als Zeitmaschine", F "Das Unsichtbare". Each star SHALL carry a short visible label and an accessible name equal to the module's full title. No module SHALL be locked. On tablet and desktop layouts the labels SHALL stay visible while their star is selected. A star and its visible label SHALL form one control: activating the label SHALL have exactly the same effect as activating the star, hovering the label SHALL indicate that it is clickable, and star and label together SHALL be a single keyboard stop whose focus indicator encloses both.

#### Scenario: All six modules present
- **WHEN** the home screen is displayed
- **THEN** six module stars are shown in the order A, B, C, E, D, F along the band, "Das galaktische Jahr" between "Reisen mit Lichtgeschwindigkeit" and "Sterne zählen"
- **AND** each star has a visible short label and an accessible name with the full module title
- **AND** no star for "Die Sandkorn-Welt" is shown

#### Scenario: Select a module by its label
- **WHEN** no module is selected and the user taps or clicks the label "Zeitmaschine"
- **THEN** "Licht als Zeitmaschine" is selected and its preview opens, exactly as when its star is activated

#### Scenario: Close by activating the label again
- **WHEN** "Sterne zählen" is selected on the tablet or desktop layout and the user activates its label again
- **THEN** the preview closes and no module is selected

#### Scenario: Every label selects its own module
- **WHEN** the user activates the centre of any module's label on the phone, tablet or desktop layout
- **THEN** that module, and no other, is selected

#### Scenario: One keyboard stop per module
- **WHEN** a keyboard user tabs through the module constellation
- **THEN** each module is reached exactly once, in the order along the band, and the focus indicator surrounds both its star and its label

### Requirement: Exploration is shown by brightness only
A module the user has explored in depth SHALL be shown as a brighter, larger star with a brighter label; a module not yet explored SHALL be shown fainter. The home screen SHALL NOT show points, percentages, badges or other scores. The explored state SHALL persist on the user's device across visits without an account. Explored states stored under earlier letters SHALL be carried over once to the same modules under the current letters (C "Das galaktische Jahr", D "Licht als Zeitmaschine", E "Sterne zählen"), and an explored state of the removed module "Die Sandkorn-Welt" SHALL be dropped.

#### Scenario: Explored module appears brighter
- **WHEN** the user has explored "Reisen mit Lichtgeschwindigkeit" and returns to the home screen
- **THEN** the "Reisen mit Lichtgeschwindigkeit" star is shown in the explored (brighter) style
- **AND** stars of unexplored modules are shown in the faint style

#### Scenario: Stored progress survives the renumbering
- **WHEN** the device stored "Die Reise nach draussen", "Reisen mit Lichtgeschwindigkeit" and "Die Sandkorn-Welt" as explored under the old letters
- **THEN** "Die Reise nach draussen" and "Reisen mit Lichtgeschwindigkeit" are shown explored, and no other module is

#### Scenario: Stored progress survives the second renumbering
- **WHEN** the device stored "Das galaktische Jahr" as explored under its earlier letter E
- **THEN** "Das galaktische Jahr" is shown explored, and "Sterne zählen", which now has the letter E, is not

#### Scenario: No scores
- **WHEN** the home screen is displayed
- **THEN** no points, percentages or badges are visible

#### Scenario: Unavailable device storage
- **WHEN** device storage cannot be read or written
- **THEN** the home screen still renders, with all modules shown as not yet explored

### Requirement: Module preview
Selecting a module star SHALL mark it as selected (a visible ring) and open a preview next to it showing its exploration status ("Schon vertieft" or "Noch nicht vertieft"), the full module title, one poetic line, and an "Eintauchen" button. The title and the poetic line SHALL always be shown in full: the preview SHALL be large enough for a two-line title and the whole line, SHALL grow with its text (for example with larger system text) instead of cutting it off, and long words SHALL break instead of running out of the preview. At most one module SHALL be selected at a time. The preview SHALL stay within the screen and SHALL NOT cover the selected star. On the phone layout the preview opens next to the selected star. On tablet and desktop layouts the preview SHALL always open at the same place in the empty sky below the band, SHALL be connected to the selected star by a thin decorative line, and SHALL NOT cover any module star. Activating "Eintauchen" SHALL open that module's destination.

#### Scenario: Select a star
- **WHEN** no star is selected and the user activates the "Sterne zählen" star
- **THEN** the star is shown as selected
- **AND** a preview shows "Noch nicht vertieft" or "Schon vertieft", "Sterne zählen", its poetic line and an "Eintauchen" button

#### Scenario: Switch selection
- **WHEN** "Licht als Zeitmaschine" is selected and the user activates the "Sterne zählen" star
- **THEN** only "Sterne zählen" is selected and the preview shows "Sterne zählen"

#### Scenario: Close the preview
- **WHEN** a preview is open and the user presses Escape, activates the selected star again, or activates an empty area of the sky
- **THEN** the preview closes and no star is selected
- **AND** if the preview was closed with Escape, keyboard focus returns to the star that was selected

#### Scenario: Enter a module
- **WHEN** the preview for "Sterne zählen" is open and the user activates "Eintauchen"
- **THEN** the "Sterne zählen" module destination is shown

#### Scenario: Preview near the screen edge
- **WHEN** the user selects the star nearest the top-right edge ("Das Unsichtbare") on a 320 px wide screen
- **THEN** the preview is fully visible and does not overlap the selected star

#### Scenario: Nothing cut off
- **WHEN** the user selects any of the six module stars on a 320 × 640 or 390 × 844 phone, a 768 × 1024 or 834 × 1194 tablet, or a 1024 × 768 or 1440 × 900 screen
- **THEN** the status, the full title, the whole poetic line and "Eintauchen" are visible inside the preview

#### Scenario: Preview on large screens
- **WHEN** the user selects any module star on a 1440 × 900 desktop or an 834 × 1194 tablet
- **THEN** the preview appears at the same place below the band, connected to the star by a line
- **AND** it covers none of the six module stars, and every other star can still be selected directly

### Requirement: Accessibility
The home screen SHALL meet WCAG 2.1 AA and report zero automated accessibility (axe) violations. All controls SHALL be reachable and operable with the keyboard in a logical order (settings, module stars in the order along the band, preview, Heute-Nacht card, bottom actions), SHALL show a visible focus indicator, and SHALL have touch targets of at least 44 × 44 CSS px. Text SHALL have a contrast ratio of at least 4.5:1 against its background.

#### Scenario: Automated check
- **WHEN** an axe accessibility scan is run on the home screen, with and without an open preview
- **THEN** it reports zero violations

#### Scenario: Keyboard only
- **WHEN** a keyboard-only user tabs through the home screen
- **THEN** focus moves through settings, the six stars in the order along the band (A, B, C, E, D, F), the Heute-Nacht card and the bottom actions, each with a visible focus indicator
