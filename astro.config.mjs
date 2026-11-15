import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import rehypeStripUtm from './src/lib/rehype-strip-utm.mjs';
import rehypeDemoteH1 from './src/lib/rehype-demote-h1.mjs';
import { readdirSync, readFileSync } from 'node:fs';

// lastmod for the sitemap: guides use their publish date; pages rebuilt from daily data use the build date.
const BLOG_DIR = new URL('./src/content/blog/', import.meta.url);
const blogDates = Object.fromEntries(
  readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md')).map((f) => {
    const m = readFileSync(new URL(f, BLOG_DIR), 'utf8').match(/^pubDate:\s*["']?([0-9-]{10})/m);
    return [f.replace(/\.md$/, ''), m?.[1]];
  }),
);
const buildDate = new Date().toISOString();
const DAILY = /\/(toplu-tasima-saatleri|nobetci-eczaneler|etkinlikler)\/$|^https:\/\/www\.izmiruzmani\.com\/$|\/(toplu-tasima-saatleri|nobetci-eczaneler)\//;

export default defineConfig({
  site: 'https://www.izmiruzmani.com',
  output: 'static',
  redirects: {
    '/rehberler/izmir-saat-kulesi-nin-tarihi-ve-bilinmeyen-hik-yesi': '/rehberler/izmir-saat-kulesi-nin-tarihi-ve-bilinmeyen-hikayesi',
    '/rehberler/tarihi-asansor-un-hik-yesi-ve-ziyaret-rehberi': '/rehberler/tarihi-asansor-un-hikayesi-ve-ziyaret-rehberi',
    '/rehberler/izmirde-metro-ve-tramvay-nasil-kullanilir': '/toplu-tasima-saatleri/metro',
  },
  integrations: [sitemap({
    serialize(item) {
      const blog = item.url.match(/\/rehberler\/([^/]+)\/$/);
      if (blog && blogDates[blog[1]]) item.lastmod = new Date(`${blogDates[blog[1]]}T09:00:00+03:00`).toISOString();
      else if (DAILY.test(item.url)) item.lastmod = buildDate;
      return item;
    },
  })],
  markdown: { rehypePlugins: [rehypeStripUtm, rehypeDemoteH1] },
  adapter: vercel(),
});
