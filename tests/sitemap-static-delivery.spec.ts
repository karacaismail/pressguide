import { readFile } from 'node:fs/promises';
import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  functionalTestLabels,
  riskLabels,
  sourceLabels,
  validateSitemap,
  type SitemapNode,
} from '../src/sitemap';
import {
  buildSitemapPartitions,
  globalIndexPath,
  metadataPath,
} from '../src/sitemap-partitions';

const dataPath = 'src/data/press-sitemap.json';

// Eager root rendered every node at 808 nodes. The bounded root must stay
// below it; root sets a stronger measured budget after new max measurements.
const eagerBaseline = { bytes: 970_850, elements: 22_927 };

// Known schema field and its page in the reviewed dataset.
const knownField = {
  id: 'desk-schema-press-settings-field-stripe_product_id',
  label: 'Stripe Product ID',
  technical: 'stripe_product_id',
};
const knownPage = 'Press Settings';

/** Reviewed JSON through the publication boundary, plus the raw records. */
const loadData = async () => {
  const raw = JSON.parse(await readFile(dataPath, 'utf8'));
  const nodes = validateSitemap(raw).nodes;
  const partitions = buildSitemapPartitions(nodes);
  const { byId } = partitions.views;
  const rawById = new Map<string, Record<string, unknown>>(
    raw.nodes.map((node: Record<string, unknown>) => [node.id, node]),
  );
  const ancestors = (node: SitemapNode) => {
    const chain: SitemapNode[] = [];
    let current = node.parentId ? byId.get(node.parentId) : undefined;
    while (current) {
      chain.unshift(current);
      current = current.parentId ? byId.get(current.parentId) : undefined;
    }
    return chain;
  };
  // Exact reviewed record; no fallback to another field.
  const field = nodes.find(
    (node) =>
      node.id === knownField.id &&
      node.kind === 'field' &&
      node.source === 'schema_ui' &&
      node.label === knownField.label,
  );
  return { nodes, byId, rawById, ancestors, partitions, field };
};

/** CSS attribute value; ids are data, not trusted selector text. */
const q = (value: string) => JSON.stringify(value);

/** Served URL of a base-less sitemap path. */
const urlOf = (baseURL: string | undefined, path: string) =>
  new URL(path.slice(1), baseURL).href;

/** Opens closed native disclosures around a target through their summaries. */
const openAncestors = async (target: Locator) => {
  const ancestors = target.locator('xpath=ancestor::details');
  const count = await ancestors.count();
  for (let index = 0; index < count; index++)
    if (
      !(await ancestors
        .nth(index)
        .evaluate((element) => (element as HTMLDetailsElement).open))
    )
      await ancestors.nth(index).locator(':scope > summary').click();
};

/** Own attribute of a sitemap item, or of its own metadata list. */
const attributeOf = (target: Locator, name: string) =>
  target.evaluate(
    (element, attribute) =>
      (element.matches(`[${attribute}]`)
        ? element
        : element.querySelector(
            `:scope > details > .sitemap-body > dl [${attribute}]`,
          )
      )?.getAttribute(attribute) ?? null,
    name,
  );

test('root is bounded: top-level anchors, global index link and badges without component metadata', async ({
  page,
  baseURL,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-320',
    'HTML growth and data checks run once; route journeys cover every project.',
  );
  const { nodes, byId, partitions } = await loadData();
  const rootUrl = urlOf(baseURL, '/sitemap/');
  const response = await page.goto('./sitemap/');
  expect(response?.ok()).toBe(true);
  const html = (await response!.body()).toString('utf8');

  // Initial server HTML, parsed without running scripts.
  const initial = await page.evaluate((source) => {
    const doc = new DOMParser().parseFromString(source, 'text/html');
    const tree = doc.querySelector('[data-sitemap]');
    return {
      elements: doc.getElementsByTagName('*').length,
      treeText: tree?.textContent ?? '',
      componentMarkers: tree
        ? tree.querySelectorAll(
            '.sitemap-notes, [aria-label="Notlar"], dl.sitemap-meta, [data-metadata-primary], [data-metadata-context], [data-kind="field"], [data-kind="option"]',
          ).length
        : 0,
      items: [...doc.querySelectorAll('[data-sitemap] [data-node-id]')].map(
        (element) => ({
          id: element.getAttribute('data-node-id')!,
          status: element.getAttribute('data-status'),
          source: element.getAttribute('data-source'),
          badgeStatus:
            element
              .querySelector(':scope > details > summary [data-status]')
              ?.getAttribute('data-status') ?? null,
          badgeSource:
            element
              .querySelector(':scope > details > summary [data-source]')
              ?.getAttribute('data-source') ?? null,
        }),
      ),
      detailLinks: [...doc.querySelectorAll('a[data-page-detail]')].map(
        (link) => ({
          id: link.getAttribute('data-page-detail')!,
          href: link.getAttribute('href') ?? '',
          text: link.textContent ?? '',
        }),
      ),
      hrefs: [...doc.querySelectorAll('a[href]')].map((link) =>
        link.getAttribute('href')!,
      ),
    };
  }, html);

  expect
    .soft(Buffer.byteLength(html), 'root HTML bytes')
    .toBeLessThan(eagerBaseline.bytes);
  expect
    .soft(initial.elements, 'root DOM elements')
    .toBeLessThan(eagerBaseline.elements);

  // Component metadata stays in metadata parts.
  expect.soft(initial.treeText).not.toContain(knownField.label);
  expect.soft(initial.treeText).not.toContain(knownField.technical);
  expect
    .soft(initial.componentMarkers, 'fields, options, notes or metadata lists')
    .toBe(0);

  // Exactly the top-level anchors and their unowned navigation context.
  const rootIds = partitions.rootNodes.map((node) => node.id);
  const shown = initial.items.map((item) => item.id);
  expect
    .soft(
      shown.filter((id) => !rootIds.includes(id)),
      'root items outside top-level navigation',
    )
    .toEqual([]);
  expect
    .soft(
      rootIds.filter((id) => !shown.includes(id)),
      'top-level navigation missing on root',
    )
    .toEqual([]);

  // Each shown anchor has one canonical detail link, readable without its label.
  const anchors = rootIds.filter((id) => partitions.views.anchorIds.has(id));
  expect(anchors.length, 'top-level anchors on root').toBeGreaterThan(0);
  const linkById = new Map(initial.detailLinks.map((link) => [link.id, link]));
  expect
    .soft(
      anchors.filter((id) => !linkById.has(id)),
      'root anchors without data-page-detail link',
    )
    .toEqual([]);
  expect
    .soft(
      initial.detailLinks
        .filter((link) => !anchors.includes(link.id))
        .map((link) => link.id),
      'root detail links beyond top-level anchors',
    )
    .toEqual([]);
  for (const link of initial.detailLinks) {
    expect
      .soft(new URL(link.href, rootUrl).href, link.id)
      .toBe(urlOf(baseURL, metadataPath(link.id, 1, '')));
    expect.soft(link.text, link.id).toContain('Bileşenleri incele');
  }

  // The complete linear route starts at the first global index part.
  expect
    .soft(
      initial.hrefs.map((href) => new URL(href, rootUrl).href),
      'root link to the global anchor index',
    )
    .toContain(urlOf(baseURL, globalIndexPath(1, '')));

  // Source and status badges travel with every item, visible when collapsed.
  for (const item of initial.items) {
    const node = byId.get(item.id);
    expect.soft(node, `unknown root item ${item.id}`).toBeDefined();
    if (!node) continue;
    expect.soft(item.status, `${item.id} status`).toBe(node.status);
    expect.soft(item.source, `${item.id} source`).toBe(node.source);
    expect.soft(item.badgeStatus, `${item.id} status badge`).toBe(node.status);
    expect.soft(item.badgeSource, `${item.id} source badge`).toBe(node.source);
  }

  // Full snapshot total stays on root.
  await expect(page.locator('main')).toContainText(
    `Toplam ${nodes.length} öğe`,
  );
  await expect(
    page.getByText('Bu görünümde ara', { exact: true }),
  ).toBeVisible();
});

test('home metadata part carries the known field, its own segment only and breadcrumbs back to the map', async ({
  page,
  baseURL,
}) => {
  const { nodes, byId, rawById, ancestors, partitions, field } =
    await loadData();
  expect(field, `${knownField.label} field in reviewed data`).toBeDefined();
  expect(field!.source).toBe('schema_ui');
  const home = partitions.homeById.get(field!.id);
  expect(home, 'field has a home metadata part').toBeDefined();
  const anchor = byId.get(home!.anchorId)!;
  expect(anchor.label).toContain(knownPage);
  const part = partitions.metadataFor(home!.anchorId, home!.part);
  expect(part.primaryIds.has(field!.id), 'field is primary in its home').toBe(
    true,
  );
  const partIds = new Set(part.nodes.map((node) => node.id));
  const partText = part.nodes
    .flatMap((node) => [
      node.label,
      ...(node.notes ?? []),
      ...(node.options ?? []),
    ])
    .join('\n');
  const anchorAncestors = ancestors(anchor);
  const labelUses = new Map<string, number>();
  for (const node of nodes)
    labelUses.set(node.label, (labelUses.get(node.label) ?? 0) + 1);
  // A field from another part whose label cannot appear here by accident.
  const foreign = nodes.find(
    (node) =>
      node.kind === 'field' &&
      !partIds.has(node.id) &&
      partitions.homeById.has(node.id) &&
      node.label.length >= 10 &&
      labelUses.get(node.label) === 1 &&
      !partText.includes(node.label) &&
      !anchorAncestors.some((ancestor) =>
        ancestor.label.includes(node.label),
      ) &&
      !nodes.some(
        (candidate) =>
          candidate.kind === 'page' && candidate.label.includes(node.label),
      ),
  );
  expect(foreign, 'a field outside this part to prove isolation').toBeDefined();

  const url = urlOf(baseURL, metadataPath(home!.anchorId, home!.part, ''));
  await page.goto(url);
  await expect(page).toHaveURL(url);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    anchor.label,
  );

  // Known field with its own evidence metadata.
  const item = page.locator(`[data-node-id=${q(field!.id)}]`);
  await expect(item).toHaveCount(1);
  await expect(item).toHaveAttribute('data-metadata-primary', '');
  await expect(item).toContainText(field!.label);
  await expect(item).toContainText(knownField.technical);
  expect(await attributeOf(item, 'data-source')).toBe(field!.source);
  expect(await attributeOf(item, 'data-risk')).toBe(field!.risk);
  await expect(item).toContainText(sourceLabels[field!.source]);
  await expect(item).toContainText(riskLabels[field!.risk]);
  await expect(item).toContainText(functionalTestLabels[field!.functionalTest]);
  const observedDate = rawById.get(field!.id)?.observedDate;
  const bareDates = await item
    .locator(':scope > details > .sitemap-body > dl time[datetime]')
    .evaluateAll((times) =>
      times
        .map((time) => time.getAttribute('datetime') ?? '')
        .filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value)),
    );
  if (typeof observedDate === 'string') {
    expect(bareDates).toContain(observedDate);
    // Date-only evidence says so instead of inventing a clock time.
    await expect(item).toContainText('Saat kaydı yok');
  } else expect(bareDates, 'no invented date-only evidence').toEqual([]);

  // Exactly this part's anchor, segment and context.
  const shown = await page
    .locator('[data-node-id]')
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('data-node-id')!),
    );
  const shownSet = new Set(shown);
  expect(
    [...partIds].filter((id) => !shownSet.has(id)),
    'part nodes missing from document',
  ).toEqual([]);
  expect(
    shown.filter((id) => !partIds.has(id)),
    'nodes of other parts on document',
  ).toEqual([]);
  expect(shownSet.size).toBeLessThan(nodes.length);
  await expect(page.locator(`[data-node-id=${q(foreign!.id)}]`)).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText(foreign!.label);

  // Breadcrumb keeps ancestry and leads back to the map.
  const trails = await page.locator('nav').evaluateAll((navs) =>
    navs.map((nav) => ({
      text: nav.textContent ?? '',
      hrefs: [...nav.querySelectorAll('a[href]')].map(
        (anchor) => (anchor as HTMLAnchorElement).href,
      ),
    })),
  );
  const rootUrl = urlOf(baseURL, '/sitemap/');
  const trail = trails.find((nav) => nav.hrefs.includes(rootUrl));
  expect(trail, 'breadcrumb navigation linking to the map').toBeDefined();
  let position = -1;
  for (const ancestor of anchorAncestors) {
    const next = trail!.text.indexOf(ancestor.label, position + 1);
    expect(next, `breadcrumb ancestor ${ancestor.label}`).toBeGreaterThan(
      position,
    );
    position = next;
    if (partitions.views.anchorIds.has(ancestor.id))
      expect(trail!.hrefs).toContain(
        urlOf(baseURL, metadataPath(ancestor.id, 1, '')),
      );
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('root, index and metadata documents load only themselves and their stylesheets', async ({
    page,
    baseURL,
  }) => {
    const { partitions, field } = await loadData();
    expect(field, `${knownField.label} field in reviewed data`).toBeDefined();
    const home = partitions.homeById.get(field!.id);
    expect(home, 'field has a home metadata part').toBeDefined();

    let requests: { url: string; type: string }[] = [];
    page.on('request', (request) =>
      requests.push({ url: request.url(), type: request.resourceType() }),
    );
    /** Allowlist: one current document plus stylesheets it actually links. */
    const expectOnlyDocumentAndStyles = async (current: Page, url: string) => {
      await current.waitForLoadState('networkidle');
      const styles = await current
        .locator('link[rel~="stylesheet"][href]')
        .evaluateAll((links) =>
          links.map((link) => (link as HTMLLinkElement).href),
        );
      expect(requests.filter((request) => request.type === 'document')).toEqual(
        [{ url, type: 'document' }],
      );
      expect(
        requests.filter(
          (request) =>
            !(
              (request.url === url && request.type === 'document') ||
              (styles.includes(request.url) && request.type === 'stylesheet')
            ),
        ),
        'requests outside document and linked stylesheets',
      ).toEqual([]);
    };
    const expectSearchHidden = async (current: Page) => {
      await expect(current.getByRole('searchbox')).toHaveCount(0);
      await expect(
        current.getByText('Bu görünümde ara', { exact: true }),
      ).toBeHidden();
    };

    // Root: JSON is an explicit download link only, never fetched.
    const rootUrl = urlOf(baseURL, '/sitemap/');
    await page.goto('./sitemap/');
    await expect(page).toHaveURL(rootUrl);
    await expectOnlyDocumentAndStyles(page, rootUrl);
    await expectSearchHidden(page);
    await expect(page.locator('a[download][href$=".json"]')).toHaveCount(1);
    // Native coverage disclosure: closed, opened and closed by its summary;
    // the download link is inspected, never clicked.
    const coverage = page.locator('details[data-coverage-details]');
    await expect(coverage).toHaveCount(1);
    await expect(coverage, 'coverage starts closed').not.toHaveAttribute(
      'open',
    );
    const coverageSummary = coverage.locator(':scope > summary');
    const download = coverage.locator('a.sitemap-download');
    await expect(download).toBeHidden();
    await coverageSummary.click();
    await expect(coverage).toHaveAttribute('open', '');
    await expect(download).toBeVisible();
    await expect(download).toHaveAttribute('download', '');
    const jsonPath = new URL('press-sitemap.json', baseURL).pathname;
    expect(jsonPath).toBe('/pressguide/press-sitemap.json');
    await expect(download).toHaveAttribute('href', jsonPath);
    expect(
      await download.evaluate((link) => (link as HTMLAnchorElement).href),
      'same-origin JSON download',
    ).toBe(new URL(jsonPath, rootUrl).href);
    await coverageSummary.click();
    await expect(coverage).not.toHaveAttribute('open');
    await expect(download).toBeHidden();
    await expectOnlyDocumentAndStyles(page, rootUrl);

    // Global index through its static root link.
    const indexUrl = urlOf(baseURL, globalIndexPath(1, ''));
    const indexLink = page.locator('a[href]');
    const hrefs = await indexLink.evaluateAll((links) =>
      links.map((link) => (link as HTMLAnchorElement).href),
    );
    const position = hrefs.indexOf(indexUrl);
    expect(position, 'root link to the global anchor index').toBeGreaterThan(
      -1,
    );
    const link = indexLink.nth(position);
    await openAncestors(link);
    await expect(link).toBeVisible();
    requests = [];
    await link.click();
    await expect(page).toHaveURL(indexUrl);
    await expectOnlyDocumentAndStyles(page, indexUrl);
    await expectSearchHidden(page);

    // Metadata part: native disclosures alone expose the known schema field.
    const url = urlOf(baseURL, metadataPath(home!.anchorId, home!.part, ''));
    requests = [];
    await page.goto(url);
    await expect(page).toHaveURL(url);
    await expectOnlyDocumentAndStyles(page, url);
    await expectSearchHidden(page);
    const item = page.locator(`[data-node-id=${q(field!.id)}]`);
    await expect(item).toHaveCount(1);
    await openAncestors(item);
    await expect(item).toBeVisible();
    await expect(item).toContainText(field!.label);
  });
});
