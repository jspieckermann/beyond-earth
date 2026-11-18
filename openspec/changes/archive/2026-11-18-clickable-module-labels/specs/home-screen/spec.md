## MODIFIED Requirements

### Requirement: Module constellation
The home screen SHALL show the seven experience modules as seven selectable stars placed along the Milky Way band, in journey order from lower left to upper right: A "Die Reise nach draussen", C "Reisen mit Lichtgeschwindigkeit", B "Die Sandkorn-Welt", E "Sterne zählen", D "Licht als Zeitmaschine", G "Das Unsichtbare", F "Das galaktische Jahr". Each star SHALL carry a short visible label and an accessible name equal to the module's full title. No module SHALL be locked. On tablet and desktop layouts the labels SHALL stay visible while their star is selected. A star and its visible label SHALL form one control: activating the label SHALL have exactly the same effect as activating the star, hovering the label SHALL indicate that it is clickable, and star and label together SHALL be a single keyboard stop whose focus indicator encloses both.

#### Scenario: All seven modules present
- **WHEN** the home screen is displayed
- **THEN** seven module stars are shown in the order A, C, B, E, D, G, F along the band
- **AND** each star has a visible short label and an accessible name with the full module title

#### Scenario: Select a module by its label
- **WHEN** no module is selected and the user taps or clicks the label "Sandkorn-Welt"
- **THEN** "Die Sandkorn-Welt" is selected and its preview opens, exactly as when its star is activated

#### Scenario: Close by activating the label again
- **WHEN** "Sterne zählen" is selected on the tablet or desktop layout and the user activates its label again
- **THEN** the preview closes and no module is selected

#### Scenario: Every label selects its own module
- **WHEN** the user activates the centre of any module's label on the phone, tablet or desktop layout
- **THEN** that module, and no other, is selected

#### Scenario: One keyboard stop per module
- **WHEN** a keyboard user tabs through the module constellation
- **THEN** each module is reached exactly once, in journey order, and the focus indicator surrounds both its star and its label
