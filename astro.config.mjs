import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://karacaismail.github.io',
  base: '/pressguide',
  output: 'static',
  integrations: [react()],
  vite: { build: { sourcemap: false } },
});
