# Diseño: CMS PocketBase para Socioecologías del jabalí

**Fecha:** 2026-07-30  
**Estado:** aprobado  
**Reemplaza:** Keystatic (local / GitHub / Cloud) como fuente de edición

## Problema

El panel Keystatic duplica colecciones ES/EN (UI amontonada) y en producción exige GitHub (cuenta del autor u OAuth/Cloud). Eso es engorroso para un único editor académico que no usará GitHub para nada más.

## Objetivos

1. El autor edita **casi todo** el contenido con **email/contraseña** (1 usuario), sin GitHub ni Keystatic Cloud.
2. Todo corre en **Railway** (sitio + CMS).
3. Al guardar, el sitio público refleja el cambio **sin rebuild manual** ni commit.
4. Separación clara por idioma en el admin.
5. Sin licencia de CMS de pago; solo infra Railway.

## No objetivos

- Admin UI 100% custom (se usa el admin de PocketBase).
- Express/CMS escrito a mano.
- Dominio custom (fase posterior).
- Mantener Keystatic en paralelo.

## Arquitectura

```
┌─────────────────────┐         ┌──────────────────────────┐
│  web (Astro Node)   │  REST   │  pocketbase (Go binary)  │
│  sitio público      │ ──────► │  SQLite + files + auth   │
│  SSR contenido      │         │  Admin UI en /_/         │
└─────────────────────┘         │  Volumen persistente     │
                                └──────────────────────────┘
```

- **Servicio `web`:** Astro con `@astrojs/node` (ya desplegado).
- **Servicio `pocketbase`:** imagen Docker oficial/pinnada, volumen en `/pb_data` (o path del template).
- **Fuente de verdad del contenido:** PocketBase (no `src/content/*.mdx` tras la migración).
- Los MDX actuales se **importan una vez** y quedan como backup histórico en git si se desea.

## Modelo de datos

Colecciones base (una por tipo; campo `locale` = `es` | `en`):

| Colección PB | Equivale a | Notas |
|---|---|---|
| `cuaderno` | `bitacora` | slug, title, description, pubDate, tags, cover (file), content (text/md), status, translationKey |
| `equipo` | `equipo` | name, role, affiliation, group, order, externalUrl, bio, … |
| `publicaciones` | `publicaciones` | title, authors, venue, year, type, url, doi, … |
| `objetivos` | `objetivos` | numero, titulo, resumen, content, … |
| `metodos` | `metodos` | componente, titulo, order, cifras (JSON), content, … |
| `sitios` | `sitios` | nombre, tipo, order, coordenadas, aporte, imagen, content, … |
| `productos` | `productos` | titulo, tipo, estado, fecha, content, … |
| `galeria` | `galeria` | titulo, imagen, pie, autoria, fecha, sitio, tags, … |
| `paginas` | `pages` | key (`home` \| `proyecto` \| `contacto`), title, description, tagline, intro, content, … |

Campos transversales: `locale`, `translationKey`, `status` (`draft` \| `reviewed` \| `published` \| `placeholder`), `slug` (donde aplique).

**Idiomas en admin:** filtros por `locale` y nombres de colección en español claros; el editor trabaja una lista filtrada (ES o EN), no 18 ítems sueltos sin agrupar.

## Lectura en el sitio

- Sustituir `astro:content` / `getCollection` en `src/lib/content.ts` por cliente PocketBase.
- Mantener firmas públicas (`getBitacora`, `getEquipo`, …) y forma `{ id, slug, data }` para minimizar cambios en vistas.
- Cuerpo: Markdown string → HTML vía helper (`MarkdownBody.astro` o equivalente); dejar de usar `render()` de `astro:content`.
- Rutas de contenido en **SSR** (`prerender = false`) para ver cambios al instante.
- Visibilidad pública: mismos status que hoy (`published`, `reviewed`, `placeholder`).

## Auth y seguridad

- Un usuario admin/editor creado en PocketBase (email + contraseña; se cambia en el admin).
- API rules:
  - **List/view públicos:** solo registros con `status` en la lista visible (o regla equivalente).
  - **Create/update/delete:** solo usuarios autenticados (admin).
- Admin en `https://<pb-domain>/_/`. No requiere cuenta GitHub.
- Footer “Editar contenido” apunta al admin de PocketBase (URL de env), no a `/keystatic`.

## Deploy Railway

1. Crear servicio `pocketbase` + volumen + dominio `*.up.railway.app`.
2. Variables en `web`: `PUBLIC_POCKETBASE_URL` (y si hace falta token solo de lectura; preferible reglas públicas de lectura).
3. Healthcheck PocketBase (`/api/health`).
4. Schema idempotente vía script o migraciones versionadas en el repo.

## Migración desde MDX

Script one-shot que:

1. Parsea frontmatter + body de `src/content/**`.
2. Sube imágenes referenciadas a PocketBase files cuando existan.
3. Crea/actualiza records por `slug` + `locale` (idempotente).

## Retiro de Keystatic

- Quitar `@keystatic/astro`, `@keystatic/core`, `keystatic.config.ts`, integración en `astro.config.mjs`.
- Actualizar `docs/cliente.md`, `docs/architecture.md`, `README.md`, `.env.example`.
- Eliminar enlace/rutas Keystatic.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| PocketBase aún v0.x | Volumen + backups periódicos del `pb_data`; contenido exportable |
| Pérdida de datos al redesplegar | Volumen Railway obligatorio |
| SSR más frío que estático | Cache corta HTTP o fetch con revalidate si hace falta después |
| Markdown ≠ MDX components | Contenido actual es MDX simple (sin componentes custom); Markdown basta |

## Criterios de aceptación

- [ ] Autor inicia sesión en PocketBase con email/clave (sin GitHub).
- [ ] Puede editar cuaderno, equipo, publicaciones, páginas, territorio, etc.
- [ ] Cambio publicado visible en el sitio sin `railway up` manual.
- [ ] Sitio ES/EN sigue resolviendo `translationKey` / fallbacks como hoy.
- [ ] Keystatic ya no forma parte del stack documentado ni del build.
