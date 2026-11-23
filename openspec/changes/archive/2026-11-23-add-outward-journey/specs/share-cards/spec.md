## Purpose

Lets users take a moment of the experience with them as a picture card. The card is drawn on the device and shared through the system's share sheet, or downloaded where sharing is not available.

## ADDED Requirements

### Requirement: Card types
The application SHALL be able to create these picture cards, all in the night-sky style and with the app name "Die Milchstrasse erleben":
- **Kronkorken:** "Wäre die Milchstrasse so gross wie Europa, wäre unser Sonnensystem ein Kronkorken."
- **Münze:** "Wäre die Milchstrasse eine Münze, läge Andromeda einen halben Meter entfernt."
- **Mein Alter:** "Auf dem [Planet] wäre ich [Alter]." (for example "Auf dem Mars wäre ich 16."), for a planet where the user's age is shown.

#### Scenario: Age card
- **WHEN** the user's Mars age is 16 and the user shares the age card in the Mars close-up
- **THEN** the card reads "Auf dem Mars wäre ich 16."

#### Scenario: Comparison card
- **WHEN** the user chooses "Bild teilen" at the end of Modul A
- **THEN** the Kronkorken and Münze cards are offered

### Requirement: Share or download
Before sharing, the application SHALL show a preview of the card with a text alternative. When the device can share image files, "Teilen" SHALL open the system share sheet with the card as a PNG image. Otherwise "Herunterladen" SHALL save the card as a PNG file. Cancelling the share sheet SHALL leave the user where they were, without an error. Focus SHALL return to the control that opened the preview when it closes.

#### Scenario: Share sheet available
- **WHEN** the device supports sharing image files and the user activates "Teilen"
- **THEN** the system share sheet opens with the card image

#### Scenario: No share support
- **WHEN** the device cannot share image files
- **THEN** a "Herunterladen" control saves the card as a PNG file

#### Scenario: Cancelled share
- **WHEN** the user cancels the system share sheet
- **THEN** no error is shown and the preview stays open

### Requirement: Cards are made on the device
Cards SHALL be drawn on the device. Creating or sharing a card SHALL NOT send any data to a server, and a card SHALL NOT contain the birth year.

#### Scenario: No upload
- **WHEN** the user creates and shares a card
- **THEN** no network request is made for it
