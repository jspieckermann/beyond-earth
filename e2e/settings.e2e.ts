import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test.describe('Einstellungen', () => {
  test.setTimeout(90_000);

  for (const [name, url] of [
    ['the home screen', '/'],
    ['Modul A', '/module/reise-nach-draussen'],
    ['Modul B', '/module/lichtgeschwindigkeit'],
    ['Modul C', '/module/galaktisches-jahr'],
    ['Heute Nacht', '/heute-nacht'],
    ['a placeholder', '/meine-sterne'],
  ]) {
    test(`are reachable from ${name}, with the gear at the home screen's place`, async ({ page }) => {
      await page.goto('/');
      const home = await page.getByRole('link', { name: 'Einstellungen', exact: true }).boundingBox();
      await page.goto(url);
      const gear = page.getByRole('link', { name: 'Einstellungen', exact: true });
      await expect(gear).toBeVisible();
      // The gear sits exactly where it is on the home screen.
      const box = await gear.boundingBox();
      expect(Math.abs(box!.x - home!.x)).toBeLessThan(1);
      expect(Math.abs(box!.y - home!.y)).toBeLessThan(1);
      await gear.click();
      await expect(page).toHaveURL(/\/einstellungen$/);
      await expect(page.getByRole('heading', { level: 1, name: 'Einstellungen' })).toBeFocused();
      await page.getByRole('link', { name: 'Zurück', exact: true }).click();
      await expect(page).toHaveURL(new RegExp(url === '/' ? '/$' : `${url}$`));
    });
  }

  test('holds night mode and the vibration, and Modul A has no own settings panel', async ({ page }) => {
    await page.goto('/module/reise-nach-draussen');
    await expect(page.getByRole('button', { name: 'Weitere Einstellungen' })).toHaveCount(0);
    await page.getByRole('link', { name: 'Einstellungen', exact: true }).click();
    const vibration = page.getByRole('switch', { name: 'Vibration' });
    await expect(page.getByRole('switch', { name: 'Nachtmodus' })).toBeVisible();
    await expect(vibration).toHaveAttribute('aria-checked', 'true');
    const scan = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(scan.violations.map((v) => v.id)).toEqual([]);
    await vibration.click();
    await expect(vibration).toHaveAttribute('aria-checked', 'false');
    expect(JSON.parse((await page.evaluate(() => localStorage.getItem('be.journey'))) ?? '{}')).toEqual({ vibration: false });
    await page.reload();
    await expect(page.getByRole('switch', { name: 'Vibration' })).toHaveAttribute('aria-checked', 'false');
  });

  test('closing returns to the page they were opened from, also after going through several pages', async ({ page }) => {
    await page.goto('/module/galaktisches-jahr');
    await page.getByRole('link', { name: 'Zurück zum Himmel' }).click();
    await page.goto('/heute-nacht');
    await page.getByRole('link', { name: 'Einstellungen', exact: true }).click();
    await page.getByRole('switch', { name: 'Vibration' }).click();
    await page.getByRole('link', { name: 'Zurück', exact: true }).click();
    await expect(page).toHaveURL(/\/heute-nacht$/);
    await page.getByRole('link', { name: 'Einstellungen', exact: true }).click();
    await expect(page.getByRole('link', { name: 'Zurück', exact: true })).toHaveAttribute('href', '/heute-nacht');
  });

  test('opened directly, „Zurück“ leads to the sky', async ({ page }) => {
    await page.goto('/einstellungen');
    await page.getByRole('link', { name: 'Zurück', exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
