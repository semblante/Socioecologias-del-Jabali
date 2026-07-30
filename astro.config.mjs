// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

import react from '@astrojs/react';

export default defineConfig({
  site: 'https://ecologiasdeljabali.cl',
  adapter: node({ mode: 'standalone' }),
  integrations: [mdx(), sitemap(), react()],
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  redirects: {
    // Slug redirects live in pages/bitacora/[slug].astro (static + Cloudflare-safe).
    '/bitacora': '/cuaderno',
    '/en/bitacora': '/en/cuaderno',
  },
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
});
