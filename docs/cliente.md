# Guía para editar el sitio

Esta guía es para Manuel Tironi y su equipo. **No necesitas saber programar ni usar Git.** Todo se
edita desde el panel de PocketBase, y los cambios se ven en el sitio apenas guardas: no hay que
publicar ni esperar un deploy.

## 1. Entrar al panel

1. Abre el enlace **Editar contenido** que está al final de cualquier página del sitio, o entra
   directo a `https://pocketbase-production-6f98.up.railway.app/_/`.
2. Inicia sesión con el correo y la contraseña que te entregó el equipo técnico. No la cambies desde el panel:
   el servidor la restablece desde su configuración en cada reinicio. Si hay que cambiarla, pídeselo a Pablo.
3. A la izquierda verás la lista de **colecciones** (`paginas`, `cuaderno`, `equipo`…). Cada una
   es una tabla de registros.

> Versión con un botón «Editar» por cada texto: https://claude.ai/artifact/3TuUyRiJMzRKVjACGg3zgo

## 2. Editar un texto, paso a paso

1. Haz clic en la colección, por ejemplo **paginas**.
2. Cada texto existe dos veces, una en español y otra en inglés. Para ver solo el español, escribe
   en la barra de búsqueda de arriba `locale = "es"` y presiona Enter.
3. Haz clic en la fila que quieres cambiar. Se abre un panel a la derecha con todos los campos.
4. Cambia el texto en el campo que corresponda (ver la tabla del punto 3).
5. **Presiona el botón «Save changes»**, abajo a la derecha del panel. Si cierras el panel sin
   guardar, el cambio se pierde. Es el error más común.
6. Recarga la página del sitio: el cambio ya está publicado.
7. Repite en la versión en inglés (`locale = "en"`) si corresponde.

> Si al guardar aparece un recuadro rojo, casi siempre es un campo obligatorio vacío (`title`,
> `translationKey`, `status`, `locale`). Complétalo y vuelve a guardar.

## 3. Dónde está cada texto del sitio

| Lo que ves en el sitio | Colección → registro | Campo |
|---|---|---|
| Título grande de la portada | `paginas` → key `home` | `title` |
| Frase en cursiva bajo el título | `paginas` → key `home` | `tagline` |
| Párrafo de la portada | `paginas` → key `home` | `intro` |
| Video o imagen de fondo de la portada | `paginas` → key `home` | `heroMedia` |
| Texto «Sobre el proyecto» | `paginas` → key `home` | `content` |
| Texto del bloque «Territorio de trabajo» en portada | `paginas` → key `territorio` | `description` |
| Página Territorio: bajada, introducción y casos secundarios | `paginas` → key `territorio` | `tagline`, `intro`, `content` |
| Cada sitio (Puesco-Lanín, Panqui…), incluido su punto en el mapa | `sitios` | `nombre`, `aporte`, `coordenadas` («lat, lng»), `content` |
| Página El proyecto | `paginas` → key `proyecto` | `title`, `description`, `content` |
| Contacto | `paginas` → key `contacto` | `content` |
| Fotos de «Registro de campo» (portada) y Archivo | `galeria` | `titulo`, `imagen`, `pie`, `autoria`, `fecha` |
| Entradas del Cuaderno | `cuaderno` | `title`, `description`, `pubDate`, `content` |
| Perfiles del equipo | `equipo` | `name`, `role`, `affiliation`, `bio` |

Los campos `content` aceptan **Markdown**: `*cursiva*`, `**negrita**`, una línea en blanco para
separar párrafos y `[texto](https://enlace)` para enlaces.

## 4. Imágenes

- La portada muestra hasta **5 imágenes** de `galeria`, las de `fecha` más reciente primero.
- Hoy hay fotos de relleno de Wikimedia Commons (con su crédito en `autoria`). Para reemplazarlas,
  basta con cambiar el campo `imagen` por la dirección de la foto nueva, o crear registros nuevos.
- Por ahora `imagen` es un texto con una dirección (`https://…` o `/images/galeria/foto.jpg`). Si
  no tienes dónde alojar las fotos, envíalas al equipo técnico y las subimos.

## 5. Publicación

Cada registro tiene **status**: `draft`, `reviewed`, `published`, `placeholder`. El sitio muestra
`published`, `reviewed` y `placeholder`. `draft` no se ve: sirve para dejar algo a medio escribir.

## 6. Bilingüismo

La versión en español y la versión en inglés de un mismo texto comparten el mismo
**translationKey**. No lo cambies: es lo que enlaza ambas versiones y el botón ES/EN.
