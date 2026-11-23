import { expect, test } from '@playwright/test';

const VIEWPORTS = [
  { name: 'phone 320', width: 320, height: 640 },
  { name: 'phone 390', width: 390, height: 844 },
  { name: 'tablet 834', width: 834, height: 1194 },
  { name: 'landscape 1024', width: 1024, height: 768 },
  { name: 'desktop 1440', width: 1440, height: 900 },
];

test.describe('clickable module labels', () => {
  for (const v of VIEWPORTS) {
    test(`${v.name}: clicking each label selects exactly its own module`, async ({ page }) => {
      await page.setViewportSize({ width: v.width, height: v.height });
      await page.goto('/');
      const stars = page.locator('button.star');
      await stars.first().waitFor();
      const modules = await stars.evaluateAll((els) =>
        els.map((e) => ({ id: e.getAttribute('data-module') ?? '', title: e.getAttribute('aria-label') ?? '' })),
      );

      for (const { id, title } of modules) {
        await page.locator(`button.star[data-module="${id}"] .label`).click();
        await expect(page.getByRole('region'), `label of ${title}`).toContainText(title);
        await expect(page.locator('[aria-expanded="true"]')).toHaveAttribute('data-module', id);
        await page.keyboard.press('Escape');
        await expect(page.getByRole('region')).toHaveCount(0);
      }
    });
  }

  test('activating a label again closes the preview (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const label = page.locator('button.star[data-module="D"] .label');
    await label.click();
    await expect(page.getByRole('region')).toContainText('Sterne zählen');
    await label.click();
    await expect(page.getByRole('region')).toHaveCount(0);
  });

  test('a label shows that it is clickable', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const label = page.locator('button.star[data-module="C"] .label');
    expect(await label.evaluate((e) => getComputedStyle(e).cursor)).toBe('pointer');
    const before = await label.evaluate((e) => getComputedStyle(e).color);
    await label.hover();
    await expect.poll(() => label.evaluate((e) => getComputedStyle(e).color)).not.toBe(before);
  });

  test('one keyboard stop per module, with the focus ring around star and label', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.locator('button.star').first().waitFor();
    await page.keyboard.press('Tab'); // settings
    for (const id of ['A', 'B', 'D', 'C', 'F', 'E']) {
      await page.keyboard.press('Tab');
      const focused = page.locator(`button.star[data-module="${id}"]`);
      await expect(focused).toBeFocused();
      const button = await focused.boundingBox();
      const label = await focused.locator('.label').boundingBox();
      const dot = await focused.locator('.dot').boundingBox();
      expect(button && label && dot).toBeTruthy();
      if (!button || !label || !dot) return;
      for (const inner of [label, dot]) {
        expect(inner.x).toBeGreaterThanOrEqual(button.x - 0.5);
        expect(inner.x + inner.width).toBeLessThanOrEqual(button.x + button.width + 0.5);
      }
    }
  });
});
