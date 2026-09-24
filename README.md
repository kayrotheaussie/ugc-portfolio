# Kayro The Aussie — portfolio UGC

Web estática (HTML + CSS + JS, sin backend) del portfolio de **Kayro The Aussie**,
pastor australiano cachorro creador de contenido para marcas pet friendly.

## Cómo verla

```bash
python3 -m http.server 8000
```

Y abre <http://localhost:8000> en el navegador.
(Abrir `index.html` con doble clic también funciona, pero el vídeo del hero
se ve mejor servido desde el servidor local.)

## Estructura

```
index.html            Todas las secciones
contenido.js          TUS fotos y vídeos: el único archivo que tocas a diario
assets/media/         Aquí copias las fotos y los vídeos
assets/css/styles.css Estilos (tokens de color y tipografía arriba del todo)
assets/js/main.js     Menú, filtros, lightbox y animaciones
hero.mp4              Vídeo de fondo del hero
```

Para meter contenido, lee **[CONTENIDO.md](CONTENIDO.md)**: son 3 pasos.

Secciones: Hero · Sobre mí · Collage · Galería · Contacto.

## Cómo sustituir los placeholders

Todo el contenido visual se declara en `contenido.js` y los archivos viven en
`assets/media/`. Mientras un `archivo` esté vacío, en su sitio sale un recuadro
de color con su etiqueta, así puedes ir rellenando de uno en uno.

Está explicado paso a paso en **[CONTENIDO.md](CONTENIDO.md)**.


## Vídeo del hero

Está en la raíz, `hero.mp4`, y se carga desde `index.html`. Va en bucle,
silenciado, con autoplay y `playsinline`. Para cambiarlo, sustituye el archivo
por otro con el mismo nombre (MP4, 1080p, 8-15 segundos).

El original (`IMG_3325.mov`, 4K, 1,93 s, 7,6 MB) se convirtió a MP4 1080p sin
pistas de audio ni metadatos, y pesa 1,8 MB. El original sigue en el historial
de git si lo necesitas.

## Pendiente

- Texto de "Sobre mí": es provisional, falta sustituirlo por el del PDF de Canva.
- Fotos y vídeos reales (ver [CONTENIDO.md](CONTENIDO.md)).
- Un vídeo de hero más largo: el actual dura menos de 2 segundos.
- Modo edición (más adelante).
