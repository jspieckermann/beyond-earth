/**
 * Perspective projection of real star positions (HYG catalogue, equatorial x/y/z in parsecs)
 * for the way from the neighbouring stars to the Milky Way: first the familiar figure of Orion as seen
 * from the Earth, then the camera moves sideways and the figure falls apart, because its stars
 * only stand side by side when seen from here.
 */

export type Vec = readonly [number, number, number];

export interface StarCatalogue {
  /** [x, y, z, magnitude, colour index] per star. */
  readonly stars: readonly (readonly [number, number, number, number, number])[];
  readonly orion: Readonly<Record<string, { x: number; y: number; z: number; mag: number; ly: number }>>;
}

/** The lines of the constellation Orion, by the German star names used in the catalogue. */
export const ORION_LINES: readonly (readonly [string, string])[] = [
  ['Beteigeuze', 'Bellatrix'],
  ['Beteigeuze', 'Alnitak'],
  ['Bellatrix', 'Mintaka'],
  ['Mintaka', 'Alnilam'],
  ['Alnilam', 'Alnitak'],
  ['Alnitak', 'Saiph'],
  ['Mintaka', 'Rigel'],
  ['Meissa', 'Beteigeuze'],
  ['Meissa', 'Bellatrix'],
];

/** How far the camera moves sideways when the figure has fully fallen apart, in parsecs. */
export const DOLLY_PC = 420;

const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: Vec, s: number): Vec => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: Vec): Vec => scale(a, 1 / Math.hypot(...a));

export interface Camera {
  readonly position: Vec;
  readonly forward: Vec;
  readonly right: Vec;
  readonly up: Vec;
}

/** Centre of the Orion figure in space. */
export function orionCentre(orion: StarCatalogue['orion']): Vec {
  const stars = Object.values(orion);
  const sum = stars.reduce<Vec>((acc, s) => add(acc, [s.x, s.y, s.z]), [0, 0, 0]);
  return scale(sum, 1 / stars.length);
}

/**
 * Camera looking at the Orion figure. At t = 0 it stands at the Earth; with growing t it moves
 * sideways (and a little back) while still looking at the figure.
 */
export function orionCamera(orion: StarCatalogue['orion'], t: number): Camera {
  const target = orionCentre(orion);
  const towards = norm(target);
  const side = norm(cross(towards, [0, 0, 1]));
  const position = add(scale(side, DOLLY_PC * t), scale(towards, -120 * t));
  const forward = norm(sub(target, position));
  const right = norm(cross(forward, [0, 0, 1]));
  const up = cross(right, forward);
  return { position, forward, right, up };
}

/** Screen position of a point, or null behind the camera. `focal` is in pixels. */
export function project(point: Vec, camera: Camera, focal: number, cx: number, cy: number): { x: number; y: number; depth: number } | null {
  const rel = sub(point, camera.position);
  const depth = dot(rel, camera.forward);
  if (depth <= 0.5) {
    return null;
  }
  return { x: cx + (dot(rel, camera.right) / depth) * focal, y: cy - (dot(rel, camera.up) / depth) * focal, depth };
}

/** Screen lengths of the Orion lines for a camera (used to check that the figure falls apart). */
export function orionLineLengths(orion: StarCatalogue['orion'], camera: Camera, focal: number): number[] {
  return ORION_LINES.map(([a, b]) => {
    const pa = project([orion[a].x, orion[a].y, orion[a].z], camera, focal, 0, 0);
    const pb = project([orion[b].x, orion[b].y, orion[b].z], camera, focal, 0, 0);
    return pa && pb ? Math.hypot(pa.x - pb.x, pa.y - pb.y) : 0;
  });
}

/** Rough star colour from the B−V colour index. */
export function starColour(ci: number): string {
  if (ci < 0) return '#bcd2ff';
  if (ci < 0.4) return '#e8eeff';
  if (ci < 0.8) return '#fff4dc';
  if (ci < 1.3) return '#ffd9a8';
  return '#ffb38a';
}

export interface DrawOptions {
  readonly width: number;
  readonly height: number;
  readonly focal: number;
  /** 0..1 strength of the constellation lines. */
  readonly lines: number;
}

/** Draws the stars and the Orion lines seen from `camera`. */
export function drawSky(ctx: CanvasRenderingContext2D, catalogue: StarCatalogue, camera: Camera, options: DrawOptions): void {
  const { width, height, focal } = options;
  const cx = width / 2;
  const cy = height / 2;
  ctx.clearRect(0, 0, width, height);
  for (const [x, y, z, mag, ci] of catalogue.stars) {
    const p = project([x, y, z], camera, focal, cx, cy);
    if (!p || p.x < 0 || p.y < 0 || p.x > width || p.y > height) {
      continue;
    }
    // Brightness as seen from the moving camera: the star's distance changes the magnitude.
    const here = Math.hypot(x, y, z);
    const shifted = mag + 5 * Math.log10(Math.max(1, p.depth) / Math.max(1, here));
    const r = Math.max(0.4, 2.6 - shifted * 0.35);
    ctx.globalAlpha = Math.max(0.15, Math.min(1, 1.2 - shifted * 0.13));
    ctx.fillStyle = starColour(ci);
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  if (options.lines > 0) {
    ctx.globalAlpha = options.lines * 0.7;
    ctx.strokeStyle = '#f3d9a4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const [a, b] of ORION_LINES) {
      const sa = catalogue.orion[a];
      const sb = catalogue.orion[b];
      const pa = project([sa.x, sa.y, sa.z], camera, focal, cx, cy);
      const pb = project([sb.x, sb.y, sb.z], camera, focal, cx, cy);
      if (pa && pb) {
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
      }
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
