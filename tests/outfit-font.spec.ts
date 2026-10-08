import { expect, test } from '@playwright/test';
test('Outfit is first, actually loaded locally, and shared by headings and checklist', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.goto('./');
  await page.evaluate(() => document.fonts.ready);
  for (const selector of ['body', 'h1'])
    expect(
      await page
        .locator(selector)
        .evaluate((el) =>
          getComputedStyle(el)
            .fontFamily.split(',')[0]
            .replace(/["']/g, '')
            .trim(),
        ),
    ).toBe('Outfit');
  expect(
    await page.evaluate(() =>
      document.fonts.check('400 16px Outfit', 'Eğitim ığüşöç'),
    ),
  ).toBe(true);
  expect(requests.filter((u) => u.endsWith('.woff2')).length).toBeGreaterThan(
    0,
  );
  expect(
    requests.every((u) => new URL(u).origin === new URL(page.url()).origin),
  ).toBe(true);
  await page.getByRole('button', { name: 'Kendi kontrol listemi aç' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Kişisel kontrol listesi' }),
  ).toBeVisible();
  expect(
    await page
      .getByRole('dialog')
      .evaluate((el) =>
        getComputedStyle(el)
          .fontFamily.split(',')[0]
          .replace(/["']/g, '')
          .trim(),
      ),
  ).toBe('Outfit');
});
