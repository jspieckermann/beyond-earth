## 1. Route and skeleton

- [x] 1.1 Add the dedicated lazy route `module/lichtgeschwindigkeit` (title "Reisen mit Lichtgeschwindigkeit · Die Milchstrasse erleben") before `module/:slug`; verify the routing unit test resolves it to the new page while other module slugs still resolve to the placeholder
- [x] 1.2 Create `LightSpeedPage` (variant `freies-erkunden`, reads `ziel`, `von`, `nah` from the query) and the embeddable `LightSpeedJourney` (input `variant`, output `completed`) with the main heading, focus on entry and "Zurück zum Himmel"; verify component tests for focus, back link and the default start (Proxima Centauri, 10 %)
- [x] 1.3 Update the home-screen e2e for the modified "Placeholder destinations" requirement ("Eintauchen" on "Reisen mit Lichtgeschwindigkeit" opens the planner, "Das Unsichtbare" is still a placeholder); verify `npm run e2e -- home` passes

## 2. Module letters and removal of the Sandkorn-Welt

- [x] 2.1 Change `MODULE_IDS` to A–F and rewrite `home/data/modules.ts` with six modules in the concept's letters (B Lichtgeschwindigkeit, C Zeitmaschine, D Sterne zählen, E galaktisches Jahr, F Unsichtbares) and journey order A, B, D, C, F, E, without the Sandkorn-Welt, keeping all slugs; verify the module data tests (six modules, order, unique slugs, `sandkorn-welt` unknown)
- [x] 2.2 Migrate explored states from `be.explored` (old letters) to `be.explored.v2` (new letters, Sandkorn dropped, old key removed) in `ExplorationProgress`; verify unit tests for every old letter, the dropped Sandkorn flag, an already migrated store and unavailable storage
- [x] 2.3 Place the six stars along the band for phone and tablet/desktop; verify the home layout e2e (no overlapping labels, previews never cover stars, nothing cut off, 44 px targets) on all six viewport sizes
- [x] 2.4 Remove the "Wie leer ist das wirklich?" branch from Modul A's stage data and update every test and e2e that used "Die Sandkorn-Welt" or old module letters (home tests, constellation, preview, Modul A data and branch e2e); verify `npm test` and the home and Modul A e2e pass and no reference to "Sandkorn-Welt" remains in `src/` and `e2e/`
- [x] 2.5 Update the Purpose of `openspec/specs/home-screen/spec.md` from seven to six experience modules (a delta cannot change it); verify `openspec validate --specs --strict` passes

## 3. Pure engine

- [x] 3.1 Implement `engine/format.ts` (durations in Sekunden … Mrd. Jahre, percentages, km/s in de-DE); verify unit tests for each unit boundary and the spec's strings
- [x] 3.2 Implement `engine/speed-scale.ts` (slider position ↔ fraction of c in two logarithmic halves, German number parsing, clamping to 0,001 %–99,9999 %, presets); verify unit tests for round trips, both ends, "100" → 99,9999 % and the preset values
- [x] 3.3 Implement `engine/travel.ts` (Earth and board time, generations, arrival year, `here`/`never`/lower bound, outcome order, history anchor, figure unit, birth-year line) with its constants in one data object; verify unit tests reproduce every row of the spec's calculation table, the Moon and Geschosshaufen cases, every outcome sentence and the 1996 birth-year scenario

## 4. Destinations

- [x] 4.1 Write `data/destinations.ts` (all places of Modul A with stage, distance or `here`/`never`, lower-bound flag, closest-approach distances for planets) reading names and groups from Modul A's data; verify a test that every selectable object and stage of Modul A has a destination and the far places are classified as in the spec
- [x] 4.2 Move `Haptics` from `outward-journey/` to `core/` and update its imports; verify the existing haptics tests and Modul A's tests still pass

## 5. Planner UI

- [x] 5.1 Build the destination card and `DestinationPicker` (dialog, grouped by Modul A stages, search by name, distance labels, planet note, focus return); verify component tests for grouping, "andro" → Andromeda only, choosing Mars shows the closest-approach note, Escape closes
- [x] 5.2 Build `SpeedControl` (logarithmic slider with value text, number field, presets with pressed state, km/s line, light-speed hint); verify component tests for preset Voyager 1 → 0,0057 % and about 17 km/s, typing "100" → 99,9999 % with the hint, Arrow-Right raises the speed
- [x] 5.3 No animated journey picture (removed after review); show the time on board before the time on Earth in the arrival; verify a component test for the order and that no journey picture is rendered
- [x] 5.4 Build `Arrival` (four numbers, arrival year, figures with legend and text alternative, history anchor, outcome sentence, lower-bound note, "here" and "never" states); verify component tests for Proxima at 1 % (17 figures, Galilei), Proxima at 0,0057 % (≤ 20 figures, legend), Sagittarius A* at 99,9999 %, Orion arm and TON 618
- [x] 5.5 Wire the settled result: live-region announcement and one haptic pulse only after a destination change, preset, number commit or slider release, and mark module `B` explored on the first journey result; verify component tests that dragging does not announce and that `ExplorationProgress` marks the module
- [x] 5.6 Add the fact sheet (calculation, simplifications, 25 years per generation, closest approach, expansion of space, sources of the Voyager speed and the project targets), reusing Modul A's `FactSheet` or moving it to `core/`; verify a component test for the content and focus return
- [x] 5.7 Lay out phone (one column) and upright tablet (one wide column) and desktop or sideways tablet (two columns) with Modul A's tokens; verify an e2e at 320 × 640 and 1440 × 900 without horizontal scrolling and with all three steps readable

## 6. Birth year and sharing

- [x] 6.1 Show the birth-year line when a birth year is stored, never ask for it; verify component tests with and without a stored year
- [x] 6.2 Add the `reise` card kind to `cardText` (one generation, lower bound), with the destination's picture from Modul A and its credit line, and wire "Bild teilen" to the share dialog; verify unit tests for the spec's two card sentences and a component test that the dialog opens with the travel card

## 7. Modul A round trip

- [x] 7.1 Add "Wie lange bräuchte ich dorthin?" to every close-up in Modul A (free exploration only) linking to the planner with `ziel` and `von`, and point the solar-system light-time branch at the planner with Proxima Centauri; verify Modul A component tests for the link targets
- [x] 7.2 Let `OutwardJourneyPage` read `stufe` and `nah`, settle at that stage without a flight (`ZoomState.settleAt`) and open the close-up with focus on its back control; fall back to "Die Erde" for unknown values; verify zoom-state and page tests
- [x] 7.3 Show "Zurück zu <Name>" in the planner when opened from Modul A; verify an e2e round trip Andromeda → planner → Modul A with the Andromeda close-up open

## 8. Main-journey variant

- [x] 8.1 Implement the `hauptreise` variant (Proxima Centauri fixed, 0,0057 % → 20 % → 99 % with "Weiter", `completed` after the third, no picker, slider, share or birth-year line); verify a component test for the three steps and the output

## 9. Integration and quality

- [x] 9.1 Write the e2e for the planner: entry from home, destination and preset choice, the Proxima/Voyager and Sagittarius A*/99,9999 % values, TON 618 "Nie", share-card download, explored star on the home screen; verify `npm run e2e` passes on phone, tablet and desktop
- [x] 9.2 Add axe scans of the planner with the destination list and the fact sheet open, plus a request-origin check; verify zero violations and only same-origin requests
- [x] 9.3 Run `npm run lint`, `npm run test:coverage` and `npm run build`; verify zero lint errors, ≥ 85 % line coverage, and a successful build with the new route in its own lazy chunk
