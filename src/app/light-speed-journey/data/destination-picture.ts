import { CardPicture } from '../../core/share-card';
import { CREDITS } from '../../outward-journey/data/credits';
import { BodyId, findBody } from '../../outward-journey/data/planets';
import { proceduralTexture, renderSphere, sphereLookup, tintTexture } from '../../outward-journey/scene/sphere-renderer';
import { loadTexture } from '../../outward-journey/scene/textures';

/** Radius of a sphere drawn for the card, in pixels (the card shows it at up to 540 px). */
export const CARD_SPHERE_RADIUS = 270;

const NBSP = '\u00a0';

/**
 * The credit line printed on the card for a body's picture. Stars are drawn from the Sun's surface texture,
 * so their picture is credited to it (their own credit is the star catalogue). The licence never breaks apart.
 */
export function pictureCredit(id: BodyId): string {
  const body = findBody(id);
  const credit = CREDITS[!body.picture && body.texture === 'sonne' ? 'sun-texture' : body.credit];
  return `Bild: ${credit.source}${NBSP}·${NBSP}${credit.licence.replaceAll(' ', NBSP)}`;
}

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (typeof Image === 'undefined') {
    return null;
  }
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  await img.decode();
  return img.naturalWidth > 0 ? img : null;
}

/**
 * The picture of a destination for the travel card, made from Modul A's assets: its photo (Voyager 1,
 * galaxies, far places) or its surface drawn as a sphere (planets, Moon, Sun, stars). Null where the
 * picture cannot be made (no canvas, a file that does not load); the card then shows only its sentence.
 */
export async function loadDestinationPicture(id: BodyId): Promise<CardPicture | null> {
  const body = findBody(id);
  const base = { name: body.name, credit: pictureCredit(id) };
  try {
    if (body.picture) {
      const img = await loadImage(body.picture.src);
      return img ? { ...base, image: img, width: img.naturalWidth, height: img.naturalHeight, round: false } : null;
    }
    if (typeof document === 'undefined') {
      return null;
    }
    const loaded = body.texture ? await loadTexture(`journey/tex/${body.texture}-1024.webp`) : null;
    const texture = loaded ? (body.tint ? tintTexture(loaded, body.tint) : loaded) : proceduralTexture(body.color, false);
    const lookup = sphereLookup(CARD_SPHERE_RADIUS);
    const canvas = document.createElement('canvas');
    canvas.width = lookup.size;
    canvas.height = lookup.size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }
    const image = ctx.createImageData(lookup.size, lookup.size);
    renderSphere(lookup, texture, image.data, { rotation: 0, emissive: body.emissive });
    ctx.putImageData(image, 0, 0);
    return { ...base, image: canvas, width: lookup.size, height: lookup.size, round: true };
  } catch {
    return null;
  }
}
