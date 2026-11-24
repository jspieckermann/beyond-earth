## 1. Route and skeleton

- [x] 1.1 Add the dedicated lazy route `module/galaktisches-jahr` (title "Das galaktische Jahr · Die Milchstrasse erleben") before `module/:slug`; verify the routing unit test resolves it to the new page while other module slugs (e.g. `das-unsichtbare`) still resolve to the placeholder
- [x] 1.2 Create `GalacticYearPage` (variant `freies-erkunden`) and the embeddable `GalacticYear` (input `variant`, output `completed`) with the main heading, focus on entry and "Zurück zum Himmel"; verify component tests for focus, back link and the two part headings
- [x] 1.3 Update the home-screen e2e for the modified "Placeholder destinations" requirement ("Eintauchen" on "Das galaktische Jahr" opens Modul C, "Das Unsichtbare" is still a placeholder); verify `npm run e2e -- home` passes

## 2. Pure engine

- [x] 2.1 Implement `engine/galactic.ts` (constants object, distance and rounds, `formatKm` in de-DE with "Milliarden Kilometer" from 1 billion, rounds with two significant digits, time back short and long); verify unit tests reproduce every row of the spec's calculation table
- [x] 2.2 Implement `engine/orbit.ts` (normalized Sun position by rounds, back arc for the fractional part, ring radii, nearest station, pointer angle → rounds accumulating across turns and clamped); verify unit tests: whole rounds put the Sun at today's place, ½ round at the opposite side, no arc for whole rounds, twenty rings for twenty completed rounds, the nearest station
- [x] 2.3 Write `data/stations.ts` (the nine main stations with rounds, time text, rounds text, sentence, caption, main-journey flag and Earth drawing) and `data/scenes.ts` (the parts, facts per part, sources from Modul A's `milky-way` credit, branch "Was hält die Sonne auf ihrer Bahn?" → `das-unsichtbare`); verify a unit test that the texts match the spec's station table and that the main-journey stations are today, 1, 2 and 3 rounds

## 3. Picture

- [x] 3.1 Build `GalaxyView`: the Milky Way image (960 px on phones, 1920 px on wide screens) with the SVG overlay in a normalized viewBox (Earth marker, direction arrow at today, dashed orbit, bright back arc, rings) and a text alternative; verify component tests for the elements and the alternative text
- [x] 3.2 Keep the picture in view while the page scrolls (sticky) and keep the Sun's label clear of the globe; verify the e2e at 320 × 640 with picture, globe and slider in view together
- [x] 3.3 Build `EarthGlobe` with detailed drawings (`data/earth-drawings.ts`: fifteen geographies with outlines and regions such as deserts, forests, mountains, ice, lava and rifts; coasts, ocean depth, curved polar caps, atmosphere); verify unit tests that every outline lies inside the globe, today shows its regions and landscapes fade with their land, and component tests for one continent at one round back and almost all ice at three rounds back
- [x] 3.4 Build a magnifier for human history (built and removed after review, together with its button)

## 4. Scenes and interaction

- [x] 4.1 Put the two parts (Eine Runde, Zurückdrehen) on one page with their texts and nothing changing by itself; "Eine Runde" explains that one round is the way of the whole Solar System around the centre at about 230 km/s; no part "Spüren" and no distance counter; verify component tests for the headings, the explanation and that nothing changes without input
- [x] 4.3 Implement the time slider (input moves time and Sun only, release snaps to the nearest station, arrow/Home/End keys step stations, value text names the time) and the settled announcement of time and sentence; verify component tests that dragging does not announce, release snaps and announces once, Arrow-Right moves one station back
- [x] 4.4 Implement dragging the Sun along the orbit with pointer events (hit area at least 44 px, snap on release, glide or jump under reduced motion); verify a component test with simulated pointer events and an e2e drag on the phone layout
- [x] 4.5 Draw one fine ring per round the Sun had completed by the time shown (20 today, fewer when turning back, none at the formation; rings close together) and show the line "Bis heute: rund 20 Runden um das Zentrum" / "Bis dahin: … Runden um das Zentrum" under the rounds back; verify unit tests for `completedRounds` and `formatCompleted`, component tests for 17, 18 and 20 rings and an e2e check for 19 rings at one round back
- [x] 4.6 Offer no buttons under the slider besides the facts (sharing, the link to Modul A, "Zurück nach heute" and the magnifier were built and removed after review); mark module `C` explored when the Sun first settles one or more rounds back; verify component tests that the buttons are gone and for `ExplorationProgress`
- [x] 4.7 Add a fact sheet per part with its opener "Wie genau weiss man das?" and focus return; verify component tests for the content of "Eine Runde" (230 vs. 210–250 million years) and "Zurückdrehen" (drawings, picture source) and the branch to "Das Unsichtbare"
- [x] 4.8 Add the haptic pulse when the Sun settles at a whole round (1, 2, 3, 4, 16, 20) and no other vibration; verify component tests for 460 million years (one pulse) and 115 million years (none)

## 5. Sharing

- [x] 5.1 Show no distance since birth and no age in galactic years, also with a stored birth year (tried and removed after review); verify a component test with a stored birth year
- [x] 5.2 Share card for the galactic year (built and removed after review); verify that no card kind is left for it

## 6. Variants and Modul A

- [x] 6.1 Implement the `hauptreise` variant (stations today, 1, 2, 3; no share or branch; closing line and "Weiter: Rausgehen" emitting `completed`); verify component tests for the stations and the output
- [x] 6.2 Add a test for Modul A's stage-only return (`?stufe=milchstrasse` rests at "Die ganze Milchstrasse" without a close-up, focus on the heading; a known stage with an unknown close-up rests there without a close-up); verify the Modul A page tests pass

## 7. Layout

- [x] 7.1 Lay out phone and upright tablet ("Eine Runde", the picture with the globe in its corner, "Zurückdrehen") and desktop or sideways tablet (parts on the left, picture on the right) with the tokens of Modul A and B; verify an e2e at 320 × 640 in "Zurückdrehen" and at 1440 × 900 without horizontal scrolling and with nothing cut off

## 8. Integration and quality

- [x] 8.1 Write the e2e for Modul C: entry from home and from Modul A's branch, the two parts on one page, one round back with the Pangaea caption, dragging, no buttons under the slider, reduced motion, explored star on the home screen; verify `npm run e2e` passes on phone, tablet and desktop
- [x] 8.2 Add axe scans of the page with a fact sheet open and twenty rounds back, plus a request-origin check; verify zero violations and only same-origin requests
- [x] 8.3 Run `npm run lint`, `npm run test:coverage` and `npm run build`; verify zero lint errors, at least 85 % line coverage, and a successful build with the new route in its own lazy chunk

## 9. Finer stations and a changing Earth

- [x] 9.1 Add fifteen in-between stations (`kind: 'zwischen'`) with title, sentence, caption and Earth drawing between the nine main stations; verify unit tests for their times, order and titles
- [x] 9.2 Move through all stations with the arrow keys and from main station to main station with Page-Up and Page-Down; verify component tests for the keys
- [x] 9.3 Blend the Earth continuously between neighbouring stations (`engine/earth.ts`: fading land, ocean colour, smooth ice) and show it on the globe while the Sun moves; verify unit tests for the blend and component and e2e tests for two land layers while moving
- [x] 9.4 Show the title, sentence and caption of the closest station at all times, also while the Sun moves, without announcing them; verify component tests while moving and at rest
- [x] 9.5 Make the slider linear in time over all 20 rounds (3 in the main journey) with a ruler and the stations as dots at their true place (refined by 9.6); verify unit tests for `sliderValue`, `roundsAtSlider` and `ruler`, and component tests for the labels, the dot positions and the highlighted station
- [x] 9.6 Stretch the first 5 rounds over 70 % of the slider (two linear parts on one ray, `SLIDER_STRETCH`), with quarter-round ticks and a label per round up to 5 and an emphasised "5"; keep a slider of at most 5 rounds simply linear; verify unit tests for `sliderFraction`, `roundsAtFraction`, `sliderValue`, `roundsAtSlider` and `ruler`, and component tests for the labels, the 14 % position of one round and the emphasised "5"
- [x] 9.7 Keep the slider calm: put the station texts above it in rooms of fixed height (time on one line, title one line, sentence and caption two lines, three on narrow phones) with little space to the slider, give it a visually hidden label, and let no text disappear while it is used; verify a component test that no text is hidden while moving and an e2e test at six widths from 320 to 1440 px that the slider keeps its height and no text overflows on all 24 stations
- [x] 9.8 Highlight the dot of the station the Sun will snap to while the slider moves or the Sun is dragged, and keep it highlighted while the Sun glides there; verify a component test while moving, after release and during the glide, and an e2e check while dragging
- [x] 9.9 Order phones and tablets as "Eine Runde", the picture, "Zurückdrehen" (the picture sticky once reached), keep the desktop with the parts on the left and the picture on the right; verify an e2e test for the order on phone and tablet and the desktop layout test

## 10. Module letters and home screen

- [x] 10.1 Make "Das galaktische Jahr" module C, "Licht als Zeitmaschine" D and "Sterne zählen" E in the catalogue, the module and the concepts; verify the module data and home tests with the new letters
- [x] 10.2 Migrate stored progress to `be.explored.v3` (from v2: C→D, D→E, E→C; from the first version straight to the current letters); verify unit tests for both migrations
- [x] 10.3 Put "Das galaktische Jahr" between "Reisen mit Lichtgeschwindigkeit" and "Sterne zählen" on the home screen (order A, B, C, E, D, F), with its star a little further left so its label fits at 320 px; verify the home e2e for order, labels inside and not overlapping, previews and axe on all viewports
