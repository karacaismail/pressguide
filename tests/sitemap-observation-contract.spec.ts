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
  ['desk-live-services-log-server-form', '/app/log-server'],
  ['desk-live-services-nfs-server-form', '/app/nfs-server'],
  ['desk-live-services-bastion-server-form', '/app/bastion-server'],
  ['desk-live-services-trace-server-form', '/app/trace-server'],
  ['desk-live-services-analytics-server-form', '/app/analytics-server'],
  ['desk-live-services-self-hosted-server-form', '/app/self-hosted-server'],
  ['desk-live-services-code-server-form', '/app/code-server'],
  ['desk-live-services-backup-bucket-form', '/app/backup-bucket'],
  ['desk-live-cloud-storage-cloud-provider-form', '/app/cloud-provider'],
  ['desk-live-cloud-storage-cloud-region-form', '/app/cloud-region'],
  ['desk-live-cloud-storage-region-form', '/app/region'],
  ['desk-live-cloud-storage-cluster-plan-form', '/app/cluster-plan'],
  ['desk-live-cloud-storage-server-plan-type-form', '/app/server-plan-type'],
  [
    'desk-live-cloud-storage-server-storage-plan-form',
    '/app/server-storage-plan',
  ],
  [
    'desk-live-cloud-storage-nfs-volume-attachment-form',
    '/app/nfs-volume-attachment',
  ],
  [
    'desk-live-cloud-storage-nfs-volume-detachment-form',
    '/app/nfs-volume-detachment',
  ],
  ['desk-live-security-access-press-role-form', '/app/press-role'],
  [
    'desk-live-security-access-press-role-permission-form',
    '/app/press-role-permission',
  ],
  [
    'desk-live-security-access-press-method-permission-form',
    '/app/press-method-permission',
  ],
  [
    'desk-live-security-access-security-update-check-form',
    '/app/security-update-check',
  ],
  ['desk-live-security-access-frappe-version-form', '/app/frappe-version'],
  [
    'desk-live-security-access-certificate-authority-form',
    '/app/certificate-authority',
  ],
  ['desk-live-security-access-server-firewall-form', '/app/server-firewall'],
  [
    'desk-live-security-access-prometheus-alert-rule-form',
    '/app/prometheus-alert-rule',
  ],
  [
    'desk-live-marketplace-commercial-marketplace-app-category-form',
    '/app/marketplace-app-category',
  ],
  [
    'desk-live-marketplace-commercial-marketplace-app-feedback-form',
    '/app/marketplace-app-feedback',
  ],
  [
    'desk-live-marketplace-commercial-marketplace-app-payment-form',
    '/app/marketplace-app-payment',
  ],
  [
    'desk-live-marketplace-commercial-marketplace-promotional-banner-form',
    '/app/marketplace-promotional-banner',
  ],
  [
    'desk-live-marketplace-commercial-marketplace-publisher-profile-form',
    '/app/marketplace-publisher-profile',
  ],
  [
    'desk-live-marketplace-commercial-developer-review-reply-form',
    '/app/developer-review-reply',
  ],
  [
    'desk-live-marketplace-commercial-app-user-review-form',
    '/app/app-user-review',
  ],
  [
    'desk-live-marketplace-commercial-app-release-approval-request-form',
    '/app/app-release-approval-request',
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
    expect(node!.label).toMatch(/Kaydedilmemiş Yeni (?:Tam )?Form/);
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
