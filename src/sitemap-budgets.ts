/** Raw UTF-8 HTML and parsed element counts; accepted initial budgets unchanged. */
export const ROOT_HTML_BYTES = 32 * 1024;
export const ROOT_DOM_ELEMENTS = 512;
/** One interactive view: 30 results + one complete selected record + 30 children. */
export const PART_HTML_BYTES = 128 * 1024;
export const PART_DOM_ELEMENTS = 2048;
/** Current reviewed JSON is 6,476,806 bytes built; explicit-use cap is 6.5 MiB.
 * This is decoded/raw response size, not compressed transfer or initial delivery.
 */
export const JSON_BYTES = 6.5 * 1024 * 1024;
export type SitemapDocumentBudget = {
  readonly htmlBytes: number;
  readonly domElements: number;
};
export const SITEMAP_BUDGETS = {
  root: { htmlBytes: ROOT_HTML_BYTES, domElements: ROOT_DOM_ELEMENTS },
  part: { htmlBytes: PART_HTML_BYTES, domElements: PART_DOM_ELEMENTS },
} as const;
