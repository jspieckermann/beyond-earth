## Context

The app is Angular 22 (standalone components, signals, `@Service`), Vitest + jsdom, Playwright + axe, with the night-sky tokens of `src/styles.css`. Modul A lives in `src/app/outward-journey/` with its own route; every other module still goes through the generic `module/:slug` placeholder route. The home screen's module data still uses the old letters and seven modules: A Reise nach draussen, B Sandkorn-Welt, C Reisen mit Lichtgeschwindigkeit (slug `lichtgeschwindigkeit`), D Licht als Zeitmaschine, E Sterne zählen, F Das galaktische Jahr, G Das Unsichtbare. `ExplorationProgress` stores explored modules by these letters under `be.explored`. The concept has since dropped the Sandkorn-Welt and renumbered the rest (B Lichtgeschwindigkeit, C Zeitmaschine, D Sterne zählen, E galaktisches Jahr, F Unsichtbares). `core/` already has `BirthYear`, `JourneySettings` (vibration), `ExplorationProgress`, `CLOCK`, `LayoutMode` and `ShareCard`/`ShareCardDialog`. Project rules: no third-party requests, WCAG AA with zero axe violations, 85 % line coverage, lint clean, e2e for most requirements.

Behaviour is defined in `specs/light-speed-journey` and the three deltas; content comes from `concepts/Modul B Reisen mit Lichtgeschwindigkeit.md`; the look follows the canvas prototype "Modul B – Reisen mit Lichtgeschwindigkeit · Prototyp" reviewed on 23 Nov 2026. See proposal.md for scope.

## Goals / Non-Goals

**Goals:**
- One pure calculation module that turns (destination, speed, today) into every number and sentence the result shows, so the subject review can check it with unit tests alone.
- Destinations stay in step with Modul A without duplicating its content: names and stages come from Modul A's data, only the travel distance and the reachability class are added.
- The planner is one screen with signal state; no new libraries.

**Non-Goals:**
- Acceleration, braking, energy, or a cosmological travel time for the far places (the spec fixes "mindestens" and "nie").
- Changing module slugs (addresses stay as they are; only the letters change).
- The guided journey itself (only the embeddable `hauptreise` variant, as in Modul A).

## Decisions

### 1. Feature structure and route
```
src/app/light-speed-journey/
  light-speed-page.ts          route component: variant=freies-erkunden, reads ?ziel=&von=&nah=
  light-speed-journey.ts       embeddable component: input variant, inputs destination/return, output completed
  data/destinations.ts         destination list: id, Modul A body/stage reference, distance, reachability
  engine/travel.ts             pure: durations, generations, arrival year, outcome, history anchor, figures
  engine/speed-scale.ts        pure: slider position <-> fraction of c, clamping, presets
  engine/format.ts             pure: durations in the familiar unit, percentages, km/s (de-DE)
  ui/destination-picker.ts     grouped, searchable list in a dialog
  ui/speed-control.ts          slider, number field, presets, km/s line, light-speed hint
  ui/arrival.ts                numbers, figures, anchor, outcome sentence, birth-year line, share
```
`app.routes.ts` gets `{ path: 'module/lichtgeschwindigkeit', title, loadComponent }` before `module/:slug`, like Modul A. Alternative: branching inside the placeholder page. Rejected for the same reason as in Modul A (mixed concerns, not lazy).

### 2. Destinations reuse Modul A's data
`destinations.ts` lists one entry per place: its `id` (Modul A's `BodyId` or stage id), the Modul A stage it belongs to, and either a distance in light-years, `here` (already there) or `never` (beyond the cosmic event horizon), plus a `lowerBound` flag for the three far but reachable places. Names, groups and the Modul A distance label are read from `STAGES` and `findBody`, so a renamed object stays consistent. Planet distances are the closest approaches from the concept, not Modul A's distance to the Sun. A unit test fails when Modul A gains a selectable object without a destination. Alternative: copying names and distances into Modul B. Rejected because the two lists would drift.

### 3. Pure travel calculation
`travel(destination, beta, now, birthYear?)` returns `{ kind: 'here' | 'never' | 'journey', earthYears, boardYears, generationsBoard, generationsEarth, arrivalYear?, lowerBound, outcome, anchor?, figures: { count, unit }, birthLine? }`.
- `earthYears = ly / beta`, `boardYears = earthYears * sqrt(1 - beta²)`; for `beta` up to 0.999999 plain doubles are precise enough (`1 - beta²` ≈ 2·10⁻⁶).
- `generations(y) = y <= 50 ? 1 : ceil(y / 25)`.
- Outcome rules exactly as the spec's table, evaluated in that order.
- History anchor: the nearest anchor by `|log(g / anchor)|`; above 30.000 the "longer than our species" sentence.
- Figures: `unit = 10^k` with the smallest `k` so that `ceil(g / unit) <= 20`.
- Birth-year line: `elapsed = now − 1 July of the birth year` (as in Modul A's age); "already arrived" if `elapsed >= earthYears`, else the fraction travelled.
Constants (25 years, 50-year threshold, anchors, presets) live in one data object, so the open questions of the concept (for example 30 years per generation) change one value.

### 4. Speed scale
The slider is a native `<input type="range" min=0 max=1000>`. Positions 0–600 map logarithmically to 0,001 %–10 %, positions 600–1000 map the ratio `beta / (1 − beta)` logarithmically from 1/9 to 999.999 (10 %–99,9999 %), so 10 %–50 % gets fine steps and the top still has room for 99 %, 99,9 % … 99,9999 %. The number field parses German decimals ("0,5"), clamps to the range and shows the light-speed hint when clamped at the top. Presets set `beta` directly and are marked pressed when they match. Alternative: a linear slider with a separate "precision" control. Rejected; the prototype showed the logarithmic slider is enough.

### 5. State, recalculation and announcements
The planner keeps `destination` and `beta` in signals; the result is a `computed()` of the pure calculation, so every change recalculates at once. The live region and the haptic pulse react to a separate `settledResult` signal that updates on destination change, preset, number-field commit or slider `change` (release), not on every `input` event. This keeps the screen reader and the vibration quiet while dragging.

### 6. Round trip with Modul A
Modul A's close-up gets a "Wie lange bräuchte ich dorthin?" link to `/module/lichtgeschwindigkeit?ziel=<bodyId>&von=<stageId>`. Modul B shows "Zurück zu <Name>" linking to `/module/reise-nach-draussen?stufe=<stageId>&nah=<bodyId>`. `OutwardJourneyPage` reads these parameters and asks `ZoomState` to settle at that stage without a flight (a new `settleAt(stage)`, the same as the reduced-motion path) and opens the close-up via `JourneyUi.planet`. Unknown values fall back to the normal start. The light-time branch in the solar-system facts links with `?ziel=proxima`. Alternative: keeping Modul A alive in the background with a shared shell. Rejected as a much larger change; the query parameters are enough for one return step.

### 7. Shared pieces
- **Fact sheet:** Modul A's `FactSheet` takes `{ kicker, facts, credits, branches }`; Modul B passes its calculation facts with an empty credits list. If the component turns out too Modul-A-specific, it moves to `core/` in this change.
- **Haptics:** `Haptics` moves from `outward-journey/` to `core/`, since both modules use it with the shared vibration setting.
- **Share card:** `CardKind` gains `reise` with data `{ destination, percent, duration, generations }`; `cardText` builds the sentence of the share-cards delta. The card also shows the destination's picture (`CardPicture`): Modul A's photo, or its surface texture drawn as a sphere with the close-up's renderer (stars: the tinted Sun texture, credited to it). A credit line with source and licence sits above the app name, since most pictures are CC BY. The picture is loaded before the dialog opens; without it the card keeps its sentence-only layout.
- **Completion:** the module is `B` in `ExplorationProgress` (see Decision 10); marking happens on the first settled `journey` result.

### 8. Variants
`LightSpeedJourney` takes `variant = input<'freies-erkunden' | 'hauptreise'>()` and `completed = output<void>()`. `hauptreise` fixes the destination to Proxima Centauri, hides the picker, slider, number field, share and birth-year line, and steps through 0,0057 %, 20 % and 99 % with "Weiter", emitting `completed` after the third.

### 9. Layout and look
Phone first (390 × 844 prototype): header, destination card, speed block, arrival, all in one scrolling column. Upright tablets keep the one column, wider, so the steps fill the tall screen; on wide screens (`LayoutMode` desktop: desktops and tablets held sideways), destination and speed sit in a left column and the arrival in a right column. Colours, type (Cormorant Garamond for the outcome sentence, Inter otherwise) and spacing follow Modul A's tokens. There is no animated journey picture: an earlier line with a point of light beside a light beam was removed after review, so nothing on the screen moves by itself. In the arrival, the time on board comes first, like the generations below it.

### 10. Module letters, migration and six stars
- **Ids:** `MODULE_IDS` becomes `['A', 'B', 'C', 'D', 'E', 'F']` with the concept's meaning; `home/data/modules.ts` loses the Sandkorn entry and reassigns the letters. Slugs stay (`lichtgeschwindigkeit`, `zeitmaschine`, `sterne-zaehlen`, `galaktisches-jahr`, `das-unsichtbare`), so links and placeholder routes keep working; `sandkorn-welt` becomes an unknown slug and the existing `knownModule` guard sends it home.
- **Migration:** the letters' meaning changes, so explored states move to a new key `be.explored.v2`. On first read, if only the old key `be.explored` exists, its letters are mapped once (old A→A, C→B, D→C, E→D, F→E, G→F; old B, the Sandkorn-Welt, is dropped), written to the new key and the old key is removed. Alternative: keeping the old letters internally and mapping only for display. Rejected because the user asked for B internally, and a mapping layer would stay forever. Alternative: reusing the old key. Rejected because an unmigrated "B" would light up the wrong star.
- **Six stars:** the band keeps its geometry; the six stars are spread along it in the concept's journey order A, B, D, C, F, E, with new positions for phone (sky-stage coordinates) and tablet/desktop (normalized). The existing layout tests (labels not overlapping, previews not covering stars, 44 px targets) guard the new positions.
- **Modul A:** the stage data drops the "Wie leer ist das wirklich?" branch; any other reference to old letters in code or tests follows the new scheme.

### 11. Testing
- **Unit:** `travel` and `speed-scale` against every value of the spec tables, the outcome order, figures and anchors, birth-year line, clamping and parsing; destination completeness against Modul A; `cardText('reise')`; Modul A's return parameters.
- **Component:** picker search and grouping, presets, settled-result announcement, hauptreise steps.
- **e2e** (phone, tablet, desktop): entry from home; choose destination and preset; the Proxima/Voyager and Sagittarius A*/99,9999 % values; TON 618 "Nie"; round trip Andromeda ↔ Modul A; share card download; axe with list and facts open; 320 × 640; no third-party requests; home star explored.

## Risks / Trade-offs

- [The simple calculation is read as real mission planning] → The fact sheet states every simplification; lower bounds and "nie" for the far places.
- [Destinations drift from Modul A] → Shared names and a completeness test (Decision 2).
- [Slider precision near 99,9999 %] → The logarithmic upper half plus the number field; presets for the key values.
- [Renumbering changes the meaning of stored letters] → One-time migration to a new storage key (Decision 10), with unit tests for every old letter, the dropped Sandkorn flag, an already migrated store and unavailable storage.
- [Six stars change the home layout that earlier changes tuned] → New positions are checked by the existing layout e2e (no overlaps, previews never cover stars, nothing cut off) on all six viewport sizes.
- [Query-parameter return breaks if Modul A changes ids] → The return uses the same ids as the destination list, and the completeness test covers both.

## Migration Plan

A dedicated route replaces the placeholder only for this module; the generic route still serves the others. Explored states move from `be.explored` (old letters) to `be.explored.v2` (new letters) on first read; the birth year (`be.birthYear`) and vibration (`be.journey`) are reused. Rollback: reverting the commit restores the old code, which ignores `be.explored.v2`; users would see their explored stars reset once, which is acceptable for a flag that only changes brightness.

## Open Questions

- The concept's open questions (30 instead of 25 years per generation, today's planet distances, an acceleration option) change only constants or later changes; the spec values above use the concept's current choices.
