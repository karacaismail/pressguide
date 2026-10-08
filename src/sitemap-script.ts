// Existing Astro build tool: transform TypeScript and minify the inline enhancement.
// No browser compiler, external script request or source map is emitted.
import { transformSync } from 'esbuild';
import source from './sitemap-search.ts?raw';
export const compiledSitemapScript = transformSync(source, {
  loader: 'ts',
  target: 'es2022',
  minify: true,
  sourcemap: false,
}).code;
