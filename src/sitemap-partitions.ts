import type { SitemapNode } from './sitemap';
import {
  buildSitemapViews,
  detailPath,
  type SitemapViews,
} from './sitemap-views';

export const INDEX_LIMIT = 50;
export const METADATA_LIMIT = 32;

export interface MetadataPart {
  anchor: SitemapNode;
  part: number;
  totalParts: number;
  /** Anchor, owned segment and required ancestor context, in input order. */
  nodes: SitemapNode[];
  primaryIds: Set<string>;
  contextIds: Set<string>;
}

export interface IndexPart {
  /** Null for the global anchor index. */
  ownerId: string | null;
  part: number;
  totalParts: number;
  nodes: SitemapNode[];
}

export interface HomeLocation {
  anchorId: string;
  part: number;
}

export interface SitemapPartitions {
  views: SitemapViews;
  rootNodes: SitemapNode[];
  globalIndexParts: IndexPart[];
  childIndexParts: IndexPart[];
  metadataParts: MetadataPart[];
  homeById: Map<string, HomeLocation>;
  metadataFor(anchorId: string, part: number): MetadataPart;
  childrenFor(anchorId: string): IndexPart[];
}

/** Metadata part URL; part 1 is the canonical anchor detail. */
export function metadataPath(anchorId: string, part: number, base: string) {
  const detail = detailPath(anchorId, base);
  return part <= 1 ? detail : `${detail}components/${part}/`;
}

export function globalIndexPath(part: number, base: string) {
  return `${base.replace(/\/+$/, '')}/sitemap/index/${part}/`;
}

export function childIndexPath(anchorId: string, part: number, base: string) {
  return `${detailPath(anchorId, base)}pages/${part}/`;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let start = 0; start < items.length; start += size)
    chunks.push(items.slice(start, start + size));
  return chunks;
}

function indexParts(ownerId: string | null, nodes: SitemapNode[]): IndexPart[] {
  const parts = chunk(nodes, INDEX_LIMIT);
  return parts.map((partNodes, index) => ({
    ownerId,
    part: index + 1,
    totalParts: parts.length,
    nodes: partNodes,
  }));
}

/**
 * Bounded static partitions over the existing anchor ownership. Pure: no
 * file, browser or network access. Deterministic in input order.
 */
export function buildSitemapPartitions(
  nodes: SitemapNode[],
): SitemapPartitions {
  const views = buildSitemapViews(nodes);
  const { byId, anchorIds, ownerById } = views;
  const position = new Map(nodes.map((node, index) => [node.id, index]));

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
  /** Nearest strict ancestor anchor. */
  const parentAnchorOf = (node: SitemapNode) => {
    const chain = ancestors(node);
    for (let index = chain.length - 1; index >= 0; index -= 1)
      if (anchorIds.has(chain[index].id)) return chain[index].id;
    return undefined;
  };

  // One linear pass for owned segments and child-anchor relationships.
  const ownedByAnchor = new Map<string, SitemapNode[]>();
  const childAnchors = new Map<string, SitemapNode[]>();
  const rootNodes: SitemapNode[] = [];
  for (const node of nodes) {
    if (anchorIds.has(node.id)) {
      const parentAnchor = parentAnchorOf(node);
      if (parentAnchor) {
        const children = childAnchors.get(parentAnchor) ?? [];
        children.push(node);
        childAnchors.set(parentAnchor, children);
      } else rootNodes.push(node);
      continue;
    }
    const owner = ownerById.get(node.id);
    if (owner) {
      const owned = ownedByAnchor.get(owner) ?? [];
      owned.push(node);
      ownedByAnchor.set(owner, owned);
    } else rootNodes.push(node); // unowned navigation context
  }

  const homeById = new Map<string, HomeLocation>();
  const metadataParts: MetadataPart[] = [];
  const metadataByAnchor = new Map<string, MetadataPart[]>();
  for (const anchor of views.anchors) {
    homeById.set(anchor.id, { anchorId: anchor.id, part: 1 });
    const segments = chunk(ownedByAnchor.get(anchor.id) ?? [], METADATA_LIMIT);
    if (segments.length === 0) segments.push([]);
    const parts = segments.map((segment, index): MetadataPart => {
      const part = index + 1;
      const primaryIds = new Set([
        anchor.id,
        ...segment.map((node) => node.id),
      ]);
      const contextIds = new Set<string>();
      for (const node of segment) {
        homeById.set(node.id, { anchorId: anchor.id, part });
        const chain = ancestors(node);
        const start = chain.findIndex((ancestor) => ancestor.id === anchor.id);
        // Context stays inside the anchor tree.
        for (const ancestor of chain.slice(start + 1))
          if (!primaryIds.has(ancestor.id)) contextIds.add(ancestor.id);
      }
      const partNodes = [...primaryIds, ...contextIds]
        .map((id) => byId.get(id))
        .filter((node): node is SitemapNode => node !== undefined)
        .sort((a, b) => (position.get(a.id) ?? 0) - (position.get(b.id) ?? 0));
      return {
        anchor,
        part,
        totalParts: segments.length,
        nodes: partNodes,
        primaryIds,
        contextIds,
      };
    });
    metadataByAnchor.set(anchor.id, parts);
    metadataParts.push(...parts);
  }

  const childIndexByAnchor = new Map<string, IndexPart[]>();
  const childIndexParts: IndexPart[] = [];
  for (const anchor of views.anchors) {
    const children = childAnchors.get(anchor.id);
    if (!children) continue;
    const parts = indexParts(anchor.id, children);
    childIndexByAnchor.set(anchor.id, parts);
    childIndexParts.push(...parts);
  }

  const metadataFor = (anchorId: string, part: number) => {
    const parts = metadataByAnchor.get(anchorId);
    if (!parts) throw new Error(`sitemap anchor "${anchorId}" does not exist`);
    const found = Number.isInteger(part) ? parts[part - 1] : undefined;
    if (!found)
      throw new Error(
        `sitemap anchor "${anchorId}" has no metadata part ${part}`,
      );
    return found;
  };

  const childrenFor = (anchorId: string) => {
    if (!anchorIds.has(anchorId))
      throw new Error(`sitemap anchor "${anchorId}" does not exist`);
    return childIndexByAnchor.get(anchorId) ?? [];
  };

  return {
    views,
    rootNodes,
    globalIndexParts: indexParts(null, views.anchors),
    childIndexParts,
    metadataParts,
    homeById,
    metadataFor,
    childrenFor,
  };
}
