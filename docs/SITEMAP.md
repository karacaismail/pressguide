# Press panel haritası (`/pressguide/sitemap/`)

Static, read-only map of Press Dashboard/Desk screens. Built from one reviewed
snapshot; the browser never contacts Press.

## Files

- `src/data/press-sitemap.json` — root/audit only. Reviewed public snapshot;
  other agents never write it.
- `src/sitemap.ts` — types, runtime validator, Turkish labels, loader.
- `src/sitemap-views.ts` — pure ownership split (`buildSitemapViews`,
  `detailPath`): anchors and the nodes each anchor owns. No file system,
  browser or network access. Its count semantics are unchanged.
- `src/sitemap-partitions.ts` — pure bounded partition helper on top of
  `buildSitemapViews` (see "Partition API"). No file system, browser or
  network access.
- `src/pages/sitemap.astro`, `src/pages/sitemap/` routes and the `Sitemap*`
  components (`SitemapDetailPage`, `SitemapIndexPage`, `SitemapPagination`,
  `SitemapBranch`, `SitemapNavigation`, `SitemapControls`) — static documents
  with native `details` trees. No hydration.
- `src/sitemap-search.ts` — vanilla search/filter enhancement for the current
  view/part; no React or Mantine. Compiled at build time to ES2022 by the
  project's TypeScript 6 helper (`src/sitemap-script.ts`) and inlined; the
  browser never receives TypeScript or a hashed script file.
- `src/pages/[dataset].json.ts` — `/pressguide/press-sitemap.json`, the same
  validated snapshot. Explicit download only.
- `src/styles/sitemap.css` — page-only styles on `tokens.css` tokens.
  Standalone links keep `--target-size` in both axes.
- Tests (run after `npm run build`): `tests/sitemap.spec.ts`,
  `tests/sitemap-contract.spec.ts`, `tests/sitemap-static-delivery.spec.ts`,
  `tests/sitemap-partition.spec.ts`, `tests/sitemap-bounded.spec.ts`,
  `tests/sitemap-budget.spec.ts`, `tests/sitemap-known-action.spec.ts`,
  `tests/sitemap-entry.spec.ts` (root entry critical journey: early index
  CTA, tree order, native coverage disclosure).
- `src/sitemap-budgets.ts` — pure measured budget constants (see "Budget").

## Static views and delivery

- `/sitemap/` — only top-level anchors (no strict ancestor that is itself an
  anchor) plus necessary unowned navigation context, with status/source
  badges, Press links, one canonical detail link per anchor and a link to the
  first global index part. No eager children, no field metadata. Kind,
  page-by-source, status, source and risk counts on root are explicitly
  computed from the FULL dataset; view counts describe only rendered items.
  Entry order: exactly one early global index CTA (within the first two
  568 px viewports at 320 CSS px), then the panel tree, then a closed native
  `details` coverage summary. Opened, it shows all 18 `coverageScope` and 25
  `exclusions` strings (43), FULL kind/source/status/risk counts with their
  caveats and the explicit JSON download link. Without JavaScript it
  opens/closes natively with all 43 strings visible; the download is
  reachable only after opening it. The prominent warnings stay before the
  panel tree and the status definitions stay after the disclosure, both
  outside it and accessible without opening it.
- Root `lastUpdated` is shown as `YYYY-MM-DD HH:mm UTC` through the existing
  `formatObservation` helper at build time (same convention as node
  observations); `<time datetime>` keeps the raw JSON timestamp. No browser
  locale or timezone dependency; the JSON value is unchanged.
- `/sitemap/index/<part>/` — global anchor index, 50 entries per part, flat:
  kind, source, status and canonical detail link, no full metadata. Fixed
  previous/next anchors (`rel="prev"`/`rel="next"`), never a list of all parts.
  Gives a complete linear route to every anchor.
- `/sitemap/<anchor>/` — metadata part 1 (canonical detail).
  `/sitemap/<anchor>/components/<part>/` — later parts. Each part repeats the
  full anchor (`data-metadata-primary`), then up to 32 owned nodes in input
  order, plus required ancestor context inside that anchor rendered lean
  (`data-metadata-context`, link to its home part, no notes/options). Every
  owned node has full metadata exactly in its home part.
- `/sitemap/<anchor>/pages/<part>/` — immediate child-anchor index, 50 per
  part. The canonical detail links to its first part only; fixed prev/next
  make every child reachable. Child anchors are not rendered eagerly in
  metadata documents.
- Every document links to the map and actual ancestor anchors. Page-less
  section anchors remain sections; no relabelling, no dropped orphan
  navigation.
- Every node id is reachable in HTML by BFS over local sitemap document links
  from `/sitemap/` (ignoring Press, JSON and hash-only links). A union of
  files in `dist` is not sufficient proof.
- Search (`Bu görünümde ara`) and filters reveal only when the script runs and
  cover only the current view/part; the scope text names the part and states
  that other parts are excluded. Source filters render only where the view
  has a real choice. On a metadata part every rendered row is searchable:
  primary rows by their full own metadata, lean context rows only by their
  visible own label, status, source, kind and surface (their hidden notes,
  options and paths are not emitted or indexed). Source filters match both
  by their own source; unmatched rendered ancestors stay open as context.
  The view count (`N eşleşen öğe, bu görünümde M öğe.`) totals all rendered
  rows, lean context included, and is separate from the FULL-dataset and
  primary metadata counts. No automatic JSON, other-part or document prefetch.
- Navigation uses static anchors and native browser Back. No Back-state
  guarantee is made beyond what tests actually show.
- The publication boundary is a manual pattern screen plus public review. It
  rejects known key, token (including realistic `github_pat_` with a suffix of
  20+ characters and Stripe key shapes), email and amount shapes; it is not
  absolute and does not guarantee that every possible secret is caught.

## Partition API (`src/sitemap-partitions.ts`)

- Exports `INDEX_LIMIT = 50`, `METADATA_LIMIT = 32`, and BASE_URL-aware
  `metadataPath(anchorId, part, base)` (part 1 equals `detailPath`),
  `globalIndexPath(part, base)`, `childIndexPath(anchorId, part, base)`.
- `buildSitemapPartitions(nodes)` returns `{ views, rootNodes,
globalIndexParts, childIndexParts, metadataParts, homeById,
metadataFor(anchorId, part), childrenFor(anchorId) }`.
- MetadataPart `{ anchor, part, totalParts, nodes, primaryIds, contextIds }`;
  at least one per anchor. IndexPart `{ ownerId (null for global), part,
totalParts, nodes }`; no empty index parts. `homeById` maps every anchor
  (part 1) and owned node to `{ anchorId, part }`. `metadataFor` throws on an
  unknown anchor or invalid part.
- Limits are starting algorithm limits, not proof of a budget; the measured
  budget below is the guard.

## Budget (`src/sitemap-budgets.ts`)

One measured budget set for the project; no other sitemap budget applies.

| Document                             | Raw UTF-8 HTML | Parsed DOM elements |
| ------------------------------------ | -------------- | ------------------- |
| Root `/sitemap/`                     | 32 KiB         | 512                 |
| Every global/child index or metadata | 128 KiB        | 2,048               |

- Measurement: frozen 8,095-node snapshot, source SHA256
  `92d5d9c3bec9f62cb11dea6bc88b32acb9c452870c8e6042f6e94643fe4350c6`; raw
  built file bytes; element count of `DOMParser` output without script
  execution. Post-CTA build: 950 total HTML pages built in 1m57s (all guide
  pages included); 914 of them are sitemap documents (root + 913
  detail/index parts).
- Actual (post-CTA, `postcta8095-built-views.json`): root 20,671 bytes /
  245 parsed DOM / 2 rendered nodes. MAX of the 913 others:
  `desk-root/components/31`, 85,123 bytes / 1,357 parsed DOM / 63 rendered
  nodes = 33 primary (32 owned + the repeated anchor) + 30 lean context.
- Rationale: roughly 1.5x headroom over actual MAX while staying far below
  the historical eager documents. Control size, font size and hit areas are
  preserved; the budget is never met by shrinking them.
- Guard: `tests/sitemap-budget.spec.ts` reads every `dist/sitemap` HTML file,
  parses in batches of up to 200 and reports bounded failures (count + first
  20). It also requires root without own metadata and at most 33 primary
  nodes per document; context is reported separately, not counted as
  primary. Runs once on `chromium-320`; other projects skip it intentionally.
  After `npm run build`:
  `npx playwright test tests/sitemap*.spec.ts --project=chromium-320`.

## Contract (schemaVersion 1)

Top level: `schemaVersion: 1`, `lastUpdated` (ISO), `auditPhase`
(`in_progress` | `complete`), `reviewedForPublic: true`, non-empty
`coverageScope[]` and `exclusions[]`, `nodes[]`. No other keys.

Node: `id`, `parentId` (`null` or an existing id), `label`, `surface`
(`dashboard` | `desk`), `kind` (`page` `tab` `section` `field` `table` `menu`
`action` `dialog` `option`), optional `routeTemplate`, `livePath`,
`observedAt` or `observedDate`, `notes[]`, `options[]`, then `status`,
`source`, `risk` (`read` | `write` | `destructive` | `unknown`, labelled
"Belirsiz"), `executed: false`, `functionalTest` (`not_run` | `passed` |
`failed`). No other keys. Notes carry only safe component types, labels and
help text.

`validateSitemap` runs at build time and fails the build, listing every
problem, when: a key or enum value is unknown (for example `surface: 'Desk'`);
ids repeat; a parent is missing; the hierarchy has a cycle; evidence is not
exactly one of `observedAt` (strict timestamp) or `observedDate` (real
calendar `YYYY-MM-DD`, rendered as a bare date with "Saat kaydı yok") for a
non-`discovered` node, or any node has both; `auditPhase: complete` still has
`discovered` nodes; `reviewedForPublic` is not `true`; scope or exclusions are
empty; `executed` is not `false`; or text matches the privacy deny patterns.
Fix the data; never loosen the validator. A missing file renders an explicit
"no data yet" page and generates no JSON.

## Routes and links

- `routeTemplate` is readable metadata only (`/dashboard/sites/:site`,
  `{param}` allowed) and is never a link.
- `livePath` must be a plain path under `/dashboard` or `/app` on
  `https://press.metaframer.net`: no host, query, fragment, `@`, `:` or dot
  segments. Only the own public sample site `egitimxv1` may appear in paths.
- Nodes without `livePath` link to the nearest ancestor that has one, labelled
  "En yakın üst sayfa". Every Press link has `data-live-link`,
  `target="_blank"` and `rel="noopener"`, and requires a Press login.

## Meaning of the data

- `source: live_ui` — seen in the logged-in Press UI. `schema_ui` — read from
  UI schema metadata; **not** proof that the page was opened.
  `official_source` — Press source code or documentation.
- `status: visited` ("İncelendi"): inspected read-only through the recorded
  `source`. Inspection is not a functional test: `functionalTest` stays
  `not_run` unless a separate test ran.
- `status: discovered` ("Keşfedildi, açılmadı") nodes are listed on purpose
  with their not-opened status explicit.
- `risk` describes what the control would do; `executed` is always `false`.
- `complete` means only the stated `coverageScope` finished. Counts are
  absolute; no percentage is shown because the total is unknown. A node is not
  a screen; only `kind: page` approximates a screen.

## Data update workflow (root)

1. Audit agents inspect Press read-only and draft nodes outside this repo.
2. Root removes record values and private identifiers, reviews privacy, sets
   `reviewedForPublic: true` and writes `src/data/press-sitemap.json`.
   Validator failures are fixed in the data.
3. Root runs `npm run check`, `npm run build`, then BFS reachability, network,
   font and performance checks, 320 CSS px Chromium/Firefox/WebKit, then the
   broader matrix.
4. Independent review.
5. Root alone commits with the personal Git author guard and publishes.

## QA history (measurements, not current status)

- Initial eager tree, 808-node snapshot: 970,850 HTML bytes, 22,927 DOM
  nodes; all metadata was in one document then. This is no longer the
  current architecture.
- First split/dedup, 808 nodes: root 301,374 bytes, 3,605 runtime DOM nodes;
  root exceeded the preferred 250 KiB.
- An earlier 126-test broad matrix passed before the split; historical only.
- 808 checkpoint at 320 CSS px, Chromium/Firefox/WebKit: 96 cases, 70 passed,
  26 intentional skips, 0 failed. Evidence folder: checkpoint808 in the QA
  workspace.
- Bounded RED before implementation (old 808 build): 5 failing tests, 4
  assertion failures on missing features and 1 native-click timeout on the
  missing index route. The timeout is not network proof.
- 808 context regression: actual RED, 20 expected vs 18 received; fixed by a
  2-attribute change; isolated 808 GREEN (1 + 4 bounded HTML passes). Not
  8095 passes.
- First 8095 suite: 91 passed, 38 skipped, 12 failed (4 stale test
  assumptions x 3 engines: root source group, closed no-JS index link,
  `CreateStripePlans` classification); tests corrected, logs preserved.
- Pre-CTA 8095 checkpoint (historical only): 320 run 107 passed, 40 skipped;
  broad 1,181 passed, 700 skipped, 0 failed.
- Entry CTA RED before the source fix: 9 failures across Chromium, Firefox
  and WebKit — index CTA too low (Chromium 8,586.640625 px vs
  the 1,136 px limit), native coverage summary absent, wrong tree order.
- First post-CTA 320 run: 111 passed, 40 skipped, 5 failed. 4 were target
  journey failures where the download link was hidden until native open; the
  test now opens the summary first. The 5th, Firefox no-JS
  `toHaveJSProperty`, timed out with `undefined`; exact cause unknown.
  `diagnose-nojs-coverage.json` shows native open attribute, visible content
  and reflected `open` property correct before/after click/close in all 3
  engines; no specific Playwright or Firefox bug is asserted. The test now
  checks the native DOM `open` attribute and keeps all 43-string, native
  close and navigation assertions. No timeout raised, no assertion dropped.
- An earlier startup failure hit a 60 s limit while the full build alone took
  117 s; it ran 0 tests and is not product RED. Build startup
  (`webServer.timeout` 300,000 ms) is separate from the 30 s test timeout.

## Post-CTA status (7 October 2026, historical `92d5…` snapshot)

Commands and reports below were run by root orchestration; files are in
`work/qa/sitemap-review-fixes/`. Current results are under "Closure".

- `npm run check` (`postcta-source-check.txt`): 37 files, 0 errors,
  0 warnings, 0 hints. `npm run build` (`cta-build.txt`): 950 pages in 1m57s.
- 320 run (`postcta8095-320-green-results.json`): the 8 `tests/sitemap*`
  specs on `chromium-320`, `firefox-320`, `webkit-320`, 4 workers: 116
  passed, 40 intentional skips, 0 failed, 0 flaky, 0 errors.
- Broad run (`postcta8095-broad-results.json`): the 8 sitemap specs plus
  `tests/guide.spec.ts` and `tests/delivery.spec.ts` on all 33 projects
  (3 engines x 11 viewport widths; mouse, keyboard and relevant emulated
  coarse/touch input checks run inside the tests, not as separate projects
  or a complete input cross-product), 4 workers: 1,224 passed, 822 intentional
  skips, 0 failed, 0 flaky, 0 errors.
- Built views: see "Budget". Budget values unchanged; nothing inflated, no
  hit area or font shrunk.
- Runtime (`runtime-bounded8095-profiles.json`, local production server,
  isolated cold profiles, Chromium 4x CPU, 320x568): root, global index 1 and
  MAX detail each requested only the document and 2 stylesheets; no failed,
  unexpected, external, script or JSON requests; no horizontal overflow; no
  text below root font. Body decoded bytes: HTML 20,671 / 46,708 / 85,123;
  CSS 12,881. Runtime DOM 244 / 501 / 1,356. Synchronous input dispatch plus
  forced layout per query: at most 16.7 ms (MAX detail). These are local
  emulation, ResourceTiming and decoded body bytes, not wire/CDN or physical
  device performance, and not native INP or field latency. No score or
  compliance claim.
- Entry/coverage (`postcta8095-coverage-entry.json`): Chromium fine and
  coarse, Firefox, WebKit all `pass`. CTA at scrollY 0, bottom ≈531.5 px of
  the 568 px viewport. Summary 296x≈64.8 CSS px (≥44 fine / ≥48 coarse),
  16 px text; Tab focus 3 px solid outline; all 43 strings visible when open,
  opened text ≥16 px, download visible; landscape 568x320 keeps search
  focus without overflow.
- Screenshots (`postcta8095-captures.json`): 18 fresh local captures (9 at
  320, 9 at 1280), Chromium 153.0.8010.12, darwin 25.5.0, captured
  2026-10-07T18:44:11.887Z–18:44:14.479Z. `approvedBaseline: false`: not
  approved references, not live Press, not the user's Chrome.
- Cold actual CI, physical Safari, iOS, Android, screen reader and
  independently approved visual references: not_run.
- Independent review of this post-CTA state: see "Closure".

### Snapshot change after these measurements

The figures above were measured on the historical snapshot
`92d5d9c3…4350c6`; they are not relabelled as data for the current
`08382…` snapshot. Root changed only 2 public scope strings and then
formatted the JSON; nodes, other fields and audit dates stayed identical.

## Closure (7 October 2026, current `08382aea…aba9a0b` snapshot)

Run by root orchestration; files are in `work/qa/sitemap-review-fixes/closure/`.
Snapshot SHA256
`08382aea377f9275c2c5ccd19743778a322f6db970fda310f34b78c80aba9a0b`.

- RED (`closure-red-summary.json`, 320 x 3 engines, report start
  19:23:31Z): 24 passed, 6 intended failures, 0 skipped, 0 setup errors.
  - Product defect, 3 engines: root `lastUpdated` rendered
    "7 Ekim 2026 20:32" (Europe/Istanbul) instead of "2026-10-07 17:32 UTC".
    Repaired in `src/pages/sitemap.astro` only by using the existing
    `formatObservation` server helper. Search code unchanged.
  - Stale test expectation, 3 engines: the metadata-part source filter test
    expected primary-only rows; on the MAX part (`desk-root/components/31`)
    the context rows `desk-module-press` and `desk-module-saas` were matched
    as the product already did. `tests/sitemap.spec.ts` now counts and
    searches every rendered row, lean context included, by its own visible
    text and source. Earlier meaningful assertions are kept.
  - Added coverage that already passed in RED (regression guards, not product
    bugs): coverage `details` initially closed, native no-JS disclosure,
    explicit JSON download link after native open, network after
    open/close, MAX context label semantics.
- Source identity: `before-green-build.json`, `before-green-320.json` and
  `before-green-relevant-broad.json` are contemporaneous file hashes taken
  right before each command; all three list identical hashes, also equal to
  `before-measurements.json`/`after-measurements.json`. The earlier CTA RED
  test file is different: `author-transcript/provenance.json` recovers the
  exact Claude Write tool input, not a filesystem readback; Prettier may have
  reformatted it before that RED ran.
- `npm run format:check` (`full-format-check.txt`): all files pass.
  `npm run check` (`source-check.txt`): 37 files, 0 errors, 0 warnings,
  0 hints. `npm run build` (`green-build.txt`): 950 pages in 1m59s.
- 320 GREEN (`closure-green320-results.json`): all 8 `tests/sitemap*` specs
  on `chromium-320`, `firefox-320`, `webkit-320`, 4 workers: 122 passed,
  40 intentional skips, 0 failed, 0 flaky, 0 errors.
- Relevant bounded subset (`closure-relevant-broad-results.json`):
  `sitemap-entry`, `sitemap` and `sitemap-static-delivery` specs filtered by
  `--grep` to the UTC, 320x568, DOM order, metadata source filter, MAX
  context, root journey and network tests, on all 33 browser/viewport
  projects (3 engines x 11 widths; not a complete input cross-product),
  4 workers: 210 passed, 120 intentional skips, 0 failed, 0 flaky. The full
  1,224/822 broad matrix above is historical pre-closure and was not rerun.
- Built views (`built-views.json`): root 20,896 bytes / 245 parsed DOM /
  2 rendered nodes. MAX of 913 others: `desk-root/components/31`, 85,123
  bytes / 1,357 parsed DOM / 63 rendered = 33 primary + 30 context. Inline
  script 4,597 bytes, no external scripts. Same budget set; nothing changed.
- Runtime (`runtime-profiles.json`, local production server, isolated cold
  profiles, Chromium 153.0.8010.12, 4x CPU, 320x568): root, global index 1
  and MAX detail requested only the document and 2 stylesheets; no failed,
  unexpected, external, script or JSON requests. On root, native coverage
  was opened and closed before this strict document + linked stylesheet
  allowlist check; the download link was inspected (visible after open,
  43 rows) but never clicked. Body bytes: HTML 20,896 / 46,708 / 85,123;
  CSS 12,881; inline JS 4,597 each. Runtime DOM 244 / 501 / 1,356. No
  overflow, no text below root font. Synchronous input + forced layout max
  20 ms (MAX detail, query "site"). Local emulation, not wire/CDN, device,
  native INP or field latency.
- Entry/coverage (`coverage-entry.json`): Chromium fine and coarse, Firefox
  155.0, WebKit 26.6 all `pass`. Initial `open` attribute absent, download
  hidden. Keyboard (9 Tab steps; Alt+Tab in WebKit) focused
  `details[data-coverage-details] > summary` in every profile, fine and
  coarse included: single 3px solid outline, no box shadow, no parent
  outline/shadow; Enter open/close pass. Coarse also did an actual Playwright
  touchscreen tap open/close (Chromium mobile emulation). Summary 296 x
  ≈64.8 CSS px, 16 px text; all 43 strings visible when open; landscape
  568x320 keeps search focus without overflow.
- Screenshots (`captures.json`): 18 targeted local Chromium captures (10 at
  320x568 including fine and coarse keyboard focus, 8 at 1280x800), captured
  2026-10-07T19:34:51.195Z–19:34:53.211Z: UTC root, early CTA, 2 corrected
  scope strings, MAX context label match, schema filter, no results, known
  action, keyboard focus. `approvedBaseline: false`: not approved
  references, not live Press, not the user's Chrome.
- Independent read-only Claude review
  (`claude-final-readonly-review-result.txt`, of the post-CTA state): no
  BLOCKER or MAJOR within its inspected scope; four MINOR findings (closed
  state/no-JS download unguarded, status-definition docs wording, context
  search test assumption, root time without UTC), one root-owned data MINOR
  (run-together scope strings) and listed evidence gaps. Closure addresses
  them as described above; this is not universal approval. A fresh limited
  read-only Claude review (`actual-claude-limited-readonly-review-result.txt`,
  `limited-review-proof.json`) used Read only, ran no commands and wrote
  nothing: 104 Read calls including 20 image reads (18 fresh captures + 2
  historical) and 3 Read errors (2 missing packet paths, 1 size-limit read of
  a 305 KB file). It closed the four MINOR items above (A–D) within its
  inspected scope, found no BLOCKER or MAJOR and left two MINOR factual
  corrections: (1) `AGENTS.md` said `tests/sitemap-entry.spec.ts` guards the
  journey, but warning and status-definition placement is observed, not
  asserted; (2) the packet summary called all six Read errors of the earlier
  final docs author (33 Read, 6 Edit calls) path restrictions, while only 2
  were restricted root proof reads (`prose-change-proof.json`,
  `formatting-proof.json`) and 4 were size-limit reads (305 KB once, 486 KB
  three times). These are closed by the narrowed `AGENTS.md` clause and a
  separately kept local precision record that preserves the original raw
  stream and erroneous summary; no third review and no broad test rerun.
  The reviewer read several evidence files only partly (result JSONs,
  `test-summary.json`, `built-views.json`, `coverage-entry.json`, some
  manifests), did not read the data file, `sitemap-views.ts`,
  `SitemapIndexPage`, `SitemapPagination`, the CSS or the rest of the
  lockfile, and ran nothing. This docs-only correction leaves source,
  runtime, tests and data unchanged. Not release, CI, Pages or server
  approval.
- Not run: actual CI, physical Safari, iOS/Android devices, screen readers,
  approved visual references. Publication and public CI are owned by root;
  local pass is not CI and implies no site/server upgrade.
- `auditPhase` remains `in_progress`. Every node being reachable is not a
  full Press UI or function audit.

Not run is not passed. Update this list only with evidence from root.
