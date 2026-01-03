import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
    schema: z.object({
        title: z.string(),
        excerpt: z.string(),
        category: z.string(),
        image: z.string().optional().nullable(),
        created_at: z.string(),
        seo_title: z.string().optional().nullable(),
        seo_description: z.string().optional().nullable(),
    }),
});

export const collections = { blog };
