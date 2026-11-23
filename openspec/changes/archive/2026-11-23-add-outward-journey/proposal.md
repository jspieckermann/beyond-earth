## Why

The home screen is in place, but every module behind it is still a placeholder. Modul A "Die Reise nach draussen" is the first movement of the experience (Akt 2 "Aufbrechen") and carries the core learning goal ("Wäre die Milchstrasse so gross wie Europa, wäre unser Sonnensystem ein Kronkorken"). The concept has been reworked into one continuous, immersive zoom from the Earth out to the whole universe (`concepts/Modul A Die Reise nach draussen.md`, 20 Nov 2026), and an interactive mockup of it has been reviewed. This change turns both into the real module.

## What Changes

- Replace the placeholder behind the Modul A star ("Eintauchen" → `/module/reise-nach-draussen`) with the full module:
  - **One continuous view, no screens.** The module starts with the whole Earth and its first texts. Zooming out widens the same picture through seven stages: Erde, Erde und Mond, Sonnensystem, Benachbarte Sternensysteme (Alpha/Proxima Centauri up to Sirius), die ganze Milchstrasse, die Lokale Gruppe, das ganze Universum. The Orion arm and the centre (Sagittarius A*) are selectable places in the Milky Way, Andromeda is a selectable galaxy in the Local Group. Earlier content never disappears, it only gets smaller.
  - **User-driven, stepless, logarithmic zoom.** Users zoom with two fingers, the scroll wheel, a vertical drag, the keyboard or the scale bar. On release the view eases into the nearest stage. Zooming back in works at any time, and the view never moves to another stage by itself.
  - **Texts only at a stage.** At each stage the title, the poetic line and the Aha comparison appear together, with an optional fact sheet ("Wie genau weiss man das?") laid translucently over the picture. While zooming, only the distance counts along, large and quiet.
  - **Scale bar on the edge.** It shows the distance in a familiar unit and the light time, names all seven stages and flies to a stage when tapped.
  - **The Earth stays findable and selectable.** Up to the solar system it is a sphere with its name, beyond that a small glowing point up to the edge of the universe, pointing the way back when it is off-screen. From the Moon stage on, the Earth can be tapped at every stage.
  - **Living spheres.** The Earth of the first stage turns slowly in time-lapse. At Erde und Mond, Earth and Moon are spheres (enlarged, true ratio and distance) that shrink to true size when the planets glide into the gap. In the solar system the Sun and the planets are spheres with their real surfaces, lit from the Sun, Saturn with its rings.
  - **Stretched emptiness** between the solar system and the neighbouring stars: a deliberately long stretch with nothing in it.
  - **Close-ups.** In the solar system every planet can be tapped (also by its name) to zoom in on it. There the planet can be rotated, and users see its line, its Aha, its facts and their own age there (after entering a birth year). Jupiter's and Saturn's large moons can be tapped. The Moon, the Sun, Voyager 1, the neighbouring stars, the parts of the Milky Way, the galaxies of the Local Group and the places of the universe open close-ups too.
  - **Colossal structures.** The universe stage marks Laniakea, the Bullet Cluster, the Boötes Void, the Hercules–Corona Borealis Great Wall, Webb's First Deep Field, JADES-GS-z14-0, the quasar TON 618 and the cosmic microwave background.
  - **Way home.** At the universe, "Und jetzt zurück. Nach Hause." appears with the stage texts and starts a ~10 s return flight when tapped, landing at the Earth with "All das. Und mittendrin: wir." The end offers: fly again, jump to a stage, share a picture.
  - **Branches** to B (neighbouring stars), F and G (Milky Way facts), D (Local Group) and C (light time in the solar-system facts). For now they lead to those modules' placeholder pages.
  - **No sound.** The module is silent: no generated sound and no narration voice. A short haptic pulse marks each snap and can be switched off.
  - **Two variants.** Free exploration (at the module route) offers everything. A guided main-journey variant (all seven stages, no close-ups, facts collapsed, no branches) is built as a mode the later guided journey can embed.
  - **Bundled real imagery and data**: Earth, Moon, Sun and planet textures (Solar System Scope, after NASA), Gaia/Hipparcos star positions, the Event Horizon Telescope image of Sagittarius A*, photos of Andromeda, the Triangulum galaxy and the Magellanic Clouds, Chandra, Webb, Sloan and Planck images for the universe, reconstructions or simulations for the Milky Way, Laniakea and the cosmic web, and a schematic drawing of the Local Group. All are self-hosted and credited, and reconstructions are labelled.
- **Share cards** (new, reusable): picture cards drawn on the device (Kronkorken, coin model of Milky Way and Andromeda, "Auf dem Mars wäre ich 16"). They go to the system share sheet, or are downloaded where sharing is not available.
- Completing the module marks A as explored, so its star glows brighter on the home screen.
- The module preview on the home screen grows with its text, so title and line are never cut off on phones and tablets.

Out of scope (later changes): the guided journey "Die Reise" itself and its hand-over to Modul C, the content of modules B–G behind the branches, translations and localized comparisons (another continent instead of Europa).

## Capabilities

### New Capabilities
- `outward-journey`: Modul A as one continuous zoom from the Earth to the universe. Covers the seven stages and their content rhythm, the zoom controls and snapping, the scale bar with jumping, the selectable Earth and its marker, the stretched emptiness, the close-ups with age and moons, the way home and end, branches, haptics (and no sound), the two variants, imagery and credits, completion, accessibility and responsiveness.
- `share-cards`: Picture cards drawn on the device and handed to the system share sheet, with a download fallback.

### Modified Capabilities
- `home-screen`: The "Placeholder destinations" requirement now excludes destinations that have a real experience. Modul A opens its experience instead of a placeholder. The "Module preview" requirement now asks that title and line are always shown in full.

## Impact

- **Code**: new lazy feature folder `src/app/outward-journey/` (route page, zoom engine, stage renderers, sphere renderers, scale bar, text overlay, fact sheet, close-up, end view, haptics, stage data). New `src/app/core/` services for the birth year, module settings and share cards. `app.routes.ts` gets a dedicated route for `module/reise-nach-draussen` ahead of the generic module route. On the home screen, the module preview changes from a fixed to a minimum height.
- **Assets**: new `public/journey/` folder with optimized images and textures (WebP, several sizes), a compact star catalogue (JSON) and a manifest. This makes the build noticeably bigger, but everything is loaded lazily, stage by stage, and only on this route.
- **Browser APIs** (all optional, feature-detected): `navigator.vibrate`, Web Share with files, Canvas.
- **Dependencies**: no new runtime dependency. One dev-only dependency (`sharp`) for the build-time scripts that cut and encode images.
- **Data on device** (localStorage, no account): birth year, the vibration setting, explored flag for A. No location is used by this module.
- **Licences**: every image and data set must be public domain or allow redistribution with attribution (NASA, ESA, CSA, STScI, Chandra, Sloan, Planck, EHT and others). They are tracked in the credits and shown in the app.
