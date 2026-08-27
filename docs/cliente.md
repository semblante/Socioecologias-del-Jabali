# Guía para editar el sitio

Esta guía es para Manuel Tironi y su equipo. **No necesitas saber programar ni usar Git.**

## Acceder al panel de edición

1. Abre el enlace **Editar contenido** en el pie del sitio, o la URL del CMS que te compartió el equipo técnico (termina en `/_/`).
2. Inicia sesión con el **email y contraseña** que te asignaron (se pueden cambiar desde el propio panel: Account).
3. En el menú lateral verás las colecciones. Usa el filtro de **locale** (`es` / `en`) para trabajar un idioma a la vez.

## Qué puedes editar

| Colección | Qué es |
|---|---|
| **cuaderno** | Diario de campo: entradas narrativas que se van sumando |
| **equipo** | Perfiles del equipo (investigadores, tesistas, colaboradores) |
| **publicaciones** | Lista bibliográfica |
| **objetivos** | Objetivos del Fondecyt (también resumidos en la página Proyecto) |
| **metodos** | Componentes metodológicos y cifras |
| **sitios** | Puesco-Lanín y casos secundarios |
| **productos** | Libro, policy briefs, exposición |
| **galeria** | Archivo visual (fotos, cámaras, mapas) — distinto del Cuaderno |
| **paginas** | Portada, El proyecto, Contacto (`key`: home / proyecto / contacto). En `home`, `heroMedia` es la ruta del video o imagen de portada; varios videos separados por coma alternan en loop (p. ej. `/media/jabali1.mp4,/media/jabali2.mp4`) |

## Publicación

Cada registro tiene **status**: `draft`, `reviewed`, `published`, `placeholder`. El sitio público muestra `published`, `reviewed` y `placeholder`.

Los cambios se ven en el sitio al guardar (sin pedir un deploy).

## Bilingüismo

Usa el mismo **translationKey** en la versión ES y EN de una entrada para enlazarlas. Filtra por `locale` para no mezclar idiomas en la lista.
