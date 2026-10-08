import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { validateSitemap } from '../src/sitemap';

const load = async () =>
  validateSitemap(
    JSON.parse(await readFile('src/data/press-sitemap.json', 'utf8')),
  );

test('hidden database permissions retain unknown row coverage', async () => {
  const data = await load();
  for (const suffix of ['table-permissions', 'table-permissions-row']) {
    const id = `desk-live-root-fuf-child-site-database-user-${suffix}`;
    const node = data.nodes.find((item) => item.id === id);
    expect(node, id).toBeDefined();
    expect(node?.status).toBe('discovered');
    expect(node?.executed).toBe(false);
    expect(node?.functionalTest).toBe('not_run');
  }
  expect(data.auditPhase).toBe('in_progress');
});

test('restoration duration control is distinct from test grid-only duration', async () => {
  const data = await load();
  const id =
    'desk-live-root-fuf-child-physical-backup-restoration-table-steps-row-field-duration';
  expect(data.nodes.find((item) => item.id === id)?.status, id).toBe('visited');
  expect(
    data.nodes.some(
      (item) =>
        item.id ===
        'desk-live-root-fuf-child-physical-restoration-test-table-results-row-field-duration',
    ),
  ).toBe(false);
  const row = data.nodes.find(
    (item) =>
      item.id ===
      'desk-live-root-fuf-child-physical-restoration-test-table-results-row',
  );
  expect(row).toBeDefined();
  expect(row?.executed).toBe(false);
});
