# home-screen Specification

## Purpose

The home screen is the calm, night-sky start page for returning users of "Die Milchstrasse erleben". From here they freely explore the seven experience modules, repeat the guided journey, see what the real sky offers tonight, and reach their saved personal moments.

## Requirements

### Requirement: Home screen is the start page
The application SHALL show the home screen at its root address. The home screen SHALL be presented in German, and the document language SHALL be declared as German.

#### Scenario: Opening the app
- **WHEN** a user opens the application root address
- **THEN** the home screen is displayed
- **AND** the page's language is declared as German

### Requirement: Night-sky presentation
The home screen SHALL fill the viewport with a dark night sky showing the Milky Way band running diagonally from lower left to upper right, a dark dust lane within it, and a faint field of background stars. These visual elements SHALL be purely decorative and hidden from assistive technology.

#### Scenario: Decorative sky is not announced
- **WHEN** a screen-reader user navigates the home screen
- **THEN** no element of the band, dust lane or background stars is announced

#### Scenario: Reduced motion
- **WHEN** the user's system requests reduced motion
- **THEN** the sky does not animate

### Requirement: Date and greeting
The top of the home screen SHALL show the current date in German long form (weekday, day, month) and exactly one short poetic greeting line. The greeting SHALL NOT contain numbers.

#### Scenario: Date shown
- **WHEN** the home screen is displayed on Wednesday, 18 November
- **THEN** the date line reads "Mittwoch, 18. November"

#### Scenario: Greeting shown
- **WHEN** the home screen is displayed
- **THEN** exactly one greeting line is visible and it contains no digits

### Requirement: Quiet home screen
The home screen SHALL NOT play narration or sound effects.

#### Scenario: No audio on home
- **WHEN** the user opens the home screen and interacts with any element on it
- **THEN** no narration and no sound effect is played

### Requirement: Settings entry
The home screen SHALL offer a settings control in the top-right corner that is labelled "Einstellungen" for assistive technology and leads to the settings destination.

#### Scenario: Open settings
- **WHEN** the user activates the settings control
- **THEN** the settings destination is shown

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

### Requirement: Exploration is shown by brightness only
A module the user has explored in depth SHALL be shown as a brighter, larger star with a brighter label; a module not yet explored SHALL be shown fainter. The home screen SHALL NOT show points, percentages, badges or other scores. The explored state SHALL persist on the user's device across visits without an account.

#### Scenario: Explored module appears brighter
- **WHEN** the user has explored "Die Sandkorn-Welt" and returns to the home screen
- **THEN** the "Die Sandkorn-Welt" star is shown in the explored (brighter) style
- **AND** stars of unexplored modules are shown in the faint style

#### Scenario: No scores
- **WHEN** the home screen is displayed
- **THEN** no points, percentages or badges are visible

#### Scenario: Unavailable device storage
- **WHEN** device storage cannot be read or written
- **THEN** the home screen still renders, with all modules shown as not yet explored

### Requirement: Module preview
Selecting a module star SHALL mark it as selected (a visible ring) and open a preview next to it showing its exploration status ("Schon vertieft" or "Noch nicht vertieft"), the full module title, one poetic line, and an "Eintauchen" button. At most one module SHALL be selected at a time. The preview SHALL stay within the screen and SHALL NOT cover the selected star. On the phone layout the preview opens next to the selected star. On tablet and desktop layouts the preview SHALL always open at the same place in the empty sky below the band, SHALL be connected to the selected star by a thin decorative line, and SHALL NOT cover any module star. Activating "Eintauchen" SHALL open that module's destination.

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

#### Scenario: Preview on large screens
- **WHEN** the user selects any module star on a 1440 × 900 desktop or an 834 × 1194 tablet
- **THEN** the preview appears at the same place below the band, connected to the star by a line
- **AND** it covers none of the seven module stars, and every other star can still be selected directly

### Requirement: Heute-Nacht card
The home screen SHALL show a "Heute Nacht" card above the bottom actions. When a location is known, the card SHALL show the location name, the time from which the band is visible, the sky darkness as a filled count on a five-point scale (with an accessible text equivalent such as "Dunkelheit 2 von 5"), a moon line, and tonight's mission text. When no location is known, the card SHALL instead invite the user to choose a place ("Wo stehst du heute Nacht?") without requesting device location automatically. Activating the card SHALL open the Heute-Nacht destination.

#### Scenario: Location known
- **WHEN** the home screen is displayed and a location "Hamburg" is known
- **THEN** the card shows "HEUTE NACHT · HAMBURG", the visibility time, the darkness scale, a moon line and the mission text

#### Scenario: No location yet
- **WHEN** the home screen is displayed and no location is known
- **THEN** the card shows "Wo stehst du heute Nacht?" and offers to choose a place
- **AND** the browser is not asked for the device location

#### Scenario: Open Heute Nacht
- **WHEN** the user activates the card
- **THEN** the Heute-Nacht destination is shown

### Requirement: Journey entry
The home screen SHALL offer a "Die Reise" action that leads to the guided journey destination.

#### Scenario: Repeat the journey
- **WHEN** the user activates "Die Reise"
- **THEN** the guided journey destination is shown

### Requirement: Meine Sterne entry
The home screen SHALL show a "Meine Sterne" action with the number of saved moments only when at least one moment is saved. Activating it SHALL lead to the "Meine Sterne" destination. When it is hidden, "Die Reise" SHALL use the full width of the action row.

#### Scenario: Moments saved
- **WHEN** the user has saved 2 moments
- **THEN** "Meine Sterne" is shown with the count 2
- **AND** activating it shows the "Meine Sterne" destination

#### Scenario: Nothing saved
- **WHEN** the user has saved no moments
- **THEN** "Meine Sterne" is not shown and "Die Reise" spans the action row

### Requirement: Placeholder destinations
Until the linked features exist, every destination reachable from the home screen (each module, the journey, Heute Nacht, Meine Sterne, settings) SHALL show a calm placeholder page naming the destination and offering a way back to the home screen.

#### Scenario: Visit a placeholder and return
- **WHEN** the user activates "Eintauchen" for "Das Unsichtbare"
- **THEN** a page titled "Das Unsichtbare" with a note that it is coming soon is shown
- **AND** activating its back link returns to the home screen

### Requirement: Accessibility
The home screen SHALL meet WCAG 2.1 AA and report zero automated accessibility (axe) violations. All controls SHALL be reachable and operable with the keyboard in a logical order (settings, module stars in journey order, preview, Heute-Nacht card, bottom actions), SHALL show a visible focus indicator, and SHALL have touch targets of at least 44 × 44 CSS px. Text SHALL have a contrast ratio of at least 4.5:1 against its background.

#### Scenario: Automated check
- **WHEN** an axe accessibility scan is run on the home screen, with and without an open preview
- **THEN** it reports zero violations

#### Scenario: Keyboard only
- **WHEN** a keyboard-only user tabs through the home screen
- **THEN** focus moves through settings, the seven stars in journey order, the Heute-Nacht card and the bottom actions, each with a visible focus indicator

### Requirement: Responsive layout
The home screen SHALL work from 320 px wide phones to desktop screens without horizontal scrolling, with three layouts. In every layout the sky SHALL fill the whole viewport and module stars and labels SHALL NOT overlap each other or be cut off.
- **Phone** (narrower than 768 px): text, sky stage, card and actions in one centered column no wider than a phone.
- **Tablet** (768 px or wider, portrait, narrower than 1100 px): date, settings and greeting at the top; the band and module stars across the full width; the Heute-Nacht card and the actions side by side at the bottom.
- **Desktop** (1100 px or wider, or 768 px or wider in landscape): a quiet column on the left with the app name, date, greeting, a short hint ("Wähle einen Stern am Band, um einzutauchen."), the Heute-Nacht card and the actions; the band and module stars fill the rest of the window; settings in the top-right corner.

#### Scenario: Small phone
- **WHEN** the home screen is displayed at 320 × 640 px
- **THEN** the phone layout is used, there is no horizontal scrolling and no module labels overlap

#### Scenario: Tablet portrait
- **WHEN** the home screen is displayed at 834 × 1194 px
- **THEN** the tablet layout is used: the band spans the full width and the Heute-Nacht card and actions sit side by side below it

#### Scenario: Desktop
- **WHEN** the home screen is displayed at 1440 × 900 px
- **THEN** the desktop layout is used: the left column holds greeting, card and actions, and the module stars are spread across the rest of the window

#### Scenario: Tablet landscape
- **WHEN** the home screen is displayed at 1024 × 768 px
- **THEN** the desktop layout is used without horizontal scrolling or cut-off labels

### Requirement: Privacy and no hurdles
The home screen SHALL work without an account or sign-in and SHALL NOT load resources from third-party servers.

#### Scenario: No third-party requests
- **WHEN** the home screen loads
- **THEN** all requested resources come from the application's own origin
