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
assets/css/styles.css Estilos (tokens de color y tipografía arriba del todo)
assets/js/main.js     Menú, filtros, lightbox y animaciones
assets/media/         Aquí van las fotos y vídeos definitivos
hero.mp4              Vídeo de fondo del hero
```

Secciones: Hero · Sobre mí · Collage · Galería · Contacto.

## Cómo sustituir los placeholders

Todos los huecos visuales son cajas de color con la etiqueta de lo que irá ahí.
Cada uno lleva un atributo `data-slot` para localizarlo rápido en el HTML.

| Placeholder | Sustituir por |
|---|---|
| `data-slot="about-foto-principal"` | `<img src="assets/media/kayro-humana.jpg" alt="Kayro con su humana">` |
| `data-slot="sticker-1"` … `sticker-5` | `<img class="ph--sticker" src="assets/media/sticker-1.png" alt="">` (PNG recortado) |
| `data-slot="unboxing-1"` … `organico-3` | `<img>` o `<video muted loop playsinline>` dentro de `.card__media` |

Las tarjetas de la galería mantienen el formato 9:16 automáticamente: la imagen o
el vídeo que pongas dentro de `.card__media` se recorta solo (`object-fit: cover`).

Para cambiar la etiqueta de una tarjeta, edita su `.card__label`.
Para cambiar su categoría, edita el `data-category` del `<figure>`
(`unboxing`, `humor`, `producto`, `organico`).

## Vídeo del hero

Está en `index.html`, dentro de `<video class="hero__video">`, y apunta a
`hero.mp4` (el `IMG_3325.mov` original, renombrado: es H.264 + AAC, así que
con extensión `.mp4` lo reproducen todos los navegadores). Va en bucle,
silenciado, con autoplay y `playsinline`. Para cambiarlo, sustituye el archivo.

## Pendiente

- Texto de "Sobre mí": es provisional, falta sustituirlo por el del PDF de Canva.
- Fotos y vídeos reales de la galería.
- Stickers PNG recortados del collage.
- Modo edición (más adelante).
