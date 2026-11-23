import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const MODULE_URL = '/module/lichtgeschwindigkeit';
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const goal = (page: Page) => page.locator('.goal-name');
const numbers = (page: Page) => page.locator('app-arrival dd');
const arrival = (page: Page) => page.locator('app-arrival');
const live = (page: Page) => page.locator('[aria-live="polite"].sr-only');

async function open(page: Page, query = '') {
  await page.goto(MODULE_URL + query);
  await expect(page.getByRole('heading', { level: 1, name: 'Reisen mit Lichtgeschwindigkeit' })).toBeFocused();
}

async function choose(page: Page, search: string, name: string) {
  await page.getByRole('button', { name: /Ziel ändern/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Ziel wählen' });
  await dialog.getByRole('searchbox', { name: 'Suchen' }).fill(search);
  await dialog.getByRole('button', { name: new RegExp(`^${name}`) }).click();
  await expect(goal(page)).toHaveText(name);
}

async function typePercent(page: Page, value: string) {
  const field = page.getByRole('textbox', { name: 'Genau' });
  await field.fill(value);
  await field.press('Enter');
}

async function axe(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

test.describe('Modul B: Reisen mit Lichtgeschwindigkeit', () => {
  test.setTimeout(90_000);

  test('starts with Proxima Centauri at 10 % and recalculates at once', async ({ page }) => {
    await open(page);
    await expect(page).toHaveTitle('Reisen mit Lichtgeschwindigkeit · Die Milchstrasse erleben');
    await expect(goal(page)).toHaveText('Proxima Centauri');
    await expect(page.getByRole('slider', { name: 'Tempo' })).toHaveAttribute('aria-valuetext', '10 % der Lichtgeschwindigkeit');
    for (const name of ['Ziel', 'Tempo', 'Ankunft']) {
      await expect(page.getByRole('heading', { level: 2, name, exact: true })).toBeVisible();
    }
    await typePercent(page, '20');
    await expect(numbers(page)).toHaveText(['20,8 Jahre', '21,2 Jahre', '1', '1']);
    await expect(arrival(page).getByText('„Wer abfliegt, kommt an.“')).toBeVisible();
  });

  test('shows the Voyager journey to Proxima Centauri in generations', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: /^Voyager 1/ }).click();
    await expect(page.getByRole('button', { name: /^Voyager 1/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('Das sind etwa 17 km/s.')).toBeVisible();
    await expect(numbers(page)).toHaveText(['74.772 Jahre', '74.772 Jahre', '2.991', '2.991']);
    await expect(page.getByRole('img', { name: '2.991 Generationen an Bord' })).toBeVisible();
    await expect(page.getByText('Eine Figur steht für 1.000 Generationen.')).toBeVisible();
    await expect(arrival(page).getByText(/Wer abfliegt, kommt nie an\./)).toBeVisible();
    await expect(live(page)).toContainText('auf der Erde 74.772 Jahre');
  });

  test('shows time dilation on the way to Sagittarius A*', async ({ page }) => {
    await open(page);
    await choose(page, 'sagitt', 'Sagittarius A*');
    await typePercent(page, '99,9999');
    await expect(numbers(page)).toHaveText(['36,8 Jahre', '26.000 Jahre', '1', '1.041']);
    await expect(arrival(page).getByText('„Du kommst an. Aber zu Hause kennt dich niemand mehr.“')).toBeVisible();
  });

  test('labels 10 % exactly where the slider stands at 10 %', async ({ page }) => {
    await open(page);
    const slider = await page.getByRole('slider', { name: 'Tempo' }).boundingBox();
    const label = await page.locator('.scale .mark').boundingBox();
    expect(slider && label).toBeTruthy();
    if (!slider || !label) return;
    // The thumb (24 px) stays on the track: its centre runs from 12 px to width − 12 px; 10 % is position 600 of 1000.
    const thumbCentre = slider.x + 12 + 0.6 * (slider.width - 24);
    expect(Math.abs(label.x + label.width / 2 - thumbCentre)).toBeLessThan(1.5);
  });

  test('clamps 100 % and explains why', async ({ page }) => {
    await open(page);
    await typePercent(page, '100');
    await expect(page.getByRole('slider', { name: 'Tempo' })).toHaveAttribute('aria-valuetext', '99,9999 % der Lichtgeschwindigkeit');
    await expect(page.getByRole('status').filter({ hasText: 'Auf 99,9999 % gesetzt' })).toBeVisible();
  });

  test('raises the speed with the keyboard and announces it after the change', async ({ page }) => {
    await open(page);
    const slider = page.getByRole('slider', { name: 'Tempo' });
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(slider).not.toHaveAttribute('aria-valuetext', '10 % der Lichtgeschwindigkeit');
    await expect(live(page)).toContainText('Proxima Centauri');
  });

  test('never reaches TON 618 and needs no journey in the Orion arm', async ({ page }) => {
    await open(page);
    await choose(page, 'TON', 'TON 618');
    await expect(arrival(page).getByText('Nie.', { exact: true })).toBeVisible();
    await expect(numbers(page)).toHaveCount(0);
    await choose(page, 'Orion', 'Orion-Arm');
    await expect(arrival(page).getByText(/Du musst nicht reisen\. Du bist schon da/)).toBeVisible();
    await choose(page, 'Geschoss', 'Geschosshaufen');
    await expect(numbers(page).first()).toHaveText(/^mindestens /);
  });

  test('explains the closest approach of Mars', async ({ page }) => {
    await open(page);
    await choose(page, 'Mars', 'Mars');
    await expect(page.locator('.goal-distance')).toHaveText('55 Mio. km');
    await expect(page.getByText(/Bei günstigster Stellung/)).toBeVisible();
  });

  test('saves the travel card and marks the module explored on the home screen', async ({ page }) => {
    await open(page);
    await typePercent(page, '1');
    await page.getByRole('button', { name: 'Bild teilen' }).click();
    const dialog = page.getByRole('dialog', { name: 'Bild teilen' });
    await expect(dialog.getByRole('img')).toHaveAttribute('alt', /^Bildkarte mit einem Bild von Proxima Centauri: Nach Proxima Centauri mit 1 % der Lichtgeschwindigkeit: 424 Jahre\. An Bord vergehen dabei 17 Generationen\./);
    const download = page.waitForEvent('download');
    await dialog.getByRole('button', { name: 'Herunterladen' }).click();
    expect((await download).suggestedFilename()).toBe('proxima-centauri.png');
    await dialog.getByRole('button', { name: 'Schliessen' }).click();
    await page.getByRole('link', { name: 'Zurück zum Himmel' }).click();
    await expect(page.getByRole('button', { name: 'Reisen mit Lichtgeschwindigkeit', exact: true })).toHaveClass(/explored/);
  });

  test('goes from Andromeda in Modul A to the planner and back to the close-up', async ({ page }) => {
    await page.goto('/module/reise-nach-draussen?stufe=lokale-gruppe');
    await page.getByRole('button', { name: 'Andromeda ansehen' }).click();
    const closeup = page.getByRole('dialog', { name: 'Andromeda' });
    await closeup.getByRole('link', { name: /Wie lange bräuchte ich dorthin\?/ }).click();
    await expect(page).toHaveURL(/\/module\/lichtgeschwindigkeit\?ziel=andromeda&von=lokale-gruppe$/);
    await expect(goal(page)).toHaveText('Andromeda');
    await page.getByRole('link', { name: /Zurück zu Andromeda/ }).click();
    await expect(page).toHaveURL(/\/module\/reise-nach-draussen\?stufe=lokale-gruppe&nah=andromeda$/);
    await expect(page.getByRole('dialog', { name: 'Andromeda' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zurück zur Stufe Lokale Gruppe' })).toBeFocused();
  });

  test('has no axe violations, also with the destination list and the facts open', async ({ page }) => {
    await open(page);
    expect(await axe(page)).toEqual([]);
    await page.getByRole('button', { name: /Ziel ändern/ }).click();
    await expect(page.getByRole('dialog', { name: 'Ziel wählen' })).toBeVisible();
    expect(await axe(page)).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Ziel wählen' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Ziel ändern/ })).toBeFocused();
    await page.getByRole('button', { name: 'Wie genau weiss man das?' }).click();
    await expect(page.getByRole('region', { name: 'Wie genau weiss man das?' })).toBeVisible();
    expect(await axe(page)).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Wie genau weiss man das?' })).toBeFocused();
  });

  test('fits a small phone without horizontal scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await open(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    for (const name of ['Ziel', 'Tempo', 'Ankunft']) {
      await page.getByRole('heading', { level: 2, name, exact: true }).scrollIntoViewIfNeeded();
      await expect(page.getByRole('heading', { level: 2, name, exact: true })).toBeInViewport();
    }
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
    for (const [search, name] of [['Mond', 'Mond'], ['Sirius', 'Sirius'], ['Andro', 'Andromeda'], ['JADES', 'JADES-GS-z14-0']]) {
      await choose(page, search, name);
    }
    expect(foreign).toEqual([]);
    expect(await page.evaluate(() => (window as unknown as { geo: number }).geo)).toBe(0);
  });
});
