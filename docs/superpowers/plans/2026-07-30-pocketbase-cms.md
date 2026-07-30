# PocketBase CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar Keystatic por PocketBase self-hosted en Railway para que un editor gestione casi todo el contenido con email/contraseña, y el sitio Astro lea la API en SSR sin rebuild.

**Architecture:** Servicio Railway `pocketbase` (SQLite + admin + files en volumen) + servicio `web` Astro Node que consulta PocketBase vía `src/lib/content.ts`. Markdown en campos de texto; imágenes en file fields de PB. MDX del repo se migra una vez y deja de ser la fuente de verdad.

**Tech Stack:** Astro 5 + `@astrojs/node`, PocketBase ≥0.22 (binario Go en Docker), SDK `pocketbase` (npm), `marked` para Markdown→HTML, Railway (2 servicios + volumen).

**Spec:** `docs/superpowers/specs/2026-07-30-pocketbase-cms-design.md`

## Global Constraints

- Node `>=22.12.0`; gestor de paquetes: `pnpm`.
- No reintroducir Keystatic ni GitHub OAuth para editores.
- Contenido público visible con `status` ∈ `published` | `reviewed` | `placeholder` (igual que hoy).
- Copy UI en español latinoamericano neutro (sin voseo).
- Volumen persistente obligatorio en PocketBase; sin volumen no hay deploy a producción.
- Commits solo si el usuario lo pide; en ejecución del plan, commits al final de cada tarea solo si el usuario confirmó la política de commits en esa sesión.
- YAGNI: usar admin UI de PocketBase; no construir admin custom.

## File map

| Path | Responsibility |
|---|---|
| `pocketbase/Dockerfile` | Imagen pinnada de PocketBase para Railway |
| `pocketbase/README.md` | Cómo levantar PB local y en Railway |
| `scripts/pb-schema.mjs` | Crea/actualiza colecciones + API rules (idempotente) |
| `scripts/pb-seed-from-content.mjs` | Importa `src/content/**` → PocketBase |
| `src/lib/pb.ts` | Cliente PocketBase (URL desde env) |
| `src/lib/content.ts` | API de lectura del sitio (reemplaza `getCollection`) |
| `src/lib/markdown.ts` | `markdownToHtml(md: string): string` |
| `src/components/MarkdownBody.astro` | Render HTML del cuerpo |
| `src/views/*.astro`, slug pages | Dejan de usar `render()` de `astro:content` |
| `astro.config.mjs` | Quitar Keystatic |
| `package.json` | Deps: `pocketbase`, `marked`; quitar Keystatic; scripts `pb:schema`, `pb:seed` |
| `docs/cliente.md`, `docs/architecture.md`, `README.md`, `.env.example` | Auth PocketBase, URLs |

---

### Task 1: Scaffold PocketBase (Docker + env)

**Files:**
- Create: `pocketbase/Dockerfile`
- Create: `pocketbase/README.md`
- Modify: `.env.example`
- Modify: `package.json` (scripts placeholder ok; deps en Task 3)

**Interfaces:**
- Produces: servicio construible; env `PUBLIC_POCKETBASE_URL`, `POCKETBASE_ADMIN_EMAIL`, `POCKETBASE_ADMIN_PASSWORD` documentados

- [ ] **Step 1: Añadir Dockerfile pinnado**

Crear `pocketbase/Dockerfile` (ajustar tag a un release actual estable de PocketBase, p.ej. `0.22+` / el que use el template Railway vigente):

```dockerfile
FROM alpine:3.20
ARG PB_VERSION=0.22.21
RUN apk add --no-cache ca-certificates unzip wget \
  && wget -O /tmp/pb.zip "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" \
  && unzip /tmp/pb.zip -d /app \
  && chmod +x /app/pocketbase \
  && rm /tmp/pb.zip
WORKDIR /app
EXPOSE 8080
CMD ["/app/pocketbase", "serve", "--http=0.0.0.0:8080", "--dir=/pb_data"]
```

Nota: si la API de migraciones/schema del release elegido difiere, pinnar la versión que documente `pb-schema.mjs` en Task 2.

- [ ] **Step 2: Documentar arranque local**

`pocketbase/README.md`:

```markdown
# PocketBase (CMS)

## Local
1. Descarga el binario desde https://pocketbase.io o construye la imagen.
2. `./pocketbase serve --http=127.0.0.1:8090 --dir=./pb_data`
3. Abre http://127.0.0.1:8090/_/ y crea el admin.
4. En la raíz del sitio: `PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090`

## Railway
- Root directory / Dockerfile path: `pocketbase/Dockerfile`
- Volume mount: `/pb_data`
- Healthcheck: `/api/health`
- Generate domain; copiar URL a `PUBLIC_POCKETBASE_URL` del servicio `web`
```

- [ ] **Step 3: Actualizar `.env.example`**

```env
# PocketBase (CMS)
PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
# Solo para scripts de schema/seed (no exponer al cliente)
POCKETBASE_ADMIN_EMAIL=
POCKETBASE_ADMIN_PASSWORD=
```

Quitar o comentar variables Keystatic como “legacy / no usar”.

- [ ] **Step 4: Verificar imagen localmente (opcional si Docker disponible)**

```bash
docker build -t edj-pb -f pocketbase/Dockerfile pocketbase
docker run --rm -p 8090:8080 -v edj-pb-data:/pb_data edj-pb
```

Expected: `curl http://127.0.0.1:8090/api/health` → JSON OK.

- [ ] **Step 5: Commit** (solo si el usuario pidió commits)

```bash
git add pocketbase .env.example
git commit -m "chore: add PocketBase Docker scaffold for CMS"
```

---

### Task 2: Schema idempotente (colecciones + rules)

**Files:**
- Create: `scripts/pb-schema.mjs`
- Modify: `package.json` — script `"pb:schema": "node scripts/pb-schema.mjs"`

**Interfaces:**
- Consumes: `PUBLIC_POCKETBASE_URL`, `POCKETBASE_ADMIN_EMAIL`, `POCKETBASE_ADMIN_PASSWORD`
- Produces: colecciones listadas en el spec con fields + API rules

- [ ] **Step 1: Implementar login admin + upsert de colecciones**

`scripts/pb-schema.mjs` debe:

1. `POST /api/admins/auth-with-password` (o endpoint de auth superuser del release pinnado).
2. Para cada colección del spec, si no existe → crear; si existe → actualizar fields faltantes (idempotente).
3. Aplicar rules:
   - list/view: `@request.auth.id != "" || status = "published" || status = "reviewed" || status = "placeholder"`
   - create/update/delete: `@request.auth.id != ""`

Campos mínimos por colección (tipos PocketBase: text, number, select, date, file, json, editor/text para markdown):

**Comunes:** `slug` (text), `locale` (select es|en), `translationKey` (text), `status` (select).

**cuaderno:** + `title`, `description`, `pubDate` (date), `tags` (json array), `cover` (file), `content` (text).

**equipo:** + `name`, `role`, `affiliation`, `group` (investigator|collaborator), `order` (number), `externalUrl`, `bio` (text).

**publicaciones:** + `title`, `authors`, `venue`, `year`, `type`, `url`, `doi`.

**objetivos:** + `numero`, `titulo`, `resumen`, `content`.

**metodos:** + `componente`, `titulo`, `order`, `cifras` (json), `content`.

**sitios:** + `nombre`, `tipo`, `order`, `coordenadas`, `aporte`, `imagen` (file), `content`.

**productos:** + `titulo`, `tipo`, `estado`, `fecha`, `content`.

**galeria:** + `titulo`, `imagen` (file), `pie`, `autoria`, `fecha`, `sitio`, `tags` (json).

**paginas:** + `key` (home|proyecto|contacto), `title`, `description`, `tagline`, `intro`, `content` (sin slug obligatorio; unique por `key`+`locale`).

Usar la Collections API del release pinnado (`/api/collections`). Si el shape del body cambió en v0.23+, seguir la doc de esa versión y anotar la versión en el header del script.

- [ ] **Step 2: Añadir script npm**

```json
"pb:schema": "node scripts/pb-schema.mjs"
```

- [ ] **Step 3: Ejecutar contra PB local con admin creado**

```bash
# .env cargado o variables exportadas
pnpm pb:schema
```

Expected: exit 0; en Admin UI aparecen las 9 colecciones; un request anónimo `GET /api/collections/cuaderno/records` no lista drafts.

- [ ] **Step 4: Commit** (si aplica)

```bash
git add scripts/pb-schema.mjs package.json
git commit -m "feat: add idempotent PocketBase schema script"
```

---

### Task 3: Cliente PB + `content.ts` + Markdown

**Files:**
- Create: `src/lib/pb.ts`
- Create: `src/lib/markdown.ts`
- Create: `src/components/MarkdownBody.astro`
- Create: `scripts/check-content-api.mjs` (smoke check)
- Modify: `src/lib/content.ts`
- Modify: `package.json` — deps `pocketbase`, `marked`

**Interfaces:**
- Produces:
  - `getPb(): PocketBase`
  - `markdownToHtml(source: string): string`
  - Mismas exports que hoy: `getBitacora`, `getBitacoraBySlug`, `getEquipo`, `getPublicaciones`, `getPage`, `getObjetivos`, `getMetodos`, `getSitios`, `getSitioBySlug`, `getProductos`, `getGaleria`, `getEntrySlug`
  - Tipo de entrada: `{ id: string; slug: string; data: {...}; content: string }` (`content` = markdown; bio/pages usan el mismo campo o `data` + `content`)

- [ ] **Step 1: Instalar deps**

```bash
pnpm add pocketbase marked
```

- [ ] **Step 2: `src/lib/pb.ts`**

```ts
import PocketBase from 'pocketbase';

export function getPb() {
  const url = import.meta.env.PUBLIC_POCKETBASE_URL;
  if (!url) throw new Error('PUBLIC_POCKETBASE_URL is not set');
  return new PocketBase(url);
}
```

- [ ] **Step 3: `src/lib/markdown.ts`**

```ts
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

export function markdownToHtml(source: string): string {
  return marked.parse(source ?? '', { async: false }) as string;
}
```

- [ ] **Step 4: `MarkdownBody.astro`**

```astro
---
import { markdownToHtml } from '../lib/markdown';
interface Props { content?: string }
const html = markdownToHtml(Astro.props.content ?? '');
---
<div class="prose" set:html={html} />
```

(Confiar en el editor autenticado; sin DOMPurify por YAGNI.)

- [ ] **Step 5: Reescribir `content.ts`**

- Dejar de importar `astro:content`.
- Mapear records PB → `{ id, slug, data, content }`.
- `getEntrySlug(entry)` → `entry.slug`.
- Conservar lógica de fallback ES→EN en `getBitacoraBySlug`.
- Filtrar con `VISIBLE_STATUSES` **además** de las API rules (defensa en profundidad).
- File URLs: `pb.files.getURL(record, filename)` para `cover`/`imagen`.

- [ ] **Step 6: Smoke check**

`scripts/check-content-api.mjs` (o assert en node) que, con PB seedado o vacío:

```js
// Con PUBLIC_POCKETBASE_URL: lista cuaderno sin throw
import PocketBase from 'pocketbase';
const pb = new PocketBase(process.env.PUBLIC_POCKETBASE_URL);
const list = await pb.collection('cuaderno').getList(1, 1);
console.log('ok', list.totalItems);
```

```bash
node scripts/check-content-api.mjs
```

Expected: `ok <n>` sin error de colección inexistente.

- [ ] **Step 7: Commit** (si aplica)

```bash
git add src/lib/pb.ts src/lib/markdown.ts src/components/MarkdownBody.astro src/lib/content.ts package.json pnpm-lock.yaml scripts/check-content-api.mjs
git commit -m "feat: read site content from PocketBase API"
```

---

### Task 4: Vistas y rutas SSR (quitar `astro:content` render)

**Files:**
- Modify: `src/views/CuadernoSlug.astro`, `CuadernoIndex.astro`, `EquipoPage.astro`, `ProyectoPage.astro`, `ContactoPage.astro`, `ObjetivosPage.astro`, `MetodologiaPage.astro`, `TerritorioPage.astro`, `ProductosPage.astro`, `ArchivoPage.astro`, `HomePage.astro` (si aplica), y páginas `territorio/[slug]` si renderizan body
- Modify: page entrypoints bajo `src/pages/**` que deban ser SSR — añadir `export const prerender = false` en las que muestren CMS content (o en el layout/vista compartida si Astro lo permite por página)

**Interfaces:**
- Consumes: `entry.content` + `MarkdownBody`; `getEntrySlug` → `slug`
- Produces: HTML público idéntico en estructura (mismas clases CSS)

- [ ] **Step 1: Reemplazar patrón `render` + `<Content />`**

Antes:

```astro
import { render } from 'astro:content';
const { Content } = await render(entry);
---
<Content />
```

Después:

```astro
import MarkdownBody from '../components/MarkdownBody.astro';
---
<MarkdownBody content={entry.content} />
```

Para listas (`EquipoPage`, etc.): mapear `content`/`bio` al prop de `MarkdownBody` sin `render()`.

- [ ] **Step 2: Activar SSR en rutas de contenido**

En cada page que deba vivir sin rebuild, p.ej. `src/pages/cuaderno/[slug].astro`:

```ts
export const prerender = false;
```

Aplicar a índices y slugs de: cuaderno, bitacora redirects, territorio, proyecto, equipo, archivo, publicaciones, productos, contacto, home, espejos `/en/...`.

- [ ] **Step 3: Build local con PB levantado**

```bash
# PUBLIC_POCKETBASE_URL apuntando a PB con schema
pnpm build
```

Expected: build OK; sin imports rotos a `astro:content` en vistas migradas.

- [ ] **Step 4: Commit** (si aplica)

```bash
git add src/views src/pages
git commit -m "feat: render CMS markdown in SSR views"
```

---

### Task 5: Seed desde MDX existente

**Files:**
- Create: `scripts/pb-seed-from-content.mjs`
- Modify: `package.json` — `"pb:seed": "node scripts/pb-seed-from-content.mjs"`

**Interfaces:**
- Consumes: tree `src/content/**`, admin credentials
- Produces: records idempotentes por (`slug`|`key`) + `locale`

- [ ] **Step 1: Script de import**

Usar un parser de frontmatter mínimo (`---` YAML) — dependencia ligera `gray-matter` si hace falta (`pnpm add -D gray-matter`).

Por cada archivo:

1. Leer locale desde path (`es`/`en`) o frontmatter.
2. Body = markdown tras frontmatter (MDX sin imports de componentes → tratar como MD).
3. `pb.collection(X).getFirstListItem` filtro slug+locale; si existe `update`, si no `create`.
4. Covers: si hay path bajo `public/images/...` y el archivo existe, subir con `FormData` al file field.

Mapear carpetas:

- `bitacora` → `cuaderno`
- `pages` → `paginas` (`key` = filename sin ext: home, proyecto, contacto)
- resto: mismo nombre de colección

- [ ] **Step 2: Ejecutar seed**

```bash
pnpm pb:seed
```

Expected: conteos alineados con cantidad de MDX por colección; spot-check 1 entrada de cuaderno ES en Admin.

- [ ] **Step 3: Verificar sitio en dev**

```bash
PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090 pnpm dev
```

Abrir `/`, `/cuaderno`, `/equipo`, `/territorio` — contenido presente.

- [ ] **Step 4: Commit** (si aplica)

```bash
git add scripts/pb-seed-from-content.mjs package.json pnpm-lock.yaml
git commit -m "feat: seed PocketBase from existing MDX content"
```

---

### Task 6: Retirar Keystatic

**Files:**
- Delete: `keystatic.config.ts`
- Modify: `astro.config.mjs` — quitar `keystatic()` e import
- Modify: `package.json` — `pnpm remove @keystatic/astro @keystatic/core`
- Modify: `src/components/layout/Footer.astro` — link “Editar contenido” → `import.meta.env.PUBLIC_POCKETBASE_URL + '/_/'` (o `PUBLIC_CMS_ADMIN_URL`)
- Modify: `src/i18n/ui.ts` si el copy del footer debe decir “Editar en el CMS” / mantener texto
- Modify: `docs/cliente.md`, `docs/architecture.md`, `README.md`, `.env.example`

**Interfaces:**
- Produces: build sin Keystatic; footer apunta al admin PB

- [ ] **Step 1: Quitar integración y deps**

```bash
pnpm remove @keystatic/astro @keystatic/core
```

Editar `astro.config.mjs` para que solo queden mdx, sitemap, react, node adapter.

- [ ] **Step 2: Footer**

```astro
{import.meta.env.PUBLIC_POCKETBASE_URL && (
  <a href={`${import.meta.env.PUBLIC_POCKETBASE_URL}/_/`} class="site-footer__edit" rel="nofollow">
    {ui.footer.editContent}
  </a>
)}
```

- [ ] **Step 3: Docs**

Reescribir secciones de Keystatic/GitHub OAuth → PocketBase: URL admin, crear usuario, filtrar por idioma, estados de publicación.

Actualizar `docs/architecture.md` stack y diagrama de deploy (Railway web + pocketbase).

- [ ] **Step 4: `pnpm build` sin Keystatic**

Expected: success; no route `/keystatic`.

- [ ] **Step 5: Commit** (si aplica)

```bash
git add -A
git commit -m "refactor: remove Keystatic; document PocketBase CMS"
```

---

### Task 7: Deploy Railway (pocketbase + cablear web)

**Files:**
- Ninguno obligatorio (ops); opcional `railway.toml` / config en dashboard

**Interfaces:**
- Produces: PB público con volumen; `web` con `PUBLIC_POCKETBASE_URL`; schema+seed en prod; usuario editor

- [ ] **Step 1: Crear servicio `pocketbase` en proyecto `ecologiasdeljabali`**

- Dockerfile path: `pocketbase/Dockerfile`
- Volume → `/pb_data`
- Healthcheck `/api/health`
- `generate-domain`
- Primera visita a `/_/` → crear admin (guardar email/clave en gestor de secretos del equipo)

- [ ] **Step 2: Schema + seed contra producción**

```bash
PUBLIC_POCKETBASE_URL=https://<pb>.up.railway.app \
POCKETBASE_ADMIN_EMAIL=... \
POCKETBASE_ADMIN_PASSWORD=... \
pnpm pb:schema && pnpm pb:seed
```

- [ ] **Step 3: Variables en servicio `web`**

`PUBLIC_POCKETBASE_URL=https://<pb>.up.railway.app`

Redeploy `web` (`railway up` o redeploy dashboard).

- [ ] **Step 4: Verificación end-to-end**

1. Login admin PB; editar título de un draft→published de cuaderno.
2. Recargar `https://web-production-57fa0.up.railway.app/cuaderno` (o dominio actual) → cambio visible sin rebuild manual extra (SSR).
3. Confirmar que sin login no se pueden crear records (API 403).

- [ ] **Step 5: Entregar al usuario**

- URL sitio
- URL admin `…/_/`
- Recordatorio: backup del volumen; cambiar contraseña desde el admin PB

---

## Spec coverage checklist

| Spec requirement | Task |
|---|---|
| Servicio PB + volumen Railway | 1, 7 |
| Colecciones + locale + status | 2 |
| Lectura vía content.ts / SSR | 3, 4 |
| Markdown bodies | 3, 4 |
| Seed desde MDX | 5 |
| Auth email/clave 1 usuario | 7 (admin PB) |
| API rules lectura/escritura | 2 |
| Retiro Keystatic + docs | 6 |
| Updates sin rebuild | 4 (SSR) + 7 |
| Separación idiomas en admin | 2 (campo locale + docs de filtro) |

## Placeholder / consistency self-review

- Sin TBD en pasos operativos.
- Nombre de colección `cuaderno` (no `bitacora`) consistente en schema, seed y content.ts.
- `getEntrySlug` pasa a `entry.slug` en Task 3–4.
- Auth endpoint admin: verificar contra la versión pinnada en Task 1 (PocketBase cambió rutas en v0.23); ajustar `pb-schema.mjs` a esa versión una sola vez.
