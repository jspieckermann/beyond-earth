## 1. Tooling

- [x] 1.1 Add ESLint via `ng add angular-eslint`, enable template accessibility rules, add `lint` script; verify `npm run lint` runs and exits with zero errors on the current code
- [x] 1.2 Add `@vitest/coverage-v8`, a `test:coverage` script and an 85 % line-coverage threshold; verify `npm run test:coverage` prints a coverage report and fails when the threshold is not met
- [x] 1.3 Add Playwright + `@axe-core/playwright` with a `webServer` running the dev server and phone (390 × 844) and desktop (1440 × 900) projects, plus an `e2e` script; verify a smoke test opening `/` passes with `npm run e2e`

## 2. Foundation

- [x] 2.1 Install `@fontsource/cormorant-garamond` and `@fontsource/inter`, import them and define the colour tokens (`:root` + Tailwind `@theme`) and dark body background in `src/styles.css`; verify the build succeeds and no request goes to fonts.googleapis.com in the network log
- [x] 2.2 Set `lang="de"` and title "Die Milchstrasse erleben" in `src/index.html`, reduce `app.html` to `<router-outlet />` and delete the placeholder styles; verify the app spec is updated and passes
- [x] 2.3 Add the `CLOCK` injection token and the `LocalStore` wrapper with in-memory fallback; verify unit tests cover normal read/write and a throwing `localStorage`
- [x] 2.4 Add `ExplorationProgress`, `SavedMoments` and `TonightService` (stub returning `null`) as signal-based services; verify unit tests for persistence, defaults and the storage-unavailable case

## 3. Routing and placeholders

- [x] 3.1 Create `PlaceholderPage` (title from route data, "Bald verfügbar" note, back link to `/`); verify unit test renders the title and the back link
- [x] 3.2 Configure lazy routes: `''` → home, `module/:slug` (title from the module catalog), `reise`, `heute-nacht`, `meine-sterne`, `einstellungen`, and `'**'` → `''`; verify a routing unit test resolves each path to the expected component and title

## 4. Home screen data

- [x] 4.1 Create the module catalog (ids, full titles, short labels, poetic lines, slugs, positions in 390 × 600 sky space, label side) in journey order A, C, B, E, D, G, F; verify a unit test asserts the order and that all seven modules exist
- [x] 4.2 Implement the seeded star-field generator; verify a unit test shows identical output for the same seed and all stars inside the sky bounds
- [x] 4.3 Implement the pure `previewPlacement` function (above if room, else below; clamped to 16 px gutters); verify unit tests for every module at 320 px and 480 px widths: preview fully inside the container and not overlapping the star

## 5. Home screen components

- [x] 5.1 Build `SkyBackdrop` (band layers, dust lane, SVG star field, slow drift disabled under `prefers-reduced-motion`, all `aria-hidden`); verify unit test that the backdrop is hidden from assistive technology and renders the star field (clearing the selection on an empty-sky click is handled by `HomePage`, see 5.6)
- [x] 5.2 Build `ModuleConstellation` with star buttons (explored vs faint style, visible labels, accessible names, `aria-expanded` disclosure state, selection signal, toggle, Escape with focus return); verify unit tests for select, switch, toggle-off, Escape and explored styling
- [x] 5.3 Build `ModulePreview` (status text, title, line, "Eintauchen" link to `module/:slug`); verify unit tests for both status texts and the link target
- [x] 5.4 Build `TonightCard` with the located state (location, visibility time, 5-dot darkness scale with "Dunkelheit n von 5" text, moon line, mission) and the "Wo stehst du heute Nacht?" state, linking to `heute-nacht`; verify unit tests for both states and that `navigator.geolocation` is never called
- [x] 5.5 Build `HomeActions` ("Die Reise" → `reise`; "Meine Sterne" with count → `meine-sterne`, hidden at 0 with "Die Reise" full width); verify unit tests for count 0 and count 2
- [x] 5.6 Build `HomePage` composing date line (German long form from `CLOCK`), greeting (no digits), settings link (`aria-label="Einstellungen"` → `einstellungen`), sky, constellation, card and actions in a centered column (max 480 px); verify unit test that the date reads "Mittwoch, 18. November" for a fixed clock and all sections render

## 6. Verification

- [x] 6.1 Write e2e tests for the spec scenarios: select/switch/close preview, Eintauchen → placeholder → back home, settings, Heute Nacht, Die Reise, Meine Sterne visibility (seeded via localStorage), no audio elements; verify `npm run e2e` passes on phone and desktop projects
- [x] 6.2 Add e2e accessibility and layout checks: axe scan with and without open preview, keyboard Tab order, no horizontal scroll and no label overlaps at 320 × 640, no third-party requests; verify all pass
- [x] 6.3 Compare the running app at 390 × 844 with the canvas mockup and fix visible differences; verify by screenshot review
- [x] 6.4 Run `npm run lint`, `npm run test:coverage` (≥ 85 % lines) and `npm run e2e`; verify all three pass

## 7. Tablet and desktop layouts

- [x] 7.1 Add the `LayoutMode` service (media queries via an injectable `matchMedia`, reacts to changes, `phone` without `matchMedia`); verify unit tests for phone, tablet, desktop, landscape tablet and a live change
- [x] 7.2 Add normalized wide star positions and preview anchor to the catalog, plus pure helpers for the wide preview position, the connector line, the band geometry and the band star cloud; verify unit tests that the wide preview covers no star at 624 × 768, 768 × 570, 834 × 738 and 950 × 900 and that the connector starts outside the star
- [x] 7.3 Teach `ModuleConstellation` the wide layouts (measured region, band layers and cloud, percentage star positions, always-visible labels, fixed preview with connector) and `ModulePreview` a larger wide size; verify unit tests for wide selection, label visibility, preview position and connector
- [x] 7.4 Lay out `HomePage` per layout (phone unchanged; tablet: top block, full-width sky, card and actions side by side; desktop: left column with brand, date, greeting, hint, card and actions, sky on the right, settings top right) and limit `SkyBackdrop`'s band to the phone layout; verify unit tests for the layout class and the brand/hint visibility
- [x] 7.5 Add a tablet e2e project (834 × 1194) and e2e checks: correct layout per viewport (320, 834 × 1194, 1024 × 768, 1440 × 900), no horizontal scroll or cut-off/overlapping labels, wide preview covers no star and other stars stay directly selectable; verify `npm run e2e` passes on all projects
- [x] 7.6 Compare the running app at 834 × 1194 and 1440 × 900 with the canvas boards and fix visible differences; then run `npm run lint`, `npm run test:coverage` and `npm run e2e`; verify all pass
