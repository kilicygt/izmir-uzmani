import type { CollectionEntry } from 'astro:content';

// Scheduled publishing: a guide whose pubDate is still in the future is left out of every page,
// list and the sitemap until a build runs after that moment. The daily data workflows push to main
// several times a day, and every push rebuilds the site, so a scheduled guide goes live at the next build.
// pubDate may carry a time with the İzmir offset, e.g. 2026-11-29T17:00:00+03:00.
export const isPublished = (p: CollectionEntry<'blog'>) => p.data.pubDate.getTime() <= Date.now();
