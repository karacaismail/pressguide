import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { validateSitemap } from '../src/sitemap';

const loadSnapshot = async () =>
  validateSitemap(
    JSON.parse(await readFile('src/data/press-sitemap.json', 'utf8')),
  );

// These forms have an observed unsaved context. Historical forms without this
// context correction are outside this regression; new snapshot batches may grow.
const observedUnsavedForms = [
  ['desk-live-infrastructure-monitor-server-form', '/app/monitor-server'],
  ['desk-live-infrastructure-registry-server-form', '/app/registry-server'],
  ['desk-live-operations-version-upgrade-form', '/app/version-upgrade'],
  ['desk-live-operations-site-action-form', '/app/site-action'],
  ['desk-live-lifecycle-site-migration-form', '/app/site-migration'],
  ['desk-live-lifecycle-site-replication-form', '/app/site-replication'],
  ['desk-live-lifecycle-site-group-deploy-form', '/app/site-group-deploy'],
  ['desk-live-resources-server-activity-form', '/app/server-activity'],
  ['desk-live-resources-process-snapshot-form', '/app/process-snapshot'],
  ['desk-live-resources-disk-performance-form', '/app/disk-performance'],
  ['desk-live-resources-server-snapshot-form', '/app/server-snapshot'],
  [
    'desk-live-resources-virtual-disk-snapshot-form',
    '/app/virtual-disk-snapshot',
  ],
  [
    'desk-live-resources-server-snapshot-recovery-form',
    '/app/server-snapshot-recovery',
  ],
] as const;

test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-320',
    'Pure observed-data contracts run once; browser journeys cover every project.',
  );
});

for (const [id, prefix] of observedUnsavedForms) {
  test(`${id} route retains its observed unsaved form context`, async () => {
    const sitemap = await loadSnapshot();
    const node = sitemap.nodes.find((candidate) => candidate.id === id);
    expect(node, `${id} remains in the public snapshot`).toBeDefined();
    expect(node!.label).toContain('Kaydedilmemiş Yeni Form');
    expect(node!.routeTemplate).toBe(`${prefix}/{record-or-unsaved}`);
  });
}

test('lastUpdated remains the newest actual source observation checkpoint', async () => {
  const sitemap = await loadSnapshot();
  const checkpoints = sitemap.nodes.flatMap((node) =>
    node.observedAt === undefined ? [] : [Date.parse(node.observedAt)],
  );
  expect(
    checkpoints.length,
    'observed timestamp checkpoints exist',
  ).toBeGreaterThan(0);
  expect(Date.parse(sitemap.lastUpdated)).toBe(Math.max(...checkpoints));
});

test('public lastUpdated disclosure describes source observation and denies file edit time', async () => {
  const sitemap = await loadSnapshot();
  const disclosure = sitemap.coverageScope.find((text) =>
    /lastUpdated/i.test(text),
  );
  expect(
    disclosure,
    'readers can distinguish observation time from editing time',
  ).toBeDefined();
  const text = disclosure!.toLocaleLowerCase('tr-TR');
  expect(text).toContain('kaynak');
  expect(text).toContain('gözlem');
  expect(text).toMatch(/en (?:yeni|son)/);
  expect(text).toContain('dosya');
  expect(text).toMatch(/düzenl|güncelle|değiş/);
  expect(text).toMatch(/değil|ifade etmez|anlamına gelmez|göstermez/);
});

test('public form coverage uses representative-form wording without a human-role label', async () => {
  const sitemap = await loadSnapshot();
  expect(sitemap.coverageScope.join('\n')).not.toMatch(
    /\btemsilci\s+(?:gerçek\s+)?form\b/i,
  );
});

test('Version Upgrade observed form limits do not expose internal gate jargon', async () => {
  const sitemap = await loadSnapshot();
  const id = 'desk-live-operations-version-upgrade-form';
  const node = sitemap.nodes.find((candidate) => candidate.id === id);
  expect(node, `${id} observed form remains present`).toBeDefined();
  expect(node!.notes?.length).toBeGreaterThan(0);
  expect(node!.notes!.join('\n')).not.toMatch(/\bG0\b/);
  expect(node!.executed).toBe(false);
  expect(node!.functionalTest).toBe('not_run');
});
