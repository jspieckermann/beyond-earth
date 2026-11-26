# night-mode Specification

## Purpose

An app-wide red-on-black night mode, so that the phone does not spoil the eyes' adaptation to the dark while the user is outside looking for the Moon, planets, stars and the Milky Way.

## Requirements

### Requirement: Switching night mode
Night mode SHALL be switched on and off only on the settings page („Einstellungen“, reached from the home screen's settings control), with a „Nachtmodus“ switch that exposes whether it is on, a sentence on what it does, and keyboard focus on the page heading when the page opens. Switching it on SHALL turn the whole app into night mode at once and show the hint „Dreh auch die Helligkeit deines Bildschirms herunter. Das kann die Anwendung nicht für dich tun.“ Switching it off SHALL restore the normal look at once. No other page SHALL offer a control that switches night mode; the Heute-Nacht page MAY point to the settings while night mode is off.

#### Scenario: Switch on in the settings
- **WHEN** the user opens „Einstellungen“ and activates the switch „Nachtmodus“
- **THEN** the app turns red on black, the switch shows that it is on, and the brightness hint is shown

#### Scenario: Switch off in the settings
- **WHEN** night mode is on and the user activates the switch „Nachtmodus“ in the settings
- **THEN** the app returns to its normal look at once

#### Scenario: Nowhere else
- **WHEN** the home screen or the Heute-Nacht page is shown, with night mode on or off
- **THEN** neither offers a control that switches night mode

### Requirement: What night mode changes
In night mode every page of the app (the home screen, the modules, Heute Nacht, the settings, placeholder pages and fact sheets) SHALL use only dark red tones on black for text, controls, lines and surfaces, without white or blue. Pictures, drawings and animations SHALL be shown tinted red and dimmed. The browser's theme colour SHALL be black. Layout and content SHALL stay the same.

#### Scenario: A module in night mode
- **WHEN** night mode is on and the user opens „Die Reise nach draussen“
- **THEN** the module's texts and controls are red on black and its pictures are tinted red

### Requirement: Night mode persists
The night-mode setting SHALL be stored on the device and SHALL stay on across pages, reloads and visits until the user switches it off. If device storage is unavailable, night mode SHALL still work for the current visit.

#### Scenario: Reload in night mode
- **WHEN** night mode is on and the user reloads the app
- **THEN** the app opens in night mode

### Requirement: Night mode stays readable
In night mode text SHALL keep a contrast ratio of at least 4.5:1 against its background (3:1 for large text and for focus indicators and control outlines), and pages SHALL report zero automated accessibility (axe) violations as in the normal look.

#### Scenario: Automated check in night mode
- **WHEN** an axe scan is run on the home screen, the settings and the Heute-Nacht page in night mode
- **THEN** it reports zero violations
