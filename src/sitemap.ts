import { readFile } from 'node:fs/promises';

/** Only origin a published livePath may point at. Links require a Press login. */
export const PRESS_ORIGIN = 'https://press.metaframer.net';

const surfaces = ['dashboard', 'desk'] as const;
const kinds = [
  'page',
  'tab',
  'section',
  'field',
  'table',
  'menu',
  'action',
  'dialog',
  'option',
] as const;
const statuses = [
  'discovered',
  'visited',
  'plan_blocked',
  'permission_blocked',
  'error',
  'not_applicable',
] as const;
const sources = ['live_ui', 'schema_ui', 'official_source'] as const;
const risks = ['read', 'write', 'destructive', 'unknown'] as const;
const functionalTests = ['not_run', 'passed', 'failed'] as const;

export type Surface = (typeof surfaces)[number];
export type Kind = (typeof kinds)[number];
export type Status = (typeof statuses)[number];
export type Source = (typeof sources)[number];
export type Risk = (typeof risks)[number];
export type FunctionalTest = (typeof functionalTests)[number];

export interface SitemapNode {
  id: string;
  parentId: string | null;
  label: string;
  surface: Surface;
  kind: Kind;
  routeTemplate?: string;
  livePath?: string;
  status: Status;
  /** Strict ISO timestamp; never together with observedDate. */
  observedAt?: string;
  /** Calendar date when no clock time was recorded. */
  observedDate?: string;
  source: Source;
  notes?: string[];
  options?: string[];
  risk: Risk;
  executed: false;
  functionalTest: FunctionalTest;
}

export interface Sitemap {
  schemaVersion: 1;
  lastUpdated: string;
  auditPhase: 'in_progress' | 'complete';
  reviewedForPublic: true;
  coverageScope: string[];
  exclusions: string[];
  nodes: SitemapNode[];
}

export const surfaceLabels: Record<Surface, string> = {
  dashboard: 'Dashboard',
  desk: 'Desk',
};
export const kindLabels: Record<Kind, string> = {
  page: 'Sayfa',
  tab: 'Sekme',
  section: 'Bölüm',
  field: 'Alan',
  table: 'Tablo',
  menu: 'Menü',
  action: 'Eylem',
  dialog: 'İletişim kutusu',
  option: 'Seçenek',
};
export const statusLabels: Record<Status, string> = {
  discovered: 'Keşfedildi, açılmadı',
  visited: 'İncelendi',
  plan_blocked: 'Plan nedeniyle kapalı',
  permission_blocked: 'Yetki nedeniyle kapalı',
  error: 'Açılırken hata',
  not_applicable: 'Uygulanamaz',
};
export const statusDefinitions: Record<Status, string> = {
  discovered:
    'Bağlantı ya da kaynakta görüldü; sayfa henüz okumak için açılmadı.',
  visited:
    'Yalnızca okuma amaçlı incelendi; nasıl görüldüğünü “Gözlem kaynağı” satırı söyler. Canlı arayüzde görülen öğe ekranda açıldı. Şema üst verisinden okunan öğe için gerçek sayfanın açıldığı kanıtlanmaz. Hiçbir işlem çalıştırılmadı.',
  plan_blocked: 'Sayfa açıldı, ancak örnek sitenin planı içeriği göstermedi.',
  permission_blocked: 'Sayfa açıldı, ancak hesabın yetkisi içeriği göstermedi.',
  error: 'Sayfa açılmaya çalışıldı ve hata görüldü.',
  not_applicable: 'Bu öğe bu kurulumda geçerli değil.',
};
export const sourceLabels: Record<Source, string> = {
  live_ui: 'Canlı arayüzde görüldü',
  schema_ui: 'Şema üst verisi',
  official_source: 'Resmî kaynak',
};
export const sourceDefinitions: Record<Source, string> = {
  live_ui: 'Oturum açık Press arayüzünde gözle görüldü.',
  schema_ui:
    'Arayüz şemasından okundu. Gerçek sayfanın açılıp görüldüğünü kanıtlamaz.',
  official_source:
    'Resmî Press kaynak kodundan ya da belgesinden alındı. Canlı ekran kanıtı değildir.',
};
export const riskLabels: Record<Risk, string> = {
  read: 'Okuma',
  write: 'Yazma',
  destructive: 'Yıkıcı',
  unknown: 'Belirsiz',
};
export const functionalTestLabels: Record<FunctionalTest, string> = {
  not_run: 'Yapılmadı',
  passed: 'Geçti',
  failed: 'Başarısız',
};

const topKeys = new Set([
  'schemaVersion',
  'lastUpdated',
  'auditPhase',
  'reviewedForPublic',
  'coverageScope',
  'exclusions',
  'nodes',
]);
const nodeKeys = new Set([
  'id',
  'parentId',
  'label',
  'surface',
  'kind',
  'routeTemplate',
  'livePath',
  'status',
  'observedAt',
  'observedDate',
  'source',
  'notes',
  'options',
  'risk',
  'executed',
  'functionalTest',
]);
const isoTimestamp =
  /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:Z|[+-](\d{2}):(\d{2}))$/;
const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/;
const routeTemplatePattern = /^\/[A-Za-z0-9._~%:{}/-]*$/;
const livePathPattern = /^\/(?:dashboard|app)(?:\/[A-Za-z0-9._~%-]+)*\/?$/;
/**
 * Pattern screening only; manual public review is still required.
 * Field names such as github_pat_token or a "Stripe Secret Key" label pass;
 * realistic token values, keys, contacts and amounts do not.
 */
const sensitive = new RegExp(
  [
    String.raw`BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY`,
    String.raw`AKIA[0-9A-Z]{16}`,
    String.raw`gh[pousr]_[a-zA-Z0-9]{20,}`,
    String.raw`github_pat_[A-Za-z0-9_]{20,}`,
    String.raw`\b(?:sk|rk)_live_[A-Za-z0-9]{20,}`,
    String.raw`\bwhsec_[A-Za-z0-9]{20,}`,
    String.raw`https?:\/\/[^\s"]+@`,
    String.raw`[\w.+-]+@[\w.-]+\.[a-z]{2,}`,
    String.raw`[$€£₺₹]\s?\d`,
    String.raw`\d\s?(?:USD|EUR|TRY|INR)\b`,
    String.raw`\b(?:USD|EUR|TRY|INR)\s?\d`,
  ].join('|'),
  'i',
);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '';
const isTextList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isText);
/** Real padded calendar date; Date.parse rollover is not accepted. */
const isCalendarDate = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const match = isoDate.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  // setUTCFullYear keeps years 0000-0099; Date.UTC maps them to 1900-1999.
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};
const isTimestamp = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const match = isoTimestamp.exec(value);
  if (!match || !isCalendarDate(match[1])) return false;
  const [hour, minute, second = 0, offsetHour = 0, offsetMinute = 0] = match
    .slice(2)
    .map((part) => (part === undefined ? undefined : Number(part)));
  return (
    hour! <= 23 &&
    minute! <= 59 &&
    second <= 59 &&
    offsetHour <= 23 &&
    offsetMinute <= 59 &&
    !Number.isNaN(Date.parse(value))
  );
};
const isOneOf = <T extends string>(list: readonly T[], value: unknown) =>
  list.includes(value as T);

/** Resolves a livePath only when it stays a plain path on the Press host. */
export function pressUrl(livePath: string) {
  if (!livePathPattern.test(livePath)) return undefined;
  const url = new URL(livePath, PRESS_ORIGIN);
  return url.origin === PRESS_ORIGIN && url.pathname === livePath
    ? url.href
    : undefined;
}

/**
 * Validates the untrusted audit export before anything is published.
 * Collects every problem so root can fix the dataset in one pass.
 */
export function validateSitemap(input: unknown): Sitemap {
  const errors: string[] = [];
  const fail = (message: string) => errors.push(message);
  if (!isRecord(input)) throw new Error('press-sitemap.json: not an object');

  for (const key of Object.keys(input))
    if (!topKeys.has(key)) fail(`unknown top-level key "${key}"`);
  if (input.schemaVersion !== 1) fail('schemaVersion must be 1');
  if (!isTimestamp(input.lastUpdated))
    fail('lastUpdated must be an ISO timestamp');
  if (!isOneOf(['in_progress', 'complete'], input.auditPhase))
    fail('auditPhase must be "in_progress" or "complete"');
  if (input.reviewedForPublic !== true)
    fail('reviewedForPublic must be true before publishing');
  if (!isTextList(input.coverageScope) || input.coverageScope.length === 0)
    fail('coverageScope must list at least one non-empty scope statement');
  if (!isTextList(input.exclusions) || input.exclusions.length === 0)
    fail('exclusions must list at least one non-empty exclusion');
  if (sensitive.test(JSON.stringify(input)))
    fail('dataset contains a credential, email, URL credential or amount');

  const nodes = Array.isArray(input.nodes) ? input.nodes : [];
  if (!Array.isArray(input.nodes)) fail('nodes must be an array');
  if (input.auditPhase === 'complete' && nodes.length === 0)
    fail('a complete audit must contain nodes');

  const parents = new Map<string, unknown>();
  nodes.forEach((node, index) => {
    if (!isRecord(node)) return fail(`nodes[${index}] must be an object`);
    const at = isText(node.id) ? `node "${node.id}"` : `nodes[${index}]`;
    for (const key of Object.keys(node))
      if (!nodeKeys.has(key)) fail(`${at}: unknown key "${key}"`);
    if (!isText(node.id)) fail(`${at}: id must be a non-empty string`);
    else if (parents.has(node.id)) fail(`${at}: duplicate id`);
    else parents.set(node.id, node.parentId);
    if (node.parentId !== null && !isText(node.parentId))
      fail(`${at}: parentId must be null or an id`);
    if (!isText(node.label)) fail(`${at}: label must be a non-empty string`);
    if (!isOneOf(surfaces, node.surface)) fail(`${at}: invalid surface`);
    if (!isOneOf(kinds, node.kind)) fail(`${at}: invalid kind`);
    if (!isOneOf(statuses, node.status)) fail(`${at}: invalid status`);
    if (!isOneOf(sources, node.source)) fail(`${at}: invalid source`);
    if (!isOneOf(risks, node.risk)) fail(`${at}: invalid risk`);
    if (!isOneOf(functionalTests, node.functionalTest))
      fail(`${at}: invalid functionalTest`);
    if (node.executed !== false) fail(`${at}: executed must be false`);
    if (
      'routeTemplate' in node &&
      !(
        typeof node.routeTemplate === 'string' &&
        routeTemplatePattern.test(node.routeTemplate)
      )
    )
      fail(`${at}: routeTemplate must be a path without query or host`);
    if (
      'livePath' in node &&
      !(typeof node.livePath === 'string' && pressUrl(node.livePath))
    )
      fail(`${at}: livePath must be a plain /dashboard or /app path`);
    if ('observedAt' in node && !isTimestamp(node.observedAt))
      fail(`${at}: observedAt must be an ISO timestamp`);
    if ('observedDate' in node && !isCalendarDate(node.observedDate))
      fail(`${at}: observedDate must be a real YYYY-MM-DD date`);
    const evidence = ['observedAt', 'observedDate'].filter(
      (key) => key in node,
    );
    if (evidence.length > 1)
      fail(`${at}: use either observedAt or observedDate, not both`);
    else if (node.status !== 'discovered' && evidence.length === 0)
      fail(
        `${at}: status "${node.status}" requires observedAt or observedDate`,
      );
    if (input.auditPhase === 'complete' && node.status === 'discovered')
      fail(`${at}: a complete audit cannot keep discovered nodes`);
    for (const key of ['notes', 'options'] as const)
      if (key in node && !isTextList(node[key]))
        fail(`${at}: ${key} must be a list of non-empty strings`);
  });

  for (const [id, parentId] of parents) {
    const chain = new Set([id]);
    let current = parentId;
    while (typeof current === 'string') {
      if (!parents.has(current)) {
        fail(`node "${id}": parent "${current}" does not exist`);
        break;
      }
      if (chain.has(current)) {
        fail(`node "${id}": hierarchy cycle through "${current}"`);
        break;
      }
      chain.add(current);
      current = parents.get(current);
    }
  }

  if (errors.length > 0)
    throw new Error(
      `press-sitemap.json cannot be published:\n- ${errors.join('\n- ')}`,
    );
  return input as unknown as Sitemap;
}

/** Reads the root-owned snapshot. Missing file means nothing is published yet. */
export async function loadSitemap(): Promise<Sitemap | undefined> {
  let raw: string;
  try {
    raw = await readFile(
      new URL('src/data/press-sitemap.json', `file://${process.cwd()}/`),
      'utf8',
    );
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT')
      return undefined;
    throw error;
  }
  return validateSitemap(JSON.parse(raw));
}

export interface Observation {
  datetime: string;
  text: string;
  precision: 'timestamp' | 'date';
}

/**
 * Observation for a <time> element. A date-only record keeps a bare date
 * and says no time was recorded; a clock time is never invented.
 */
export function formatObservation(
  node: Pick<SitemapNode, 'observedAt' | 'observedDate'>,
): Observation | undefined {
  if (node.observedAt) {
    const utc = new Date(node.observedAt).toISOString();
    return {
      datetime: node.observedAt,
      text: `${utc.slice(0, 10)} ${utc.slice(11, 16)} UTC`,
      precision: 'timestamp',
    };
  }
  if (node.observedDate)
    return {
      datetime: node.observedDate,
      text: `${node.observedDate} (Saat kaydı yok)`,
      precision: 'date',
    };
  return undefined;
}

/** Nearest ancestor with a verified livePath, for nodes without their own. */
export function nearestLinkedAncestor(
  node: SitemapNode,
  byId: Map<string, SitemapNode>,
) {
  let current = node.parentId ? byId.get(node.parentId) : undefined;
  while (current && !current.livePath)
    current = current.parentId ? byId.get(current.parentId) : undefined;
  return current;
}
