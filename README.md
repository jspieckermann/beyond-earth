# BeyondEarth

## About the project

Die Milchstrasse erleben is a web app that lets laypeople feel the scale of our galaxy instead of just looking at it, from a zoom out to the edge of the universe and journeys at light speed to the history of the Earth told in rounds around the galaxy. Above all, the project evaluates the AI-assisted interplay of vision, rough concept, detailed concept and spec-driven design.

### Concepts

The app is written in German, and so are its concepts:

- [Vision: Die Milchstrasse erleben](concepts/Vision.md): the initial prompt the concept was built from
- [Konzept: Die Milchstrasse erleben](concepts/Konzept%20Die%20Milchstrasse%20erleben.md): rough concept of the whole app
- [Modul A: Die Reise nach draussen](concepts/Modul%20A%20Die%20Reise%20nach%20draussen.md): detailed concept of the zoom from the Earth to the universe
- [Modul B: Reisen mit Lichtgeschwindigkeit](concepts/Modul%20B%20Reisen%20mit%20Lichtgeschwindigkeit.md): detailed concept of the light-speed travel planner
- [Modul C: Das galaktische Jahr](concepts/Modul%20C%20Das%20galaktische%20Jahr.md): detailed concept of the Sun's journey around the galactic centre and the Earth of the past

The specifications derived from them live in [openspec/specs](openspec/specs), the archived changes in [openspec/changes/archive](openspec/changes/archive).

## Screenshots

### Home screen

The modules are stars along the band of the Milky Way. Selecting a star opens a short preview.

| Desktop | Phone, with a module preview |
| --- | --- |
| ![Home screen on a desktop](docs/screenshots/home-desktop.jpg) | ![Home screen on a phone with the preview of "Reisen mit Lichtgeschwindigkeit"](docs/screenshots/home-preview-phone.jpg) |

### Modul A: Die Reise nach draussen

One continuous zoom from the Earth to the observable universe, resting at seven stages.

| Die Erde | Erde und Mond |
| --- | --- |
| ![Stage "Die Erde"](docs/screenshots/a1-erde.jpg) | ![Stage "Erde und Mond"](docs/screenshots/a2-mond.jpg) |

| Das Sonnensystem | Benachbarte Sternensysteme |
| --- | --- |
| ![Stage "Das Sonnensystem"](docs/screenshots/a3-sonnensystem.jpg) | ![Stage "Benachbarte Sternensysteme"](docs/screenshots/a4-alpha-centauri.jpg) |

| Die ganze Milchstrasse | Die Lokale Gruppe |
| --- | --- |
| ![Stage "Die ganze Milchstrasse"](docs/screenshots/a5-milchstrasse.jpg) | ![Stage "Die Lokale Gruppe"](docs/screenshots/a6-lokale-gruppe.jpg) |

| Das ganze Universum |
| --- |
| ![Stage "Das ganze Universum"](docs/screenshots/a7-universum.jpg) |

Every named object can be opened up close, from the planets to galaxies and the most distant places.

| Andromeda up close | Mars up close (phone) | Solar system (phone) |
| --- | --- | --- |
| ![Close-up of Andromeda](docs/screenshots/a-andromeda-closeup.jpg) | ![Close-up of Mars on a phone](docs/screenshots/a-mars-closeup-phone.jpg) | ![The solar system on a phone](docs/screenshots/a-solar-system-phone.jpg) |

### Modul B: Reisen mit Lichtgeschwindigkeit

A travel planner: choose a place from Modul A and a speed, and see how long the journey takes on board and on Earth, and how many generations it needs.

| Desktop | Tablet: Sagittarius A* at 99.9999 % |
| --- | --- |
| ![Travel planner on a desktop](docs/screenshots/b-planner-desktop.jpg) | ![Travel planner on a tablet, journey to Sagittarius A* at 99.9999 % of the speed of light](docs/screenshots/b-planner-tablet-sgr-a.jpg) |

| Speeds of real and planned spacecraft | Choosing a destination | Sharing a journey |
| --- | --- | --- |
| ![Speed presets Voyager 1, Orion, Longshot, Daedalus and Starshot](docs/screenshots/b-voyager-phone.jpg) | ![Searchable destination list grouped by the stages of Modul A](docs/screenshots/b-destination-picker-phone.jpg) | ![Share dialog with the travel card to Andromeda](docs/screenshots/b-share-card-phone.jpg) |

The travel card is drawn on the device and saved under the name of the destination, here `mars.png`:

![Travel card: "Nach Mars mit 0,0057 % der Lichtgeschwindigkeit: 37 Tage. An Bord vergeht dabei eine Generation."](docs/screenshots/b-travel-card.jpg)

### Modul C: Das galaktische Jahr

The whole Solar System races around the centre of the Milky Way at about 230 km/s; one round, a galactic year, takes 230 million years. A slider turns the Sun back along its orbit, up to twenty rounds, through 24 stations of Earth's history. A small globe shows the Earth of that time. Fine rings show how many rounds the Sun had completed by then: about 20 today, none at its formation.

| Desktop: one round back, Pangaea and the first dinosaurs |
| --- |
| ![Modul C on a desktop: one round back, 230 million years ago, with Pangaea on the globe](docs/screenshots/c-dinosaurier-desktop.jpg) |

| One round explained (phone) | Snowball Earth, three rounds back (tablet) | The Sun's formation, twenty rounds back (phone) |
| --- | --- | --- |
| ![The part "Eine Runde" on a phone](docs/screenshots/c-runde-phone.jpg) | ![Three rounds back on a tablet: Snowball Earth](docs/screenshots/c-schneeball-tablet.jpg) | ![Twenty rounds back on a phone: the Sun and the Earth form](docs/screenshots/c-entstehung-phone.jpg) |

Sources and licences of the pictures shown in the screenshots are listed in the app under "Bildnachweise".

---

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
