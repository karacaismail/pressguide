import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import {
  expect,
  test,
  type Locator,
  type Page,
  type TestInfo,
} from '@playwright/test';
import {
  functionalTestLabels,
  kindLabels,
  nearestLinkedAncestor,
  riskLabels,
  sourceLabels,
  statusLabels,
  surfaceLabels,
  validateSitemap,
  type SitemapNode,
} from '../src/sitemap';
import { detailPath } from '../src/sitemap-views';
import {
  buildSitemapPartitions,
  globalIndexPath,
  metadataPath,
  type MetadataPart,
  type SitemapPartitions,
} from '../src/sitemap-partitions';

const dataPath = 'src/data/press-sitemap.json';
const readSitemap = async () =>
  validateSitemap(JSON.parse(await readFile(dataPath, 'utf8')));
const readPartitions = async () => {
  const { nodes } = await readSitemap();
  return { nodes, partitions: buildSitemapPartitions(nodes) };
};
const searchName = 'Bu görünümde ara';

/** Path of a static metadata part, relative to the project baseURL. */
const metadataRoute = (anchorId: string, part: number) =>
  `.${metadataPath(anchorId, part, '')}`;
/** Path of a global anchor index part, relative to the project baseURL. */
const indexRoute = (part: number) => `.${globalIndexPath(part, '')}`;

const primaryOf = (part: MetadataPart) =>
  part.nodes.filter((node) => part.primaryIds.has(node.id));
const uniqueIn = (nodes: SitemapNode[], node: SitemapNode) =>
  nodes.filter((other) => other.label === node.label).length === 1;
const mixedSources = (nodes: SitemapNode[]) =>
  new Set(nodes.map((node) => node.source)).size > 1;
const isHome = (
  partitions: SitemapPartitions,
  part: MetadataPart,
  id: string,
) => {
  const home = partitions.homeById.get(id);
  return home?.anchorId === part.anchor.id && home.part === part.part;
};

/**
 * First metadata part holding a primary node, at its home part, whose label
 * is unique there (context duplicates excluded) so its summary is findable.
 */
const pickHomed = (
  partitions: SitemapPartitions,
  description: string,
  matches: (node: SitemapNode, part: MetadataPart) => boolean,
  partMatches: (part: MetadataPart) => boolean = () => true,
) => {
  for (const part of partitions.metadataParts) {
    if (!partMatches(part)) continue;
    const node = primaryOf(part).find(
      (candidate) =>
        isHome(partitions, part, candidate.id) &&
        uniqueIn(part.nodes, candidate) &&
        matches(candidate, part),
    );
    if (node) return { part, node };
  }
  throw new Error(`The snapshot has no ${description} in a metadata part`);
};

/**
 * Nodes the current view renders, in document order. Every id must belong
 * to `allowed` (the contract navigation set on root, nodesFor on a detail).
 */
const renderedOrder = async (
  page: Page,
  nodes: SitemapNode[],
  allowed: SitemapNode[],
) => {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const allowedIds = new Set(allowed.map((node) => node.id));
  const ids = await page
    .locator('[data-sitemap] li[data-node-id]')
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('data-node-id')!),
    );
  expect(ids.length, 'rendered view items').toBeGreaterThan(0);
  expect(
    ids.filter((id) => !allowedIds.has(id)),
    'rendered ids outside the contract view set',
  ).toEqual([]);
  return ids.map((id) => byId.get(id)!);
};

/** Explicit contexts keep the project's local server, locale and timezone. */
const projectContext = ({ project }: TestInfo) => {
  const { baseURL, locale, timezoneId, reducedMotion } = project.use;
  expect(baseURL, 'relative navigation needs the project baseURL').toBeTruthy();
  expect(locale).toBeTruthy();
  expect(timezoneId).toBeTruthy();
  return { baseURL, locale, timezoneId, reducedMotion };
};

const ancestorIds = (node: SitemapNode, byId: Map<string, SitemapNode>) => {
  const ids: string[] = [];
  for (
    let parentId = node.parentId;
    parentId !== null;
    parentId = byId.get(parentId)?.parentId ?? null
  )
    ids.push(parentId);
  return ids;
};

/** Shallowest matching node with a unique label, so its summary is findable. */
const pickNode = (
  nodes: SitemapNode[],
  description: string,
  matches: (node: SitemapNode) => boolean,
) => {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const labels = new Map<string, number>();
  for (const node of nodes)
    labels.set(node.label, (labels.get(node.label) ?? 0) + 1);
  const candidate = nodes
    .filter((node) => labels.get(node.label) === 1 && matches(node))
    .sort(
      (a, b) => ancestorIds(a, byId).length - ancestorIds(b, byId).length,
    )[0];
  if (!candidate)
    throw new Error(`The snapshot has no ${description} with a unique label`);
  return candidate;
};

const normalize = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/ı/g, 'i')
    .toLowerCase();

/** Every text a node could contribute to search; absence proves a non-match. */
const searchableText = (node: SitemapNode) =>
  normalize(
    [
      ...Object.values(node)
        .flat()
        .filter((value): value is string => typeof value === 'string'),
      kindLabels[node.kind],
      statusLabels[node.status],
      surfaceLabels[node.surface],
      sourceLabels[node.source],
      riskLabels[node.risk],
      functionalTestLabels[node.functionalTest],
    ].join(' '),
  );

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const summaryFor = (page: Page, label: string) =>
  page.locator('[data-sitemap-node] > summary').filter({
    has: page.locator('.sitemap-label', {
      // Playwright matches whitespace-normalized text.
      hasText: new RegExp(
        `^${escapeRegExp(label.trim().replace(/\s+/g, ' '))}$`,
      ),
    }),
  });

/** Opens collapsed ancestor disclosures outermost first, as a reader would. */
const reveal = async (summary: Locator) => {
  // One read: count, ancestor open states (as `../ancestor::details`,
  // outermost first) and the parent's own open state.
  const returned = await summary.evaluateAll((elements) => {
    const target = elements[0];
    const open: boolean[] = [];
    for (
      let node = target?.parentElement?.parentElement ?? null;
      node;
      node = node.parentElement
    )
      if (node.tagName === 'DETAILS') open.push(node.hasAttribute('open'));
    return {
      count: elements.length,
      open: open.reverse(),
      ownOpen: Boolean(target?.parentElement?.hasAttribute('open')),
    };
  });
  expect(returned.count).toBe(1);
  const ancestors = summary.locator('xpath=../ancestor::details');
  for (let index = 0; index < returned.open.length; index++)
    if (!returned.open[index])
      await ancestors.nth(index).locator(':scope > summary').click();
  await expect(summary).toBeVisible();
  // Opening ancestors never changes a summary's own disclosure state.
  return returned.ownOpen;
};

const openNode = async (page: Page, label: string) => {
  const summary = summaryFor(page, label);
  if (!(await reveal(summary))) await summary.click();
};

const unhiddenFilteredMessages = (page: Page) =>
  page
    .locator('.sitemap-filtered-children')
    .evaluateAll(
      (elements) =>
        elements.filter((element) => !element.closest('[hidden]')).length,
    );

const tally = <T extends string>(
  labels: Record<T, string>,
  nodes: SitemapNode[],
  pick: (node: SitemapNode) => T,
) =>
  new Map(
    (Object.keys(labels) as T[]).map((key) => [
      labels[key],
      nodes.filter((node) => pick(node) === key).length,
    ]),
  );

const renderedCounts = (list: Locator) =>
  list.evaluate((element) =>
    [...element.querySelectorAll('dt')].map((term): [string, number] => [
      term.textContent?.trim().replace(/:$/, '') ?? '',
      Number(term.nextElementSibling?.textContent?.trim()),
    ]),
  );

/** Rendered entries must equal the snapshot; zero entries may be omitted. */
const expectCounts = (
  rendered: [string, number][],
  expected: Map<string, number>,
) => {
  const labels = rendered.map(([label]) => label);
  expect(labels).toEqual([...new Set(labels)]);
  for (const [label, count] of rendered) {
    expect(expected.has(label), `unexpected count label "${label}"`).toBe(true);
    expect(count, label).toBe(expected.get(label));
  }
  for (const [label, count] of expected)
    if (count > 0) expect(labels, `missing ${label}`).toContain(label);
};
const sum = (rendered: [string, number][]) =>
  rendered.reduce((total, [, count]) => total + count, 0);

const targetSelectors = {
  masthead: 'header a',
  input: '.sitemap-controls input',
  button: '.sitemap-controls button',
  summary:
    '[data-sitemap-node] > summary, details[data-coverage-details] > summary',
  link: 'a[data-live-link]',
  download: 'a.sitemap-download',
  detail: 'a[data-page-detail]',
  breadcrumb: 'nav.sitemap-breadcrumbs a',
  pagination: 'nav[data-sitemap-pagination] a',
  globalindex: 'a[data-global-index]',
  childindex: 'a[data-child-index]',
  // Lean context's own home link only, never links of its nested child tree.
  contexthome:
    'li[data-metadata-context] > details > .sitemap-body > a.sitemap-link',
};

/** Effective hit rectangles of every rendered standalone target. */
const measureTargets = (page: Page) =>
  page.evaluate((selectors) => {
    const rendered = (element: Element) => {
      if (
        element.closest('[hidden]') ||
        getComputedStyle(element).visibility !== 'visible' ||
        element.getClientRects().length === 0
      )
        return false;
      // Only a closed disclosure's own summary is rendered.
      for (let node: Element = element; ;) {
        const details = node.parentElement?.closest('details');
        if (!details) return true;
        if (
          !details.open &&
          !details.querySelector(':scope > summary')?.contains(node)
        )
          return false;
        node = details;
      }
    };
    return Object.entries(selectors).flatMap(([kind, selector]) =>
      [...document.querySelectorAll(selector)]
        .filter(rendered)
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            kind: kind === 'link' && element.closest('p') ? 'fallback' : kind,
            name: (element.textContent ?? '')
              .trim()
              .replace(/\s+/g, ' ')
              .slice(0, 60),
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
          };
        }),
    );
  }, targetSelectors);

// Root is lean navigation: masthead, controls, summaries, download and
// detail anchors (any Press link it renders is still measured). A detail
// adds breadcrumbs and the nearest-parent Press fallback in its components.
const rootKinds = [
  'button',
  'detail',
  'download',
  'globalindex',
  'input',
  'masthead',
  'summary',
];
const detailKinds = [
  'breadcrumb',
  'button',
  'fallback',
  'input',
  'masthead',
  'summary',
];

const expectTargets = async (
  page: Page,
  minimum: number,
  required: string[],
) => {
  const targets = await measureTargets(page);
  const kinds = new Set(targets.map((target) => target.kind));
  expect(
    required.filter((kind) => !kinds.has(kind)),
    'standalone target kinds missing from this view',
  ).toEqual([]);
  const small = targets
    .filter(
      (target) =>
        target.right - target.left < minimum - 0.01 ||
        target.bottom - target.top < minimum - 0.01,
    )
    .map(
      (target) =>
        `${target.kind} "${target.name}" ${target.right - target.left}x${target.bottom - target.top}`,
    );
  expect(small, `targets under ${minimum} CSS px`).toEqual([]);
  const overlaps: string[] = [];
  targets.forEach((a, index) => {
    for (const b of targets.slice(index + 1)) {
      const width = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (width > 0.5 && height > 0.5)
        overlaps.push(`${a.kind} "${a.name}" / ${b.kind} "${b.name}"`);
    }
  });
  expect(overlaps).toEqual([]);
};

/** Top-level anchor actually rendered on bounded root, unique there. */
const pickRootAnchor = (partitions: SitemapPartitions) =>
  pickNode(partitions.rootNodes, 'root top-level anchor', (node) =>
    partitions.views.anchorIds.has(node.id),
  );

/**
 * Root: opens one top-level anchor so its static detail link renders, then
 * opens the native coverage disclosure that holds the JSON download.
 */
const revealRootTargets = async (page: Page) => {
  const { partitions } = await readPartitions();
  const anchor = pickRootAnchor(partitions);
  await openNode(page, anchor.label);
  await expect(
    page.locator(
      `a[data-page-detail="${anchor.id.replace(/["\\]/g, '\\$&')}"]`,
    ),
  ).toBeVisible();
  const coverage = page.locator('details[data-coverage-details]');
  await expect(coverage, 'one native coverage disclosure').toHaveCount(1);
  const summary = coverage.locator(':scope > summary');
  await expect(summary).toBeVisible();
  if ((await coverage.getAttribute('open')) === null) await summary.click();
  await expect(coverage).toHaveAttribute('open', '');
  await expect(coverage.locator('a.sitemap-download')).toBeVisible();
};

/**
 * Detail: visits the home metadata part of a component that links to its
 * nearest Press parent, then opens it so the fallback link renders. The part
 * mixes sources so its controls render filter buttons.
 */
const revealDetailTargets = async (page: Page) => {
  const { nodes, partitions } = await readPartitions();
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const { part, node } = pickHomed(
    partitions,
    'fallback node with a unique label on a part with >1 sources (needed for the button target)',
    (candidate) =>
      !candidate.livePath &&
      Boolean(nearestLinkedAncestor(candidate, byId)?.livePath),
    (candidatePart) => mixedSources(candidatePart.nodes),
  );
  await page.goto(metadataRoute(part.anchor.id, part.part));
  await openNode(page, node.label);
};

test('published snapshot passes the shared validator and holds the journeys this suite exercises', async ({}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-320',
    'Pure snapshot checks run once; browser journeys cover every project.',
  );
  expect(
    existsSync(dataPath),
    'The requested public audit data is missing',
  ).toBe(true);
  const sitemap = await readSitemap();
  const pages = sitemap.nodes.filter((node) => node.kind === 'page');
  expect(sitemap.nodes.length).toBeGreaterThan(0);
  expect(pages.length).toBeGreaterThan(0);
  expect(pages.length, 'node and page counts must differ').toBeLessThan(
    sitemap.nodes.length,
  );
  for (const source of ['live_ui', 'schema_ui'])
    expect(
      sitemap.nodes.some((node) => node.source === source),
      `${source} nodes`,
    ).toBe(true);
  expect(
    pages.some((node) => node.status === 'discovered'),
    'a discovered page',
  ).toBe(true);
});

/**
 * Anchor with its own Press link and the smallest first metadata part,
 * whose label is unique on that part so its summary is findable there.
 */
const pickDetailLinkedAnchor = (partitions: SitemapPartitions) => {
  const candidate = partitions.views.anchors
    .filter((anchor) => Boolean(anchor.livePath))
    .map((anchor) => ({ anchor, part: partitions.metadataFor(anchor.id, 1) }))
    .filter(({ anchor, part }) => uniqueIn(part.nodes, anchor))
    .sort((a, b) => a.part.nodes.length - b.part.nodes.length)[0];
  if (!candidate)
    throw new Error(
      'The snapshot has no linked anchor with a unique label on its first metadata part',
    );
  return candidate.anchor;
};

const sessionNotice = 'Press bağlantıları oturum açmayı gerektirir.';

/** One read of heading, notice, overflow and font facts for the loaded view. */
const readViewFacts = (page: Page, texts: string[]) =>
  page.evaluate((texts) => {
    const shown = (element: Element) =>
      !element.closest('[hidden]') &&
      getComputedStyle(element).visibility === 'visible' &&
      element.getClientRects().length > 0;
    const clean = (element: Element) =>
      (element.textContent ?? '').trim().replace(/\s+/g, ' ');
    const all = [...document.querySelectorAll('body *')];
    const rootSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    return {
      noOverflow: document.documentElement.scrollWidth <= innerWidth,
      tooSmall: all
        .filter(
          (element) =>
            element.textContent?.trim() &&
            element.getClientRects().length &&
            parseFloat(getComputedStyle(element).fontSize) < rootSize,
        )
        .map((element) => element.tagName),
      h1: [...document.querySelectorAll('h1')].filter(shown).map(clean),
      headings: [...document.querySelectorAll('h2, h3')]
        .filter(shown)
        .map(clean),
      visibleTexts: Object.fromEntries(
        texts.map((text) => [
          text,
          all.some((element) => clean(element) === text && shown(element)),
        ]),
      ),
    };
  }, texts);

test('320px sitemap root reading exposes scope and audit notices and navigates a canonical detail link', async ({
  page,
}) => {
  const data = await readSitemap();
  const notices = [
    'İnceleme, işlev testi değildir.',
    sessionNotice,
    ...(data.auditPhase === 'in_progress' ? ['Tarama sürüyor'] : []),
  ];

  await page.goto('./sitemap/');
  const facts = await readViewFacts(page, notices);
  expect(facts.h1).toEqual(['Press panel haritası']);
  expect(facts.headings).toContain('Tarama kapsamı');
  expect(facts.visibleTexts).toEqual(
    Object.fromEntries(notices.map((text) => [text, true])),
  );
  expect(facts.noOverflow, 'root: no page-level horizontal overflow').toBe(
    true,
  );
  expect(facts.tooSmall, 'root: text under 1rem').toEqual([]);
  // Root reaches components through static canonical detail links.
  expect(await page.locator('a[data-page-detail]').count()).toBeGreaterThan(0);

  const anchor = pickRootAnchor(buildSitemapPartitions(data.nodes));
  const detailLink = page.locator(
    `a[data-page-detail="${anchor.id.replace(/["\\]/g, '\\$&')}"]`,
  );
  const canonical = new RegExp(`${escapeRegExp(detailPath(anchor.id, ''))}$`);
  await expect(detailLink).toHaveAttribute('href', canonical);
  await reveal(detailLink);
  await detailLink.click();
  await expect(page).toHaveURL(canonical);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('320px sitemap detail reading exposes its kind, status, source and authenticated Press link without layout overflow', async ({
  page,
}) => {
  const { partitions } = await readPartitions();
  const anchor = pickDetailLinkedAnchor(partitions);
  await page.goto(metadataRoute(anchor.id, 1));
  // A detail's phase line names its anchor kind, not the global audit phase.
  await expect(page.locator('.sitemap-phase')).toHaveText(
    kindLabels[anchor.kind],
  );
  await expect(page.locator('.sitemap-phase')).toBeVisible();
  await openNode(page, anchor.label);
  const anchorSummary = summaryFor(page, anchor.label);
  await expect(
    anchorSummary.getByText(statusLabels[anchor.status], { exact: true }),
  ).toBeVisible();
  await expect(
    anchorSummary.getByText(sourceLabels[anchor.source], { exact: true }),
  ).toBeVisible();
  const link = page
    .locator(`li[data-node-id="${anchor.id.replace(/["\\]/g, '\\$&')}"]`)
    .locator('a[data-live-link]')
    .first();
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute(
    'href',
    /^https:\/\/press\.metaframer\.net\/(?:app|dashboard)(?:\/|$)/,
  );
  const facts = await readViewFacts(page, [sessionNotice]);
  expect(facts.visibleTexts).toEqual({ [sessionNotice]: true });
  expect(
    facts.noOverflow,
    `detail ${anchor.id}: no page-level horizontal overflow`,
  ).toBe(true);
  expect(facts.tooSmall, `detail ${anchor.id}: text under 1rem`).toEqual([]);
});

test('metadata part search keeps ancestors, filters unmatched nodes and preserves query through landscape', async ({
  page,
}) => {
  const { partitions } = await readPartitions();
  const records = (node: SitemapNode) =>
    normalize(node.livePath ?? '').includes('egitimxv1');
  // An owned metadata part whose primary (fully indexed) nodes include both
  // recorded-path matches and non-matches. Lean context indexes only its
  // visible own metadata; its paths are not emitted, so only primary own
  // paths can match this recorded-path query.
  const part = partitions.metadataParts.find((candidate) => {
    const primary = primaryOf(candidate);
    return (
      primary.some(records) &&
      primary.some((node) => !searchableText(node).includes('egitimxv1'))
    );
  });
  expect(
    part,
    'metadata part with egitimxv1 recorded-path matches and non-matches',
  ).toBeDefined();
  const primary = primaryOf(part!);
  // Search indexes each primary record's own livePath, so expected matches
  // come from the snapshot, not from visible text.
  const expectedIds = primary.filter(records).map((node) => node.id);
  const unmatchedId = primary.find(
    (node) => !searchableText(node).includes('egitimxv1'),
  )?.id;
  const emptyMessage = 'Eşleşen öğe bulunamadı.';
  // Vanilla handlers run synchronously within fill, so one read-only
  // evaluate per stage gathers every per-node fact without O(N) RPCs.
  const searchFacts = (ids: string[]) =>
    page.evaluate(
      ({ ids, emptyMessage }) => {
        const shown = (element: Element | null) =>
          Boolean(element) &&
          !element!.closest('[hidden]') &&
          getComputedStyle(element!).visibility === 'visible' &&
          element!.getClientRects().length > 0;
        const items = [
          ...document.querySelectorAll('[data-sitemap] li[data-node-id]'),
        ];
        const byId = new Map(
          items.map((item) => [item.getAttribute('data-node-id'), item]),
        );
        const input = document.querySelector('#sitemap-search');
        return {
          nodes: Object.fromEntries(
            ids.map((id) => {
              const item = byId.get(id);
              return [
                id,
                {
                  exists: Boolean(item),
                  hidden: Boolean(item?.hasAttribute('hidden')),
                  context: Boolean(item?.hasAttribute('data-context')),
                  summaryVisible: shown(
                    item?.querySelector(':scope > details > summary') ?? null,
                  ),
                },
              ];
            }),
          ),
          states: items.map((item) => ({
            hidden: item.hasAttribute('hidden'),
            context: item.hasAttribute('data-context'),
            open: Boolean(
              item.querySelector(':scope > details')?.hasAttribute('open'),
            ),
          })),
          emptyShown: [...document.querySelectorAll('body *')].some(
            (element) =>
              (element.textContent ?? '').trim().replace(/\s+/g, ' ') ===
                emptyMessage && shown(element),
          ),
          unhiddenMessages: [
            ...document.querySelectorAll('.sitemap-filtered-children'),
          ].filter((element) => !element.closest('[hidden]')).length,
          value: (input as HTMLInputElement | null)?.value,
          focused: document.activeElement === input,
          noOverflow: document.documentElement.scrollWidth <= innerWidth,
        };
      },
      { ids, emptyMessage },
    );
  const checkedIds = [...expectedIds, ...(unmatchedId ? [unmatchedId] : [])];

  await page.goto(metadataRoute(part!.anchor.id, part!.part));
  const before = await searchFacts([]);
  const search = page.getByRole('searchbox', { name: searchName });
  await search.fill('zz_unmatched_panel_zz');
  expect((await searchFacts([])).emptyShown, 'unmatched query message').toBe(
    true,
  );
  await search.fill('egitimxv1');
  const matched = await searchFacts(checkedIds);
  expect(matched.emptyShown, 'matching query clears message').toBe(false);
  for (const id of expectedIds)
    expect(matched.nodes[id], `${id} matches egitimxv1`).toEqual({
      exists: true,
      hidden: false,
      context: false,
      summaryVisible: true,
    });
  if (unmatchedId) {
    const fact = matched.nodes[unmatchedId];
    expect(fact.exists, `${unmatchedId} rendered`).toBe(true);
    // Unmatched: hidden, or shown only as an ancestor context.
    expect(fact.hidden || fact.context, `${unmatchedId} unmatched`).toBe(true);
  }

  await search.focus();
  await page.setViewportSize({ width: 568, height: 320 });
  const landscape = await searchFacts([]);
  expect(landscape.value).toBe('egitimxv1');
  expect(landscape.focused, 'search keeps focus through landscape').toBe(true);
  expect(landscape.noOverflow, 'landscape: no horizontal overflow').toBe(true);

  await search.fill('');
  const cleared = await searchFacts([]);
  expect(cleared.value).toBe('');
  expect(cleared.emptyShown).toBe(false);
  expect(cleared.unhiddenMessages, 'no filtered-children message').toBe(0);
  expect(
    cleared.states.filter((state) => state.hidden || state.context),
    'every item visible without context',
  ).toEqual([]);
  expect(
    cleared.states.map((state) => state.open),
    'reader open state restored',
  ).toEqual(before.states.map((state) => state.open));
});

const sourceCases = [
  ['schema_ui', 'Şema üst verisi'],
  ['live_ui', 'Canlı arayüzde görüldü'],
] as const;

test('home metadata part keeps a schema component summary collapsed and names its source', async ({
  page,
}) => {
  const { partitions } = await readPartitions();
  const { part, node: component } = pickHomed(
    partitions,
    'schema component with a unique label on its home part',
    (node) =>
      node.source === 'schema_ui' && !partitions.views.anchorIds.has(node.id),
  );
  await page.goto(metadataRoute(part.anchor.id, part.part));
  const componentSummary = summaryFor(page, component.label);
  await reveal(componentSummary);
  await expect(componentSummary.locator('..')).not.toHaveAttribute('open');
  await expect(componentSummary.getByText('Şema üst verisi')).toBeVisible();
});

for (const [source, label] of sourceCases)
  test(`current metadata part ${source} summary stays collapsed after native reveal and names its source`, async ({
    page,
  }) => {
    const { partitions } = await readPartitions();
    const { part, node } = pickHomed(
      partitions,
      `${source} node with a unique label on its home part`,
      (candidate) => candidate.source === source,
    );
    await page.goto(metadataRoute(part.anchor.id, part.part));
    const summary = summaryFor(page, node.label);
    await reveal(summary);
    await expect(summary.locator('..')).not.toHaveAttribute('open');
    await expect(summary.getByText(label)).toBeVisible();
  });

test('metadata part source filter and source label search keep ancestors as context and restore reader state', async ({
  page,
}) => {
  const { nodes, partitions } = await readPartitions();
  const byId = new Map(nodes.map((node) => [node.id, node]));
  /** Searchable ancestors inside the part, nearest first. */
  const primaryAncestors = (node: SitemapNode, part: MetadataPart) =>
    ancestorIds(node, byId).filter((id) => part.primaryIds.has(id));
  // A real mixed-source part: a unique live_ui primary for the reader, and a
  // schema_ui primary whose primary ancestor is unmatched (so becomes context).
  // It must also render lean metadata context rows; the largest such part.
  const part = partitions.metadataParts
    .filter((candidate) => {
      const primary = primaryOf(candidate);
      return (
        candidate.contextIds.size > 0 &&
        primary.some(
          (node) =>
            node.source === 'live_ui' && uniqueIn(candidate.nodes, node),
        ) &&
        primary.some(
          (node) =>
            node.source === 'schema_ui' &&
            primaryAncestors(node, candidate).some(
              (id) => byId.get(id)!.source !== 'schema_ui',
            ),
        )
      );
    })
    .sort((a, b) => b.nodes.length - a.nodes.length)[0];
  expect(
    part,
    'metadata part mixing live_ui and schema_ui with unmatched ancestor context and lean metadata context rows',
  ).toBeDefined();
  expect(part!.contextIds.size, 'lean metadata context rows').toBeGreaterThan(
    0,
  );
  await page.goto(metadataRoute(part!.anchor.id, part!.part));

  // The reader opens one disclosure natively; clearing filters restores it.
  const chosen = pickNode(
    part!.nodes,
    'live_ui primary node',
    (candidate) =>
      part!.primaryIds.has(candidate.id) && candidate.source === 'live_ui',
  );
  const chosenSummary = summaryFor(page, chosen.label);
  await reveal(chosenSummary);
  await chosenSummary.click();

  const group = page.getByRole('group', {
    name: 'Gözlem kaynağı',
    exact: true,
  });
  const order = await renderedOrder(page, nodes, part!.nodes);
  const orderIds = order.map((node) => node.id);
  expect([...orderIds].sort(), 'part renders exactly its nodes').toEqual(
    part!.nodes.map((node) => node.id).sort(),
  );
  // Buttons come from every node the part renders, lean context included.
  const present = Object.entries(sourceLabels).filter(([source]) =>
    order.some((node) => node.source === source),
  );
  // Vanilla handlers run synchronously within click/fill, so one read-only
  // DOM/ARIA snapshot per stage replaces repeated polling.
  const snapshot = () =>
    page.evaluate(() => {
      const items = [
        ...document.querySelectorAll('[data-sitemap] li[data-node-id]'),
      ];
      return {
        ids: items.map((item) => item.getAttribute('data-node-id')),
        states: items.map((item) => ({
          primary: item.hasAttribute('data-metadata-primary'),
          hidden: item.hasAttribute('hidden'),
          context: item.hasAttribute('data-context'),
          open: Boolean(
            item.querySelector(':scope > details')?.hasAttribute('open'),
          ),
        })),
        count: (
          document.querySelector('[data-sitemap-count]')?.textContent ?? ''
        )
          .trim()
          .replace(/\s+/g, ' '),
        searchValue: (
          document.querySelector('#sitemap-search') as HTMLInputElement | null
        )?.value,
        buttons: [
          ...document.querySelectorAll('button[data-filter="source"]'),
        ].map((button) => [
          button.getAttribute('value'),
          button.textContent?.trim(),
          button.getAttribute('aria-pressed'),
        ]),
      };
    });
  type Snapshot = Awaited<ReturnType<typeof snapshot>>;
  /** Rendered in-part ancestors (primary or lean context), nearest first. */
  const renderedAncestors = (node: SitemapNode) =>
    ancestorIds(node, byId).filter((id) => orderIds.includes(id));
  /**
   * Every rendered row (primary and lean context) is indexed by its own
   * visible text and filtered by its own source: exact matches shown,
   * unmatched rendered ancestors open as context, the rest hidden.
   */
  const mismatches = (
    { states }: Snapshot,
    matches: (node: SitemapNode) => boolean,
  ) => {
    const matched = new Set(order.filter(matches).map((node) => node.id));
    const context = new Set<string>();
    for (const node of order)
      if (matched.has(node.id))
        for (const id of renderedAncestors(node))
          if (!matched.has(id)) context.add(id);
    if (states.length !== order.length)
      return [`rendered ${states.length} of ${order.length} nodes`];
    return order
      .filter((node, index) => {
        const state = states[index];
        if (state.primary !== part!.primaryIds.has(node.id)) return true;
        const isContext = context.has(node.id);
        return (
          state.hidden === (matched.has(node.id) || isContext) ||
          state.context !== isContext ||
          (isContext && !state.open)
        );
      })
      .map((node) => node.id);
  };
  const buttonConfig = (pressed: string | null) =>
    present
      .map(([source, label]) => [
        source,
        label,
        source === pressed ? 'true' : 'false',
      ])
      .sort();

  const initial = await snapshot();
  expect(initial.ids, 'contract-rendered ids').toEqual(orderIds);
  expect(initial.buttons).toHaveLength(present.length);
  expect(initial.buttons.sort()).toEqual(buttonConfig(null));
  expect(mismatches(initial, () => true)).toEqual([]);
  const readerOpen = initial.states.map((state) => state.open);
  expect(readerOpen).toContain(true);
  expect(readerOpen[orderIds.indexOf(chosen.id)]).toBe(true);

  const schema = group.getByRole('button', {
    name: 'Şema üst verisi',
    exact: true,
  });
  await schema.click();
  const filtered = await snapshot();
  expect(filtered.ids).toEqual(orderIds);
  expect(filtered.buttons.sort()).toEqual(buttonConfig('schema_ui'));
  expect(mismatches(filtered, (node) => node.source === 'schema_ui')).toEqual(
    [],
  );
  // Truthful scope: counts every row this part renders, lean context
  // included, not the dataset or other parts.
  expect(filtered.count).toBe(
    `${order.filter((node) => node.source === 'schema_ui').length} eşleşen öğe, bu görünümde ${order.length} öğe.`,
  );

  await schema.click();
  const cleared = await snapshot();
  expect(cleared.ids).toEqual(orderIds);
  expect(cleared.buttons.sort()).toEqual(buttonConfig(null));
  expect(mismatches(cleared, () => true)).toEqual([]);
  expect(cleared.states.map((state) => state.open)).toEqual(readerOpen);

  const search = page.getByRole('searchbox', { name: searchName });
  for (const [source, label] of sourceCases) {
    await search.fill(label);
    const { states, searchValue } = await snapshot();
    expect(searchValue).toBe(label);
    expect(states.length).toBe(order.length);
    expect(
      order
        // Primary and lean context rows both show their own source label.
        .filter(
          (node, index) =>
            node.source === source &&
            (states[index]?.hidden !== false ||
              states[index]?.context !== false),
        )
        .map((node) => node.id),
      `every ${source} node matches its source label`,
    ).toEqual([]);
  }
  await search.fill('');
  const restored = await snapshot();
  expect(restored.searchValue).toBe('');
  expect(restored.ids).toEqual(orderIds);
  expect(restored.buttons.sort()).toEqual(buttonConfig(null));
  expect(mismatches(restored, () => true)).toEqual([]);
  expect(restored.states.map((state) => state.open)).toEqual(readerOpen);
});

test('MAX context rows expose searchable visible labels without duplicating full metadata', async ({
  page,
}) => {
  const { nodes, partitions } = await readPartitions();
  const byId = new Map(nodes.map((node) => [node.id, node]));
  // Largest mixed-source metadata part that renders lean context rows.
  const part = partitions.metadataParts
    .filter(
      (candidate) =>
        candidate.contextIds.size > 0 && mixedSources(candidate.nodes),
    )
    .sort((a, b) => b.nodes.length - a.nodes.length)[0];
  expect(part, 'mixed-source metadata part with context rows').toBeDefined();
  const partIds = new Set(part!.nodes.map((node) => node.id));
  const total = part!.nodes.length;

  // Own rendered search text: primary rows index their full metadata, lean
  // context rows only their visible label, status, source, kind and surface.
  const ownText = (node: SitemapNode) =>
    part!.contextIds.has(node.id)
      ? normalize(
          [
            node.label,
            statusLabels[node.status],
            sourceLabels[node.source],
            kindLabels[node.kind],
            surfaceLabels[node.surface],
          ].join(' '),
        )
      : searchableText(node);
  // Static wording any row may render around its values.
  const boilerplate = normalize(
    [
      'Tür:',
      'Gözlem kaynağı:',
      'Gözlem zamanı:',
      'Saat kaydı yok',
      'UTC',
      'Yol şablonu:',
      'Risk:',
      'çalıştırılmadı',
      'İşlev testi:',
      'Görülen seçenekler:',
      ...Object.values(kindLabels),
      ...Object.values(statusLabels),
      ...Object.values(sourceLabels),
      ...Object.values(surfaceLabels),
      ...Object.values(riskLabels),
      ...Object.values(functionalTestLabels),
    ].join(' '),
  );
  // A context label no other node's full public strings contain.
  const target = part!.nodes.find((node) => {
    if (!part!.contextIds.has(node.id)) return false;
    const query = normalize(node.label.trim());
    return (
      query.length >= 4 &&
      !boilerplate.includes(query) &&
      nodes.every(
        (other) =>
          other.id === node.id || !searchableText(other).includes(query),
      )
    );
  });
  expect(target, 'context row with a uniquely searchable label').toBeDefined();
  const query = target!.label.trim();
  const ancestorsInPart = (node: SitemapNode) =>
    ancestorIds(node, byId).filter((id) => partIds.has(id));

  await page.goto(metadataRoute(part!.anchor.id, part!.part));
  const order = await renderedOrder(page, nodes, part!.nodes);
  const orderIds = order.map((node) => node.id);
  expect([...orderIds].sort(), 'part renders exactly its nodes').toEqual(
    [...partIds].sort(),
  );

  const snapshot = () =>
    page.evaluate(() => {
      const shown = (element: Element | null) =>
        Boolean(element) &&
        !element!.closest('[hidden]') &&
        getComputedStyle(element!).visibility === 'visible' &&
        element!.getClientRects().length > 0;
      const items = [
        ...document.querySelectorAll('[data-sitemap] li[data-node-id]'),
      ];
      const input = document.querySelector(
        '#sitemap-search',
      ) as HTMLInputElement | null;
      return {
        ids: items.map((item) => item.getAttribute('data-node-id')),
        states: items.map((item) => ({
          hidden: item.hasAttribute('hidden'),
          context: item.hasAttribute('data-context'),
          open: Boolean(
            item.querySelector(':scope > details')?.hasAttribute('open'),
          ),
          summaryVisible: shown(
            item.querySelector(':scope > details > summary'),
          ),
        })),
        lean: items
          .filter((item) => item.hasAttribute('data-metadata-context'))
          .map((item) => ({
            id: item.getAttribute('data-node-id'),
            primary: item.hasAttribute('data-metadata-primary'),
            search: item.getAttribute('data-search'),
            fullMetadata: item.querySelectorAll(
              ':scope > details > .sitemap-body > :is(dl.sitemap-meta, .sitemap-notes, .sitemap-options)',
            ).length,
          })),
        count: (
          document.querySelector('[data-sitemap-count]')?.textContent ?? ''
        )
          .trim()
          .replace(/\s+/g, ' '),
        emptyShown: shown(document.querySelector('[data-sitemap-empty]')),
        value: input?.value,
        focused: document.activeElement === input,
        noOverflow: document.documentElement.scrollWidth <= innerWidth,
      };
    });
  type Snapshot = Awaited<ReturnType<typeof snapshot>>;
  /** Matches visible as themselves, their in-part ancestors open as context. */
  const mismatches = ({ states }: Snapshot, matched: Set<string>) => {
    const context = new Set<string>();
    for (const id of matched)
      for (const ancestor of ancestorsInPart(byId.get(id)!))
        if (!matched.has(ancestor)) context.add(ancestor);
    if (states.length !== order.length)
      return [`rendered ${states.length} of ${order.length} nodes`];
    return order
      .filter((node, index) => {
        const state = states[index];
        const shown = matched.has(node.id) || context.has(node.id);
        return (
          state.hidden === shown ||
          state.context !== context.has(node.id) ||
          (context.has(node.id) && !state.open)
        );
      })
      .map((node) => node.id);
  };
  const matchedCount = (matched: number) =>
    `${matched} eşleşen öğe, bu görünümde ${total} öğe.`;

  // Initial view: every row, primary and lean context, is counted.
  const initial = await snapshot();
  expect(initial.ids, 'rendered ids').toEqual(orderIds);
  expect(initial.count).toBe(`Bu görünümde ${total} öğe.`);
  expect(initial.lean.map((row) => row.id).sort(), 'lean context rows').toEqual(
    [...part!.contextIds].sort(),
  );
  expect(
    initial.lean.filter(
      (row) => row.primary || row.search !== '' || row.fullMetadata > 0,
    ),
    'lean context rows without own full metadata or hidden path search',
  ).toEqual([]);

  // The reader opens the target context row natively.
  await openNode(page, target!.label);
  const readerOpen = (await snapshot()).states.map((state) => state.open);
  expect(readerOpen[orderIds.indexOf(target!.id)]).toBe(true);

  const search = page.getByRole('searchbox', { name: searchName });
  await search.fill('zz_unmatched_panel_zz');
  const none = await snapshot();
  expect(none.emptyShown, 'unmatched query message').toBe(true);
  expect(none.count).toBe(matchedCount(0));
  expect(mismatches(none, new Set())).toEqual([]);
  await search.fill('');
  const reset = await snapshot();
  expect(reset.emptyShown).toBe(false);
  expect(mismatches(reset, new Set(orderIds))).toEqual([]);
  expect(reset.count).toBe(`Bu görünümde ${total} öğe.`);

  // The context label matches the context row itself, not as data-context.
  await search.fill(query);
  const expectedQuery = new Set(
    order
      .filter((node) => ownText(node).includes(normalize(query)))
      .map((node) => node.id),
  );
  expect([...expectedQuery], 'only the target owns the label').toEqual([
    target!.id,
  ]);
  const found = await snapshot();
  expect(found.value).toBe(query);
  expect(found.emptyShown).toBe(false);
  expect(found.states[orderIds.indexOf(target!.id)]).toMatchObject({
    hidden: false,
    context: false,
    summaryVisible: true,
  });
  expect(mismatches(found, expectedQuery)).toEqual([]);
  expect(found.count).toBe(matchedCount(1));

  await search.focus();
  await page.setViewportSize({ width: 568, height: 320 });
  const turned = await snapshot();
  expect(turned.value).toBe(query);
  expect(turned.focused, 'search keeps focus through landscape').toBe(true);
  expect(turned.noOverflow, 'landscape: no horizontal overflow').toBe(true);
  expect(mismatches(turned, expectedQuery)).toEqual([]);
  await page.setViewportSize({ width: 320, height: 568 });

  // Source filters match primary and lean context rows by their own source.
  await search.fill('');
  const group = page.getByRole('group', {
    name: 'Gözlem kaynağı',
    exact: true,
  });
  for (const source of new Set(order.map((node) => node.source))) {
    const button = group.getByRole('button', {
      name: sourceLabels[source],
      exact: true,
    });
    await button.click();
    const expected = new Set(
      order.filter((node) => node.source === source).map((node) => node.id),
    );
    const filtered = await snapshot();
    expect(mismatches(filtered, expected), `${source} filter`).toEqual([]);
    expect(filtered.count).toBe(matchedCount(expected.size));
    await button.click();
  }

  await search.fill('');
  const restored = await snapshot();
  expect(restored.value).toBe('');
  expect(restored.ids).toEqual(orderIds);
  expect(mismatches(restored, new Set(orderIds))).toEqual([]);
  expect(restored.count).toBe(`Bu görünümde ${total} öğe.`);
  expect(
    restored.states.map((state) => state.open),
    'reader open state restored',
  ).toEqual(readerOpen);
});

test('search that matches a parent says when its children were filtered out', async ({
  page,
}) => {
  const { nodes, partitions } = await readPartitions();
  const byId = new Map(nodes.map((node) => [node.id, node]));
  // A primary parent in a bounded metadata part with a searchable child in
  // that same part; no lean context above it, so search keeps it in view.
  let parent: SitemapNode | undefined;
  let parentPart: MetadataPart | undefined;
  for (const part of partitions.metadataParts) {
    const primary = primaryOf(part);
    parent = primary.find((node) => {
      if (
        !uniqueIn(part.nodes, node) ||
        ancestorIds(node, byId).some((id) => part.contextIds.has(id))
      )
        return false;
      const query = normalize(node.label.trim());
      const descendants = primary.filter((other) =>
        ancestorIds(other, byId).includes(node.id),
      );
      return (
        query.length >= 4 &&
        descendants.some(
          (child) =>
            ancestorIds(child, byId).find((id) => part.primaryIds.has(id)) ===
            node.id,
        ) &&
        descendants.every((child) => !searchableText(child).includes(query))
      );
    });
    if (parent) {
      parentPart = part;
      break;
    }
  }
  expect(
    parent,
    'metadata part parent with a current-part child never containing its label',
  ).toBeDefined();
  await page.goto(metadataRoute(parentPart!.anchor.id, parentPart!.part));
  expect(await unhiddenFilteredMessages(page)).toBe(0);

  await page.getByRole('searchbox', { name: searchName }).fill(parent!.label);
  const summary = summaryFor(page, parent!.label);
  const item = summary.locator('xpath=../..');
  await expect(item).not.toHaveAttribute('hidden');
  await expect(item).not.toHaveAttribute('data-context');
  await expect(summary).toBeVisible();
  if (!(await summary.locator('..').evaluate((d) => d.hasAttribute('open'))))
    await summary.click();
  // Every descendant is filtered, so the only visible message is the parent's.
  const message = item
    .locator('.sitemap-filtered-children')
    .filter({ visible: true });
  await expect(message).toHaveCount(1);
  await expect(message).toHaveText('Alt öğeler süzüldü.');

  await page.getByRole('searchbox', { name: searchName }).fill('');
  await expect.poll(() => unhiddenFilteredMessages(page)).toBe(0);
});

test('sitemap counts kinds and pages by source from the snapshot without conflating nodes and pages', async ({
  page,
}) => {
  const { nodes } = await readSitemap();
  const pages = nodes.filter((node) => node.kind === 'page');
  await page.goto('./sitemap/');
  await page.locator('details[data-coverage-details] > summary').click();
  await expect(
    page.getByText('Öğe türüne göre', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('.sitemap-lead')).not.toContainText(
    'henüz görülmeyen ekranlar burada yer almaz',
  );
  await expect(
    page.getByText('Sayfa, sekme ve bileşen sayıları ayrı gösterilir.', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(`Toplam ${nodes.length} öğe kaydedildi.`),
  ).toBeVisible();

  const byKind = page.locator('dl[aria-label="Öğe türüne göre"]');
  await expect(byKind).toBeVisible();
  const kinds = await renderedCounts(byKind);
  expectCounts(
    kinds,
    tally(kindLabels, nodes, (node) => node.kind),
  );
  expect(sum(kinds)).toBe(nodes.length);

  const pagesBySource = page.locator(
    'dl[aria-label="Sayfalar gözlem kaynağına göre"]',
  );
  await expect(pagesBySource).toBeVisible();
  const pageSources = await renderedCounts(pagesBySource);
  expectCounts(
    pageSources,
    tally(sourceLabels, pages, (node) => node.source),
  );
  expect(sum(pageSources)).toBe(pages.length);

  // Bounded root may lack one; the global index row carries the badge.
  const isDiscovered = (node: SitemapNode) =>
    node.kind === 'page' && node.status === 'discovered';
  const indexPart = buildSitemapPartitions(nodes).globalIndexParts.find(
    (part) =>
      part.nodes.some(
        (node) => isDiscovered(node) && uniqueIn(part.nodes, node),
      ),
  );
  expect(
    indexPart,
    'global index part with a uniquely labelled discovered page',
  ).toBeDefined();
  const row = indexPart!.nodes.find(
    (node) => isDiscovered(node) && uniqueIn(indexPart!.nodes, node),
  )!;
  await page.goto(indexRoute(indexPart!.part));
  const discovered = summaryFor(page, row.label);
  await reveal(discovered);
  await expect(discovered.locator('..')).not.toHaveAttribute('open');
  await expect(
    discovered.getByText('Keşfedildi, açılmadı', { exact: true }),
  ).toBeVisible();
});

test('sitemap keyboard details and pointer focus stay on controls', async ({
  page,
}) => {
  await page.goto('./sitemap/');
  const summary = page.locator('[data-sitemap-node] > summary').first();
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(summary.locator('..')).toHaveAttribute('open', '');
  const focus = await summary.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      visible: element.matches(':focus-visible'),
      outline: style.outlineStyle,
      shadow: style.boxShadow,
    };
  });
  expect(focus).toEqual({ visible: true, outline: 'solid', shadow: 'none' });
  await page.getByRole('heading', { level: 1 }).click();
  expect(
    await page
      .locator('main')
      .evaluate((element) => getComputedStyle(element).outlineStyle),
  ).toBe('none');
});

/** Route of each document type; filter buttons need a mixed-source view. */
const networkRoute = async (
  view: 'root' | 'detail' | 'index' | 'component',
) => {
  if (view === 'root') return './sitemap/';
  const { partitions } = await readPartitions();
  if (view === 'index') {
    const index = partitions.globalIndexParts.find((part) =>
      mixedSources(part.nodes),
    );
    expect(
      index,
      'published data lacks a global index part with >1 observation sources',
    ).toBeDefined();
    return indexRoute(index!.part);
  }
  const metadata = partitions.metadataParts.find(
    (part) =>
      (view === 'detail' ? part.part === 1 : part.part > 1) &&
      mixedSources(part.nodes),
  );
  expect(
    metadata,
    `published data lacks a ${view === 'detail' ? 'first' : 'later'} metadata part with >1 observation sources`,
  ).toBeDefined();
  return metadataRoute(metadata!.anchor.id, metadata!.part);
};

// Root, first metadata part, global index part and a later metadata part,
// each its own test checked against its own document.
for (const view of ['root', 'detail', 'index', 'component'] as const)
  test(`sitemap ${view} journey requests only the document and its linked stylesheets`, async ({
    page,
    baseURL,
  }) => {
    const route = await networkRoute(view);
    const requests: { url: string; type: string }[] = [];
    page.on('request', (request) =>
      requests.push({ url: request.url(), type: request.resourceType() }),
    );
    await page.goto(route);
    const documentUrl = page.url();

    const search = page.getByRole('searchbox', { name: searchName });
    await search.fill('sites');
    // Bounded root renders only live_ui anchors, so its meaningful filter is
    // surface (Dashboard/Desk); every other view must offer source filters.
    const filterGroup = view === 'root' ? 'Yüzey' : 'Gözlem kaynağı';
    const buttons = page
      .getByRole('group', { name: filterGroup, exact: true })
      .getByRole('button');
    expect(
      await buttons.count(),
      `${view}: ${filterGroup} filter buttons`,
    ).toBeGreaterThan(0);
    const source = buttons.first();
    await source.click();
    await source.click();
    await search.fill('');
    const summary = page.locator('[data-sitemap-node] > summary').first();
    await summary.click();
    await summary.click();
    if (view === 'root') {
      // Native coverage disclosure exposes the JSON download; never clicked.
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
      ).toBe(new URL(jsonPath, documentUrl).href);
      await coverageSummary.click();
      await expect(coverage).not.toHaveAttribute('open');
      await expect(download).toBeHidden();
    }
    // Bounded window: anything an interaction started has been issued by now.
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );

    const stylesheets = await page
      .locator('link[rel~="stylesheet"]')
      .evaluateAll((links: HTMLLinkElement[]) =>
        links.map((link) => link.href),
      );
    const origin = new URL(documentUrl).origin;
    expect(requests.map((request) => request.url)).toContain(documentUrl);
    expect(
      requests.filter((request) => new URL(request.url).origin !== origin),
      'no external-origin request, including Press',
    ).toEqual([]);
    expect(
      requests.filter(
        (request) =>
          request.type === 'script' ||
          new URL(request.url).pathname.endsWith('.json'),
      ),
      'no script bundle or automatic JSON request',
    ).toEqual([]);
    expect(
      requests.filter(
        (request) =>
          request.url !== documentUrl && !stylesheets.includes(request.url),
      ),
      'only the document and its linked stylesheets',
    ).toEqual([]);
  });

/** Root view in portrait and landscape. */
const rootTargets = async (page: Page, minimum: number) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('./sitemap/');
  await revealRootTargets(page);
  await expectTargets(page, minimum, rootKinds);
  await page.setViewportSize({ width: 568, height: 320 });
  await expectTargets(page, minimum, rootKinds);
};

const portrait = { width: 320, height: 568 };
const landscape = { width: 568, height: 320 };

/**
 * Mixed-source fallback-bearing detail at one viewport. Without an explicit
 * minimum, the pointer minimum is read on that detail page itself.
 */
const detailTargetsAtViewport = async (
  page: Page,
  viewport: { width: number; height: number },
  minimum?: number,
) => {
  await page.setViewportSize(viewport);
  await revealDetailTargets(page);
  await expectTargets(
    page,
    minimum ?? (await pointerMinimum(page)),
    detailKinds,
  );
};

/** Mixed-source fallback-bearing detail in portrait and landscape. */
const detailTargets = async (page: Page, minimum: number) => {
  await detailTargetsAtViewport(page, portrait, minimum);
  await detailTargetsAtViewport(page, landscape, minimum);
};

const expectEveryViewTargets = async (page: Page, minimum: number) => {
  await rootTargets(page, minimum);
  await detailTargets(page, minimum);
};

/** Input capability, never width, selects the target size. */
const pointerMinimum = async (page: Page) =>
  (await page.evaluate(() => matchMedia('(any-pointer: coarse)').matches))
    ? 48
    : 44;

test('visible root sitemap targets meet the pointer-specific size without overlap in portrait and landscape', async ({
  page,
}) => {
  await page.goto('./sitemap/');
  await rootTargets(page, await pointerMinimum(page));
});

for (const [name, viewport] of [
  ['portrait 320x568', portrait],
  ['landscape 568x320', landscape],
] as const)
  test(`visible detail sitemap targets meet the pointer-specific size without overlap in ${name}`, async ({
    page,
  }) => {
    await detailTargetsAtViewport(page, viewport);
  });

/**
 * Actual mixed-source global index part (filter buttons render), with one
 * uniquely labelled entry opened natively so its canonical link renders.
 */
const indexTargetsAtViewport = async (
  page: Page,
  viewport: { width: number; height: number },
  minimum?: number,
) => {
  const { partitions } = await readPartitions();
  const part = partitions.globalIndexParts.find(
    (candidate) =>
      mixedSources(candidate.nodes) &&
      candidate.nodes.some((node) => uniqueIn(candidate.nodes, node)),
  );
  expect(
    part,
    'global index part with >1 observation sources and a unique label',
  ).toBeDefined();
  const entry = part!.nodes.find((node) => uniqueIn(part!.nodes, node))!;
  await page.setViewportSize(viewport);
  await page.goto(indexRoute(part!.part));
  await openNode(page, entry.label);
  await expect(
    page.locator(`a[data-page-detail="${entry.id.replace(/["\\]/g, '\\$&')}"]`),
  ).toBeVisible();
  await expectTargets(page, minimum ?? (await pointerMinimum(page)), [
    'breadcrumb',
    'button',
    'detail',
    'input',
    'masthead',
    'summary',
    ...(part!.totalParts > 1 ? ['pagination'] : []),
  ]);
};

for (const [name, viewport] of [
  ['portrait 320x568', portrait],
  ['landscape 568x320', landscape],
] as const)
  test(`visible global index sitemap targets meet the pointer-specific size without overlap in ${name}`, async ({
    page,
  }) => {
    await indexTargetsAtViewport(page, viewport);
  });

test('coarse touch input gives every sitemap target 48 CSS px in portrait and landscape', async ({
  browser,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-320',
    'isMobile touch emulation is Chromium-only; one coarse profile suffices.',
  );
  const context = await browser.newContext({
    ...projectContext(testInfo),
    viewport: { width: 320, height: 568 },
    hasTouch: true,
    isMobile: true,
  });
  try {
    const page = await context.newPage();
    await page.goto('./sitemap/');
    expect(
      await page.evaluate(() => matchMedia('(any-pointer: coarse)').matches),
    ).toBe(true);
    await expectEveryViewTargets(page, 48);
    expect(
      await page.evaluate(() => matchMedia('(any-pointer: coarse)').matches),
    ).toBe(true);
  } finally {
    await context.close();
  }
});

test('coarse touch input gives every global index target 48 CSS px in portrait and landscape', async ({
  browser,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-320',
    'isMobile touch emulation is Chromium-only; one coarse profile suffices.',
  );
  const context = await browser.newContext({
    ...projectContext(testInfo),
    viewport: portrait,
    hasTouch: true,
    isMobile: true,
  });
  try {
    const page = await context.newPage();
    await page.goto('./sitemap/');
    expect(
      await page.evaluate(() => matchMedia('(any-pointer: coarse)').matches),
    ).toBe(true);
    await indexTargetsAtViewport(page, portrait, 48);
    await indexTargetsAtViewport(page, landscape, 48);
    expect(
      await page.evaluate(() => matchMedia('(any-pointer: coarse)').matches),
    ).toBe(true);
  } finally {
    await context.close();
  }
});

/** One no-JS read: script-only controls stay hidden, no filtered message shows. */
const readNoScriptFacts = (page: Page) =>
  page.evaluate(() => {
    const shown = (element: Element | null) =>
      Boolean(element) &&
      getComputedStyle(element!).visibility === 'visible' &&
      element!.getClientRects().length > 0;
    return {
      controlsShown: [
        ...document.querySelectorAll('[data-sitemap-controls]'),
      ].some(shown),
      searchShown: shown(document.querySelector('#sitemap-search')),
      visibleFilterButtons: [
        ...document.querySelectorAll('button[data-filter]'),
      ].filter(shown).length,
      unhiddenMessages: [
        ...document.querySelectorAll('.sitemap-filtered-children'),
      ].filter((element) => !element.closest('[hidden]')).length,
    };
  });
const noScriptBaseline = {
  controlsShown: false,
  searchShown: false,
  visibleFilterButtons: 0,
  unhiddenMessages: 0,
};

const noScriptContext = (
  browser: import('@playwright/test').Browser,
  testInfo: TestInfo,
) =>
  browser.newContext({
    ...projectContext(testInfo),
    javaScriptEnabled: false,
    viewport: { width: 320, height: 568 },
  });

test('sitemap root stays readable without JavaScript and navigates a canonical detail link natively', async ({
  browser,
}, testInfo) => {
  const context = await noScriptContext(browser, testInfo);
  try {
    const baseline = await context.newPage();
    await baseline.goto('./sitemap/');
    await expect(
      baseline.getByRole('heading', {
        level: 1,
        name: 'Press panel haritası',
      }),
    ).toBeVisible();
    expect(await readNoScriptFacts(baseline)).toEqual(noScriptBaseline);

    // Root: canonical static links of top-level anchors work without scripts.
    const { partitions } = await readPartitions();
    const anchor = pickRootAnchor(partitions);
    const detailLink = baseline.locator(
      `a[data-page-detail="${anchor.id.replace(/["\\]/g, '\\$&')}"]`,
    );
    const canonical = new RegExp(`${escapeRegExp(detailPath(anchor.id, ''))}$`);
    await expect(detailLink).toHaveAttribute('href', canonical);
    // Native disclosures, opened by clicking their summaries.
    await reveal(detailLink);
    await detailLink.click();
    await expect(baseline).toHaveURL(canonical);
    await expect(baseline.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await readNoScriptFacts(baseline)).toEqual(noScriptBaseline);
  } finally {
    await context.close();
  }
});

test('sitemap detail opens its recorded Press link through native disclosures without JavaScript', async ({
  browser,
}, testInfo) => {
  const context = await noScriptContext(browser, testInfo);
  try {
    const baseline = await context.newPage();
    const { partitions } = await readPartitions();
    const anchor = pickDetailLinkedAnchor(partitions);
    await baseline.goto(metadataRoute(anchor.id, 1));
    expect(await readNoScriptFacts(baseline)).toEqual(noScriptBaseline);
    await openNode(baseline, anchor.label);
    const liveLink = baseline
      .locator(`li[data-node-id="${anchor.id.replace(/["\\]/g, '\\$&')}"]`)
      .locator('a[data-live-link]')
      .first();
    await expect(liveLink).toBeVisible();
    await expect(liveLink).toHaveAttribute(
      'href',
      /^https:\/\/press\.metaframer\.net\/(?:app|dashboard)(?:\/|$)/,
    );
  } finally {
    await context.close();
  }
});
