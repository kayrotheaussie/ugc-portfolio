# Material original

Aquí va el material **tal cual sale de la cámara o de Canva**. Nada de esta
carpeta se sirve en la web: de aquí salen, con `npm run media` y
`npm run import-pdf`, los archivos ligeros que sí se publican
(`public/media/`).

## Qué poner aquí

| Archivo | Para qué sirve |
| --- | --- |
| `hero.mp4` (o `hero-source.mov`) | El vídeo del hero. Horizontal. Es lo que se convierte en las dos versiones ligeras. |
| `Kayro.pdf` | Tu portfolio de Canva. `npm run import-pdf` saca de dentro todas las fotos a su resolución original. |
| `collage-referencia.jpeg` | Referencia visual del collage. Solo para consultar; no se usa en el código. |

Ahora mismo solo está `hero-source.mov`, que es el vídeo que había en el repo.

## Cómo se regenera el material web

```bash
# Una vez, en tu ordenador (son pesados y solo hacen falta aquí):
npm i -D ffmpeg-static @imgly/background-removal-node

npm run media        # vídeo del hero, póster, recortes, foto y galería
npm run import-pdf   # fotos que hay dentro de assets/Kayro.pdf
```

`npm run media` deja los resultados en `public/media/`, que **sí** se sube al
repo: así el despliegue en Railway no necesita ffmpeg.

`npm run import-pdf` deja las fotos en `assets/extraidas/`. Las que tengan
transparencia son los recortes del collage; las verticales, la galería. Desde
ahí las subes con el modo edición (`/?edit=1`) o las copias a `public/media/`.
