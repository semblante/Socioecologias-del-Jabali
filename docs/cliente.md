# Guía para editar el sitio

Todo el contenido se edita desde el panel de PocketBase. Los cambios aparecen en el sitio apenas
guardas: no hay que publicar ni esperar nada.

## 1. Entrar al panel

1. Abre el enlace **Editar contenido** al pie de cualquier página del sitio, o entra directo a
   [pocketbase-production-6f98.up.railway.app/\_/](https://pocketbase-production-6f98.up.railway.app/_/).
2. Inicia sesión con el correo y la contraseña que te entregó el equipo técnico.
3. A la izquierda está la lista de **colecciones** (`paginas`, `cuaderno`, `equipo`…). Cada
   colección es una tabla de registros.

> **No cambies la contraseña desde el panel.** El servidor la restablece en cada reinicio. Si hay
> que cambiarla, pídeselo a Pablo.

¿Prefieres una versión con un botón «Editar» junto a cada texto?
[Ábrela aquí](https://claude.ai/artifact/3TuUyRiJMzRKVjACGg3zgo).

## 2. Editar un texto

1. Entra a la colección, por ejemplo **paginas**.
2. Cada texto está dos veces: en español y en inglés. Para ver solo el español, escribe
   `locale = "es"` en la barra de búsqueda y presiona Enter.
3. Haz clic en la fila que quieres cambiar. Se abre un panel a la derecha con sus campos.
4. Cambia el texto en el campo que corresponda (la tabla del punto 3 dice cuál).
5. Presiona **Save changes**, abajo a la derecha.
6. Recarga la página del sitio para ver el cambio.
7. Si corresponde, repite en inglés con `locale = "en"`.

> **Lo más común:** cerrar el panel sin presionar **Save changes**. El cambio se pierde.

> **Si aparece un recuadro rojo al guardar,** falta un campo obligatorio: `title`,
> `translationKey`, `status` o `locale`. Complétalo y guarda de nuevo.

## 3. Dónde está cada texto

### Portada

| En el sitio | Colección | Registro | Campo |
|---|---|---|---|
| Título grande | `paginas` | `home` | `title` |
| Frase en cursiva bajo el título | `paginas` | `home` | `tagline` |
| Párrafo de presentación | `paginas` | `home` | `intro` |
| Video o imagen de fondo | `paginas` | `home` | `heroMedia` |
| Texto «Sobre el proyecto» | `paginas` | `home` | `content` |
| Texto del bloque «Territorio de trabajo» | `paginas` | `territorio` | `description` |
| Fotos de «Registro de campo» | `galeria` | una por foto | `titulo`, `imagen`, `pie`, `autoria`, `fecha` |

### Resto del sitio

| En el sitio | Colección | Registro | Campo |
|---|---|---|---|
| Territorio: bajada | `paginas` | `territorio` | `tagline` |
| Territorio: introducción | `paginas` | `territorio` | `intro` |
| Territorio: casos secundarios | `paginas` | `territorio` | `content` |
| Cada sitio (Puesco-Lanín, Panqui…) | `sitios` | uno por sitio | `nombre`, `aporte`, `content` |
| El proyecto | `paginas` | `proyecto` | `title`, `description`, `content` |
| Contacto | `paginas` | `contacto` | `content` |
| Archivo (fotos) | `galeria` | una por foto | `titulo`, `imagen`, `pie`, `autoria`, `fecha` |
| Entradas del Cuaderno | `cuaderno` | una por entrada | `title`, `description`, `pubDate`, `content` |
| Perfiles del equipo | `equipo` | uno por persona | `name`, `role`, `affiliation`, `bio` |

Los sitios también tienen un campo `coordenadas` («lat, lng»). Por ahora el mapa no lo dibuja:
los puntos vuelven cuando estén verificados.

### Formato de los campos `content`

| Para escribir | Escribe así |
|---|---|
| *Cursiva* | `*cursiva*` |
| **Negrita** | `**negrita**` |
| Un párrafo nuevo | Deja una línea en blanco |
| Un enlace | `[texto](https://enlace)` |

## 4. Imágenes

- La portada muestra hasta **5 imágenes** de `galeria`, las de `fecha` más reciente primero.
- Hoy son fotos de relleno de Wikimedia Commons, con su crédito en `autoria`.
- Para cambiar una foto, reemplaza el campo `imagen` por la dirección de la foto nueva
  (`https://…` o `/images/galeria/foto.jpg`), o crea un registro nuevo.
- Si no tienes dónde alojar las fotos, envíalas al equipo técnico y las subimos.

## 5. Qué se ve y qué no

Cada registro tiene un campo **status**:

| status | ¿Se ve en el sitio? |
|---|---|
| `published` | Sí |
| `reviewed` | Sí |
| `placeholder` | Sí |
| `draft` | No. Sirve para dejar algo a medio escribir. |

## 6. Español e inglés

Las dos versiones de un mismo texto comparten el campo **translationKey**. No lo cambies: es lo
que las une y lo que hace funcionar el botón ES/EN.
