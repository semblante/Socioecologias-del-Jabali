# Arquitectura — ecologiasdeljabali.cl

## CMS: interfaz web, no repositorio

Tironi edita contenido en **`/keystatic`**, un panel visual en el navegador. No necesita Git, terminal ni editar archivos.

| Entorno | Cómo guarda Keystatic |
|---|---|
| Desarrollo local | Archivos en `src/content/` (storage local) |
| Producción | GitHub API (storage github) — invisible para el editor |

## Stack

- Astro 5 + Content Layer
- Keystatic (colecciones bilingües ES/EN)
- CSS nativo con design tokens
- Cloudflare Pages + adapter

## Rutas

```
/              → ES (default)
/en/           → EN
/keystatic     → Panel de edición
```

## Colecciones

- `bitacora/es|en` — cuaderno de campo
- `equipo/es|en` — perfiles
- `publicaciones/es|en` — bibliografía
- `pages/es|en` — páginas institucionales

Cada entrada tiene `translationKey` para enlazar versiones ES/EN.

## Deploy

1. Repo en GitHub (gestionado por el desarrollador)
2. Cloudflare Pages conectado al repo
3. Variables: `KEYSTATIC_GITHUB_REPO`, `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`
4. OAuth App de GitHub con callback a `/api/keystatic/github/oauth/callback`
