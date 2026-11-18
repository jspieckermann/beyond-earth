import { SKY_HEIGHT, SKY_WIDTH } from './modules';

export interface BackgroundStar {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly opacity: number;
}

/** Deterministic PRNG (mulberry32) so the sky looks the same on every visit and in tests. */
function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value: number, digits: number) => Number(value.toFixed(digits));

/**
 * Background stars in sky-stage coordinates: a sparse field everywhere plus a
 * denser cloud along the band's axis (lower left to upper right).
 */
export function createStarField(seed = 7, scattered = 150, alongBand = 170): BackgroundStar[] {
  const rnd = mulberry32(seed);
  const stars: BackgroundStar[] = [];

  for (let i = 0; i < scattered; i++) {
    stars.push({
      x: round(rnd() * SKY_WIDTH, 1),
      y: round(rnd() * SKY_HEIGHT, 1),
      r: round(0.3 + rnd() * 0.55, 2),
      opacity: round(0.18 + rnd() * 0.55, 2),
    });
  }

  for (let i = 0; i < alongBand; i++) {
    const t = -0.15 + rnd() * 1.3;
    const spread = (rnd() + rnd() + rnd() - 1.5) * 55;
    const x = 30 + 350 * t + 0.74 * spread;
    const y = 575 - 385 * t + 0.67 * spread;
    if (x < 0 || x > SKY_WIDTH || y < 0 || y > SKY_HEIGHT) {
      continue;
    }
    stars.push({
      x: round(x, 1),
      y: round(y, 1),
      r: round(0.3 + rnd() * 0.65, 2),
      opacity: round(0.3 + rnd() * 0.6, 2),
    });
  }

  return stars;
}
