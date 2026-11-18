import { expect, test, type Page } from '@playwright/test';

const VIEWPORTS = [
  { name: 'phone 320', width: 320, height: 640, layout: 'phone' },
  { name: 'tablet 834', width: 834, height: 1194, layout: 'tablet' },
  { name: 'landscape 1024', width: 1024, height: 768, layout: 'desktop' },
  { name: 'desktop 1440', width: 1440, height: 900, layout: 'desktop' },
] as const;

const WIDE = VIEWPORTS.filter((v) => v.layout !== 'phone');

async function open(page: Page, width: number, height: number) {
  await page.addInitScript(() => localStorage.setItem('be.moments', '2'));
  await page.setViewportSize({ width, height });
  await page.goto('/');
  await page.locator('button.star').first().waitFor();
}

type Box = { name: string; x: number; y: number; w: number; h: number };

const boxesOf = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll((els) =>
    els.map((e) => {
      const r = e.getBoundingClientRect();
      const name = e.getAttribute('aria-label') ?? e.closest('button')?.getAttribute('aria-label') ?? e.textContent?.trim() ?? '';
      return { name, x: r.x, y: r.y, w: r.width, h: r.height };
    }),
  );

const overlaps = (a: Box, b: Box) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

test.describe('home screen layouts', () => {
  for (const v of VIEWPORTS) {
    test(`${v.name}: uses the ${v.layout} layout without horizontal scroll or cut-off labels`, async ({ page }) => {
      await open(page, v.width, v.height);
      await expect(page.locator('app-home-page')).toHaveAttribute('data-layout', v.layout);

      const scroll = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(scroll).toBe(0);

      const labels = await boxesOf(page, '.label');
      const dots = await boxesOf(page, '.star .dot');
      for (const l of labels) {
        expect(l.x, `${l.name} left edge`).toBeGreaterThanOrEqual(0);
        expect(l.x + l.w, `${l.name} right edge`).toBeLessThanOrEqual(v.width);
      }
      const all = [...labels, ...dots];
      for (let i = 0; i < all.length; i++) {
        for (let j = i + 1; j < all.length; j++) {
          expect(overlaps(all[i], all[j]), `${all[i].name} overlaps ${all[j].name}`).toBe(false);
        }
      }
    });
  }

  for (const v of [...WIDE, { name: 'desktop 1920', width: 1920, height: 1080, layout: 'desktop' as const }]) {
    test(`${v.name}: fits the window without empty scroll space below`, async ({ page }) => {
      await open(page, v.width, v.height);
      const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      expect(scrollHeight).toBe(v.height);
    });
  }

  for (const v of WIDE) {
    test(`${v.name}: the preview covers no star and other stars stay selectable`, async ({ page }) => {
      await open(page, v.width, v.height);
      const stars = page.locator('button.star');
      const names = await stars.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') ?? ''));
      let firstSpot: { x: number; y: number } | null = null;

      for (const name of names) {
        // Every other star can be selected directly while a preview is open.
        await page.getByRole('button', { name, exact: true }).click();
        const preview = page.getByRole('region');
        await expect(preview).toContainText(name);

        const box = await preview.boundingBox();
        expect(box).toBeTruthy();
        if (!box) return;
        firstSpot ??= { x: box.x, y: box.y };
        expect(Math.abs(box.x - firstSpot.x) + Math.abs(box.y - firstSpot.y), 'preview stays in place').toBeLessThan(1);
        expect(box.x + box.width).toBeLessThanOrEqual(v.width);
        expect(box.y + box.height).toBeLessThanOrEqual(v.height);

        // Neither a star's tap area nor any label may lie under the preview.
        const covered = (await boxesOf(page, 'button.star .cell, button.star .label:not([hidden])')).filter((s) =>
          overlaps({ name: 'preview', x: box.x, y: box.y, w: box.width, h: box.height }, s),
        );
        expect(covered.map((s) => s.name)).toEqual([]);
        await expect(page.locator('.connector line')).toHaveCount(1);
      }
    });
  }

  test('desktop: left column with brand, greeting, hint, card and actions; stars to the right', async ({ page }) => {
    await open(page, 1440, 900);
    await expect(page.getByRole('heading', { level: 1, name: 'Die Milchstrasse erleben' })).toBeVisible();
    await expect(page.getByText('Wähle einen Stern am Band, um einzutauchen.')).toBeVisible();

    const card = await page.locator('app-tonight-card').boundingBox();
    const actions = await page.locator('app-home-actions').boundingBox();
    const firstStar = await page.locator('button.star').first().boundingBox();
    const settings = await page.getByRole('link', { name: 'Einstellungen' }).boundingBox();
    expect(card && actions && firstStar && settings).toBeTruthy();
    if (!card || !actions || !firstStar || !settings) return;
    expect(card.x + card.width).toBeLessThan(firstStar.x);
    expect(actions.y).toBeGreaterThan(card.y + card.height - 1);
    expect(actions.y + actions.height).toBeLessThanOrEqual(900);
    expect(settings.x).toBeGreaterThan(1300);
    expect(settings.y).toBeLessThan(100);
  });

  test('tablet: band across the full width, card and actions side by side', async ({ page }) => {
    await open(page, 834, 1194);
    const card = await page.locator('app-tonight-card').boundingBox();
    const actions = await page.locator('app-home-actions').boundingBox();
    const sky = await page.locator('.sky-region').boundingBox();
    expect(card && actions && sky).toBeTruthy();
    if (!card || !actions || !sky) return;
    expect(sky.width).toBe(834);
    expect(Math.abs(card.y - actions.y)).toBeLessThan(2);
    expect(actions.x).toBeGreaterThan(card.x + card.width);
    expect(card.y + card.height).toBeLessThanOrEqual(1194);
    await expect(page.locator('app-home-actions')).toHaveClass(/stacked/);
  });
});
