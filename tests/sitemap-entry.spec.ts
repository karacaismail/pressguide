import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { validateSitemap, formatObservation } from '../src/sitemap';
const data = validateSitemap(
  JSON.parse(await readFile('src/data/press-sitemap.json', 'utf8')),
);
for (const javaScriptEnabled of [true, false])
  test.describe(`entry JS ${javaScriptEnabled}`, () => {
    test.use({ javaScriptEnabled });
    test('compact entry, honest scope and complete no-JS download', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      const requests: string[] = [];
      page.on('request', (r) => requests.push(r.url()));
      await page.goto('./sitemap/');
      const cta = page.locator('[data-global-index]');
      await expect(cta).toHaveAttribute('href', '#tum-ogeler');
      expect((await cta.boundingBox())!.y).toBeLessThan(1136);
      await expect(page.locator('.sitemap-phase')).toHaveText('Tarama sürüyor');
      await expect(page.locator('header time')).toHaveAttribute(
        'datetime',
        data.lastUpdated,
      );
      await expect(page.locator('header time')).toHaveText(
        formatObservation({ observedAt: data.lastUpdated })!.text,
      );
      const coverage = page.locator('[data-coverage-details]');
      await expect(coverage).not.toHaveAttribute('open');
      await coverage.locator('summary').click();
      for (const text of [...data.coverageScope, ...data.exclusions])
        await expect(coverage).toContainText(text);
      await expect(coverage).toContainText(`Toplam ${data.nodes.length} öğe`);
      await expect(coverage.locator('a[download]')).toBeVisible();
      await expect(coverage.locator('a[download]')).toHaveAttribute(
        'href',
        '/pressguide/press-sitemap.json',
      );
      expect(requests.filter((u) => u.endsWith('.json'))).toHaveLength(0);
      if (!javaScriptEnabled)
        await expect(
          page.getByRole('button', { name: 'Tüm öğeleri aç', exact: true }),
        ).toBeHidden();
    });
  });
