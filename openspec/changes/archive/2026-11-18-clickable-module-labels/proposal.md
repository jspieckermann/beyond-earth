## Why

On the home screen only the small star of each module reacts to a tap or click; its name next to it does not. People naturally aim at the readable text, miss, and nothing happens — especially on phones and with a mouse on desktop. The label is the larger and more obvious target, so it should work too.

## What Changes

- Each module's star and its visible label become **one control**: tapping or clicking either the star or the label selects the module (opens its preview), exactly as the star does today; activating it again closes the preview.
- Hovering the label shows it is clickable (pointer cursor, brighter text); the keyboard focus ring surrounds star and label together.
- Keyboard and screen-reader behavior stay the same: still one Tab stop per module, same order, same accessible name (the full module title), same `aria-expanded` state.
- Applies to all three layouts (phone, tablet, desktop). On the phone layout the label stays hidden while its preview is open (unchanged), so the selected control shrinks back to the star.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `home-screen`: the "Module constellation" requirement gains that the label is part of the same control as its star (clickable, one Tab stop).

## Impact

- **Code**: `src/app/home/module-constellation.ts` and `module-constellation.css` (label moves inside the star button; positioning for left- and right-side labels), related unit tests.
- **Tests**: unit tests for label activation; e2e checks that clicking each label selects its own module on phone, tablet and desktop, and that layout/overlap/axe checks still pass.
- No new dependencies, no data or routing changes.
