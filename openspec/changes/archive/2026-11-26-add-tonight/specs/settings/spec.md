## Purpose

One place for the app's few settings, reachable from every page at the same spot: night mode for use outdoors and the vibration of the journey.

## ADDED Requirements

### Requirement: Settings page
The settings control SHALL open the page „Einstellungen“ at its own address, with the document title "Einstellungen · Die Milchstrasse erleben" and keyboard focus on its heading. It SHALL hold exactly two switches, each with a name, a sentence on what it does and its state exposed: „Nachtmodus“ (see the night-mode capability) and „Vibration“ (a short pulse when the journey outwards snaps into a stage, on devices that can vibrate). Both choices SHALL be stored on the device and take effect at once. A „Zurück“ control SHALL return to the last page shown before the settings (with its address, including any query), or to the home screen when the settings were opened directly; it SHALL NOT depend on the browser history.

#### Scenario: Switch the vibration off
- **WHEN** the user opens „Einstellungen“ and switches „Vibration“ off
- **THEN** the switch shows that it is off, the choice is stored, and the journey outwards no longer vibrates when it snaps into a stage

#### Scenario: Back to where the user came from
- **WHEN** the user opens the settings from Modul A and activates „Zurück“
- **THEN** Modul A is shown again

#### Scenario: Back to Heute Nacht
- **WHEN** the user goes through Modul C and the home screen to Heute Nacht, opens the settings with the gear and activates „Zurück“
- **THEN** Heute Nacht is shown again

#### Scenario: Opened directly
- **WHEN** the settings address is opened directly and the user activates „Zurück“
- **THEN** the home screen is shown

### Requirement: Settings on every page
Every page of the app except the settings themselves SHALL show the settings control, a gear labelled "Einstellungen" for assistive technology, at the same place as on the home screen for the current layout (phone, tablet, desktop), so that it does not move between pages. No page SHALL offer its own panel for these settings.

#### Scenario: Same place everywhere
- **WHEN** the user goes from the home screen to Modul A, Modul B, Modul C, Heute Nacht or a placeholder page
- **THEN** the gear is shown at exactly the same position as on the home screen

#### Scenario: No own panel in Modul A
- **WHEN** Modul A is shown
- **THEN** it offers no „Weitere Einstellungen“ panel; the gear leads to the settings

### Requirement: Settings accessibility
The settings page SHALL meet WCAG 2.1 AA and report zero automated accessibility (axe) violations, in the normal look and in night mode. The switches SHALL be operable with the keyboard, have visible focus indicators and touch targets of at least 44 × 44 CSS px.

#### Scenario: Automated check
- **WHEN** an axe scan is run on the settings page
- **THEN** it reports zero violations
