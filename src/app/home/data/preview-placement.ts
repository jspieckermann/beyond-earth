export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** Fixed preview size in CSS px (content is clamped to fit). */
export const PREVIEW_SIZE: Size = { width: 208, height: 164 };

/** Horizontal gutter the preview keeps from the stage edges. */
export const GUTTER = 16;

/** Vertical gap between the star's centre and the preview; larger than the selection ring radius (15 px). */
export const STAR_GAP = 24;

/** Half the touch target of a star: other stars stay tappable when the preview keeps this distance. */
export const STAR_REACH = 22;

function coveredCount(at: Point, preview: Size, others: readonly Point[]): number {
  return others.filter(
    (o) =>
      at.x < o.x + STAR_REACH &&
      at.x + preview.width > o.x - STAR_REACH &&
      at.y < o.y + STAR_REACH &&
      at.y + preview.height > o.y - STAR_REACH,
  ).length;
}

/**
 * Where the preview's top-left corner goes, in px inside the stage.
 *
 * Candidate rows: above the star (unless that would cover the greeting area above `minTop`), then below.
 * Candidate columns: centred on the star, then shifted to either gutter.
 * The candidate covering the fewest other stars (`others`) wins; ties keep that preference order.
 */
export function previewPlacement(
  star: Point,
  stage: Size,
  minTop: number,
  others: readonly Point[] = [],
  preview: Size = PREVIEW_SIZE,
): Point {
  const above = star.y - STAR_GAP - preview.height;
  const below = star.y + STAR_GAP;
  const fitsBelow = below + preview.height <= stage.height;

  const rows: number[] = [];
  if (above >= minTop) rows.push(above);
  if (fitsBelow) rows.push(below);
  if (rows.length === 0) rows.push(Math.max(0, above));

  const maxX = Math.max(GUTTER, stage.width - GUTTER - preview.width);
  const clampX = (x: number) => Math.min(Math.max(x, GUTTER), maxX);
  const columns = [...new Set([clampX(star.x - preview.width / 2), GUTTER, maxX])];

  const candidates = rows.flatMap((y) => columns.map((x) => ({ x, y })));
  let best = candidates[0];
  let bestCount = coveredCount(best, preview, others);
  for (const candidate of candidates.slice(1)) {
    const count = coveredCount(candidate, preview, others);
    if (count < bestCount) {
      best = candidate;
      bestCount = count;
    }
  }
  return best;
}
