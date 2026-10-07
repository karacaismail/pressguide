/**
 * The project's single measured budget set for built sitemap documents.
 * Measured on the frozen 8,095-node snapshot (source SHA 92d5d9c3...):
 * post-CTA root 20,671 UTF-8 bytes / 245 parsed DOM elements; MAX of the
 * 913 other documents 85,123 bytes / 1,357 parsed DOM elements. Rationale and
 * measurement conditions: docs/SITEMAP.md. Pure constants; no framework,
 * runtime, file system or network access.
 */
export type SitemapDocumentBudget = {
  /** Raw built HTML, UTF-8 bytes. */
  readonly htmlBytes: number;
  /** Elements in the parsed document, scripts not executed. */
  readonly domElements: number;
};

export const ROOT_HTML_BYTES = 32 * 1024;
export const ROOT_DOM_ELEMENTS = 512;
export const PART_HTML_BYTES = 128 * 1024;
export const PART_DOM_ELEMENTS = 2048;

export const SITEMAP_BUDGETS: {
  readonly root: SitemapDocumentBudget;
  /** Every global/child index part and metadata part. */
  readonly part: SitemapDocumentBudget;
} = {
  root: { htmlBytes: ROOT_HTML_BYTES, domElements: ROOT_DOM_ELEMENTS },
  part: { htmlBytes: PART_HTML_BYTES, domElements: PART_DOM_ELEMENTS },
};
