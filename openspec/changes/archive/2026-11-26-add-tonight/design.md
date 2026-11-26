## Context

The home screen already renders a Heute-Nacht card (`home/tonight-card.ts`) fed by `TonightService` (`core/tonight.ts`); before this change `/heute-nacht` was a `placeholderRoute`. The modules (A, B, C) set the patterns this feature follows: a lazy feature folder with a route page and an embeddable component (`variant` input, `completed` output), pure engines under `engine/` with unit tests, data under `data/`, `FactSheet` from `core`, `LocalStore` for device storage, `CLOCK` for "now", `REDUCED_MOTION_QUERY`. Colours are CSS custom properties in `src/styles.css` (`--color-night-*`, `--color-ink*`, `--color-starlight`, …). See proposal.md for motivation and the decisions taken with the user.

**State of this change:** a first implementation (24 Nov 2026) built the band guide: answer, timeline, viewing directions with drawings and a time slider, reality comparison, „Dein Himmel“ and the mission. The second mockup (26 Nov 2026, `concepts/Heute Nacht.md`) replaced the page with two steps and a list of naked-eye objects; the third mockup (also 26 Nov 2026) puts both on one page, with a combined place field, the darkness as a dropdown, the conditions as one quiet box, the summary below the moments, and only dark night photos. This design describes the target; section 11 lists what of the first implementation is kept, reshaped or removed.

## Goals / Non-Goals

**Goals:**
- Correct Sun, Moon, planet, star and band positions for any place and date, on the device, offline.
- Object texts and steps that read like a person wrote them, while directions, heights and times are always calculated.
- Honest expectations: every object shows a dark naked-eye photo with the object marked; no close-ups that show more than the eye.
- A night mode that reliably leaves no white or blue light anywhere in the app.
- The home screen stays light: the astronomy code and the pictures load only when they are needed.

**Non-Goals:**
- A sky chart or planetarium; objects that need binoculars or a telescope; Mercury; special events.
- Light-pollution data, weather, observatories, notifications (later changes).
- Geocoding beyond the shipped list; reverse geocoding by a service. „Dein Standort“ only gets the nearest town of the shipped list within 25 km in brackets (`nearestTown` and `deviceName` in `data/places.ts`, a plain distance scan over the list on the device).

## Decisions

### 1. Folder and units

```
src/app/tonight/
  tonight-page.ts               route page (free variant)
  tonight.ts/.html/.css         one page: place on top, the sky below; input variant 'frei' | 'hauptreise', output completed
  place/place-picker.ts         one combobox field (shows the place, searches, popup list) and „Meinen Standort verwenden“
  place/darkness-choice.ts      the five levels as a select-only combobox, with the suggestion line
  ui/conditions.ts              one quiet box: dark from and the Moon
  ui/object-card.ts             one expandable object
  ui/marked-photo.ts            naked-eye photo with an SVG overlay of marks
  ui/star-drawing.ts            thumbnail of a figure from star positions
  ui/hidden-list.ts             „Heute nicht zu sehen“
  engine/ephemeris.ts           thin wrapper over the astronomy library (Sun, Moon, planets, star alt/az)
  engine/night.ts               tonight's window, twilight, moon spans, dark spans, next good night for the band
  engine/moments.ts             „Abends“, „Mitternacht“, „Morgens“
  engine/visibility.ts          visible / reason per object and moment, visible span, ordering, highlight
  engine/summary.ts             summary sentence, the two condition lines
  engine/band.ts                band samples in alt/az (for the Milky Way's position and routes)
  engine/directions.ts          compass words, fists in words
  engine/routes.ts              the Milky Way's route choice and filling
  data/places.json + places.ts  shipped place list, search, darkness suggestion
  data/stars.ts                 bright stars (J2000) and figure lines
  data/objects.ts               the object catalogue with texts and steps
  data/pictures.ts              picture files, credits, captions, marks
  data/routes.ts                hand-written routes to the band
public/tonight/img/             the picture files (WebP: one naked-eye photo per object, thumbnails)
core/night-mode.ts              app-wide setting
core/tonight.ts                 stored place and darkness; computes the card info
```

### 2. Astronomy library: `astronomy-engine`

Sun and Moon rise, set and twilight times need a real ephemeris and root search; planets need real positions. `astronomy-engine` (MIT, version 2.1.x, no dependencies, no network) provides `SearchRiseSet`, `SearchAltitude`, `Illumination` (lit fraction and magnitude), `Equator`/`Horizon` for Sun, Moon and planets with precession, nutation and refraction, and the galactic rotation matrix, validated against JPL Horizons to well under an arcminute. It is wrapped in `engine/ephemeris.ts` so the rest of the engine is plain arithmetic and the library can be replaced. The wrapper gains `bodyPosition(body, date, place)` for Venus, Mars, Jupiter and Saturn and `riseSet(body, …)` for their visible spans.

The library is only imported by the tonight chunk. The home card imports `core/tonight.ts`, which loads the engine with a dynamic `import()` after the home screen has rendered; until then the card shows place and darkness and a quiet „…“.

### 3. Tonight's window and the dark spans

All instants are UTC `Date`s; local presentation uses `Intl.DateTimeFormat('de-DE', { timeZone })` with the place's IANA zone (the device zone for „Dein Standort“). "Tonight" is a window from local noon to the next local noon: before 12:00 local it is yesterday 12:00 to today 12:00, otherwise today 12:00 to tomorrow 12:00. Within the window `night.ts` finds sunset/sunrise, the −6°, −12° and −18° crossings, and the Moon's rise/set and lit fraction; the Moon disturbs above the horizon while the fraction is above 0,25. The **next good night for the Milky Way** is the first of the next 30 windows with a dark (−18°) span without a disturbing Moon of at least 60 minutes (about 30 × a handful of root searches, well under 100 ms on a mid phone; computed once per place and day and cached in memory). Times are rounded to five minutes only for display.

### 4. The three moments

`moments.ts` returns three instants: **Abends** = end of nautical twilight (Sun −12°), not before 20:00 local, rounded to the full hour; **Mitternacht** = midpoint between sunset and sunrise, rounded to the full hour; **Morgens** = start of nautical twilight, rounded down to the full hour. If the Sun does not reach −12°, the three are the darkest moment −2 h, the darkest moment and +2 h. The preselected moment is the first one still ahead of "now" (`CLOCK`) or less than an hour past, so that at 20:30 the page still shows „Abends“; during the day it is „Abends“; after „Morgens“ it is „Morgens“.

### 5. Object catalogue and visibility

`data/objects.ts` holds 16 entries (the spec's list plus the Skorpion with Antares, the summer object low in the south that June nights need): `id`, `name`, `kind`, `ease` (`sofort` | `leicht` | `uebung`), `minDarkness`, `moonSensitive`, `sunLimit` (0 for the Moon, −3 for Venus and Jupiter, −6 for Mars and Saturn, −8 for single bright stars, the Sommerdreieck and the Skorpion, −9 for the other figures and the Plejaden, −18 for Milky Way and Andromeda; with −12 for all stars, bright May and June nights at 56° N would show fewer than five objects), `position` (`{ body }` for Moon and planets, `{ star }` for a named star, `{ figure, anchor }` for a figure with the star that defines its position), `eye` (the „Mit dem Auge“ sentence, optionally per darkness level), `steps` (templates with `{dir}`, `{fists}`, and an alternative set for altitude ≥ 70°), and `pictures` (keys into `data/pictures.ts`).

`visibility.ts` evaluates, for one object, moment, place and darkness, the rules in order: darkness ≥ `minDarkness` (else reason `ort`), Moon not disturbing if `moonSensitive` (else `mond`), Sun below `sunLimit` (else `daemmerung`), altitude ≥ 10° (else, below the horizon, `aufgang` with the time it reaches 10° when that comes later tonight or `untergang` with the set time when it was up earlier; above the horizon but lower than 10°, `tief`, with the time it reaches 10° again if it does tonight). The visible span samples the window every 10 minutes and refines the edges by bisection to one minute. An object is listed under „Heute nicht zu sehen“ only if it is visible at some moment of tonight or is hidden only by `ort`, `mond` or `daemmerung`; the Milky Way is always listed somewhere. Two planets closer than 5° are merged into one card („Jupiter und Mars“), using the brighter one's position.

**Ordering:** Milky Way first when visible, then by ease, then by brightness (magnitude from the library for bodies, catalogue magnitude for stars, a fixed value per figure). **Highlight** for the home card: the Milky Way if visible at any moment, else the brightest planet visible at the preselected moment, else the brightest planet visible at another moment, else the first listed object other than the Moon.

A unit test sweeps all nights of a year at 45°, 50° and 56° N (10° E) at darkness 2 and fails if no moment shows at least five objects.

### 6. The Milky Way card

The Milky Way's position is the brightest band sample above 15° (band samples from `band.ts`: galactic latitude 0° every 2° of longitude, weighted towards the galactic centre). Its steps reuse the hand-written routes to the band: `routes.ts` picks, for the chosen moment, the compass sector with the most band samples above 15° that has a valid route (all pointer stars ≥ 10°) and fills it, ending with „Folge dem Band nach oben.“ and the meeting point (first of Kassiopeia, Schwan, Fuhrmann, Perseus, Adler within 30° of the zenith, else the highest pointer in the band). The route data and the year sweep test from the first implementation stay.

### 7. Pictures and marks

Each object has a naked-eye photo and a `look`: a thumbnail photo (`THUMBS`, only the 128 px square is built, `thumbOnly` in `picture-sources.json`), or for figures and stars a small drawing of the figure as thumbnail. The close-ups through a telescope or from a space probe and the large figure drawings were removed from the card on 26 Nov 2026: the close-ups showed what the eye does not see, and the figure is already drawn into the photo. `data/pictures.ts` lists for each photo: file, width and height in pixels, caption, author, licence, source URL, and marks in image pixels: `{ x, y, r, label, minor?, labelAbove? }` plus optional `lines: [x, y][]` for a figure. `marked-photo.ts` renders the `<img>` and an absolutely positioned SVG with `viewBox="0 0 w h"` over it, so marks scale with the image: a solid ring with label for the target, dashed thinner rings for orientation points, a polyline with small rings for figure lines; labels use the token colours with a dark halo (`paint-order: stroke`). `star-drawing.ts` projects a figure's stars around their centre (x = −ΔRA·cos δ₀, y = −Δδ; north up, east left) into a 64 × 64 viewBox, with dot size by magnitude, as a decorative thumbnail.

Files are WebP, at most 960 px wide and about 60 kB each (14 photos and 9 thumbnails, about 1,3 MB total), in `public/tonight/img/`, loaded lazily only when a card is expanded (`loading="lazy"`, thumbnails at 128 px). `scripts/build-pictures.mjs` builds them from `data/picture-sources.json`; an entry may name a download `width` and a `crop` (for the Moon photo, to leave out the photographer's logo, and for the Sommerdreieck, one half of a side-by-side file), and the script can rebuild single pictures by id. Naked-eye photos are dark night photos only: no twilight, no blue or red sky, no clouds lit grey by city light; Venus, which is never seen in a fully dark sky here, is shown in a dark Chilean sky with a caption that says so. Faint stars survive the WebP compression at quality 68 (checked against the source). Alternative: loading from Wikimedia at runtime. Rejected: network, privacy, availability. Only public domain, CC0, CC BY and CC BY-SA are accepted; the credits are shown under each picture and collected in the fact sheet.

### 8. Places and the darkness suggestion

`scripts/build-places.mjs` (committed, run by hand) turns GeoNames `cities15000` for DE, AT and CH into `data/places.json` (`name`, `region`, `lat`/`lon` rounded to 0,01°, `tz`, `pop`), plus a hand-maintained list of International Dark Sky Places in the three countries (`dark: true`). Search as before: normalised case, umlauts, ß and diacritics, prefix before word-start before substring, ties by population, at most eight. Without input the suggestions are the stored place and two dark-sky places.

The suggested darkness is `dark ? 5 : pop ≥ 500 000 ? 1 : 2`, and 2 for „Dein Standort“. Choosing a place stores it together with the suggested level at once; the user's choice overrides it and is stored. `suggestionReason` gives the line below the darkness choice („Vorgeschlagen für eine Grossstadt.“), shown while the stored level equals the suggestion.

**Place field.** `place-picker.ts` is an ARIA 1.2 combobox: an `<input role="combobox" aria-autocomplete="list">` whose value is the stored place's name while not editing (`query = null`) and the typed text while editing. Focus selects the name (a moment after the focus event, and the mouseup of the focusing click is prevented, so that the browser does not collapse the selection). The popup `<ul role="listbox">` opens on focus and input; the active option is announced through `aria-activedescendant`; options are picked on `mousedown` (with `preventDefault`, so the field keeps focus); Escape and leaving the component close it and show the stored name again. A visually hidden status announces the number of suggestions. Below the field: the region of the place (or the privacy note while none is chosen) and the „Meinen Standort verwenden“ button.

**Darkness choice.** `darkness-choice.ts` is a select-only combobox: a `<button role="combobox" aria-haspopup="listbox">` showing the chosen level (dots, name, sentence, chevron) and a popup `<ul role="listbox">` with all five levels in the same form, the chosen one ticked. Arrow keys, Home and End move the active option, Enter or Space picks, Escape and leaving close; the active option is outlined only while the keyboard moves it.

Geolocation goes through an injection token wrapping `navigator.geolocation.getCurrentPosition` (`enableHighAccuracy: false`, 10 s timeout); the result is rounded to 0,05° before anything else sees it.

### 9. Storage

`LocalStore` keys: `be.tonight.place.v1` (`{ name, region?, lat, lon, tz, source: 'list' | 'device' }`), `be.tonight.darkness.v1` (1–5), `be.nightMode.v1`. `be.tonight.missions.v1` is no longer used and is removed when the place is forgotten. `TonightInfo` in `core/models.ts` becomes `{ location, darkness, headline, darkFrom?, moon?, milkyWayNext? }`; `headline` carries the count and the highlight („7 Dinge mit blossem Auge, zum Beispiel Saturn im Süden.“) and is „…“ while tonight is calculated. Unreadable storage behaves like "no place".

### 10. Night mode

`core/night-mode.ts` (`@Service`) holds an `on` signal persisted under `be.nightMode.v1` and mirrors it to `document.documentElement.classList` (`night`) and to `<meta name="theme-color">`. `html.night` in `styles.css` redefines every colour token to a red palette on black, chosen so text stays ≥ 4,5:1 and outlines ≥ 3:1, and applies `filter: grayscale(1) sepia(1) saturate(4) hue-rotate(-30deg) brightness(.55)` to `img`, `canvas`, `video` and SVG pictures (`.picture`). The marks over photos use tokens and are therefore red but not filtered, so they stay readable. A Playwright check samples screenshots of the home screen, the three modules and Heute Nacht (with a stored place and an expanded card) in night mode and fails on any pixel whose green or blue channel exceeds its red channel by more than a small tolerance. Only `settings/settings-page.ts` (route `einstellungen`, replacing its placeholder) switches it, with a `role="switch"` button „Nachtmodus“ and the brightness hint; the Heute-Nacht page and the home screen only read `on` (the Heute-Nacht tip pointing to the settings is shown while it is off).

### 10a. Settings and the gear

`settings/settings-page.ts` (route `einstellungen`) holds two `role="switch"` buttons: „Nachtmodus“ (`NightMode`) and „Vibration“ (`JourneySettings`, key `be.journey`, which Modul A's haptics already read). „Zurück“ links to the last page shown before the settings: `core/return-url.ts` (`ReturnUrl`, created by the app shell at start) records every `NavigationEnd` outside `/einstellungen`; it starts at `/`, so settings opened directly lead to the home screen. The link is a real `routerLink` to that address, not a history step. `core/settings-link.ts` is the gear; `App` renders it after the router outlet on every page except `/` (the home screen keeps its own gear) and `/einstellungen`, positioned absolutely with the home screen's coordinates per `LayoutMode` (phone: right 14px, top 30/390 of the width; tablet: 30/30; desktop: 40/36), so it does not move between pages. Modul A's `ui/journey-controls.ts` is removed and its header keeps a 44px space for the gear. An e2e test compares the gear's position on every page with the home screen's.

### 11. Page, variants and what changes from the first implementation

`app.routes.ts` keeps `{ path: 'heute-nacht', title: 'Heute Nacht · Die Milchstrasse erleben', loadComponent: tonight-page }`. The page has no steps: the place section („Wo stehst du heute Nacht?“, place field, darkness choice) is always shown, the sky section below it only with a stored place, and it follows the stored place and darkness signals directly. Focus starts on the place question; There is no „Ort vergessen“ on the page (removed on 26 Nov 2026); `TonightService.forget()` stays for a later settings entry. One column, at most 34rem, at every width. The guided variant is the same component with `variant="hauptreise"`: closing line, the place section (with „Überspringen“ while no place is stored), then the conditions, the summary sentence and the first three object cards collapsed, closing sentence and `completed`.

| First implementation | Now |
| --- | --- |
| `engine/ephemeris.ts`, `night.ts`, `band.ts`, `routes.ts`, `data/routes.ts`, `data/stars.ts`, `data/places*`, `place/place-picker.ts`, `place/darkness-choice.ts`, `place/geolocation.ts`, `core/night-mode.ts` | kept; ephemeris gains planets, night gains −6°/−12° crossings, darkness choice gains the suggestion and new labels |
| `engine/directions.ts` | reduced to compass words and fists in words; sector scoring moves into `routes.ts` |
| the step bar (`ui/step-bar.ts`), „Was sehe ich heute Nacht?“, the radio group for the darkness, three condition tiles | removed by the third mockup: one page, combobox place field and darkness dropdown, two-line conditions box |
| `engine/answer.ts`, `engine/timeline.ts`, `engine/view.ts` | replaced by `summary.ts`, `moments.ts`, `visibility.ts` |
| `ui/night-timeline.ts`, `ui/sky-view.ts`, `ui/zenith-view.ts`, `ui/sky-guide.*`, `ui/reality-compare.ts`, `ui/mission-card.ts` | removed |
| `engine/missions.ts`, `data/missions.ts`, mission storage | removed |
| two-column layout from 1100 px | removed |

## Risks / Trade-offs

- [Too few objects on some nights, e.g. bright summer nights in the north] → Moon, planets and the brightest stars only need −6° or −12°; the year sweep test makes gaps visible; objects can be added to the catalogue.
- [Pictures: inconsistent sources, licences, size] → Only free licences with credits and only dark night photos; WebP and lazy loading; a consistent own series is an open question in the concept and replaces files without code changes, since marks live in `pictures.ts`.
- [Marks drift when a picture is replaced] → Marks are stored with the picture's pixel size; a unit test checks that every mark lies inside its picture and every picture file exists with the stated size.
- [Self-assessed darkness is wrong (people overrate their sky)] → Plain descriptions, a suggestion from the kind of place, the naked-eye photos, and the level is easy to change; a light-pollution map can replace the suggestion later.
- [Bundle size of the astronomy library and pictures] → Loaded only in the tonight chunk and, for the card, by dynamic import after first render; pictures from `public/`, never bundled; budget checked in the build.
- [Hard-coded colours escape night mode] → Token audit plus the screenshot pixel check per page.
- [Almanac reference values] → Fixtures recorded from timeanddate.com's monthly sun and moon tables for Hamburg, München and Zürich on three dates, checked to ±5 min (USNO was not reachable).
- [Device location abroad with a different time zone than the device] → Rare; times follow the device zone.

## Migration Plan

New route and storage keys only; the old placeholder route is removed. The stub `TonightService` is replaced in place, so the card keeps working for users without a place. The mission key from the first implementation was never released and is simply ignored. Rollback: reverting the commit brings back the placeholder; the storage keys are ignored by the old code.

## Open Questions

- The final picture series (own photos, a partner observatory or selected Commons photos); see the concept's open questions.
- Exact wording of the eye sentences and steps for all catalogue objects beyond the examples in the concept, to be written during implementation and reviewed with the astronomy check listed in the concept.
