/* ==========================================================================
   CONTENIDO DE LA WEB
   --------------------------------------------------------------------------
   Este es el único archivo que necesitas tocar para cambiar fotos y vídeos.

   1. Copia tus archivos dentro de la carpeta  assets/media/
   2. Escribe aquí el nombre del archivo en "archivo".
   3. Si "archivo" se queda vacío (""), en la web sale el recuadro de color
      con su etiqueta.

   El tipo se detecta solo por la extensión: .mp4 y .webm son vídeo,
   .webp .jpg .png son foto.
   ========================================================================== */

const CONTENIDO = {

  /* --- HERO ---------------------------------------------------------------
     OJO: el vídeo del hero NO se declara aquí, sino directamente en
     index.html (busca <video class="hero__video">). Está así a propósito:
     si dependiera del JavaScript y algo fallara, la portada se quedaría
     negra. Para cambiarlo, sustituye assets/media/hero.mp4 y su póster.   */

  /* --- SOBRE MÍ: la foto vertical (3:4) ---------------------------------- */
  sobreMi: {
    archivo: "sobre-mi-humana.webp",
    etiqueta: "Foto Kayro + humana",
    alt: "Kayro con su humana"
  },

  /* --- GALERÍA DE VÍDEOS -------------------------------------------------
     Salen en este mismo orden: 3 por fila en ordenador, 1 en móvil.
     "poster" es la imagen que se ve antes de darle al play.               */
  galeria: [
    { archivo: "video-05.mp4", poster: "video-05.jpg", etiqueta: "Unboxing Dukier" },
    { archivo: "video-08.mp4", poster: "video-08.jpg", etiqueta: "Review de juguete" },
    { archivo: "video-06.mp4", poster: "video-06.jpg", etiqueta: "Advance Puppy Snack" },

    { archivo: "video-04.mp4", poster: "video-04.jpg", etiqueta: "Primer plano en brazos" },
    { archivo: "video-09.mp4", poster: "video-09.jpg", etiqueta: "Paseo con correa" },
    { archivo: "video-02.mp4", poster: "video-02.jpg", etiqueta: "Humor para TikTok" }
  ],

  /* --- FOTOGRAFÍA --------------------------------------------------------
     Se reparten solas entre las dos filas: las impares (1ª, 3ª, 5ª...) a la
     fila de arriba y las pares a la de abajo. Añade las que quieras aquí.
     Las cuatro primeras son las destacadas (13, 20, 17, 16).
     21.JPG no está: era idéntica a 20.JPG.                                */
  fotos: [
    { archivo: "foto-13.webp", alt: "Kayro con el snack de Advance" },
    { archivo: "foto-20.webp", alt: "Kayro posando con producto de cuidado ocular" },
    { archivo: "foto-17.webp", alt: "Kayro sentado con su arnés azul" },
    { archivo: "foto-16.webp", alt: "Detalle del collar de Kayro" },
    { archivo: "foto-23.webp", alt: "Retrato de perfil de Kayro" },
    { archivo: "foto-19.webp", alt: "Kayro comiendo sandía" },
    { archivo: "foto-22.webp", alt: "Kayro tumbado junto al pack de Advance" },
    { archivo: "foto-15.webp", alt: "Kayro con el juguete interactivo de premios" },
    { archivo: "foto-14.webp", alt: "Kayro de pie con el pack de Advance" },
    { archivo: "foto-18.webp", alt: "Kayro sonriendo en el césped" }
  ]

};
