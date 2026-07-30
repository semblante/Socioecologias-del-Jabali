export const siteConfig = {
  // ponytail: nombre provisional alineado al sello del manual; Tironi confirma o corrige.
  name: 'Socioecologías del jabalí',
  nameShort: {
    es: 'Socioecologías del jabalí',
    en: 'Wild Boar Socioecologies',
  },
  tagline: {
    es: 'Andes del sur',
    en: 'Southern Andes',
  },
  namePlain: 'socioecologias del jabali',
  url: 'https://ecologiasdeljabali.cl',
  projectTitle:
    'Wild boar socioecologies: invasive species as contact zones in the Peweñantu, Southern Chile',
  fondecyt: 'Fondecyt Regular 1260739',
  fondecytYear: '2026',
  sections: {
    proyecto: true,
    territorio: true,
    equipo: true,
    bitacora: true,
    archivo: true,
    publicaciones: true,
    productos: true,
    contacto: true,
  },
  institutions: [
    'Instituto de Sociología, Pontificia Universidad Católica de Chile',
    'Centro UC de Desarrollo Local (CEDEL), Villarrica',
    'Instituto para el Desarrollo Sustentable (IDS)',
    'Asociación Indígena Winkulmapu',
  ],
  contact: {
    email: 'manuel.tironi@uc.cl',
  },
} as const;

export type Locale = 'es' | 'en';

export const defaultLocale: Locale = 'es';
export const locales: Locale[] = ['es', 'en'];
