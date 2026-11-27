// Links to a guide that is scheduled for later (pubDate still in the future) would 404 until it goes live.
// At build time, such links are turned into plain text; the build that publishes the guide restores them.
import { readdirSync, readFileSync } from 'node:fs';
import yaml from 'js-yaml';

const BLOG_DIR = new URL('../content/blog/', import.meta.url);

function scheduledSlugs() {
  const now = Date.now();
  const slugs = new Set();
  for (const f of readdirSync(BLOG_DIR)) {
    if (!f.endsWith('.md')) continue;
    const fm = readFileSync(new URL(f, BLOG_DIR), 'utf8').match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    const pub = yaml.load(fm[1])?.pubDate;
    const t = pub instanceof Date ? pub.getTime() : Date.parse(pub);
    if (t > now) slugs.add(f.replace(/\.md$/, ''));
  }
  return slugs;
}

function walk(node, scheduled) {
  if (!node.children) return;
  node.children = node.children.flatMap((child) => {
    if (child.type === 'element' && child.tagName === 'a' && typeof child.properties?.href === 'string') {
      const m = child.properties.href.match(/^(?:https:\/\/www\.izmiruzmani\.com)?\/rehberler\/([^/?#]+)\/?(?:[?#].*)?$/);
      if (m && scheduled.has(m[1])) return child.children;
    }
    walk(child, scheduled);
    return [child];
  });
}

export default function rehypeUnlinkScheduled() {
  return (tree) => {
    const scheduled = scheduledSlugs();
    if (scheduled.size) walk(tree, scheduled);
  };
}
