/**
 * Draws a textured sphere (orthographic view) with Canvas 2D: an equirectangular texture
 * is mapped onto a disc, rotated around the vertical axis and lit from the front-left.
 * Optional: a night texture blended in where the Sun is below the horizon (the Earth).
 */

export interface SphereLookup {
  readonly size: number;
  /** Per pixel: texture x before rotation (0..1), or −1 outside the disc. */
  readonly u: Float32Array;
  /** Per pixel: texture y (0..1). */
  readonly v: Float32Array;
  /** Per pixel: brightness from the light direction (0.15..1). */
  readonly shade: Float32Array;
  /** Per pixel: latitude and longitude offset in radians (for day/night). */
  readonly lat: Float32Array;
  readonly lon: Float32Array;
}

export interface TextureData {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8ClampedArray;
}

const LIGHT = normalize([-0.45, -0.35, 0.82]);

function normalize(v: number[]): number[] {
  const len = Math.hypot(...v);
  return v.map((x) => x / len);
}

/** Precomputes where every pixel of a sphere of the given radius looks on the texture. */
export function sphereLookup(radius: number): SphereLookup {
  const size = Math.max(1, Math.round(radius * 2));
  const n = size * size;
  const u = new Float32Array(n).fill(-1);
  const v = new Float32Array(n);
  const shade = new Float32Array(n);
  const lat = new Float32Array(n);
  const lon = new Float32Array(n);
  for (let py = 0; py < size; py++) {
    const y = (py + 0.5 - radius) / radius;
    for (let px = 0; px < size; px++) {
      const x = (px + 0.5 - radius) / radius;
      const r2 = x * x + y * y;
      if (r2 > 1) {
        continue;
      }
      const z = Math.sqrt(1 - r2);
      const i = py * size + px;
      const phi = Math.asin(-y);
      const lambda = Math.atan2(x, z);
      lat[i] = phi;
      lon[i] = lambda;
      u[i] = 0.5 + lambda / (2 * Math.PI);
      v[i] = 0.5 - phi / Math.PI;
      shade[i] = Math.max(0.15, x * LIGHT[0] + y * LIGHT[1] + z * LIGHT[2]);
    }
  }
  return { size, u, v, shade, lat, lon };
}

export interface RenderOptions {
  /** Rotation around the vertical axis in degrees (positive turns the surface to the right). */
  readonly rotation: number;
  /** Night texture (city lights), blended where the Sun is below the horizon. */
  readonly night?: TextureData;
  /** Subsolar point relative to the view centre, in degrees; enables day/night instead of front light. */
  readonly sun?: { readonly lat: number; readonly lon: number };
  /** The body glows by itself (the Sun): no side light, only a slightly darker rim. */
  readonly emissive?: boolean;
}

/** Renders the sphere into `out` (RGBA, size × size). */
export function renderSphere(lookup: SphereLookup, day: TextureData, out: Uint8ClampedArray, options: RenderOptions): void {
  const { size, u, v, shade, lat, lon } = lookup;
  const turn = options.rotation / 360;
  const sun = options.sun;
  const sunLat = sun ? (sun.lat * Math.PI) / 180 : 0;
  const sunLon = sun ? (sun.lon * Math.PI) / 180 : 0;
  for (let i = 0; i < size * size; i++) {
    const o = i * 4;
    if (u[i] < 0) {
      out[o + 3] = 0;
      continue;
    }
    let tu = (u[i] - turn) % 1;
    if (tu < 0) {
      tu += 1;
    }
    const dayPx = sample(day, tu, v[i]);
    let r = dayPx[0];
    let g = dayPx[1];
    let b = dayPx[2];
    let light = shade[i];
    if (options.emissive) {
      // Limb darkening: the rim of a star looks darker than its centre.
      const depth = Math.cos(lat[i]) * Math.cos(lon[i]);
      light = 0.62 + 0.45 * Math.sqrt(Math.max(0, depth));
    } else if (sun) {
      // Height of the Sun over this point's horizon, −1..1.
      const h = Math.sin(lat[i]) * Math.sin(sunLat) + Math.cos(lat[i]) * Math.cos(sunLat) * Math.cos(lon[i] - sunLon);
      const dayAmount = Math.min(1, Math.max(0, (h + 0.08) / 0.16));
      light = 0.12 + 0.88 * dayAmount * Math.max(0.35, h);
      if (options.night && dayAmount < 1) {
        const nightPx = sample(options.night, tu, v[i]);
        const k = 1 - dayAmount;
        r = r * light + nightPx[0] * k;
        g = g * light + nightPx[1] * k;
        b = b * light + nightPx[2] * k;
        light = 1;
      }
    }
    out[o] = Math.min(255, r * light);
    out[o + 1] = Math.min(255, g * light);
    out[o + 2] = Math.min(255, b * light);
    out[o + 3] = 255;
  }
}

/** Per-pixel day light and night-texture weight of a sphere lit by the Sun, for spinning it cheaply. */
export interface SunLighting {
  readonly light: Float32Array;
  readonly night: Float32Array;
}

/**
 * Precomputes the lighting of `renderSphere` with a Sun and a night texture. With the Sun fixed in the
 * view, the lighting stays the same however the sphere turns: only the texture moves under it.
 */
export function sunLighting(lookup: SphereLookup, sun: { readonly lat: number; readonly lon: number }): SunLighting {
  const { size, u, lat, lon } = lookup;
  const sunLat = (sun.lat * Math.PI) / 180;
  const sunLon = (sun.lon * Math.PI) / 180;
  const light = new Float32Array(size * size);
  const night = new Float32Array(size * size);
  for (let i = 0; i < size * size; i++) {
    if (u[i] < 0) {
      continue;
    }
    const h = Math.sin(lat[i]) * Math.sin(sunLat) + Math.cos(lat[i]) * Math.cos(sunLat) * Math.cos(lon[i] - sunLon);
    const dayAmount = Math.min(1, Math.max(0, (h + 0.08) / 0.16));
    light[i] = 0.12 + 0.88 * dayAmount * Math.max(0.35, h);
    night[i] = 1 - dayAmount;
  }
  return { light, night };
}

/** Same result as `renderSphere` with `sun` and `night`, using precomputed lighting. */
export function renderLitSphere(lookup: SphereLookup, day: TextureData, nightTex: TextureData, lighting: SunLighting, out: Uint8ClampedArray, rotation: number): void {
  const { size, u, v } = lookup;
  const { light, night } = lighting;
  const turn = rotation / 360;
  for (let i = 0; i < size * size; i++) {
    const o = i * 4;
    if (u[i] < 0) {
      out[o + 3] = 0;
      continue;
    }
    let tu = (u[i] - turn) % 1;
    if (tu < 0) {
      tu += 1;
    }
    const d = sampleIndex(day, tu, v[i]);
    const l = light[i];
    const k = night[i];
    if (k > 0) {
      const n = sampleIndex(nightTex, tu, v[i]);
      out[o] = Math.min(255, day.data[d] * l + nightTex.data[n] * k);
      out[o + 1] = Math.min(255, day.data[d + 1] * l + nightTex.data[n + 1] * k);
      out[o + 2] = Math.min(255, day.data[d + 2] * l + nightTex.data[n + 2] * k);
    } else {
      out[o] = Math.min(255, day.data[d] * l);
      out[o + 1] = Math.min(255, day.data[d + 1] * l);
      out[o + 2] = Math.min(255, day.data[d + 2] * l);
    }
    out[o + 3] = 255;
  }
}

function sampleIndex(tex: TextureData, u: number, v: number): number {
  const x = Math.min(tex.width - 1, Math.floor(u * tex.width));
  const y = Math.min(tex.height - 1, Math.max(0, Math.floor(v * tex.height)));
  return (y * tex.width + x) * 4;
}

function sample(tex: TextureData, u: number, v: number): [number, number, number] {
  const x = Math.min(tex.width - 1, Math.floor(u * tex.width));
  const y = Math.min(tex.height - 1, Math.max(0, Math.floor(v * tex.height)));
  const i = (y * tex.width + x) * 4;
  return [tex.data[i], tex.data[i + 1], tex.data[i + 2]];
}

/** A small procedural equirectangular texture from a base colour, for planets without an image yet. */
export function proceduralTexture(base: string, banded: boolean, width = 128, height = 64): TextureData {
  const [r, g, b] = hexToRgb(base);
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const n = banded
        ? 0.82 + 0.18 * Math.sin((y / height) * Math.PI * 14 + Math.sin((x / width) * Math.PI * 6) * 0.6)
        : 0.85 + 0.15 * Math.sin(x * 0.37 + y * 0.53) * Math.cos(x * 0.11 - y * 0.29);
      data[i] = r * n;
      data[i + 1] = g * n;
      data[i + 2] = b * n;
      data[i + 3] = 255;
    }
  }
  return { width, height, data };
}

/**
 * The texture recoloured in `tint`, keeping its brightness pattern: lets other stars share the Sun's surface.
 * Brightness is measured relative to the texture's brightest pixel.
 */
export function tintTexture(tex: TextureData, tint: string): TextureData {
  const [r, g, b] = hexToRgb(tint);
  const lum = (i: number) => 0.3 * tex.data[i] + 0.59 * tex.data[i + 1] + 0.11 * tex.data[i + 2];
  let max = 1;
  for (let i = 0; i < tex.data.length; i += 4) {
    max = Math.max(max, lum(i));
  }
  const data = new Uint8ClampedArray(tex.data.length);
  for (let i = 0; i < tex.data.length; i += 4) {
    // Softened contrast: a light tint would otherwise turn the Sun's granulation into Moon-like patches.
    const k = 0.7 + 0.3 * (lum(i) / max);
    data[i] = r * k;
    data[i + 1] = g * k;
    data[i + 2] = b * k;
    data[i + 3] = 255;
  }
  return { width: tex.width, height: tex.height, data };
}

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.replace('#', ''), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}
