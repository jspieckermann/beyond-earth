## Why

The modules show the Milky Way on a screen; the concept's goal is that people go outside and look up. The home screen already has a "Heute Nacht" card, but it is a stub that only asks "Wo stehst du heute Nacht?" and leads to a placeholder page. "Heute Nacht" is the bridge into the real sky and the recurring reason to come back.

The feature was first refined on 24 Nov 2026 as a guide to the band of the Milky Way (answer, timeline, viewing directions, mission) and implemented that way. A second and a third mockup on 26 Nov 2026 replaced that flow: on most nights the band cannot be seen (Moon, city light, summer nights in the north), so a page about the band alone often ends in a "no". The revised concept (`concepts/Heute Nacht.md`, 26 Nov 2026) answers a broader question: **what can I see tonight from here with the naked eye, and how do I find it?** The Milky Way stays the most important object, but the Moon, planets and bright stars give every clear night something to look at. The mission of the night is dropped.

## What Changes

- Replace the placeholder behind the Heute-Nacht card (`/heute-nacht`) with the real feature: **a calm single page**, the place on top and what can be seen below it, without steps or tabs.
  1. **Dein Ort:** one field „Stadt oder Ort suchen“ that shows the chosen place and searches a list shipped with the app (towns in Germany, Austria and Switzerland plus the dark-sky places) in a popup list that closes after the choice, and a „Meinen Standort verwenden“ button below it, asking for the device location only after the tap and rounding it to a few kilometres. Below, „Wie dunkel ist es dort?“ as a dropdown of five plain levels from "Mitten in der Stadt" to "Sehr dunkel", each with dots, name and sentence, with a suggestion from the kind of place (big city 1, town 2, dark-sky place 5) and a line saying why. Place and darkness count at once and stay on the device; choosing another place replaces them.
  2. **Was du siehst**, directly below as soon as a place is chosen:
     - **Conditions:** one quiet box with two lines, dark from and the Moon with lit fraction and rise or set.
     - **Wann schaust du?** Three moments, „Abends“, „Mitternacht“, „Morgens“, each with its time, and below them one summary sentence („Um 20 Uhr siehst du 6 Dinge mit blossem Auge. Der helle Mond schluckt heute alles Blasse …“).
     - **Mit dem Auge zu sehen:** a list of the objects visible at that moment, place and darkness, from a fixed catalogue (Moon, Venus, Mars, Jupiter, Saturn, Grosser Wagen and Polarstern, Kassiopeia, Sommerdreieck, Kapella, Arktur, Orion with the Orion Nebula, Sirius, Plejaden, Milchstrasse, Andromedagalaxie). Each object is an expandable card: thumbnail, name and kind, position as compass direction and height in fists, ease („Sofort“, „Leicht“, „Etwas Übung“); expanded, a **dark night photo as seen with the naked eye with the object marked**, one sentence „Mit dem Auge:“, three or four numbered steps „So findest du es“ and the time span it is visible.
     - **Heute nicht zu sehen:** objects that tonight's Moon, twilight or the bright place hide, or that rise or set at another time of the night, each with its reason.
     - **Next good night for the Milky Way** when it is not visible tonight.
     - **Bevor du rausgehst:** three fixed tips and the fact sheet „Wie genau weiss man das?“.
- **Settings:** a small settings page („Einstellungen“, so far a placeholder) with two switches, night mode and the vibration of Modul A (whose own „Weitere Einstellungen“ panel goes away); its gear is shown on every page at the same place as on the home screen.
- **Night mode:** the switch in the settings turns the whole app red on black, including the home screen and the modules, with pictures tinted red, until it is switched off there. It is switched nowhere else; the Heute-Nacht page only points to the settings in a tip.
- **Home-screen card:** computed from the same rules: place, dark from, darkness, moon line and the **highlight of the night** with its position and the number of visible objects; when the Milky Way is not visible, its next good night.
- **Two variants** like the modules: the full page and a short variant for the guided journey's act 6 "Rausgehen" (the place can be skipped; then only the conditions, the summary sentence and the first three objects, collapsed) that the later guided journey can embed.
- **Removed from the first implementation:** the answer sentence about the band, the night timeline, the viewing directions with drawn band, the time slider, „So sieht es wirklich aus“ as a separate section, „Dein Himmel“ as a separate section (the darkness choice moves under the place), the mission of the night and its storage, the two-column desktop layout.
- Everything is calculated on the device from place, date and time; the feature sends no data anywhere.

**Decisions taken for the first version:**
- Darkness comes from the user's own choice, with a suggestion from the kind of place, not from a light-pollution map. Therefore no "darker place nearby" yet. (24 Nov 2026, suggestion added 26 Nov 2026)
- Places come from a list shipped with the app, not a search service. (24 Nov 2026)
- The object catalogue, the steps „So findest du es“ and the Milky Way's routes to the band are written by hand for Central Europe (about 45° to 56° North). Places outside get the list with positions but without steps. (26 Nov 2026)
- Pictures are freely licensed (public domain, CC0, CC BY, CC BY-SA), shipped with the app, with credits under each picture. Naked-eye photos show a dark night sky only; selected Wikimedia Commons photos serve until a consistent series exists. (26 Nov 2026)
- No mission of the night. (26 Nov 2026)
- Night mode applies to the whole app.
- No weather forecast; the page assumes a clear sky.
- No notifications, no observatories or dark-sky partners list, no sharing.

Out of scope (later changes): a light-pollution map with "darker place nearby", observatories and dark-sky partners, weather, reminders, special events (meteor showers, eclipses), objects and steps for other regions and the southern hemisphere, sharing, the guided journey itself.

## Capabilities

### New Capabilities
- `tonight`: the Heute-Nacht page: one page with place and darkness choice, conditions and summary, the three moments, the object catalogue with visibility rules, object cards with position, pictures with marks, eye sentence and steps, „Heute nicht zu sehen“, the Milky Way's next good night, tips, fact sheet, the two variants, privacy, accessibility and layout.
- `night-mode`: an app-wide red-on-black mode for use outdoors: switching it on and off, what it changes, persistence and contrast.
- `settings`: the settings page with the switches for night mode and vibration, and the gear at the same place on every page.

### Modified Capabilities
- `home-screen`: "Heute-Nacht card" shows computed values (dark from, the user's darkness, moon line, the highlight of the night with the number of visible objects) and the Milky Way's next good night when it is not visible; "Placeholder destinations" lists Heute Nacht and the settings among the real destinations; "Accessibility" covers night mode, without a night-mode control on the home screen.
- `outward-journey`: "Haptics" — the vibration is switched in the settings; the module loses its own settings panel.

## Impact

- **Code:** lazy feature folder `src/app/tonight/` (page, embeddable component, place field and darkness choice, object cards, figure thumbnails, marked photos, pure calculation of night, moon, planets, visibility and the Milky Way's routes, data for places, stars, objects, pictures and routes); `app.routes.ts` has a dedicated `heute-nacht` route instead of the placeholder; `core/tonight.ts` and `core/models.ts` (stored place and darkness, computed card info); a night-mode service and global styles; the home screen's card and top bar. The first implementation's timeline, viewing-direction drawings, time slider, reality comparison, mission card and mission engine and data are removed.
- **Data:** a place list derived from GeoNames (CC BY 4.0, credited in the app); bright-star positions from a public-domain catalogue; object texts and Milky Way routes written for the app; about 30 freely licensed pictures with credits and mark positions.
- **Dependencies:** `astronomy-engine` for the Sun, the Moon and the planets (see design.md), MIT licensed, no network.
- **Browser APIs:** `navigator.geolocation` only after an explicit tap.
- **Data on device:** the chosen place (rounded), the darkness level, the night-mode setting. No account, nothing sent. The first implementation's key for done missions is no longer read or written.
