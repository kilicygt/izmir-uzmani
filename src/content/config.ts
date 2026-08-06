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

export const collections = { blog, sayfalar };
