import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { validateSitemap } from '../src/sitemap';

/**
 * Root sitemap entry journey at 320 CSS px (work/qa/sitemap-review-fixes).
 * Runs once per engine on the *-320 projects; the viewport is set explicitly
 * to 320x568 (a small phone), overriding the project's 320x800. This is
 * desktop-engine viewport emulation, not a real device: no touch, DPR or
 * mobile UA emulation is claimed.
 *
 * Proposed contract: the global index CTA sits within the first two 568px
 * viewports, and the long root coverage text lives in a native
 * details[data-coverage-details] whose summary includes "Tarama kapsamı",
 * placed after #panel-agaci in DOM order. Count groups stay covered by the
 * existing specs and are not re-checked here.
 */
const VIEWPORT = { width: 320, height: 568 };
const CTA_LIMIT = VIEWPORT.height * 2;
const MIN_TARGET = 44;
const INDEX_LIMIT = 50;
const CTA_NAME = 'Tüm sayfa ve bölümlerin listesi';

const loadCoverage = async () => {
  const sitemap = validateSitemap(
    JSON.parse(await readFile('src/data/press-sitemap.json', 'utf8')),
  );
  return {
    scope: sitemap.coverageScope,
    exclusions: sitemap.exclusions,
    lastUpdated: sitemap.lastUpdated,
  };
};

/**
 * Native coverage disclosure: closed on load, opened and closed only by its
 * summary. Open, it shows every scope/exclusion string and the same-origin
 * JSON download link, which is checked by attribute and never clicked.
 */
const assertCoverageDisclosure = async (
  page: Page,
  baseURL: string | undefined,
) => {
  const { scope, exclusions } = await loadCoverage();
  const texts = [...scope, ...exclusions];
  expect(texts.length).toBeGreaterThan(0);
  const coverage = page.locator('details[data-coverage-details]');
  await expect(coverage, 'one native coverage disclosure').toHaveCount(1);
  await expect(coverage, 'coverage starts closed').not.toHaveAttribute('open');
  const summary = coverage.locator(':scope > summary');
  await expect(summary).toHaveCount(1);
  await expect(summary).toContainText('Tarama kapsamı');
  await expect(summary).toBeVisible();
  const items = coverage.locator('li');
  await expect(items.filter({ hasText: texts[0] }).first()).toBeHidden();
  // The open HTML attribute is the native disclosure contract here.
  await summary.click();
  await expect(coverage).toHaveAttribute('open', '');
  for (const text of texts) {
    const row = items.filter({ hasText: text });
    await expect(row.first(), `coverage text: ${text}`).toBeVisible();
  }
  const download = coverage.locator('a.sitemap-download');
  await expect(download, 'one JSON download link').toHaveCount(1);
  await expect(download).toBeVisible();
  await expect(download).toHaveAttribute('download', '');
  const jsonPath = new URL('press-sitemap.json', baseURL).pathname;
  expect(jsonPath).toBe('/pressguide/press-sitemap.json');
  await expect(download).toHaveAttribute('href', jsonPath);
  const resolved = await download.evaluate(
    (link) => (link as HTMLAnchorElement).href,
  );
  expect(new URL(resolved).origin, 'same-origin download').toBe(
    new URL(page.url()).origin,
  );
  expect(new URL(resolved).pathname).toBe(jsonPath);
  await summary.click();
  await expect(coverage).not.toHaveAttribute('open');
  await expect(items.filter({ hasText: texts[0] }).first()).toBeHidden();
  await expect(download).toBeHidden();
};

test.beforeEach(({}, testInfo) =>
  test.skip(
    !testInfo.project.name.endsWith('-320'),
    'Entry journey runs at 320 CSS px in every engine.',
  ),
);

/** Measures the CTA where it initially renders; never scrolls first. */
const assertCtaPlacement = async (page: Page) => {
  const cta = page.locator('a[data-global-index]');
  await expect(cta, 'exactly one global index CTA').toHaveCount(1);
  await expect(cta).toHaveText(CTA_NAME);
  const facts = await cta.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      href: el.getAttribute('href'),
      role: el.getAttribute('role'),
      onclick: el.hasAttribute('onclick'),
      scrollY: window.scrollY,
      top: rect.top + window.scrollY,
      bottom: rect.bottom + window.scrollY,
      width: rect.width,
      height: rect.height,
    };
  });
  expect(facts.tag, 'native anchor').toBe('A');
  expect(facts.role, 'no role override').toBeNull();
  expect(facts.onclick, 'no inline handler').toBe(false);
  expect(facts.href ?? '', 'static index href').toMatch(
    /\/sitemap\/index\/1\/$/,
  );
  expect(facts.scrollY, 'measured without scrolling').toBe(0);
  expect(
    facts.bottom,
    `CTA bottom within ${CTA_LIMIT}px (two 568px viewports)`,
  ).toBeLessThanOrEqual(CTA_LIMIT);
  expect(facts.height, 'CTA target height').toBeGreaterThanOrEqual(MIN_TARGET);
  expect(facts.width, 'CTA target width').toBeGreaterThanOrEqual(MIN_TARGET);
  return cta;
};

const assertIndexPage = async (page: Page) => {
  await expect(page).toHaveURL(/\/sitemap\/index\/1\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  const rows = await page.locator('a[data-page-detail]').count();
  expect(rows, 'index rows present').toBeGreaterThan(0);
  expect(rows, `index rows bounded to ${INDEX_LIMIT}`).toBeLessThanOrEqual(
    INDEX_LIMIT,
  );
};

test('320x568: global index CTA is near the top and opens the index natively', async ({
  page,
  baseURL,
}) => {
  await page.setViewportSize(VIEWPORT);
  const response = await page.goto('sitemap/');
  expect(response?.status()).toBe(200);
  await assertCoverageDisclosure(page, baseURL);

  await page.goto('sitemap/');
  const cta = await assertCtaPlacement(page);
  await cta.click();
  await assertIndexPage(page);
});

test('root lastUpdated explicitly states UTC consistently with observations', async ({
  page,
}) => {
  const { lastUpdated } = await loadCoverage();
  // Same display convention as formatObservation for observedAt.
  const utc = new Date(lastUpdated).toISOString();
  const expected = `${utc.slice(0, 10)} ${utc.slice(11, 16)} UTC`;
  await page.setViewportSize(VIEWPORT);
  const response = await page.goto('sitemap/');
  expect(response?.status()).toBe(200);
  const time = page.locator('.edition time');
  await expect(time, 'one lastUpdated time').toHaveCount(1);
  await expect(time).toHaveAttribute('datetime', lastUpdated);
  await expect(time, 'explicit UTC lastUpdated').toHaveText(expected);
});

test('320x568 without JavaScript: CTA navigates and native coverage disclosure reveals all scope text', async ({
  browser,
  baseURL,
}, testInfo) => {
  const { locale, timezoneId } = testInfo.project.use;
  const context = await browser.newContext({
    baseURL,
    locale,
    timezoneId,
    viewport: VIEWPORT,
    javaScriptEnabled: false,
  });
  try {
    const { scope, exclusions } = await loadCoverage();
    expect(scope.length + exclusions.length).toBeGreaterThan(0);
    const page = await context.newPage();
    const response = await page.goto('sitemap/');
    expect(response?.status()).toBe(200);

    // No script-dependent fake navigation.
    const fake = await page.evaluate(() => ({
      jsHrefs: [...document.querySelectorAll('a[href^="javascript:"]')].length,
      linkRoles: [...document.querySelectorAll('[role="link"]:not(a)')].length,
      onclick: document.querySelectorAll('[onclick]').length,
    }));
    expect(fake, 'no script-dependent navigation').toEqual({
      jsHrefs: 0,
      linkRoles: 0,
      onclick: 0,
    });

    await assertCoverageDisclosure(page, baseURL);

    await page.goto('sitemap/');
    const cta = await assertCtaPlacement(page);
    await expect(cta).toBeVisible();
    await cta.click();
    await assertIndexPage(page);
  } finally {
    await context.close();
  }
});

test('DOM order: panel tree navigation precedes the full coverage disclosure', async ({
  page,
}) => {
  await page.setViewportSize(VIEWPORT);
  const response = await page.goto('sitemap/');
  expect(response?.status()).toBe(200);
  const order = await page.evaluate(() => {
    const tree = document.querySelector('#panel-agaci');
    const coverage =
      document.querySelector('details[data-coverage-details]') ??
      document.getElementById('kapsam')?.closest('section') ??
      null;
    return {
      tree: !!tree,
      coverage: !!coverage,
      coverageIsDetails: coverage?.matches('details[data-coverage-details]'),
      treeFirst:
        !!tree &&
        !!coverage &&
        !!(
          tree.compareDocumentPosition(coverage) &
          Node.DOCUMENT_POSITION_FOLLOWING
        ),
    };
  });
  expect(order.tree, '#panel-agaci present').toBe(true);
  expect(order.coverage, 'coverage container present').toBe(true);
  expect(order.treeFirst, '#panel-agaci precedes coverage').toBe(true);
  expect(order.coverageIsDetails, 'coverage is native details').toBe(true);
});
