import { TextureData } from './sphere-renderer';

/** Loads an image from our own origin into pixel data; null where that is not possible. */
export async function loadTexture(url: string): Promise<TextureData | null> {
  if (typeof Image === 'undefined' || typeof document === 'undefined') {
    return null;
  }
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  } catch {
    return null;
  }
}

/** Loads a JSON file from our own origin; null on failure. */
export async function loadJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

/** Texture width that suits the screen: 2048 px only on wide or high-density screens. */
export function textureWidth(): 1024 | 2048 {
  const dpr = globalThis.devicePixelRatio ?? 1;
  const wide = (globalThis.innerWidth ?? 0) >= 1100;
  return dpr > 1.5 || wide ? 2048 : 1024;
}
