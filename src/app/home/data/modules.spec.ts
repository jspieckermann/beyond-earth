import { MODULE_IDS } from '../../core/models';
import { SKY_HEIGHT, SKY_MODULES, SKY_WIDTH, findModuleBySlug } from './modules';

describe('SKY_MODULES', () => {
  it('lists the six modules along the band in the order A, B, C, E, D, F', () => {
    expect(SKY_MODULES.map((m) => m.id)).toEqual(['A', 'B', 'C', 'E', 'D', 'F']);
    expect([...MODULE_IDS]).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    expect(SKY_MODULES.map((m) => m.title)).toEqual([
      'Die Reise nach draussen',
      'Reisen mit Lichtgeschwindigkeit',
      'Das galaktische Jahr',
      'Sterne zählen',
      'Licht als Zeitmaschine',
      'Das Unsichtbare',
    ]);
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
    expect(new Set(SKY_MODULES.map((m) => m.slug)).size).toBe(6);
  });

  it('finds modules by slug, and no longer knows the Sandkorn-Welt', () => {
    expect(findModuleBySlug('lichtgeschwindigkeit')?.id).toBe('B');
    expect(findModuleBySlug('sandkorn-welt')).toBeUndefined();
    expect(findModuleBySlug('nope')).toBeUndefined();
    expect(findModuleBySlug(null)).toBeUndefined();
  });
});
