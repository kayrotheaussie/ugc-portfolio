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
gracias.html          Adonde llega el formulario tras enviarse
contenido.js          TUS fotos y vídeos: el único archivo que tocas a diario
assets/media/         Aquí están las fotos y los vídeos ya optimizados
assets/css/styles.css Estilos (colores y tipografías arriba del todo)
assets/js/main.js     Hero, galería, carrusel, lightbox y menú
```

Para meter contenido, lee **[CONTENIDO.md](CONTENIDO.md)**: son 3 pasos.

Secciones: Hero · Sobre mí · UGC Content · Galería de vídeos · Fotos · Contacto.

## Cómo sustituir los placeholders

Todo el contenido visual se declara en `contenido.js` y los archivos viven en
`assets/media/`. Mientras un `archivo` esté vacío, en su sitio sale un recuadro
de color con su etiqueta, así puedes ir rellenando de uno en uno.

Está explicado paso a paso en **[CONTENIDO.md](CONTENIDO.md)**.


## Vídeo del hero

Está en `assets/media/hero.mp4`, con su póster al lado, y se declara en
`contenido.js`. Va en bucle, silenciado, con autoplay y `playsinline`.

Viene de `Videhome.MOV`, que estaba en **HEVC**: ese es el códec que Chrome y
Firefox no reproducen, y por eso no se veía en ordenador. Convertido a MP4
H.264 1080p sin audio pesa 2,9 MB.

Dura **2,2 segundos**, así que en bucle da un salto muy visible. Para que
funcione bien haría falta un clip de 8-15 segundos.

## Paleta y tipografías

| | |
|---|---|
| Fondo | `#FFF3C6` amarillo pastel (y `#FFF9E4` para alternar bloques) |
| Acento | `#A9C6E8` azul suave |
| Texto y botones | `#2F4A7A` azul intenso (7,9:1 de contraste sobre el fondo) |
| Azul de subtítulos | `#4A6FA5` (4,6:1; el `#A9C6E8` no llega como texto) |
| Títulos | Fredoka |
| Texto | DM Sans |

## Pendiente

- Texto de "Sobre mí": es provisional, falta sustituirlo por el del PDF de Canva.
- La imagen de los stickers de la sección UGC Content: no está en el repo.
- Un vídeo de hero más largo: el actual dura 2,2 segundos.
- Confirmar el correo de FormSubmit la primera vez que llegue un mensaje.
- Modo edición (más adelante).
