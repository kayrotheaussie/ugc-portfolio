# Material original

Aquí va el material **tal cual sale de la cámara o de Canva**. Nada de esta
carpeta se sirve en la web directamente.

## Qué hay y qué falta

| Archivo | Para qué sirve | ¿Está? |
| --- | --- | --- |
| `hero-source.mov` | El vídeo de fondo del hero. **Solo eso.** | Sí |
| `hero.mp4` | Alternativa al anterior, si prefieres subir tu propio corte. | No |
| `Kayro.pdf` | Tu portfolio de Canva, para sacar de dentro las fotos. | No |

El resto del material (foto de "Sobre mí", recortes del collage, piezas de la
galería) **no va aquí**: se sube directamente desde el modo edición
(`/?edit=1`) y se guarda en el volumen de Railway.

## Comprimir el vídeo del hero

```bash
npm i -D ffmpeg-static   # solo la primera vez
npm run media
```

Deja `hero-1440.mp4` y `hero-960.mp4` en `public/media/hero/`, que sí se suben
al repo: así Railway no necesita ffmpeg para desplegar.

## Sacar las fotos del PDF de Canva

```bash
npm i -D pdfjs-dist      # ya viene en devDependencies
npm run import-pdf       # usa assets/Kayro.pdf
npm run import-pdf -- otro.pdf
```

Las deja en `assets/extraidas/` a su resolución original. Las que tengan
transparencia son los recortes del collage; las verticales, la galería. Desde
ahí las subes con `/?edit=1`.
