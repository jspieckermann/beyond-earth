# tonight Specification

## Purpose

"Heute Nacht": a calm page that tells users what they can see tonight from their own place with the naked eye (the Moon, planets, bright stars and constellations and, on good nights, the Milky Way), where it stands and how to find it, with honest pictures of what the eye really sees, so that the experience continues under the real sky.

## Requirements

### Requirement: Page entry
Activating the Heute-Nacht card on the home screen SHALL open the Heute-Nacht page at its address. The page SHALL be in German, have the document title "Heute Nacht · Die Milchstrasse erleben", and move keyboard focus to the question „Wo stehst du heute Nacht?“. A visible "Zurück zum Himmel" control SHALL return to the home screen at any time. Opening the page SHALL NOT ask the browser for the device location. When no place is stored, the page SHALL show only the place question; when a place is stored, it SHALL show that place and, below it, what can be seen tonight.

#### Scenario: First visit
- **WHEN** a user without a stored place activates the Heute-Nacht card
- **THEN** the Heute-Nacht page opens with the question „Wo stehst du heute Nacht?“ and an empty place field, without the list
- **AND** the browser is not asked for the device location

#### Scenario: Returning visit
- **WHEN** a user with the stored place "Hamburg" opens the Heute-Nacht page
- **THEN** the place field shows Hamburg and the list for Hamburg is shown below without asking for a place again

#### Scenario: Back to the sky
- **WHEN** the user activates "Zurück zum Himmel"
- **THEN** the home screen is shown

### Requirement: One page
The page SHALL show everything on one page, without steps or tabs: at the top the place and its darkness („Dein Ort“), below it what can be seen tonight („Was du siehst“). The part below SHALL appear as soon as a place is chosen, without a further control, and SHALL follow every change of place or darkness at once.

#### Scenario: Change the place
- **WHEN** the list for Hamburg is shown and the user chooses "Lüneburg" in the place field
- **THEN** the place field shows Lüneburg and the list below is shown for Lüneburg

#### Scenario: Without a place
- **WHEN** no place is stored
- **THEN** only the place question, the place field and „Meinen Standort verwenden“ are shown

### Requirement: Choosing a place
The page SHALL ask „Wo stehst du heute Nacht?“ and offer two ways. First, one field „Stadt oder Ort suchen“ that shows the chosen place and searches: it SHALL be a combobox with a popup list; from two typed letters on, the list SHALL suggest matching places from a list shipped with the app (towns in Germany, Austria and Switzerland and the dark-sky places of the three countries), at most eight at a time, each with its kind or region, operable with the keyboard (arrows, Enter, Escape); without input it SHALL suggest the stored place and two dark-sky places. Focusing the field SHALL select the shown name so that it can be typed over; a clear control SHALL empty it. After a choice the list SHALL close and only the chosen place SHALL remain visible, with its region below the field. Second, „Meinen Standort verwenden“ directly below the field: only then SHALL the browser be asked for the device location; the position SHALL be rounded to 0,05° in latitude and longitude before it is used or stored, and shown as „Dein Standort“ followed in brackets by the nearest town of the shipped list within 25 km („Dein Standort (Hamburg)“), found on the device without asking any service; without such a town only „Dein Standort“. If the location is refused or unavailable, the page SHALL say so calmly and keep the search available. While no place is chosen, a note SHALL say that the place stays only on this device, rounded to a few kilometres. Only the last chosen place SHALL be kept; choosing another place replaces it. The page SHALL NOT offer a control „Ort vergessen“.

#### Scenario: Search a town
- **WHEN** the user types "Lüne" into the search field
- **THEN** the popup list suggests "Lüneburg" with its region
- **AND** after choosing it the list closes and the field shows "Lüneburg"

#### Scenario: Device location on request only
- **WHEN** the user activates "Meinen Standort verwenden" and allows it at 53,5512° N, 9,9937° E
- **THEN** the place is stored as „Dein Standort (Hamburg)“ at 53,55° N, 10,00° E
- **AND** before the activation the browser had not been asked

#### Scenario: Device location far from any listed town
- **WHEN** the device location is at 40,42° N, 3,70° W
- **THEN** the place is shown as „Dein Standort“ without a town

#### Scenario: Location refused
- **WHEN** the user activates "Meinen Standort verwenden" and refuses the browser's request
- **THEN** a calm note says the location is not available and the search field stays usable

### Requirement: Darkness of the place
Once a place is chosen, the page SHALL ask below it „Wie dunkel ist es dort?“ as a select-only combobox with a popup list of five levels. Closed, it SHALL show the chosen level; open, all five, in the same form: five dots, a name and a sentence, the chosen one marked: 1 „Mitten in der Stadt“ – „Einige helle Sterne. Planeten und Mond gut.“; 2 „Stadtrand, Vorort“ – „Die Sternbilder. Vom Band höchstens eine Ahnung.“; 3 „Land, nahe einer Stadt“ – „Das Band als blasser Schleier, hoch oben.“; 4 „Auf dem Land“ – „Das Band deutlich, von Horizont zu Horizont.“; 5 „Sehr dunkel: Sternenpark, Gebirge, Insel“ – „Das Band mit Struktur und dunklen Staubbändern.“ When a place is chosen, the level SHALL be preselected from the kind of place: 5 for a dark-sky place, 1 for a town of at least 500.000 inhabitants, 2 otherwise and for „Dein Standort“; while the suggested level is chosen, a line below SHALL say why („Vorgeschlagen für eine Grossstadt.“). The user's choice SHALL override the suggestion. Place and darkness SHALL be stored on the device as soon as they are chosen.

#### Scenario: Suggestion for a dark-sky place
- **WHEN** the user chooses „Sternenpark Rhön“
- **THEN** level 5 is preselected and the line „Vorgeschlagen für einen Sternenpark.“ is shown

#### Scenario: Suggestion for a town
- **WHEN** the user chooses "Lüneburg"
- **THEN** level 2 is preselected

#### Scenario: Own choice wins
- **WHEN** the user chooses "Hamburg" and changes the level to 3
- **THEN** the list uses level 3, level 3 is stored and the suggestion line is no longer shown

### Requirement: Tonight
"Tonight" SHALL be the night that begins on the evening of the current local date of the chosen place; between midnight and noon it SHALL be the night still running since the previous evening. All times SHALL be shown in the local time of the chosen place (the device's time zone for „Dein Standort“), rounded to five minutes, in the form "18:15".

#### Scenario: Early morning
- **WHEN** the user opens the page at 03:00 on 25 November
- **THEN** the page describes the night from the evening of 24 November to the morning of 25 November

### Requirement: Calculation rules
The page SHALL calculate on the device, from place, date and time:
- **Dark:** it is dark while the Sun is at least 18° below the horizon.
- **Moon:** the Moon disturbs while it is above the horizon and more than a quarter of its disc is lit.
- **Moments:** „Abends“ is the end of nautical twilight (Sun 12° below the horizon), not before 20:00, rounded to the full hour; „Mitternacht“ is the midpoint between sunset and sunrise, rounded to the full hour; „Morgens“ is the start of nautical twilight, rounded down to the full hour. When the Sun does not reach 12° below the horizon, the three moments are the darkest moment minus two hours, the darkest moment and plus two hours.
- **Visible:** an object is visible at a moment when it is at least 10° above the horizon, the darkness level reaches the object's minimum, the Sun is low enough for the object (below the horizon for the Moon, 3° below it for Venus and Jupiter, 6° for Mars and Saturn, 8° for single bright stars, the Sommerdreieck and the Skorpion, 9° for the other constellations and the Plejaden, 18° for the Milky Way and the Andromeda galaxy), and, for objects the Moon disturbs, the Moon does not disturb.
- **Next good night for the Milky Way:** the first night within the next 30 nights at the same place with at least one hour that is dark and without a disturbing Moon.
- **Position:** the direction as one of eight compass directions; the height in fists (altitude ÷ 10°, rounded, said in words); from 70° „Fast genau über dir“.
- **Accuracy:** times of sunset, sunrise, twilight and moonrise and moonset SHALL be within five minutes of an established almanac for the same place and date; positions of the Moon, planets, stars and the band SHALL be within 1°.

#### Scenario: High summer in the north
- **WHEN** the place is Hamburg (53,55° N) and the night is 21 to 22 June
- **THEN** there is no dark span, and the Milky Way is not visible at any moment

#### Scenario: Almanac check
- **WHEN** the times for a fixed place and date are compared with the almanac values recorded in the tests
- **THEN** each differs by at most five minutes

### Requirement: Conditions and summary
Below the place, the page SHALL show the conditions as one quiet box with two lines: when it is dark enough („Dunkel ab 18:15 Uhr“, or that it does not get fully dark tonight), and the Moon (lit fraction in percent, a word for the phase and when it rises or sets, „Mond 94 %, fast voll, ab 17:15 Uhr am Himmel“, highlighted while it disturbs). The darkness level SHALL NOT be repeated there. Directly below the moment choice one sentence SHALL sum up the chosen moment: the number of visible objects at that moment („Um 20 Uhr siehst du 6 Dinge mit blossem Auge.“) and one clause for the main condition: the Moon swallows everything faint; tonight is a night for the Milky Way; the place is too bright for the Milky Way; it does not get fully dark here tonight. When nothing is visible, it SHALL say that hardly anything can be seen from here at this time. The page SHALL never mention the weather.

#### Scenario: Bright Moon
- **WHEN** the place is Hamburg with darkness 2 on 26 November 2026 and „Abends“ is chosen
- **THEN** the Moon line shows about 94 % and is highlighted, and the sentence below the moments names the number of visible objects and says that the bright Moon swallows everything faint

### Requirement: Choosing the moment
The page SHALL offer the three moments „Abends“, „Mitternacht“ and „Morgens“ as a single-choice group, each labelled with its local time, exposing which is chosen. The first moment still ahead or less than an hour past SHALL be preselected; during the day „Abends“; after the last one „Morgens“. Changing the moment SHALL update the summary, the list, every position, every step and „Heute nicht zu sehen“ at once.

#### Scenario: Later in the night
- **WHEN** the place is Hamburg on 26 November 2026 and the user switches from „Abends“ to „Mitternacht“
- **THEN** Jupiter and Mars appear in the list in the east, and the Sommerdreieck moves to „Heute nicht zu sehen“ as too low above the horizon

### Requirement: Object catalogue
The page SHALL know a fixed catalogue of objects that can be found with the naked eye, each with kind, ease („Sofort“, „Leicht“, „Etwas Übung“), minimum darkness, whether the Moon disturbs it, an eye sentence, steps and pictures. It SHALL include at least: the Moon; Venus, Jupiter, Mars and Saturn; the Grosser Wagen with the Polarstern; Kassiopeia (minimum 2); the Sommerdreieck with Wega, Deneb and Atair; Kapella; Arktur; Orion with the Orion Nebula (the nebula from level 3); Sirius; the Plejaden; the Skorpion with Antares; the Milky Way (minimum 3, disturbed by the Moon); the Andromeda galaxy (minimum 3, disturbed by the Moon). Two planets less than 5° apart SHALL be shown as one card („Jupiter und Mars“). For every night of the year at 45°, 50° and 56° North and darkness 2, at least one moment SHALL show at least five objects.

#### Scenario: Year-round coverage
- **WHEN** every night of a year is checked at 45°, 50° and 56° North with darkness 2
- **THEN** each night has a moment with at least five visible objects

#### Scenario: Close planets
- **WHEN** Jupiter and Mars are 4° apart at the chosen moment
- **THEN** one card „Jupiter und Mars“ is shown

### Requirement: The list of visible objects
Under „Mit dem Auge zu sehen“ the page SHALL list the objects visible at the chosen moment, the Milky Way first when it is visible, then those that are „Sofort“ to find, then „Leicht“, then „Etwas Übung“, the brightest first within a group. Each object SHALL be a card with a control that expands and collapses it and exposes its state. Collapsed, a card SHALL show a thumbnail, the name, the kind, the position („Süden · Vier Fäuste hoch“, „Fast genau über dir“) and the ease. The first card SHALL be expanded, the others collapsed. Each card SHALL expand and collapse on its own: expanding a card SHALL NOT collapse another one, SHALL push what follows down and SHALL NOT scroll the page.

#### Scenario: Saturn in the evening
- **WHEN** the place is Hamburg on 26 November 2026 and „Abends“ (20 Uhr) is chosen
- **THEN** the list contains Saturn with „Süden · Vier Fäuste hoch“ and the ease „Leicht“

#### Scenario: Expand a card
- **WHEN** the user activates the card of the Plejaden
- **THEN** the card expands and exposes that it is expanded
- **AND** the first card stays expanded, the Plejaden card stays where it was on the screen and the page does not scroll

### Requirement: An expanded object
An expanded card SHALL show, in this order: under „Mit dem blossen Auge“ a real photo taken without a telescope in which the object is marked, with a caption, author and licence; no close-up through a telescope or from a space probe and no separate drawing (the figure of a constellation is drawn into the photo); the sentence „Mit dem Auge:“ describing what the eye really sees; under „So findest du es“ three or four numbered steps from compass direction and height to a feature that identifies the object, with direction and height for the chosen moment; and „Sichtbar:“ with tonight's time span („die ganze Nacht“, „bis 2:40 Uhr“, „ab etwa 23 Uhr“). The steps for the Milky Way SHALL be a route to the band from a bright pointer star, ending with „Folge dem Band nach oben.“ at a shared meeting point near the zenith; its eye sentence SHALL match the darkness level.

#### Scenario: Saturn's steps
- **WHEN** the card of Saturn is expanded for Hamburg on 26 November 2026 at 20 Uhr
- **THEN** the steps say to turn south, that a yellowish point stands four fists high, and that it does not twinkle
- **AND** the eye sentence says that the ring needs a small telescope

#### Scenario: No close-up
- **WHEN** the card of Saturn is expanded
- **THEN** it shows the naked-eye photo and no photo through a telescope or from a space probe

#### Scenario: Constellation without a drawing
- **WHEN** the card of Kassiopeia is expanded
- **THEN** the W is marked in the naked-eye photo and no separate drawing is shown; the drawing of the figure appears only as the small thumbnail

#### Scenario: Steps follow the moment
- **WHEN** the card of the Plejaden is expanded and the user switches from „Abends“ to „Mitternacht“
- **THEN** the first step names the south instead of the east and the height changes accordingly

### Requirement: Pictures and marks
Every naked-eye photo SHALL be a real, dark night photo: no twilight, no blue or red sky and no clouds lit grey by city light. Venus, which never stands in a fully dark sky in Central Europe, MAY be shown in a dark sky elsewhere when the caption says where. In every naked-eye photo the target SHALL be marked with a ring and its name; nearby orientation points MAY be marked with thinner dashed rings and their names; constellations SHALL be marked with a line through the stars of the figure. Marks SHALL stay in place when the photo is scaled. Every picture SHALL be freely licensed (public domain, CC0, CC BY or CC BY-SA), shipped with the app and credited with author and licence below it. When a photo shows more than the eye sees, its caption SHALL say so. The page SHALL NOT show photos of the Milky Way that are brighter than what can be seen without saying so.

#### Scenario: Dark photos
- **WHEN** the naked-eye photos of the Moon, Saturn, the Sommerdreieck and Jupiter and Mars are shown
- **THEN** each shows a dark night sky, without twilight

#### Scenario: Marked Plejaden
- **WHEN** the card of the Plejaden is expanded
- **THEN** the naked-eye photo shows a ring labelled „Plejaden“ around the cluster and dashed rings for nearby bright points with their names

#### Scenario: Marked constellation
- **WHEN** the card of Kassiopeia is expanded
- **THEN** a line through the five stars of the W is drawn on the naked-eye photo

### Requirement: Not visible tonight
Under „Heute nicht zu sehen“ the page SHALL list the catalogue objects that are not visible at the chosen moment but are visible at another moment of tonight, or are hidden only by the Moon, twilight or the place's darkness, each with a thumbnail and the first matching reason: the place is too bright, with the level needed; the Moon outshines it; it is still too bright (twilight); not yet risen (below the horizon), with the time it stands high enough and the direction; already set, with the time it set; too low above the horizon, with the time it stands high enough again when that comes later tonight. Objects that stay below the horizon all night SHALL NOT be listed. The Milky Way SHALL be listed here whenever it is not in the list of visible objects.

#### Scenario: Full Moon hides the Milky Way
- **WHEN** a Moon more than a quarter lit is above the horizon at the chosen moment and the darkness level is 4
- **THEN** the Milky Way is listed under „Heute nicht zu sehen“ with the reason that the Moon outshines it

#### Scenario: Rises later
- **WHEN** the place is Hamburg on 26 November 2026 and „Abends“ is chosen
- **THEN** Orion is listed under „Heute nicht zu sehen“ with the time from which it stands high enough

### Requirement: Next good night for the Milky Way
When the Milky Way is not visible at any moment of tonight, the page SHALL show a highlighted note with its next good night, weekday, date and the dark span without a disturbing Moon („Samstag, 28. November, 18:15 bis 20:20 Uhr“), with one sentence why. When the darkness level is below 3, the note SHALL add that the band needs a darker place, level 3 or more. When there is no good night within 30 nights, the note SHALL say so.

#### Scenario: Next good night
- **WHEN** the place is Hamburg on 26 November 2026
- **THEN** the note names Saturday, 28 November, from 18:15 to 20:20, and that the Moon then rises only at 20:20

### Requirement: Before you go out
The page SHALL end with „Bevor du rausgehst“ and three tips: „Gib deinen Augen 20 Minuten.“, that one fist at arm's length is about 10° and nine fists reach from the horizon to overhead, and, while the Moon is above the horizon at the chosen moment, to stand with the Moon behind oneself or behind a house. Below them „Wie genau weiss man das?“ SHALL open the fact sheet.

#### Scenario: Tips with the Moon up
- **WHEN** the list is shown for a moment with the Moon above the horizon
- **THEN** three tips are shown, including the one about the Moon

### Requirement: Fact sheet
„Wie genau weiss man das?“ SHALL open a fact sheet that closes with its close control or Escape and returns focus to the control that opened it. It SHALL explain when it is dark (the Sun 18° below the horizon; no such darkness in Hamburg from about the end of May to the end of July) and that planets and bright stars show earlier in twilight, why the Moon disturbs faint objects but not planets and bright stars, why stars twinkle and planets do not, that the darkness level is the user's own choice and does not know the street light next to them, why the band changes over the year, how many stars can be seen, that times and positions are calculated, not observed, and that clouds, haze and mountains are not known. It SHALL credit the sources of the place list, the star positions, the astronomy library and all pictures.

#### Scenario: Open and close the facts
- **WHEN** the user opens the fact sheet and presses Escape
- **THEN** the fact sheet closes and focus returns to „Wie genau weiss man das?“

### Requirement: Places outside Central Europe
For a place outside 45° to 56° North, or outside the longitudes of the place list, the page SHALL still show conditions, the list, positions, pictures, „Heute nicht zu sehen“, the tips and the facts, but instead of the steps „So findest du es“ each card SHALL show one calm sentence that a guide for this place does not exist yet.

#### Scenario: A place in the south
- **WHEN** the device location is at 40,42° N, 3,70° W
- **THEN** the list with positions is shown, and expanded cards say that a guide for this place does not exist yet

### Requirement: Two variants
The page SHALL exist in the free variant at its address and as an embeddable short variant for the guided journey's act 6 „Rausgehen“. The short variant SHALL show the closing line „Und all das kannst du sehen. Heute Nacht, über dir.“, the place (with a „Überspringen“ control while no place is chosen), then only the conditions, the summary sentence and the first three visible objects as collapsed cards, without the moment choice, and end with „Die Reise endet hier. Die Milchstrasse nicht.“ and a control that reports completion. Without a place it SHALL show „Such dir heute Nacht einen dunklen Platz, weg von Strassenlaternen, und schau nach oben.“

#### Scenario: Skip the place in the journey
- **WHEN** the short variant is shown and the user activates „Überspringen“
- **THEN** the sentence about finding a dark place is shown, followed by the closing line and the completion control

### Requirement: Privacy
The feature SHALL NOT send the place, the darkness level or any identifier anywhere; all calculations, the place list and the pictures SHALL work on the device without network requests beyond loading the app's own files. The device location SHALL only be requested after an explicit activation of „Meinen Standort verwenden“ and SHALL be stored only rounded. The page SHALL work offline once the app and its pictures are loaded.

#### Scenario: No network use
- **WHEN** a place is searched and chosen, the list is shown and a card is expanded
- **THEN** no request leaves the device besides the app's own files

### Requirement: Silence and motion
The page SHALL play no sound. Nothing SHALL move by itself. With reduced motion requested, cards SHALL expand and collapse without transitions.

#### Scenario: Reduced motion
- **WHEN** reduced motion is requested and the user expands a card
- **THEN** the card opens without animation

### Requirement: Accessibility
The page SHALL meet WCAG 2.1 AA and report zero automated accessibility (axe) violations without a place, with the place list open, with the darkness list open, with an expanded card, with the fact sheet open and in night mode. All controls SHALL be operable with the keyboard, have visible focus indicators and touch targets of at least 44 × 44 CSS px. The place field and the darkness choice SHALL be labelled comboboxes that expose whether their list is open and which option is active and chosen; the moment choice SHALL expose which moment is chosen; every card control SHALL expose whether it is expanded. Every photo SHALL have a text alternative that names what is marked; the thumbnails and figure drawings SHALL be decorative next to the object's name; position, eye sentence and steps SHALL be real text; the darkness dots SHALL be decorative next to their text.

#### Scenario: Automated check
- **WHEN** an axe scan is run without a place, with the place list and the darkness list open, with an expanded card and with the fact sheet open
- **THEN** it reports zero violations

### Requirement: Layout
The page SHALL be one column at most 34rem wide at every screen size and SHALL work from 320 px wide phones to desktop screens without horizontal scrolling. Pictures SHALL scale to the column width.

#### Scenario: Small phone
- **WHEN** the list with an expanded card is shown at 320 × 640 px
- **THEN** everything is in one column without horizontal scrolling

#### Scenario: Desktop
- **WHEN** the page is shown at 1440 × 900 px
- **THEN** the column is centred and at most 34rem wide
