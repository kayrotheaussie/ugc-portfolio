/* ==========================================================================
   CONTENIDO DE LA WEB
   --------------------------------------------------------------------------
   Este es el único archivo que necesitas tocar para cambiar fotos y vídeos.

   1. Copia tus archivos dentro de la carpeta  assets/media/
   2. Escribe aquí el nombre del archivo en "archivo".
   3. Si "archivo" se queda vacío (""), en la web sale el recuadro de color
      con su etiqueta, como ahora.

   El tipo se detecta solo por la extensión: .mp4 y .webm son vídeo,
   .jpg .png .webp son foto.
   ========================================================================== */

const CONTENIDO = {

  /* --- SOBRE MÍ: la foto vertical (formato 3:4, tipo retrato) ------------- */
  sobreMi: {
    archivo: "",                        // p. ej. "kayro-humana.jpg"
    etiqueta: "Foto Kayro + humana",
    alt: "Kayro con su humana"
  },

  /* --- COLLAGE: los 5 stickers (PNG recortado con fondo transparente) ----- */
  stickers: [
    { archivo: "", etiqueta: "Sticker Kayro 1" },   // p. ej. "sticker-1.png"
    { archivo: "", etiqueta: "Sticker Kayro 2" },
    { archivo: "", etiqueta: "Sticker Kayro 3" },
    { archivo: "", etiqueta: "Sticker Kayro 4" },
    { archivo: "", etiqueta: "Sticker Kayro 5" }
  ],

  /* --- GALERÍA: las categorías de los botones de filtro -------------------
     La clave (izquierda) es la que usas abajo en "categoria".              */
  categorias: {
    unboxing: "Unboxing / Review",
    humor:    "Humor / TikTok",
    producto: "Fotografía de producto",
    organico: "Contenido orgánico"
  },

  /* --- GALERÍA: las tarjetas, en el orden en que quieres que salgan -------
     Formato vertical 9:16 (lo que graba el móvil). Añade o quita líneas
     libremente; la cuadrícula y los filtros se rehacen solos.              */
  galeria: [
    { archivo: "", categoria: "unboxing", etiqueta: "Vídeo unboxing 1" },
    { archivo: "", categoria: "unboxing", etiqueta: "Vídeo unboxing 2" },
    { archivo: "", categoria: "unboxing", etiqueta: "Vídeo review 1" },

    { archivo: "", categoria: "humor",    etiqueta: "TikTok humor 1" },
    { archivo: "", categoria: "humor",    etiqueta: "TikTok humor 2" },
    { archivo: "", categoria: "humor",    etiqueta: "TikTok humor 3" },

    { archivo: "", categoria: "producto", etiqueta: "Foto producto 1" },
    { archivo: "", categoria: "producto", etiqueta: "Foto producto 2" },
    { archivo: "", categoria: "producto", etiqueta: "Foto producto 3" },

    { archivo: "", categoria: "organico", etiqueta: "Contenido orgánico 1" },
    { archivo: "", categoria: "organico", etiqueta: "Contenido orgánico 2" },
    { archivo: "", categoria: "organico", etiqueta: "Contenido orgánico 3" }
  ]

};
