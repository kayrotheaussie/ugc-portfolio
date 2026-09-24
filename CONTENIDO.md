# Cómo meter tus fotos y vídeos en la web

Hay **dos sitios** y nada más: la carpeta donde van los archivos y el archivo
donde escribes cómo se llaman.

```
assets/media/     <- aquí copias tus fotos y vídeos
contenido.js      <- aquí escribes el nombre de cada archivo
```

## Los 3 pasos

1. Copia el archivo dentro de `assets/media/`.
2. Abre `contenido.js` y escribe el nombre entre las comillas de `archivo`.
3. Recarga la web. Ya está.

Si dejas `archivo: ""` vacío, en esa posición sigue saliendo el recuadro de
color con su etiqueta. Puedes ir rellenando de uno en uno.

### Ejemplo

Antes:

```js
{ archivo: "", categoria: "unboxing", etiqueta: "Vídeo unboxing 1" },
```

Después de copiar `unboxing-collar.mp4` en `assets/media/`:

```js
{ archivo: "unboxing-collar.mp4", categoria: "unboxing", etiqueta: "Unboxing del collar" },
```

No hace falta decir si es foto o vídeo: se sabe por la extensión.

## Qué va en cada sitio

| En `contenido.js` | Qué es | Formato ideal |
|---|---|---|
| `sobreMi` | La foto vertical de la sección "Sobre mí" | Vertical 3:4 (tipo retrato), JPG |
| `stickers` | Los 5 recortes de Kayro del collage | PNG **con fondo transparente** |
| `galeria` | Las tarjetas de la sección "Contenido" | Vertical 9:16 (lo que graba el móvil), MP4 o JPG |

En la galería puedes **añadir o quitar tarjetas** libremente: añade o borra
líneas de la lista. La cuadrícula y los botones de filtro se rehacen solos, y
un filtro solo aparece si tiene contenido.

Para cambiar el texto de debajo de una tarjeta, edita su `etiqueta`.
Para moverla de categoría, cambia su `categoria` por otra de las claves de
`categorias` (o inventa una nueva ahí y úsala).

## El vídeo del hero

Es el único que no está en `contenido.js`, porque va suelto en la raíz:
sustituye el archivo `hero.mp4` por el tuyo y listo (mismo nombre).

Para que funcione bien como fondo debe ser:

- **MP4** (H.264), no `.mov`
- de **8 a 15 segundos**, y que el final enganche con el principio, porque va
  en bucle
- **1080p** y unos pocos MB, no 4K

## Antes de subir los vídeos: comprímelos

Los vídeos del móvil son enormes (el del hero eran 7,6 MB por **2 segundos**,
en 4K a 31 Mbps). Si subes 12 así, la web tardará siglos en cargar y las
marcas se irán.

Súbeme los originales y yo te los dejo listos, o hazlo tú con
[HandBrake](https://handbrake.fr) (gratis): preset *Fast 1080p30*, y quítales
el audio si son de fondo.

Como referencia: cada vídeo de la galería debería pesar **menos de 3 MB**.
