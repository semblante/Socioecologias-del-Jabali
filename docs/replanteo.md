# Replanteo del sitio — Socioecologías del jabalí

Plan de la mejora estructural y de diseño. Fuente: `AbstractRegEng_MTironi.pdf`,
`Resumen Proyecto_CAST.pdf` y el manual de marca `260406_WBS_AprobacionFinal`.

## 0. Decisiones pendientes

| Tema | Estado |
|---|---|
| Nombre público del sitio | **Pendiente de Tironi.** El manual dice "Socioecologías del jabalí — Andes del sur"; el sitio dice "Ecologías del jabalí". El código lo lee desde `siteConfig.name`, así que el cambio es de una línea cuando se resuelva. |
| Tipografías | El manual no especifica familia de texto. Propuesta: conservar el trío actual (Newsreader / Instrument Sans / Geist Mono) reajustando escala y pesos. |

## 1. Identidad

Assets extraídos del manual, en `public/brand/`:

| Archivo | Uso |
|---|---|
| `logo-{es,en}-abierto.svg` | Versión recomendada por el manual. Header, portada, pie. |
| `logo-{es,en}-anillo.svg` | Sello con borde. Documentos, tarjetas. |
| `logo-{es,en}-solido.svg` | Disco lleno con texto en negativo. Favicon, avatar, OG. |
| `logo-*.png` | Mismas variantes en PNG transparente ~1000px, para usos fuera de la web. |

Los SVG usan `fill="currentColor"`: se recolorean desde CSS y no hace falta un
archivo por color de fondo.

### Paleta oficial

Muestreada de las láminas del manual.

| Token | Valor | Origen |
|---|---|---|
| `--color-accent` | `#b6573e` | Terracota de las láminas 6 y 11 |
| `--color-bg` | `#edeae1` | Crema de las láminas 6 y 11 |
| `--color-bg-alt` | `#fafaeb` | Marfil de las láminas 3 y 8 |
| `--color-text` | `#131416` | Negro de las láminas 4 y 9 |
| `--color-ink-logo` | `#1e1c1c` | Tinta del sello |

Los tokens actuales (`#7b3b2a` de acento, `#f0ede6` de fondo) son más apagados
que la marca aprobada y se reemplazan.

## 2. Arquitectura de información

### Problema actual

Siete rutas planas que no dan cabida al material del proyecto, y cada una
duplicada a mano en `src/pages/` y `src/pages/en/` — doce archivos casi idénticos
que hay que editar de a pares.

### Estructura propuesta

```
/                        Portada
/proyecto                Pregunta central, jabalí como zona de contacto
  /proyecto/objetivos      Los 4 objetivos y las 3 hipótesis
  /proyecto/metodologia    Los 3 componentes metodológicos y sus cifras
/territorio              Puesco-Lanín y el corredor
  /territorio/winkulmapu   El Acuerdo de Gobernanza como pieza destacada
  /territorio/[sitio]      Quiñenahuin, Panqui, Palguín Alto
/equipo                  Perfiles
/cuaderno                Cuaderno de campo (hoy /bitacora)
  /cuaderno/[slug]
/archivo                 Archivo visual: terreno, cámaras trampa, cartografías
/publicaciones           Bibliografía
/productos               Libro comunitario, policy briefs, exposición de arte
/contacto                Contacto e instituciones
```

Navegación principal: **Proyecto · Territorio · Equipo · Cuaderno · Archivo ·
Publicaciones**. Productos y Contacto quedan en el pie y como enlaces desde
portada, para no saturar el header.

### Fin de la duplicación ES/EN

Todas las rutas pasan a `src/pages/[...lang]/` con `getStaticPaths` devolviendo
`{ lang: undefined }` para español y `{ lang: 'en' }` para inglés. Es el patrón
nativo de Astro con `prefixDefaultLocale: false` y mantiene las URLs actuales
(`/proyecto` y `/en/proyecto`). Doce archivos de ruta pasan a seis.

Redirecciones de `/bitacora` a `/cuaderno` para no romper enlaces existentes.

## 3. Modelo de contenido

Colecciones nuevas, todas bilingües con `translationKey` como las actuales:

| Colección | Campos |
|---|---|
| `objetivos` | `numero`, `titulo`, `resumen`, cuerpo MDX |
| `metodos` | `componente` (ecologia / etnografia / participativo), `titulo`, `cifras[]` (`{ valor, unidad }`) |
| `sitios` | `nombre`, `tipo` (principal / secundario), `coordenadas`, `aporte`, imagen |
| `productos` | `tipo` (libro / policy-brief / exposicion / evento), `titulo`, `estado`, `fecha` |
| `galeria` | `imagen`, `pie`, `autoria`, `fecha`, `sitio`, `tags[]` |

Cambios en colecciones existentes:

- `bitacora` gana `cover` (imagen) y soporte de imágenes en el cuerpo.
- `pages` gana `hero` opcional.

### Imágenes en el CMS

Hoy el manual del cliente dice que hay que llamar al desarrollador para subir una
imagen. Para un proyecto de terreno con cámaras trampa, cartografías y trawun eso
no se sostiene. Se habilitan campos `image` en Keystatic apuntando a
`public/images/<coleccion>/` con `publicPath`, y `<Image>` de Astro para
optimización y `srcset`.

## 4. Sistema de diseño

`src/styles/components.css` tiene ~770 líneas y concentra el estilo de todos los
componentes. Se disuelve: cada estilo se muda al bloque `<style>` del `.astro`
que lo usa, que es el mecanismo nativo de Astro y da scoping automático. Quedan
globales solo `tokens.css`, `base.css` y `typography.css`.

Componentes nuevos que pide la estructura: `Figure`, `Gallery`, `SiteMap`,
`StatBlock` (para las cifras de terreno), `ObjectiveList`, `Timeline`.

## 5. Faltantes técnicos

- Página 404 (no existe).
- Imágenes OG por página, usando el sello sólido como base.
- Datos estructurados Schema.org `ResearchProject` con el número Fondecyt.
- `public/jabali_icon.png` (2,2 MB) queda obsoleto al entrar el sello vectorial.

## 6. Contenido a poblar

Todo el contenido del sitio está hoy en `status: placeholder`. Material
disponible en los PDF para reemplazarlo:

- **Proyecto**: Fondecyt Regular 1260739 (2026), PUC. Pregunta central, hipótesis
  del jabalí como zona de contacto (Haraway 2003), 4 objetivos, 3 hipótesis.
- **Metodología**: ecología de campo (60 cámaras trampa, transectos, drones con
  cámara térmica, análisis de dieta y paisaje), etnografía (60 entrevistas, 40
  observaciones participantes, 30 visitas), métodos participativos (4 cartografías
  comunitarias, 2 talleres de co-diseño, 2 trawun).
- **Territorio**: Puesco-Lanín como caso principal; Quiñenahuin, Panqui y Palguín
  Alto como casos secundarios, cada uno con su aporte de datos.
- **Winkulmapu**: Acuerdo de Gobernanza de 2024 con CONAF y Bienes Nacionales
  sobre 17.000 hectáreas; contexto del SBAP y las Áreas de Conservación Indígenas.
- **Equipo**: Manuel Tironi (responsable), Nicolás Gálvez, Pelayo Benavides,
  Francisco Colipe (Winkulmapu). El resumen en español escribe "Banavides"; el
  apellido correcto es Benavides.
- **Productos**: libro comunitario, policy briefs, exposición de arte.

## 7. Orden de ejecución

1. Sistema de diseño: paleta oficial y sello de marca integrado.
2. Rutas `[...lang]` y disolución de `components.css`.
3. Colecciones nuevas y campos de imagen en Keystatic.
4. Páginas nuevas con el contenido real de los PDF.
5. Archivo visual.
6. Faltantes técnicos: 404, OG, datos estructurados.
7. Actualizar `docs/cliente.md` y `docs/architecture.md`.
