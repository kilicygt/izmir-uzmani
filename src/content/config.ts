import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.string(),
    readTime: z.string(),
    tags: z.array(z.string()).optional().default([]),
    featured: z.boolean().optional().default(false),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    excerpt: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  }),
});

const sayfalar = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

// "2026-11-08 20:00" is read as İzmir time. YAML turns unquoted dates into UTC Dates, so those are read the same way.
const istanbulTime = z.union([z.string(), z.date()]).transform((v) => {
  const s = typeof v === 'string' ? v.trim().replace(' ', 'T') : v.toISOString().slice(0, 19);
  if (/[+-]\d\d:\d\d$|Z$/.test(s)) return new Date(s).toISOString();
  return new Date(`${s.length === 10 ? `${s}T00:00` : s.slice(0, 16)}:00+03:00`).toISOString();
});

const etkinlikler = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.string(),
    start: istanbulTime,
    end: istanbulTime.optional(),
    venue: z.string(),
    image: z.string().optional(),
    organizer: z.string().optional(),
    ticketUrl: z.string().url().optional(),
    sourceUrl: z.string().url().optional(),
    sourceName: z.string().optional(),
  }),
});

export const collections = { blog, sayfalar, etkinlikler };
