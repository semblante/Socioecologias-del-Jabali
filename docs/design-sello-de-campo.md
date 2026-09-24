# Dirección visual — «Sello de campo»

Decisión de diseño para la iteración post-estructura (jul 2026).

## Referencias de género (investigación)

| Sitio | Qué hace bien |
|---|---|
| [Feral Atlas](https://feralatlas.org/) | Cartografía como argumento; ritmo lento; tipografía subordinada a la exploración |
| [Rewilding the Anthropocene](https://rewilding.de/) | Jerarquía clara proyecto → sitios → publicaciones; densidad académica sin dashboard |
| [BeeCultures](https://blogs.uni-bremen.de/beecultures/) | Multimodalidad de campo; escritura + sensorial |
| [Thom van Dooren](https://www.thomvandooren.org/current-projects/) | Proyectos como ensayos tipográficos; poco chrome |
| Manual de marca WBS | Sello, terracota `#b6573e`, crema, tinta — fuente de verdad local |

## Convenciones compartidas del género

- Tipografía densa y seriada (ensayo), no marketing cards.
- Imagen de campo / mapa como ancla, no collage hero genérico.
- Bilingüismo discreto (ES/EN) en header, no banderas.
- Bitácora = crónica temporal; publicaciones = archivo citacional (jerarquías distintas).

## Dirección elegida: Sello de campo

Tokens: crema/tinta/terracota del manual; radio 0; Newsreader (display + prosa), Instrument Sans (UI), Geist Mono (meta).
Mapa OSM con filtro sepia; marcadores terracota (principal) / tinta (secundarios).
Listas de archivo en lugar de cards con pastillas.

## Tokens: tomado vs pendiente

**Tomado:** paleta, familias, ritmo de sección, grain, accent.
**Afinado en esta pasada:** escala tipográfica editorial, radius 0, prose en serif, tags sin pastilla, mapa.
**Sigue pendiente de Tironi:** validación del nombre público, `heroMedia` y contenido; el dominio `ecologiasdeljabali.cl` ya está operativo en producción.

## Evolución 2026-09: portada de carátula

Tironi pidió más realce en la portada: el título no se leía como título, el sello no estaba
resuelto y «Territorio de trabajo» se veía chico y corrido. La referencia pasa a ser la gráfica
de carátula de fines de los 70 (Hipgnosis, *Dark Side of the Moon*): campo negro, escala enorme,
retícula estricta y un solo gesto de color. No es psicodelia redondeada sesentera.

- **Display:** Archivo Variable a `font-stretch: 62%`, peso 800, versales (`--font-display`).
  Solo para el título del hero y los títulos de sección de portada (`.display-title`). Newsreader
  sigue siendo la voz de lectura; Instrument Sans y Geist Mono no cambian.
- **Banda espectral:** la paleta de marca refractada en 6 franjas (`--spectrum-x`). Aparece como
  hilo bajo el título del hero y como marca corta de sección (`.section-mark`). Nunca como fondo
  ni como degradado.
- **Sello:** en «Sobre el proyecto» funciona como marca de agua (opacidad ~7 %) detrás del texto.
- **Territorio:** título display a todo el ancho y mapa a todo el ancho con el polígono de la zona
  de trabajo (`public/geo/zona-trabajo.geojson`, hoy aproximado hasta que llegue el KMZ).
- **Imagen:** franja «Registro de campo» en portada, alimentada por `galeria`.

### Interiores y movimiento (2026-09-24)

- **Encabezados de página:** hilo espectral corto, título display en versales
  (`.page-header__title`, variante `--long` para títulos-frase), bajada serif en cursiva y regla de cierre.
- **Movimiento:** una sola curva (`--ease-organic`). Tiempos: 180 ms color, 420 ms estado,
  560–900 ms gestos.
  - Menú: el hilo espectral entra por la izquierda y sale por la derecha; los hermanos se atenúan.
    La página activa lleva un hilo terracota fijo.
  - Enlaces con flecha (`.link-line`): regla terracota, el espectro la recorre al pasar y la flecha avanza.
  - Filas del Cuaderno: el espectro recorre la regla superior.
  - Botones del hero: inversión (el sólido se vacía, el contorno se llena).
  - Cambio de página: solo `#main` sale y entra (View Transitions); el header no se mueve.
  - Scroll: los bloques bajo el pliegue entran con un fundido corto (`src/scripts/reveal.ts`).
- Todo respeta `prefers-reduced-motion`.

### Sistema tipográfico cerrado (2026-09-24)

| Rol | Fuente | Dónde |
|---|---|---|
| Título de página y de sección | Archivo 62 %, 800, versales | hero, `.page-header__title`, `.prose h2`, grupos de Equipo, «Casos secundarios», marca del header y del pie |
| Título de ítem | Archivo 82 %, 650 | personas, entradas, sitios, publicaciones, objetivos, productos, `.prose h3` |
| Lectura | Newsreader | prosa, bajadas en cursiva, citas, afiliaciones, «Sobre el proyecto» |
| Meta | Geist Mono | fechas, etiquetas (sin pastilla), filtros, roles |

`--f-display` apunta a Archivo; la serif ya no se usa en títulos.

### Relieves por vista

Cada vista tiene su propio terreno de fondo (`src/lib/surface.ts` → `topoFromPath`). Portada y
Territorio usan el mapa real; el resto, curvas de nivel generadas con `node scripts/gen-topo.mjs`
(semilla fija por vista, SVG de 40–70 KB). Al navegar, dos capas `.site-topo` se funden en ~1,4 s.

### Carga y detalles (2026-09-24)

- **Carga inicial:** las fuentes críticas se precargan y un guardián (`Base.astro`) oculta el texto
  hasta que cargan, sin salto de fuente (tope de 1,2 s tras el parseo). Entrada de títulos e hilos
  espectrales según `siteConfig.intro` (`src/config/site.ts`): `flicker` (vigente) enciende cada letra y
  cada segmento del espectro como tubo fluorescente, a tiempos y ritmos distintos; `sweep` es el barrido
  anterior, de izquierda a derecha. Volver es cambiar esa palabra (`src/scripts/letters.ts`).
- **Header:** 4,5 rem. En portada, la regla de la fila Fondecyt/coordenadas va pegada bajo el header. Marca en bloque a la altura del sello: nombre en display y «Andes del Sur» en
  mono, alineado a la izquierda. Al tocar fondo, su contenido baja al 20 % (el footer ya repite la marca).
- **Footer:** sello como marca de agua a la derecha del título, contenido en su columna.
- **Sobre el proyecto:** al entrar la sección, las curvas del mapa de fondo se oscurecen, enmascaradas
  para no pasar detrás del texto.
- **Hilos animados:** siempre en su propia capa (`will-change`), así no adelgazan al terminar.
