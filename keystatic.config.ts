import { config, fields, collection, singleton } from '@keystatic/core';

const statusField = fields.select({
  label: 'Estado',
  options: [
    { label: 'Publicado', value: 'published' },
    { label: 'Borrador', value: 'draft' },
    { label: 'Revisado', value: 'reviewed' },
    { label: 'Contenido de ejemplo', value: 'placeholder' },
  ],
  defaultValue: 'draft',
});

// PUBLIC_ porque este archivo también se evalúa en el navegador (panel /keystatic).
const githubRepo = import.meta.env.PUBLIC_KEYSTATIC_GITHUB_REPO;

const storage = githubRepo
  ? {
      kind: 'github' as const,
      repo: githubRepo,
    }
  : {
      kind: 'local' as const,
    };

export default config({
  storage,
  ui: {
    brand: { name: 'Ecologías del jabalí' },
  },
  collections: {
    cuadernoCampoEs: collection({
      label: 'Cuaderno de campo (español)',
      slugField: 'title',
      path: 'src/content/bitacora/es/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({
          name: { label: 'Título' },
          slug: { label: 'URL (slug)' },
        }),
        description: fields.text({ label: 'Resumen breve', multiline: true }),
        pubDate: fields.date({ label: 'Fecha de publicación' }),
        locale: fields.text({
          label: 'Idioma',
          defaultValue: 'es',
          validation: { length: { min: 2, max: 2 } },
        }),
        translationKey: fields.text({
          label: 'Clave de traducción',
          description: 'Usa el mismo valor en la versión en inglés para enlazar ambas entradas.',
        }),
        status: statusField,
        tags: fields.array(fields.text({ label: 'Etiqueta' }), {
          label: 'Etiquetas',
          itemLabel: (props) => props.value || 'Etiqueta',
        }),
        content: fields.mdx({
          label: 'Contenido',
          options: {
            bold: true,
            italic: true,
            link: true,
            orderedList: true,
            unorderedList: true,
            blockquote: true,
            heading: true,
          },
        }),
      },
    }),
    cuadernoCampoEn: collection({
      label: 'Field notes (English)',
      slugField: 'title',
      path: 'src/content/bitacora/en/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({
          name: { label: 'Title' },
          slug: { label: 'URL slug' },
        }),
        description: fields.text({ label: 'Short summary', multiline: true }),
        pubDate: fields.date({ label: 'Publication date' }),
        locale: fields.text({
          label: 'Locale',
          defaultValue: 'en',
          validation: { length: { min: 2, max: 2 } },
        }),
        translationKey: fields.text({
          label: 'Translation key',
          description: 'Use the same value as the Spanish entry to link both versions.',
        }),
        status: statusField,
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value || 'Tag',
        }),
        content: fields.mdx({
          label: 'Content',
          options: {
            bold: true,
            italic: true,
            link: true,
            orderedList: true,
            unorderedList: true,
            blockquote: true,
            heading: true,
          },
        }),
      },
    }),
    equipoEs: collection({
      label: 'Equipo (español)',
      slugField: 'name',
      path: 'src/content/equipo/es/*',
      format: { contentField: 'bio' },
      schema: {
        name: fields.slug({
          name: { label: 'Nombre' },
          slug: { label: 'URL (slug)' },
        }),
        role: fields.text({ label: 'Rol en el proyecto' }),
        affiliation: fields.text({ label: 'Afiliación institucional' }),
        group: fields.select({
          label: 'Grupo',
          options: [
            { label: 'Investigador principal', value: 'investigator' },
            { label: 'Colaborador territorial', value: 'collaborator' },
          ],
          defaultValue: 'investigator',
        }),
        order: fields.integer({ label: 'Orden de aparición', defaultValue: 0 }),
        locale: fields.text({ label: 'Idioma', defaultValue: 'es' }),
        translationKey: fields.text({ label: 'Clave de traducción' }),
        status: statusField,
        externalUrl: fields.url({ label: 'Enlace externo (opcional)' }),
        bio: fields.mdx({ label: 'Biografía' }),
      },
    }),
    equipoEn: collection({
      label: 'Team (English)',
      slugField: 'name',
      path: 'src/content/equipo/en/*',
      format: { contentField: 'bio' },
      schema: {
        name: fields.slug({
          name: { label: 'Name' },
          slug: { label: 'URL slug' },
        }),
        role: fields.text({ label: 'Project role' }),
        affiliation: fields.text({ label: 'Institutional affiliation' }),
        group: fields.select({
          label: 'Group',
          options: [
            { label: 'Principal investigator', value: 'investigator' },
            { label: 'Territorial collaborator', value: 'collaborator' },
          ],
          defaultValue: 'investigator',
        }),
        order: fields.integer({ label: 'Display order', defaultValue: 0 }),
        locale: fields.text({ label: 'Locale', defaultValue: 'en' }),
        translationKey: fields.text({ label: 'Translation key' }),
        status: statusField,
        externalUrl: fields.url({ label: 'External link (optional)' }),
        bio: fields.mdx({ label: 'Biography' }),
      },
    }),
    publicacionesEs: collection({
      label: 'Publicaciones (español)',
      slugField: 'title',
      path: 'src/content/publicaciones/es/*',
      schema: {
        title: fields.slug({
          name: { label: 'Título' },
          slug: { label: 'URL (slug)' },
        }),
        authors: fields.text({ label: 'Autores' }),
        venue: fields.text({ label: 'Revista / editorial / libro' }),
        year: fields.integer({ label: 'Año' }),
        type: fields.select({
          label: 'Tipo',
          options: [
            { label: 'Artículo', value: 'article' },
            { label: 'Capítulo', value: 'chapter' },
            { label: 'Libro', value: 'book' },
            { label: 'Informe', value: 'report' },
          ],
          defaultValue: 'article',
        }),
        locale: fields.text({ label: 'Idioma', defaultValue: 'es' }),
        translationKey: fields.text({ label: 'Clave de traducción' }),
        status: statusField,
        url: fields.url({ label: 'Enlace (opcional)' }),
        doi: fields.text({ label: 'DOI (opcional)' }),
      },
    }),
    publicacionesEn: collection({
      label: 'Publications (English)',
      slugField: 'title',
      path: 'src/content/publicaciones/en/*',
      schema: {
        title: fields.slug({
          name: { label: 'Title' },
          slug: { label: 'URL slug' },
        }),
        authors: fields.text({ label: 'Authors' }),
        venue: fields.text({ label: 'Journal / publisher / book' }),
        year: fields.integer({ label: 'Year' }),
        type: fields.select({
          label: 'Type',
          options: [
            { label: 'Article', value: 'article' },
            { label: 'Chapter', value: 'chapter' },
            { label: 'Book', value: 'book' },
            { label: 'Report', value: 'report' },
          ],
          defaultValue: 'article',
        }),
        locale: fields.text({ label: 'Locale', defaultValue: 'en' }),
        translationKey: fields.text({ label: 'Translation key' }),
        status: statusField,
        url: fields.url({ label: 'Link (optional)' }),
        doi: fields.text({ label: 'DOI (optional)' }),
      },
    }),
  },
  singletons: {
    paginaProyectoEs: singleton({
      label: 'Página El proyecto (español)',
      path: 'src/content/pages/es/proyecto',
      format: { contentField: 'content' },
      schema: {
        title: fields.text({ label: 'Título' }),
        description: fields.text({ label: 'Descripción SEO', multiline: true }),
        locale: fields.text({ label: 'Idioma', defaultValue: 'es' }),
        translationKey: fields.text({ label: 'Clave de traducción', defaultValue: 'proyecto' }),
        status: statusField,
        content: fields.mdx({ label: 'Contenido' }),
      },
    }),
    paginaProyectoEn: singleton({
      label: 'Page The project (English)',
      path: 'src/content/pages/en/proyecto',
      format: { contentField: 'content' },
      schema: {
        title: fields.text({ label: 'Title' }),
        description: fields.text({ label: 'SEO description', multiline: true }),
        locale: fields.text({ label: 'Locale', defaultValue: 'en' }),
        translationKey: fields.text({ label: 'Translation key', defaultValue: 'proyecto' }),
        status: statusField,
        content: fields.mdx({ label: 'Content' }),
      },
    }),
    paginaContactoEs: singleton({
      label: 'Página Contacto (español)',
      path: 'src/content/pages/es/contacto',
      format: { contentField: 'content' },
      schema: {
        title: fields.text({ label: 'Título' }),
        description: fields.text({ label: 'Descripción SEO', multiline: true }),
        locale: fields.text({ label: 'Idioma', defaultValue: 'es' }),
        translationKey: fields.text({ label: 'Clave de traducción', defaultValue: 'contacto' }),
        status: statusField,
        content: fields.mdx({ label: 'Contenido adicional' }),
      },
    }),
    paginaContactoEn: singleton({
      label: 'Page Contact (English)',
      path: 'src/content/pages/en/contacto',
      format: { contentField: 'content' },
      schema: {
        title: fields.text({ label: 'Title' }),
        description: fields.text({ label: 'SEO description', multiline: true }),
        locale: fields.text({ label: 'Locale', defaultValue: 'en' }),
        translationKey: fields.text({ label: 'Translation key', defaultValue: 'contacto' }),
        status: statusField,
        content: fields.mdx({ label: 'Additional content' }),
      },
    }),
    portadaEs: singleton({
      label: 'Portada (español)',
      path: 'src/content/pages/es/home',
      schema: {
        title: fields.text({ label: 'Título del sitio en portada' }),
        tagline: fields.text({ label: 'Frase principal', multiline: true }),
        intro: fields.text({ label: 'Párrafo introductorio', multiline: true }),
        locale: fields.text({ label: 'Idioma', defaultValue: 'es' }),
        translationKey: fields.text({ label: 'Clave de traducción', defaultValue: 'home' }),
        status: statusField,
      },
    }),
    portadaEn: singleton({
      label: 'Homepage (English)',
      path: 'src/content/pages/en/home',
      schema: {
        title: fields.text({ label: 'Homepage title' }),
        tagline: fields.text({ label: 'Main tagline', multiline: true }),
        intro: fields.text({ label: 'Intro paragraph', multiline: true }),
        locale: fields.text({ label: 'Locale', defaultValue: 'en' }),
        translationKey: fields.text({ label: 'Translation key', defaultValue: 'home' }),
        status: statusField,
      },
    }),
  },
});
