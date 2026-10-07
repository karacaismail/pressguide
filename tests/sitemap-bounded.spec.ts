import { readdir, readFile } from 'node:fs/promises';
import { posix } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { validateSitemap, type SitemapNode } from '../src/sitemap';

/**
 * Bounded static sitemap partition (work/qa/sitemap-review-fixes/
 * bounded-partition-contract.md). Expectations are derived here from the
 * validated snapshot, independently of src/sitemap-views.ts. Row limits are
 * starting implementation limits, not an accepted performance budget.
 *
 * Built HTML is read once per worker from Node, parsed in batched
 * page.evaluate calls, and failures are aggregated into bounded reports
 * (count + first 20) so thousands of documents stay within the timeout.
 */
const dataPath = 'src/data/press-sitemap.json';
const distSitemap = 'dist/sitemap';
const INDEX_LIMIT = 50;
const METADATA_LIMIT = 32;
const PARSE_BATCH = 200;

const report = (items: string[]) => ({
  count: items.length,
  sample: items.slice(0, 20),
});
const none = { count: 0, sample: [] };
const chunk = <T>(list: T[], size: number) =>
  Array.from({ length: Math.ceil(list.length / size) }, (_, i) =>
    list.slice(i * size, (i + 1) * size),
  );
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const loadModel = async () => {
  const nodes = validateSitemap(
    JSON.parse(await readFile(dataPath, 'utf8')),
  ).nodes;
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const order = new Map(nodes.map((node, i) => [node.id, i]));
  const ancestorCache = new Map<string, SitemapNode[]>();
  const ancestors = (node: SitemapNode): SitemapNode[] => {
    const cached = ancestorCache.get(node.id);
    if (cached) return cached;
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    const chain = parent ? [...ancestors(parent), parent] : [];
    ancestorCache.set(node.id, chain);
    return chain;
  };
  const isAnchor = (node: SitemapNode) =>
    node.kind === 'page' ||
    (node.kind === 'section' &&
      !ancestors(node).some((a) => a.kind === 'page'));
  const anchors = nodes.filter(isAnchor);
  const anchorIds = new Set(anchors.map((node) => node.id));
  /** Nearest strict anchor ancestor. */
  const parentAnchor = (node: SitemapNode) =>
    ancestors(node)
      .filter((a) => anchorIds.has(a.id))
      .at(-1)?.id;
  /** Owner: itself if anchor; else nearest page; else nearest anchor. */
  const owner = (node: SitemapNode) => {
    if (anchorIds.has(node.id)) return node.id;
    const chain = ancestors(node);
    return (
      chain.filter((a) => a.kind === 'page').at(-1) ??
      chain.filter((a) => anchorIds.has(a.id)).at(-1)
    )?.id;
  };
  const topAnchors = anchors.filter((node) => !parentAnchor(node));
  const unowned = nodes.filter((node) => !owner(node));
  const rootIds = new Set([...topAnchors, ...unowned].map((node) => node.id));

  const owned = new Map<string, SitemapNode[]>();
  for (const node of nodes) {
    const home = owner(node);
    if (!home || anchorIds.has(node.id)) continue;
    const list = owned.get(home);
    if (list) list.push(node);
    else owned.set(home, [node]);
  }
  const parts = (anchorId: string) =>
    chunk(owned.get(anchorId) ?? [], METADATA_LIMIT);
  /** 1-based metadata part holding the node's full metadata. */
  const homePart = new Map<string, { anchor: string; part: number }>();
  for (const anchor of anchors)
    homePart.set(anchor.id, { anchor: anchor.id, part: 1 });
  for (const [anchor, list] of owned)
    list.forEach((node, i) =>
      homePart.set(node.id, {
        anchor,
        part: Math.floor(i / METADATA_LIMIT) + 1,
      }),
    );
  const children = new Map<string, SitemapNode[]>();
  for (const anchor of anchors) {
    const parent = parentAnchor(anchor);
    if (!parent) continue;
    const list = children.get(parent);
    if (list) list.push(anchor);
    else children.set(parent, [anchor]);
  }
  const childAnchors = (anchorId: string) => children.get(anchorId) ?? [];
  return {
    nodes,
    byId,
    order,
    anchors,
    anchorIds,
    topAnchors,
    rootIds,
    owned,
    parts,
    homePart,
    childAnchors,
  };
};

const enc = encodeURIComponent;
/** Relative to dist/sitemap; '' is the root, directories end with '/'. */
const metadataKey = (anchor: string, part: number) =>
  part === 1 ? `${anchor}/` : `${anchor}/components/${part}/`;
const metadataPath = (anchor: string, part: number) =>
  part === 1
    ? `sitemap/${enc(anchor)}/`
    : `sitemap/${enc(anchor)}/components/${part}/`;

let builtCache: Promise<Map<string, string>> | undefined;
/** Every built sitemap HTML file, keyed by decoded directory path. */
const readBuilt = () =>
  (builtCache ??= (async () => {
    const entries = await readdir(distSitemap, { recursive: true });
    const files = entries
      .map((entry) => entry.split('\\').join('/'))
      .filter(
        (entry) => entry === 'index.html' || entry.endsWith('/index.html'),
      );
    const html = await Promise.all(
      files.map((file) => readFile(posix.join(distSitemap, file), 'utf8')),
    );
    return new Map(
      files.map((file, i) => [file.slice(0, -'index.html'.length), html[i]]),
    );
  })());

type Parsed = Awaited<ReturnType<typeof parseBatch>>[number];

/** Built HTML parsed without running its scripts, many documents per call. */
const parseBatch = (page: Page, sources: string[]) =>
  page.evaluate((sources) => {
    const parser = new DOMParser();
    return sources.map((source) => {
      const doc = parser.parseFromString(source, 'text/html');
      /** Metadata group owned by this node, never a descendant's. */
      const ownMeta = (el: Element) =>
        [...el.querySelectorAll('.sitemap-meta')].find(
          (meta) => meta.closest('[data-node-id]') === el,
        ) ?? null;
      const attr = (meta: Element, el: Element, name: string) => {
        const holder = meta.matches(`[${name}]`)
          ? meta
          : [...meta.querySelectorAll(`[${name}]`)].find(
              (x) => x.closest('[data-node-id]') === el,
            );
        return (
          holder?.getAttribute(name) ??
          (el.matches(`[${name}]`) ? el.getAttribute(name) : null)
        );
      };
      return {
        ids: [...doc.querySelectorAll('[data-node-id]')].map((el) =>
          el.getAttribute('data-node-id')!,
        ),
        primary: [
          ...doc.querySelectorAll('[data-node-id][data-metadata-primary]'),
        ].map((el) => {
          const meta = ownMeta(el);
          return {
            id: el.getAttribute('data-node-id')!,
            source: meta ? attr(meta, el, 'data-source') : null,
            risk: meta ? attr(meta, el, 'data-risk') : null,
          };
        }),
        context: [
          ...doc.querySelectorAll(
            '[data-node-id]:not([data-metadata-primary])',
          ),
        ].map((el) => ({
          id: el.getAttribute('data-node-id')!,
          hasMeta: ownMeta(el) !== null,
          hrefs: [...el.querySelectorAll('a[href]')]
            .filter((a) => a.closest('[data-node-id]') === el)
            .map((a) => a.getAttribute('href')!),
        })),
        detailLinks: [...doc.querySelectorAll('a[data-page-detail]')].map(
          (a) => ({
            id: a.getAttribute('data-page-detail')!,
            href: a.getAttribute('href') ?? '',
          }),
        ),
        metadataGroups: doc.querySelectorAll('.sitemap-meta').length,
        next: doc.querySelector('a[rel~="next"]')?.getAttribute('href') ?? null,
        prev: doc.querySelector('a[rel~="prev"]')?.getAttribute('href') ?? null,
        hrefs: [...doc.querySelectorAll('a[href]')].map((a) =>
          a.getAttribute('href')!,
        ),
        scripts: [
          ...doc.querySelectorAll('script[src], link[rel~="modulepreload"]'),
        ].map((el) => el.getAttribute('src') ?? el.getAttribute('href')!),
      };
    });
  }, sources);

/** Parse the requested built documents (all when keys omitted). */
const parseBuilt = async (page: Page, keys?: string[]) => {
  const built = await readBuilt();
  const wanted = (keys ?? [...built.keys()]).filter((key) => built.has(key));
  const parsed = new Map<string, Parsed>();
  for (const batch of chunk(wanted, PARSE_BATCH)) {
    const result = await parseBatch(
      page,
      batch.map((key) => built.get(key)!),
    );
    batch.forEach((key, i) => parsed.set(key, result[i]));
  }
  return parsed;
};

const builtOnly = (projectName: string) =>
  test.skip(projectName !== 'chromium-320', 'Pure built-HTML checks run once.');

test.describe('bounded built partition', () => {
  test.beforeEach(({}, testInfo) => builtOnly(testInfo.project.name));

  test('root renders only top-level anchors and unowned navigation context', async ({
    page,
  }) => {
    const { rootIds, topAnchors, anchors, byId } = await loadModel();
    expect(topAnchors.length).toBeGreaterThan(0);
    expect(topAnchors.length, 'some anchors are nested').toBeLessThan(
      anchors.length,
    );
    const root = (await parseBuilt(page, ['']).then((m) => m.get('')))!;
    expect(root, 'built root').toBeDefined();
    const rendered = new Set(root.ids);
    expect(
      report([...rendered].filter((id) => !rootIds.has(id))),
      'root ids beyond top anchors/unowned context',
    ).toEqual(none);
    expect(
      report([...rootIds].filter((id) => !rendered.has(id))),
      'expected root ids missing',
    ).toEqual(none);
    expect(root.metadataGroups, 'no field metadata on root').toBe(0);
    expect(
      report(
        topAnchors
          .filter(
            (anchor) =>
              !root.detailLinks.some(
                (l) =>
                  l.id === anchor.id &&
                  l.href.endsWith(`/sitemap/${enc(anchor.id)}/`),
              ),
          )
          .map((anchor) => anchor.id),
      ),
      'root canonical links for top anchors',
    ).toEqual(none);
    const nested = root.detailLinks.filter(
      (l) => !rootIds.has(l.id) && byId.has(l.id),
    );
    expect(
      report(nested.map((l) => l.id)),
      'child anchors eagerly linked on root',
    ).toEqual(none);
  });

  test('global anchor index: bounded static parts with fixed previous/next links', async ({
    page,
  }) => {
    const { anchors, byId } = await loadModel();
    const expected = chunk(anchors, INDEX_LIMIT);
    const keys = ['', ...expected.map((_, i) => `index/${i + 1}/`)];
    const docs = await parseBuilt(page, keys);
    const root = docs.get('')!;
    expect(root, 'built root').toBeDefined();
    expect(
      root.hrefs.some((h) => /\/sitemap\/index\/1\/$/.test(h)),
      'root links /sitemap/index/1/',
    ).toBe(true);
    const failures: string[] = [];
    const seen = new Set<string>();
    for (let part = 1; part <= expected.length; part++) {
      const doc = docs.get(`index/${part}/`);
      if (!doc) {
        failures.push(`index/${part}: not built`);
        continue;
      }
      if (doc.detailLinks.length > INDEX_LIMIT)
        failures.push(`index/${part}: ${doc.detailLinks.length} entries`);
      if (doc.metadataGroups !== 0)
        failures.push(`index/${part}: ${doc.metadataGroups} metadata groups`);
      if (doc.scripts.length)
        failures.push(`index/${part}: scripts ${doc.scripts.join(',')}`);
      for (const link of doc.detailLinks) {
        seen.add(link.id);
        if (!byId.has(link.id))
          failures.push(`index/${part}: unknown id ${link.id}`);
        if (!link.href.endsWith(`/sitemap/${enc(link.id)}/`))
          failures.push(`index/${part}: href ${link.id} -> ${link.href}`);
      }
      const nextOk =
        part < expected.length
          ? new RegExp(`/sitemap/index/${part + 1}/$`).test(doc.next ?? '')
          : doc.next === null;
      const prevOk =
        part > 1
          ? new RegExp(`/sitemap/index/${part - 1}/$`).test(doc.prev ?? '')
          : doc.prev === null;
      if (!nextOk) failures.push(`index/${part}: next ${doc.next}`);
      if (!prevOk) failures.push(`index/${part}: prev ${doc.prev}`);
    }
    expect(report(failures), 'global index parts').toEqual(none);
    expect(
      report(anchors.map((a) => a.id).filter((id) => !seen.has(id))),
      'anchors missing from global index',
    ).toEqual(none);
  });

  test('owned metadata splits per anchor into bounded parts; child anchors live in pages index', async ({
    page,
  }) => {
    const { anchors, parts, homePart, childAnchors, order } = await loadModel();
    const large = anchors.filter((a) => parts(a.id).length > 1);
    expect(
      large.length,
      'validated data has an anchor with more than 32 owned nodes',
    ).toBeGreaterThan(0);
    const docs = await parseBuilt(page);
    const failures = {
      missing: [] as string[],
      segment: [] as string[],
      bounds: [] as string[],
      context: [] as string[],
      children: [] as string[],
      pagination: [] as string[],
      childIndex: [] as string[],
    };
    for (const anchor of anchors) {
      const list = parts(anchor.id);
      const totalParts = Math.max(1, list.length);
      const children = new Set(childAnchors(anchor.id).map((c) => c.id));
      for (let part = 1; part <= totalParts; part++) {
        const label = `${anchor.id}#${part}`;
        const doc = docs.get(metadataKey(anchor.id, part));
        if (!doc) {
          failures.missing.push(`${label}: not built`);
          continue;
        }
        if (!doc.primary.some((p) => p.id === anchor.id))
          failures.segment.push(`${label}: anchor not primary`);
        // Contract keeps final nodes in input order; compare in that order.
        const primary = doc.primary
          .map((p) => p.id)
          .filter((id) => id !== anchor.id)
          .sort((a, b) => (order.get(a) ?? -1) - (order.get(b) ?? -1));
        const expectedIds = (list[part - 1] ?? []).map((n) => n.id);
        if (primary.length > METADATA_LIMIT)
          failures.bounds.push(`${label}: ${primary.length} primary`);
        if (primary.join('\n') !== expectedIds.join('\n'))
          failures.segment.push(
            `${label}: got ${primary.length} [${primary.slice(0, 3).join(',')}] expected ${expectedIds.length} [${expectedIds.slice(0, 3).join(',')}]`,
          );
        if (doc.metadataGroups > METADATA_LIMIT + 1)
          failures.bounds.push(`${label}: ${doc.metadataGroups} groups`);
        for (const ctx of doc.context) {
          if (ctx.hasMeta)
            failures.context.push(`${label}: context ${ctx.id} has metadata`);
          const home = homePart.get(ctx.id);
          if (
            home &&
            !ctx.hrefs.some((h) =>
              h.endsWith(`/${metadataPath(home.anchor, home.part)}`),
            )
          )
            failures.context.push(
              `${label}: context ${ctx.id} lacks home ${home.anchor}#${home.part}`,
            );
        }
        const eager = doc.primary.filter((p) => children.has(p.id));
        if (eager.length)
          failures.children.push(
            `${label}: ${eager.map((p) => p.id).join(',')}`,
          );
        const nextOk =
          part < totalParts
            ? new RegExp(
                `/sitemap/${escape(enc(anchor.id))}/components/${part + 1}/$`,
              ).test(doc.next ?? '')
            : doc.next === null;
        const prevOk =
          part === 1
            ? doc.prev === null
            : part === 2
              ? new RegExp(`/sitemap/${escape(enc(anchor.id))}/$`).test(
                  doc.prev ?? '',
                )
              : new RegExp(
                  `/sitemap/${escape(enc(anchor.id))}/components/${part - 1}/$`,
                ).test(doc.prev ?? '');
        if (!nextOk) failures.pagination.push(`${label}: next ${doc.next}`);
        if (!prevOk) failures.pagination.push(`${label}: prev ${doc.prev}`);
        if (
          part === 1 &&
          children.size > 0 &&
          !doc.hrefs.some((h) =>
            h.endsWith(`/sitemap/${enc(anchor.id)}/pages/1/`),
          )
        )
          failures.children.push(`${label}: no link to pages/1`);
      }
      const childParts = chunk(childAnchors(anchor.id), INDEX_LIMIT);
      for (let part = 1; part <= childParts.length; part++) {
        const label = `${anchor.id}/pages/${part}`;
        const doc = docs.get(`${anchor.id}/pages/${part}/`);
        if (!doc) {
          failures.missing.push(`${label}: not built`);
          continue;
        }
        if (doc.detailLinks.length > INDEX_LIMIT)
          failures.childIndex.push(`${label}: ${doc.detailLinks.length}`);
        if (doc.metadataGroups !== 0)
          failures.childIndex.push(`${label}: ${doc.metadataGroups} groups`);
        const linked = new Set(doc.detailLinks.map((l) => l.id));
        for (const child of childParts[part - 1])
          if (!linked.has(child.id))
            failures.childIndex.push(`${label}: missing ${child.id}`);
        const base = `/sitemap/${escape(enc(anchor.id))}/pages/`;
        const nextOk =
          part < childParts.length
            ? new RegExp(`${base}${part + 1}/$`).test(doc.next ?? '')
            : doc.next === null;
        const prevOk =
          part > 1
            ? new RegExp(`${base}${part - 1}/$`).test(doc.prev ?? '')
            : doc.prev === null;
        if (!nextOk) failures.pagination.push(`${label}: next ${doc.next}`);
        if (!prevOk) failures.pagination.push(`${label}: prev ${doc.prev}`);
      }
    }
    expect.soft(report(failures.missing), 'built documents').toEqual(none);
    expect.soft(report(failures.segment), 'owned segments').toEqual(none);
    expect.soft(report(failures.bounds), 'metadata bounds').toEqual(none);
    expect.soft(report(failures.context), 'lean context').toEqual(none);
    expect.soft(report(failures.children), 'child anchors').toEqual(none);
    expect.soft(report(failures.pagination), 'fixed prev/next').toEqual(none);
    expect(report(failures.childIndex), 'child index parts').toEqual(none);
  });

  test('reachable HTML from the root carries every id and full metadata in its home part', async ({
    page,
    baseURL,
  }) => {
    const { nodes, homePart } = await loadModel();
    const built = await readBuilt();
    const docs = await parseBuilt(page);
    const sitemapUrl = new URL('sitemap/', baseURL);
    const reachable = new Set<string>();
    const missing: string[] = [];
    const queue = [''];
    const queued = new Set(queue);
    for (let i = 0; i < queue.length; i++) {
      const key = queue[i];
      const doc = docs.get(key);
      if (!built.has(key) || !doc) {
        missing.push(key || '(root)');
        continue;
      }
      reachable.add(key);
      const here = new URL(key, sitemapUrl);
      for (const href of doc.hrefs) {
        const target = new URL(href, here);
        if (
          target.origin !== sitemapUrl.origin ||
          !target.pathname.startsWith(sitemapUrl.pathname) ||
          !target.pathname.endsWith('/')
        )
          continue;
        const next = decodeURIComponent(
          target.pathname.slice(sitemapUrl.pathname.length),
        );
        if (queued.has(next)) continue;
        queued.add(next);
        queue.push(next);
      }
    }
    expect(report(missing), 'linked sitemap documents not built').toEqual(none);
    const shown = new Set<string>();
    for (const key of reachable)
      for (const id of docs.get(key)!.ids) shown.add(id);
    expect(
      report(nodes.filter((n) => !shown.has(n.id)).map((n) => n.id)),
      'ids missing from reachable HTML',
    ).toEqual(none);
    const wrong: string[] = [];
    for (const node of nodes) {
      const home = homePart.get(node.id);
      if (!home) continue;
      const key = metadataKey(home.anchor, home.part);
      const doc = reachable.has(key) ? docs.get(key) : undefined;
      const meta = doc?.primary.find((p) => p.id === node.id);
      if (!meta || meta.source !== node.source || meta.risk !== node.risk)
        wrong.push(
          `${node.id} @ ${home.anchor}#${home.part}: ${meta?.source}/${meta?.risk}`,
        );
    }
    expect(report(wrong), 'full source/risk in reachable home part').toEqual(
      none,
    );
  });
});

test.describe('later metadata part search over lean context', () => {
  test.beforeEach(({}, testInfo) =>
    test.skip(
      !testInfo.project.name.endsWith('-320'),
      'Runs at 320 CSS px in every engine.',
    ),
  );

  const normalize = (value: string) =>
    value
      .normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .replace(/ı/g, 'i')
      .toLowerCase();

  test('context label matches itself; count, empty message and reader open state cover every rendered node', async ({
    page,
  }) => {
    const { anchors, parts, byId, homePart } = await loadModel();
    const keys = anchors.flatMap((a) =>
      parts(a.id)
        .slice(1)
        .map((_, i) => metadataKey(a.id, i + 2)),
    );
    const docs = await parseBuilt(page, keys);
    const searchable = (id: string) => {
      const n = byId.get(id)!;
      return normalize(
        [
          n.label,
          ...(n.notes ?? []),
          ...(n.options ?? []),
          n.routeTemplate ?? '',
          n.livePath ?? '',
        ].join(' '),
      );
    };
    let chosen:
      | { key: string; ids: string[]; contextId: string; label: string }
      | undefined;
    for (const key of keys) {
      const doc = docs.get(key);
      if (!doc) continue;
      for (const ctx of doc.context) {
        const node = byId.get(ctx.id);
        if (!node || !homePart.has(ctx.id)) continue;
        const label = normalize(node.label.trim());
        if (label.length < 3) continue;
        const clash = doc.ids.some(
          (id) => id !== ctx.id && searchable(id).includes(label),
        );
        if (!clash) {
          chosen = { key, ids: doc.ids, contextId: ctx.id, label: node.label };
          break;
        }
      }
      if (chosen) break;
    }
    expect(
      chosen,
      'later metadata part with a lean context node carrying a unique label',
    ).toBeDefined();
    const { key, ids, contextId, label } = chosen!;
    const home = homePart.get(contextId)!;
    const total = ids.length;

    const response = await page.goto(
      `sitemap/${key.split('/').map(enc).join('/')}`,
    );
    expect(response?.status(), `${key} built`).toBe(200);
    const count = page.locator('[data-sitemap-count]');
    const empty = page.locator('[data-sitemap-empty]');
    const search = page.getByLabel('Bu görünümde ara');
    await expect(count, 'initial count includes context nodes').toHaveText(
      `Bu görünümde ${total} öğe.`,
    );

    const openStates = () =>
      page.evaluate(() =>
        [...document.querySelectorAll('[data-node-id]')].map((el) => {
          const details = el.querySelector(':scope > details');
          return [
            el.getAttribute('data-node-id'),
            details ? (details as HTMLDetailsElement).open : null,
          ];
        }),
      );
    const before = await openStates();

    const ctx = page.locator(`[data-node-id="${contextId}"]`);
    await search.fill(label);
    await expect(count).toHaveText(`1 eşleşen öğe, bu görünümde ${total} öğe.`);
    await expect(ctx, 'context node is a match').toBeVisible();
    await expect(ctx, 'match, not ancestor context').not.toHaveAttribute(
      'data-context',
      /.*/,
    );
    await expect(
      ctx.locator(':scope > details > summary'),
      'summary visible through natively opened ancestors',
    ).toBeVisible();
    await expect(empty).toBeHidden();
    const facts = await ctx.evaluate((el) => ({
      ownDl: [...el.querySelectorAll('dl')].some(
        (dl) => dl.closest('[data-node-id]') === el,
      ),
      hrefs: [...el.querySelectorAll('a[href]')]
        .filter((a) => a.closest('[data-node-id]') === el)
        .map((a) => a.getAttribute('href')!),
    }));
    expect(facts.ownDl, 'context has no own metadata list').toBe(false);
    expect(
      facts.hrefs.some((h) =>
        h.endsWith(`/${metadataPath(home.anchor, home.part)}`),
      ),
      `context links home ${home.anchor}#${home.part}`,
    ).toBe(true);

    await search.fill('zzqx-eslesmeyen-sorgu-808');
    await expect(count).toHaveText(`0 eşleşen öğe, bu görünümde ${total} öğe.`);
    await expect(empty, 'empty message on no match').toBeVisible();
    await expect(
      page.locator('[data-node-id]:visible'),
      'every rendered node hidden, context included',
    ).toHaveCount(0);

    await search.fill(label);
    await expect(empty, 'message cleared after valid query').toBeHidden();
    await expect(ctx).toBeVisible();

    await search.fill('');
    await expect(count).toHaveText(`Bu görünümde ${total} öğe.`);
    await expect(empty).toBeHidden();
    expect(await openStates(), 'reader open state restored').toEqual(before);
  });
});

test.describe('JS-off bounded journey', () => {
  test.use({ javaScriptEnabled: false });

  const journey = async () => {
    const { anchors, parts } = await loadModel();
    const anchor = anchors.find((a) => parts(a.id).length > 1);
    expect(
      anchor,
      'anchor with more than 32 owned components in validated data',
    ).toBeDefined();
    const indexPart = Math.floor(anchors.indexOf(anchor!) / INDEX_LIMIT) + 1;
    return { anchor: anchor!, indexPart, list: parts(anchor!.id) };
  };

  const track = (page: Page) => {
    const requests: { url: string; type: string }[] = [];
    page.on('request', (r) =>
      requests.push({ url: r.url(), type: r.resourceType() }),
    );
    return requests;
  };

  const assertStatic = (
    requests: { url: string; type: string }[],
    baseURL: string,
  ) => {
    const origin = new URL(baseURL).origin;
    expect(
      requests.filter((r) => new URL(r.url).origin !== origin),
      'other-origin requests',
    ).toEqual([]);
    expect(
      requests.filter(
        (r) =>
          !['document', 'stylesheet', 'font', 'image'].includes(r.type) ||
          r.url.endsWith('.json') ||
          r.url.endsWith('.js'),
      ),
      'JSON/JS requests',
    ).toEqual([]);
  };

  /**
   * Count first so a missing feature fails fast instead of timing out, then
   * open closed ancestor disclosures through native summary clicks, outermost
   * first, before clicking the link.
   */
  const clickFirst = async (page: Page, selector: string, what: string) => {
    const link = page.locator(selector);
    expect(await link.count(), `${what} link present`).toBeGreaterThan(0);
    const target = link.first();
    // One read of ancestor open states, outermost first; never assigns open.
    const open = await target.evaluate((element) => {
      const states: boolean[] = [];
      for (
        let node = element.parentElement?.closest('details');
        node;
        node = node.parentElement?.closest('details')
      )
        states.push((node as HTMLDetailsElement).open);
      return states.reverse();
    });
    const ancestors = target.locator('xpath=ancestor::details');
    for (let index = 0; index < open.length; index++)
      if (!open[index])
        await ancestors.nth(index).locator(':scope > summary').click();
    await target.click();
  };

  test('root -> first global index part via static link', async ({
    page,
    baseURL,
  }) => {
    const requests = track(page);
    const root = await page.goto('sitemap/');
    expect(root?.status()).toBe(200);
    await expect(
      page.getByLabel('Bu görünümde ara'),
      'enhancement controls hidden without JS',
    ).toBeHidden();
    await clickFirst(page, 'a[href$="/sitemap/index/1/"]', 'global index');
    await expect(page, 'global index part 1').toHaveURL(
      /\/sitemap\/index\/1\/$/,
    );
    assertStatic(requests, baseURL!);
  });

  test('global index static next links reach the chosen anchor part', async ({
    page,
    baseURL,
  }) => {
    const { indexPart } = await journey();
    const requests = track(page);
    const first = await page.goto('sitemap/index/1/');
    expect(first?.status(), 'global index part 1 built').toBe(200);
    for (let part = 1; part < indexPart; part++) {
      await clickFirst(page, 'a[rel~="next"]', `index ${part} next`);
      await expect(page).toHaveURL(new RegExp(`/sitemap/index/${part + 1}/$`));
    }
    assertStatic(requests, baseURL!);
  });

  test('global index part -> canonical anchor detail', async ({
    page,
    baseURL,
  }) => {
    const { anchor, indexPart } = await journey();
    const requests = track(page);
    const start = await page.goto(`sitemap/index/${indexPart}/`);
    expect(start?.status(), `global index part ${indexPart} built`).toBe(200);
    await clickFirst(
      page,
      `a[data-page-detail="${anchor.id}"]`,
      `${anchor.id} detail`,
    );
    await expect(page).toHaveURL(
      new RegExp(`/sitemap/${escape(enc(anchor.id))}/$`),
    );
    assertStatic(requests, baseURL!);
  });

  test('canonical detail -> later component part via static next', async ({
    page,
    baseURL,
  }) => {
    const { anchor, list } = await journey();
    const requests = track(page);
    const start = await page.goto(metadataPath(anchor.id, 1));
    expect(start?.status()).toBe(200);
    await clickFirst(page, 'a[rel~="next"]', 'component next');
    await expect(page, 'later component part').toHaveURL(/\/components\/2\/$/);
    await expect(
      page.locator(`[data-node-id="${list[1][0].id}"][data-metadata-primary]`),
    ).toHaveCount(1);
    await expect(
      page.locator(`[data-node-id="${list[0][0].id}"][data-metadata-primary]`),
      'other part excluded',
    ).toHaveCount(0);
    await expect(
      page.getByText(/2/).first(),
      'scope names current part',
    ).toBeVisible();
    assertStatic(requests, baseURL!);
  });
});
