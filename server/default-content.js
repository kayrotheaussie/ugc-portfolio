/**
 * Contenido inicial de la web. Es el que se ve la primera vez; a partir de ahí
 * manda lo que haya guardado el modo edición en la base de datos.
 * Todo lo que aparece aquí se puede cambiar desde /?edit=1.
 */
export const defaultContent = {
  version: 1,

  meta: {
    title: 'Kayro The Aussie · Puppy content creator',
    description:
      'Kayro es un pastor australiano cachorro que crea contenido UGC para marcas pet friendly: unboxings, reviews, fotografía de producto y vídeo orgánico.',
  },

  nav: {
    about: 'Sobre mí',
    work: 'Contenido',
    contact: 'Contacto',
  },

  hero: {
    script: 'The Aussie',
    title: 'Kayro',
    tagline: 'Puppy content creator',
    scroll: 'scroll',
    video: '/media/hero/hero-1440.mp4',
    videoMobile: '/media/hero/hero-960.mp4',
    poster: '/media/hero/hero-poster.webp',
    // Si el vídeo no arranca (datos móviles, ahorro de batería, iOS en bajo
    // consumo), se ve este recorte sobre el amarillo mantequilla.
    fallback: '/media/stickers/kayro-2.webp',
  },

  about: {
    title: 'Sobre mí',
    kicker: 'El perro más cool de tu FYP',
    body: [
      '¡Hola! Soy Kayro, un pastor australiano red merle de cuatro meses y medio. Tengo más energía de la que me cabe en el cuerpo y un talento natural para mirar a cámara justo cuando toca.',
      'Creo contenido UGC para marcas pet friendly: unboxings que se ven enteros, reviews honestas (si algo no me gusta, se me nota en la cara), fotografía de producto y vídeo orgánico con ese aire de “esto lo ha grabado alguien de verdad”.',
      'Detrás de la cámara está mi humana, que se encarga de la luz, del montaje y de que los premios no se acaben nunca.',
    ],
    photo: '/media/about/kayro-humana.webp',
    photoAlt: 'Kayro con su humana',
    notes: [
      { text: 'Soy un pastor australiano de 4 meses y medio' },
      { text: 'Soy juguetón y me encantan los premios. En serio, me vuelvo loco.' },
      { text: 'Esta es mi humana :)' },
    ],
  },

  collage: {
    script: 'UGC',
    title: 'Content',
    tagline: 'Puppy content creator',
    stickers: [
      { id: 'st1', src: '/media/stickers/kayro-1.webp', alt: 'Kayro corriendo', x: 15, y: 27, w: 18, rot: -9 },
      { id: 'st2', src: '/media/stickers/kayro-2.webp', alt: 'Kayro de cerca', x: 85, y: 23, w: 19, rot: 8 },
      { id: 'st3', src: '/media/stickers/kayro-3.webp', alt: 'Kayro con la cola en alto', x: 19, y: 75, w: 16, rot: 7 },
      { id: 'st4', src: '/media/stickers/kayro-4.webp', alt: 'Kayro trotando', x: 82, y: 76, w: 16, rot: -7 },
      { id: 'st5', src: '/media/stickers/kayro-5.webp', alt: 'Kayro de frente', x: 50, y: 88, w: 18, rot: -3 },
    ],
  },

  gallery: {
    title: 'Contenido',
    kicker: 'Un poco de lo que hago',
    allLabel: 'Todo',
    categories: [
      { id: 'unboxing', label: 'Unboxing / Review' },
      { id: 'humor', label: 'Humor / TikTok' },
      { id: 'producto', label: 'Fotografía de producto' },
      { id: 'organico', label: 'Contenido orgánico' },
    ],
    items: [
      { id: 'g-video', type: 'video', src: '/media/gallery/pieza-video.mp4', poster: '/media/gallery/pieza-video.webp', thumb: '/media/gallery/pieza-video.webp', caption: 'Primer paseo del día', category: 'humor' },
      { id: 'g1', type: 'image', src: '/media/gallery/pieza-1.webp', thumb: '/media/gallery/pieza-1-thumb.webp', caption: 'Unboxing en el campo', category: 'unboxing' },
      { id: 'g2', type: 'image', src: '/media/gallery/pieza-2.webp', thumb: '/media/gallery/pieza-2-thumb.webp', caption: 'Review de arnés', category: 'unboxing' },
      { id: 'g3', type: 'image', src: '/media/gallery/pieza-3.webp', thumb: '/media/gallery/pieza-3-thumb.webp', caption: 'Cuando escucho la bolsa de premios', category: 'humor' },
      { id: 'g4', type: 'image', src: '/media/gallery/pieza-4.webp', thumb: '/media/gallery/pieza-4-thumb.webp', caption: 'Producto en exterior', category: 'producto' },
      { id: 'g5', type: 'image', src: '/media/gallery/pieza-5.webp', thumb: '/media/gallery/pieza-5-thumb.webp', caption: 'Luz natural, cero filtros', category: 'producto' },
      { id: 'g6', type: 'image', src: '/media/gallery/pieza-6.webp', thumb: '/media/gallery/pieza-6-thumb.webp', caption: 'Un día en la montaña', category: 'organico' },
      { id: 'g7', type: 'image', src: '/media/gallery/pieza-7.webp', thumb: '/media/gallery/pieza-7-thumb.webp', caption: 'Rutina de mañana', category: 'organico' },
      { id: 'g8', type: 'image', src: '/media/gallery/pieza-8.webp', thumb: '/media/gallery/pieza-8-thumb.webp', caption: 'Corriendo hacia el premio', category: 'humor' },
    ],
  },

  contact: {
    title: '¿Hablamos?',
    script: 'Vamos a conocernos',
    intro:
      'Cuéntame qué necesita tu marca y te preparo una propuesta. Trabajo con marcas pet friendly de comida, juguetes, accesorios y cuidado animal.',
    servicesTitle: 'Qué puedo hacer por tu marca',
    services: [
      'UGC',
      'Contenido orgánico',
      'Paid ads',
      'Fotografía de mascotas',
      'Fotografía de producto',
    ],
    emailLabel: 'Escríbeme',
    email: 'kayro.theaussie@gmail.com',
    social: [
      { id: 'instagram', label: 'Instagram', handle: '@kayro.theaussie', url: 'https://instagram.com/kayro.theaussie' },
      { id: 'tiktok', label: 'TikTok', handle: '@kayro.theaussie', url: 'https://tiktok.com/@kayro.theaussie' },
    ],
    footer: 'Kayro The Aussie · Puppy content creator',
  },
};

/** Copia profunda para no compartir referencias entre peticiones. */
export const cloneDefaults = () => structuredClone(defaultContent);
