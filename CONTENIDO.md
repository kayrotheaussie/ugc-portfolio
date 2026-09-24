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

Si dejas `archivo: ""` vacío, en esa posición sale un recuadro de color con su
etiqueta. Puedes ir rellenando de uno en uno.

### Ejemplo

```js
{ archivo: "video-05.mp4", poster: "video-05.jpg", etiqueta: "Unboxing Dukier" },
```

No hace falta decir si es foto o vídeo: se sabe por la extensión.

## Si cambias un archivo sin cambiarle el nombre

Sube el número de `version` que hay arriba del todo en `contenido.js` (vale la
fecha y hora del momento). Sin eso, el navegador seguirá usando la copia que ya
tenía guardada y parecerá que el cambio no se ha subido.

## Qué va en cada sitio

| En `contenido.js` | Qué es | Formato |
|---|---|---|
| (el hero va en `index.html`, no aquí) | Vídeo de fondo de la portada | MP4 H.264 1080p, sin audio |
| `sobreMi` | La foto vertical de "Sobre mí" | Vertical 3:4, WebP |
| `galeria` | Los vídeos de "Vídeos UGC" | Vertical 9:16, MP4 con audio + póster JPG |
| `fotos` | Las fotos de "Fotografía" | Vertical, WebP |

En `galeria` y en `fotos` puedes **añadir o quitar** líneas libremente: la
cuadrícula y el carrusel se rehacen solos.

Las fotos se reparten solas entre las dos filas: la 1ª, la 3ª, la 5ª... van a
la fila de arriba (que se mueve hacia la izquierda) y las demás a la de abajo
(que se mueve hacia la derecha). Cada fila ajusta su velocidad al número de
fotos que le toquen, así que el ritmo no cambia por añadir más.

## El póster de los vídeos

Es la imagen que se ve antes de darle al play. Si no pones `poster`, el vídeo
se ve negro hasta que carga. Se saca del primer fotograma:

```bash
ffmpeg -i video.mp4 -frames:v 1 -q:v 6 video.jpg
```

## Antes de subir: comprime

Los vídeos y las fotos del móvil son enormes. Los que ya están en la web se
convirtieron así:

```bash
# Vídeo vertical a 720p CON audio, listo para web
ffmpeg -i original.mov -map 0:v:0 -map 0:a:0 -map_metadata -1 \
  -vf "scale=-2:min(1280\,ih)" -c:v libx264 -preset slow -crf 26 \
  -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart video.mp4
```

Todos los vídeos están nivelados a **-16 LUFS**, que es el estándar de web,
para que no haya saltos de volumen al pasar de uno a otro:

```bash
# Primero mide, y con esos valores aplica la corrección (el vídeo se copia tal cual)
ffmpeg -i video.mp4 -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null /dev/null
ffmpeg -i video.mp4 -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=...:measured_TP=...:\
  measured_LRA=...:measured_thresh=...:linear=true" -c:v copy -c:a aac -b:a 96k salida.mp4
```

**Ojo con `-an`**: esa opción borra la pista de audio. Sirve para el vídeo del
hero, que va en bucle y silenciado, pero **nunca** para los de la galería: se
oyen al abrirlos en grande.

Referencias: cada vídeo de la galería **menos de 3 MB**, cada foto **menos de
300 KB**, el vídeo del hero **menos de 4 MB**.

Si te da pereza, súbeme los originales y te los dejo listos.

## Muy importante: nada de `.mov`

Los `.mov` del iPhone suelen venir en HEVC, que **Chrome y Firefox no
reproducen**. Por eso el vídeo de la portada no se veía en ordenador. Todo lo
que vaya a la web tiene que ser **MP4 H.264** (`-c:v libx264 -pix_fmt yuv420p`).

## El formulario de contacto

Usa [FormSubmit](https://formsubmit.co), que no necesita servidor. La primera
vez que alguien envíe el formulario, FormSubmit mandará un correo de
confirmación a `kayro.theaussie@gmail.com`: **hay que abrirlo y aceptarlo una
vez**. A partir de ahí los mensajes llegan solos.

Al enviar, la web redirige a `gracias.html`.
