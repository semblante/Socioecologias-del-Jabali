import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const statusEnum = z.enum(['placeholder', 'draft', 'reviewed', 'published']).default('published');
const localeEnum = z.enum(['es', 'en']);

const shared = {
  locale: localeEnum,
  translationKey: z.string(),
  status: statusEnum,
};

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tagline: z.string().optional(),
    intro: z.string().optional(),
    hero: z.string().optional(),
    ...shared,
  }),
});

const bitacora = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/bitacora' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
    ...shared,
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
    externalUrl: z.string().url().optional(),
    ...shared,
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
    url: z.string().url().optional(),
    doi: z.string().optional(),
    ...shared,
  }),
});

const objetivos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/objetivos' }),
  schema: z.object({
    numero: z.number(),
    titulo: z.string(),
    resumen: z.string(),
    ...shared,
  }),
});

const metodos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/metodos' }),
  schema: z.object({
    componente: z.enum(['ecologia', 'etnografia', 'participativo']),
    titulo: z.string(),
    order: z.number().default(0),
    cifras: z
      .array(
        z.object({
          valor: z.string(),
          unidad: z.string(),
        }),
      )
      .default([]),
    ...shared,
  }),
});

const sitios = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/sitios' }),
  schema: z.object({
    nombre: z.string(),
    tipo: z.enum(['principal', 'secundario']),
    order: z.number().default(0),
    coordenadas: z.string().optional(),
    aporte: z.string(),
    imagen: z.string().optional(),
    ...shared,
  }),
});

const productos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/productos' }),
  schema: z.object({
    titulo: z.string(),
    tipo: z.enum(['libro', 'policy-brief', 'exposicion', 'evento']),
    estado: z.enum(['planificado', 'en-curso', 'publicado']).default('planificado'),
    fecha: z.string().optional(),
    ...shared,
  }),
});

const galeria = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/galeria' }),
  schema: z.object({
    titulo: z.string(),
    imagen: z.string(),
    pie: z.string().optional(),
    autoria: z.string().optional(),
    fecha: z.coerce.date().optional(),
    sitio: z.string().optional(),
    tags: z.array(z.string()).default([]),
    ...shared,
  }),
});

export const collections = {
  pages,
  bitacora,
  equipo,
  publicaciones,
  objetivos,
  metodos,
  sitios,
  productos,
  galeria,
};
