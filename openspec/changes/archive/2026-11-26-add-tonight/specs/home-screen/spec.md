## MODIFIED Requirements

### Requirement: Heute-Nacht card
The home screen SHALL show a "Heute Nacht" card above the bottom actions. When a place is known, the card SHALL show, computed with the same rules as the Heute-Nacht page: the place name in the kicker („HEUTE NACHT · HAMBURG“), when it is dark enough tonight („ab 18:15 Uhr“, or that it does not get fully dark), the darkness level the user chose as a filled count on a five-point scale (with an accessible text equivalent such as "Dunkelheit 2 von 5"), a moon line, and the highlight of the night with its direction and the number of objects visible at the preselected moment („7 Dinge mit blossem Auge, zum Beispiel Saturn im Süden.“). The highlight SHALL be the Milky Way when it is visible at some moment tonight, otherwise the brightest planet visible at the preselected moment, otherwise the brightest planet visible at another moment, otherwise the first visible object other than the Moon. When the Milky Way is not visible tonight, the card SHALL name its next good night when there is one within 30 nights („Die Milchstrasse: wieder am Samstag.“). When no place is known, the card SHALL instead invite the user to choose a place ("Wo stehst du heute Nacht?") without requesting device location automatically. The card SHALL end with a visible prompt into the page: „Ort wählen ›“ without a place, „Was du heute siehst ›“ with one. Activating the card SHALL open the Heute-Nacht page.

#### Scenario: Location known
- **WHEN** the home screen is displayed and the place "Hamburg" with darkness level 2 is known on 26 November 2026
- **THEN** the card shows "HEUTE NACHT · HAMBURG", when it is dark enough, two of five darkness dots, a moon line, the number of visible objects and a planet as the highlight with its direction
- **AND** it ends with „Was du heute siehst ›“, and activating the card opens the Heute-Nacht page

#### Scenario: Milky Way not visible
- **WHEN** the home screen is displayed for a known place on a night when the Moon outshines the band all night
- **THEN** the card names the Milky Way's next good night

#### Scenario: Milky Way visible
- **WHEN** the home screen is displayed for a known place with darkness level 4 on a moonless night
- **THEN** the highlight is the Milky Way

#### Scenario: No location yet
- **WHEN** the home screen is displayed and no location is known
- **THEN** the card shows "Wo stehst du heute Nacht?" and offers to choose a place
- **AND** the browser is not asked for the device location

#### Scenario: Open Heute Nacht
- **WHEN** the user activates the card
- **THEN** the Heute-Nacht page is shown

### Requirement: Placeholder destinations
Until the linked features exist, every destination reachable from the home screen (each module, the journey, Heute Nacht, Meine Sterne, settings) SHALL show a calm placeholder page naming the destination and offering a way back to the home screen. A destination whose feature exists SHALL open that feature instead. Modul A "Die Reise nach draussen", Modul B "Reisen mit Lichtgeschwindigkeit", Modul C "Das galaktische Jahr" and "Heute Nacht" SHALL open their experiences, and the settings control SHALL open the settings page with the switches for night mode and vibration. The address of the removed module "Die Sandkorn-Welt" SHALL lead back to the home screen like any unknown module address.

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

#### Scenario: Heute Nacht is no longer a placeholder
- **WHEN** the user activates the Heute-Nacht card
- **THEN** the Heute-Nacht page opens instead of a placeholder page

#### Scenario: Settings are no longer a placeholder
- **WHEN** the user activates the settings control
- **THEN** the settings page with the switches „Nachtmodus“ and „Vibration“ opens instead of a placeholder page

#### Scenario: Removed module
- **WHEN** the user opens the address of "Die Sandkorn-Welt"
- **THEN** the home screen is shown

### Requirement: Accessibility
The home screen SHALL meet WCAG 2.1 AA and report zero automated accessibility (axe) violations, in the normal look and in night mode. All controls SHALL be reachable and operable with the keyboard in a logical order (settings, module stars in the order along the band, preview, Heute-Nacht card, bottom actions), SHALL show a visible focus indicator, and SHALL have touch targets of at least 44 × 44 CSS px. Text SHALL have a contrast ratio of at least 4.5:1 against its background.

#### Scenario: Automated check
- **WHEN** an axe accessibility scan is run on the home screen, with and without an open preview, and in night mode
- **THEN** it reports zero violations

#### Scenario: Keyboard only
- **WHEN** a keyboard-only user tabs through the home screen
- **THEN** focus moves through settings, the six stars in the order along the band (A, B, C, E, D, F), the Heute-Nacht card and the bottom actions, each with a visible focus indicator

#### Scenario: Keyboard only in night mode
- **WHEN** night mode is on and a keyboard-only user tabs through the home screen
- **THEN** focus moves from settings directly to the first star; the home screen has no night-mode control
