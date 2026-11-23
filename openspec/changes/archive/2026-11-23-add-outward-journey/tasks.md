## 1. Route and skeleton

- [x] 1.1 Add the dedicated lazy route `module/reise-nach-draussen` (title "Die Reise nach draussen · Die Milchstrasse erleben") before `module/:slug`; verify the routing unit test resolves it to `OutwardJourneyPage` while other module slugs still resolve to the placeholder
- [x] 1.2 Create `OutwardJourneyPage` (variant `freies-erkunden`) and the embeddable `OutwardJourney` component (input `variant`, output `completed`) with the main heading, focus on entry, "Zurück zum Himmel" link and one polite live region; verify component tests for focus, back link and variant input
- [x] 1.3 Update the home-screen e2e for the modified "Placeholder destinations" requirement ("Eintauchen" on A opens the module, "Das Unsichtbare" is still a placeholder); verify `npm run e2e -- home` passes

## 2. Pure engine and formatting

- [x] 2.1 Implement `engine/format.ts` (distance and light time in de-DE, all units up to Mrd. Lichtjahre and "seit 13,8 Mrd. Jahren"); verify unit tests produce every value of the spec's distance table at rest
- [x] 2.2 Implement `engine/zoom-math.ts`: layer scale `6^(n−z)`, layer and label opacity, log-interpolated distance, smoothstep Earth path from per-stage `earthPos`, off-screen detection, snap target with direction bias; verify unit tests for each function at stage values and midpoints
- [x] 2.3 Implement `engine/age.ts` and `engine/sun-position.ts`; verify tests: birth year 1996 on 20 Nov 2026 → Mars "16", Jupiter "2,6", rejection < 1900 and > current year; subsolar point at 12:00 UTC on the equinox near 0° longitude

## 3. Content data

- [x] 3.1 Write `data/stages.ts` (originally 10 stages, now 7: label, title, poetic line, Aha, extra line, facts, distance in m, curated display values, earthPos, alt text, image/credit ids, branch) from the concept; verify a data test checks the order, the exact spec texts and distances, and three or more facts per stage
- [x] 3.2 Write `data/planets.ts` and `data/moons.ts` (8 planets with orbit layout, distance, light time, line, Aha, 5 facts, orbital period; 6 moons with one sentence each); verify a data test for completeness and the spec's Mars values
- [x] 3.3 Add `data/credits.ts` reading `public/journey/credits.json` and a test that every image reference in stages and planets has a credits entry; verify the test fails when one reference is removed

## 4. Zoom state and input

- [x] 4.1 Implement `engine/zoom-state.ts` (z signal, flights with injectable frame scheduler, ease-in-out, ≥ 7 s linear flight across the void, cancel on new input, phases atStage/moving/returning, Aha shown at once at rest, ~10 s return flight, reachedUniverse → completion); verify unit tests with fake timers for snapping, no auto-movement after 60 s, void duration, return, and completion only after reaching the universe
- [x] 4.2 Implement the `zoomInput` directive (wheel with 240 ms release, vertical drag, pinch, keyboard steps with field/planet exceptions); verify unit tests with synthetic events for direction, release snapping and ignored keys inside the birth-year field
- [x] 4.3 Add `JourneySettings` (`be.journey`: vibration; sound and voice were removed with 12.8) and `BirthYear` (`be.birthYear`, removable); verify unit tests for defaults, persistence and unavailable storage

## 5. Scene with drawn layers (mockup level)

- [x] 5.1 Build the scene hosting one layer component per stage, anchored to the engine's Earth position with per-layer transform/opacity and label opacity, plus per-stage preloading hooks; verify a component test that layer 2 is fully visible and others faded at z = 2
- [x] 5.2 Port the mockup's drawn layers for all stages of that time (Earth, Earth–Moon, solar system with orbits and Voyager, Alpha Centauri, Orion arm, centre, Milky Way, Andromeda, Local Group, universe) as placeholders behind the image references; verify a component test renders each stage's alt text as the scene label
- [x] 5.3 Add "Planeten in die Lücke" at "Erde und Mond" (true-ratio SVG, seven planets glide into the gap); verify a component test that all seven end inside the gap
- [x] 5.4 ~~Add the galaxy tilt at "Die ganze Milchstrasse"~~ — dropped after review; the CD comparison stays as the extra line, and a test checks that no "Seitenansicht" toggle exists

## 6. Overlay UI

- [x] 6.1 Build `StageText` (title, poetic line, Aha, fact control, branch, start hint, visible only at rest) and `DistanceReadout` (corner value + large transit value, transit `aria-hidden`); verify component tests for visibility by phase and announcements
- [x] 6.2 Build `FactSheet` (translucent, facts + source, Escape/close/zoom closes, focus in and back); verify component tests for focus handling and content at the Milky Way
- [x] 6.3 Build `ScaleBar` (one button per stage bottom-up, highlighted current stage, dimmed others at rest, continuous marker, transparent vertical range input) with jumps via the engine; verify component tests for highlight, jump target and range dragging
- [x] 6.4 Build `EarthMarker` (from stage 2 on, clamped to the safe area, direction arrow only when off-screen, no pulse under reduced motion); verify component tests at z = 5 (off-screen arrow) and z = 6 (visible, no arrow)
- [x] 6.5 Build `JourneyEnd`: "Und jetzt zurück. Nach Hause." (with the stage texts since 12.3), "All das. Und mittendrin: wir." on arrival, then "Nochmal reisen", "Zu einer Stufe springen", "Bild teilen" (or "Weiter" + C hand-over line in `hauptreise`), and mark A explored; verify component tests for each path and the `completed` output
- [x] 6.6 Add branches to B, F, G, D and C (C in the solar-system facts, F and G in the Milky Way facts, D at the Local Group since 12.1); verify the e2e "Wie leer ist das wirklich?" opens "Die Sandkorn-Welt"
- [x] 6.7 Lay out phone and wide variants (`LayoutMode`), with a text scrim and label placement away from the bar; verify an e2e at 320 × 640 and 1440 × 900 that nothing overlaps or is cut off at "Die ganze Milchstrasse"

## 7. Planet close-ups

- [x] 7.1 Implement `SphereRenderer` (orthographic texture mapping, lookup table per radius, rotation, day/night blend for the Earth); verify unit tests with a fake 2D context
- [x] 7.2 Build `PlanetCloseup` (zoom-in from the solar system, planet sphere with drag and Arrow-Left/Right rotation, name, distance, light time, line, Aha, fact sheet, back only via "Zurück zum Sonnensystem" or Escape, zoom gestures and the view behind inert while open, Earth marker lights up for the Earth); verify component tests and an e2e that Arrow-Right changes the Mars canvas pixels
- [x] 7.3 Add moons at Jupiter and Saturn (selectable, one sentence each); verify a component test that selecting Europa shows its ocean sentence
- [x] 7.4 Add `BirthYearForm` (Signal Forms, 1900..current year, inline error, removable) and the age line per planet with its share button; verify component tests: 1996 → Mars 16, "3000" → error and no age, remembered year shown again
- [x] 7.5 Hide planet buttons, moons, branches and end paths in the `hauptreise` variant and collapse the fact control to an icon; verify a component test for the main-journey variant
- [x] 7.6 Make the Moon (at "Erde und Mond") and the Sun (at "Das Sonnensystem") selectable in free exploration, opening the same close-up without the age; the Sun glows (emissive, limb darkening), the Moon returns to "Erde und Mond"; add their textures and credits; verify component tests and an e2e that opens and closes both
- [x] 7.7 Make Voyager 1 (at "Das Sonnensystem") selectable in free exploration, opening the close-up with a picture of the probe instead of the sphere, its distance, light time, line, Aha and facts, without the age; add the 480 px picture to the asset script, manifest and credits; verify component tests and an e2e with axe

## 8. Sound, haptics, narration (sound and narration removed in 12.8)

- [x] 8.1 ~~Implement `JourneySound`~~ (removed in 12.8) (lazy graph on first input, drone and pad ramped along z, silence in the void, single tone at stage 4, rise during return, mute suspends); verify unit tests with a fake `AudioContext`
- [x] 8.2 Implement `Haptics` (one pulse per snap, setting and feature detection); verify a unit test: one snap → one `vibrate` call, vibration off → none
- [x] 8.3 ~~Implement `Narration`~~ (removed in 12.8) (local German voices only, poetic lines only, cancel on movement, toggle hidden without voice) and the sound/voice/vibration controls; verify unit tests with a fake `speechSynthesis`

## 9. Share cards

- [x] 9.1 Implement `ShareCard.render` for Kronkorken, Münze and age cards (1080 × 1350, self-hosted fonts, no birth year); verify unit tests with a fake canvas for the drawn texts
- [x] 9.2 Implement share/download (`canShare` files → `share`, AbortError ignored, otherwise PNG download) and `ShareCardDialog` (native `<dialog>`, preview with alt, focus return); wire it to "Bild teilen" at the end and to the age line; verify unit tests for both paths and the cancel case

## 10. Real imagery and data

- [x] 10.1 Add `sharp` as a dev dependency and `scripts/build-journey-assets.mjs` (download originals once via configurable mirror URLs, crop/resize, WebP at 480/960/1920 and textures at 1024/2048, write `credits.json`); verify the script runs and produces the files listed in the design
- [x] 10.2 Source and process the photos and textures: Earth day/night, Moon, Sun, eight planets, Voyager, Sagittarius A* (EHT), Andromeda, Milky Way top/edge-on, Orion-arm band, cosmic web; verify the asset-existence test passes and `public/journey` is ≤ 25 MB
- [x] 10.3 Build `stars.json` (HYG v4 subset, mag ≤ 6.5, with Orion stars); keep the Local Group as a schematic drawing labelled as an illustration; verify the catalogue loads in unit tests and includes Betelgeuse and Rigel, and that the Local Group credit is an illustration
- [x] 10.4 Replace the drawn placeholders with the real images (Earth day/night textures, Sun, Voyager, Orion arm, the reconstruction's bulge and the EHT image at the centre, Milky Way, Andromeda, cosmic web) and `StarRenderer` (Orion lines dissolving on the way out; the lines are no longer drawn since 12.4), using `NgOptimizedImage` for photos; verify that the build places every image and that the Orion line lengths diverge between z = 3 and z = 4
- [x] 10.5 Fill `credits.json` (source, author, licence, URL, kind) and review every licence, swapping any failing image for a labelled own rendering; build the "Bildnachweise" dialog and the per-stage source line; verify the credits test passes and the review result is noted in the change folder

## 11. Integration and quality

- [x] 11.1 Write the e2e for a full trip with keys, wheel and the scale bar: stage order, texts only at rest, distance strings, void ≥ 6 s, fact sheet with Escape, Mars close-up with age, way home, then the explored star on the home screen; verify `npm run e2e` passes on phone, tablet and desktop
- [x] 11.2 Add axe scans at "Die Erde", "Das Sonnensystem", the Mars close-up, "Das Zentrum" (now "Die ganze Milchstrasse") with open facts and "Das ganze Universum", plus a reduced-motion run (`emulateMedia`); verify zero violations
- [x] 11.3 Add a request-origin e2e over a full trip and a card share (all requests same origin, no location request); verify that it passes
- [x] 11.4 Run `npm run lint`, `npm run test:coverage` and `npm run build`; verify zero lint errors, ≥ 85 % line coverage, and a successful build with the Modul A route in its own lazy chunk

## 12. Review changes (23 Nov 2026)

- [x] 12.1 Remove the stage "Andromeda" (seven stages; Andromeda stays a selectable galaxy of the Local Group; the branch to D moves to the Local Group; the return flight keeps about 9 s); verify the data, engine and zoom-state tests for seven stages and the e2e jump to "Lokale Gruppe"
- [x] 12.2 Draw the Local Group about 1.5× larger and keep its names clear of the scale bar and the readout on phones; verify in browser screenshots at 390 × 760 and 1280 × 800 and that the galaxy marks stay at least 24 px apart
- [x] 12.3 Show the texts and "Und jetzt zurück. Nach Hause." at the universe without the 4 s hold; verify the zoom-state test and a timing check in the browser
- [x] 12.4 Stop drawing the Orion constellation lines and fade the Milky Way marks with their labels, so the flight from the neighbouring stars to the Milky Way shows only stars; verify a mid-flight screenshot
- [x] 12.5 Add the places of the universe (Laniakea, Geschosshaufen, Boötes-Leerraum, Herkules-Corona-Borealis-Mauer, Webbs erstes Deep Field, JADES-GS-z14-0, TON 618, kosmischer Mikrowellenhintergrund) as selectable marks with close-ups, pictures and credits; verify data, credit/manifest and selection tests and browser screenshots
- [x] 12.6 Make the Earth selectable at every stage after the first, returning to the stage it was opened from; let the marker appear only beyond the solar system; verify the overlay and data tests
- [x] 12.7 Turn the Earth of the first stage in time-lapse with precomputed lighting; draw Earth and Moon at stage 2 and the Sun and planets at stage 3 as textured spheres with selectable names, lazy textures, Saturn's rings, enlarged spheres explained in the facts; verify sphere-renderer tests, label hit checks with `elementFromPoint` on phone and desktop, and the e2e suite
- [x] 12.8 Remove all audio (generated sound, narration, their controls and settings), keeping the vibration setting; verify the settings tests (older stored values keep the vibration choice) and the e2e suite
- [x] 12.9 Let the home-screen module preview grow with its text (minimum instead of fixed height, no line clamp, hyphenation); verify the placement tests and a browser check of all seven modules at 320 × 640, 390 × 844, 768 × 1024, 834 × 1194, 1024 × 768 and 1440 × 900
- [ ] 12.10 Subject review of the facts of the new places of the universe and of the Local Group galaxies
- [ ] 12.11 Decide on a pause control for the turning Earth (WCAG 2.2.2)
