# Ecologías del jabalí

Sitio web del proyecto Fondecyt *Wild boar socioecologies* — Manuel Tironi et al.

## Stack

- [Astro 5](https://astro.build) (SSG + Cloudflare adapter)
- [Keystatic](https://keystatic.com) — panel de edición en `/keystatic`
- CSS nativo con design tokens
- i18n ES (default) / EN
- Deploy: Cloudflare Pages

## Comandos

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build
pnpm preview
```

## Editar contenido (sin tocar Git)

Tironi y su equipo **no necesitan usar la terminal ni el repositorio**. El contenido se edita desde el navegador:

1. Abre **https://ecologiasdeljabali.cl/keystatic** (o `http://localhost:4321/keystatic` en desarrollo)
2. Inicia sesión con GitHub (cuenta que el administrador haya autorizado)
3. Edita cuaderno de campo, equipo, publicaciones o páginas desde formularios visuales
4. Guarda — los cambios se publican automáticamente en el sitio

Guía detallada para el cliente: [docs/cliente.md](docs/cliente.md)

## Estructura

```
src/
  components/     UI y layout
  content/          Contenido editable (MD/MDX)
    bitacora/es|en/
    equipo/es|en/
    publicaciones/es|en/
    pages/es|en/
  pages/            Rutas del sitio
  styles/           Tokens y estilos
keystatic.config.ts  Configuración del CMS
```

## Deploy en Cloudflare Pages

- Build command: `pnpm build`
- Output directory: `dist`
- Variables de entorno: ver `.env.example`

## Desarrollo local

En local, Keystatic guarda en archivos del proyecto (`storage: local`). En producción usa GitHub como backend.
