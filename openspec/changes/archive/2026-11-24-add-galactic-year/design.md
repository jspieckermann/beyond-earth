## Context

The app is Angular 22 (standalone components, signals, `@Service`), Vitest + jsdom, Playwright + axe, with the night-sky tokens of `src/styles.css`. Modul A (`src/app/outward-journey/`) and Modul B (`src/app/light-speed-journey/`) have dedicated lazy routes; every other module still goes through the generic `module/:slug` placeholder route. At the start of this change "Das galaktische Jahr" existed in `home/data/modules.ts` under the letter `E` (slug `galaktisches-jahr`), and Modul A's stage data already linked its Milky Way fact sheet to that slug. `core/` provides what the module reuses: `ExplorationProgress`, `Haptics` (with the shared vibration setting), `LayoutMode`, `MATCH_MEDIA` and `FactSheet` (with `branches` by slug). Modul A's `OutwardJourney` already settles at a stage given by `?stufe=` and opens a close-up only if `?nah=` is a known body, so a stage-only return already works in code. `ZoomState` exposes `REDUCED_MOTION_QUERY` and `FRAME_SCHEDULER`. Project rules: no third-party requests, WCAG AA with zero axe violations, 85 % line coverage, lint clean, e2e for most requirements.

Behaviour is defined in `specs/galactic-year` and the three deltas; content comes from `concepts/Modul C Das galaktische Jahr.md`; the first look followed the canvas prototype "Modul E – Das galaktische Jahr · Prototyp" (24 Nov 2026) and changed through several reviews since. See proposal.md for scope and the recorded assumptions.

## Goals / Non-Goals

**Goals:**
- One pure engine for every number, every orbit and slider position and the Earth at any time, so the subject review can check the module with unit tests alone.
- The module is one calm page with signal state; the picture is one SVG overlay on the existing Milky Way image, so turning back never re-renders the image.
- Reuse Modul B's patterns (route page + embeddable component, `variant` input, `completed` output, settled-state announcements) so both modules feel and test the same.

**Non-Goals:**
- Canvas or WebGL rendering; the picture needs only an image, circles, arcs and paths.
- Paleogeographic data; the Earth globes are hand-drawn SVG paths (see proposal assumptions).
- A shared page or scene engine for future modules; extracting one waits until a second module needs it.

## Decisions

### 1. Feature structure and route
```
src/app/galactic-year/
  galactic-year-page.ts        route component: variant=freies-erkunden
  galactic-year.ts             embeddable component: input variant, output completed, page state
  data/stations.ts             the 24 stations (9 main, 15 in-between): rounds, texts, main-journey flag, Earth drawing
  data/earth-drawings.ts       fifteen geographies: outlines and regions (deserts, forests, mountains, ice, lava, rifts)
  data/scenes.ts               the two parts (titles) and their fact-sheet content, branch to das-unsichtbare
  engine/galactic.ts           pure: constants, distance and rounds, formatting
  engine/orbit.ts              pure: orbit geometry (Sun position, back arc, rings), slider ray and ruler, nearest station, pointer → rounds
  engine/earth.ts              pure: the Earth at any number of rounds, blended between two stations
  ui/galaxy-view.ts            image + SVG overlay (marker, direction arrow at today, orbit, arc, rings, drag handle)
  ui/earth-globe.ts            the small Earth of the past (SVG)
```
`app.routes.ts` gets `{ path: 'module/galaktisches-jahr', title, loadComponent }` before `module/:slug`, like A and B. Alternative: branching inside the placeholder page. Rejected as in Modul A and B (mixed concerns, not lazy).

### 2. Pure engine
`engine/galactic.ts` holds the speed (230 km/s), the galactic year (230 million years) and the year in seconds (365,25 days) in one constants object, so the concept's open question (230 vs. about 210 million years) changes one value. Functions: `distanceKm(years)`, `roundsIn(years)`, `yearsBack(rounds)`, `formatKm(km)` (de-DE; below a billion "N km", then "Milliarden Kilometer" with one decimal below ten billion and whole numbers above), `formatRounds(rounds)` (two significant digits), `formatTimeBack(rounds, long?)` ("vor 115 Mio. Jahren" / "vor 115 Millionen Jahren") and `formatRoundsBack(rounds)`. The spec's calculation table is a unit test.

### 3. Orbit geometry in normalized coordinates
`engine/orbit.ts` works in a 0–1 square matching the Milky Way image (galactic centre at 0,5/0,5; the Sun straight below the centre at Modul A's `SUN_IN_IMAGE`, radius about 0,19). `sunAt(rounds)` returns the position at angle `90° − rounds × 360°` (back in time runs counter-clockwise, against the galaxy's clockwise rotation in this view). `backArc(rounds)` returns an SVG arc for the fractional part (none for whole rounds); `ringRadii(completed)` returns one radius per round, each 0,005 further out and drawn clearly visible (starlight, 60 % opacity), so twenty rings lie close together like growth rings; the view passes `completedRounds(rounds)` from `galactic.ts`, the whole rounds the Sun had completed by the time shown (4,6 billion years minus the time back, ÷ 230 million years): 20 today, fewer further back, none at the formation. An earlier version counted the rounds turned back instead (none today); review found that backwards, since the Sun has already gone round about 20 times today. `formatCompleted` writes the line under the time ("Bis heute: rund 20 Runden um das Zentrum", "Bis dahin: 19 Runden um das Zentrum"). `roundsAtPointer` turns a pointer's angle into rounds, accumulating across full turns. The SVG uses `viewBox="0 0 1 1"` with `vector-effect: non-scaling-stroke`, so the same geometry fits the phone and the desktop picture. Alternative: pixel geometry per layout. Rejected: two sets of numbers to keep in step.

### 4. Time slider, ruler and snapping
The slider is a native `<input type="range">` from 0 to 1000 over the whole range (0 to 20 rounds, 0 to 3 in the main journey). It is one ray made of two linear parts (`SLIDER_STRETCH`: the first 5 rounds over 70 % of the width, 5 to 20 rounds over the rest); `sliderFraction`/`roundsAtFraction` and `sliderValue`/`roundsAtSlider` convert between rounds and position, and a slider that ends within 5 rounds is simply linear. Under it, `ruler(max)` gives quarter-round ticks and a label per round in the stretched part, a tick per round and a label every fifth round beyond, with "5" emphasised; the stations are dots at their true place, main stations larger.

History of this decision: an earlier version gave every station the same width, which read as an uneven scale ("¼" next to "½", "4" next to "16"); a fully linear ray crowded 13 stations into the first tenth of the width; a switchable "last 4 rounds" range and a separate fine slider for the first two rounds were dropped in favour of one ray. The stretch started at 60 % and was set to 70 % after review.

`input` updates only the shown time, the Sun's position and the texts; `change` (release) snaps to the nearest station. A `keydown` handler moves directly to the next or previous station (arrow keys), the next or previous main station (Page-Up, Page-Down) or the ends (Home, End), so the arrows never stop between stations; the slider's `aria-valuetext` is the station's or the interpolated time. Dragging the Sun in the picture feeds the same signal and snaps on `pointerup`. While the user moves the slider or drags the Sun (`following`), the dot of the nearest station, the one the Sun will snap to, is highlighted; otherwise the settled station is. Alternative: discrete stations only. Rejected: the concept wants the time to run while turning.

### 5. Page state and settled announcements
`GalacticYear` keeps `rounds`, `settled` (station), `following` (the user is moving and has not let go) and `factsOpen` (which part) in signals; the view model is `computed()`. Both parts are rendered at once; there is no scene state. A polite live region reads only settled values: the station's time and sentence when the Sun settles. While the Sun moves, the time, the texts of the closest station and the Earth change, but nothing is announced.

### 6. Picture
`GalaxyView` renders Modul A's `milky-way` image (`img/milky-way-960.webp` on phones, `-1920` on wide screens) and the SVG overlay; the arrow is drawn only while the Sun is at today's place. The Sun's label sits above the Sun in the lower half of the picture and to its left near the right edge, so it stays inside the picture and the globe never covers it. The picture is `position: sticky`, so it stays in view while the parts scroll. The image credit and kind come from Modul A's `credits.ts` (`milky-way`), so the fact sheet uses the same source text.

### 7. Earth globes as data
Each station carries an `EarthDrawing` (`ocean`, `land` colour, `landPath` and `details` from `data/earth-drawings.ts`, plus `iceNorth`/`iceSouth`). `earth-drawings.ts` holds fifteen geographies in a 100 × 100 box (today over the Atlantic, the Cretaceous with its inland sea, the narrow South Atlantic, Laurasia and Gondwana, Pangaea and its volcanic variant, the coal-forest world, Gondwana with and without forests, the assembling continents, Snowball Earth, Rodinia with its rift, early cratons, volcanic islands, the molten Earth); each has an outline and regions (desert, forest, mountains, ice, lava, rift) as filled paths. `EarthGlobe` draws the ocean with a soft depth gradient, each geography's coast as a lighter stroke under the land, the land and its regions, polar caps with an inner edge that curves towards the equator, a shading gradient and a thin atmosphere ring; the text alternative is the station's caption. They are the app's own sketches after textbook maps ("vereinfachte Zeichnung"); raster reconstructions were rejected because they need a source and licence. A unit test keeps every outline inside the globe.

### 8. Stations and the changing Earth
Fifteen in-between stations fill the gaps between the nine main stations (for example 252 million years for the great dying or 2,4 billion years for oxygen in the air), so the long stretches such as the one between 4 and 16 rounds have events. Arrow keys walk through all stations, the page keys only through the main ones.

The Earth is a function of the rounds: `earthAt(rounds)` finds the two neighbouring stations and returns the ocean colour mixed between them, the polar ice interpolated, and the land of both stations, each with its regions, with opacities `1 − t` and `t`. Morphing SVG paths was rejected: the land shapes have different numbers of points, and a cross-fade reads as drifting continents at this size.

The station texts (title, sentence, caption) always show the closest station and sit above the slider in rooms of fixed height (title one line; sentence and caption two lines, three where narrow phones need them, set with two media queries after measuring every station at each width), and the time never wraps, so the slider keeps its place while it is used; its label is visually hidden. An e2e test steps through all 24 stations at six widths from 320 to 1440 px and checks both the slider's position and that no text overflows. Earlier versions hid the sentence while the Sun moved, put the texts below the slider, and showed a line and a bar with the living things of the time; all made the page restless and were removed after review.

### 9. Shared pieces
- **Fact sheet:** `FactSheet` with `{ kicker: part name, facts, sources, branches }`, opened from a "Wie genau weiss man das?" control in each part; focus returns to that control. The "Eine Runde" sheet carries `{ label: 'Was hält die Sonne auf ihrer Bahn?', slug: 'das-unsichtbare' }`.
- **Haptics:** `Haptics.pulse()` when the Sun settles at a new station a whole number of rounds back.
- **Completion:** `ExplorationProgress.markExplored('C')` when the Sun first settles at a station one or more rounds back.
- **No buttons under the slider:** a magnifier, "Zurück nach heute", a share card (with its own card kind and picture) and a link back to Modul A were built and removed after review; the slider, dragging and the Home key bring the Sun back to today. A line and a share card with the distance since birth were removed too; the module does not read the birth year.

### 10. Variants
`variant = input<'freies-erkunden' | 'hauptreise'>()`, `completed = output<void>()`. `hauptreise` filters stations to `main: true` (today, 1, 2, 3), hides the fact branches, keeps the fact sheets, and ends the page with the closing line and "Weiter: Rausgehen", which emits `completed`.

### 11. Layout and look
Phone first: header (back link and title), then "Eine Runde", then the square picture (at most 44 % of the screen height, the globe in its lower-right corner), then "Zurückdrehen". The picture is sticky: once scrolled to, it stays at the top while "Zurückdrehen" with the slider scrolls beneath it. Upright tablets keep this order in one wider column. On wide screens (`LayoutMode` desktop, also tablets held sideways) a grid puts both parts in the left column and the picture, sticky, on the right across all rows. Earlier versions put the picture first on phones; after review the round's explanation comes first. Colours and type (Cormorant Garamond for times and lines, Inter otherwise) follow Modul A and B.

### 12. Module letters and the place on the home screen
"Das galaktische Jahr" is module C; "Licht als Zeitmaschine" moves to D and "Sterne zählen" to E. `MODULE_IDS` keeps A–F; only the catalogue entries in `home/data/modules.ts` and the module's `markExplored('C')` change. On the home screen the six places along the band stay where they are and the modules move into them in the order A, B, C, E, D, F; "Das galaktische Jahr" sits a little further left than its place's original x (210 instead of 223 of 390) so its long label fits on a 320 px phone. A shorter label ("Galaktisches Jahr") was rejected: axe requires the visible label to be part of the accessible name. `ExplorationProgress` moves explored states to `be.explored.v3` (see Migration Plan).

### 13. Testing
- **Unit:** `galactic.ts` against every row of the spec's calculation table; `orbit.ts` (Sun at today for whole rounds, opposite side at ½, arc empty for whole rounds, rings, slider ray and ruler, nearest station, pointer turns); `earth.ts` (station drawings, blending, outlines inside the globe); stations and facts against the spec; the progress migration from both older keys.
- **Component:** two parts on one page, "Eine Runde" explaining the Solar System's way and speed; nothing changes by itself; slider `change` snaps and announces once, `input` does not announce; arrow and page keys; the highlighted snap target while moving, after release and during the glide; rings show the rounds completed by the time shown (20 today, fewer further back) with the line under the time; no buttons under the slider; no distance since birth, also with a stored birth year; haptic pulse only at whole rounds; explored after one full round; hauptreise stations and `completed`; fact sheets per part with focus return and branch.
- **e2e** (phone, tablet, desktop): entry from home and from Modul A's branch; the two parts on one page and their order on phones and tablets; one round back shows the Pangaea caption; dragging the slider and the Sun; no buttons under the slider; the calm slider at six widths; axe with a fact sheet open and twenty rounds back; 320 × 640 with the picture in view while turning back; reduced motion; no third-party requests; home star explored; on the home screen the star order, labels inside and not overlapping, previews and axe.

## Risks / Trade-offs

- [230 km/s and 230 million years do not fit 26.000 light-years exactly] → One constants object; the fact sheet names the measured range; the subject review decides.
- [Hand-drawn globes read as scientific maps] → Called "vereinfachte Zeichnung" in the facts; shapes kept clearly schematic.
- [The Sun's position in the reconstruction is an estimate] → The marker position is Modul A's constant, so both modules agree.
- [Dragging along a circle is hard on small screens] → The slider is the primary control, dragging is optional; generous hit area around the Sun (48 px).
- [The stations of the last round crowd together on the slider] → The first five rounds are stretched; snapping, the arrow keys and the highlighted snap target keep them reachable.
- [The sticky picture takes room from the parts on small phones] → It is capped at 44 % of the screen height; the parts scroll beneath it.
- [Renumbering changes the meaning of stored letters again] → One-time migration to a new key, with unit tests for both older keys.

## Migration Plan

A dedicated route replaces the placeholder only for this module; the generic route still serves the others. The module letters change (C "Das galaktische Jahr", D "Licht als Zeitmaschine", E "Sterne zählen"), so explored states move to a new key `be.explored.v3`: on first read, `be.explored.v2` is mapped once (C→D, D→E, E→C) and removed, and a first-version `be.explored` is mapped straight to the current letters. The vibration setting (`be.journey`) is reused. The slugs stay, so links keep working. Rollback: reverting the commit brings back the placeholder and the old letters; the old code does not read `be.explored.v3`, so explored stars reset once, which is acceptable for a flag that only changes brightness.

## Open Questions

- Fine wording of the fact texts and the station captions after the subject review (no change to structure or behaviour).
