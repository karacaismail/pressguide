import { expect, test } from '@playwright/test';

test('screenshot frames keep controls readable and numbered labels outside the image', async ({
  page,
}) => {
  await page.goto('./');
  const href = await page.locator('.image-link').first().getAttribute('href');
  await page.goto(href!);
  const figure = page.locator('.evidence').first();
  await figure.locator('img').scrollIntoViewIfNeeded();
  await expect(figure.locator('.annotations rect').first()).toBeVisible();
  expect(
    await figure
      .locator(
        '.annotations line, .annotations path, .annotations text, .annotation-number, .annotation-label',
      )
      .count(),
  ).toBe(0);
  const image = await figure.locator('img').boundingBox();
  const labels = await figure
    .locator('.annotation-reference')
    .evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          right: rect.right,
          fontSize: parseFloat(getComputedStyle(element).fontSize),
        };
      }),
    );
  expect(labels.length).toBeGreaterThan(0);
  expect(
    labels.every((label) => label.right <= image!.x && label.fontSize >= 16),
  ).toBe(true);
  expect(await figure.locator('figcaption ol li').count()).toBe(
    await figure.locator('.annotations rect').count(),
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('long repository URLs reflow inside the 320px grid across font substitutions', async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.endsWith('-320'),
    'The constrained reflow regression targets 320 CSS px.',
  );
  await page.goto('./');
  await page.addStyleTag({
    content: ':root { --font-body: "Courier New", monospace; }',
  });
  const geometry = await page.evaluate(() => ({
    viewport: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    offenders: [...document.querySelectorAll('body *')]
      .filter(
        (element) => element.getBoundingClientRect().right > innerWidth + 0.1,
      )
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          tag: element.tagName,
          className: element.getAttribute('class'),
          text: element.textContent?.slice(0, 140),
          right: rect.right,
          width: rect.width,
          minWidth: style.minWidth,
          overflowWrap: style.overflowWrap,
          font: style.fontFamily,
        };
      }),
  }));
  await testInfo.attach('font-substitution-layout', {
    body: JSON.stringify(geometry, null, 2),
    contentType: 'application/json',
  });
  await testInfo.attach('source-form-reflow', {
    body: await page.locator('#source-form').screenshot(),
    contentType: 'image/png',
  });
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewport);
});

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
}, testInfo) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Rehber bölümleri' }),
  ).toBeVisible();
  const documentGeometry = await page.evaluate(() => ({
    viewport: innerWidth,
    width: document.documentElement.scrollWidth,
    textOverflow: (() => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
      );
      const offenders: {
        parent: string;
        className: string;
        text: string;
        right: number;
        wrap: string;
      }[] = [];
      while (walker.nextNode()) {
        const text = walker.currentNode;
        const parent = text.parentElement;
        if (!text.textContent?.trim() || !parent?.getClientRects().length)
          continue;
        const range = document.createRange();
        range.selectNodeContents(text);
        const right = Math.max(
          ...Array.from(range.getClientRects(), (rect) => rect.right),
        );
        if (right > innerWidth + 0.1)
          offenders.push({
            parent: parent.tagName,
            className: parent.className,
            text: text.textContent,
            right,
            wrap: getComputedStyle(parent).overflowWrap,
          });
      }
      return offenders;
    })(),
    overflowing: [...document.querySelectorAll('body *')]
      .filter(
        (element) => element.getBoundingClientRect().right > innerWidth + 0.1,
      )
      .map((element) => ({
        tag: element.tagName,
        className: element.getAttribute('class'),
        text: element.textContent?.slice(0, 140),
        right: element.getBoundingClientRect().right,
        font: getComputedStyle(element).fontFamily,
        minWidth: getComputedStyle(element).minWidth,
      })),
  }));
  if (documentGeometry.width > documentGeometry.viewport) {
    await testInfo.attach('actual-font-overflow', {
      body: JSON.stringify(documentGeometry, null, 2),
      contentType: 'application/json',
    });
    await testInfo.attach('actual-font-source-form', {
      body: await page.locator('#source-form').screenshot(),
      contentType: 'image/png',
    });
  }
  expect(documentGeometry.width).toBeLessThanOrEqual(documentGeometry.viewport);
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
