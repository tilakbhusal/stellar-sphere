import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    /** Set false while writing; drafts are hidden from the index and from builds. */
    draft: z.boolean().default(false),
    /** Rough read time in minutes, shown on the index card. */
    readingTime: z.number().optional(),
  }),
});

export const collections = { articles };
