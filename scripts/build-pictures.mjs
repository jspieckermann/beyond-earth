// Builds the pictures of „Heute Nacht“ in public/tonight/img/ from Wikimedia Commons.
//
// Usage (run by hand when a picture is added or replaced):
//   node scripts/build-pictures.mjs            all pictures
//   node scripts/build-pictures.mjs eye-mond   only the named ones, the others stay as they are
//
// Reads src/app/tonight/data/picture-sources.json ({ id: { file, thumb?, thumbOnly?, width?, crop? } } with Commons file names),
// downloads each file at 960 px width (or `width`), cuts out `crop` ({ left, top, width, height } in pixels of the
// download) where set, writes <id>.webp (and a 128 px square <id>-thumb.webp where `thumb` is set; only the thumbnail where `thumbOnly` is set) and records the
// real size of every file in src/app/tonight/data/pictures.json. Marks in pictures.ts are given in pixels of these
// files; a unit test compares the sizes stated there with this manifest.
// Only freely licensed files may be listed; authors and licences are written in pictures.ts.
// Uses `sharp`, which comes with the Angular build tools.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourcesPath = join(root, 'src/app/tonight/data/picture-sources.json');
const manifestPath = join(root, 'src/app/tonight/data/pictures.json');
const outDir = join(root, 'public/tonight/img');

const WIDTH = 960;
const THUMB = 128;
const QUALITY = 68;

const sources = JSON.parse(readFileSync(sourcesPath, 'utf8'));
mkdirSync(outDir, { recursive: true });

const only = process.argv.slice(2);
for (const id of only) {
  if (!sources[id]) {
    throw new Error(`Unknown picture ${id}`);
  }
}
const previous = only.length ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};

/** Commons answers too many requests in a row with 429: wait and try again. */
async function download(url, id) {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, { headers: { 'User-Agent': 'picture-build-script/1.0' } });
    if (response.ok) {
      return Buffer.from(await response.arrayBuffer());
    }
    if (response.status !== 429 || attempt === 5) {
      throw new Error(`${id}: ${response.status} for ${url}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 5000 * attempt));
  }
}

const manifest = {};
for (const [id, { file, thumb, thumbOnly, width, crop }] of Object.entries(sources)) {
  if (only.length && !only.includes(id)) {
    manifest[id] = previous[id];
    continue;
  }
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.replace(/ /g, '_'))}?width=${width ?? WIDTH}`;
  const downloaded = await download(url, id);
  const input = crop ? await sharp(downloaded).rotate().extract(crop).toBuffer() : downloaded;
  const image = sharp(input).rotate();
  const { data, info } = await image.webp({ quality: QUALITY }).toBuffer({ resolveWithObject: true });
  if (thumbOnly) {
    rmSync(join(outDir, `${id}.webp`), { force: true });
  } else {
    writeFileSync(join(outDir, `${id}.webp`), data);
  }
  manifest[id] = { width: info.width, height: info.height, bytes: thumbOnly ? 0 : data.length };
  if (thumb || thumbOnly) {
    const small = await sharp(input).resize(THUMB, THUMB, { fit: 'cover' }).webp({ quality: 75 }).toBuffer();
    writeFileSync(join(outDir, `${id}-thumb.webp`), small);
    manifest[id].thumbBytes = small.length;
  }
  console.log(thumbOnly ? `${id}: thumbnail only` : `${id}: ${info.width}×${info.height}, ${Math.round(data.length / 1024)} kB`);
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
const total = Object.values(manifest).reduce((sum, m) => sum + m.bytes + (m.thumbBytes ?? 0), 0);
console.log(`${Object.keys(manifest).length} pictures, ${Math.round(total / 1024)} kB in total`);
