import type { Locale } from '../config/site';

const ui = {
  es: {
    skipToContent: 'Saltar al contenido',
    menu: 'Menú',
    nav: {
      proyecto: 'El proyecto',
      equipo: 'Equipo',
      bitacora: 'Cuaderno de campo',
      publicaciones: 'Publicaciones',
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
      'Proyecto Fondecyt que estudia al jabalí como especie invasora y zona de contacto en el Peweñantu, cruzando etnografía, STS y humanidades ambientales.',
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
      proyecto: 'The project',
      equipo: 'Team',
      bitacora: 'Field journal',
      publicaciones: 'Publications',
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
      'Fondecyt project studying wild boar as an invasive species and contact zone in Peweñantu, crossing ethnography, STS, and environmental humanities.',
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
