import { VOYAGER_POSITION, VOYAGER_SAFE_TOP, voyagerY } from './near-layers';

describe('Voyager 1 position', () => {
  it('stays just outside Neptune when there is room above', () => {
    // 1440 × 900: focus at 405 px, 1.18 px per base unit.
    expect(voyagerY(405, 1.18)).toBe(VOYAGER_POSITION.y);
  });

  it('moves down below the header on short screens', () => {
    // 390 × 664: focus at 259 px, 0.874 px per base unit.
    const y = voyagerY(259, 0.874);
    expect(y).toBeGreaterThan(VOYAGER_POSITION.y);
    expect(259 + y * 0.874).toBeCloseTo(VOYAGER_SAFE_TOP);
  });
});
