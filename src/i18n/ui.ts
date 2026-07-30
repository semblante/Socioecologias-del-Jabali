import type { Locale } from '../config/site';

const ui = {
  es: {
    skipToContent: 'Saltar al contenido',
    menu: 'Menú',
    nav: {
      proyecto: 'Proyecto',
      territorio: 'Territorio',
      equipo: 'Equipo',
      bitacora: 'Cuaderno',
      archivo: 'Archivo',
      publicaciones: 'Publicaciones',
      productos: 'Productos',
      contacto: 'Contacto',
    },
    translationInProgress: 'Traducción en proceso. Mostrando versión en español.',
    readMore: 'Leer más',
    viewAll: 'Ver todo',
    latestFieldNotes: 'Últimas del cuaderno',
    aboutProject: 'Sobre el proyecto',
    projectCta: 'Conoce la investigación',
    fieldNotesCta: 'Cuaderno de campo',
    homeSummary:
      'Las especies invasoras no son entidades discretas: son zonas de contacto. Este Fondecyt analiza al jabalí en la Araucanía andina desde la ecología, la etnografía y el kimün mapuche, en colaboración con la Asociación Indígena Winkulmapu.',
    bitacora: {
      lead: 'Registro de trabajo de campo, encuentros y avances del proyecto en el Peweñantu.',
    },
    publicaciones: {
      lead: 'Selección de publicaciones del investigador responsable como referencia bibliográfica del proyecto.',
      filterLabel: 'Filtrar por tipo de publicación',
    },
    footer: {
      institutions: 'Instituciones',
      editContent: 'Editar contenido',
      navigation: 'Navegación',
    },
    equipo: {
      investigators: 'Investigadores principales',
      collaborators: 'Colaboradores territoriales',
    },
    pub: {
      filterAll: 'Todas',
      filterArticle: 'Artículos',
      filterChapter: 'Capítulos',
      filterBook: 'Libros',
      filterReport: 'Informes',
    },
    contact: {
      title: 'Contacto',
      email: 'Correo',
      institutions: 'Instituciones colaboradoras',
    },
    placeholder: 'Contenido de ejemplo — pendiente de revisión del equipo investigador.',
    opensNewTab: '(se abre en nueva pestaña)',
  },
  en: {
    skipToContent: 'Skip to content',
    menu: 'Menu',
    nav: {
      proyecto: 'Project',
      territorio: 'Territory',
      equipo: 'Team',
      bitacora: 'Field notes',
      archivo: 'Archive',
      publicaciones: 'Publications',
      productos: 'Outputs',
      contacto: 'Contact',
    },
    translationInProgress: 'Translation in progress. Showing the Spanish version.',
    readMore: 'Read more',
    viewAll: 'View all',
    latestFieldNotes: 'Latest field notes',
    aboutProject: 'About the project',
    projectCta: 'About the research',
    fieldNotesCta: 'Field journal',
    homeSummary:
      'Invasive species are not discrete entities: they are contact zones. This Fondecyt studies wild boar in the Andean Araucanía through ecology, ethnography, and Mapuche kimün, in collaboration with the Winkulmapu Indigenous Association.',
    bitacora: {
      lead: 'Fieldwork records, meetings, and project updates from Peweñantu.',
    },
    publicaciones: {
      lead: 'Selected publications by the principal investigator as bibliographic reference for the project.',
      filterLabel: 'Filter by publication type',
    },
    footer: {
      institutions: 'Institutions',
      editContent: 'Edit content',
      navigation: 'Navigation',
    },
    equipo: {
      investigators: 'Principal investigators',
      collaborators: 'Territorial collaborators',
    },
    pub: {
      filterAll: 'All',
      filterArticle: 'Articles',
      filterChapter: 'Chapters',
      filterBook: 'Books',
      filterReport: 'Reports',
    },
    contact: {
      title: 'Contact',
      email: 'Email',
      institutions: 'Collaborating institutions',
    },
    placeholder: 'Sample content — pending review by the research team.',
    opensNewTab: '(opens in new tab)',
  },
} as const;

export type UiKey = keyof typeof ui.es;

export function getUi(locale: Locale) {
  return ui[locale];
}

export function t(locale: Locale, section: keyof typeof ui.es, key: string): string {
  const block = ui[locale][section];
  if (block && typeof block === 'object' && key in block) {
    return (block as Record<string, string>)[key];
  }
  return key;
}
