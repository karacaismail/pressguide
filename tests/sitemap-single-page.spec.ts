import { readFile, readdir } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { validateSitemap } from '../src/sitemap';
const data = validateSitemap(
  JSON.parse(await readFile('src/data/press-sitemap.json', 'utf8')),
);
test('one HTML route and bounded interaction over the complete dataset', async ({
  page,
}) => {
  const files = (await readdir('dist/sitemap', { recursive: true })).filter(
    (f) => f.endsWith('.html'),
  );
  expect(files).toEqual(['index.html']);
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.goto('./sitemap/');
  expect(requests.filter((u) => u.endsWith('press-sitemap.json'))).toHaveLength(
    0,
  );
  await page
    .getByRole('button', { name: 'Tüm öğeleri aç', exact: true })
    .click();
  await expect(page.locator('[data-result-count]')).toContainText(
    String(data.nodes.length),
  );
  expect(requests.filter((u) => u.endsWith('press-sitemap.json'))).toHaveLength(
    1,
  );
  const field = data.nodes.find((n) => n.kind === 'field')!;
  await page.getByRole('searchbox').fill(field.id);
  await expect(page.locator('[data-results] a')).toHaveCount(1);
  await page.locator('[data-results] a').click();
  await expect(page).toHaveURL(
    new RegExp('#node=' + encodeURIComponent(field.id) + '$'),
  );
  await expect(page.locator('[data-selected]')).toContainText(field.id);
  await expect(page.locator('[data-selected]')).toContainText('not_run');
  await expect(page.locator('[data-selected]')).toContainText('false');
  expect(await page.locator('*').count()).toBeLessThanOrEqual(2048);
  expect(requests.filter((u) => u.endsWith('press-sitemap.json'))).toHaveLength(
    1,
  );
});

test('every published node is reachable inline and every record retains its full metadata', async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== 'chromium-320',
    'Full record enumeration runs once.',
  );
  await page.goto('./sitemap/');
  await page
    .getByRole('button', { name: 'Tüm öğeleri aç', exact: true })
    .click();
  await expect(page.locator('[data-results] li')).toHaveCount(30);
  const seen = await page.evaluate(() => {
    const ids: string[] = [];
    const next = document.querySelector<HTMLButtonElement>('[data-next]')!;
    do {
      ids.push(
        ...Array.from(document.querySelectorAll('[data-result-id]'), (el) =>
          decodeURIComponent(
            (el.querySelector('a') as HTMLAnchorElement).hash.slice(6),
          ),
        ),
      );
      if (next.disabled) break;
      next.click();
    } while (true);
    return ids;
  });
  expect(seen).toEqual(data.nodes.map((n) => n.id));
  // Published JSON, not merely the source file, is the interaction boundary.
  const published = await (
    await page.request.get('./press-sitemap.json')
  ).json();
  expect(published).toEqual(data);
});

test('selection, back/forward and resizing preserve entered query and focus', async ({
  page,
}) => {
  await page.goto('./sitemap/');
  await page
    .getByRole('button', { name: 'Tüm öğeleri aç', exact: true })
    .click();
  const search = page.getByRole('searchbox');
  await search.fill('Press Settings');
  const links = page.locator('[data-results] a');
  await expect(links.first()).toBeVisible();
  const ids = await links.evaluateAll((a) =>
    a.slice(0, 2).map((el) => (el as HTMLAnchorElement).hash),
  );
  expect(ids).toHaveLength(2);
  await links.nth(0).click();
  await expect(page.locator('[data-selected]')).toHaveAttribute(
    'data-node-id',
    decodeURIComponent(ids[0].slice(6)),
  );
  await links.nth(1).click();
  await expect(page.locator('[data-selected]')).toHaveAttribute(
    'data-node-id',
    decodeURIComponent(ids[1].slice(6)),
  );
  await search.focus();
  await page.goBack();
  await expect(page.locator('[data-selected]')).toHaveAttribute(
    'data-node-id',
    decodeURIComponent(ids[0].slice(6)),
  );
  await expect(search).toHaveValue('Press Settings');
  await expect(search).toBeFocused();
  await page.goForward();
  await expect(page.locator('[data-selected]')).toHaveAttribute(
    'data-node-id',
    decodeURIComponent(ids[1].slice(6)),
  );
  await page.setViewportSize({ width: 568, height: 320 });
  await expect(search).toHaveValue('Press Settings');
  await expect(search).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('unknown, unexecuted action and ancestor Press link remain explicit', async ({
  page,
}) => {
  const node = data.nodes.find(
    (n) => n.id === 'desk-schema-press-settings-field-create_stripe_plans',
  )!;
  expect(node.kind).toBe('action');
  expect(node.executed).toBe(false);
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.goto('./sitemap/#node=' + encodeURIComponent(node.id));
  const selected = page.locator('[data-selected]');
  await expect(selected).toHaveAttribute('data-node-id', node.id);
  await expect(selected).toContainText('Eylem (action)');
  await expect(selected).toContainText('Yapılmadı (not_run)');
  await expect(selected).toContainText('Hayır (false)');
  await selected.locator('summary').click();
  expect(JSON.parse(await selected.locator('pre').innerText())).toEqual(node);
  const byId = new Map(data.nodes.map((n) => [n.id, n]));
  let nearest = node;
  while (!nearest.livePath && nearest.parentId)
    nearest = byId.get(nearest.parentId)!;
  if (nearest.livePath)
    await expect(selected.locator('a[target="_blank"]')).toHaveAttribute(
      'href',
      'https://press.metaframer.net' + nearest.livePath,
    );
  expect(
    requests.filter((u) => new URL(u).origin !== new URL(page.url()).origin),
  ).toEqual([]);
  const unknown = data.nodes.find((n) => n.risk === 'unknown')!;
  await page.goto('./sitemap/#node=' + encodeURIComponent(unknown.id));
  await expect(selected).toContainText('Belirsiz (unknown)');
});

test('failed or invalid loads remain retryable; metadata renders as text', async ({
  page,
}) => {
  let attempt = 0;
  const malicious = {
    ...data,
    nodes: [
      {
        ...data.nodes[0],
        label: '<img src=x onerror="window.__unsafe=1">',
        notes: ['<script>window.__unsafe=1</script>'],
      },
    ],
  };
  await page.route('**/press-sitemap.json', async (route) => {
    attempt++;
    if (attempt === 1) return route.fulfill({ status: 503, body: 'offline' });
    if (attempt === 2)
      return route.fulfill({
        json: {
          ...data,
          nodes: [{ ...data.nodes[0], livePath: '//evil.example' }],
        },
      });
    return route.fulfill({ json: malicious });
  });
  await page.goto('./sitemap/');
  const load = page.getByRole('button', {
    name: 'Tüm öğeleri aç',
    exact: true,
  });
  for (let i = 0; i < 2; i++) {
    await load.click();
    await expect(page.locator('[data-result-count]')).toContainText(
      'Yükleme başarısız',
    );
    await expect(page.locator('[data-results] li')).toHaveCount(0);
  }
  await load.click();
  await expect(page.locator('[data-results] a')).toHaveCount(1);
  await page.locator('[data-results] a').click();
  await page.locator('[data-selected] summary').click();
  await expect(page.locator('[data-selected] pre')).toContainText(
    malicious.nodes[0].notes![0],
  );
  expect(
    await page.locator('[data-selected] img, [data-selected] script').count(),
  ).toBe(0);
  expect(await page.evaluate(() => '__unsafe' in window)).toBe(false);
  expect(attempt).toBe(3);
});

test('initial HTML has no optional requests and full count groups match the validated source', async ({
  page,
}) => {
  const requests: { url: string; type: string }[] = [];
  page.on('request', (r) =>
    requests.push({ url: r.url(), type: r.resourceType() }),
  );
  await page.goto('./sitemap/');
  const styles = await page
    .locator('link[rel="stylesheet"]')
    .evaluateAll((els) => els.map((el) => (el as HTMLLinkElement).href));
  expect(
    requests.filter(
      (r) =>
        r.type !== 'document' && r.type !== 'font' && !styles.includes(r.url),
    ),
  ).toEqual([]);
  await page.locator('[data-coverage-details] summary').click();
  for (const [title, key] of [
    ['Duruma göre', 'status'],
    ['Gözlem kaynağına göre', 'source'],
    ['Risk türüne göre (hiçbiri çalıştırılmadı)', 'risk'],
  ]) {
    const counts = await page
      .locator(`dl[aria-label="${title}"] dd`)
      .allTextContents();
    const groups = [
      ...new Set(data.nodes.map((n) => n[key as 'status' | 'source' | 'risk'])),
    ];
    for (const group of groups)
      expect(counts).toContain(
        String(
          data.nodes.filter(
            (n) => n[key as 'status' | 'source' | 'risk'] === group,
          ).length,
        ),
      );
    expect(counts.map(Number).reduce((a, b) => a + b, 0)).toBe(
      data.nodes.length,
    );
  }
});

test('child pagination retains enabled keyboard focus at both boundaries', async ({
  page,
}) => {
  const parent = data.nodes.find(
    (n) =>
      data.nodes.filter((child) => child.parentId === n.id).length > 30 &&
      data.nodes.filter((child) => child.parentId === n.id).length <= 60,
  )!;
  expect(parent).toBeDefined();
  await page.goto('./sitemap/#node=' + encodeURIComponent(parent.id));
  const nav = page.getByRole('navigation', { name: 'Alt öğe sayfaları' });
  const after = nav.getByRole('button', { name: 'Sonraki alt öğeler' });
  await after.focus();
  await page.keyboard.press('Enter');
  const before = nav.getByRole('button', { name: 'Önceki alt öğeler' });
  await expect(before).toBeFocused();
  await expect(before).toBeEnabled();
  await page.keyboard.press('Enter');
  await expect(after).toBeFocused();
  await expect(after).toBeEnabled();
});
test('hash-load retry restores selection and unknown IDs clear stale selection', async ({
  page,
}) => {
  let attempt = 0;
  await page.route('**/press-sitemap.json', (route) =>
    ++attempt === 1
      ? route.fulfill({ status: 503 })
      : route.fulfill({ json: data }),
  );
  const node = data.nodes[0];
  await page.goto('./sitemap/#node=' + encodeURIComponent(node.id));
  await expect(page.locator('[data-result-count]')).toContainText(
    'Yükleme başarısız',
  );
  await page
    .getByRole('button', { name: 'Tüm öğeleri aç', exact: true })
    .click();
  await expect(page.locator('[data-selected]')).toHaveAttribute(
    'data-node-id',
    node.id,
  );
  await page.evaluate(() => {
    location.hash = '#node=nonexistent-node';
  });
  await expect(page.locator('[data-selected]')).toContainText(
    'Bu kimlik yayımlanan kayıtlarda yok.',
  );
  await expect(page.locator('[data-selected]')).not.toHaveAttribute(
    'data-node-id',
  );
});
test('invalid observed timestamp is rejected before rendering and can retry', async ({
  page,
}) => {
  let attempt = 0;
  await page.route('**/press-sitemap.json', (route) =>
    route.fulfill({
      json:
        ++attempt === 1
          ? {
              ...data,
              nodes: [{ ...data.nodes[0], observedAt: 'invalid-date' }],
            }
          : data,
    }),
  );
  await page.goto('./sitemap/#node=' + encodeURIComponent(data.nodes[0].id));
  await expect(page.locator('[data-result-count]')).toContainText(
    'Yükleme başarısız',
  );
  await expect(page.locator('[data-selected]')).toBeEmpty();
  await page
    .getByRole('button', { name: 'Tüm öğeleri aç', exact: true })
    .click();
  await expect(page.locator('[data-selected]')).toHaveAttribute(
    'data-node-id',
    data.nodes[0].id,
  );
});

test('intermediate child pages preserve the Next control for repeated keyboard activation', async ({
  page,
}) => {
  const parent = data.nodes.find(
    (n) => data.nodes.filter((child) => child.parentId === n.id).length > 60,
  )!;
  expect(parent).toBeDefined();
  await page.goto('./sitemap/#node=' + encodeURIComponent(parent.id));
  const next = page
    .getByRole('navigation', { name: 'Alt öğe sayfaları' })
    .getByRole('button', { name: 'Sonraki alt öğeler' });
  await next.focus();
  await page.keyboard.press('Enter');
  await expect(next).toBeEnabled();
  await expect(next).toBeFocused();
});
