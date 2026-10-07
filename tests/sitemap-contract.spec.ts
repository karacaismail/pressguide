import { expect, test } from '@playwright/test';
import {
  formatObservation,
  pressUrl,
  riskLabels,
  validateSitemap,
} from '../src/sitemap';

const snapshot = () => ({
  schemaVersion: 1,
  lastUpdated: '2026-10-07T12:00:00Z',
  auditPhase: 'in_progress',
  reviewedForPublic: true,
  coverageScope: ['Authenticated Press page metadata only.'],
  exclusions: ['Dynamic record values and write operations excluded.'],
  nodes: [
    {
      id: 'test-root',
      parentId: null,
      label: 'Press Dashboard',
      surface: 'dashboard',
      kind: 'page',
      status: 'discovered',
      source: 'live_ui',
      risk: 'read',
      executed: false,
      functionalTest: 'not_run',
      livePath: '/dashboard/sites',
    },
  ],
});

/** Valid one-node snapshot that differs only by `changes` on its node. */
const withNode = (changes: Record<string, unknown>) => ({
  ...snapshot(),
  nodes: [{ ...snapshot().nodes[0], ...changes }],
});

/** "accepted", or the validator's message, so every case reports its reason. */
const publication = (candidate: unknown) => {
  try {
    validateSitemap(candidate);
    return 'accepted';
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
};

/** Rejected by the evidence rules themselves, not as an unknown field. */
const expectEvidenceRejected = (candidate: unknown, description: string) => {
  const message = publication(candidate);
  expect(message, description).toMatch(/cannot be published/);
  expect(message, description).not.toMatch(/unknown (?:top-level )?key/);
};

// Every state other than `discovered` claims an observation.
const evidenceStates = [
  'visited',
  'plan_blocked',
  'permission_blocked',
  'error',
  'not_applicable',
];
const timestamp = '2026-10-07T12:00:00Z';

// Token-shaped fixtures are assembled at runtime so no credential-shaped
// literal exists in source. All are synthetic and grant nothing.
const synthetic = (...parts: string[]) => parts.join('_');

test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-320',
    'Pure data-boundary checks run once; browser journeys cover every project.',
  );
});

test('publication boundary rejects unreviewed, private, disconnected and falsely complete snapshots', () => {
  expect(validateSitemap(snapshot()).nodes).toHaveLength(1);
  const invalid = [
    { ...snapshot(), reviewedForPublic: false },
    { ...snapshot(), auditPhase: 'complete' },
    { ...snapshot(), password: 'unexpected raw field' },
    {
      ...snapshot(),
      nodes: [{ ...snapshot().nodes[0], actualValue: 'private row data' }],
    },
    { ...snapshot(), nodes: [{ ...snapshot().nodes[0], executed: true }] },
    {
      ...snapshot(),
      nodes: [{ ...snapshot().nodes[0], parentId: 'missing-parent' }],
    },
    {
      ...snapshot(),
      nodes: [{ ...snapshot().nodes[0], parentId: 'test-root' }],
    },
    { ...snapshot(), nodes: [snapshot().nodes[0], snapshot().nodes[0]] },
    { ...snapshot(), nodes: [{ ...snapshot().nodes[0], status: 'visited' }] },
    {
      ...snapshot(),
      nodes: [{ ...snapshot().nodes[0], notes: ['customer@example.invalid'] }],
    },
    {
      ...snapshot(),
      nodes: [
        {
          ...snapshot().nodes[0],
          notes: ['-----BEGIN OPENSSH PRIVATE KEY-----'],
        },
      ],
    },
    {
      ...snapshot(),
      nodes: [{ ...snapshot().nodes[0], livePath: '//other.example/app' }],
    },
    {
      ...snapshot(),
      nodes: [{ ...snapshot().nodes[0], livePath: '/app/site?token=private' }],
    },
    {
      ...snapshot(),
      nodes: [{ ...snapshot().nodes[0], livePath: '/app/:record' }],
    },
  ];
  for (const candidate of invalid)
    expect(() => validateSitemap(candidate)).toThrow(/cannot be published/);
  for (const path of [
    '//other.example/app',
    '/app/:record',
    '/app/a/../b',
    '/app/a?token=private',
    '/app/a#private',
    '/app/%2e%2e/secrets',
  ])
    expect(pressUrl(path)).toBeUndefined();
  expect(pressUrl('/dashboard/sites')).toBe(
    'https://press.metaframer.net/dashboard/sites',
  );
});

test('evidence states accept a strict observedAt timestamp or a real observedDate', () => {
  for (const status of evidenceStates)
    for (const evidence of [
      { observedAt: timestamp },
      { observedAt: '2026-10-07T15:00:00.123+03:00' },
      { observedDate: '2026-10-07' },
      { observedDate: '2028-02-29' },
      { observedDate: '2000-02-29' },
    ])
      expect(
        publication(withNode({ status, ...evidence })),
        `${status} ${JSON.stringify(evidence)}`,
      ).toBe('accepted');
  expect(publication(withNode({ status: 'discovered' }))).toBe('accepted');
});

test('evidence states need exactly one evidence field and observedDate is a real padded calendar date', () => {
  for (const status of evidenceStates) {
    expectEvidenceRejected(withNode({ status }), `${status} without evidence`);
    expectEvidenceRejected(
      withNode({ status, observedAt: timestamp, observedDate: '2026-10-07' }),
      `${status} with both evidence fields`,
    );
  }
  expectEvidenceRejected(
    withNode({
      status: 'discovered',
      observedAt: timestamp,
      observedDate: '2026-10-07',
    }),
    'discovered with both evidence fields',
  );
  for (const observedDate of [
    '2026-02-29',
    '2100-02-29',
    '2026-04-31',
    '2026-10-07 ',
    '2026-10-32',
    '2026-00-10',
    '2026-10-00',
    '2026-13-01',
    '2026-1-07',
    '2026-10-7',
    '26-10-07',
    ' 2026-10-07',
    '2026-10-07T12:00:00Z',
  ])
    expectEvidenceRejected(
      withNode({ status: 'visited', observedDate }),
      `observedDate "${observedDate}"`,
    );
});

test('date-only evidence renders a bare date and never invents a clock time', () => {
  const [dated] = validateSitemap(
    withNode({ status: 'visited', observedDate: '2026-10-07' }),
  ).nodes;
  const observation = formatObservation(dated);
  expect(observation?.precision).toBe('date');
  expect(observation?.datetime).toBe('2026-10-07');
  expect(observation?.text).toContain('Saat kaydı yok');
  const [timed] = validateSitemap(
    withNode({ status: 'visited', observedAt: timestamp }),
  ).nodes;
  expect(formatObservation(timed)?.precision).toBe('timestamp');
  expect(formatObservation(timed)?.text).not.toContain('Saat kaydı yok');
});

test('observedAt and lastUpdated stay strict timestamps, never bare dates', () => {
  for (const observedAt of [
    '2026-10-07',
    '2026-10-07T12:00:00',
    '2026-10-07 12:00:00Z',
    'yesterday',
  ])
    expectEvidenceRejected(
      withNode({ status: 'visited', observedAt }),
      `observedAt "${observedAt}"`,
    );
  for (const lastUpdated of [
    '2026-10-07',
    '2026-10-07T12:00:00',
    '2026-10-07 12:00:00Z',
    'yesterday',
    '',
  ])
    expect(
      publication({ ...snapshot(), lastUpdated }),
      `lastUpdated "${lastUpdated}"`,
    ).toMatch(/cannot be published/);
});

test('unknown risk is publishable and labelled Belirsiz', () => {
  expect(Object.entries(riskLabels)).toContainEqual(['unknown', 'Belirsiz']);
  expect(publication(withNode({ risk: 'unknown' }))).toBe('accepted');
  expect(publication(withNode({ risk: 'unclassified' }))).toMatch(
    /cannot be published/,
  );
});

test('notes never publish amounts, keys, tokens or contact details', () => {
  for (const note of [
    'Tür: Currency',
    'Alan: price_inr',
    'Alan: price_usd',
    'Seçenek: INR',
    'Seçenek: USD',
    'Press (284), SaaS (19) modül şemaları',
    // Harmless field name that only resembles a token prefix.
    'Alan: github_pat_token',
  ])
    expect(publication(withNode({ notes: [note] })), note).toBe('accepted');
  for (const note of [
    'Ücret INR500',
    'Plan USD100',
    '₹ 500',
    '₹500',
    '500 INR',
    '100USD',
    '$5',
    '€ 20',
    '20 EUR',
    '₺ 300',
    '300 TRY',
    synthetic('sk', 'live', 'SyntheticFixture'.padEnd(24, '0')),
    synthetic('rk', 'live', 'SyntheticFixture'.padEnd(24, '0')),
    synthetic('whsec', 'SyntheticFixture'.padEnd(32, '0')),
    synthetic(
      'github',
      'pat',
      'SYNTHETIC'.padEnd(22, '0'),
      'fixture'.padEnd(59, '0'),
    ),
    synthetic('ghp', 'Synthetic'.padEnd(36, '0')),
    `AKIA${'SYNTHETIC'.padEnd(16, '0')}`,
    'reader@example.invalid',
    'https://reader:synthetic@host.example',
    '-----BEGIN OPENSSH PRIVATE KEY-----',
    '-----BEGIN RSA PRIVATE KEY-----',
    '-----BEGIN EC PRIVATE KEY-----',
    '-----BEGIN PRIVATE KEY-----',
  ])
    expect(publication(withNode({ notes: [note] })), note).toMatch(
      /cannot be published/,
    );
});
