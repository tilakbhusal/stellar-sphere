// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Update `site` to your real domain before deploying — it powers the sitemap
// and canonical URLs.
export default defineConfig({
  site: 'https://tilakbhusal.com',
  integrations: [
    mdx(),
    react(),
    sitemap(),
  ],
  markdown: {
    shikiConfig: { theme: 'github-light', wrap: true },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
