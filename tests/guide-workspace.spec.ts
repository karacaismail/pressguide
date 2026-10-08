import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const guide = JSON.parse(readFileSync('src/data/guide.json', 'utf8'));
const ids = [
  'team',
  'server',
  'apps',
  'source-form',
  'candidate',
  'schedule',
  'site',
  'hata-tanisi',
];
const steps = ids.map((id) =>
  guide.steps.find((step: { id: string }) => step.id === id),
);

test('search supports shortcut, arrows, selection, Escape and focus return', async ({
  page,
}) => {
  await page.goto('./');
  const trigger = page.getByRole('button', { name: 'Adım ara', exact: true });
  await trigger.focus();
  await page.keyboard.press('ControlOrMeta+k');
  const dialog = page.getByRole('dialog', { name: 'Adım ara', exact: true });
  const input = dialog.getByRole('combobox', { name: 'Adım adı veya içerik' });
  await expect(input).toBeFocused();
  await expect(dialog.getByRole('option')).toHaveCount(8);
  await input.press('ArrowDown');
  await expect(dialog.getByRole('option').nth(1)).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await input.press('Enter');
  await expect(dialog).not.toBeVisible();
  await expect(page).toHaveURL(new RegExp(`#${steps[1].id}$`));
  await expect(page.locator(`#${steps[1].id} h2`)).toBeFocused();
  await trigger.click();
  await input.fill('zzzz-no-step');
  await expect(dialog.getByText('Eşleşen adım yok.')).toBeVisible();
  await input.press('Escape');
  await expect(trigger).toBeFocused();
});

test('one inspector retains truthful step content and selected hash context', async ({
  page,
}) => {
  await page.goto(`./#${steps[4].id}`);
  const trigger = page.getByRole('button', {
    name: 'Adım bağlamı',
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole('dialog', {
    name: 'Adım bağlamı',
    exact: true,
  });
  await expect(
    dialog.getByRole('heading', { name: steps[4].title, exact: true }),
  ).toBeVisible();
  for (const action of steps[4].actions)
    await expect(dialog.getByText(action, { exact: true })).toBeVisible();
  await expect(
    dialog.getByText(steps[4].verification, { exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByText(
      {
        historical: 'Tarihsel ekran kaydı',
        live: 'Canlı oturumda doğrulandı',
        pending: 'Doğrulama bekliyor',
      }[steps[4].status as 'historical' | 'live' | 'pending'],
      { exact: true },
    ),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(page.locator('#guide-workspace dialog')).toHaveCount(1);
});

test('search preserves query and focus during resize without requests or overflow', async ({
  page,
}) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Adım ara', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Adım ara', exact: true });
  const input = dialog.getByRole('combobox', { name: 'Adım adı veya içerik' });
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await input.fill(steps[0].title);
  await page.setViewportSize({ width: 320, height: 600 });
  await expect(input).toHaveValue(steps[0].title);
  await expect(input).toBeFocused();
  await expect(dialog.getByRole('option')).toHaveCount(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const bounds = await dialog.boundingBox();
  expect(bounds!.width).toBeLessThanOrEqual(320);
  expect(
    await dialog
      .locator('input, button, h2, a')
      .evaluateAll((elements) =>
        elements.every(
          (element) => parseFloat(getComputedStyle(element).fontSize) >= 16,
        ),
      ),
  ).toBe(true);
  await input.press('ArrowDown');
  await input.press('Enter');
  await page.getByRole('button', { name: 'Adım bağlamı', exact: true }).click();
  expect(
    requests.filter((url) => {
      const u = new URL(url);
      return (
        u.origin !== new URL(page.url()).origin ||
        !u.pathname.includes('/evidence/')
      );
    }),
  ).toEqual([]);
});

test('JavaScript-free reading retains all eight semantic navigation links', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL!);
  const nav = page.getByRole('navigation', { name: 'Rehber bölümleri' });
  await expect(nav.getByRole('link')).toHaveCount(8);
  for (const step of steps)
    await expect(
      nav.getByRole('link', { name: step.title, exact: true }),
    ).toHaveAttribute('href', `#${step.id}`);
  await expect(
    page.getByRole('button', { name: 'Adım ara', exact: true }),
  ).not.toBeVisible();
  await context.close();
});

test('unknown context is explicit and command shortcut respects the checklist modal', async ({
  page,
}) => {
  await page.goto('./#%invalid');
  await page.getByRole('button', { name: 'Adım bağlamı', exact: true }).click();
  const inspector = page.getByRole('dialog', {
    name: 'Adım bağlamı',
    exact: true,
  });
  await expect(
    inspector.getByText(
      'Sekiz ana adımdan birini seçin. İlk adımın bağlamı gösteriliyor.',
      { exact: true },
    ),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Kendi kontrol listemi aç' }).click();
  const checklist = page.getByRole('dialog', {
    name: 'Kişisel kontrol listesi',
  });
  await expect(checklist).toBeVisible();
  await page.keyboard.press('ControlOrMeta+k');
  await expect(checklist).toBeVisible();
  await expect(page.locator('#guide-workspace dialog')).not.toBeVisible();
});

test('modal controls retain visible keyboard focus and short-height reflow', async ({
  page,
}, testInfo) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Adım ara', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Adım ara', exact: true });
  const input = dialog.getByRole('combobox');
  await expect(input).toBeFocused();
  expect(
    await input.evaluate((el) => {
      const s = getComputedStyle(el);
      return [s.outlineStyle, parseFloat(s.outlineWidth), s.boxShadow];
    }),
  ).toEqual(['solid', 3, 'none']);
  await testInfo.attach('workspace-search', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
  await input.press('Escape');
  await page.getByRole('button', { name: 'Adım bağlamı', exact: true }).click();
  await page.setViewportSize({ width: 480, height: 320 });
  const inspector = page.getByRole('dialog', {
    name: 'Adım bağlamı',
    exact: true,
  });
  const close = inspector.getByRole('button', { name: 'Kapat', exact: true });
  await expect(close).toBeFocused();
  const b = await close.boundingBox();
  expect(b!.y).toBeGreaterThanOrEqual(0);
  expect(b!.y + b!.height).toBeLessThanOrEqual(320);
  await testInfo.attach('workspace-context-landscape', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
  await close.press('Tab');
  await expect(
    inspector.getByRole('link', { name: 'Adıma git' }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
});

test('open inspector navigation follows the displayed step when browser hash changes', async ({
  page,
}) => {
  await page.goto('./#candidate');
  await page.getByRole('button', { name: 'Adım bağlamı', exact: true }).click();
  const dialog = page.getByRole('dialog', {
    name: 'Adım bağlamı',
    exact: true,
  });
  await page.evaluate(() => {
    location.hash = 'site';
  });
  await expect(page).toHaveURL(/#site$/);
  await expect(
    dialog.getByRole('heading', { name: steps[4].title, exact: true }),
  ).toBeVisible();
  await dialog.getByRole('link', { name: 'Adıma git' }).click();
  await expect(page).toHaveURL(/#candidate$/);
});
