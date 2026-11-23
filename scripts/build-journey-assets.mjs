#!/usr/bin/env node
/**
 * Builds the images, textures and data of Modul A into public/journey.
 *
 * Downloads every original once into .asset-cache/ (git-ignored), then crops, resizes and
 * encodes WebP with sharp. The outputs are committed, so app builds never fetch anything.
 * Every asset here has an entry in src/app/outward-journey/data/credits.ts.
 *
 *   node scripts/build-journey-assets.mjs           build everything
 *   node scripts/build-journey-assets.mjs --check   only verify that all outputs exist
 */
import { createReadStream, existsSync } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const CACHE = path.join(ROOT, '.asset-cache');
const OUT = path.join(ROOT, 'public', 'journey');
const USER_AGENT = 'beyond-earth-asset-script/1.0 (offline build script)';

const SSS = 'https://www.solarsystemscope.com/textures/download/';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';

/** Equirectangular textures (Solar System Scope, CC BY 4.0, after NASA data). */
const TEXTURES = {
  'earth-day': `${SSS}2k_earth_daymap.jpg`,
  'earth-night': `${SSS}2k_earth_nightmap.jpg`,
  sonne: `${SSS}2k_sun.jpg`,
  mond: `${SSS}2k_moon.jpg`,
  merkur: `${SSS}2k_mercury.jpg`,
  venus: `${SSS}2k_venus_atmosphere.jpg`,
  erde: `${SSS}2k_earth_daymap.jpg`,
  mars: `${SSS}2k_mars.jpg`,
  jupiter: `${SSS}2k_jupiter.jpg`,
  saturn: `${SSS}2k_saturn.jpg`,
  uranus: `${SSS}2k_uranus.jpg`,
  neptun: `${SSS}2k_neptune.jpg`,
};
const TEXTURE_WIDTHS = [1024, 2048];

/** Photos and reconstructions from Wikimedia Commons (licences checked in credits.ts). */
const IMAGES = {
  voyager: { title: 'File:Voyager spacecraft.jpg', fetch: 480, widths: [120, 480] },
  'sgr-a': { title: 'File:EHT Saggitarius A black hole.tif', fetch: 960, widths: [240, 480, 960] },
  'milky-way': { title: 'File:Artist’s impression of the Milky Way.jpg', fetch: 2560, widths: [480, 960, 1920] },
  // The Orion arm: the Milky Way reconstruction cropped around the Sun (fractions of the image).
  'orion-arm': { title: 'File:Artist’s impression of the Milky Way.jpg', fetch: 2560, widths: [480, 960, 1920], crop: { cx: 0.5, cy: 0.6914, size: 0.26 } },
  andromeda: { title: 'File:Andromeda Galaxy (with h-alpha).jpg', fetch: 1920, widths: [480, 960, 1920] },
  'cosmic-web': { title: 'File:Cosmic web.jpg', fetch: 0, widths: [678] },
  // Galaxies of the Local Group (the portrait Triangulum photo is cropped to a square).
  triangulum: { title: 'File:VST snaps a very detailed view of the Triangulum Galaxy.jpg', fetch: 960, widths: [480, 960], crop: { cx: 0.5, cy: 0.5, size: 1 } },
  lmc: { title: 'File:LMC snapped by the ESO 1-metre Schmidt telescope.jpg', fetch: 960, widths: [480, 960] },
  smc: { title: 'File:Small Magellanic Cloud (Digitized Sky Survey 2).jpg', fetch: 960, widths: [480, 960] },
  // Structures and places of the whole universe.
  // Commons serves this small original only as a thumbnail of a standard width.
  laniakea: { title: 'File:Laniakea Supercluster (Cropped).png', fetch: 500, widths: [480] },
  'bullet-cluster': { title: 'File:Visible-Light and X-Ray Composite Image of Galaxy Cluster 1E 0657-556 (2006-39-1981).jpg', fetch: 960, widths: [480, 960] },
  'webb-deep-field': { title: "File:Webb's First Deep Field.jpg", fetch: 960, widths: [480, 960] },
  'jades-gs-z14-0': { title: 'File:Webb finds most distant known galaxy (JADES-GS-z14-0 annotated pullout NIRCam image) (jades4).jpg', fetch: 960, widths: [480, 960] },
  // The quasar TON 618 sits in the middle of the survey picture; cropped to a square around it.
  'ton-618': { title: 'File:TON 618 SDSS9 version 2.jpg', fetch: 960, widths: [480], crop: { cx: 0.5, cy: 0.5, size: 0.53 } },
  cmb: { title:'File:Cosmic Microwave Background (CMB).jpeg', fetch: 960, widths: [480, 960] },
};

const HYG_URL = 'https://raw.githubusercontent.com/astronexus/HYG-Database/main/hyg/CURRENT/hygdata_v41.csv';
/** Stars of the constellation Orion by Hipparcos number (for the lines that fall apart). */
const ORION = { 27989: 'Beteigeuze', 25336: 'Bellatrix', 26727: 'Alnitak', 26311: 'Alnilam', 25930: 'Mintaka', 27366: 'Saiph', 24436: 'Rigel', 26207: 'Meissa' };
const MAX_MAG = 6.5;

async function download(url, file) {
  if (existsSync(file)) {
    return file;
  }
  await mkdir(path.dirname(file), { recursive: true });
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (res.ok) {
      await writeFile(file, Buffer.from(await res.arrayBuffer()));
      return file;
    }
    if (res.status !== 429 && res.status < 500) {
      throw new Error(`${res.status} for ${url}`);
    }
    await new Promise((r) => setTimeout(r, 5000 * attempt));
  }
  throw new Error(`Gave up on ${url}`);
}

/**
 * Resolves Commons file titles to download URLs: the original, or a thumbnail of the wanted
 * width as served by Commons. One request per width, as the API's rules ask.
 */
async function commonsUrls(entries) {
  const urls = {};
  const byWidth = Map.groupBy(entries, ([, e]) => e.fetch);
  for (const [width, group] of byWidth) {
    const titles = [...new Set(group.map(([, e]) => e.title))];
    const params = new URLSearchParams({ action: 'query', format: 'json', prop: 'imageinfo', iiprop: 'url', titles: titles.join('|') });
    if (width) {
      params.set('iiurlwidth', String(width));
    }
    const res = await fetch(`${COMMONS_API}?${params}`, { headers: { 'User-Agent': USER_AGENT } });
    const pages = (await res.json()).query.pages;
    const byTitle = new Map(Object.values(pages).map((p) => [p.title, p.imageinfo?.[0]]));
    for (const [id, entry] of group) {
      const info = byTitle.get(entry.title.replace(/_/g, ' '));
      if (!info) {
        throw new Error(`Not found on Commons: ${entry.title}`);
      }
      urls[id] = width ? info.thumburl : info.url;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return urls;
}

async function buildTextures(sharp) {
  for (const [id, url] of Object.entries(TEXTURES)) {
    const source = await download(url, path.join(CACHE, 'tex', path.basename(url)));
    for (const width of TEXTURE_WIDTHS) {
      await sharp(source)
        .resize(width, width / 2, { fit: 'fill' })
        .webp({ quality: 82 })
        .toFile(path.join(OUT, 'tex', `${id}-${width}.webp`));
    }
    console.log('texture', id);
  }
}

async function buildImages(sharp) {
  const urls = await commonsUrls(Object.entries(IMAGES));
  for (const [id, entry] of Object.entries(IMAGES)) {
    const url = urls[id];
    const source = await download(url, path.join(CACHE, 'img', `${id.replace('orion-arm', 'milky-way')}-${entry.fetch || 'orig'}${path.extname(new URL(url).pathname) || '.jpg'}`));
    let pipeline = sharp(source).flatten({ background: '#000000' });
    if (entry.crop) {
      const meta = await sharp(source).metadata();
      const size = Math.round(meta.width * entry.crop.size);
      pipeline = pipeline.extract({
        left: Math.round(meta.width * entry.crop.cx - size / 2),
        top: Math.round(meta.height * entry.crop.cy - size / 2),
        width: size,
        height: size,
      });
    }
    const buffer = await pipeline.toBuffer();
    for (const width of entry.widths) {
      await sharp(buffer).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(OUT, 'img', `${id}-${width}.webp`));
    }
    console.log('image', id);
  }
}

/** HYG v4.1 → stars brighter than magnitude 6.5 with equatorial x/y/z in parsecs. */
async function buildStars() {
  const source = await download(HYG_URL, path.join(CACHE, 'data', 'hygdata_v41.csv'));
  const lines = readline.createInterface({ input: createReadStream(source) });
  let header = null;
  const stars = [];
  const orion = {};
  for await (const line of lines) {
    const cols = line.split(',').map((c) => c.replace(/^"|"$/g, ''));
    if (!header) {
      header = Object.fromEntries(cols.map((c, i) => [c, i]));
      continue;
    }
    const mag = Number(cols[header.mag]);
    const dist = Number(cols[header.dist]);
    if (!(mag <= MAX_MAG) || !(dist > 0) || dist >= 100000) {
      continue;
    }
    const round = (v) => Math.round(Number(v) * 100) / 100;
    const star = [round(cols[header.x]), round(cols[header.y]), round(cols[header.z]), round(mag), round(cols[header.ci] || 0.6)];
    stars.push(star);
    const name = ORION[cols[header.hip]];
    if (name) {
      orion[name] = { x: star[0], y: star[1], z: star[2], mag: star[3], ly: Math.round(dist * 3.26156) };
    }
  }
  await writeFile(path.join(OUT, 'data', 'stars.json'), JSON.stringify({ source: 'HYG v4.1, CC BY-SA 4.0', stars, orion }));
  console.log('stars', stars.length, 'orion', Object.keys(orion).length);
}

/** Every file the app references. */
function expectedOutputs() {
  return [
    ...Object.keys(TEXTURES).flatMap((id) => TEXTURE_WIDTHS.map((w) => `tex/${id}-${w}.webp`)),
    ...Object.entries(IMAGES).flatMap(([id, e]) => e.widths.map((w) => `img/${id}-${w}.webp`)),
    'data/stars.json',
  ];
}

async function check() {
  let total = 0;
  const missing = [];
  for (const file of expectedOutputs()) {
    const full = path.join(OUT, file);
    if (!existsSync(full)) {
      missing.push(file);
      continue;
    }
    total += (await stat(full)).size;
  }
  console.log(`public/journey: ${expectedOutputs().length - missing.length} files, ${(total / 1e6).toFixed(1)} MB`);
  if (missing.length) {
    console.error('Missing:', missing.join(', '));
    process.exit(1);
  }
}

async function main() {
  if (process.argv.includes('--check')) {
    return check();
  }
  const { default: sharp } = await import('sharp');
  for (const dir of ['tex', 'img', 'data']) {
    await mkdir(path.join(OUT, dir), { recursive: true });
  }
  await buildTextures(sharp);
  await buildImages(sharp);
  await buildStars();
  await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(expectedOutputs(), null, 2) + '\n');
  await check();
}

await main().catch((error) => {
  console.error(error);
  process.exit(1);
});
void readFile;
