import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import sharp from 'sharp';

// Without LCD subpixel smoothing: its coloured fringes on text are an artefact of screenshots, not of the page.
test.use({ launchOptions: { args: ['--disable-lcd-text'] } });

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
/** 26 November 2026, 16:00 in Hamburg: a nearly full Moon. */
const MOON_NIGHT = new Date('2026-11-26T15:00:00Z');
/** 9 December 2026, 16:00 in Hamburg: new Moon, a night for the Milky Way. */
const GOOD_NIGHT = new Date('2026-12-09T15:00:00Z');

async function axe(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

async function open(page: Page, at = MOON_NIGHT) {
  await page.clock.setFixedTime(at);
  await page.goto('/heute-nacht');
}

const placeField = (page: Page) => page.getByRole('combobox', { name: 'Stadt oder Ort suchen' });
const darknessField = (page: Page) => page.getByRole('combobox', { name: /^Wie dunkel ist es dort\?/ });

/** Types into the place field and picks a suggestion. */
async function choosePlace(page: Page, query: string, name: RegExp) {
  await placeField(page).fill(query);
  await page.getByRole('option', { name }).click();
}

/** Opens the darkness choice and picks a level. */
async function chooseLevel(page: Page, level: RegExp) {
  await darknessField(page).click();
  await page.getByRole('option', { name: level }).click();
}

/** Search Hamburg, keep or change the suggested darkness; the list follows at once. */
async function chooseHamburg(page: Page, level?: RegExp) {
  await choosePlace(page, 'Hamburg', /^Hamburg\s*Hamburg/);
  if (level) {
    await chooseLevel(page, level);
  }
  await expect(placeField(page)).toHaveValue('Hamburg');
  await expect(page.locator('app-object-card').first()).toBeVisible();
}

/** Scrolls through the page so that lazily loaded pictures are fetched, then waits for them. */
async function loadPictures(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
}

/** Records every request that leaves the app's own origin. */
function foreignRequests(page: Page, origin: string): string[] {
  const foreign: string[] = [];
  page.on('request', (r) => {
    const url = r.url();
    if (!url.startsWith(origin) && !url.startsWith('data:') && !url.startsWith('blob:')) {
      foreign.push(url);
    }
  });
  return foreign;
}

test.describe('Heute Nacht', () => {
  test.setTimeout(90_000);

  test('opens from the home card with the place question and no location request', async ({ page, baseURL }) => {
    const foreign = foreignRequests(page, baseURL!);
    await page.clock.setFixedTime(MOON_NIGHT);
    await page.goto('/');
    await page.getByRole('link', { name: /Wo stehst du heute Nacht\?/ }).click();
    await expect(page).toHaveURL(/\/heute-nacht$/);
    await expect(page).toHaveTitle('Heute Nacht · Die Milchstrasse erleben');
    await expect(page.getByRole('heading', { name: 'Wo stehst du heute Nacht?' })).toBeFocused();
    await expect(placeField(page)).toHaveValue('');
    await expect(page.locator('app-object-card')).toHaveCount(0);
    expect(await page.evaluate(() => navigator.permissions.query({ name: 'geolocation' }).then((p) => p.state))).not.toBe('granted');
    expect(await axe(page)).toEqual([]);
    expect(foreign).toEqual([]);
  });

  test('chooses a place with the suggested darkness, shows what is visible and keeps it', async ({ page, baseURL }) => {
    const foreign = foreignRequests(page, baseURL!);
    await open(page);
    await placeField(page).fill('Rhön');
    expect(await axe(page)).toEqual([]);
    await page.getByRole('option', { name: /Sternenpark Rhön/ }).click();
    await expect(darknessField(page)).toContainText('Sehr dunkel');
    await expect(page.getByText('Vorgeschlagen für einen Sternenpark.')).toBeVisible();
    await choosePlace(page, 'Hamburg', /^Hamburg\s*Hamburg/);
    await expect(placeField(page)).toHaveValue('Hamburg');
    await expect(page.getByRole('option')).toHaveCount(0);
    await expect(darknessField(page)).toContainText('Mitten in der Stadt');
    await darknessField(page).click();
    await expect(page.getByRole('option')).toHaveCount(5);
    expect(await axe(page)).toEqual([]);
    await page.getByRole('option', { name: /Stadtrand, Vorort/ }).click();
    await expect(darknessField(page)).toContainText('Stadtrand, Vorort');

    await expect(page.locator('app-conditions')).toContainText('Dunkel ab 18:15 Uhr');
    await expect(page.locator('app-conditions')).toContainText(/Mond 9\d %, fast voll/);
    await expect(page.locator('.summary')).toHaveText(/^Um 20 Uhr siehst du \d+ Dinge mit blossem Auge\. Der helle Mond schluckt heute alles Blasse/);
    await expect(page.getByRole('button', { name: /Abends · 20 Uhr/ })).toHaveAttribute('aria-pressed', 'true');
    const saturn = page.locator('app-object-card').filter({ hasText: 'Saturn' });
    await expect(saturn.locator('.position')).toHaveText('Süden · Vier Fäuste hoch');
    await expect(page.locator('app-hidden-list')).toContainText('Milchstrasse');
    await expect(page.locator('.note')).toContainText('Samstag, 28. November');
    await loadPictures(page);
    expect(await axe(page)).toEqual([]);

    await page.reload();
    await expect(placeField(page)).toHaveValue('Hamburg');
    await expect(darknessField(page)).toContainText('Stadtrand, Vorort');
    await page.goto('/');
    await expect(page.locator('app-tonight-card')).toContainText('Heute Nacht · Hamburg');
    await expect(page.locator('app-tonight-card .title')).toHaveText(/^\d+ Dinge mit blossem Auge, zum Beispiel Saturn im Süden\.$/);
    await expect(page.locator('app-tonight-card')).toContainText('Die Milchstrasse: wieder am Samstag.');
    await expect(page.locator('app-tonight-card .choose')).toBeVisible();
    await page.locator('app-tonight-card').getByText('Was du heute siehst').click();
    await expect(page).toHaveURL(/\/heute-nacht$/);
    expect(foreign).toEqual([]);
  });

  test('expands a card with the marked photo and steps, and follows the moment', async ({ page }) => {
    await open(page);
    await chooseHamburg(page);
    const saturn = page.locator('app-object-card').filter({ hasText: 'Saturn' });
    const head = saturn.locator('button.head');
    await head.click();
    await expect(head).toHaveAttribute('aria-expanded', 'true');
    const photo = saturn.locator('app-marked-photo img');
    await expect(photo).toHaveAttribute('alt', /Markiert: Saturn\./);
    await photo.scrollIntoViewIfNeeded();
    await expect.poll(() => photo.evaluate((i: HTMLImageElement) => (i.complete ? i.naturalWidth : 0))).toBe(960);
    await expect(saturn.locator('app-marked-photo svg text').first()).toHaveText('Saturn');
    await expect(saturn.getByText('Nahaufnahme')).toHaveCount(0);
    await expect(saturn.locator('ol li').first()).toHaveText('Dreh dich nach Süden.');
    await expect(saturn).toContainText('Sichtbar: bis 1:30 Uhr');

    await page.getByRole('button', { name: /Mitternacht/ }).click();
    await expect(page.locator('.summary')).toHaveText(/^Um 0 Uhr/);
    await expect(page.locator('app-object-card').filter({ hasText: 'Jupiter' })).toHaveCount(1);
    await expect(page.locator('app-object-card').filter({ hasText: 'Plejaden' }).locator('.position')).toHaveText(/^Süden/);
  });

  test('opens a card in place: it pushes what follows down, closes nothing and does not scroll', async ({ page }) => {
    await open(page);
    await chooseHamburg(page);
    await loadPictures(page);
    const cards = page.locator('app-object-card');
    const last = cards.last().locator('button.head');
    await last.scrollIntoViewIfNeeded();
    const scrollBefore = await page.evaluate(() => window.scrollY);
    const topBefore = (await last.boundingBox())!.y;
    await last.click();
    await expect(last).toHaveAttribute('aria-expanded', 'true');
    await page.locator('app-object-card').last().locator('app-marked-photo img').evaluate((i: HTMLImageElement) => i.decode());
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);
    expect(Math.abs((await last.boundingBox())!.y - topBefore)).toBeLessThan(1);
    await expect(cards.first().locator('button.head')).toHaveAttribute('aria-expanded', 'true');
  });

  test('puts the Milky Way first on a moonless night at a dark place', async ({ page }) => {
    await open(page, GOOD_NIGHT);
    await chooseHamburg(page, /^Auf dem Land/);
    const first = page.locator('app-object-card').first();
    await expect(first.locator('.name')).toHaveText('Milchstrasse');
    await expect(first.locator('ol')).toContainText('Folge dem Band nach oben.');
    await expect(page.locator('.summary')).toContainText('Heute ist eine Nacht für die Milchstrasse.');
    await page.goto('/');
    await expect(page.locator('app-tonight-card .title')).toHaveText(/zum Beispiel die Milchstrasse\.$/);
  });

  test('opens the facts and returns focus on Escape', async ({ page }) => {
    await open(page);
    await chooseHamburg(page);
    const opener = page.getByRole('button', { name: 'Wie genau weiss man das?' });
    await opener.click();
    await expect(page.getByRole('heading', { name: 'Wie genau weiss man das?' })).toBeFocused();
    await expect(page.getByText(/GeoNames/)).toBeVisible();
    await expect(page.getByText(/Wikimedia Commons/)).toBeVisible();
    expect(await axe(page)).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(opener).toBeFocused();
  });

  test('changes the place and the darkness with the keyboard', async ({ page }) => {
    await open(page);
    await chooseHamburg(page);
    await placeField(page).focus();
    // Focus selects the shown name a moment later, ready to be typed over.
    await expect.poll(() => placeField(page).evaluate((i: HTMLInputElement) => i.selectionStart === 0 && i.selectionEnd === i.value.length)).toBe(true);
    await page.keyboard.type('Lüneb');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(placeField(page)).toHaveValue('Lüneburg');
    await expect(darknessField(page)).toContainText('Stadtrand, Vorort');
    await darknessField(page).focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(darknessField(page)).toContainText('Land, nahe einer Stadt');
    await expect(page.getByRole('button', { name: 'Ort vergessen' })).toHaveCount(0);
  });

  test('uses the device location only after the tap, rounded', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 53.5512, longitude: 9.9937 });
    await page.addInitScript(() => {
      const geo = navigator.geolocation;
      const original = geo.getCurrentPosition.bind(geo);
      (window as unknown as { geoCalls: number }).geoCalls = 0;
      geo.getCurrentPosition = (ok, fail, options) => {
        (window as unknown as { geoCalls: number }).geoCalls++;
        original(ok, fail, options);
      };
    });
    await open(page);
    expect(await page.evaluate(() => (window as unknown as { geoCalls: number }).geoCalls)).toBe(0);
    await page.getByRole('button', { name: 'Meinen Standort verwenden' }).click();
    await expect(placeField(page)).toHaveValue('Dein Standort (Hamburg)');
    await expect(darknessField(page)).toContainText('Stadtrand, Vorort');
    await expect(page.locator('app-object-card').first()).toBeVisible();
    const stored = JSON.parse((await page.evaluate(() => localStorage.getItem('be.tonight.place.v1'))) ?? '{}');
    expect(stored).toMatchObject({ lat: 53.55, lon: 10, source: 'device' });
  });

  test('stays calm when the location is refused', async ({ page }) => {
    await page.addInitScript(() => {
      navigator.geolocation.getCurrentPosition = (_ok, fail) =>
        fail?.({ code: 1, message: 'denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError);
    });
    await open(page);
    await page.getByRole('button', { name: 'Meinen Standort verwenden' }).click();
    await expect(page.getByText('Dein Standort ist gerade nicht verfügbar. Such deinen Ort einfach oben.')).toBeVisible();
    await expect(placeField(page)).toBeEnabled();
  });

  test('switches night mode only in the settings, for the whole app', async ({ page }) => {
    await open(page);
    await chooseHamburg(page);
    await expect(page.getByRole('button', { name: /Nachtmodus/ })).toHaveCount(0);
    await page.locator('.tips').getByRole('link', { name: 'Einstellungen' }).click();
    await expect(page).toHaveURL(/\/einstellungen$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Einstellungen' })).toBeFocused();
    const toggle = page.getByRole('switch', { name: 'Nachtmodus' });
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(await axe(page)).toEqual([]);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByText(/Dreh auch die Helligkeit deines Bildschirms herunter/)).toBeVisible();
    await expect(page.locator('html')).toHaveClass(/night/);
    expect(await axe(page)).toEqual([]);

    await page.goto('/heute-nacht');
    await expect(page.locator('html')).toHaveClass(/night/);
    await expect(page.locator('.tips').getByRole('link', { name: 'Einstellungen' })).toHaveCount(0);
    expect(await axe(page)).toEqual([]);
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/night/);
    await page.goto('/');
    await expect(page.getByRole('button', { name: /Nachtmodus/ })).toHaveCount(0);
    expect(await axe(page)).toEqual([]);

    await page.getByRole('link', { name: 'Einstellungen' }).click();
    await page.getByRole('switch', { name: 'Nachtmodus' }).press('Space');
    await expect(page.locator('html')).not.toHaveClass(/night/);
  });
});

test.describe('Heute Nacht layout', () => {
  test.setTimeout(90_000);

  for (const [width, height] of [
    [320, 640],
    [1440, 900],
  ]) {
    test(`is one column without horizontal scrolling at ${width} × ${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await open(page);
      await chooseHamburg(page);
      await loadPictures(page);
      const scroll = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(scroll).toBeLessThanOrEqual(0);
      const column = await page.locator('.page').boundingBox();
      expect(column!.width).toBeLessThanOrEqual(34 * 16 + 1);
      const conditions = await page.locator('app-conditions').boundingBox();
      const list = await page.locator('.objects').boundingBox();
      expect(list!.y).toBeGreaterThan(conditions!.y);
      expect(Math.abs(list!.x - conditions!.x)).toBeLessThan(2);
    });
  }
});

/** Pixels whose green or blue channel exceeds red by more than the tolerance. */
async function coldPixels(png: Buffer, tolerance = 16): Promise<number> {
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  let cold = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i + 1] > data[i] + tolerance || data[i + 2] > data[i] + tolerance) {
      cold++;
    }
  }
  return cold;
}

test.describe('night mode everywhere', () => {
  test.setTimeout(120_000);

  for (const [name, url] of [
    ['the home screen', '/'],
    ['Modul A', '/module/reise-nach-draussen'],
    ['Modul B', '/module/lichtgeschwindigkeit'],
    ['Modul C', '/module/galaktisches-jahr'],
    ['Heute Nacht', '/heute-nacht'],
    ['the settings', '/einstellungen'],
  ]) {
    test(`leaves no white or blue light on ${name}`, async ({ page }) => {
      await page.clock.setFixedTime(MOON_NIGHT);
      await page.addInitScript(() => {
        localStorage.setItem('be.nightMode.v1', 'on');
        localStorage.setItem(
          'be.tonight.place.v1',
          JSON.stringify({ name: 'Hamburg', lat: 53.55, lon: 9.99, tz: 'Europe/Berlin', source: 'list' }),
        );
        localStorage.setItem('be.tonight.darkness.v1', '2');
      });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(url);
      await expect(page.locator('html')).toHaveClass(/night/);
      await page.waitForTimeout(1500);
      if (url === '/heute-nacht') {
        // Step 2 with the first card expanded: its photos must be tinted, its marks red.
        await expect(page.locator('app-marked-photo').first()).toBeVisible();
        await loadPictures(page);
      }
      expect(await coldPixels(await page.screenshot({ fullPage: true }))).toBe(0);
    });
  }
});
