import { OBJECTS, StepContext } from './objects';
import { ALLOWED_LICENCES, EYE_VIEWS, THUMBS, PICTURE_IDS, PICTURE_MANIFEST, PICTURE_SOURCES, picture } from './pictures';
import { COMPASS_ROUTES, ZENITH_ROUTES } from './routes';
import { FIGURES, STARS, figureStars, isStarId, star } from './stars';
import { ROUTE_REGION, hasRoutes } from '../engine/region';
import { LIST_LONGITUDES, MAX_SUGGESTIONS, PLACES, darkSkySuggestions, listedPlace, normalize, nearestTown, deviceName, searchPlaces, suggestedDarkness, suggestionReason } from './places';

describe('the place list', () => {
  it('has the big towns of the three countries and dark-sky places', () => {
    const names = PLACES.map((p) => p.name);
    for (const name of ['Hamburg', 'München', 'Zürich', 'Wien', 'Lüneburg']) {
      expect(names).toContain(name);
    }
    expect(PLACES.some((p) => p.dark && p.name === 'Sternenpark Westhavelland')).toBe(true);
    expect(PLACES.length).toBeGreaterThan(900);
  });

  it('keeps coordinates rounded to 0,01° with a time zone and a region', () => {
    for (const p of PLACES) {
      expect(Math.round(p.lat * 100) / 100).toBe(p.lat);
      expect(Math.round(p.lon * 100) / 100).toBe(p.lon);
      expect(['Europe/Berlin', 'Europe/Vienna', 'Europe/Zurich', 'Europe/Busingen']).toContain(p.tz);
      expect(p.region.length).toBeGreaterThan(0);
    }
    expect(LIST_LONGITUDES.min).toBe(ROUTE_REGION.minLon);
    expect(LIST_LONGITUDES.max).toBe(ROUTE_REGION.maxLon);
    expect(PLACES.every((p) => hasRoutes(p))).toBe(true);
    expect(hasRoutes({ lat: 40.42, lon: -3.7 })).toBe(false);
    expect(hasRoutes({ lat: 59.33, lon: 18.07 })).toBe(false);
  });
});

describe('the place search', () => {
  it('finds Lüneburg with its region from "Lüne"', () => {
    const hits = searchPlaces('Lüne');
    expect(hits.find((p) => p.name === 'Lüneburg')).toMatchObject({ region: 'Niedersachsen' });
  });

  it('finds Zürich from "Zur" and München from "Munchen" or "Muenchen"', () => {
    expect(searchPlaces('Zur')[0].name).toBe('Zürich');
    expect(searchPlaces('Munchen')[0].name).toBe('München');
    expect(searchPlaces('Muenchen')[0].name).toBe('München');
    expect(searchPlaces('strasse').every((p) => normalize(p.name).includes('strasse'))).toBe(true);
  });

  it('ranks prefixes before word starts before other matches, then by size', () => {
    const hits = searchPlaces('burg').map((p) => p.name);
    expect(hits[0]).toBe('Burgdorf');
    const berg = searchPlaces('berg');
    expect(normalize(berg[0].name).startsWith('berg')).toBe(true);
  });

  it('shows at most eight suggestions and nothing for an empty query', () => {
    expect(searchPlaces('a')).toHaveLength(MAX_SUGGESTIONS);
    expect(searchPlaces('  ')).toEqual([]);
    expect(normalize('Straße Österreich')).toBe('strasse osterreich');
  });
});

describe('the pointer stars', () => {
  it('has about thirty pointers with known positions', () => {
    expect(STARS.filter((s) => s.pointer).length).toBeGreaterThanOrEqual(28);
    // Reference values (J2000, Yale Bright Star Catalogue).
    expect(star('wega').ra).toBeCloseTo(279.23, 1);
    expect(star('wega').dec).toBeCloseTo(38.78, 1);
    expect(star('deneb').dec).toBeCloseTo(45.28, 1);
    expect(star('kapella').ra).toBeCloseTo(79.17, 1);
    expect(star('polarstern').dec).toBeCloseTo(89.26, 1);
    for (const s of STARS) {
      expect(s.ra).toBeGreaterThanOrEqual(0);
      expect(s.ra).toBeLessThan(360);
      expect(Math.abs(s.dec)).toBeLessThanOrEqual(90);
    }
  });

  it('draws every figure from known stars', () => {
    expect(FIGURES.map((f) => f.id)).toEqual(
      expect.arrayContaining(['kassiopeia', 'schwan', 'perseus', 'fuhrmann', 'grosser-wagen', 'sommerdreieck', 'adler', 'orion', 'zwillinge', 'skorpion', 'schuetze']),
    );
    for (const f of FIGURES) {
      expect(figureStars(f).every((id) => isStarId(id))).toBe(true);
      expect(isStarId(f.label)).toBe(true);
    }
  });

  it('uses only known stars in the routes', () => {
    for (const r of [...COMPASS_ROUTES, ...ZENITH_ROUTES]) {
      expect(r.stars.every((id) => isStarId(id))).toBe(true);
    }
  });
});

describe('the darkness suggestion', () => {
  const find = (name: string) => PLACES.find((p) => p.name === name) ?? null;

  it('suggests 5 for dark-sky places, 1 for big cities and 2 otherwise', () => {
    expect(suggestedDarkness(find('Sternenpark Rhön'))).toBe(5);
    expect(suggestedDarkness(find('Hamburg'))).toBe(1);
    expect(suggestedDarkness(find('Lüneburg'))).toBe(2);
    expect(suggestedDarkness(null)).toBe(2);
    expect(suggestionReason(find('Sternenpark Rhön'))).toBe('Vorgeschlagen für einen Sternenpark.');
    expect(suggestionReason(find('Hamburg'))).toBe('Vorgeschlagen für eine Grossstadt.');
    expect(suggestionReason(find('Lüneburg'))).toBe('Vorgeschlagen für eine Stadt.');
    expect(suggestionReason(null)).toBe('Vorgeschlagen für deinen Standort.');
  });

  it('offers two dark-sky places before anything is typed and finds a stored place in the list', () => {
    expect(darkSkySuggestions().map((p) => p.dark)).toEqual([true, true]);
    expect(listedPlace('Hamburg', 53.55, 9.99)?.pop).toBeGreaterThan(1_000_000);
    expect(listedPlace('Dein Standort', 53.55, 10)).toBeNull();
  });

  it('names the device location after the nearest listed town within 25 km, on the device', () => {
    expect(deviceName(53.55, 10)).toBe('Dein Standort (Hamburg)');
    expect(deviceName(48.15, 11.6)).toBe('Dein Standort (München)');
    expect(nearestTown(50.5, 9.95)?.dark).toBeFalsy();
    expect(deviceName(40.42, -3.7)).toBe('Dein Standort');
    expect(deviceName(54.5, 3)).toBe('Dein Standort');
  });
});

const context = (overhead: boolean): StepContext => ({
  dir: 'Süden',
  towards: 'nach Süden',
  fists: 'Vier Fäuste',
  overhead,
  darkness: 3,
  moonFraction: 0.5,
  evening: true,
  starAlt: () => 30,
  rel: () => 'Zwei Fäuste höher, etwas nach links',
});

describe('the object catalogue', () => {
  it('has the objects of the spec', () => {
    expect(OBJECTS.map((o) => o.id)).toEqual(
      expect.arrayContaining(['mond', 'venus', 'jupiter', 'mars', 'saturn', 'wagen', 'kassiopeia', 'sommerdreieck', 'kapella', 'arktur', 'orion', 'sirius', 'plejaden', 'skorpion', 'milchstrasse', 'andromeda']),
    );
    expect(OBJECTS.find((o) => o.id === 'milchstrasse')).toMatchObject({ minDarkness: 3, moonSensitive: true });
    expect(OBJECTS.find((o) => o.id === 'kassiopeia')?.minDarkness).toBe(2);
  });

  it('gives every object texts, valid stars, pictures and steps for both variants', () => {
    for (const o of OBJECTS) {
      for (const overhead of [false, true]) {
        const c = context(overhead);
        expect(typeof o.kind === 'string' ? o.kind : o.kind(c)).toBeTruthy();
        expect(typeof o.eye === 'string' ? o.eye : o.eye(c)).toMatch(/\.$/);
        if (o.steps) {
          const steps = o.steps(c);
          expect(steps.length, o.id).toBeGreaterThanOrEqual(3);
          expect(steps.every((s) => s.length > 10 && !s.includes('undefined'))).toBe(true);
        }
      }
      if (o.position.kind === 'star') {
        expect(isStarId(o.position.star)).toBe(true);
      }
      expect(EYE_VIEWS[o.eyeView], o.id).toBeDefined();
      if ('thumb' in o.look) {
        expect(THUMBS[o.look.thumb], o.id).toBeDefined();
      } else {
        const d = o.look.drawing;
        expect(d.stars.every((id) => isStarId(id))).toBe(true);
        expect(d.lines.flat().every((id) => d.stars.includes(id))).toBe(true);
      }
    }
  });
});

describe('the pictures', () => {
  it('exist with the stated size, built by the picture script', () => {
    for (const id of PICTURE_IDS) {
      const built = PICTURE_MANIFEST[id];
      expect(built, id).toBeDefined();
      expect([built.width, built.height], id).toEqual([picture(id).width, picture(id).height]);
      expect(built.bytes).toBeLessThan(350_000);
      // Thumbnail-only pictures ship just the 128 px square; the naked-eye photos ship the full picture.
      expect(!!built.thumbBytes).toBe(!!PICTURE_SOURCES[id].thumbOnly);
      expect(built.bytes === 0).toBe(!!PICTURE_SOURCES[id].thumbOnly);
    }
  });

  it('are freely licensed and credited', () => {
    for (const id of PICTURE_IDS) {
      const p = picture(id);
      expect(ALLOWED_LICENCES).toContain(p.licence);
      expect(p.author).toBeTruthy();
      expect(p.source).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    }
  });

  it('keep every mark and line inside its picture, and mark the target', () => {
    for (const [key, view] of Object.entries(EYE_VIEWS)) {
      const { width, height } = view.picture;
      for (const m of view.marks) {
        expect(m.x - m.r >= 0 && m.x + m.r <= width && m.y - m.r >= 0 && m.y + m.r <= height, `${key}: ${m.label}`).toBe(true);
      }
      for (const l of view.lines ?? []) {
        expect(l.points.every(([x, y]) => x >= 0 && x <= width && y >= 0 && y <= height), key).toBe(true);
      }
      expect(view.marks.some((m) => !m.minor), key).toBe(true);
      expect(view.caption).toMatch(/\.$/);
    }
  });
});
