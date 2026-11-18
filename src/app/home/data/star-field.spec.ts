import { SKY_HEIGHT, SKY_WIDTH } from './modules';
import { createStarField } from './star-field';

describe('createStarField', () => {
  it('is deterministic for the same seed', () => {
    expect(createStarField(7)).toEqual(createStarField(7));
  });

  it('differs for another seed', () => {
    expect(createStarField(8)).not.toEqual(createStarField(7));
  });

  it('keeps all stars inside the sky and faint', () => {
    const stars = createStarField();
    expect(stars.length).toBeGreaterThan(200);
    for (const s of stars) {
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.x).toBeLessThanOrEqual(SKY_WIDTH);
      expect(s.y).toBeGreaterThanOrEqual(0);
      expect(s.y).toBeLessThanOrEqual(SKY_HEIGHT);
      expect(s.opacity).toBeLessThan(1);
    }
  });
});
