import type { SitemapNode } from './sitemap';

export interface SitemapViews {
  byId: Map<string, SitemapNode>;
  /** Every page plus sections with no page ancestor, including tab/menu ancestors. */
  anchors: SitemapNode[];
  anchorIds: Set<string>;
  /** Pages, tabs, menus and anchors with their ancestors, in data order. */
  navigationNodes: SitemapNode[];
  /** Nearest anchor, the anchor itself included. */
  ownerById: Map<string, string>;
  nodesFor(anchorId: string): SitemapNode[];
  breadcrumbsFor(anchorId: string): SitemapNode[];
}

/** Canonical static detail URL for an anchor. */
export function detailPath(id: string, base: string) {
  return `${base.replace(/\/+$/, '')}/sitemap/${encodeURIComponent(id)}/`;
}

/**
 * Splits validated nodes into a lean root navigation and per-anchor details.
 * Pure: no file, browser or network access. Throws when a component has no
 * anchor, so no node can silently drop out of the static union.
 */
export function buildSitemapViews(nodes: SitemapNode[]): SitemapViews {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const ancestorCache = new Map<string, SitemapNode[]>();
  /** Ancestors root-to-parent. */
  const ancestors = (node: SitemapNode): SitemapNode[] => {
    const cached = ancestorCache.get(node.id);
    if (cached) return cached;
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    const chain = parent ? [...ancestors(parent), parent] : [];
    ancestorCache.set(node.id, chain);
    return chain;
  };

  const isAnchor = (node: SitemapNode) =>
    node.kind === 'page' ||
    (node.kind === 'section' &&
      !ancestors(node).some((ancestor) => ancestor.kind === 'page'));
  const anchors = nodes.filter(isAnchor);
  const anchorIds = new Set(anchors.map((node) => node.id));

  const navIds = new Set<string>();
  for (const node of nodes)
    if (['page', 'tab', 'menu'].includes(node.kind) || anchorIds.has(node.id)) {
      navIds.add(node.id);
      for (const ancestor of ancestors(node)) navIds.add(ancestor.id);
    }
  const navigationNodes = nodes.filter((node) => navIds.has(node.id));

  // Nearest page wins; a navigation section only owns page-less branches.
  const ownerOf = (node: SitemapNode) => {
    if (anchorIds.has(node.id)) return node.id;
    const chain = ancestors(node);
    return (
      chain.filter((ancestor) => ancestor.kind === 'page').at(-1) ??
      chain.filter((ancestor) => anchorIds.has(ancestor.id)).at(-1)
    )?.id;
  };
  const ownerById = new Map<string, string>();
  const unowned: string[] = [];
  for (const node of nodes) {
    const owner = ownerOf(node);
    if (owner) ownerById.set(node.id, owner);
    // Navigation context above every anchor lives on the root only.
    else if (!navIds.has(node.id)) unowned.push(node.id);
  }
  if (unowned.length > 0)
    throw new Error(
      `sitemap nodes without a page or section anchor: ${unowned.slice(0, 20).join(', ')}`,
    );

  /** Nearest strict ancestor anchor. */
  const parentAnchor = (node: SitemapNode) =>
    ancestors(node)
      .filter((ancestor) => anchorIds.has(ancestor.id))
      .at(-1)?.id;

  const nodesFor = (anchorId: string) => {
    if (!anchorIds.has(anchorId))
      throw new Error(`sitemap anchor "${anchorId}" does not exist`);
    return nodes.filter((node) =>
      anchorIds.has(node.id)
        ? node.id === anchorId || parentAnchor(node) === anchorId
        : ownerById.get(node.id) === anchorId,
    );
  };

  const breadcrumbsFor = (anchorId: string) => {
    const node = byId.get(anchorId);
    if (!node) throw new Error(`sitemap anchor "${anchorId}" does not exist`);
    return ancestors(node);
  };

  return {
    byId,
    anchors,
    anchorIds,
    navigationNodes,
    ownerById,
    nodesFor,
    breadcrumbsFor,
  };
}
