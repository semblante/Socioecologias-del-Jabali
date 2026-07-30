# Guía para editar el sitio

Esta guía es para Manuel Tironi y su equipo. **No necesitas saber programar ni usar Git.**

## Acceder al panel de edición

1. Abre el enlace **Editar contenido** en el pie del sitio, o la URL del CMS que te compartió el equipo técnico (termina en `/_/`).
2. Inicia sesión con el **email y contraseña** que te asignaron (se pueden cambiar desde el propio panel: Account).
3. En el menú lateral verás las colecciones. Usa el filtro de **locale** (`es` / `en`) para trabajar un idioma a la vez.

## Qué puedes editar

| Colección | Qué es |
|---|---|
| **cuaderno** | Entradas del cuaderno de campo |
| **equipo** | Perfiles del equipo |
| **publicaciones** | Lista bibliográfica |
| **objetivos** | Objetivos del Fondecyt |
| **metodos** | Componentes metodológicos y cifras |
| **sitios** | Puesco-Lanín y casos secundarios |
| **productos** | Libro, policy briefs, exposición |
| **galeria** | Archivo visual |
| **paginas** | Portada, El proyecto, Contacto (`key`: home / proyecto / contacto) |

## Publicación

Cada registro tiene **status**: `draft`, `reviewed`, `published`, `placeholder`. El sitio público muestra `published`, `reviewed` y `placeholder`.

Los cambios se ven en el sitio al guardar (sin pedir un deploy).

## Bilingüismo

Usa el mismo **translationKey** en la versión ES y EN de una entrada para enlazarlas. Filtra por `locale` para no mezclar idiomas en la lista.
