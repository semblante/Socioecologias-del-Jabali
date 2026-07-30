# Arquitectura — ecologiasdeljabali.cl

## CMS: PocketBase en Railway

Tironi edita contenido en el **admin de PocketBase** (`/_/`). Email/contraseña; sin GitHub.

| Entorno | Cómo guarda |
|---|---|
| Producción | SQLite + archivos en volumen Railway del servicio `pocketbase` |
| Desarrollo | PocketBase local (`tools/pocketbase serve`) + `PUBLIC_POCKETBASE_URL` |

El sitio Astro lee la API en **SSR** vía `src/lib/content.ts`.

## Stack

- Astro 5 + `@astrojs/node` (Railway)
- PocketBase (colecciones bilingües ES/EN)
- CSS nativo con design tokens (paleta del manual de marca)

## Rutas

```
/                          Portada
/proyecto                  Pregunta, zona de contacto
/proyecto/objetivos        Objetivos e hipótesis
/proyecto/metodologia      Métodos y cifras
/territorio                Corredor peweñantu
/territorio/winkulmapu     Acuerdo de Gobernanza
/territorio/[sitio]        Puesco, Quiñenahuin, Panqui, Palguín
/equipo                    Perfiles
/cuaderno                  Cuaderno de campo (redirige desde /bitacora)
/archivo                   Archivo visual
/publicaciones             Bibliografía
/productos                 Libro, briefs, exposición
/contacto                  Contacto
/en/...                    Espejo en inglés
```

## Colecciones PocketBase

`cuaderno`, `equipo`, `publicaciones`, `objetivos`, `metodos`, `sitios`, `productos`, `galeria`, `paginas` — cada una con `locale`, `translationKey`, `status`.

Scripts: `pnpm pb:schema`, `pnpm pb:seed`.

## Identidad

Assets en `public/brand/`. Favicon = marca sin anillo ni disco naranja (`public/favicon.svg`).
Paleta en `src/styles/tokens.css` (terracota `#b6573e`, crema `#edeae1`, tinta `#131416`).

## Deploy (Railway)

1. Proyecto `ecologiasdeljabali`
2. Servicio `web` — Astro Node; env `PUBLIC_POCKETBASE_URL`
3. Servicio `pocketbase` — Dockerfile en `pocketbase/`; volumen en `/pb_data`; healthcheck `/api/health`
