import catalogueJson from '../../../../public/journey/data/stars.json';
import { orionProgress, orionVisibility } from './orion-sky';
import { ORION_LINES, StarCatalogue, drawSky, orionCamera, orionCentre, orionLineLengths, project, starColour } from './star-renderer';

const catalogue = catalogueJson as unknown as StarCatalogue;

describe('star catalogue', () => {
  it('holds the naked-eye stars and the eight stars of Orion', () => {
    expect(catalogue.stars.length).toBeGreaterThan(8000);
    expect(Object.keys(catalogue.orion).sort()).toEqual(
      ['Alnilam', 'Alnitak', 'Bellatrix', 'Beteigeuze', 'Meissa', 'Mintaka', 'Rigel', 'Saiph'],
    );
  });

  it('knows Beteigeuze and Rigel at roughly 550 and 860 light years', () => {
    expect(catalogue.orion['Beteigeuze'].ly).toBeGreaterThan(400);
    expect(catalogue.orion['Beteigeuze'].ly).toBeLessThan(750);
    expect(catalogue.orion['Rigel'].ly).toBeGreaterThan(700);
    expect(catalogue.orion['Rigel'].ly).toBeLessThan(1000);
  });
});

describe('Orion falls apart', () => {
  it('stays put at the Earth and moves sideways on the way out', () => {
    const atEarth = orionCamera(catalogue.orion, 0);
    expect(Math.hypot(...atEarth.position)).toBe(0);
    const away = orionCamera(catalogue.orion, 1);
    expect(Math.hypot(...away.position)).toBeGreaterThan(400);
  });

  it('distorts the figure when seen from elsewhere', () => {
    const focal = 400;
    const before = orionLineLengths(catalogue.orion, orionCamera(catalogue.orion, 0), focal);
    const after = orionLineLengths(catalogue.orion, orionCamera(catalogue.orion, 1), focal);
    expect(before.every((l) => l > 0)).toBe(true);
    // Relative proportions change a lot: the stars only stand side by side from the Earth.
    const ratio = (ls: number[]) => ls.map((l) => l / ls[0]);
    const change = ratio(after).map((r, i) => Math.abs(r - ratio(before)[i]));
    expect(Math.max(...change)).toBeGreaterThan(0.5);
  });

  it('maps the zoom to the dissolving and the visibility of the view', () => {
    expect(orionProgress(3)).toBe(0);
    expect(orionProgress(4)).toBe(1);
    expect(orionVisibility(3)).toBe(0);
    expect(orionVisibility(3.45)).toBeCloseTo(1);
    expect(orionVisibility(4)).toBe(0);
    expect(orionVisibility(3.8)).toBeGreaterThan(0);
  });

  it('projects points in front of the camera only', () => {
    const camera = orionCamera(catalogue.orion, 0);
    const centre = orionCentre(catalogue.orion);
    const p = project(centre, camera, 100, 50, 50);
    expect(p?.x).toBeCloseTo(50);
    expect(p?.y).toBeCloseTo(50);
    expect(project([-centre[0], -centre[1], -centre[2]], camera, 100, 50, 50)).toBeNull();
  });

  it('draws stars and the Orion lines', () => {
    const calls = { arc: 0, lines: 0 };
    const ctx = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: () => calls.arc++,
      fill: vi.fn(),
      moveTo: vi.fn(),
      lineTo: () => calls.lines++,
      stroke: vi.fn(),
      globalAlpha: 1,
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
    };
    drawSky(ctx as unknown as CanvasRenderingContext2D, catalogue, orionCamera(catalogue.orion, 0), { width: 390, height: 844, focal: 430, lines: 1 });
    expect(calls.arc).toBeGreaterThan(50);
    expect(calls.lines).toBe(ORION_LINES.length);
  });

  it('colours stars by their colour index', () => {
    expect(starColour(-0.2)).toBe('#bcd2ff');
    expect(starColour(1.8)).toBe('#ffb38a');
  });
});
