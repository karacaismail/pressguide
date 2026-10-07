import { readFile, readdir } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('production manifest isolates optional JS and CSS until activation and records modal styles', async ({
  page,
  browserName,
}, testInfo) => {
  const html = await readFile('dist/index.html', 'utf8');
  const initial = [
    ...html.matchAll(
      /(?:src|href)="(\/pressguide\/_astro\/[^\"]+\.(?:css|js))"/g,
    ),
  ].map((match) => match[1]);
  const built = (await readdir('dist/_astro'))
    .filter((name) => /\.(js|css)$/.test(name))
    .map((name) => `/pressguide/_astro/${name}`);
  const optional = built.filter((path) => !initial.includes(path));
  expect(optional.length).toBeGreaterThan(0);
  const requests: string[] = [];
  page.on('request', (request) =>
    requests.push(new URL(request.url()).pathname),
  );
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const beforeActivation = [...requests];
  expect(optional.filter((path) => beforeActivation.includes(path))).toEqual(
    [],
  );
  await page.getByRole('button', { name: 'Kendi kontrol listemi aç' }).click();
  const modal = page.getByRole('dialog', { name: 'Kişisel kontrol listesi' });
  await expect(modal).toBeVisible();
  const fonts = await modal.locator('*').evaluateAll((elements) =>
    elements
      .filter((el) => el.textContent?.trim() && el.getClientRects().length)
      .map((el) => ({
        tag: el.tagName,
        size: getComputedStyle(el).fontSize,
        family: getComputedStyle(el).fontFamily,
      })),
  );
  expect(fonts.every((font) => parseFloat(font.size) >= 16)).toBe(true);
  await expect(
    modal.getByRole('button', { name: 'Kontrol listesini kapat' }),
  ).toBeFocused();
  // macOS WebKit uses Option-Tab to include checkbox controls in keyboard navigation.
  const navigationKey =
    browserName === 'webkit' && process.platform === 'darwin'
      ? 'Alt+Tab'
      : 'Tab';
  await page.keyboard.press(navigationKey);
  await expect(modal.getByRole('checkbox').first()).toBeFocused();
  const focus = await page.locator(':focus').evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      tag: el.tagName,
      outline: style.outline,
      outlineColor: style.outlineColor,
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      shadow: style.boxShadow,
      border: style.border,
      visible: el.matches(':focus-visible'),
    };
  });
  expect(focus.visible).toBe(true);
  expect(focus.outlineColor).toBe('rgb(18, 94, 170)');
  expect(focus.outlineStyle).toBe('solid');
  expect(focus.outlineWidth).toBe('3px');
  expect(focus.shadow).toBe('none');
  const afterActivation = requests.filter((path) => optional.includes(path));
  expect(afterActivation.some((path) => path.endsWith('.css'))).toBe(true);
  expect(afterActivation.some((path) => path.endsWith('.js'))).toBe(true);
  await testInfo.attach('delivery-evidence', {
    body: JSON.stringify(
      {
        project: testInfo.project.name,
        viewport: page.viewportSize(),
        initial,
        optional,
        beforeActivation,
        afterActivation,
        fonts,
        focus,
        navigationKey,
        input: 'mouse/keyboard; touch is separate',
        physicalDevice: false,
      },
      null,
      2,
    ),
    contentType: 'application/json',
  });
});

test('coarse-touch targets preserve state when checklist closes and reopens', async ({
  browser,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-320',
    'Touch emulation targeted to Chromium320; physical devices not covered.',
  );
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 320, height: 568 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:47321/pressguide/');
  expect(
    await page.evaluate(() => matchMedia('(any-pointer: coarse)').matches),
  ).toBe(true);
  const standaloneTargets = await page
    .locator('.sources a, .original-image-link')
    .evaluateAll((elements) =>
      elements.map((element) => {
        const box = element.getBoundingClientRect();
        return {
          label: element.textContent?.trim(),
          width: box.width,
          height: box.height,
        };
      }),
    );
  expect(standaloneTargets.length).toBeGreaterThan(0);
  expect(
    standaloneTargets.every(
      (target) => target.width >= 48 && target.height >= 48,
    ),
  ).toBe(true);
  const trigger = page.getByRole('button', {
    name: 'Kendi kontrol listemi aç',
  });
  expect((await trigger.boundingBox())!.height).toBeGreaterThanOrEqual(48);
  await trigger.tap();
  const checkbox = page.getByRole('checkbox').first();
  await checkbox.locator('..').locator('..').locator('label').tap();
  await expect(checkbox).toBeChecked();
  await page.keyboard.press('Escape');
  await trigger.tap();
  await expect(page.getByRole('checkbox').first()).toBeChecked();
  await page.setViewportSize({ width: 568, height: 320 });
  await expect(page.getByRole('checkbox').first()).toBeChecked();
  await testInfo.attach('touch-evidence', {
    body: JSON.stringify({
      pointer: 'coarse',
      hasTouch: true,
      emulation: true,
      physicalDevice: false,
      portrait: [320, 568],
      landscape: [568, 320],
      targetMinimum: 48,
      standaloneTargets,
    }),
    contentType: 'application/json',
  });
  await context.close();
});
