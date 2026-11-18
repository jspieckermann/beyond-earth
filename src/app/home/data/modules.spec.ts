import { SKY_HEIGHT, SKY_MODULES, SKY_WIDTH, findModuleBySlug } from './modules';

describe('SKY_MODULES', () => {
  it('lists all seven modules in journey order A, C, B, E, D, G, F', () => {
    expect(SKY_MODULES.map((m) => m.id)).toEqual(['A', 'C', 'B', 'E', 'D', 'G', 'F']);
  });

  it('runs from lower left to upper right', () => {
    const xs = SKY_MODULES.map((m) => m.x);
    const ys = SKY_MODULES.map((m) => m.y);
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
    expect([...ys].sort((a, b) => b - a)).toEqual(ys);
  });

  it('keeps every star inside the sky stage and slugs unique', () => {
    for (const m of SKY_MODULES) {
      expect(m.x).toBeGreaterThan(0);
      expect(m.x).toBeLessThan(SKY_WIDTH);
      expect(m.y).toBeGreaterThan(0);
      expect(m.y).toBeLessThan(SKY_HEIGHT);
    }
    expect(new Set(SKY_MODULES.map((m) => m.slug)).size).toBe(7);
  });

  it('finds modules by slug', () => {
    expect(findModuleBySlug('sandkorn-welt')?.title).toBe('Die Sandkorn-Welt');
    expect(findModuleBySlug('nope')).toBeUndefined();
    expect(findModuleBySlug(null)).toBeUndefined();
  });
});
