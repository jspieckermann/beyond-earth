## Why

Modul A shows how big the Milky Way is and Modul B how far away everything is. Neither shows that none of it stands still: the whole Solar System races around the galactic centre at about 230 km/s, and one round takes so long that the Earth was a different world each time. Modul C "Das galaktische Jahr" measures Earth's history in rounds of the Sun and belongs to the guided journey's fifth act, "Heimkehren". The concept was refined on 24 Nov 2026 (`concepts/Modul C Das galaktische Jahr.md`) and a canvas prototype "Modul E – Das galaktische Jahr · Prototyp" (made under the module's earlier letter) was reviewed the same day. The home-screen star and Modul A's branch "Wie lange dauert eine Runde um die Galaxie?" still lead to a placeholder page.

## What Changes

- Replace the placeholder behind the "Das galaktische Jahr" star (`/module/galaktisches-jahr`) with the real module: **one calm page** with two parts and one picture, the Milky Way from above (the same reconstruction as Modul A's stage 5) with the Sun's orbit. On phones and upright tablets the order is "Eine Runde", the picture, "Zurückdrehen", and the picture stays at the top once reached; on wide screens the parts sit on the left and the picture on the right.
  1. **Eine Runde:** what one round is, the way of the whole Solar System around the centre of the Milky Way at about 230 km per second (almost Hamburg to Berlin in a second), 230 million years per round, about 20 rounds since the Sun formed, and the carousel image of the Sun's up-and-down motion.
  2. **Zurückdrehen:** the user turns the Sun back along its orbit with a time slider or by dragging it in the picture, up to twenty rounds back. The Sun snaps to 24 stations of Earth's history (nine main stations such as the end of the dinosaurs, Pangaea, Snowball Earth and the first life, and fifteen in-between stations such as the great dying or oxygen in the air), each with a title, a sentence and a caption. The slider is one ray whose first five rounds are stretched over 70 % of its width; the stations are dots on it, and the one the Sun will snap to is highlighted. The texts sit above the slider in rooms of fixed height, so the slider never moves while it is used.
  - **The picture:** a bright arc for the stretch of the current round, a fine ring for each round the Sun had completed by the time shown (about 20 today, fewer when turning back, none at its formation; also written under the time, "Bis dahin: 19 Runden um das Zentrum"), and a small, detailed globe of the Earth at that time (continents, deserts, forests, mountains, ice, lava) that blends continuously from one station to the next.
- A fact sheet per part ("Wie genau weiss man das?") that discloses the simple calculation (circular orbit, 230 km/s, 230 million years), the honest labelling of the pictures, and a branch to "Das Unsichtbare" (F) for the "too fast" Sun.
- Two variants like Modul A and B: free exploration at the module address (all 24 stations) and a guided main-journey variant (today, 1, 2 and 3 rounds, then "Weiter: Rausgehen" at the end of the page) that the later guided journey can embed.
- Turning the Sun back at least one full round marks the module as explored, so its star on the home screen glows brighter.
- **Module letters:** "Das galaktische Jahr" becomes module C, "Licht als Zeitmaschine" D and "Sterne zählen" E; on the home screen "Das galaktische Jahr" moves between "Reisen mit Lichtgeschwindigkeit" and "Sterne zählen" (order A, B, C, E, D, F). **BREAKING** for stored progress: explored states are migrated once to the new letters.
- **Modul A:** an address naming only a stage rests at that stage without a close-up (already the behaviour of the code; the spec and tests now say so).
- **Tried and removed after review:** the scenes "Spüren" (with a live distance counter) and "Heimkehren" (into the Orion arm), a magnifier for human history, the buttons "Zurück nach heute", "Bild teilen" and "Zur Milchstrasse in Modul A" with their share card, a line and a card with the distance since birth, and a line and a bar with the living things of the time.

**Assumptions recorded here (from the concept's open questions):**
- The module calculates with 230 km/s and 230 million years per round, as in the overall concept, although 230 km/s at 26.000 light-years gives about 210 million years. The fact sheet names the measured range (about 210 to 250 million years).
- The Earth globes are the app's own simplified drawings after textbook maps, not paleogeographic reconstructions, and the fact sheet says so. Real reconstructions (for example PALEOMAP) need a licence check and are a later change.
- The spiral arms stand still in the picture; only the Sun moves. The Sun's up-and-down motion is told, not drawn.
- No turning forward into the future.

Out of scope (later changes): the guided journey "Die Reise" itself; paleogeographic reconstructions; a side view of the Sun's vertical motion; turning into the future.

## Capabilities

### New Capabilities
- `galactic-year`: Modul C as one page with two parts: entry, one round with the speed of the Solar System, turning back with the stations, the ray-shaped slider and the Earth of the past, no buttons under the slider, no distance since birth, the calculation, fact sheets, the two variants, completion, haptics and silence, reduced motion, accessibility, responsiveness, privacy and a calm slider.

### Modified Capabilities
- `outward-journey`: "Module entry" also accepts a return address that names only a stage, resting at that stage without a close-up. "Branches and travel links" uses the new letters (C "Das galaktische Jahr", D "Licht als Zeitmaschine").
- `home-screen`: "Placeholder destinations" lists "Das galaktische Jahr" among the real experiences; "Six module stars along the band" gives the module letters C "Das galaktische Jahr", D "Licht als Zeitmaschine", E "Sterne zählen" and puts "Das galaktische Jahr" between "Reisen mit Lichtgeschwindigkeit" and "Sterne zählen"; "Exploration is shown by brightness only" carries stored progress over to the new letters; "Module preview" names "Das Unsichtbare" as the star at the top-right edge.

## Impact

- **Code:** new lazy feature folder `src/app/galactic-year/` (route page, embeddable component, stations and Earth drawings, pure calculation, orbit and slider geometry and Earth blending, galaxy view, Earth globe). `app.routes.ts` gets a dedicated route for `module/galaktisches-jahr` before the generic module route. `home/data/modules.ts` and `core/models.ts` get the new letters and order; `core/exploration-progress.ts` migrates stored progress. Modul A's code already settles at a stage given without a close-up; only its tests and spec change.
- **Data:** stations and texts from the concept; the Milky Way picture and its credit are reused from Modul A (`img/milky-way-*.webp`, NASA/JPL-Caltech/ESO/R. Hurt, public domain). No new third-party images or data.
- **Browser APIs:** none new (`navigator.vibrate` as in Modul A and B).
- **Data on device:** reuses the vibration setting; marks module `C` explored; explored states move from `be.explored.v2` to `be.explored.v3`. No birth year, no location.
- **Dependencies:** none.
