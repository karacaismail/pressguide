// Server-only: compiles the vanilla sitemap search to plain JS at build time so
// pages can inline it instead of requesting processed script chunks.
import ts from 'typescript';
import source from './sitemap-search.ts?raw';

export const compiledSitemapScript = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    removeComments: true,
    sourceMap: false,
    inlineSourceMap: false,
  },
}).outputText;
