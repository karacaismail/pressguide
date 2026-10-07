import type { APIRoute, GetStaticPaths } from 'astro';
import { loadSitemap, type Sitemap } from '../sitemap';

// Publishes the same validated snapshot the page renders. Without a reviewed
// snapshot no file is generated.
export const getStaticPaths = (async () => {
  const sitemap = await loadSitemap();
  return sitemap
    ? [{ params: { dataset: 'press-sitemap' }, props: { sitemap } }]
    : [];
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const { sitemap } = props as { sitemap: Sitemap };
  return new Response(`${JSON.stringify(sitemap, null, 2)}\n`, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
