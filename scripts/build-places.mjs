// Builds src/app/tonight/data/places.json from GeoNames (CC BY 4.0, https://www.geonames.org).
//
// Usage (run by hand when the list should be refreshed):
//   1. Download https://download.geonames.org/export/dump/cities15000.zip and unzip it.
//   2. node scripts/build-places.mjs path/to/cities15000.txt
//
// Keeps towns in Germany, Austria and Switzerland (city districts left out), with German names and regions,
// coordinates rounded to 0.01°, the IANA time zone and the population (for ranking search results),
// and adds the International Dark Sky Places of the three countries (checked against darksky.org, Nov 2026).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const COUNTRIES = { DE: '', AT: 'Österreich', CH: 'Schweiz' };

const REGIONS = {
  DE: {
    '01': 'Baden-Württemberg', '02': 'Bayern', '03': 'Bremen', '04': 'Hamburg', '05': 'Hessen', '06': 'Niedersachsen',
    '07': 'Nordrhein-Westfalen', '08': 'Rheinland-Pfalz', '09': 'Saarland', '10': 'Schleswig-Holstein', '11': 'Brandenburg',
    '12': 'Mecklenburg-Vorpommern', '13': 'Sachsen', '14': 'Sachsen-Anhalt', '15': 'Thüringen', '16': 'Berlin',
  },
  AT: {
    '01': 'Burgenland', '02': 'Kärnten', '03': 'Niederösterreich', '04': 'Oberösterreich', '05': 'Salzburg', '06': 'Steiermark',
    '07': 'Tirol', '08': 'Vorarlberg', '09': 'Wien',
  },
  CH: {
    AG: 'Aargau', AI: 'Appenzell Innerrhoden', AR: 'Appenzell Ausserrhoden', BE: 'Bern', BL: 'Basel-Landschaft', BS: 'Basel-Stadt',
    FR: 'Freiburg', GE: 'Genf', GL: 'Glarus', GR: 'Graubünden', JU: 'Jura', LU: 'Luzern', NE: 'Neuenburg', NW: 'Nidwalden',
    OW: 'Obwalden', SG: 'St. Gallen', SH: 'Schaffhausen', SO: 'Solothurn', SZ: 'Schwyz', TG: 'Thurgau', TI: 'Tessin', UR: 'Uri',
    VD: 'Waadt', VS: 'Wallis', ZG: 'Zug', ZH: 'Zürich',
  },
};

/** GeoNames uses English names for a few towns. */
const GERMAN_NAMES = { Vienna: 'Wien', Munich: 'München', Nuremberg: 'Nürnberg', Geneva: 'Genf', Freiburg: 'Freiburg im Breisgau' };

/** International Dark Sky Places in Germany, Austria and Switzerland, each at a representative point. */
const DARK_SKY_PLACES = [
  { name: 'Sternenpark Westhavelland', region: 'Brandenburg', lat: 52.73, lon: 12.23, tz: 'Europe/Berlin' },
  { name: 'Sternenpark Rhön', region: 'Hessen, Bayern, Thüringen', lat: 50.5, lon: 9.94, tz: 'Europe/Berlin' },
  { name: 'Sternenpark Nationalpark Eifel', region: 'Nordrhein-Westfalen', lat: 50.58, lon: 6.43, tz: 'Europe/Berlin' },
  { name: 'Sternenpark Winklmoosalm', region: 'Bayern', lat: 47.66, lon: 12.52, tz: 'Europe/Berlin' },
  { name: 'Sternenpark Nossentiner/Schwinzer Heide', region: 'Mecklenburg-Vorpommern', lat: 53.57, lon: 12.3, tz: 'Europe/Berlin' },
  { name: 'Sternenpark Kyritz-Ruppiner Heide', region: 'Brandenburg', lat: 53.05, lon: 12.75, tz: 'Europe/Berlin' },
  { name: 'Sternenpark Nationalpark Bayerischer Wald', region: 'Bayern', lat: 48.95, lon: 13.42, tz: 'Europe/Berlin' },
  { name: 'Sternenpark Attersee-Traunsee', region: 'Oberösterreich, Österreich', lat: 47.85, lon: 13.65, tz: 'Europe/Vienna' },
  { name: 'Sternenpark Eisenwurzen', region: 'Oberösterreich, Niederösterreich, Steiermark', lat: 47.78, lon: 14.75, tz: 'Europe/Vienna' },
  { name: 'Naturpark Weißbach', region: 'Salzburg, Österreich', lat: 47.5, lon: 12.77, tz: 'Europe/Vienna' },
];

const round = (v) => Math.round(v * 100) / 100;

const source = process.argv[2];
if (!source) {
  console.error('Usage: node scripts/build-places.mjs path/to/cities15000.txt');
  process.exit(1);
}

const towns = readFileSync(source, 'utf8')
  .split('\n')
  .map((line) => line.split('\t'))
  .filter((f) => f.length > 17 && f[8] in COUNTRIES && f[7] !== 'PPLX' && !f[1].includes('(Kreis'))
  .map((f) => {
    const [country, admin1] = [f[8], f[10]];
    const region = [REGIONS[country][admin1], COUNTRIES[country]].filter(Boolean).join(', ');
    return { name: GERMAN_NAMES[f[1]] ?? f[1], region, lat: round(Number(f[4])), lon: round(Number(f[5])), tz: f[17], pop: Number(f[14]) };
  })
  .sort((a, b) => b.pop - a.pop || a.name.localeCompare(b.name, 'de'));

const places = [...towns, ...DARK_SKY_PLACES.map((p) => ({ ...p, pop: 0, dark: true }))];
const target = join(dirname(fileURLToPath(import.meta.url)), '../src/app/tonight/data/places.json');
writeFileSync(target, JSON.stringify(places) + '\n');
console.log(`${places.length} places written to ${target}`);
