import { expect, test } from '@playwright/test';

test('annotated evidence opens a step page retaining actions and original link', async ({
  page,
}) => {
  await page.goto('./');
  const href = await page.locator('.image-link').first().getAttribute('href');
  expect(href).toContain('/steps/');
  await page.goto(href!);
  await expect(
    page.getByRole('heading', { name: 'Yapılacak işlem' }),
  ).toBeVisible();
  await expect(page.locator('.annotations')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'İşaretsiz özgün ekran görüntüsünü aç' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('critical reading journey works at every viewport without shrinking text', async ({
  page,
}) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Rehber bölümleri' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const smallText = await page
    .locator('body *')
    .evaluateAll((elements) =>
      elements
        .filter(
          (el) =>
            el.textContent?.trim() &&
            el.getClientRects().length &&
            parseFloat(getComputedStyle(el).fontSize) <
              parseFloat(getComputedStyle(document.documentElement).fontSize),
        )
        .map((el) => el.tagName),
    );
  expect(smallText).toEqual([]);
});

test('reading needs no JavaScript and optional checklist is not fetched before activation', async ({
  browser,
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('./');
  await expect(
    page.getByRole('button', { name: 'Kendi kontrol listemi aç' }),
  ).toBeVisible();
  expect(
    requests.some(
      (url) => url.includes('Checklist') || url.includes('enhancement'),
    ),
  ).toBe(false);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const baseline = await context.newPage();
  await baseline.goto('http://127.0.0.1:47321/pressguide/');
  await expect(baseline.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(baseline.locator('#adimlar')).toBeVisible();
  await context.close();
});

test('checklist state and focus survive landscape and close', async ({
  page,
}) => {
  await page.goto('./');
  const trigger = page.getByRole('button', {
    name: 'Kendi kontrol listemi aç',
  });
  await trigger.click();
  await expect(
    page.getByRole('dialog', { name: 'Kişisel kontrol listesi' }),
  ).toBeVisible();
  const checkbox = page.getByRole('checkbox').first();
  if (await checkbox.count()) {
    await checkbox.check();
    await page.setViewportSize({ width: 568, height: 320 });
    await expect(checkbox).toBeChecked();
  }
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('keyboard has one visible focus indicator; pointer does not frame sections', async ({
  page,
}) => {
  await page.goto('./');
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toBeVisible();
  expect(
    await focused.evaluate((el) => getComputedStyle(el).outlineStyle),
  ).toBe('solid');
  await page.locator('h1').click();
  expect(
    await page
      .locator('main')
      .evaluate((el) => getComputedStyle(el).outlineStyle),
  ).toBe('none');
});
