import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// The "blog" collection: every Markdown file in src/content/blog becomes a post.
// The `schema` validates the frontmatter at the top of each .md file, so a typo
// (e.g. a missing title) fails the build instead of silently breaking the page.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
