import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
const guide = JSON.parse(
  readFileSync(resolve('src/data/guide.json'), 'utf8'),
) as typeof import('../src/data/guide.json');

const step = (id: string) => {
  const result = guide.steps.find((item) => item.id === id);
  if (!result) throw new Error(`Missing instruction: ${id}`);
  return result;
};

test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-320',
    'Pure content contract runs once.',
  );
});

test('instructions stay brief enough to scan without explanatory essays', () => {
  expect(guide.subtitle.length).toBeLessThanOrEqual(80);
  let characters = 0;
  for (const item of guide.steps) {
    expect(item.title, item.id).not.toContain('?');
    expect(item.title.length, item.id).toBeLessThanOrEqual(80);
    expect(item.summary.length, item.id).toBeLessThanOrEqual(140);
    expect(item.actions.length, item.id).toBeGreaterThan(0);
    for (const action of item.actions)
      expect(action.length, `${item.id}: ${action}`).toBeLessThanOrEqual(180);
    characters +=
      item.title.length + item.summary.length + item.actions.join('').length;
  }
  expect(characters).toBeLessThanOrEqual(18000);
});

test('short instructions retain deployment gates and unresolved evidence', () => {
  expect(step('schedule').actions.join(' ')).toMatch(
    /Success.*Deploy|Deploy.*Success/,
  );
  expect(step('preparing').summary).toMatch(/Preparing/);
  expect(step('preparing').summary).toMatch(/kanıt|başarı/);
  expect(step('site').actions.join(' ')).toContain(
    '/dashboard/groups/bench-0027/sites/new',
  );
  expect(step('site').actions.join(' ')).toMatch(
    /yasal.*kullanıcı|kullanıcı.*yasal/,
  );
  expect(step('site').actions.join(' ')).toMatch(/görünürlüğünü değiştirme/);
  expect(step('live-cleanup-crm').actions.join(' ')).toMatch(/açık onay/);
  expect(step('live-cleanup-crm').actions.join(' ')).toContain(
    'docker builder prune --all --force',
  );
  expect(step('live-site-https-login').actions.join(' ')).toMatch(
    /TLS|sertifika/,
  );
  expect(step('live-site-https-login').actions.join(' ')).toMatch(/parola/);
  expect(step('live-analytics-daily-usage').summary).toMatch(
    /Log server.*yok|log server.*yok/,
  );
  expect(guide.liveStatus).toMatch(/test edilmedi/);
  expect(step('live-site-desk').notes.join(' ')).toMatch(/test edilmedi/);
});

test('anchors and public evidence remain reachable after copy compaction', () => {
  expect(guide.steps).toHaveLength(67);
  const ids = guide.steps.map((item) => item.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const id of [
    'team',
    'apps',
    'site',
    'hata-tanisi',
    'live-build-success',
    'live-site-desk',
  ])
    expect(ids).toContain(id);
  for (const item of guide.steps) {
    expect(item.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    if ('screenshot' in item && item.screenshot) {
      expect(item.screenshot.src).toMatch(
        /^evidence\/[a-z0-9-]+\.(?:jpg|png)$/,
      );
      expect(existsSync(resolve('public', item.screenshot.src)), item.id).toBe(
        true,
      );
      expect(item.screenshot.annotations.length, item.id).toBeGreaterThan(0);
    }
  }
  for (const source of guide.sources)
    expect(new URL(source.url).protocol).toBe('https:');
});
