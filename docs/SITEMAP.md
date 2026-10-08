# Press panel haritası (`/pressguide/sitemap/`)

Static, read-only map of Press Dashboard/Desk screens. Built from one reviewed
snapshot; the browser never contacts Press.

## Single-page architecture (current)

The user requested one clickable map, compact wording and complete records.
Only `/sitemap/` is generated: no per-node, global-index, child-index or
metadata HTML routes. The historical QA entries below describe the earlier
partitioned architecture and do not certify this change.

- `src/sitemap.ts` still validates every source record at build time. No source
  metadata is removed, renamed or reclassified by this UI change.
- `src/sitemap-views.ts` identifies the lean SSR entry; `detailPath` returns
  the same `/sitemap/#node=<encoded ID>` for every node.
- `src/sitemap-partitions.ts` now exports only `buildSitemapEntry`: top-level
  anchors and unowned navigation context. No partitions are generated.
- `src/pages/sitemap.astro` and `SitemapNavigation.astro` render the entry,
  UTC timestamp, warnings, native coverage disclosure containing every scope
  and exclusion, full-data counts and status definitions.
- `src/sitemap-search.ts` is vanilla browser enhancement, transformed and
  minified by Astro's existing esbuild dependency to inline ES2022 JavaScript
  through `src/sitemap-script.ts`. No React/Mantine, source maps or extra
  script requests are delivered for the map.
- Initial navigation requests only its HTML and linked CSS. Explicit “Tüm
  öğeleri aç”, node selection or a node deep-link loads the same-origin
  validated `/press-sitemap.json` once; concurrent requests share one promise.
  Failures allow retry. A lightweight browser boundary rejects malformed
  records, duplicate/missing parent IDs, cycles, invalid classifications and
  unsafe live paths before rendering; comprehensive publication validation
  remains the build-time validator.
- Search reads all record fields and labels, including notes/options and IDs.
  Results and direct children are independently paginated inline, 30 at a
  time. Every node is listed in the global result sequence. Selection shows
  its classification, evidence status, ancestor navigation and complete raw
  metadata in a native disclosure. All data uses textContent, never innerHTML.
- Selection changes only the selected region. Hash history, entered search
  text and search focus persist on Back/Forward and viewport changes. Own
  Press links use livePath; otherwise the nearest linked ancestor is named.
  A route template is metadata and never becomes an invented Press link.
- JavaScript disabled: root navigation, scopes, full counts, definitions and
  same-origin JSON download remain readable. Interactive search/selection
  requires JavaScript; the entire detailed map is available as JSON rather
  than thousands of HTML pages. This baseline limitation is shown explicitly.
- `src/styles/sitemap-inline.css` adds only scoped styles using the existing
  semantic tokens. Shared minimum fonts and one-control focus are preserved.

## Budgets and regressions

One budget set in `src/sitemap-budgets.ts`: initial raw UTF-8 HTML ≤32 KiB and
parsed DOM ≤512, unchanged. After explicit interaction, the entire document
must remain ≤2,048 elements and selected metadata uses the existing 128 KiB
view allowance. The full JSON is an honest separate explicit-use cost: current
built file 6,476,806 raw bytes, cap 6.5 MiB. These are decoded/raw sizes, not
compressed transfer claims. No JSON is requested before interaction unless
navigation itself explicitly includes a node hash.

The obsolete five multi-document suites (partition/BFS/detail/index/old scoped
search) are replaced, not skipped: `sitemap-single-page.spec.ts` checks one
HTML route, all-node inline enumeration, published JSON equality to validated
source, conditional network delivery, bounded DOM, complete selected metadata,
action/unknown evidence fidelity, genuine ancestor links, retry/invalid-load
handling, text-only metadata, history/focus/resize and full count groups.
`sitemap-entry.spec.ts` preserves the early CTA and complete native coverage,
UTC timestamp and JS-off download. `sitemap-budget.spec.ts` preserves the
initial budget and bounds explicit-use DOM/JSON. The existing coverage focus
regression keeps its assertions; only its preceding control changes to the
new explorer button. Pure source-contract suites remain unchanged.

Actual RED: the one-page assertion found 1,195 sitemap HTML documents instead
of one. Initial focused GREEN: 11/11 on Chromium at 320 CSS px, after fixing
an actual hidden-button CSS override and updating the focus regression's
preceding-control seed. Build and Astro check were run locally; final combined
source and browser matrix verification belongs to the root delivery record.
Real Safari/devices, screen reader, approved visual baselines, CI and production
are not claimed by this focused run.

## Compact delivery verification — 8 October 2026

Home instructions were shortened by 55%; eight primary steps replace the default
67-step dump. All 67 IDs, statuses, notes, verification and screenshot evidence remain
available. The map retains all 11,724 records in one HTML route. Outfit is locally
bundled for body/headings; code retains monospace and upstream font OFL is preserved.

Final frozen-build checks: 31/31 at Chromium320; relevant 33-project matrix 801 passed,
222 conditional skips, zero failures. Astro check, build and formatting passed.
Map HTML 32,712 raw bytes; JSON 6,476,806; two variable font subsets 46,988.
Actual RED/GREEN covers one-route generation, compact home, Outfit and pagination/
retry/date handling. WebKit limited Tab mode and full-control Alt+Shift+Tab are
reported separately. Independent bounded review found no remaining actionable
finding after two pagination-focus corrections and inspected final home screenshots.
Physical devices/Safari, screen reader, sitemap pixel review and approved visual
baselines remain not_run. CI and live publication are separate delivery evidence.

## Contract (schemaVersion 1)

Top level: `schemaVersion: 1`, `lastUpdated` (ISO), `auditPhase`
(`in_progress` | `complete`), `reviewedForPublic: true`, non-empty
`coverageScope[]` and `exclusions[]`, `nodes[]`. No other keys.
`lastUpdated` is the latest source observation checkpoint represented in the
snapshot, not the file's last edit or finalization time; no separate edit
timestamp is recorded.

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
- Nodes without `livePath` link to the nearest ancestor that has one, explicitly labelled as an upper page. Every Press link has
  `target="_blank"` and `rel="noopener noreferrer"`, and requires a Press login.

## Meaning of the data

- `source: live_ui` — seen in the logged-in Press UI. `schema_ui` — read from
  UI schema metadata; **not** proof that the page was opened.
  `official_source` — Press source code or documentation.
- `status: visited` ("İncelendi"): inspected read-only through the recorded
  `source`. Inspection is not a functional test: `functionalTest` stays
  `not_run` unless a separate test ran.
- `status: discovered` ("Keşfedildi, açılmadı") nodes are listed on purpose
  with their not-opened status explicit.
- `risk` is a recorded, coarse label; it is not a functional or runtime
  check of what the control does. `executed` is always `false`, and
  `functionalTest` stays `not_run` unless a separate test ran. Where the
  operations, lifecycle and resources UI batches assign `risk` to an action
  control through their `action_risk` label keyword heuristic (destructive
  keywords first, then write keywords, otherwise `unknown`), the value is
  only a keyword match. Not every node in those batches, and no older
  retained node, is shown to have passed through that heuristic; other
  recorded values keep their existing origin. Nodes built without an
  explicit value default to `read`, an inspection convention, not proof of
  runtime safety. Keyword matches are coarse: the same `Toggle Sidebar`
  label is recorded as `write` on some nodes and `read` or `unknown` on
  others, without proof of a server change. The label is not an impact
  scale: `destructive` does not mark every critical operation
  (`Reset Root Password`, `Reboot with serial console`, `Stop MariaDB` and
  `Suspend Sites` are recorded as `write` yet need critical-operation
  review), and `unknown` is not safe. No risk label grants permission to
  run an operation; never execute one automatically from its label.
  Recorded source classifications stay unchanged; no complete risk
  normalization is claimed.
- `observedAt` in the added UI batches is a source-recorded checkpoint for
  observing a type; list and form nodes of the same type may share it. It is
  not an independently verified per-page event time with millisecond
  precision. Raw values and their display through `formatObservation` stay
  unchanged; later metadata export timestamps are a separate concept.
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
`work/qa/sitemap-review-fixes/`. Later results for the `08382aea…` snapshot are under "Closure"; neither
section is a run on any later snapshot.

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

## Closure (7 October 2026, `08382aea…aba9a0b` snapshot)

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

## Pre-correction measurement (frozen `ad1ae1d2…` snapshot, 9,501 nodes)

Recorded from root orchestration's built-view measurement and the actual
independent read-only review of this snapshot. Snapshot SHA256
`ad1ae1d2855950c07b4706ad97ec385c2cb9f20ee687143aff8d3036601da87d`.
These figures were measured before the four MINOR corrections (unsaved-form
`routeTemplate`, `lastUpdated` meaning, consolidated scope/exclusion strings,
budget wording); they are not post-correction or post-consolidation results.

- Built views (`work/qa/next-public-browser-qa/runner/built-views.json`,
  measured 2026-10-07T21:13:29.792Z, Chromium 153.0.8010.12, darwin 25.5.0):
  1,020 sitemap documents (root + 1,019 others). Root 25,737 raw UTF-8 bytes
  / 264 parsed DOM / 2 rendered nodes, ≈1.27x byte headroom
  (32,768 / 25,737). MAX of the others unchanged: `desk-root/components/31`,
  85,123 bytes / 1,357 parsed DOM / 63 rendered = 33 primary + 30 context.
  Largest added `desk-live` part, as cited by the review:
  `desk-live-infrastructure-database-server-form/components/2`, 59,028 bytes
  / 1,073 parsed DOM. Inline script 4,597 bytes, no external scripts.
  `violations: []` across all 1,020 documents.
- This is a source build measurement only, not CI, release, Pages, server or
  production approval. The budget set is unchanged: nothing raised, no
  control, font or hit area shrunk. No risk normalization is implied.
- Gaps left open by the review: the existing server and `dist` reused by the
  320 retry are not identified; no screenshot shows any of the 1,406 added or
  63 promoted nodes; the Node 22.12 minimum was not run. Actual CI, physical
  Safari, iOS/Android devices, screen readers, approved visual references,
  live Press functions, writes and publication: not_run.
- Post-correction build, re-measurement and tests: pending, owned by root.
  Append them as a separate entry with their own evidence; do not overwrite
  these pre-correction figures.

## Post-correction closure (2026-10-08, 9,501 nodes)

Root applied the actual Claude author's exact proposals, then formatted the
data and new observation-contract spec. Data SHA256
`45e439d2d85eb60844f558342695f486bdbe466aa161154eea6fdd07d7135251`.
The 13 newly observed unsaved forms now use `{record-or-unsaved}`; the
latest-source-observation meaning, representative-form wording and public
Version Upgrade note are corrected. All 8,032 previously unchanged nodes,
the older five unsaved forms, and scope indices 7/17 remain unchanged.
Scope/exclusions now have 22/30 strings; counts remain data-derived.

- Regression evidence: before correction, the new durable pure-data spec
  recorded 1 pass / 16 failures / 0 setup errors. After correction, eight
  separate private preservation/meaning guards passed. The durable spec is
  included in the fresh 320 run below; its older source failure is preserved.
- `format:check` passed; `astro check` inspected 38 files with 0 errors,
  warnings or hints; build generated 1,056 pages in 1m 51s. Node v24.21.0,
  Playwright 1.63.0; dependencies, lockfile and core UI are unchanged.
- Fresh build provenance: root copied the build to an immutable local
  snapshot (1,092 files) and started an owned server on 127.0.0.1:47322.
  Every one of 1,382 served response records matched that manifest's exact
  SHA256 and byte count; the original `dist`, snapshot and source stayed
  unchanged. Its JSON output equals the validated source semantically.
  Tests did not reuse the existing 47321 server. The owned server was stopped
  after measurements; the existing server was untouched.
- 320-first, Chromium/Firefox/WebKit: 139 passed / 74 intentionally skipped
  / 0 failed / 0 flaky. Relevant subset over 33 engine/viewport projects:
  210 passed / 120 intentionally skipped / 0 failed / 0 flaky. This is not
  the full suite or a width × input cross-product. Entry journeys explicitly
  use 320×568; other existing project dimensions are preserved.
- All 1,020 sitemap documents remain within the unchanged budgets. Root:
  24,984 raw UTF-8 bytes / 254 parsed DOM / 2 rendered nodes. MAX remains
  85,123 bytes / 1,357 parsed DOM. Inline script remains 4,597 bytes.
  Consolidation reduced root by 753 bytes and 10 DOM elements compared with
  the frozen pre-correction measurement above; no threshold was raised.
- Cold local root/index/MAX each requested only the document + two linked
  stylesheets (12,881 decoded stylesheet bytes). No failed, unexpected,
  external, JS, JSON or image requests. The explicit JSON download was
  inspected but not clicked. Local response bytes are distinct from
  Navigation Timing transfer sizes; handler/layout timing is not field INP.
- Actual keyboard summary focus and native Enter open/close passed in fine
  Chromium, coarse Chromium, Firefox and WebKit emulation. Coarse Chromium
  touchscreen tap is separately verified. Computed focus is one 3px outline
  on the control; parent outline/shadow are absent. Visible fonts are at
  least the root 16px in the measured profiles; landscape retains search
  input and focus without page overflow. These are measured profiles,
  not claims for every physical input/device combination.
- 26 fresh local guide screenshots include eight new views of an added
  unsaved form template, a promoted unsaved ledger, the corrected Version
  Upgrade note and the still-discovered Press Job form, at 320 and 1280.
  They are unapproved QA evidence, not live Press screenshot exports.

Evidence is under `work/qa/9501-review-closure/`: build/test outputs,
`snapshot-manifest.json`, `served-responses.jsonl`, `closure-summary.json`
and the runner's five measurement/capture results. The original independent
Claude review applies to the pre-correction snapshot; root self-reviewed the
narrow correction and new test. Additional independent pixel QA is recorded
separately and does not imply source approval or computed-style verification.
That additional reviewer opened all 26 PNGs at original resolution and found
no actionable visible defect. It was pixel-only: source/skills/lock/test text
could not be independently read with its available read-only tools; root
self-review and the earlier actual Claude source review remain distinct.

At this checkpoint, physical Safari/iOS/Android, screen readers, Node 22.12,
approved visual references, current CI/Pages, field INP and live Press
functional/write/upgrade checks remain not_run. General UI audit remains
in_progress; publication of this guide is separate from production readiness.

## Following source integration (2026-10-08, 10,513 nodes)

Source SHA256 `106176bf6a9cbf11a1a39db653e702de42e8303dc02dec0489c88f093e247255`.
The source has 32 scope and 42 exclusion strings; `auditPhase` remains
`in_progress`. `lastUpdated` is `2026-10-07T20:51:55.110Z`, the latest source
observation, not the build, review or publication time. The later private
observation packets are not part of this snapshot.

Four actual read-only Claude delta reviews covered 1,098 changed nodes
(1,012 added, 86 promoted). All 253 returned numbered Read ranges matched
their immutable public-safe inputs exactly, without outside reads, errors
or missing ranges. This was a delta review, not a full 10,513-node re-review.
The resulting correction changes 113 fields across 98 nodes: empty-row
unknown status, generic route caveats, exact menu labels and page-header
action context. A separate read-only reviewer found no actionable findings
within that correction and proposed-test scope. The final public data equals
the corrected private candidate semantically except for root's deliberate
`reviewedForPublic: true`; formatting changes no meaning.

The durable observation-contract spec now covers all 45 observed unsaved
forms. Its real pre-integration RED had 32 failed and 17 passed assertions,
with zero setup errors; its post-integration GREEN passed all 49 tests.
This pure-data run used no browser fixtures. Format check passed, Astro
checked 38 files with zero errors, warnings or hints, and build generated
1,161 static pages in 3m 29s. Dependencies, lockfile, UI implementation,
fonts, targets, focus rules and budgets are unchanged.

An independent QA worker froze 1,197 built files on its owned 47322 server.
The 320-first Chromium/Firefox/WebKit run passed 171 tests, skipped 138
deliberately and had zero failed/flaky tests. An expanded relevant subset
over 33 engine/viewport projects passed 408, skipped 120 deliberately and
had zero failed/flaky tests. Some targeted entry and landscape tests use
their own fixed viewport; project names do not imply a full width/input
cross-product. The shared 47321 process was not operated on; root's build
can refresh its served dist content, which is not an immutable QA snapshot.

All 1,125 sitemap documents fit the unchanged budget set. Root: 28,941
raw UTF-8 bytes / 276 parsed DOM elements; maximum detail: 85,123 bytes /
1,357 parsed elements. Inline script remains 4,597 bytes. Cold local
root/index/MAX requested only their document and two linked stylesheets
(12,881 decoded CSS bytes), with no failed/unexpected/external, JS, JSON or
image requests. The JSON download was inspected and never clicked.
Keyboard, coarse touch, no-JS entry, minimum font and network assertions
are measured emulation results, not physical Safari/device acceptance.

Final screenshot inspection, capture-correction history, server shutdown
and publication are separate closure evidence. Physical macOS/iOS Safari,
Android, screen readers, minimum Node 22.12, approved visual references,
field INP and live Press functional/write/upgrade acceptance remain not_run.

## Coverage focus clearance closure (2026-10-08, same 10,513-node source)

The preceding integration and QA record describes the pre-fix UI snapshot.
Independent pixel inspection subsequently found a pre-existing MINOR defect:
the coverage summary's keyboard outline overlapped the preceding heading at 320. Its prior QA evidence was frozen with that finding open; no old result,
image or approved visual reference was relabelled.

The new `sitemap-coverage-focus-clearance.spec.ts` produced genuine RED on
the old immutable build: three keyboard failures and three pointer passes,
with zero setup failures. Real Tab reached the disclosure, and computed
clearance was -5.125 px Chromium, -7.066711 px Firefox and -6.197266 px
WebKit. Root then added only `.sitemap-coverage` normal-flow
`margin-block-start: var(--space-sm)` using the existing central token.
Text, hit areas, native disclosure behavior and the single keyboard outline
remain intact. The test bytes stayed unchanged between RED and GREEN.

Root format/check passed (39 checked files, zero diagnostics); the new
build completed 1,161 pages in 3m 31s. Its original complete terminal log
was not saved. Independent QA froze a fresh build manifest
`fbdad80a4cd816fe43be8069101f19dad286bba4ad735d1fda689dfc32bf22e2`.
GREEN passed 6/6 first at 320, then 66/66 focus checks over the 33 configured
engine/viewport projects, without skips, failures or flakiness. A bounded
existing entry/readability/network/budget subset passed 310 and skipped
152 under unchanged conditional rules, with no failed/flaky cases. This
is a selected subset, not a full width/input cross-product or suite rerun.

All 1,125 sitemap documents remain within the unchanged budgets: root
28,941 raw bytes / 276 parsed elements; maximum detail 85,123 / 1,357.
Linked CSS totals 12,934 decoded bytes, 53 bytes above the predecessor.
Cold local root/index/MAX profiles request only their document and two
stylesheets, with zero failed/unexpected/external, JS, JSON or image
requests. Local 4x CPU synchronous input/layout timing is not field INP.
All 1,528 RED/GREEN response hashes and sizes match their own manifests.
All seven new owned server PIDs were absent and port 47322 refused a
connection after shutdown; no graceful-handler claim is made. The shared
47321 process was not operated on; its served content is not immutable.

Twelve separate before/after closed/open 320 PNGs were independently
opened by both the QA worker and the read-only standards reviewer.
GREEN clearance in both states is +6.875 px Chromium, +4.933334 px Firefox
and +5.802734 px WebKit; ancestors have no outline/shadow, minimum text
is preserved and there is no horizontal overflow. The reviewer found no
actionable findings within the three-line CSS and new-test scope; public
data changes and production operations were outside that review.

Artifacts: `work/qa/10513-focus-clearance/` and
`outputs/press-sitemap-qa/10513-focus-clearance/`. Prior QA/capture
correction history remains separate in `10513-public-browser-qa`.
Physical Safari/devices, screen readers, fresh touch/zoom acceptance,
minimum Node 22.12, approved visual references, field INP and current
CI/Pages remain unverified at this pre-publication checkpoint. The source
still has `auditPhase: in_progress`; guide publication never certifies
Press functionality or production upgrade readiness.

## 8 Ekim 2026: 10.976 öğelik ek gözlem

Bu veri güncellemesi 10.513 öğelik yayına 463 öğe ekler, 29 mevcut öğenin kanıtlı metadata durumunu günceller; hiçbir öğe kaldırılmaz. Kaynak SHA256: `7eeaae7689631eea40014647b19337c041dfa35953e31088ecc00087537bab7a`. `auditPhase` hâlâ `in_progress`; gözlem zamanı yayın veya tamamlanma zamanı değildir.

Gerçek tam form defteri 189/196, kalan 7 formdur. Genel haritadaki 109 visited/87 discovered form sınıfları ayrı ölçümdür; eski gözlemler topluca yeniden sınıflandırılmadı. Bu paket Communication/Jobs, beş yeni tam form ve native Incident/child satır bağlamlarını içerir. Sonraki Hybrid Saas Pool, Incident Settings ve Marketplace App Plan incelemeleri bu sabit kaynağa dahil değildir.

Bağımsız metadata incelemesinde engelleyici veya büyük bulgu bulunmadı. Bir özel kaynak açıklaması için ayrı düzeltme kaydı tutuldu; yayımlanan düğümler etkilenmedi. Gerçek Claude çalıştırması kullanım limitinde, dosya okuması başlamadan durdu: 0/26 Read, inceleme sonucu yok. Bu yayın için Claude onayı veya tüm panelin tamamlandığı iddiası yoktur.

TDD: yeni tam formların kaydedilmemiş bağlamını ve sonraki Incident satır gözleminin önceki Monitor Server hatasını silmemesini koruyan iki regresyon, entegrasyondan önce başarısız, sonra başarılı oldu. Operasyonlar çalıştırılmadı; güncelleme, ödeme, silme ve diğer işlevlerin sonuçları `not_run` kalır. Ekran görüntüsü, gerçek cihaz, sunucu güncellemesi ve üretim kabulü bu metadata testleriyle doğrulanmaz. CI ve canlı yayın sonucu ayrıca doğrulanır.

## 2026-10-08 child metadata publication candidate: 11,625 nodes

Source SHA-256 `8d6914c175b30f9711fd2d93e87ca23bc3d39b85797f50997922dcf2af9fa9db` adds 649 nodes to the 10,976 source; every preceding node object and order is preserved. Live observations cover locally expanded unsaved child rows; actual labels, types and options are distinct from grid-only headers and unknown/hidden contexts. All operations stay executed=false and functionalTest=not_run. The audit remains in_progress. Latest Saas Settings and Press Settings row observations are outside this frozen candidate.

Coverage/exclusion wording was compacted without changing array order or lengths. Independent review found four wording ambiguities; the publisher restored the prohibition on automatic execution from risk labels and the distinction that old/user images were not used. Unknown labels/options and historical context remain explicit. No validator, UI code, dependency, budget or infrastructure changed.

Two durable data regressions guard hidden permissions as discovered, and actual restoration Duration controls separately from test grid-only Duration. Correct-cwd RED2 then GREEN60 source contract tests; an earlier wrong-cwd setup run is not regression evidence. Prettier formatting means no pre-format whole-test byte-identity claim. Astro check41 files/0 issues; production build1230 pages/3m5s. Frozen-build Chromium32010 pass; Firefox/WebKit320 and1280 subset24 pass/16 conditional skips. Root HTML30035/32768 bytes. Local subset results do not replace the full CI matrix or physical Safari/iOS/Android/screen-reader checks.

Independent read-only review found no actionable findings in source/data/test scope. The reviewer read bound source and local QA artifacts, did not run checks and did not inspect new pixels. Latest actual Claude attempt hit usage limit without a verdict; this integration and publication are ROOT work. Screenshot files for these row observations are not_saved. Pages and live verification are recorded separately after deployment.

## 8 Ekim: koşullu satır metadata eki

Sitemap kaynağı 11.724 öğeye çıkarıldı: önceki 11.625 öğenin nesneleri ve sırası aynen korunarak 99 kayıt eklendi. SaaS/Press Settings, Agent Update, Team Deletion, Self Hosted Server, Bench Variable, Site Action, Deploy Candidate, Support Access ve iki Table MultiSelect kontrolünün değer içermeyen metadata kayıtları eklenir. Team inline kontrolleri genişletilmiş satır kanıtı sayılmaz; Self Hosted Sites boş modalı bilinmeyen kalır. İşlem yürütme ve işlev doğrulaması `not_run`; tarama `in_progress`. Ekran görüntüsü dosya/işaretleme kanıtı bu ek için yoktur. Daha sonraki Alertmanager, Consultant, mevcut Release Group Dependency ve mevcut Bench App gözlemleri bu yayın anlık kaydının dışındadır.

Yeni regresyon testleri mevcut kaynakta iki beklenen assertion hatası verdi; 11.724 kaynakla dört test geçti. Bağımsız kaynak/veri/test incelemesinde eyleme dönük bulgu çıkmadı. Üretim derleme, tarayıcı ve CI sonuçları yayın kanıtında ayrıca raporlanır; bu metin bütün panelin tamamlandığını söylemez.
