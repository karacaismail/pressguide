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

test('conditional controls do not imply completed row coverage', async () => {
  const data = await load();
  for (const id of [
    'desk-live-root-cond-team-deletion-request-users-anonymized-row',
    'desk-live-root-cond-self-hosted-server-sites-row',
  ]) {
    const node = data.nodes.find((item) => item.id === id);
    expect(node, id).toBeDefined();
    expect(node?.status).toBe('discovered');
    expect(node?.executed).toBe(false);
    expect(node?.functionalTest).toBe('not_run');
  }
  const control = data.nodes.find(
    (item) =>
      item.id === 'desk-live-root-cond-account-request-control-press-roles',
  );
  expect(control).toBeDefined();
  expect(control?.notes).toContain('Observed control type: Table MultiSelect.');
  expect(data.auditPhase).toBe('in_progress');
});

test('site action field observations remain separate from execution', async () => {
  const data = await load();
  const fields = data.nodes.filter((item) =>
    item.id.startsWith('desk-live-root-cond-site-action-steps-row-field-'),
  );
  expect(fields).toHaveLength(12);
  for (const field of fields) {
    expect(field.status).toBe('visited');
    expect(field.executed).toBe(false);
    expect(field.functionalTest).toBe('not_run');
  }
});
