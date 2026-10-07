import { readdir, readFile } from 'node:fs/promises';
import { posix } from 'node:path';
import { expect, test } from '@playwright/test';
import { SITEMAP_BUDGETS } from '../src/sitemap-budgets';
import { METADATA_LIMIT } from '../src/sitemap-partitions';

/**
 * Measured budget guard over EVERY built sitemap HTML document (run after
 * `npm run build`). Bytes are raw UTF-8 file sizes; DOM is the element count
 * of DOMParser output, so scripts never execute. Segment/BFS correctness is
 * guarded independently in tests/sitemap-bounded.spec.ts.
 */
const distSitemap = 'dist/sitemap';
const PARSE_BATCH = 200;
/** Owned primary segment plus the repeated anchor. */
const MAX_PRIMARY = METADATA_LIMIT + 1;

const report = (items: string[]) => ({
  count: items.length,
  sample: items.slice(0, 20),
});
const none = { count: 0, sample: [] };

test.beforeEach(({}, testInfo) =>
  test.skip(
    testInfo.project.name !== 'chromium-320',
    'Pure built-HTML budget check runs once.',
  ),
);

test('every built sitemap document stays within the measured budget', async ({
  page,
}) => {
  const entries = (await readdir(distSitemap, { recursive: true }))
    .map((entry) => entry.split('\\').join('/'))
    .filter((entry) => entry === 'index.html' || entry.endsWith('/index.html'));
  expect(entries.length, 'root plus partition documents built').toBeGreaterThan(
    1,
  );
  expect(entries, 'built root').toContain('index.html');

  const over: string[] = [];
  const primary: string[] = [];
  const max = { bytes: 0, dom: 0, primary: 0, context: 0 };
  let root:
    { bytes: number; dom: number; meta: number; primary: number } | undefined;

  for (let i = 0; i < entries.length; i += PARSE_BATCH) {
    const batch = entries.slice(i, i + PARSE_BATCH);
    const sources = await Promise.all(
      batch.map((file) => readFile(posix.join(distSitemap, file))),
    );
    const parsed = await page.evaluate(
      (html) => {
        const parser = new DOMParser();
        return html.map((source) => {
          const doc = parser.parseFromString(source, 'text/html');
          return {
            dom: doc.getElementsByTagName('*').length,
            meta: doc.querySelectorAll('.sitemap-meta').length,
            primary: doc.querySelectorAll('[data-metadata-primary]').length,
            context: doc.querySelectorAll('[data-metadata-context]').length,
          };
        });
      },
      sources.map((buffer) => buffer.toString('utf8')),
    );
    batch.forEach((file, j) => {
      const bytes = sources[j].byteLength;
      const { dom, meta, primary: p, context } = parsed[j];
      const isRoot = file === 'index.html';
      const budget = isRoot ? SITEMAP_BUDGETS.root : SITEMAP_BUDGETS.part;
      if (bytes > budget.htmlBytes || dom > budget.domElements)
        over.push(
          `${file}: ${bytes}/${budget.htmlBytes} bytes, ${dom}/${budget.domElements} DOM`,
        );
      if (p > MAX_PRIMARY) primary.push(`${file}: ${p} primary`);
      if (isRoot) root = { bytes, dom, meta, primary: p };
      else {
        max.bytes = Math.max(max.bytes, bytes);
        max.dom = Math.max(max.dom, dom);
        max.primary = Math.max(max.primary, p);
        max.context = Math.max(max.context, context);
      }
    });
  }

  test.info().annotations.push({
    type: 'measured',
    description: JSON.stringify({ documents: entries.length, root, max }),
  });
  expect(root?.meta, 'root carries no own metadata').toBe(0);
  expect(report(over), 'documents over budget').toEqual(none);
  expect(
    report(primary),
    `primary nodes per document <= ${MAX_PRIMARY} (context not counted)`,
  ).toEqual(none);
});
