## Context

The repo is a fresh Angular 22 app (`@angular/build:application`, Vitest + jsdom, Tailwind 4 via PostCSS). `app.html` still holds the CLI placeholder, `app.routes.ts` is empty. There is no lint setup, no coverage reporting and no e2e setup, but the project's apply guidance requires lint with zero errors, 85 % line coverage and e2e tests, so this change sets those up too.

The visual target is the approved canvas mockup (phone, 390 × 844): https://claude.ai/artifact/TBUjUcSRxLqEKnAzussZfY. Behaviour is defined in `specs/home-screen/spec.md`.

## Goals / Non-Goals

**Goals:**
- Pixel-faithful translation of the mockup into small, focused standalone components using signals.
- A data/state seam (module catalog, exploration progress, saved moments, tonight info) so later changes can plug in real data without touching the UI.
- Deterministic, testable rendering (seeded star field, injectable clock).

**Non-Goals:**
- Real astronomy (visibility, darkness, moon) or geolocation — `TonightService` returns static content for now.
- Any feature behind the placeholder destinations.
- i18n framework; German strings live in the data files and templates for now.

## Decisions

### 1. Feature structure
```
src/app/
  app.ts / app.html            -> only <router-outlet />
  app.routes.ts                -> '' -> home (lazy), placeholders (lazy), '**' -> ''
  home/
    home-page.ts               -> route component, composes the pieces below
    sky-backdrop.ts            -> band, dust lane, star field (decorative, aria-hidden)
    module-constellation.ts    -> stars, labels, selection, keyboard handling
    module-preview.ts          -> popover for the selected module
    tonight-card.ts            -> Heute-Nacht card (located / no-location states)
    home-actions.ts            -> "Die Reise" + "Meine Sterne"
    data/modules.ts            -> static catalog: id, title, short label, line, slug, position
    data/star-field.ts         -> pure seeded generator (mulberry32) -> star list
  core/
    clock.ts                   -> CLOCK injection token returning a Date (tests set a fixed date)
    local-store.ts             -> safe localStorage wrapper (try/catch, falls back to memory)
    exploration-progress.ts    -> @Service: explored module ids as a signal, persisted
    saved-moments.ts           -> @Service: count signal, persisted
    tonight.ts                 -> @Service: signal<TonightInfo | null> (static stub)
  placeholder/
    placeholder-page.ts        -> title from route data, back link to '/'
```
Why: matches CLAUDE.md (small components, signals, `inject()`, `@Service`, lazy routes). Alternatives: one big home component — rejected, harder to test to 85 % and to reuse the sky later in the journey.

### 2. Sky rendering: layered CSS + one inline SVG
The band and dust lane are absolutely positioned, rotated `div`s with radial gradients and `filter: blur()` (exactly as in the mockup). The ~300 background stars are `<circle>`s generated once from fixed seeds, split in two `aria-hidden` SVGs: a sparse field drawn as a repeating 390 × 600 `<pattern>` across the whole viewport (so stars keep their size on desktop), and the denser band cloud in a `viewBox="0 0 390 600"` SVG aligned with the sky stage. Band layers are sized in container-query units of a frame that mirrors the stage (1 sky unit = `100cqw / 390`) and are made longer than the mockup so the band reaches the edges of wide screens. A very slow drift (`transform` animation, ~120 s) is applied to the sky layer and disabled under `prefers-reduced-motion`.
Alternatives: `<canvas>` (harder to test, no benefit at this star count); one `div` per star (300 DOM nodes with layout — heavier than SVG circles).

### 3. Coordinate system for stars and popover
Module positions are stored in the mockup's 390 × 600 sky space and rendered as percentages of a sky container that keeps that aspect ratio inside the centered content column (max width 420 px, so stage, card and actions fit a 900 px tall desktop window). Label side (left/right) is part of the catalog. The preview has a fixed size (208 × 164 px, poetic line clamped to two lines). Its position is a pure function `previewPlacement(star, stage, minTop, otherStars)` → `{x, y}`: candidate rows above the star (unless that covers the greeting) and below it, candidate columns centred or at either 16 px gutter; the candidate covering the fewest other stars wins. Covering no other star at all is geometrically impossible on phone widths (2–4 stars stay under the card), so stars hidden by the preview are reached after closing it. Being pure, it is unit-tested for every star at 320, 390, 420 and 480 px widths (covers the "edge" and "no overlap" scenarios).

### 4. Selection state and keyboard
`ModuleConstellation` exposes the selection as `selected = model<ModuleId | null>(null)`, two-way bound by `HomePage`; the preview placement is derived with `computed()`. Stars are native `<button>`s in DOM order A, C, B, E, D, G, F (so Tab order follows the journey) with `aria-expanded` (disclosure semantics) and, only while open, `aria-controls` pointing to the preview. The preview is a non-modal disclosure (`role="region"`, labelled by its title), rendered right after the selected star in DOM order so it is next in Tab order. Escape (via the `host` `(keydown.escape)` binding, not `@HostListener`) clears selection and refocuses the star. A click on empty sky is handled by a `host` click binding on `HomePage` (the decorative backdrop lies behind the content and never receives clicks); anything that is not a link, button or the preview clears the selection. Visible labels are prefixes or substrings of the accessible names (WCAG 2.5.3), which is why F's label reads "Das galaktische Jahr".
Alternative: a modal dialog — rejected, it traps focus and feels heavier than the calm "tap a star" interaction.

### 4b. Tablet and desktop layouts
Approved canvas boards "Tablet hochkant" (834 × 1194) and "Desktop & Tablet quer" (1440 × 900). A `LayoutMode` service turns two media queries into `signal<'phone' | 'tablet' | 'desktop'>` (desktop: `(min-width: 1100px), (min-width: 768px) and (orientation: landscape)`; tablet: `(min-width: 768px)`; else phone). `matchMedia` is injected through a token so tests can drive it; without it the layout is `phone`.
- One `HomePage` template for all layouts, same DOM order (settings, stars, preview, card, actions → same Tab order); the host gets a layout class and CSS (flex for tablet, grid areas for desktop) moves the pieces. Brand line and hint are only visible on desktop/tablet; the visible brand doubles as the page `h1` there.
- Wide layouts keep stars in normalized positions (0–1) of the sky region, shared by tablet and desktop. Stars and labels use percentages; the sky region is measured (`ResizeObserver`, window resize as fallback) for what needs pixels: the band geometry (centre, angle and length from the first to the last star, passed as CSS variables to rotated blurred layers that extend beyond the region), the band star cloud, the preview position and the connector line.
- The preview goes to one fixed anchor (normalized 0.60 / 0.655, below the band) clamped into the region. The star layout is chosen so that this spot is always empty; a unit test checks for 624 × 768, 768 × 570, 834 × 738 and 950 × 900 regions that no star's touch area is covered. The connector runs from the star to the preview's left edge (stars to its left) or top edge (stars above it).
- The desktop left column width is `clamp(400px, 34vw, 536px)` so a 1024 px landscape tablet still leaves room for labels; a gradient veil behind it keeps the text readable over the band.
- The phone layout and its placement logic stay unchanged.
Alternative considered: one fixed 1440 × 900 stage scaled to fit — rejected, text would shrink or stars would slide under the left column on narrower desktops.

### 5. Persistence
`LocalStore` wraps `localStorage` in try/catch with an in-memory fallback (spec: storage may be unavailable). Keys are namespaced (`be.explored`, `be.moments`). Services expose read-only signals plus `markExplored(id)` / `setCount(n)` methods for later features; this change only reads them.

### 6. Tonight data
`TonightService.info` is a `signal<TonightInfo | null>`; `null` means "no location". The stub returns `null` by default so the honest "Wo stehst du heute Nacht?" state is what users see until a real implementation exists; tests and e2e drive the located state by providing a different value. Moon time in the located stub is an explicit placeholder value in the data, not invented astronomy.

### 7. Theme and fonts
Colour tokens on `:root` in `styles.css` and exposed to Tailwind via `@theme` (`--color-sky-900`, `--color-starlight`, `--color-ink`, `--color-ink-muted`, …) using the mockup values (#03050c → #0b1124 background, #ECE8DD text, #A9AEC4 muted, #F3D9A4 accent — all ≥ 4.5:1 on the background). Fonts via `@fontsource/cormorant-garamond` and `@fontsource/inter` imported in `styles.css`, so nothing is fetched from Google (privacy/GDPR, spec "no third-party requests").
The app is dark-only by concept; no light theme.

### 8. Tooling
- Lint: `ng add angular-eslint` → `npm run lint`, including template accessibility rules (`@angular-eslint/template/accessibility`).
- Coverage: `@vitest/coverage-v8`, `test:coverage` script, threshold 85 % lines enforced in config.
- e2e: Playwright with `@axe-core/playwright`; `webServer` runs `ng serve`; projects for a 390 × 844 phone and 1440 × 900 desktop. `npm run e2e`.
Alternative: Cypress — Playwright chosen for built-in multi-viewport projects and simpler axe integration.

## Risks / Trade-offs

- [`filter: blur()` on large layers can be slow on low-end phones] → layers are static and promoted with `will-change: transform` only while animating; drift is optional and off under reduced motion.
- [Absolute positioning may let labels overlap on very narrow screens] → positions are relative to a fixed-aspect sky box; e2e checks bounding boxes for overlaps at 320 px.
- [Stub tonight data could be mistaken for real] → default stub is the "no location" state; the located state only appears in tests until real data lands.
- [Tooling setup enlarges the change] → done as the first task group so later features inherit it.

## Migration Plan

Replaces the CLI placeholder page; nothing to migrate. Rollback = revert the commit.

## Open Questions

- Exact greeting lines per time of day (copywriting) — can be filled in later without changing behaviour; start with one line.
