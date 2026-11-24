import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const MODULE_URL = '/module/galaktisches-jahr';
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const time = (page: Page) => page.locator('.time-row .big');
const slider = (page: Page) =>
  page.getByRole('slider', { name: 'Zieh die Sonne zurück auf ihrer Bahn' });
const live = (page: Page) => page.locator('[aria-live="polite"].sr-only');
const part = (page: Page, name: string) => page.getByRole('region', { name, exact: true });

async function open(page: Page) {
  await page.goto(MODULE_URL);
  await expect(page.getByRole('heading', { level: 1, name: 'Das galaktische Jahr' })).toBeFocused();
}

async function axe(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return result.violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  );
}

test.describe('Modul C: Das galaktische Jahr', () => {
  test.setTimeout(90_000);

  test('shows one round and turning back on one page', async ({ page }) => {
    await open(page);
    await expect(page).toHaveTitle('Das galaktische Jahr · Die Milchstrasse erleben');
    await expect(page.getByRole('heading', { level: 2 })).toHaveText([
      'Eine Runde',
      'Zurückdrehen',
    ]);
    const runde = part(page, 'Eine Runde');
    await expect(runde.getByText('230 Millionen Jahre', { exact: true })).toBeVisible();
    await expect(
      runde.getByText(/Weg unseres ganzen Sonnensystems einmal um das Zentrum der Milchstrasse/),
    ).toBeVisible();
    await expect(runde.getByText(/rund 230 Kilometern pro Sekunde/)).toBeVisible();
    await expect(page.getByText('Seit du hier bist')).toHaveCount(0);
    await expect(time(page)).toHaveText('heute');
    await expect(page.getByText('Orion-Arm')).toHaveCount(0);
  });

  test('turns the Sun back one round to Pangaea and steps with the keys', async ({ page }) => {
    await open(page);
    await slider(page).focus();
    await page.keyboard.press('ArrowRight');
    await expect(time(page)).toHaveText('vor 6 Mio. Jahren');
    await expect(page.locator('.event')).toHaveText('Die ersten Vormenschen');
    await page.keyboard.press('PageUp');
    await expect(time(page)).toHaveText('vor 66 Mio. Jahren');
    await page.keyboard.press('PageUp');
    await page.keyboard.press('PageUp');
    await expect(time(page)).toHaveText('vor 230 Mio. Jahren');
    await expect(slider(page)).toHaveAttribute('aria-valuetext', 'vor 230 Millionen Jahren');
    await expect(
      page.getByText(
        '„Als die Sonne das letzte Mal an dieser Stelle war, gingen die ersten Dinosaurier über die Erde.“',
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        'Die Erde damals: Ein einziger grosser Kontinent, Pangäa. Die ersten Dinosaurier.',
      ),
    ).toBeVisible();
    await expect(
      page.getByRole('img', {
        name: /^Die Erde vor 230 Millionen Jahren: Ein einziger grosser Kontinent, Pangäa/,
      }),
    ).toBeVisible();
    await expect(live(page)).toHaveText(/^vor 230 Millionen Jahren\. Als die Sonne/);
    await expect(page.locator('.ring')).toHaveCount(19);
    await expect(page.getByText('Bis dahin: 19 Runden um das Zentrum')).toBeVisible();
    await page.keyboard.press('Home');
    await expect(time(page)).toHaveText('heute');
    await expect(page.locator('.ring')).toHaveCount(20);
  });

  test('turns the Sun back by dragging it in the picture', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const handle = await page.locator('.handle').boundingBox();
    const picture = await page.locator('app-galaxy-view .picture').boundingBox();
    if (!handle || !picture) {
      throw new Error('no picture');
    }
    await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
    await page.mouse.down();
    // Around the centre counter-clockwise: right of the centre, then above it.
    await page.mouse.move(picture.x + picture.width * 0.75, picture.y + picture.height * 0.5, {
      steps: 8,
    });
    await page.mouse.move(picture.x + picture.width * 0.5, picture.y + picture.height * 0.25, {
      steps: 8,
    });
    await page.mouse.up();
    await expect(time(page)).toHaveText('vor 115 Mio. Jahren');
    await expect(
      page.getByText('„Auf der anderen Seite der Galaxie: Die Erde beginnt zu blühen.“'),
    ).toBeVisible();
  });

  test('offers no buttons under the slider', async ({ page }) => {
    await open(page);
    for (const name of ['Wo bleiben wir Menschen?', 'Zurück nach heute', 'Bild teilen']) {
      await expect(page.getByRole('button', { name })).toHaveCount(0);
    }
    await expect(page.getByRole('link', { name: 'Zur Milchstrasse in Modul A' })).toHaveCount(0);
    await slider(page).focus();
    await page.keyboard.press('End');
    await expect(page.getByRole('button', { name: 'Zurück nach heute' })).toHaveCount(0);
  });

  test('opens from the branch in Modul A', async ({ page }) => {
    await page.goto('/module/reise-nach-draussen?stufe=milchstrasse');
    await page.getByRole('button', { name: 'Wie genau weiss man das?' }).click();
    await page.getByRole('link', { name: /Wie lange dauert eine Runde um die Galaxie\?/ }).click();
    await expect(page).toHaveURL(/\/module\/galaktisches-jahr$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Das galaktische Jahr' }),
    ).toBeFocused();
  });

  test('marks the module explored after one round back', async ({ page }) => {
    await open(page);
    await slider(page).focus();
    await page.keyboard.press('PageUp');
    await page.keyboard.press('PageUp');
    await page.keyboard.press('PageUp');
    await expect(time(page)).toHaveText('vor 230 Mio. Jahren');
    await page.getByRole('link', { name: 'Zurück zum Himmel' }).click();
    await expect(
      page.getByRole('button', { name: 'Das galaktische Jahr', exact: true }),
    ).toHaveClass(/explored/);
  });

  test('has no axe violations, also with the facts open', async ({ page }) => {
    await open(page);
    expect(await axe(page)).toEqual([]);
    const facts = part(page, 'Eine Runde').getByRole('button', {
      name: 'Wie genau weiss man das?',
    });
    await facts.click();
    const sheet = page.getByRole('region', { name: 'Wie genau weiss man das?' });
    await expect(sheet).toContainText('210 bis 250 Millionen Jahre');
    await expect(
      sheet.getByRole('link', { name: /Was hält die Sonne auf ihrer Bahn\?/ }),
    ).toBeVisible();
    expect(await axe(page)).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(facts).toBeFocused();
    await slider(page).focus();
    await page.keyboard.press('End');
    await expect(time(page)).toHaveText('vor 4,6 Mrd. Jahren');
    expect(await axe(page)).toEqual([]);
  });

  test('shows one round, then the picture, then turning back on phones and tablets', async ({
    page,
  }, info) => {
    test.skip(info.project.name === 'desktop', 'phones and tablets only');
    await open(page);
    const top = async (locator: ReturnType<Page['locator']>) =>
      (await locator.boundingBox())?.y ?? 0;
    const runde = await top(part(page, 'Eine Runde'));
    const picture = await top(page.locator('app-galaxy-view'));
    const zurueck = await top(part(page, 'Zurückdrehen'));
    expect(runde).toBeLessThan(picture);
    expect(picture).toBeLessThan(zurueck);
  });

  test('fits a small phone and keeps the picture in view while turning back', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await open(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      320,
    );
    await slider(page).focus();
    await page.keyboard.press('ArrowRight');
    for (const target of [time(page), slider(page)]) {
      await target.scrollIntoViewIfNeeded();
      await expect(target).toBeInViewport({ ratio: 0.98 });
      await expect(page.locator('app-galaxy-view')).toBeInViewport({ ratio: 0.98 });
      await expect(page.locator('app-earth-globe')).toBeInViewport({ ratio: 0.98 });
    }
  });

  test('puts the parts on the left and keeps the galaxy on the right on wide screens', async ({
    page,
  }, info) => {
    test.skip(info.project.name !== 'desktop', 'desktop layout only');
    await open(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      1440,
    );
    const picture = await page.locator('app-galaxy-view').boundingBox();
    for (const name of ['Eine Runde', 'Zurückdrehen']) {
      const text = await part(page, name).boundingBox();
      expect(text && picture && text.x + text.width <= picture.x).toBe(true);
    }
    await slider(page).scrollIntoViewIfNeeded();
    await expect(page.locator('app-galaxy-view')).toBeInViewport({ ratio: 0.98 });
  });

  test('passes the in-between events and blends the Earth while dragging the slider', async ({
    page,
  }) => {
    await open(page);
    const box = await slider(page).boundingBox();
    if (!box) {
      throw new Error('no slider');
    }
    await slider(page).scrollIntoViewIfNeeded();
    const at = async (fraction: number) => {
      const b = await slider(page).boundingBox();
      return {
        x: (b?.x ?? 0) + 8 + ((b?.width ?? 0) - 16) * fraction,
        y: (b?.y ?? 0) + (b?.height ?? 0) / 2,
      };
    };
    const start = await at(0);
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    // 1,5 rounds back (the first 5 rounds fill 70 % of the slider): between the coal forests and the first fish on land.
    const middle = await at((1.5 / 5) * 0.7);
    await page.mouse.move(middle.x, middle.y, { steps: 10 });
    await expect(page.locator('app-earth-globe path.land')).toHaveCount(2);
    // While dragging, exactly one dot marks where the Sun will snap to.
    await expect(page.locator('.ruler .dot.now')).toHaveCount(1);
    await expect(page.locator('.event')).not.toHaveText('Heute');
    await page.mouse.up();
    await expect(page.locator('app-earth-globe path.land')).toHaveCount(1);
  });

  for (const width of [320, 390, 430, 834, 1024, 1440]) {
    test(`keeps the slider in its place while it is used and hides no text at ${width} px`, async ({
      page,
    }, info) => {
      test.skip(info.project.name !== 'desktop', 'sets its own width; one project is enough');
      await page.setViewportSize({ width, height: 800 });
      await open(page);
      await slider(page).focus();
      const top = () =>
        slider(page).evaluate((el) => Math.round(el.getBoundingClientRect().top + window.scrollY));
      const start = await top();
      const overflowing = () =>
        page
          .locator('.station p')
          .evaluateAll((els) =>
            els
              .filter(
                (el) =>
                  el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1,
              )
              .map((el) => el.textContent),
          );
      // Every one of the 24 stations, then back to today: the slider never moves, and every text fits its room.
      for (let i = 0; i < 24; i++) {
        expect(await top()).toBe(start);
        expect(await overflowing()).toEqual([]);
        await page.keyboard.press('ArrowRight');
      }
      await page.keyboard.press('Home');
      expect(await top()).toBe(start);
      // The label is only for assistive technology: it takes no visible room.
      const label = await page.getByText('Zieh die Sonne zurück auf ihrer Bahn').boundingBox();
      expect(label?.width).toBeLessThanOrEqual(1);
      await expect(page.getByText(/^Leben:/)).toHaveCount(0);
    });
  }

  test('jumps to stations with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await slider(page).focus();
    await page.keyboard.press('End');
    await expect(time(page)).toHaveText('vor 4,6 Mrd. Jahren');
  });

  test('loads nothing from other servers and never asks for the location', async ({ page }) => {
    const foreign: string[] = [];
    page.on('request', (r) => {
      const url = new URL(r.url());
      if (
        !['localhost', '127.0.0.1'].includes(url.hostname) &&
        !url.protocol.startsWith('data') &&
        !url.protocol.startsWith('blob')
      ) {
        foreign.push(r.url());
      }
    });
    await page.addInitScript(() => {
      (window as unknown as { geo: number }).geo = 0;
      navigator.geolocation.getCurrentPosition = () => (window as unknown as { geo: number }).geo++;
    });
    await open(page);
    await slider(page).focus();
    await page.keyboard.press('End');
    await expect(time(page)).toHaveText('vor 4,6 Mrd. Jahren');
    expect(foreign).toEqual([]);
    expect(await page.evaluate(() => (window as unknown as { geo: number }).geo)).toBe(0);
  });
});
