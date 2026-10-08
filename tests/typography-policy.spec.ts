import { test, expect } from '@playwright/test';

test('Outfit typography uses the decided body, label and heading weights', async ({
  page,
}) => {
  await page.goto('./');
  const weights = await page.evaluate(() =>
    [
      document.body,
      document.querySelector('h1')!,
      document.querySelector('.button')!,
    ].map((el) => getComputedStyle(el).fontWeight),
  );
  expect(weights).toEqual(['400', '600', '500']);
  expect(
    await page
      .locator('body')
      .evaluate(
        (el) =>
          parseFloat(getComputedStyle(el).lineHeight) /
          parseFloat(getComputedStyle(el).fontSize),
      ),
  ).toBe(1.5);
});

test('long German control labels survive 200 percent text and WCAG spacing', async ({
  page,
}) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Adım ara', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Adım ara', exact: true });
  await dialog.locator('label').evaluate((el) => {
    el.setAttribute('lang', 'de');
    el.textContent =
      'Datenschutzeinstellungen Datenschutzeinstellungen – Unternehmensinformationen';
  });
  await page.addStyleTag({
    content:
      'html { font-size: 200%; } body * { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }',
  });
  await expect(dialog.getByRole('combobox')).toBeVisible();
  const label = await dialog.locator('label').boundingBox();
  const bounds = await dialog.boundingBox();
  expect(label!.x + label!.width).toBeLessThanOrEqual(
    bounds!.x + bounds!.width,
  );
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await dialog.getByRole('button', { name: 'Kapat' }).click();
});

test('blocked fonts preserve locally usable navigation and Turkish German text', async ({
  page,
}) => {
  let blockedFontRequests = 0;
  await page.route('**/*.woff2', (route) => {
    blockedFontRequests += 1;
    return route.abort();
  });
  await page.goto('./');
  await expect.poll(() => blockedFontRequests).toBeGreaterThan(0);
  const trigger = page.getByRole('button', { name: 'Adım ara', exact: true });
  await trigger.click();
  const input = page.getByRole('combobox');
  await input.fill('İ ı Ğ Ş Ä Ö Ü ß ẞ É Œ œ');
  await expect(input).toHaveValue('İ ı Ğ Ş Ä Ö Ü ß ẞ É Œ œ');
  await input.press('Escape');
  await expect(trigger).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
