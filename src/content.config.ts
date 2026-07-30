import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const statusEnum = z.enum(['placeholder', 'draft', 'reviewed', 'published']).default('published');
const localeEnum = z.enum(['es', 'en']);

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tagline: z.string().optional(),
    intro: z.string().optional(),
    locale: localeEnum,
    translationKey: z.string(),
    status: statusEnum,
  }),
});

const bitacora = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/bitacora' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    locale: localeEnum,
    translationKey: z.string(),
    status: statusEnum,
    tags: z.array(z.string()).default([]),
  }),
});

const equipo = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/equipo' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    affiliation: z.string(),
    group: z.enum(['investigator', 'collaborator']),
    order: z.number().default(0),
    locale: localeEnum,
    translationKey: z.string(),
    status: statusEnum,
    externalUrl: z.string().url().optional(),
  }),
});

const publicaciones = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/publicaciones' }),
  schema: z.object({
    title: z.string(),
    authors: z.string(),
    venue: z.string(),
    year: z.number(),
    type: z.enum(['article', 'chapter', 'book', 'report']),
    locale: localeEnum,
    translationKey: z.string(),
    status: statusEnum,
    url: z.string().url().optional(),
    doi: z.string().optional(),
  }),
});

export const collections = { pages, bitacora, equipo, publicaciones };
