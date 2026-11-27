// Astro caches rendered Markdown between builds (node_modules/.astro/data-store.json, and .astro/ in dev),
// and Vercel keeps node_modules in its build cache. A cached guide would keep showing a link to a scheduled
// guide as plain text even after that guide goes live (see src/lib/rehype-unlink-scheduled.mjs), so every
// build renders the content from scratch. The ~60 guides render in a few seconds.
import { rmSync } from 'node:fs';

for (const path of ['node_modules/.astro/data-store.json', '.astro/data-store.json']) {
  rmSync(new URL(`../${path}`, import.meta.url), { force: true });
}
