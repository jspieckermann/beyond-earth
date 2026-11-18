## Context

`ModuleConstellation` renders, per module, a 44 × 44 px (48 px on wide layouts) transparent `<button class="star">` centred on the star and, as a sibling, an `aria-hidden` `<span class="label">` positioned next to it (right of the star, or left of it for B, G and F on the phone layout). Only the button receives clicks; the label has `pointer-events: none` via the host. See proposal.md for motivation and `specs/home-screen/spec.md` for the required behavior.

## Goals / Non-Goals

**Goals:**
- Label and star act as one target with one Tab stop, in all layouts.
- Star centres, label positions and visuals stay where they are today.

**Non-Goals:**
- Changing star positions, label texts or the preview placement logic.
- Enlarging the star's own hit area beyond the current 44/48 px.

## Decisions

### 1. Move the label inside the star button
The button becomes a horizontal flex row: a fixed 44 × 44 (48 × 48) "star cell" holding the dot and selection ring, followed by the label text (`flex-direction: row-reverse` for left-side labels). The button keeps `aria-label` = full title, so the accessible name is unchanged and still contains the visible label text (WCAG 2.5.3). The inner label is no longer a separate `aria-hidden` element; it is plain text inside a control whose name comes from `aria-label`.
Positioning keeps the star centre fixed: for right-side labels the button's `left`/`top` are the star position minus half the star cell; for left-side labels the button is anchored with `right: calc(100% - x - cell/2)` so the star cell stays on the star.
Alternatives: (a) a second, `tabindex="-1"` button over the label — two controls for one action, duplicate semantics, and `aria-hidden` + focusable trips axe; (b) a click handler on the span — not keyboard-operable and fails the template accessibility lint rules. Both rejected.

### 2. Hit area of the label part
The label part of the button is a slim strip as wide as the text and 18 px tall (it fully covers the 12–14 px text) rather than 44 px: on a 320 px phone the closest labels (D and G) are only 19.7 px apart vertically, so taller strips would overlap and swallow clicks meant for the neighbour. WCAG 2.5.8 is met through its spacing exception (label centres are far more than 24 px apart). Only the star cell and the label strip take pointer events; the rest of the button box ignores them. The star cell keeps its full 44/48 px.
A neighbouring star's 44 px cell can still reach over a label on narrow phones. Labels therefore stack above all star cells (`z-index`), and the buttons are centred with negative margins instead of `transform` so they do not create their own stacking contexts. Labels and star dots never overlap visually, so this never takes a tap away from a star. The preview stacks above both. The e2e test clicks the centre of every label at five viewport sizes and asserts that its own module is selected.

### 3. Visual feedback
- Hover on any part of the button: label text brightens (`--color-ink`), cursor pointer; the dot is unchanged.
- `:focus-visible`: the global starlight outline is drawn around the whole button with a pill radius, enclosing star and label.
- Selected state styling (ring, starlight label colour) is unchanged.
- The phone layout keeps hiding the selected module's label (its preview shows the title), so that button collapses to the star cell.

### 4. Tests
- Unit: clicking the label element selects and toggles; label is inside the button; button count and order unchanged.
- e2e (phone 390/320, tablet 834, desktop 1440, landscape 1024): click the centre of each label → that module's preview opens; existing overlap check now compares labels with each other and with other stars' dots (not with the button boxes themselves); axe and Tab-order checks unchanged.

## Risks / Trade-offs

- [Wider buttons overlap neighbouring star cells on narrow phones] → keep label area slim; e2e asserts each label centre selects its own module at 320 px.
- [Label text inside the button inherits button styles] → reset font, colour and letter-spacing on the button explicitly.

## Migration Plan

UI-only change, no data migration. Rollback = revert the commit.
