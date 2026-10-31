import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://izmiruzmani.com',
  output: 'static',
  integrations: [sitemap()],
  adapter: vercel(),
});
