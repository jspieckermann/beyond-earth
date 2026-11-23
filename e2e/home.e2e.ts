import { expect, test, type Page } from '@playwright/test';

const star = (page: Page, title: string) => page.getByRole('button', { name: title, exact: true });
const preview = (page: Page) => page.getByRole('region');

async function seed(page: Page, data: { explored?: string[]; moments?: number }) {
  await page.addInitScript((d) => {
    if (d.explored) localStorage.setItem('be.explored', JSON.stringify(d.explored));
    if (d.moments !== undefined) localStorage.setItem('be.moments', String(d.moments));
  }, data);
}

test.describe('home screen', () => {
  test('is the German start page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    await expect(page).toHaveTitle('Die Milchstrasse erleben');
    await expect(page.getByRole('heading', { level: 1, name: 'Die Milchstrasse erleben' })).toBeAttached();
    await expect(page.getByText('„Heute Nacht zieht das Band über dich hinweg.“')).toBeVisible();
  });

  test('shows the seven module stars in journey order', async ({ page }) => {
    await page.goto('/');
    const names = await page.locator('button.star').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
    expect(names).toEqual([
      'Die Reise nach draussen',
      'Reisen mit Lichtgeschwindigkeit',
      'Die Sandkorn-Welt',
      'Sterne zählen',
      'Licht als Zeitmaschine',
      'Das Unsichtbare',
      'Das galaktische Jahr',
    ]);
    await expect(page.getByText('Sandkorn-Welt', { exact: true })).toBeVisible();
  });

  test('shows explored modules brighter, without scores', async ({ page }) => {
    await seed(page, { explored: ['B'] });
    await page.goto('/');
    await expect(star(page, 'Die Sandkorn-Welt')).toHaveClass(/explored/);
    await expect(star(page, 'Sterne zählen')).not.toHaveClass(/explored/);
    await expect(page.locator('main')).not.toContainText('%');
  });

  test('selects, switches and closes the preview', async ({ page }) => {
    await page.goto('/');
    await star(page, 'Die Sandkorn-Welt').click();
    await expect(preview(page)).toContainText('Die Sandkorn-Welt');
    await expect(preview(page)).toContainText('Noch nicht vertieft');
    await expect(star(page, 'Die Sandkorn-Welt')).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await star(page, 'Das galaktische Jahr').click();
    await expect(preview(page)).toContainText('Das galaktische Jahr');
    // A star that stays visible next to this preview can be tapped directly to switch.
    await star(page, 'Die Reise nach draussen').click();
    await expect(preview(page)).toContainText('Die Reise nach draussen');
    await expect(page.locator('[aria-expanded="true"]')).toHaveCount(1);

    await star(page, 'Die Reise nach draussen').click();
    await expect(preview(page)).toHaveCount(0);

    await star(page, 'Das Unsichtbare').click();
    await page.locator('.greeting').click();
    await expect(preview(page)).toHaveCount(0);
  });

  test('closes the preview with Escape and returns focus to the star', async ({ page }) => {
    await page.goto('/');
    await star(page, 'Licht als Zeitmaschine').focus();
    await page.keyboard.press('Enter');
    await expect(preview(page)).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(preview(page).getByRole('link', { name: 'Eintauchen' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(preview(page)).toHaveCount(0);
    await expect(star(page, 'Licht als Zeitmaschine')).toBeFocused();
  });

  test('enters a module placeholder and comes back', async ({ page }) => {
    await page.goto('/');
    await star(page, 'Das Unsichtbare').click();
    await preview(page).getByRole('link', { name: 'Eintauchen' }).click();
    await expect(page).toHaveURL(/\/module\/das-unsichtbare$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Das Unsichtbare');
    await expect(page.getByText('Bald verfügbar')).toBeVisible();
    await page.getByRole('link', { name: 'Zurück zum Himmel' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('button.star')).toHaveCount(7);
  });

  test('opens the Modul A experience instead of a placeholder', async ({ page }) => {
    await page.goto('/');
    await star(page, 'Die Reise nach draussen').click();
    await preview(page).getByRole('link', { name: 'Eintauchen' }).click();
    await expect(page).toHaveURL(/\/module\/reise-nach-draussen$/);
    await expect(page).toHaveTitle('Die Reise nach draussen · Die Milchstrasse erleben');
    await expect(page.getByText('Bald verfügbar')).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 2, name: 'Die Erde' })).toBeVisible();
  });

  test('keeps the preview on screen and off its star at the top-right edge', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');
    await star(page, 'Das galaktische Jahr').click();
    const box = await preview(page).boundingBox();
    const dot = await star(page, 'Das galaktische Jahr').locator('.dot').boundingBox();
    expect(box && dot).toBeTruthy();
    if (!box || !dot) return;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(320);
    const overlaps = box.y < dot.y + dot.height && box.y + box.height > dot.y && box.x < dot.x + dot.width && box.x + box.width > dot.x;
    expect(overlaps).toBe(false);
  });

  for (const [name, url, heading] of [
    ['Einstellungen', /\/einstellungen$/, 'Einstellungen'],
    ['Die Reise', /\/reise$/, 'Die Reise'],
  ] as const) {
    test(`"${name}" leads to its destination`, async ({ page }) => {
      await page.goto('/');
      await page.getByRole('link', { name }).click();
      await expect(page).toHaveURL(url);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    });
  }

  test('the Heute-Nacht card invites to choose a place and opens Heute Nacht', async ({ page, context }) => {
    await context.grantPermissions([]);
    await page.addInitScript(() => {
      (window as unknown as { geoCalls: number }).geoCalls = 0;
      const count = () => (window as unknown as { geoCalls: number }).geoCalls++;
      navigator.geolocation.getCurrentPosition = count;
      navigator.geolocation.watchPosition = () => count();
    });
    await page.goto('/');
    const card = page.getByRole('link', { name: /Wo stehst du heute Nacht\?/ });
    await expect(card).toContainText('Ort wählen');
    expect(await page.evaluate(() => (window as unknown as { geoCalls: number }).geoCalls)).toBe(0);
    await card.click();
    await expect(page).toHaveURL(/\/heute-nacht$/);
  });

  test('"Meine Sterne" appears only with saved moments', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Meine Sterne/ })).toHaveCount(0);

    await seed(page, { moments: 2 });
    await page.reload();
    const moments = page.getByRole('link', { name: /Meine Sterne/ });
    await expect(moments).toContainText('2');
    await moments.click();
    await expect(page).toHaveURL(/\/meine-sterne$/);
  });

  test('is quiet: no audio or video', async ({ page }) => {
    await page.goto('/');
    await star(page, 'Die Sandkorn-Welt').click();
    await expect(page.locator('audio, video')).toHaveCount(0);
  });
});
