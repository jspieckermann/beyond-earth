import { SKY_MODULES, WIDE_PREVIEW_ANCHOR } from './modules';
import { GUTTER } from './preview-placement';
import {
  WIDE_PREVIEW_SIZE,
  bandCloud,
  bandGeometry,
  connectorLine,
  coversStar,
  toRegion,
  widePreviewPosition,
} from './wide-sky';

/** Sky regions of: landscape tablet, small upright tablet, 834 × 1194 tablet, 1440 × 900 desktop. */
const REGIONS = [
  { width: 624, height: 768 },
  { width: 768, height: 570 },
  { width: 834, height: 738 },
  { width: 950, height: 900 },
];

describe('wide sky layout', () => {
  for (const region of REGIONS) {
    const label = `${region.width} × ${region.height}`;
    const preview = widePreviewPosition(WIDE_PREVIEW_ANCHOR, region);

    it(`keeps the preview inside the ${label} region`, () => {
      expect(preview.x).toBeGreaterThanOrEqual(GUTTER);
      expect(preview.y).toBeGreaterThanOrEqual(GUTTER);
      expect(preview.x + WIDE_PREVIEW_SIZE.width).toBeLessThanOrEqual(region.width - GUTTER);
      expect(preview.y + WIDE_PREVIEW_SIZE.height).toBeLessThanOrEqual(region.height - GUTTER);
    });

    it(`covers no module star in the ${label} region`, () => {
      const covered = SKY_MODULES.filter((m) => coversStar(preview, toRegion(m.wide, region)));
      expect(covered.map((m) => m.id)).toEqual([]);
    });

    it(`keeps all stars inside the ${label} region`, () => {
      for (const m of SKY_MODULES) {
        const p = toRegion(m.wide, region);
        expect(p.x).toBeGreaterThan(0);
        expect(p.x).toBeLessThan(region.width);
        expect(p.y).toBeGreaterThan(0);
        expect(p.y).toBeLessThan(region.height);
      }
    });
  }

  it('runs the wide stars from lower left to upper right in journey order', () => {
    const xs = SKY_MODULES.map((m) => m.wide.x);
    const ys = SKY_MODULES.map((m) => m.wide.y);
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
    expect([...ys].sort((a, b) => b - a)).toEqual(ys);
  });

  it('clamps the preview in a tiny region to the gutter', () => {
    expect(widePreviewPosition({ x: 0.9, y: 0.9 }, { width: 200, height: 200 })).toEqual({ x: GUTTER, y: GUTTER });
  });

  it('detects a covered star', () => {
    expect(coversStar({ x: 100, y: 100 }, { x: 150, y: 150 })).toBe(true);
    expect(coversStar({ x: 100, y: 100 }, { x: 60, y: 150 })).toBe(false);
  });

  describe('connectorLine', () => {
    it('ends on the left edge for stars to the left of the preview', () => {
      const line = connectorLine({ x: 100, y: 300 }, { x: 500, y: 400 });
      expect(line.x2).toBe(500);
      expect(line.y2).toBe(460);
    });

    it('ends on the top edge for stars above the preview', () => {
      const line = connectorLine({ x: 600, y: 100 }, { x: 500, y: 400 });
      expect(line).toMatchObject({ x2: 650, y2: 400 });
    });

    it('starts just outside the star', () => {
      const line = connectorLine({ x: 100, y: 300 }, { x: 500, y: 400 });
      expect(Math.hypot(line.x1 - 100, line.y1 - 300)).toBeCloseTo(22, 0);
    });
  });

  it('computes the band through the first and last star', () => {
    const band = bandGeometry({ x: 0, y: 100 }, { x: 100, y: 0 });
    expect(band).toMatchObject({ cx: 50, cy: 50 });
    expect(band.angle).toBeCloseTo(-45);
    expect(band.length).toBeCloseTo(141.42, 1);
  });

  it('scatters a deterministic star cloud inside the bounds', () => {
    const band = bandGeometry({ x: 50, y: 700 }, { x: 650, y: 200 });
    const bounds = { width: 800, height: 900 };
    const cloud = bandCloud(band, bounds);
    expect(cloud).toEqual(bandCloud(band, bounds));
    expect(cloud.length).toBeGreaterThan(100);
    expect(cloud.every((s) => s.x >= 0 && s.x <= 800 && s.y >= 0 && s.y <= 900)).toBe(true);
  });
});
