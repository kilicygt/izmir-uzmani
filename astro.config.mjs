import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import rehypeStripUtm from './src/lib/rehype-strip-utm.mjs';
import rehypeDemoteH1 from './src/lib/rehype-demote-h1.mjs';
import { readdirSync, readFileSync } from 'node:fs';

// lastmod for the sitemap: guides use their update (or publish) date; pages rebuilt from daily data use the build date.
const BLOG_DIR = new URL('./src/content/blog/', import.meta.url);
const blogDates = Object.fromEntries(
  readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md')).map((f) => {
    const src = readFileSync(new URL(f, BLOG_DIR), 'utf8');
    const m = src.match(/^updatedDate:\s*["']?([0-9-]{10})/m) ?? src.match(/^pubDate:\s*["']?([0-9-]{10})/m);
    return [f.replace(/\.md$/, ''), m?.[1]];
  }),
);
const buildDate = new Date().toISOString();
const DAILY = /\/(toplu-tasima-saatleri|nobetci-eczaneler|etkinlikler)\/$|^https:\/\/www\.izmiruzmani\.com\/$|\/(toplu-tasima-saatleri|nobetci-eczaneler)\//;

// Old guide URLs -> their replacements. The site's URLs end in '/', so scripts/redirect-trailing-slash.mjs
// widens each generated Vercel route to match the old URL with or without it.
const REDIRECTS = [
  ['/rehberler/izmir-saat-kulesi-nin-tarihi-ve-bilinmeyen-hik-yesi', '/rehberler/izmir-saat-kulesi-nin-tarihi-ve-bilinmeyen-hikayesi'],
  ['/rehberler/tarihi-asansor-un-hik-yesi-ve-ziyaret-rehberi', '/rehberler/tarihi-asansor-un-hikayesi-ve-ziyaret-rehberi'],
  ['/rehberler/izmirde-metro-ve-tramvay-nasil-kullanilir', '/toplu-tasima-saatleri/metro'],
  // Birleştirilen yinelenen rehberler (Kasım 2026)
  ['/rehberler/efes-antik-kenti-rehberi', '/rehberler/efes-antik-kenti-gezi-rehberi-gitmeden-once-bilmeniz-gerekenler'],
  ['/rehberler/sirince-koyu-rehberi', '/rehberler/sirince-koyu-gezi-rehberi-neler-yapilir'],
  ['/rehberler/izmir-gun-batimi-en-iyi-noktalar', '/rehberler/izmir-de-gun-batimi-izlenecek-yerler'],
  ['/rehberler/seferihisar-ve-doganbey', '/rehberler/seferihisar-da-gezilecek-yerler-ve-gezi-onerileri'],
  ['/rehberler/urla-yarimadasi-kesfrehberi', '/rehberler/urla-da-gezilecek-yerler-ve-yapilacak-seyler'],
  ['/rehberler/foca-antik-kent-ve-doga', '/rehberler/eski-foca-da-bir-gun-nasil-gecirilir'],
  ['/rehberler/bergama-ve-asklepion', '/rehberler/bergama-da-gezilecek-yerler-antik-kent-ve-tarihi-merkez'],
  ['/rehberler/odemis-ve-birgi-ic-kesimler', '/rehberler/birgi-gezi-rehberi-tarihi-sokaklar-ve-gorulecek-yerler'],
  ['/rehberler/kemeralt-ve-konak-tarihi-semtler', '/rehberler/kemeralti-carsisi-gezi-rehberi-nereden-baslamali'],
  ['/rehberler/karsiyaka-rehberi', '/rehberler/karsiyaka-da-yuruyerek-gezilecek-yerler'],
  ['/rehberler/izmir-adalari-ve-karsikiya-geziler', '/rehberler/izmir-yunan-adalari-feribot-rehberi'],
  ['/rehberler/izmir-hafta-sonu', '/rehberler/izmir-de-hafta-sonu-icin-sakin-gezi-rotalari'],
];

export default defineConfig({
  site: 'https://www.izmiruzmani.com',
  output: 'static',
  redirects: Object.fromEntries(REDIRECTS.map(([from, to]) => [from, `${to}/`])),
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
