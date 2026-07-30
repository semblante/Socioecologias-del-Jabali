export const siteConfig = {
  name: 'Ecologías del jabalí',
  namePlain: 'ecologias del jabali',
  url: 'https://ecologiasdeljabali.cl',
  projectTitle:
    'Wild boar socioecologies: invasive species as contact zones in the Peweñantu, Southern Chile',
  fondecyt: 'Fondecyt Regular 2026',
  sections: {
    proyecto: true,
    equipo: true,
    bitacora: true,
    publicaciones: true,
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
