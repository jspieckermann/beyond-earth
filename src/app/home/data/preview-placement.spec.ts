import { SKY_HEIGHT, SKY_MODULES, SKY_WIDTH } from './modules';
import { GUTTER, PREVIEW_SIZE, previewPlacement } from './preview-placement';

/** Greeting area in sky-stage units; the preview avoids it when it can. */
const GREETING_BOTTOM = 190;
const RING_RADIUS = 15;

const overlaps = (p: { x: number; y: number }, star: { x: number; y: number }, reach: number) =>
  p.x < star.x + reach &&
  p.x + PREVIEW_SIZE.width > star.x - reach &&
  p.y < star.y + reach &&
  p.y + PREVIEW_SIZE.height > star.y - reach;

describe('previewPlacement', () => {
  for (const width of [320, 390, 420, 480]) {
    const scale = width / SKY_WIDTH;
    const stage = { width, height: SKY_HEIGHT * scale };
    const at = (m: { x: number; y: number }) => ({ x: m.x * scale, y: m.y * scale });

    for (const module of SKY_MODULES) {
      const others = SKY_MODULES.filter((m) => m !== module).map(at);
      const star = at(module);
      const place = previewPlacement(star, stage, GREETING_BOTTOM * scale, others);

      it(`keeps the ${module.short} preview on screen and off its star at ${width}px`, () => {
        expect(place.x).toBeGreaterThanOrEqual(GUTTER);
        expect(place.x + PREVIEW_SIZE.width).toBeLessThanOrEqual(stage.width - GUTTER);
        expect(place.y).toBeGreaterThanOrEqual(0);
        expect(place.y + PREVIEW_SIZE.height).toBeLessThanOrEqual(stage.height);
        expect(overlaps(place, star, RING_RADIUS)).toBe(false);
      });
    }
  }

  it('prefers above the star when there is room', () => {
    const { y } = previewPlacement({ x: 200, y: 500 }, { width: 390, height: 600 }, 190);
    expect(y).toBe(500 - 24 - PREVIEW_SIZE.height);
  });

  it('goes below the star when above would cover the greeting', () => {
    const { y } = previewPlacement({ x: 200, y: 250 }, { width: 390, height: 600 }, 190);
    expect(y).toBe(250 + 24);
  });

  it('stays above when below would leave the stage', () => {
    const { y } = previewPlacement({ x: 200, y: 180 }, { width: 390, height: 300 }, 190);
    expect(y).toBe(0);
  });

  it('clamps to the left gutter', () => {
    expect(previewPlacement({ x: 10, y: 500 }, { width: 390, height: 600 }, 190).x).toBe(GUTTER);
  });

  it('moves aside to keep another star free', () => {
    const blocked = previewPlacement({ x: 200, y: 500 }, { width: 390, height: 600 }, 190, [{ x: 300, y: 360 }]);
    expect(blocked).toEqual({ x: GUTTER, y: 500 - 24 - PREVIEW_SIZE.height });
  });

  it('prefers the spot that covers fewer other stars', () => {
    // Above the star: centred (x 96–304) and left gutter (16–224) each cover two stars, the right gutter (166–374) one.
    const others = [
      { x: 120, y: 400 },
      { x: 60, y: 400 },
      { x: 250, y: 400 },
    ];
    const place = previewPlacement({ x: 200, y: 500 }, { width: 390, height: 600 }, 190, others);
    expect(place).toEqual({ x: 390 - GUTTER - PREVIEW_SIZE.width, y: 500 - 24 - PREVIEW_SIZE.height });
  });

  it('falls back to the first spot when nothing is free', () => {
    const crowd = Array.from({ length: 40 }, (_, i) => ({ x: (i % 8) * 50, y: Math.floor(i / 8) * 120 }));
    const place = previewPlacement({ x: 200, y: 500 }, { width: 390, height: 600 }, 190, crowd);
    expect(place).toEqual({ x: 96, y: 500 - 24 - PREVIEW_SIZE.height });
  });
});
