# Fuente del nombre del hero

Aquí va **Advercase**. En cuanto dejes el archivo en esta carpeta con este
nombre exacto, la web la usa sola, sin tocar nada más:

```
assets/fonts/advercase.woff2      <- el que usa el navegador
assets/fonts/advercase.woff       <- opcional, para navegadores viejos
```

Mientras no esté, el nombre se ve en **Outfit** (Google Fonts), que es la
alternativa más parecida: geométrica, de trazo uniforme y letras redondas.

## Si solo tienes el .ttf o el .otf

Conviértelo a woff2 (es lo que pesa menos) en
<https://cloudconvert.com/ttf-to-woff2> o con `fonttools`:

```bash
pip install fonttools brotli
fonttools ttLib.woff2 compress -o advercase.woff2 Advercase.ttf
```

La regla `@font-face` está al principio de `assets/css/styles.css`.
