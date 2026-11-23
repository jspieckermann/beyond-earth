# Licence review: Modul A pictures and data

First reviewed on 20 Nov 2026 against the source pages (Wikimedia Commons file pages and their licence metadata, Solar System Scope, HYG repository). Updated on 23 Nov 2026 for the pictures added since, from the licence metadata the Wikimedia Commons API reports for each file. Every file under `public/journey` is produced by `scripts/build-journey-assets.mjs` from the sources below and listed in `src/app/outward-journey/data/credits.ts`, which the app shows under "Bildnachweise" and in each fact sheet.

| Asset | Source | Licence | Kind shown | Verdict |
| --- | --- | --- | --- | --- |
| Earth day and night, Sun surface, Moon and planet textures (Merkur–Neptun) | Solar System Scope (INOVE), based on NASA imagery and data | CC BY 4.0 | Aufnahme | OK with attribution (given in credits) |
| Voyager 1 | NASA/JPL, Commons "Voyager spacecraft.jpg" | Public domain (NASA) | Illustration | OK |
| Star positions | HYG database v4.1 (Gaia, Hipparcos, Yale), astronexus | CC BY-SA 4.0 | Messdaten | OK; derived `stars.json` is shared under the same licence (noted in the file's `source` field) |
| Orion arm (crop) and Milky Way top view | NASA/JPL-Caltech/ESO/R. Hurt, Commons "Artist’s impression of the Milky Way.jpg" | Public domain | Rekonstruktion | OK; labelled as reconstruction, facts say no one has photographed the Milky Way from outside |
| Sagittarius A* | EHT Collaboration, Commons "EHT Saggitarius A black hole.tif" | CC BY 4.0 | Aufnahme | OK with attribution |
| Andromeda galaxy | Adam Evans, Commons "Andromeda Galaxy (with h-alpha).jpg" | CC BY 2.0 | Aufnahme | OK with attribution |
| Triangulum galaxy | ESO, Commons "VST snaps a very detailed view of the Triangulum Galaxy.jpg" | CC BY 4.0 | Aufnahme | OK with attribution |
| Large Magellanic Cloud | ESO, Commons "LMC snapped by the ESO 1-metre Schmidt telescope.jpg" | CC BY 4.0 | Aufnahme | OK with attribution |
| Small Magellanic Cloud | ESA/Hubble and Digitized Sky Survey 2, Commons "Small Magellanic Cloud (Digitized Sky Survey 2).jpg" | CC BY 4.0 | Aufnahme | OK with attribution |
| Local Group | Own schematic drawing | own | Illustration | OK; facts say it is schematic (see decision) |
| Cosmic web | Volker Springel / MPI für Astrophysik (Millennium simulation), Commons "Cosmic web.jpg" | CC BY-SA 4.0 | Simulation | OK with attribution; the derived WebP is shared under the same licence. Also shown for the Boötes Void and the Great Wall, whose facts say there is no photo of them. |
| Laniakea supercluster | UniViki, Commons "Laniakea Supercluster (Cropped).png" (after the map of Tully et al. 2014) | CC BY 4.0 | Illustration | OK with attribution |
| Bullet Cluster (1E 0657-56) | NASA/CXC/M. Markevitch et al.; NASA/STScI, Magellan/U. Arizona/D. Clowe et al., Commons "Visible-Light and X-Ray Composite Image of Galaxy Cluster 1E 0657-556 (2006-39-1981).jpg" | Public domain (NASA) | Aufnahme | OK |
| Webb's First Deep Field (SMACS 0723) | NASA, ESA, CSA and STScI, Commons "Webb's First Deep Field.jpg" | Public domain | Aufnahme | OK |
| JADES-GS-z14-0 | NASA, ESA, CSA, STScI, B. Robertson, B. Johnson, S. Tacchella, P. Cargile, Commons "Webb finds most distant known galaxy (JADES-GS-z14-0 annotated pullout NIRCam image) (jades4).jpg" | CC BY 4.0 | Aufnahme | OK with attribution |
| TON 618 | Sloan Digital Sky Survey, Apache Point Observatory, Astrophysical Research Consortium, Commons "TON 618 SDSS9 version 2.jpg" (cropped around the quasar) | CC BY 4.0 | Aufnahme | OK with attribution |
| Cosmic microwave background | ESA and the Planck Collaboration, Commons "Cosmic Microwave Background (CMB).jpeg" | CC BY 4.0 | Messdaten | OK with attribution |

## Removed since the first review

- **Sun photo** (NASA/SDO): the Sun in the solar system is now a sphere with the Solar System Scope texture; the photo and its files were removed.
- **Galactic centre bulge** and **Milky Way edge-on view**: no longer shown since the centre became a selectable place and the tilt was dropped.

## Decision

- The Local Group was planned as a rendering from the McConnachie (2012) catalogue. The catalogue service (VizieR, CDS) was unavailable during the build. On 20 Nov 2026 it was decided to keep the schematic drawing, labelled as an illustration in the credits and the fact sheet. A catalogue-based rendering can follow in a later change.
- The licences of the pictures added on 23 Nov 2026 were taken from the Commons metadata. Their source pages (NASA, ESA, STScI, Chandra, SDSS) were not checked again separately.
