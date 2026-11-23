## MODIFIED Requirements

### Requirement: Card types
The application SHALL be able to create these picture cards, all in the night-sky style and with the app name "Die Milchstrasse erleben":
- **Kronkorken:** "Wäre die Milchstrasse so gross wie Europa, wäre unser Sonnensystem ein Kronkorken."
- **Münze:** "Wäre die Milchstrasse eine Münze, läge Andromeda einen halben Meter entfernt."
- **Mein Alter:** "Auf dem [Planet] wäre ich [Alter]." (for example "Auf dem Mars wäre ich 16."), for a planet where the user's age is shown.
- **Reise:** "Nach [Ziel] mit [Tempo] der Lichtgeschwindigkeit: [Dauer]." and, as a paragraph of its own, the generations on board as a full sentence: "An Bord vergehen dabei [Anzahl] Generationen." (for example "Nach Proxima Centauri mit 1 % der Lichtgeschwindigkeit: 424 Jahre." / "An Bord vergehen dabei 17 Generationen."), for the current journey in "Reisen mit Lichtgeschwindigkeit". A journey within one generation reads "An Bord vergeht dabei eine Generation."; a lower bound puts "mindestens" before the duration and the generations. The saved or shared file is named after the destination (for example "proxima-centauri.png"); the other cards keep "milchstrasse.png". Above the sentence the card shows a picture of the destination from Modul A (its photo, or its surface drawn as a sphere), with a small credit line naming the picture's source and licence; where the picture cannot be made, the card shows the sentence alone.

#### Scenario: Age card
- **WHEN** the user's Mars age is 16 and the user shares the age card in the Mars close-up
- **THEN** the card reads "Auf dem Mars wäre ich 16."

#### Scenario: Comparison card
- **WHEN** the user chooses "Bild teilen" at the end of Modul A
- **THEN** the Kronkorken and Münze cards are offered

#### Scenario: Travel card
- **WHEN** the user shares the journey to Proxima Centauri at 20 %
- **THEN** the card reads "Nach Proxima Centauri mit 20 % der Lichtgeschwindigkeit: 21,2 Jahre." and, in a paragraph below, "An Bord vergeht dabei eine Generation."
- **AND** the downloaded file is named "proxima-centauri.png"

#### Scenario: Destination picture on the travel card
- **WHEN** the user shares a journey to Andromeda
- **THEN** the card shows the photo of Andromeda above the sentence with "Bild: Adam Evans · CC BY 2.0", and the preview's text alternative names Andromeda
