import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { validateSitemap } from '../src/sitemap';

const load = async () =>
  validateSitemap(
    JSON.parse(await readFile('src/data/press-sitemap.json', 'utf8')),
  );

test('new full forms remain unsaved observations, with no operation claims', async () => {
  const data = await load();
  for (const slug of [
    'erpnext-consultant',
    'press-feedback',
    'plan-change',
    'incident',
    'stripe-payment-method',
  ]) {
    const id = `desk-live-root-remaining-forms-${slug}-form`;
    const form = data.nodes.find((node) => node.id === id);
    expect(form, id).toBeDefined();
    expect(form?.source).toBe('live_ui');
    expect(form?.status).toBe('visited');
    expect(form?.routeTemplate).toBe(`/app/${slug}/{unsaved}`);
    expect(form?.livePath).toBeUndefined();
    expect(form?.executed).toBe(false);
    expect(form?.functionalTest).toBe('not_run');
  }
  expect(data.auditPhase).toBe('in_progress');
});

test('later Incident evidence does not erase the earlier monitor error', async () => {
  const data = await load();
  const error = data.nodes.find(
    (node) =>
      node.id === 'desk-live-root-remaining-forms-incident-form-monitor-error',
  );
  expect(error?.status).toBe('error');
  expect(error?.notes?.join(' ')).toContain(
    'Monitor Server not set in Press Settings',
  );
  const row = data.nodes.find(
    (node) =>
      node.id ===
      'desk-live-root-native-incident-followup-corrective_suggestions-row',
  );
  expect(row?.status).toBe('visited');
  expect(row?.executed).toBe(false);
  expect(row?.functionalTest).toBe('not_run');
});
