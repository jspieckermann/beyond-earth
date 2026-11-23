## Why

Modul A shows how far everything is, but distances of light-years and millions of light-years still stay abstract. Modul B "Reisen mit Lichtgeschwindigkeit" turns them into time a person can grasp: how long a journey to a place from Modul A takes at a chosen speed, and how many generations it would need. The concept was refined into a travel planner on 23 Nov 2026 (`concepts/Modul B Reisen mit Lichtgeschwindigkeit.md`, prototype reviewed the same day). Its home-screen star and Modul A's "Mit Lichtgeschwindigkeit weiterreisen" branch still lead to a placeholder page.

## What Changes

- Replace the placeholder behind the "Reisen mit Lichtgeschwindigkeit" star (`/module/lichtgeschwindigkeit`) with the real module, a travel planner in three steps that stay visible and recalculate at once:
  1. **Destination:** every place shown in Modul A (its seven stages and all objects that can be selected there), grouped by stage and searchable. Places the user is already in (Earth, Orion arm, Milky Way, Laniakea) and places beyond the reach of anything (Hercules–Corona Borealis Great Wall, TON 618, JADES-GS-z14-0, cosmic microwave background) are part of the list and get their own result.
  2. **Speed:** a percentage of the speed of light from 0,001 % to 99,9999 %, on a logarithmic slider with a number field and presets (Voyager 1 and the target speeds of the projects Orion, Longshot, Daedalus and Starshot).
  3. **Arrival:** duration on Earth, duration on board (time dilation), generations on board and on Earth (25 years each, up to 50 years counts as one generation), arrival year, a row of generation figures, a comparison with history, and a closing sentence that fits the outcome ("Wer abfliegt, kommt an.", "Nie." …).
- A fact sheet that discloses the simple calculation, a share card, and an optional line using the stored birth year.
- Two variants like Modul A: free exploration at the module address, and a guided main-journey variant (Proxima Centauri at three speeds) that the later guided journey can embed.
- **Modul A:** every close-up offers "Wie lange bräuchte ich dorthin?", which opens Modul B with that destination; Modul B leads back to the same place in Modul A.
- **Share cards:** a new travel card ("Nach Proxima Centauri mit 1 % der Lichtgeschwindigkeit: 424 Jahre. An Bord vergehen dabei 17 Generationen."), with a picture of the destination, saved under the destination's name.
- Getting a travel result marks the module as explored, so its star on the home screen glows brighter.
- **Modules follow the concept:** the app's module letters change to the concept's (A Reise nach draussen, B Reisen mit Lichtgeschwindigkeit, C Licht als Zeitmaschine, D Sterne zählen, E Das galaktische Jahr, F Das Unsichtbare), so this module is B internally too. **BREAKING** for stored progress: explored states saved under the old letters are migrated once to the new ones.
- **"Die Sandkorn-Welt" is removed:** the home screen shows six module stars instead of seven, in the concept's journey order (A, B, D, C, F, E); Modul A's branch "Wie leer ist das wirklich?" disappears; the old module address leads back to the home screen; a stored explored state for it is dropped.

Out of scope (later changes): the guided journey "Die Reise" itself; acceleration and braking; a real cosmological calculation for the far places; planet distances for today's date.

## Capabilities

### New Capabilities
- `light-speed-journey`: Modul B as a travel planner: destinations from Modul A, speed selection, the travel calculation (Earth time, board time, generations, reachability), the result presentation with figures, history anchors and outcome sentences, fact sheet, share and birth-year line, the two variants, completion, accessibility, responsiveness and privacy.

### Modified Capabilities
- `outward-journey`: "Module entry" can start at a stage with a close-up open when returning from Modul B; "Branches to other modules" is replaced by "Branches and travel links", which adds "Wie lange bräuchte ich dorthin?" in every close-up, leads the light-time branch to the real Modul B, drops the branch to "Die Sandkorn-Welt" and uses the new module letters.
- `share-cards`: "Card types" adds the travel card.
- `home-screen`: "Module constellation" is replaced by "Six module stars along the band" (six stars in the new order); "Exploration is shown by brightness only" migrates stored progress; "Module preview" and "Accessibility" count six stars and no longer use "Die Sandkorn-Welt" as their example; "Placeholder destinations" lists Modul B among the real experiences and sends the old Sandkorn address home. The spec's Purpose ("seven experience modules") is updated to six.

## Impact

- **Code:** new lazy feature folder `src/app/light-speed-journey/` (route page, embeddable component, destination data, pure travel calculation, planner UI, result view). `app.routes.ts` gets a dedicated route for `module/lichtgeschwindigkeit` ahead of the generic module route. Modul A gets the close-up link and accepts a return address (stage and close-up). `core/share-card.ts` gets the travel card. `core/models.ts` (module ids), `core/exploration-progress.ts` (migration) and `home/data/modules.ts` (six modules, new letters, new star positions) change, with the home tests and e2e that used "Die Sandkorn-Welt" as their example. Modul A's stage data loses the Sandkorn branch.
- **Data:** destinations reuse Modul A's names and distances; a unit test keeps both lists in step. No new images, no new third-party data.
- **Browser APIs:** none new (`navigator.vibrate` and Web Share as in Modul A).
- **Data on device:** reuses the birth year and the vibration setting; the explored flags are migrated from the old to the new module letters (the Sandkorn flag is dropped). No location.
- **Dependencies:** none.
