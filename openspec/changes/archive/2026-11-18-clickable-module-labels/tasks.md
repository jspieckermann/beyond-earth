## 1. Implementation

- [x] 1.1 Move each label into its star button in `ModuleConstellation` (flex row with a fixed star cell, `row-reverse` for left-side labels, star centre unchanged, `aria-label` kept); verify existing constellation unit tests still pass and a new test finds the label text inside `button[data-module]`
- [x] 1.2 Update `module-constellation.css`: star cell size per layout, slim label hit area (18 px tall strip, see design.md), reset button typography, hover brightening and pill-shaped focus outline around star and label; verify by screenshot at 390 × 844 and 1440 × 900 that star and label positions match the current screen
- [x] 1.3 Add unit tests: clicking the label selects the module, clicking it again toggles it off, phone layout still hides the selected label; verify `npm run test:coverage` passes with ≥ 85 % lines

## 2. Verification

- [x] 2.1 Add e2e tests: on phone (320 and 390), tablet (834 × 1194), landscape (1024 × 768) and desktop (1440 × 900) clicking the centre of every label selects exactly its own module; keyboard still reaches each module once in journey order; verify `npm run e2e` passes on all projects
- [x] 2.2 Adjust the existing overlap checks to the new markup (labels vs labels and vs other stars' dots) and confirm the axe scans still report zero violations; verify `npm run e2e` passes
- [x] 2.3 Run `npm run lint`, `npm run test:coverage` and `npm run e2e`; verify all three pass
