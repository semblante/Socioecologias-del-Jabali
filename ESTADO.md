# Socioecologías del jabalí — estado

**Qué es:** Sitio bilingüe del proyecto Fondecyt Regular 1260739 «Socioecologías del jabalí», liderado por Manuel Tironi (PUC), sobre el jabalí como zona de contacto socioecológica en el peweñantu de la Araucanía andina, en colaboración con la Asociación Indígena Winkulmapu. Astro 5 con SSR y PocketBase como CMS.
**Etapa:** producción (sitio live en `https://ecologiasdeljabali.cl`; cliente aún no valida contenido y `heroMedia`).
**Actualizado:** 2026-09-24

> Este repo **ya no usa Keystatic ni Cloudflare**. Migró a PocketBase en julio de 2026 y el
> deploy es Railway. El legacy se borró el 2026-08-03.

## Hecho

- Astro 5 con `@astrojs/node` en SSR (`prerender = false` en todas las rutas) y PocketBase como CMS.
- 9 colecciones definidas en `scripts/pb-schema.mjs`: `cuaderno`, `equipo`, `publicaciones`, `objetivos`, `metodos`, `sitios`, `productos`, `galeria`, `paginas`, con `locale`, `translationKey`, `status` y lectura pública para `published`, `reviewed` y `placeholder`.
- Lectura de contenido en runtime en `src/lib/content.ts`; seed idempotente desde `src/content/` con `pnpm pb:seed`.
- Rutas en español e inglés: `/`, `/proyecto`, `/proyecto/objetivos` → ancla, `/proyecto/metodologia` → ancla, `/territorio`, `/territorio/winkulmapu`, `/territorio/[slug]`, `/equipo`, `/cuaderno`, `/cuaderno/[slug]`, `/archivo`, `/publicaciones`, `/productos`, `/contacto`, más `/en/...`. Redirección de `/bitacora` a `/cuaderno`.
- Contenido alineado a correcciones de Tironi (2026-08-20): portada (bajada + about), proyecto largo con objetivos y metodología, territorio Winkulmapu, perfiles de equipo + tesistas, lead del cuaderno.
- Hero full-bleed con playlist (`paginas.heroMedia`: `.mp4/.webm` o imagen): reproducción nativa + crossfade entre clips y tinte de campo; sin media usa atmósfera. Logo del sello bajó a la sección «Sobre el proyecto».
- Equipo: grupo `tesista` en schema; Francisco Colipe como Co-Investigador; Fernanda Fuentes y Marcelo Alvarado Lincopi.
- Dirección visual «Sello de campo» documentada en `docs/design-sello-de-campo.md`, con tokens en `src/styles/tokens.css`.
- Tipografías: Newsreader, Instrument Sans, Geist Mono.
- Marca: sello vectorial en `public/brand/`.
- Deploy en Railway con servicios `web` y `pocketbase` y volumen en `/pb_data`.
- PocketBase prod con schema, seed y admin editor (`editor@ecologiasdeljabali.cl`); entrypoint sincroniza credenciales al boot.
- Validación automatizada: `pnpm validate:prod`.
- Assets OG: `/brand/icon-512.png` y `/brand/icon-180.png`.
- Dominio `ecologiasdeljabali.cl` operativo en producción; HTTPS verificado con HTTP 200 el 2026-09-17. Railway queda como origen de despliegue.
- Ajustes Tironi (desplegados 2026-09-24, commit `766176d`; PocketBase prod con `pb:schema` y `pb:seed --create-only`): portada con título display (Archivo condensada) y banda espectral; sello como marca de agua en «Sobre el proyecto»; «Territorio de trabajo» a todo el ancho con polígono aproximado de zona (`public/geo/zona-trabajo.geojson`); franja de imágenes desde `galeria` (5 fotos de relleno de Wikimedia Commons con crédito); marca CEDEL recortada de `jabali2.mp4` y franja Bushnell de `jabali1.mp4`; textos de portada y territorio movidos a PocketBase (`paginas` home `content`, nueva key `territorio`); `pb:seed -- --create-only`; tutorial en `docs/cliente.md`. Pasada transversal: encabezados de página con voz display, sistema de movimiento (menú, enlaces, filas, botones, cambio de página, entrada al scroll) y arreglo del espaciado de párrafos en `.prose`. Segunda pasada: sistema tipográfico cerrado (Archivo para títulos, Newsreader solo lectura), índice de integrantes en Equipo, relieve propio por vista con fundido, filtros y etiquetas sin pastilla. Bugs corregidos: al navegar con el menú las vistas llegaban sin su CSS (`client-nav.ts` no sincronizaba el `<head>`) y el footer quedaba invisible tras navegar (`reveal.ts`). Tercera pasada: carga sin salto de fuente con títulos letra a letra, header que se atenúa al tocar fondo, entrada fluorescente de títulos (interruptor `siteConfig.intro`: `flicker` | `sweep`), sello como marca de agua en el pie, acento del mapa en «Sobre el proyecto». Bug corregido: la mono nunca cargaba (el token pedía "Geist Mono" y la fuente se registra como "Geist Mono Variable"), todo el meta salía en Courier New.

## Por hacer (en orden)

- **Contenido en el panel tras el deploy:** `home` → `content` («Sobre el proyecto») está vacío en prod y usa el texto de respaldo del código; pegarlo si se quiere editable.
- **Coordenadas de sitios:** Puesco-Lanín en prod sigue en `-39.42, -71.75`, fuera de la zona; cambiar a `-39.57, -71.57` en el panel (ES y EN). Revisar las de los casos secundarios con el KMZ.
- **KMZ de Tironi:** convertir a GeoJSON, reemplazar `public/geo/zona-trabajo.geojson` y poner `WORK_ZONE.approximate = false` en `src/lib/geo.ts`.
- **Media de portada:** Tironi debe entregar video o imagen de terreno; pegar URL/ruta en `paginas` → home → `heroMedia`.
- Validación de contenido por el cliente: pasar registros de `reviewed` a `published`.
- Reemplazar las fotos de relleno de `galeria` por imágenes de terreno del equipo.
- Flujo de imágenes para el cliente (hoy `imagen`/`cover`/`heroMedia` son texto URL/ruta).
- Partir `src/styles/components.css` si molesta el monolito.
- Decidir si se quitan `@astrojs/react`, `react` y `react-dom`.

## Riesgos y bloqueos

- Si `PUBLIC_POCKETBASE_URL` no está configurado en producción, todas las páginas fallan al consultar la API.
- Hipótesis detalladas ya no viven en una página propia; el texto canónico de proyecto está en `paginas` key `proyecto`.
- `pnpm pb:seed` sin `--create-only` pisa lo que el cliente editó en el panel. En prod usar siempre `--create-only`.
- Sin backups documentados del volumen de PocketBase, un redeploy mal hecho puede perder contenido editado por el cliente.
- Falta cerrar el nombre público vs dominio.

## Distinción Cuaderno / Archivo

- **Cuaderno:** entradas narrativas de campo (diario).
- **Archivo:** galería visual.
- No hay sección «Noticias»; el home teaseriza el Cuaderno.

## Público (lo que lee la web de Wildcard)

- nombre comercial: Socioecologías del jabalí
- cliente: Manuel Tironi, Fondecyt Regular 1260739 (PUC)
- una línea: Sitio bilingüe de investigación con CMS propio y diseño editorial de campo, para un proyecto Fondecyt en la Araucanía.
- logo: `public/brand/logo-mark.svg`
- url publicada: `https://ecologiasdeljabali.cl` (verificada 2026-09-17; Railway es el origen de despliegue)
