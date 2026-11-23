import { GUTTER, Point, STAR_REACH, Size } from './preview-placement';
import { BackgroundStar } from './star-field';

/** Preview size on tablet and desktop (CSS px): room for a two-line title; with larger text it grows. */
export const WIDE_PREVIEW_SIZE: Size = { width: 300, height: 224 };

/** Gap the connector line keeps from the selected star's centre. */
const CONNECTOR_GAP = 22;
/** Vertical offset of the connector's end on the preview's left edge. */
const CONNECTOR_EDGE_Y = 60;

export interface Line {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

/** Converts a normalized position into px inside the sky region. */
export function toRegion(point: Point, region: Size): Point {
  return { x: point.x * region.width, y: point.y * region.height };
}

/** The preview's top-left corner: the fixed anchor, clamped so the preview stays inside the region. */
export function widePreviewPosition(anchor: Point, region: Size, preview: Size = WIDE_PREVIEW_SIZE): Point {
  const at = toRegion(anchor, region);
  const clamp = (value: number, max: number) => Math.min(Math.max(value, GUTTER), Math.max(GUTTER, max));
  return {
    x: clamp(at.x, region.width - GUTTER - preview.width),
    y: clamp(at.y, region.height - GUTTER - preview.height),
  };
}

/** Whether a preview at `at` would cover the touch area of a star at `star`. */
export function coversStar(at: Point, star: Point, preview: Size = WIDE_PREVIEW_SIZE): boolean {
  return (
    at.x < star.x + STAR_REACH &&
    at.x + preview.width > star.x - STAR_REACH &&
    at.y < star.y + STAR_REACH &&
    at.y + preview.height > star.y - STAR_REACH
  );
}

/**
 * The decorative line from the selected star to its preview: it ends on the preview's left edge
 * for stars to its left, otherwise on its top edge, and starts just outside the star.
 */
export function connectorLine(star: Point, previewAt: Point, preview: Size = WIDE_PREVIEW_SIZE): Line {
  const end =
    star.x < previewAt.x
      ? { x: previewAt.x, y: previewAt.y + CONNECTOR_EDGE_Y }
      : { x: previewAt.x + preview.width / 2, y: previewAt.y };
  const dx = end.x - star.x;
  const dy = end.y - star.y;
  const length = Math.hypot(dx, dy) || 1;
  const round = (value: number) => Math.round(value * 10) / 10;
  return {
    x1: round(star.x + (dx / length) * CONNECTOR_GAP),
    y1: round(star.y + (dy / length) * CONNECTOR_GAP),
    x2: round(end.x),
    y2: round(end.y),
  };
}

export interface BandGeometry {
  /** Centre of the band in px. */
  readonly cx: number;
  readonly cy: number;
  /** Rotation in degrees (negative: rising to the right). */
  readonly angle: number;
  /** Distance between the first and last star in px; band layers are sized relative to it. */
  readonly length: number;
}

/** The band runs through the first and last module star. */
export function bandGeometry(from: Point, to: Point): BandGeometry {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return {
    cx: (from.x + to.x) / 2,
    cy: (from.y + to.y) / 2,
    angle: (Math.atan2(dy, dx) * 180) / Math.PI,
    length: Math.hypot(dx, dy),
  };
}

/** Deterministic PRNG (mulberry32). */
function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The dense star cloud along the band, in px inside `bounds` (which may extend beyond the region). */
export function bandCloud(band: BandGeometry, bounds: Size, seed = 21, count = 420): BackgroundStar[] {
  const rnd = mulberry32(seed);
  const rad = (band.angle * Math.PI) / 180;
  const along = { x: Math.cos(rad), y: Math.sin(rad) };
  const across = { x: -along.y, y: along.x };
  const spread = Math.max(60, band.length * 0.14);
  const stars: BackgroundStar[] = [];
  for (let i = 0; i < count; i++) {
    const t = (rnd() - 0.5) * band.length * 2.6;
    const g = (rnd() + rnd() + rnd() - 1.5) * spread;
    const x = band.cx + along.x * t + across.x * g;
    const y = band.cy + along.y * t + across.y * g;
    if (x < 0 || x > bounds.width || y < 0 || y > bounds.height) {
      continue;
    }
    stars.push({
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      r: Math.round((0.3 + rnd() * 0.7) * 100) / 100,
      opacity: Math.round((0.3 + rnd() * 0.6) * 100) / 100,
    });
  }
  return stars;
}
