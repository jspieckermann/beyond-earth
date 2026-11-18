## Why

The app currently shows the Angular placeholder page. Per the concept "Die Milchstrasse erleben", returning users need a calm, poetic home screen from which they can freely explore the seven experience modules, repeat the guided journey, and — most importantly — be pulled back out under the real night sky via the "Heute Nacht" bridge. The home screen is the frame every later module plugs into, so it comes first.

## What Changes

- Replace the Angular placeholder with a full-screen **home screen** in the "night sky" style of the approved mockup:
  - Dark sky with the Milky Way band drawn diagonally, a faint star field and a dust lane (decorative only).
  - Date line and one poetic greeting line at the top; a quiet settings button (top right).
  - **Seven module stars (A–G)** placed along the band in journey order (A, C, B, E, D, G, F), each with a short label. Modules the user has explored in depth glow brighter; others are fainter. No points, percentages or badges.
  - Selecting a star opens a small **preview popover** (status, title, one poetic line, "Eintauchen" button). Exactly one star can be selected at a time.
  - **Heute-Nacht card** (visibility time, sky darkness on a 5-dot scale, moon info, tonight's mission), including a state for "no location chosen yet".
  - Bottom actions: **"Die Reise"** (repeat guided journey) and **"Meine Sterne"** with a count; "Meine Sterne" is only shown once at least one moment is saved.
- No narration and no sound effects on the home screen.
- Introduce lazy-loaded placeholder routes for the destinations the home screen links to (modules, journey, Heute Nacht, Meine Sterne, settings) so navigation works before those features exist.
- Add the project tooling the workflow requires: ESLint (`npm run lint`), unit-test coverage reporting, and an e2e test setup.

Out of scope (later changes): the guided journey itself and its first-launch redirect, real module content, real astronomical calculation and geolocation for "Heute Nacht", the large-screen galaxy-map variant, translations beyond German.

## Capabilities

### New Capabilities
- `home-screen`: The start screen for returning users — sky presentation, greeting, module constellation with preview, Heute-Nacht card, journey and "Meine Sterne" entry points, settings entry, accessibility and responsiveness rules.

### Modified Capabilities
<!-- none: no existing specs -->

## Impact

- **Code**: `src/app` — replaces placeholder `app.html`/`app.css`; new feature folder for the home screen (components, data and state services); new routes in `app.routes.ts`; global styles/theme tokens in `src/styles.css`; `index.html` gets `lang="de"` and title.
- **Dependencies (dev)**: `angular-eslint` + ESLint, `@vitest/coverage-v8`, Playwright (`@playwright/test`) and `@axe-core/playwright` for e2e/accessibility checks. **Runtime**: self-hosted fonts (`@fontsource` packages for Cormorant Garamond and Inter) — no requests to Google Fonts.
- **Scripts**: `package.json` gains `lint`, `test:coverage` and `e2e` scripts.
- **Data**: small browser-local persistence (localStorage) for explored modules and saved-moment count; no backend, no account.
