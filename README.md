# README — Socioecologías del jabalí

Sitio del Fondecyt Regular 1260739. Astro + PocketBase (CMS) en Railway.

## Desarrollo

```bash
pnpm install
# Terminal 1: PocketBase local
tools/pocketbase.exe serve --http=127.0.0.1:8090 --dir=tools/pb_data
# Terminal 2
cp .env.example .env   # PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
pnpm pb:schema && pnpm pb:seed   # primera vez
pnpm dev
```

## CMS

- Admin: `PUBLIC_POCKETBASE_URL/_/`
- Guía para editores: `docs/cliente.md`
- Schema/seed: `pnpm pb:schema`, `pnpm pb:seed`

## Deploy

Servicios Railway: `web` (Astro) + `pocketbase` (volumen `/pb_data`).
