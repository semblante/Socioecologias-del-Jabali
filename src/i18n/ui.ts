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
      'Las especies invasoras no son entidades unívocas: son zonas de contacto donde se dan cita —y producen— múltiples conocimientos, relaciones y tensiones. En la Araucanía andina, el jabalí se ha convertido en un problema para las comunidades mapuche que han convivido con el chancho por décadas.',
    bitacora: {
      lead: 'Registros de trabajo de campo, encuentros y avances del proyecto en el Peweñantu.',
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
      students: 'Tesistas',
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
      'Invasive species are not univocal entities: they are contact zones where multiple knowledges, relations, and tensions gather —and are produced. In the Andean Araucanía, wild boar has become a problem for Mapuche communities that have lived with the chancho for decades.',
    bitacora: {
      lead: 'Records of fieldwork, gatherings, and project advances in the Peweñantu.',
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
      students: 'Graduate researchers',
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
