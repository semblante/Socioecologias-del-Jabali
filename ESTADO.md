# Socioecologías del jabalí — estado

**Qué es:** Sitio bilingüe del proyecto Fondecyt Regular 1260739 «Socioecologías del jabalí», liderado por Manuel Tironi (PUC), sobre el jabalí como zona de contacto socioecológica en el peweñantu de la Araucanía andina, en colaboración con la Asociación Indígena Winkulmapu. Astro 5 con SSR y PocketBase como CMS.
**Etapa:** piloto (estructura, diseño y contenido semilla implementados y respondiendo en Railway; el dominio propio falla y el cliente aún no valida el contenido).
**Actualizado:** 2026-08-20

> Este repo **ya no usa Keystatic ni Cloudflare**. Migró a PocketBase en julio de 2026 y el
> deploy es Railway. El legacy se borró el 2026-08-03.

## Hecho

- Astro 5 con `@astrojs/node` en SSR (`prerender = false` en todas las rutas) y PocketBase como CMS.
- 9 colecciones definidas en `scripts/pb-schema.mjs`: `cuaderno`, `equipo`, `publicaciones`, `objetivos`, `metodos`, `sitios`, `productos`, `galeria`, `paginas`, con `locale`, `translationKey`, `status` y lectura pública para `published`, `reviewed` y `placeholder`.
- Lectura de contenido en runtime en `src/lib/content.ts`; seed idempotente desde `src/content/` con `pnpm pb:seed`.
- Rutas en español e inglés: `/`, `/proyecto`, `/proyecto/objetivos` → ancla, `/proyecto/metodologia` → ancla, `/territorio`, `/territorio/winkulmapu`, `/territorio/[slug]`, `/equipo`, `/cuaderno`, `/cuaderno/[slug]`, `/archivo`, `/publicaciones`, `/productos`, `/contacto`, más `/en/...`. Redirección de `/bitacora` a `/cuaderno`.
- Contenido alineado a correcciones de Tironi (2026-08-20): portada (bajada + about), proyecto largo con objetivos y metodología, territorio Winkulmapu, perfiles de equipo + tesistas, lead del cuaderno.
- Hero listo para media full-bleed (`paginas.heroMedia`: video `.mp4/.webm` o imagen); sin media usa atmósfera. Logo del sello bajó a la sección «Sobre el proyecto».
- Equipo: grupo `tesista` en schema; Francisco Colipe como Co-Investigador; Fernanda Fuentes y Marcelo Alvarado Lincopi.
- Dirección visual «Sello de campo» documentada en `docs/design-sello-de-campo.md`, con tokens en `src/styles/tokens.css`.
- Tipografías: Newsreader, Instrument Sans, Geist Mono.
- Marca: sello vectorial en `public/brand/`.
- Deploy en Railway con servicios `web` y `pocketbase` y volumen en `/pb_data`.

## Por hacer (en orden)

- **[stopper]** Reparar el dominio `ecologiasdeljabali.cl`. Hoy devuelve 503/500 y el sitio solo es confiable en la URL de Railway.
- **[stopper]** Confirmar que PocketBase en producción tiene schema, seed y un usuario editor con credenciales entregadas a Tironi.
- **Re-seed / schema en prod** tras este lote: `pnpm pb:schema` (campo `heroMedia`, grupo `tesista`) y `pnpm pb:seed`.
- **Media de portada:** Tironi debe entregar video o imagen de terreno; pegar URL/ruta en `paginas` → home → `heroMedia`.
- **Mapa territorio:** opcional imagen/KMZ del peweñantu (hoy hay mapa OSM Leaflet).
- Validación de contenido por el cliente: pasar registros de `reviewed` a `published`.
- Poblar `galeria` (`/archivo`) con imágenes de terreno.
- Generar assets OG: `/brand/icon-512.png` y `/brand/icon-180.png`.
- Flujo de imágenes para el cliente (hoy `imagen`/`cover`/`heroMedia` son texto URL/ruta).
- Partir `src/styles/components.css` si molesta el monolito.
- Decidir si se quitan `@astrojs/react`, `react` y `react-dom`.

## Riesgos y bloqueos

- Sin dominio operativo la entrega queda incompleta aunque Railway responda.
- Si `PUBLIC_POCKETBASE_URL` no está configurado en producción, todas las páginas fallan al consultar la API.
- Hipótesis detalladas ya no viven en una página propia; el texto canónico de proyecto está en `paginas` key `proyecto`.
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
- url publicada: `https://web-production-57fa0.up.railway.app` (dominio `ecologiasdeljabali.cl` no operativo al 2026-08-03)
