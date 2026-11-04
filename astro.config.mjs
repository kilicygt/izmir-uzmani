import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import rehypeStripUtm from './src/lib/rehype-strip-utm.mjs';
import rehypeDemoteH1 from './src/lib/rehype-demote-h1.mjs';

export default defineConfig({
  site: 'https://www.izmiruzmani.com',
  output: 'static',
  redirects: {
    '/rehberler/izmir-saat-kulesi-nin-tarihi-ve-bilinmeyen-hik-yesi': '/rehberler/izmir-saat-kulesi-nin-tarihi-ve-bilinmeyen-hikayesi',
    '/rehberler/tarihi-asansor-un-hik-yesi-ve-ziyaret-rehberi': '/rehberler/tarihi-asansor-un-hikayesi-ve-ziyaret-rehberi',
  },
  integrations: [sitemap()],
  markdown: { rehypePlugins: [rehypeStripUtm, rehypeDemoteH1] },
  adapter: vercel(),
});
