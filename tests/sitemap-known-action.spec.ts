import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import {
  PRESS_ORIGIN,
  functionalTestLabels,
  kindLabels,
  riskLabels,
  sourceLabels,
  validateSitemap,
} from '../src/sitemap';
import {
  buildSitemapPartitions,
  metadataPath,
} from '../src/sitemap-partitions';

const dataPath = 'src/data/press-sitemap.json';
const knownId = 'desk-schema-press-settings-field-create_stripe_plans';

test('known Create Stripe Plans schema component stays classified and shown as an unexecuted action', async ({
  page,
}) => {
  const { nodes } = validateSitemap(
    JSON.parse(await readFile(dataPath, 'utf8')),
  );
  const node = nodes.find((candidate) => candidate.id === knownId);
  expect(node, `${knownId} in reviewed data`).toBeDefined();
  // Raw record: an action, never a field, and nothing was ever executed.
  expect(node!.label).toBe('Create Stripe Plans');
  expect(node!.source).toBe('schema_ui');
  expect(node!.kind).toBe('action');
  expect(node!.kind).not.toBe('field');
  expect(node!.executed).toBe(false);
  expect(node!.functionalTest).toBe('not_run');
  expect(Object.keys(riskLabels)).toContain(node!.risk);

  const home = buildSitemapPartitions(nodes).homeById.get(knownId);
  expect(home, `${knownId} owned by a metadata part`).toBeDefined();

  // Any request leaving the local static server would be Press or a backend.
  const external: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (
      url.origin === PRESS_ORIGIN ||
      !/^(?:localhost|127\.0\.0\.1)$/.test(url.hostname)
    )
      external.push(request.url());
  });

  await page.goto(`.${metadataPath(home!.anchorId, home!.part, '')}`);

  const item = page.locator(`li[data-node-id="${knownId}"]`);
  await expect(item).toHaveCount(1);
  await expect(item).toHaveAttribute('data-metadata-primary', '');
  await expect(item).toHaveAttribute('data-kind', 'action');
  const summary = item.locator(':scope > details > summary');

  // One read of ancestor open states, outermost first; no DOM writes.
  const state = await summary.evaluate((element) => {
    const open: boolean[] = [];
    for (
      let current = element.parentElement?.parentElement ?? null;
      current;
      current = current.parentElement
    )
      if (current.tagName === 'DETAILS')
        open.push(current.hasAttribute('open'));
    return {
      open: open.reverse(),
      ownOpen: Boolean(element.parentElement?.hasAttribute('open')),
    };
  });
  const ancestors = summary.locator('xpath=../ancestor::details');
  for (let index = 0; index < state.open.length; index++)
    if (!state.open[index])
      await ancestors.nth(index).locator(':scope > summary').click();
  await expect(summary).toBeVisible();
  if (!state.ownOpen) await summary.click();

  const meta = item.locator(
    ':scope > details > .sitemap-body > dl.sitemap-meta',
  );
  await expect(meta).toBeVisible();
  const row = (term: string) =>
    meta
      .locator(':scope > div')
      .filter({
        has: page.locator('dt', { hasText: term }),
      })
      .locator('dd');

  await expect(row('Tür:')).toContainText(kindLabels.action);
  await expect(row('Tür:')).not.toContainText(kindLabels.field);
  await expect(row('Gözlem kaynağı:')).toHaveText(sourceLabels.schema_ui);
  await expect(row('Risk:')).toHaveAttribute('data-risk', node!.risk);
  await expect(row('Risk:')).toHaveText(
    `${riskLabels[node!.risk]}, çalıştırılmadı`,
  );
  await expect(row('İşlev testi:')).toHaveText(functionalTestLabels.not_run);

  // Documentation only: no control that could run the action.
  await expect(
    item.locator(':scope > details > .sitemap-body button'),
  ).toHaveCount(0);
  expect(external, 'requests to Press or any backend').toEqual([]);
});
