import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const MODULE_URL = '/module/reise-nach-draussen';
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const stageTitle = (page: Page) => page.getByRole('heading', { level: 2 }).first();
/** A stage button on the scale bar; on short phones the stages sit behind "Stufen". */
const bar = (page: Page, name: string) => ({
  async click(options?: { timeout?: number }) {
    const nav = page.getByRole('navigation', { name: 'Massstab' });
    const toggle = nav.getByRole('button', { name: 'Stufen' });
    if ((await toggle.count()) > 0 && (await toggle.getAttribute('aria-expanded')) !== 'true') {
      await toggle.click();
    }
    await nav.getByRole('button', { name, exact: true }).click(options);
  },
});

async function open(page: Page) {
  await page.goto(MODULE_URL);
  await expect(stageTitle(page)).toHaveText('Die Erde');
}

async function axe(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

test.describe('Modul A: Die Reise nach draussen', () => {
  test.setTimeout(120_000);

  test('starts at the Earth with distance, light time and a start hint', async ({ page }) => {
    await open(page);
    await expect(page.locator('app-stage-text .line')).toHaveText('„Jeder Mensch, den du je gekannt hast, hat auf dieser Kugel gelebt.“');
    await expect(page.locator('app-distance-readout .distance')).toHaveText('12.742 km');
    await expect(page.getByText('Licht · 0,04 s')).toBeVisible();
    await expect(page.getByText(/Zum Hinauszoomen/)).toBeVisible();
    await expect(page.locator('app-stage-text .aha')).toHaveText('Licht umrundet die Erde 7,5-mal in einer Sekunde.', { timeout: 5000 });
  });

  test('zooms stage by stage with the keyboard, showing texts only at rest', async ({ page }) => {
    await open(page);
    const expected = [
      ['Erde und Mond', '384.400 km'],
      ['Das Sonnensystem', '4,5 Mrd. km'],
      ['Benachbarte Sternensysteme', '4,24 Lichtjahre'],
      ['Die ganze Milchstrasse', '100.000 Lichtjahre'],
    ];
    for (const [title, distance] of expected) {
      await page.keyboard.press('ArrowUp');
      await expect(page.getByRole('heading', { level: 2 })).toHaveCount(0);
      await expect(stageTitle(page)).toHaveText(title, { timeout: 12_000 });
      await expect(page.locator('app-distance-readout .distance')).toHaveText(distance);
    }
    await expect(page.getByText(/Zum Hinauszoomen/)).toHaveCount(0);
  });

  test('takes at least 6 seconds through the emptiness, showing nothing', async ({ page }) => {
    await open(page);
    await bar(page, 'Sonnensystem').click();
    await expect(stageTitle(page)).toHaveText('Das Sonnensystem');
    const start = Date.now();
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(3000);
    const visibleLayers = await page.locator('.layer').evaluateAll((els) => els.filter((e) => (e as HTMLElement).style.visibility === 'visible').length);
    expect(visibleLayers).toBe(0);
    await expect(page.locator('app-earth-marker')).toBeVisible();
    await expect(stageTitle(page)).toHaveText('Benachbarte Sternensysteme', { timeout: 10_000 });
    expect(Date.now() - start).toBeGreaterThanOrEqual(6000);
  });

  test('jumps via the scale bar and zooms with the wheel', async ({ page }) => {
    await open(page);
    await bar(page, 'Lokale Gruppe').click();
    await expect(stageTitle(page)).toHaveText('Die Lokale Gruppe', { timeout: 30_000 });
    await expect(page.locator('app-distance-readout .distance')).toHaveText('10 Mio. Lichtjahre');
    await page.mouse.move(150, 300);
    await page.mouse.wheel(0, -60);
    await expect(stageTitle(page)).toHaveText('Die ganze Milchstrasse', { timeout: 10_000 });
  });

  test('opens the facts and closes them with Escape', async ({ page }) => {
    await open(page);
    await bar(page, 'Milchstrasse').click();
    await expect(stageTitle(page)).toHaveText('Die ganze Milchstrasse', { timeout: 30_000 });
    await page.getByRole('button', { name: 'Wie genau weiss man das?' }).click();
    const sheet = page.getByRole('region', { name: 'Wie genau weiss man das?' });
    await expect(sheet).toContainText('Niemand hat die Milchstrasse je von aussen fotografiert');
    await expect(sheet).toContainText('NASA/JPL-Caltech');
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Wie genau weiss man das?' })).toBeFocused();
  });

  test('shows Mars up close with the age on Mars', async ({ page }) => {
    await open(page);
    await bar(page, 'Sonnensystem').click();
    await page.getByRole('button', { name: 'Mars ansehen' }).click();
    const closeup = page.getByRole('dialog', { name: 'Mars' });
    await expect(closeup).toContainText('228 Mio. km');
    await expect(closeup).toContainText('„Eine rote Wüste. Und der Sonnenuntergang ist hier blau.“');
    const sphere = closeup.locator('canvas');
    const before = await sphere.screenshot();
    await closeup.getByRole('img', { name: /Mars/ }).focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    expect((await sphere.screenshot()).equals(before)).toBe(false);
    await closeup.getByRole('button', { name: 'Wie alt wäre ich hier?' }).click();
    await closeup.getByLabel('Dein Geburtsjahr').fill('1996');
    await closeup.getByRole('button', { name: 'Alter berechnen' }).click();
    await expect(closeup).toContainText(/Hier wärst du 1[56] Jahre alt\./);
    // Zooming inside the close-up does not continue the journey.
    await page.mouse.move(195, 200);
    await page.mouse.wheel(0, 600);
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(1500);
    await expect(closeup).toBeVisible();
    await closeup.getByRole('button', { name: 'Zurück zum Sonnensystem' }).click();
    await expect(stageTitle(page)).toHaveText('Das Sonnensystem');
  });

  test('shows the Moon, the Sun and Voyager 1 up close', async ({ page }) => {
    await open(page);
    await bar(page, 'Mond').click();
    await expect(stageTitle(page)).toHaveText('Erde und Mond');
    await page.getByRole('button', { name: 'Mond ansehen' }).click();
    const moon = page.getByRole('dialog', { name: 'Mond' });
    await expect(moon).toContainText('384.400 km');
    await expect(moon.getByRole('button', { name: 'Wie alt wäre ich hier?' })).toHaveCount(0);
    expect(await axe(page)).toEqual([]);
    await moon.getByRole('button', { name: 'Zurück zu Erde und Mond' }).click();
    await expect(stageTitle(page)).toHaveText('Erde und Mond');
    await bar(page, 'Sonnensystem').click();
    await expect(stageTitle(page)).toHaveText('Das Sonnensystem');
    await page.getByRole('button', { name: 'Sonne ansehen' }).click();
    const sun = page.getByRole('dialog', { name: 'Sonne' });
    await expect(sun).toContainText('8 min 20 s');
    await sun.getByRole('button', { name: 'Zurück zum Sonnensystem' }).click();
    await expect(stageTitle(page)).toHaveText('Das Sonnensystem');
    // The name next to the tiny probe is part of the hit area.
    await page.locator('app-solar-system-layer .lbl', { hasText: 'Voyager 1' }).click();
    const voyager = page.getByRole('dialog', { name: 'Voyager 1' });
    await expect(voyager).toContainText('25,9 Mrd. km');
    await expect(voyager.getByRole('img', { name: /Raumsonde Voyager 1/ })).toBeVisible();
    expect(await axe(page)).toEqual([]);
    await voyager.getByRole('button', { name: 'Zurück zum Sonnensystem' }).click();
    await expect(stageTitle(page)).toHaveText('Das Sonnensystem');
  });

  test('keeps Voyager 1 selectable below the header on a short phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await open(page);
    await bar(page, 'Sonnensystem').click();
    await expect(stageTitle(page)).toHaveText('Das Sonnensystem');
    const label = page.locator('app-solar-system-layer .lbl', { hasText: 'Voyager 1' });
    const box = await label.boundingBox();
    expect(box?.y).toBeGreaterThan(64);
    // The far end of the name, next to the scale bar, still opens Voyager 1.
    await page.mouse.click((box?.x ?? 0) + (box?.width ?? 0) - 3, (box?.y ?? 0) + (box?.height ?? 0) / 2);
    await expect(page.getByRole('dialog', { name: 'Voyager 1' })).toBeVisible();
  });

  test('flies home from the universe and marks the module explored', async ({ page }) => {
    await open(page);
    await bar(page, 'Universum').click();
    await expect(stageTitle(page)).toHaveText('Das ganze Universum', { timeout: 30_000 });
    const home = page.getByRole('button', { name: 'Und jetzt zurück. Nach Hause.' });
    await expect(home).toBeVisible({ timeout: 10_000 });
    await home.click();
    await expect(page.locator('app-stage-text .line')).toHaveText('„All das. Und mittendrin: wir.“', { timeout: 15_000 });
    await expect(page.getByRole('button', { name: 'Nochmal reisen' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zu einer Stufe springen' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bild teilen' })).toBeVisible();
    await page.getByRole('link', { name: 'Zurück zum Himmel' }).click();
    await expect(page.getByRole('button', { name: 'Die Reise nach draussen', exact: true })).toHaveClass(/explored/);
  });

  test('branches from the Local Group to Licht als Zeitmaschine, and no longer to the Sandkorn-Welt', async ({ page }) => {
    await open(page);
    await bar(page, 'Benachbarte Sternensysteme').click();
    await expect(stageTitle(page)).toHaveText('Benachbarte Sternensysteme', { timeout: 30_000 });
    await expect(page.getByRole('link', { name: /Wie leer ist das wirklich\?/ })).toHaveCount(0);
    await bar(page, 'Lokale Gruppe').click();
    await page.getByRole('link', { name: /Licht als Zeitmaschine/ }).click({ timeout: 30_000 });
    await expect(page).toHaveURL(/\/module\/zeitmaschine$/);
  });

  test('has no axe violations at the key states', async ({ page }) => {
    await open(page);
    expect(await axe(page)).toEqual([]);
    await bar(page, 'Sonnensystem').click();
    await expect(stageTitle(page)).toHaveText('Das Sonnensystem');
    expect(await axe(page)).toEqual([]);
    await page.getByRole('button', { name: 'Mars ansehen' }).click();
    await expect(page.getByRole('dialog', { name: 'Mars' })).toBeVisible();
    expect(await axe(page)).toEqual([]);
    await page.getByRole('button', { name: 'Zurück zum Sonnensystem' }).click();
    await bar(page, 'Milchstrasse').click();
    await expect(stageTitle(page)).toHaveText('Die ganze Milchstrasse', { timeout: 30_000 });
    await page.getByRole('button', { name: 'Wie genau weiss man das?' }).click();
    expect(await axe(page)).toEqual([]);
    await page.keyboard.press('Escape');
    await bar(page, 'Universum').click();
    await expect(page.getByRole('button', { name: 'Und jetzt zurück. Nach Hause.' })).toBeVisible({ timeout: 30_000 });
    expect(await axe(page)).toEqual([]);
  });

  test('cross-fades instead of zooming under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await bar(page, 'Milchstrasse').click();
    await expect(stageTitle(page)).toHaveText('Die ganze Milchstrasse', { timeout: 10_000 });
    expect(await axe(page)).toEqual([]);
  });

  test('fits a small phone without overlap', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await open(page);
    await bar(page, 'Milchstrasse').click();
    await expect(page.locator('app-stage-text .aha')).toContainText('Kronkorken', { timeout: 30_000 });
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(320);
    const text = await page.locator('app-stage-text .text').boundingBox();
    const scale = await page.locator('app-scale-bar').boundingBox();
    const readout = await page.locator('app-distance-readout .corner').boundingBox();
    expect(text && scale && readout).toBeTruthy();
    if (!text || !scale || !readout) return;
    expect(text.y).toBeGreaterThanOrEqual(scale.y + scale.height - 1);
    expect(text.y + text.height).toBeLessThanOrEqual(640);
    expect(readout.y + readout.height).toBeLessThanOrEqual(scale.y + 40);
  });

  test('keeps texts lower left and the scale bar right on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page);
    await bar(page, 'Milchstrasse').click();
    await expect(page.locator('app-stage-text .aha')).toContainText('Kronkorken', { timeout: 30_000 });
    const text = await page.locator('app-stage-text .text').boundingBox();
    const scale = await page.locator('app-scale-bar').boundingBox();
    expect(text && scale).toBeTruthy();
    if (!text || !scale) return;
    expect(text.x).toBeLessThan(200);
    expect(text.x + text.width).toBeLessThan(scale.x);
    expect(scale.x + scale.width).toBeGreaterThan(1380);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1440);
  });

  test('loads nothing from other servers and never asks for the location', async ({ page }) => {
    const foreign: string[] = [];
    page.on('request', (r) => {
      const url = new URL(r.url());
      if (!['localhost', '127.0.0.1'].includes(url.hostname) && !url.protocol.startsWith('data') && !url.protocol.startsWith('blob')) {
        foreign.push(r.url());
      }
    });
    await page.addInitScript(() => {
      (window as unknown as { geo: number }).geo = 0;
      navigator.geolocation.getCurrentPosition = () => (window as unknown as { geo: number }).geo++;
    });
    await open(page);
    await bar(page, 'Universum').click();
    await expect(stageTitle(page)).toHaveText('Das ganze Universum', { timeout: 30_000 });
    await bar(page, 'Erde').click();
    // Zooming back by hand after the universe also counts as coming home.
    await expect(stageTitle(page)).toHaveText('Zurück bei der Erde', { timeout: 30_000 });
    // A picture card is drawn and saved on the device, without any upload.
    await page.getByRole('button', { name: 'Bild teilen' }).click();
    const dialog = page.getByRole('dialog', { name: 'Bild teilen' });
    await expect(dialog.getByRole('img')).toHaveAttribute('alt', /Kronkorken/);
    const download = page.waitForEvent('download');
    await dialog.getByRole('button', { name: 'Herunterladen' }).click();
    expect((await download).suggestedFilename()).toBe('milchstrasse.png');
    expect(foreign).toEqual([]);
    expect(await page.evaluate(() => (window as unknown as { geo: number }).geo)).toBe(0);
  });
});
