// Scheduled guides go live on the first build after their pubDate (src/lib/posts.ts). Builds normally come
// from the data workflows, but those push only when their data changed. This script keeps a list of the
// guides whose pubDate has passed; when a scheduled guide becomes due the list changes, the workflow commits
// it, and that push makes Vercel rebuild, so the guide is published on time even on a quiet data day.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import yaml from 'js-yaml';

const BLOG_DIR = new URL('../src/content/blog/', import.meta.url);
const OUT = new URL('../src/data/yayinlanan-rehberler.json', import.meta.url);

const now = Date.now();
const due = readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith('.md'))
  .filter((f) => {
    const fm = readFileSync(new URL(f, BLOG_DIR), 'utf8').match(/^---\n([\s\S]*?)\n---/);
    const pub = fm && yaml.load(fm[1])?.pubDate;
    const t = pub instanceof Date ? pub.getTime() : Date.parse(pub);
    return Number.isFinite(t) && t <= now;
  })
  .map((f) => f.replace(/\.md$/, ''))
  .sort();

const next = JSON.stringify(due, null, 2) + '\n';
const prev = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
if (next !== prev) {
  writeFileSync(OUT, next);
  console.log(`publish-due: ${due.length} published guides (list changed)`);
} else {
  console.log('publish-due: nothing new to publish');
}
