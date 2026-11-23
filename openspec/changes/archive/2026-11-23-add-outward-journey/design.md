## Context

The app is Angular 22 with standalone components, signals and `@Service`. It uses Vitest + jsdom, Playwright + axe, Tailwind 4, and dark tokens in `src/styles.css`. The home screen links Modul A to `/module/reise-nach-draussen`, which before this change was served by the generic `module/:slug` placeholder route. `core/` already has `LocalStore` (failure-tolerant localStorage), `ExplorationProgress.markExplored()`, `CLOCK` and `LayoutMode`. Project rules: no third-party requests, WCAG AA with zero axe violations, 85 % line coverage, lint clean, and e2e for most requirements.

The behaviour is defined in `specs/outward-journey` and `specs/share-cards`. The content comes from `concepts/Modul A Die Reise nach draussen.md`. The interaction model started from the interactive mockup (`ModulA.html`, reviewed 20 Nov 2026) and was refined in review sessions since (see "Changes after the first review" below). See proposal.md for scope.

## Goals / Non-Goals

**Goals:**
- One zoom engine: a single continuous number `z` drives every layer, the Earth position, the texts, the distance readout, the scale bar and snapping. It is pure and testable.
- Content as data. Stage, planet and object texts, facts, distances, image references and credits live in typed data files, so the subject review ("Fachprüfung") can change them without touching components.
- Rendering stays thin and swappable, so a picture can be replaced without touching the engine.

**Non-Goals:**
- The guided journey "Die Reise" itself. This change only provides the `hauptreise` variant and a completion output it can embed later.
- Physically true scale between stages. The seven stages are compressed visually (see Decision 2). The true values appear in the distance readout and the facts.
- Sound of any kind (see Decision 9).
- WebGL or three.js.

## Decisions

### 1. Feature structure and route
```
src/app/outward-journey/
  outward-journey-page.ts        route component: variant=freies-erkunden
  outward-journey.ts             embeddable component: input variant, output completed, haptic pulse on snap
  journey-ui.ts                  per-journey UI state (open close-up, facts, planets in the gap, Earth turn)
  haptics.ts                     one vibration pulse per snap
  engine/zoom-state.ts           @Injectable (component-provided): z signal, flights, snapping, phases
  engine/zoom-math.ts            pure: layer scale/opacity, Earth path, distance interpolation, snap target, flight pace
  engine/format.ts               pure: distance + light time in de-DE
  engine/age.ts, sun-position.ts pure helpers
  data/stages.ts                 7 stages: texts, facts, distances, earthOffset, alt, credits, branches
  data/planets.ts                planets, moons, Moon, Sun, Voyager 1, neighbouring stars, Milky Way parts,
                                 Local Group galaxies, places of the universe (all as close-up bodies)
  data/credits.ts                credits and the files each credit stands for
  scene/journey-scene.ts         hosts the seven layer components and applies transform/opacity from the engine
  scene/layers/near-layers.ts    Earth, Earth–Moon, solar system
  scene/layers/star-layers.ts    neighbouring star systems
  scene/layers/galaxy-layers.ts  Milky Way, Local Group, universe (with their marks)
  scene/layers/earth-globe.ts    the Earth sphere (day/night, time-lapse turn)
  scene/layers/body-globe.ts     small textured spheres: Moon, Sun, planets
  scene/orion-sky.ts             the star field between the neighbouring stars and the Milky Way
  scene/sphere-renderer.ts       Canvas 2D orthographic texture mapping, sunlight, precomputed lighting
  scene/star-renderer.ts         Canvas 2D star points seen from a moving camera
  ui/stage-text.ts               title, line, Aha, fact control, branch, home control
  ui/fact-sheet.ts               translucent sheet, focus handling, fact branches
  ui/scale-bar.ts                stage buttons, marker, vertical range input
  ui/distance-readout.ts         corner readout + large centred transit value
  ui/earth-marker.ts             glowing point, edge clamping, direction hint, Earth close-up from far away
  ui/planet-closeup.ts           sphere or picture, rotation, moons, age, share
  ui/birth-year-form.ts          Signal Forms, 1900..current year
  ui/journey-end.ts              home line + three paths (or "Weiter" in hauptreise)
  ui/journey-controls.ts         "Weitere Einstellungen" with the vibration setting
  ui/credits-dialog.ts           "Bildnachweise"
  input/zoom-input.ts            directive: wheel, drag, pinch, keys -> engine deltas + release
src/app/core/
  birth-year.ts                  @Service, be.birthYear (reused by Modul D later)
  journey-settings.ts            @Service, be.journey { vibration }
  share-card.ts, share-card-dialog.ts
```
`app.routes.ts` gets `{ path: 'module/reise-nach-draussen', title, loadComponent }` before `module/:slug`. That keeps the generic route for B–G and lazy-loads A on its own. Alternative: branching inside the placeholder page. Rejected because it mixes concerns and is not lazy.

### 2. Zoom model: one number, compressed stages
- `z ∈ [0, 6]` is the zoom position. Integer `n` is stage `n + 1`, from Erde (0) to Universum (6).
- **Layer per stage.** Layer `n` is drawn in its own local units and rendered with `scale = 6^(n − z)` and `opacity = clamp(1 − |n − z| · 1.6)`. Labels and marks fade faster (`1 − |n − z| · 4`) so they never grow huge in flight. The factor 6 per stage is a visual compression: real neighbouring stages differ by 30× to 10,000×. A true scale would make every stage but one invisible on a phone. The honest numbers are in the readout and the facts.
- **Distance.** `log10(d)` is interpolated linearly between the stage distances (`stages[n].distanceM`), so the readout is continuous and exact at rest.
- **Earth path.** Every stage declares where the Earth sits relative to the focus point (`earthOffset`, in base units). All layers are anchored to the Earth position interpolated with smoothstep. At the Milky Way the Earth sits a little below the focus, so the arms around it stay clear of the texts.
- **Snapping.** On release (wheel idle 240 ms, pointer up, range change) the target is the nearest stage, biased towards the direction of the last movement once the user has moved more than 0.08 past a stage. A flight lasts 900 ms per stage (at least 600 ms) with ease-in-out. The stretch between z = 2 and 3 (solar system ↔ neighbouring stars) takes 7 s and moves linearly, which is the stretched emptiness. A new input cancels a running flight.
- **Phases** (`atStage | moving | returning`). Texts are visible only in `atStage`; the Aha shows at once with title and line (no timer). At the universe the texts and the home control appear at once too: the earlier 4 s still hold was removed after review, because it read as a delay. `returning` is the return flight from 6 to 0, which the user starts: 600 ms per stage and 6 s through the emptiness, about 9 s in total.
These are pure functions in `zoom-math.ts` with an injectable frame scheduler and timers, so all of it is unit-testable. Alternative: separate scenes with transitions. Rejected because it is exactly the screen-by-screen feeling the user rejected.

### 3. Input
The `zoomInput` directive on the scene:
- **Wheel:** `z += deltaY · 0.0025`, with `passive: false` and `preventDefault` only on the scene.
- **One-pointer vertical drag:** `z += Δy · 0.008`, up = out.
- **Pinch:** `z −= log(distRatio) · 1.6`, spreading = in.
- **Keys** via `host` bindings: Arrow-Up/Page-Down/+ fly one stage out, Arrow-Down/Page-Up/− fly one stage in. Keys are ignored while focus is in the birth-year field or on a rotatable planet.
- **Scale bar:** a native vertical `<input type="range" min=0 max=6 step=0.01>` styled transparent over the bar for dragging, plus seven real buttons for the stage names.
The scene uses `touch-action: none`. Single-tap alternatives exist for everything (WCAG 2.5.1).

### 4. Rendering
- **Images** (Voyager, EHT Sagittarius A*, Milky Way reconstruction, cosmic web, and the pictures of the close-ups) are `<img>` with `NgOptimizedImage`. They sit inside layer wrappers that only change `transform`/`opacity`, so they are GPU-composited.
- **Spheres:** `sphere-renderer.ts` maps an equirectangular texture onto an orthographic disc on `<canvas>`, with a lookup table per radius. Light comes either from the front-left (close-ups), from a subsolar point (day/night and phases), or from the body itself (`emissive`, the Sun and the stars, with limb darkening).
  - **Earth (stage 1):** day and night textures blended by the solar zenith angle from `sunPosition(clock())`. While the view rests at stage 1 and motion is not reduced, the globe turns eastwards in time-lapse (one turn in 120 s) at up to 30 frames per second. The lighting stays fixed in view space, so it is computed once (`sunLighting`) and each frame only shifts the texture (`renderLitSphere`). When the turn pauses, its angle is handed on (`JourneyUi.earthTurn`), so the Earth of stage 2 matches it during the cross-fade.
  - **Earth and Moon (stage 2):** spheres at true distance and true size ratio, but drawn 6.25× larger than to scale (Earth radius 20 base units instead of 3.2), lit from the same subsolar point as the Earth. "Planeten in die Lücke" animates the seven planet discs into the gap and scales both spheres down to true size at the same time.
  - **Sun and planets (stage 3):** `BodyGlobe` spheres with Solar System Scope textures, about 1.5× the earlier dot sizes; each planet is lit from the direction of the Sun in the plane of the orbits (plus a little front light, so a crescent never becomes a line); the Sun is emissive; Saturn gets a CSS ring. Textures load only from z ≥ 1.3 (the Moon's from z ≥ 0.2).
- **Neighbouring stars:** dots at their true distances from the Sun (directions simplified), a 5-light-year ring, and 24 px targets with their names.
- **Stars on the way out:** `star-renderer.ts` draws the bundled catalogue (HYG v4 subset, mag ≤ 6.5, ~8,700 stars, x/y/z in parsecs) from a camera that moves outwards between stages 4 and 5, so the stars drift apart in depth. The Orion lines of the mockup are no longer drawn: in a 0.9 s flight they only flashed up as stray strokes. The renderer still supports them.
- **Milky Way:** the reconstruction from above, with marks for the four arms and Sagittarius A*. The planned tilt into an edge-on view was dropped; the CD comparison stays as the extra line.
- **Local Group:** a schematic drawing (the Milky Way, Andromeda, Triangulum, the Magellanic Clouds and dwarf galaxies) inside a dashed boundary that fills most of the phone width, labelled as an illustration. A rendering from the McConnachie (2012) catalogue was planned, but the catalogue service was unavailable; the user chose to keep the schematic drawing.
- **Universe:** the cosmic-web simulation with eight marks; their places are schematic, near structures close to the Earth and the most distant ones further out, left of the Earth and above the texts so the phone's scale bar leaves room.
- **Marks and names** inside the picture are buttons in free exploration (static text otherwise). The name is part of the button. Positions are chosen per mark so that neither the scale bar nor the distance readout covers a name on a 390 px phone, checked with `elementFromPoint` in the browser.
- **Earth marker:** a DOM element positioned from the engine's Earth position. It fades in only from z = 2.2, on the way out of the solar system, because up to there the Earth is drawn as a sphere with its name. It is clamped into a safe area that excludes the text block and the scale bar, and shows a direction arrow (rotated by `atan2`) only when the Earth is off-screen. From stage 4 on it is a button that opens the Earth close-up; at stages 2 and 3 the Earth sphere and its name are the target.
- **Reduced motion:** flights become 400 ms opacity cross-fades between the two stage states. Direct manipulation still zooms. The void keeps its 7 s as a still black pause. The Earth does not turn.

### 5. Close-ups
These are a sub-state of the journey (`JourneyUi.planet: BodyId | null`), not a new route. Only the back control (or Escape) closes them. Zoom gestures inside the close-up do nothing, and everything behind it is `inert` while it is open, so the journey waits. The close-up takes a `Body` from `findBody(id, stage)`:
- planets (rotatable sphere, moons row for Jupiter and Saturn, age line with share button);
- the Moon (stage 2), the Sun (stages 3 and 4, emissive), the Earth (from every stage after the first; its back control returns to the stage it was opened from);
- the neighbouring stars (emissive spheres, partly tinted Sun texture);
- Voyager 1, the Milky Way parts, the Local Group galaxies and the places of the universe, which have a `picture` instead of a texture.
The age form is shown only for bodies that are planets. In the `hauptreise` variant no close-up targets are rendered.

### 6. Texts, facts, announcements
`StageText` reads the engine's `atStage` stage. It renders title (`h2`), poetic line and the Aha together. A single polite live region announces "title. line Aha" once on settle; transit values are `aria-hidden`. The fact sheet is a non-modal region that receives focus, closes on Escape, zoom or its button, and returns focus to its opener. It also carries the fact branches (C, F, G). Text over imagery sits on a bottom gradient scrim (token-based) for 4.5:1.

### 7. Variants
`OutwardJourney` takes `variant = input<'freies-erkunden' | 'hauptreise'>()` and `completed = output<void>()`. The route page uses `freies-erkunden`. `hauptreise` hides close-up targets, moons, branches and end paths, collapses the fact control to an icon button, and ends with "Weiter" plus the C hand-over line.

### 8. Assets, sourcing and credits
`public/journey/` contains `img/<name>-<width>.webp`, `tex/<body>-{1024,2048}.webp`, `data/stars.json` and `manifest.json`; the credits live in `data/credits.ts` (`{ title, source, licence, url, kind: 'photo'|'data'|'reconstruction'|'simulation'|'illustration' }`) together with the files each credit stands for. Sources (reviewed in credits-review.md):
- Earth day/night, Moon, Sun and planet textures: Solar System Scope, after NASA imagery and data (CC BY 4.0).
- Voyager 1: NASA/JPL illustration (public domain).
- Stars: HYG v4.1 (CC BY-SA 4.0).
- Orion arm (crop) and Milky Way from above: NASA/JPL-Caltech/ESO/R. Hurt (public domain).
- Sagittarius A*: EHT Collaboration 2022 (CC BY 4.0).
- Andromeda (CC BY 2.0), Triangulum, Magellanic Clouds (ESO, ESA/Hubble, CC BY 4.0).
- Local Group: our own schematic drawing (illustration).
- Cosmic web: Millennium simulation, Springel/MPA (CC BY-SA 4.0).
- Places of the universe: Laniakea (illustration after Tully et al., CC BY 4.0), Bullet Cluster (NASA/CXC/STScI, public domain), Webb's First Deep Field (NASA/ESA/CSA/STScI, public domain), JADES-GS-z14-0 (NASA/ESA/CSA/STScI, CC BY 4.0), TON 618 (Sloan Digital Sky Survey, CC BY 4.0), cosmic microwave background (ESA and the Planck Collaboration, CC BY 4.0).

`scripts/build-journey-assets.mjs` (dev dependency `sharp`) downloads the listed originals once into `.asset-cache/`, crops and resizes them, encodes WebP and writes `manifest.json`. The outputs are committed, so builds never fetch. It resolves Wikimedia Commons titles through the Commons API; Commons rate-limits downloads of original files, so small originals are fetched as standard-width thumbnails where possible. Unit tests fail when a stage or body references a credit without an entry, when a credited file is missing from the manifest, or when a built file has no credit. Budget: ≤ 25 MB total (currently about 6.6 MB).

### 9. Haptics, no sound
- **No sound.** The module was first built with a generated Web Audio drone, a tone at the neighbouring stars and an optional narration voice. After review all audio was removed: the module is silent. There is no sound or narration control, and no audio API is used.
- **Haptics:** `navigator.vibrate?.(12)` once on each snap, behind the setting.
- `JourneySettings` persists `{ vibration: true }` under `be.journey`. Older stored values for sound and voice are ignored, the stored vibration choice is kept.

### 10. Age and share cards
- **Age:** `BirthYear` (`be.birthYear`) holds an optional, removable year. A Signal Forms schema validates an integer in 1900..current year (from `CLOCK`). Age = `(now − Date.UTC(y, 6, 1)) / 365.25 d / period`, shown with 1 decimal below 10 and rounded otherwise.
- **Share cards:** `ShareCard.render(kind, data)` draws a 1080 × 1350 canvas (night gradient, bundled star pattern, serif headline, app name) after `document.fonts.load`. It outputs a PNG `Blob`. If `navigator.canShare({ files })` is true it calls `navigator.share`, ignoring `AbortError`; otherwise it downloads via an object URL. The preview is a native `<dialog>` with focus return.

### 11. Completion
The engine records `reachedUniverse` when settling at stage 7. Settling at stage 1 afterwards in the same visit calls `ExplorationProgress.markExplored('A')`, shows the home line, and in `hauptreise` emits `completed` on "Weiter".

### 12. Layout
- **Phone:** the readout is top-left, the scale bar is on the right edge (≈140 px including labels), and the texts are at the bottom with a scrim. Picture labels near the bar or the readout are placed per mark so they don't sit under them (for example the names of Jupiter and Neptune sit below their planets). As an extra guard, bar labels other than the current stage dim to 35 % while at rest.
- **Tablet/desktop** (`LayoutMode`): the texts sit in a lower-left column (max 32 rem), the bar on the right with more spacing, and the picture fills the window.
- **Home screen preview:** the preview keeps its width (208 px on phones, 300 px on tablet and desktop) and gets a minimum height (212 px and 224 px) instead of a fixed height, so a two-line title and the whole line fit and larger text grows it. The placement logic uses these heights.

### 13. Testing
- **Unit:** all of `engine/*` (scale/opacity, Earth path, snapping targets, flight durations including the 7 s void and the 9 s way home, phases, completion), formatting (every value in the spec tables), age, sun position, sphere lighting (the precomputed path matches the full render; planets are lit on the side facing the Sun), and data integrity (7 stages, exact spec texts, 8 planets with 5 facts each, 6 moons, close-up bodies with credits, credits for every file). Also the input directive with synthetic events, the haptics and share services with stubs, and the components with fake timers: marks and names selectable, at least 24 px apart, the Earth selectable at stages 2–7 and not at 1.
- **e2e** (phone, tablet and desktop projects): entry from home; zoom by keys, wheel and range; snapping; text only at rest; distance strings; jump via bar; void ≥ 6 s; Mars close-up with age 1996 → 16; Moon, Sun and Voyager close-ups; fact sheet with Escape; way home → explored star; branch to B; axe at the listed states; 320 × 640 layout; reduced motion; no third-party requests across a full trip. Layout checks for picture labels and the home preview were done with scripted browser screenshots and `elementFromPoint`.

## Changes after the first review

- **Stages:** ten stages became seven. The Orion arm and the centre became selectable places at the Milky Way (earlier), and the Andromeda stage was removed; Andromeda is a selectable galaxy of the Local Group, and its branch to D moved to the Local Group.
- **Universe:** eight selectable structures and places; no still hold before the texts.
- **Spheres:** the Earth turns in time-lapse; Earth and Moon at stage 2 and the Sun and planets at stage 3 are textured spheres; names of all spheres are selectable.
- **Earth:** selectable from every stage after the first; the marker appears only beyond the solar system.
- **Stars on the way out:** no constellation lines.
- **Sound:** removed entirely.

## Risks / Trade-offs

- [Visual compression may be read as "true scale"] → The distance readout and facts carry the true numbers. Stages 2 and 3 say in their facts that the spheres are enlarged, and at stage 2 both spheres shrink to true size when the planets glide into the gap.
- [The turning Earth no longer shows the real continents in daylight after a few seconds] → The fact sheet calls it a time-lapse; the terminator stays where the Sun really is.
- [Schematic places in the universe may be read as real directions] → The picture is labelled a simulation, and the places are described in their close-ups.
- [Continuous animation (turning Earth)] → It stops under reduced motion, while moving and while a close-up is open. WCAG 2.2.2 asks for a way to pause moving content that lasts longer than 5 s; a pause control is not built yet (see open questions).
- [Asset weight on mobile] → Lazy textures per stage, WebP at several widths. Textures are 1024 px by default and 2048 px only on wide or high-DPR screens; the small spheres use 1024 px.
- [Canvas sphere performance on low-end phones] → Lookup tables per radius, precomputed lighting for the turning Earth, at most 30 redraws per second, a DPR cap of 2; all other spheres draw once.
- [The scale bar overlaps picture labels on narrow phones] → Labels are placed per mark and checked in the browser; inactive bar labels are dimmed at rest.

## Migration Plan

This is additive. A dedicated route replaces the placeholder only for Modul A. New storage keys are `be.birthYear` and `be.journey`; `be.explored` is reused. Rollback means reverting the commit.

## Open Questions

- The duration of the void (7 s) needs tuning with test users. It is a constant in `zoom-math.ts`.
- Whether the outer stages belong to the guided journey is decided when "Die Reise" is built. The `hauptreise` variant currently includes all seven.
- Should the turning Earth get a pause control (WCAG 2.2.2), or stop on a tap?
- The facts of the new places of the universe (Laniakea, Bullet Cluster, Boötes Void, Great Wall, Webb's Deep Field, JADES-GS-z14-0, TON 618, cosmic microwave background) still need the subject review.
