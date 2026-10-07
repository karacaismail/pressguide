import { readdir, readFile } from 'node:fs/promises';
import { posix, sep } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import {
  kindLabels,
  sourceLabels,
  validateSitemap,
  type SitemapNode,
} from '../src/sitemap';
import {
  INDEX_LIMIT,
  METADATA_LIMIT,
  buildSitemapPartitions,
  childIndexPath,
  globalIndexPath,
  metadataPath,
} from '../src/sitemap-partitions';

const dataPath = 'src/data/press-sitemap.json';
const distSitemap = 'dist/sitemap';

test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-320',
    'Built HTML partition checks run once; route journeys cover every project.',
  );
});

/** Short, readable list failures: count plus the first ids. */
const report = (ids: string[]) => ({
  count: ids.length,
  sample: ids.slice(0, 20),
});
const none = { count: 0, sample: [] };

/** Built file for a base-less sitemap path, mirroring scripts/serve.mjs. */
const fileOf = (path: string) =>
  posix.join(decodeURIComponent(path.slice('/sitemap/'.length)), 'index.html');

/** Reviewed JSON through the publication boundary and its expected partition. */
const loadData = async () => {
  const nodes = validateSitemap(
    JSON.parse(await readFile(dataPath, 'utf8')),
  ).nodes;
  const partitions = buildSitemapPartitions(nodes);
  const { byId, anchorIds, ownerById } = partitions.views;
  const ancestors = (node: SitemapNode) => {
    const chain: SitemapNode[] = [];
    let current = node.parentId ? byId.get(node.parentId) : undefined;
    while (current) {
      chain.unshift(current);
      current = current.parentId ? byId.get(current.parentId) : undefined;
    }
    return chain;
  };
  /** Component metadata: owned by an anchor without being one. */
  const isComponent = (node: SitemapNode) =>
    !anchorIds.has(node.id) && ownerById.has(node.id);

  // Every document the partition promises, keyed by built file.
  type Expected =
    | { type: 'root' }
    | { type: 'metadata'; anchorId: string; part: number }
    | { type: 'index'; ownerId: string | null; part: number };
  const expected = new Map<string, Expected>([
    ['index.html', { type: 'root' }],
  ]);
  for (const part of partitions.metadataParts)
    expected.set(fileOf(metadataPath(part.anchor.id, part.part, '')), {
      type: 'metadata',
      anchorId: part.anchor.id,
      part: part.part,
    });
  for (const part of [
    ...partitions.globalIndexParts,
    ...partitions.childIndexParts,
  ])
    expected.set(
      fileOf(
        part.ownerId
          ? childIndexPath(part.ownerId, part.part, '')
          : globalIndexPath(part.part, ''),
      ),
      { type: 'index', ownerId: part.ownerId, part: part.part },
    );
  /** Built file holding a node's full metadata; unowned context lives on root. */
  const homePath = (id: string) => {
    const home = partitions.homeById.get(id);
    return home ? metadataPath(home.anchorId, home.part, '') : '/sitemap/';
  };
  const homeFile = (id: string) => fileOf(homePath(id));
  return {
    nodes,
    byId,
    anchorIds,
    ownerById,
    partitions,
    ancestors,
    isComponent,
    expected,
    homePath,
    homeFile,
  };
};

/**
 * Every built sitemap HTML file, read once in Node and parsed in one browser
 * call without running scripts.
 */
const parseAll = async (page: Page) => {
  const files = (await readdir(distSitemap, { recursive: true }))
    .map((file) => file.split(sep).join('/'))
    .filter((file) => file.endsWith('.html'));
  const sources = await Promise.all(
    files.map(
      async (file) =>
        [file, await readFile(`${distSitemap}/${file}`, 'utf8')] as const,
    ),
  );
  return page.evaluate(
    ({ sources, pageLabel }) => {
      const parser = new DOMParser();
      const body = ':scope > details > .sitemap-body';
      return Object.fromEntries(
        sources.map(([file, source]) => {
          const doc = parser.parseFromString(source, 'text/html');
          const counts: Record<string, Record<string, string>> = {};
          for (const list of doc.querySelectorAll('dl.sitemap-counts'))
            counts[list.getAttribute('aria-label') ?? ''] = Object.fromEntries(
              [...list.querySelectorAll('dt')].map((term) => [
                term.textContent?.trim().replace(/:$/, '') ?? '',
                term.nextElementSibling?.textContent?.trim() ?? '',
              ]),
            );
          return [
            file,
            {
              items: [...doc.querySelectorAll('[data-node-id]')].map(
                (element) => ({
                  id: element.getAttribute('data-node-id')!,
                  kind: element.getAttribute('data-kind'),
                  source: element.getAttribute('data-source'),
                  status: element.getAttribute('data-status'),
                  // Own metadata only, never a descendant's.
                  risk:
                    element
                      .querySelector(`${body} > dl.sitemap-meta [data-risk]`)
                      ?.getAttribute('data-risk') ?? null,
                  primary: element.hasAttribute('data-metadata-primary'),
                  context: element.hasAttribute('data-metadata-context'),
                  ownDetails: element.querySelectorAll(
                    `${body} > dl, ${body} > .sitemap-notes, ${body} > .sitemap-options`,
                  ).length,
                  homeHref:
                    element
                      .querySelector(`${body} > a.sitemap-link[href]`)
                      ?.getAttribute('href') ?? null,
                }),
              ),
              detailLinks: [...doc.querySelectorAll('a[data-page-detail]')].map(
                (link) => ({
                  id: link.getAttribute('data-page-detail')!,
                  href: link.getAttribute('href') ?? '',
                }),
              ),
              childIndexLinks: [
                ...doc.querySelectorAll('a[data-child-index]'),
              ].map((link) => link.getAttribute('href') ?? ''),
              paginationLinks: [
                ...doc.querySelectorAll('[data-sitemap-pagination] a[href]'),
              ].length,
              hrefs: [...doc.querySelectorAll('a[href]')].map((link) =>
                link.getAttribute('href')!,
              ),
              preloads: [...doc.querySelectorAll('link[href]')]
                .filter((link) =>
                  /\b(?:prefetch|prerender|preload|modulepreload)\b/i.test(
                    link.getAttribute('rel') ?? '',
                  ),
                )
                .map((link) => link.getAttribute('href')!),
              counts,
              pageCount:
                [...doc.querySelectorAll('dl.sitemap-counts dt')]
                  .find((term) => term.textContent?.trim() === `${pageLabel}:`)
                  ?.nextElementSibling?.textContent?.trim() ?? null,
              text:
                file === 'index.html'
                  ? (doc.body?.textContent ?? '').replace(/\s+/g, ' ')
                  : '',
            },
          ];
        }),
      );
    },
    { sources, pageLabel: kindLabels.page },
  );
};

type Parsed = Awaited<ReturnType<typeof parseAll>>[string];
type Doc = Parsed & {
  file: string;
  url: string;
  itemById: Map<string, Parsed['items'][number]>;
};

/**
 * Follows static sitemap links from the built root, the way a reader
 * without the JSON download would. Press, JSON and hash-only links are
 * ignored; only reached documents count.
 */
const crawl = async (page: Page, baseURL: string | undefined) => {
  const sitemapUrl = new URL('sitemap/', baseURL);
  const fileFor = (url: URL) =>
    url.origin === sitemapUrl.origin &&
    url.pathname.startsWith(sitemapUrl.pathname) &&
    url.pathname.endsWith('/')
      ? posix.join(
          decodeURIComponent(url.pathname.slice(sitemapUrl.pathname.length)),
          'index.html',
        )
      : undefined;
  const parsed = await parseAll(page);
  const produced = new Set(Object.keys(parsed));

  const docs = new Map<string, Doc>();
  const missing: string[] = [];
  const queued = new Set(['index.html']);
  const queue: [string, string][] = [['index.html', sitemapUrl.href]];
  while (queue.length > 0) {
    const [file, url] = queue.shift()!;
    const doc = parsed[file];
    docs.set(file, {
      ...doc,
      file,
      url,
      itemById: new Map(doc.items.map((item) => [item.id, item])),
    });
    for (const href of doc.hrefs) {
      const target = new URL(href, url);
      const next = fileFor(target);
      if (!next || queued.has(next)) continue;
      queued.add(next);
      if (!produced.has(next)) {
        missing.push(`${file} -> ${href}`);
        continue;
      }
      target.hash = '';
      target.search = '';
      queue.push([next, target.href]);
    }
  }
  return {
    sitemapUrl,
    produced,
    docs,
    missing,
    root: docs.get('index.html')!,
    /** Canonical href of a base-less sitemap path under the served base. */
    canonical: (path: string) =>
      `${sitemapUrl.pathname}${path.slice('/sitemap/'.length)}`,
  };
};

test('every reviewed node id is reachable through statically linked sitemap documents', async ({
  page,
  request,
  baseURL,
}) => {
  const { nodes, expected } = await loadData();

  // The parsed files are the build the server delivers, not a stale copy.
  const served = await request.get('sitemap/');
  expect(served.ok()).toBe(true);
  expect(
    await served.text(),
    'served root equals dist/sitemap/index.html',
  ).toBe(await readFile(`${distSitemap}/index.html`, 'utf8'));

  const { docs, produced, missing, sitemapUrl, root, canonical } = await crawl(
    page,
    baseURL,
  );
  expect(
    report(missing),
    'static sitemap links without a built document',
  ).toEqual(none);
  expect(
    report([...produced].filter((file) => !docs.has(file))),
    'built sitemap documents unreachable from the root',
  ).toEqual(none);
  expect(
    report([...expected.keys()].filter((file) => !produced.has(file))),
    'partition documents not built',
  ).toEqual(none);
  expect(
    report([...produced].filter((file) => !expected.has(file))),
    'built documents outside the partition',
  ).toEqual(none);
  expect(docs.size, 'root plus reachable documents').toBeGreaterThan(1);

  // Root links to the first global anchor index.
  expect(
    root.hrefs.map((href) => new URL(href, root.url).pathname),
    'root link to the global anchor index',
  ).toContain(canonical(globalIndexPath(1, '')));

  // Ids actually rendered in reachable documents.
  const shown = new Set(
    [...docs.values()].flatMap((doc) => doc.items.map((item) => item.id)),
  );
  expect(
    report(nodes.filter((node) => !shown.has(node.id)).map((node) => node.id)),
    'source node ids missing from reachable documents',
  ).toEqual(none);
  const known = new Set(nodes.map((node) => node.id));
  expect(
    report([...shown].filter((id) => !known.has(id))),
    'rendered ids absent from reviewed data',
  ).toEqual(none);

  // Documents load on demand: none preloads another document or the JSON.
  expect(
    report(
      [...docs.values()].flatMap((doc) =>
        doc.preloads
          .filter((href) => {
            const target = new URL(href, doc.url);
            return (
              target.pathname.startsWith(sitemapUrl.pathname) ||
              target.pathname.endsWith('.json')
            );
          })
          .map((href) => `${doc.file} preloads ${href}`),
      ),
    ),
    'automatic fetch of other documents',
  ).toEqual(none);

  // Fixed neighbours only, never a list of every part.
  expect(
    report(
      [...docs.values()]
        .filter((doc) => doc.paginationLinks > 4)
        .map((doc) => `${doc.file}: ${doc.paginationLinks}`),
    ),
    'pagination beyond first/previous/next/last',
  ).toEqual(none);
});

test('each node has full metadata only in its reachable home part; other parts carry lean context', async ({
  page,
  baseURL,
}) => {
  const { nodes, byId, partitions, expected, homePath, homeFile, isComponent } =
    await loadData();
  const { root, docs, canonical } = await crawl(page, baseURL);

  const missingHome: string[] = [];
  const wrongMetadata: string[] = [];
  const notPrimary: string[] = [];
  for (const node of nodes) {
    const file = homeFile(node.id);
    const item = docs.get(file)?.itemById.get(node.id);
    if (!item) {
      missingHome.push(`${node.id} @ ${file}`);
      continue;
    }
    if (file === 'index.html') continue; // unowned navigation context
    if (!item.primary) notPrimary.push(`${node.id} @ ${file}`);
    if (item.source !== node.source || item.risk !== node.risk)
      wrongMetadata.push(`${node.id}: ${item.source}/${item.risk}`);
  }
  expect(report(missingHome), 'nodes missing from reachable home part').toEqual(
    none,
  );
  expect(report(notPrimary), 'home part item without full metadata').toEqual(
    none,
  );
  expect(report(wrongMetadata), 'source/risk in home part').toEqual(none);

  // Each metadata part renders exactly its anchor, segment and context.
  const wrongSet: string[] = [];
  const foreignPrimary: string[] = [];
  const fatContext: string[] = [];
  const contextHome: string[] = [];
  const oversized: string[] = [];
  const childIndex: string[] = [];
  for (const [file, kind] of expected) {
    if (kind.type !== 'metadata') continue;
    const doc = docs.get(file);
    if (!doc) continue; // reported by the reachability test
    const part = partitions.metadataFor(kind.anchorId, kind.part);
    const ids = new Set(part.nodes.map((node) => node.id));
    for (const item of doc.items)
      if (!ids.has(item.id)) wrongSet.push(`${item.id} on ${file}`);
    for (const id of ids)
      if (!doc.itemById.has(id)) wrongSet.push(`${id} missing on ${file}`);
    const primary = doc.items.filter((item) => item.primary);
    if (primary.length > METADATA_LIMIT + 1)
      oversized.push(`${file}: ${primary.length}`);
    for (const item of primary)
      if (homeFile(item.id) !== file && item.id !== kind.anchorId)
        foreignPrimary.push(`${item.id} on ${file}`);
    for (const item of doc.items.filter((item) => item.context)) {
      if (item.ownDetails > 0) fatContext.push(`${item.id} on ${file}`);
      if (
        !item.homeHref ||
        new URL(item.homeHref, doc.url).pathname !==
          canonical(homePath(item.id))
      )
        contextHome.push(`${item.id} on ${file}: ${item.homeHref}`);
    }
    // Owning detail links only to the first child index part.
    const children = partitions.childrenFor(kind.anchorId);
    const links = doc.childIndexLinks.map(
      (href) => new URL(href, doc.url).pathname,
    );
    const first =
      children.length > 0
        ? [canonical(childIndexPath(kind.anchorId, 1, ''))]
        : [];
    if (kind.part === 1 && JSON.stringify(links) !== JSON.stringify(first))
      childIndex.push(`${file}: ${links.join(', ')}`);
  }
  expect(report(wrongSet), 'metadata part items differ from partition').toEqual(
    none,
  );
  expect(report(foreignPrimary), 'full metadata outside home part').toEqual(
    none,
  );
  expect(report(oversized), `parts above ${METADATA_LIMIT} + anchor`).toEqual(
    none,
  );
  expect(report(fatContext), 'context items with notes/options/DL').toEqual(
    none,
  );
  expect(report(contextHome), 'context items without home link').toEqual(none);
  expect(report(childIndex), 'child index link on canonical detail').toEqual(
    none,
  );

  // Component metadata never sits on root.
  expect(
    report(
      root.items
        .filter((item) => {
          const node = byId.get(item.id);
          return node && isComponent(node);
        })
        .map((item) => item.id),
    ),
    'component metadata eagerly on root',
  ).toEqual(none);

  // Index parts list their anchors flat, with canonical links, no metadata.
  const wrongIndex: string[] = [];
  for (const part of [
    ...partitions.globalIndexParts,
    ...partitions.childIndexParts,
  ]) {
    const file = fileOf(
      part.ownerId
        ? childIndexPath(part.ownerId, part.part, '')
        : globalIndexPath(part.part, ''),
    );
    const doc = docs.get(file);
    if (!doc) continue;
    if (part.nodes.length > INDEX_LIMIT)
      wrongIndex.push(`${file}: ${part.nodes.length} entries`);
    const ids = part.nodes.map((node) => node.id);
    if (
      JSON.stringify(doc.items.map((item) => item.id)) !== JSON.stringify(ids)
    )
      wrongIndex.push(`${file}: items differ`);
    for (const item of doc.items)
      if (item.risk !== null || item.ownDetails > 0)
        wrongIndex.push(`${item.id} metadata on ${file}`);
    const links = new Map(doc.detailLinks.map((link) => [link.id, link.href]));
    for (const id of ids)
      if (
        new URL(links.get(id) ?? '#', doc.url).pathname !==
        canonical(metadataPath(id, 1, ''))
      )
        wrongIndex.push(`${id} detail link on ${file}`);
  }
  expect(report(wrongIndex), 'index parts').toEqual(none);
});

test('navigation sections without a page ancestor get canonical detail anchors that own their components', async ({
  page,
  baseURL,
}) => {
  const {
    nodes,
    byId,
    ancestors,
    ownerById,
    isComponent,
    partitions,
    homeFile,
  } = await loadData();
  const orphans = nodes.filter(
    (node) =>
      isComponent(node) && !ancestors(node).some((a) => a.kind === 'page'),
  );
  expect(
    orphans.length,
    'reviewed data has components outside any page',
  ).toBeGreaterThan(0);
  const anchors = [
    ...new Set(orphans.map((node) => byId.get(ownerById.get(node.id)!)!)),
  ];

  const { root, docs, canonical } = await crawl(page, baseURL);

  // Every static detail link anywhere uses the canonical href.
  const wrongHref = [...docs.values()].flatMap((doc) =>
    doc.detailLinks
      .filter(
        (link) =>
          new URL(link.href, doc.url).pathname !==
          canonical(metadataPath(link.id, 1, '')),
      )
      .map((link) => `${link.id} on ${doc.file}: ${link.href}`),
  );
  expect(report(wrongHref), 'non-canonical detail links').toEqual(none);

  // Section anchors stay sections, linked from a reachable root/index document.
  const linked = new Set(
    [...docs.values()].flatMap((doc) => doc.detailLinks.map((link) => link.id)),
  );
  const problems: string[] = [];
  for (const anchor of anchors) {
    if (anchor.kind !== 'section')
      problems.push(`${anchor.id} is ${anchor.kind}`);
    if (!linked.has(anchor.id)) problems.push(`${anchor.id} unlinked`);
    if (!docs.has(fileOf(metadataPath(anchor.id, 1, ''))))
      problems.push(`${anchor.id} detail unreachable`);
  }
  expect(report(problems), 'page-less section anchors').toEqual(none);

  // Root shows only top-level anchors and unowned context, linking its anchors.
  const rootIds = partitions.rootNodes.map((node) => node.id);
  expect(
    report(
      root.items.map((item) => item.id).filter((id) => !rootIds.includes(id)),
    ),
    'root items outside top-level navigation',
  ).toEqual(none);
  expect(
    report(rootIds.filter((id) => !root.itemById.has(id))),
    'top-level navigation missing on root',
  ).toEqual(none);
  const rootLinks = new Set(root.detailLinks.map((link) => link.id));
  expect(
    report(
      rootIds.filter(
        (id) => partitions.views.anchorIds.has(id) && !rootLinks.has(id),
      ),
    ),
    'root anchors without detail link',
  ).toEqual(none);

  // Orphan components sit in their anchor's home part with source/risk.
  const misplaced: string[] = [];
  for (const node of orphans) {
    const item = docs.get(homeFile(node.id))?.itemById.get(node.id);
    if (!item || item.source !== node.source || item.risk !== node.risk)
      misplaced.push(node.id);
  }
  expect(report(misplaced), 'orphan components in home part').toEqual(none);

  // Known navigation section: its tabs’ actions and fields live in its parts.
  const site = byId.get('dashboard-site');
  if (site && partitions.views.anchorIds.has(site.id)) {
    const siteParts = new Set(
      partitions.metadataParts
        .filter((part) => part.anchor.id === site.id)
        .map((part) => fileOf(metadataPath(site.id, part.part, ''))),
    );
    const tabMetadata = nodes.filter(
      (node) =>
        ['action', 'field'].includes(node.kind) &&
        ownerById.get(node.id) === site.id &&
        ancestors(node).some(
          (ancestor) =>
            ancestor.kind === 'tab' && ancestor.parentId === site.id,
        ),
    );
    expect(
      report(
        tabMetadata
          .filter(
            (node) =>
              !siteParts.has(homeFile(node.id)) ||
              !docs.get(homeFile(node.id))?.itemById.get(node.id)?.primary,
          )
          .map((node) => node.id),
      ),
      'dashboard-site tab actions and fields in its parts',
    ).toEqual(none);
  }
});

test('section anchors keep their kind and do not count as extra Press pages', async ({
  page,
  baseURL,
}) => {
  const { nodes, byId, anchorIds } = await loadData();
  const pages = nodes.filter((node) => node.kind === 'page');
  expect(pages.length).toBeGreaterThan(0);
  const { root, docs } = await crawl(page, baseURL);

  // Full snapshot counts stay exact on the bounded root.
  expect(root.pageCount, `rendered “${kindLabels.page}” count`).toBe(
    String(pages.length),
  );
  expect(root.text).toContain(`Toplam ${nodes.length} öğe`);
  const byKind = root.counts['Öğe türüne göre'] ?? {};
  for (const [kind, label] of Object.entries(kindLabels)) {
    const count = nodes.filter((node) => node.kind === kind).length;
    if (count > 0)
      expect.soft(byKind[label], `${label} count`).toBe(String(count));
  }
  const pagesBySource = root.counts['Sayfalar gözlem kaynağına göre'] ?? {};
  for (const [source, label] of Object.entries(sourceLabels))
    expect
      .soft(pagesBySource[label], `pages from ${label}`)
      .toBe(String(pages.filter((node) => node.source === source).length));

  // Detail links anywhere point only to pages or navigation sections.
  const linkIds = [
    ...new Set(
      [...docs.values()].flatMap((doc) => doc.detailLinks.map((l) => l.id)),
    ),
  ];
  expect(
    linkIds.filter((id) => byId.get(id)?.kind === 'page').length,
    'reachable detail links to Press pages',
  ).toBe(pages.length);
  expect(
    report(
      linkIds.filter((id) => {
        const node = byId.get(id);
        return (
          !node ||
          !anchorIds.has(id) ||
          (node.kind !== 'page' && node.kind !== 'section')
        );
      }),
    ),
    'detail links that are neither pages nor navigation sections',
  ).toEqual(none);

  // No document relabels a node, so anchors never render as pages.
  const relabelled = [...docs.values()].flatMap((doc) =>
    doc.items
      .filter((item) => {
        const node = byId.get(item.id);
        return node && item.kind !== null && item.kind !== node.kind;
      })
      .map((item) => `${item.id}: ${item.kind} on ${doc.file}`),
  );
  expect(report(relabelled), 'rendered kind differs from data').toEqual(none);
});
