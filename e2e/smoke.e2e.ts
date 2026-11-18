import { expect, test } from '@playwright/test';

test('the app root loads', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.ok()).toBe(true);
  await expect(page.locator('app-root')).toBeAttached();
});
