import { readdir, readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { SITEMAP_BUDGETS, JSON_BYTES } from '../src/sitemap-budgets';
import { validateSitemap } from '../src/sitemap';
test('single built document preserves initial and interacted budgets', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'chromium-320', 'Built budget runs once.');
  expect(
    (await readdir('dist/sitemap', { recursive: true })).filter((f) =>
      f.endsWith('.html'),
    ),
  ).toEqual(['index.html']);
  const html = await readFile('dist/sitemap/index.html', 'utf8');
  expect(Buffer.byteLength(html)).toBeLessThanOrEqual(
    SITEMAP_BUDGETS.root.htmlBytes,
  );
  const dom = await page.evaluate(
    (source) =>
      new DOMParser().parseFromString(source, 'text/html').querySelectorAll('*')
        .length,
    html,
  );
  expect(dom).toBeLessThanOrEqual(SITEMAP_BUDGETS.root.domElements);
  expect(
    (await readFile('dist/press-sitemap.json')).byteLength,
  ).toBeLessThanOrEqual(JSON_BYTES);
  await page.goto('./sitemap/');
  await page
    .getByRole('button', { name: 'Tüm öğeleri aç', exact: true })
    .click();
  await expect(page.locator('[data-results] li')).toHaveCount(30);
  const data = validateSitemap(
    JSON.parse(await readFile('dist/press-sitemap.json', 'utf8')),
  );
  const largest = [...data.nodes].sort(
    (a, b) => JSON.stringify(b).length - JSON.stringify(a).length,
  )[0];
  const childCounts = new Map<string, number>();
  for (const node of data.nodes)
    if (node.parentId)
      childCounts.set(node.parentId, (childCounts.get(node.parentId) ?? 0) + 1);
  const widest = [...data.nodes].sort(
    (a, b) => (childCounts.get(b.id) ?? 0) - (childCounts.get(a.id) ?? 0),
  )[0];
  for (const node of [largest, widest]) {
    await page.goto('./sitemap/#node=' + encodeURIComponent(node.id));
    await expect(page.locator('[data-selected]')).toHaveAttribute(
      'data-node-id',
      node.id,
    );
    expect(
      Buffer.byteLength(
        await page.locator('[data-selected]').evaluate((el) => el.outerHTML),
      ),
    ).toBeLessThanOrEqual(SITEMAP_BUDGETS.part.htmlBytes);
    expect(await page.locator('*').count()).toBeLessThanOrEqual(
      SITEMAP_BUDGETS.part.domElements,
    );
  }
});
