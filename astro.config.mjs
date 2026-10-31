import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import rehypeStripUtm from './src/lib/rehype-strip-utm.mjs';

export default defineConfig({
  site: 'https://www.izmiruzmani.com',
  output: 'static',
  integrations: [sitemap()],
  markdown: { rehypePlugins: [rehypeStripUtm] },
  adapter: vercel(),
});
