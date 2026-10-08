import type { SitemapNode } from './sitemap';
import { buildSitemapViews } from './sitemap-views';
/** Lean SSR navigation only. Every remaining node stays in the validated JSON.
 * Pagination is inline in sitemap-search.ts; no static partition documents exist.
 */
export function buildSitemapEntry(nodes: SitemapNode[]) {
  const views = buildSitemapViews(nodes);
  const rootNodes = nodes.filter((node) => {
    if (!views.anchorIds.has(node.id)) return !views.ownerById.has(node.id);
    return !views
      .breadcrumbsFor(node.id)
      .some((parent) => views.anchorIds.has(parent.id));
  });
  return { views, rootNodes };
}
