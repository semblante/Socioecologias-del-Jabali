# Socioecologías del jabalí — guía para agentes

Sitio bilingüe del proyecto Fondecyt Regular 1260739 dirigido por Manuel Tironi (PUC), sobre el
jabalí como zona de contacto socioecológica en la Araucanía andina, con la Asociación Indígena
Winkulmapu. **Es trabajo para un cliente**, no un producto propio.

Astro 5 en SSR (`@astrojs/node`, `prerender = false` en todas las rutas), con **PocketBase como
CMS**. Deploy en Railway: servicio `web` más servicio `pocketbase` con volumen en `/pb_data`.

## Restricciones duras

1. No levantar `dev` ni PocketBase sin permiso explícito en este chat.
2. **El contenido no vive en el repo.** Vive en PocketBase y se lee en runtime desde `src/lib/content.ts`. Los archivos de `src/content/` son solo la semilla idempotente de `pnpm pb:seed`.
3. Estilos con los tokens de `src/styles/tokens.css`. La dirección visual está definida y cerrada: no la reinterpretes.
4. Español latinoamericano neutro, y cada texto tiene su par en inglés con el mismo `translationKey`.
5. El cliente edita desde el panel de PocketBase. Si agregas un campo, tiene que ser editable ahí, no hardcodeado.

## Si vas a tocar X, lee Y

| Tarea | Leer primero |
| --- | --- |
| **Qué está hecho y qué falta** | `ESTADO.md`. Única fuente de estado. |
| Colecciones, campos, reglas de API | `scripts/pb-schema.mjs` |
| Lectura de contenido | `src/lib/content.ts` |
| Semilla | `scripts/pb-seed-from-content.mjs` y `src/content/` |
| Estilos, tipografía, color, sello | `src/styles/tokens.css` y `docs/design-sello-de-campo.md` |
| Arquitectura y deploy | `docs/architecture.md` y `pocketbase/README.md` |
| Qué ve y qué puede editar el cliente | `docs/cliente.md` |

## Nada de Keystatic ni de Cloudflare

El repo migró de Keystatic a PocketBase en julio de 2026, y de Cloudflare a Railway. El
2026-08-03 se borró lo que quedaba: `wrangler.toml`, `src/content.config.ts`, las colecciones de
`astro:content`, `Card.astro` y el plan de migración ya ejecutado. Si encuentras una mención a
Keystatic, a `astro:content` o a Cloudflare en algún archivo, es residuo: bórrala.
