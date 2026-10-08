import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
test('eight primary instructions retain all other evidence in a closed, usable disclosure', async ({
  page,
}, testInfo) => {
  const guide = JSON.parse(readFileSync('src/data/guide.json', 'utf8'));
  await page.goto('./');
  await expect(page.locator('#adimlar > article')).toHaveCount(8);
  await testInfo.attach('compact-home', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
  await expect(page.locator('.history')).not.toHaveAttribute('open', '');
  await page.locator('.history > summary').click();
  await expect(page.locator('.history > details')).toHaveCount(
    guide.steps.length - 8,
  );
  const remaining = page.locator('.history > details').first();
  await remaining.locator('summary').click();
  await expect(remaining.locator('ol')).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const steps = JSON.parse(
    (await page.locator('#checklist-data').textContent()) || '[]',
  );
  expect(steps).toHaveLength(8);
});

test('historic deep links disclose preserved evidence; malformed fragments keep checklist usable', async ({
  page,
}) => {
  await page.goto('./#live-site-desk');
  await expect(page.locator('.history')).toHaveAttribute('open', '');
  await expect(page.locator('#live-site-desk')).toHaveAttribute('open', '');
  await expect(page.locator('#live-site-desk ol')).toBeVisible();
  await page.goto('./#%invalid');
  await page.getByRole('button', { name: 'Kendi kontrol listemi aç' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Kişisel kontrol listesi' }),
  ).toBeVisible();
});
