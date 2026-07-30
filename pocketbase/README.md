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
