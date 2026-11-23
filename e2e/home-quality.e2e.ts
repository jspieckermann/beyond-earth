import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function axe(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

test.describe('home screen quality', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('be.moments', '2'));
  });

  test('has no axe violations, with and without an open preview', async ({ page }) => {
    await page.goto('/');
    await page.locator('button.star').first().waitFor();
    expect(await axe(page)).toEqual([]);

    await page.getByRole('button', { name: 'Sterne zählen' }).click();
    await expect(page.getByRole('region')).toBeVisible();
    expect(await axe(page)).toEqual([]);
  });

  test('placeholder pages have no axe violations', async ({ page }) => {
    await page.goto('/module/sterne-zaehlen');
    await page.getByRole('heading', { level: 1 }).waitFor();
    expect(await axe(page)).toEqual([]);
  });

  test('keyboard order follows settings, stars, card and actions', async ({ page }) => {
    await page.goto('/');
    await page.locator('button.star').first().waitFor();
    const order: string[] = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      order.push(
        await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          return el?.getAttribute('aria-label') ?? el?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 25).trim() ?? '';
        }),
      );
    }
    expect(order).toEqual([
      'Einstellungen',
      'Die Reise nach draussen',
      'Reisen mit Lichtgeschwindigkeit',
      'Sterne zählen',
      'Licht als Zeitmaschine',
      'Das Unsichtbare',
      'Das galaktische Jahr',
      'Heute Nacht Wo stehst du',
      'Die Reise',
      'Meine Sterne 2 gespeicher',
    ]);
  });

  test('shows a visible focus indicator', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const outline = await page.evaluate(() => getComputedStyle(document.activeElement as Element).outlineStyle);
    expect(outline).not.toBe('none');
  });

  test('controls have touch targets of at least 44 px', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sterne zählen' }).click();
    const small = await page.locator('main a, main button').evaluateAll((els) =>
      els
        .map((e) => ({ name: e.getAttribute('aria-label') ?? e.textContent?.trim(), r: e.getBoundingClientRect() }))
        .filter(({ r }) => r.width < 44 || r.height < 44)
        .map(({ name }) => name),
    );
    expect(small).toEqual([]);
  });

  test('at 320 × 640: no horizontal scroll, labels inside and not overlapping', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');
    await page.locator('button.star').first().waitFor();
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(scroll).toBe(0);

    const boxes = await page.evaluate(() =>
      [...document.querySelectorAll('.label, .star .dot')].map((e) => {
        const r = e.getBoundingClientRect();
        return { name: e.textContent?.trim() || 'dot', x: r.x, y: r.y, w: r.width, h: r.height };
      }),
    );
    for (const b of boxes) {
      expect(b.x, `${b.name} left edge`).toBeGreaterThanOrEqual(0);
      expect(b.x + b.w, `${b.name} right edge`).toBeLessThanOrEqual(320);
    }
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const [a, b] = [boxes[i], boxes[j]];
        const overlap = a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
        expect(overlap, `${a.name} overlaps ${b.name}`).toBe(false);
      }
    }
  });

  test('the sky does not animate with reduced motion', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const animation = await page.locator('app-sky-backdrop .drift').evaluate((e) => getComputedStyle(e).animationName);
    expect(animation).toBe('none');
  });

  test('the sky drifts slowly otherwise', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const animation = await page.locator('app-sky-backdrop .drift').evaluate((e) => getComputedStyle(e).animationName);
    expect(animation).not.toBe('none');
  });

  test('loads nothing from third-party servers', async ({ page, baseURL }) => {
    const foreign: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (!url.startsWith('data:') && !url.startsWith(baseURL ?? '')) {
        foreign.push(url);
      }
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(foreign).toEqual([]);
  });
});
