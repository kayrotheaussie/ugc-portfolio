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
    // El póster se rellena solo al subir un vídeo desde /?edit=1: el navegador
    // saca un fotograma y lo sube junto con el vídeo.
    poster: '',
    // Si el vídeo no arranca (datos móviles, ahorro de batería, iOS en bajo
    // consumo), se ve esto sobre el amarillo mantequilla.
    fallback: '/media/placeholders/hero-recorte.svg',
  },

  about: {
    title: 'Sobre mí',
    kicker: 'El perro más cool de tu FYP',
    body: [
      '¡Hola! Soy Kayro, un pastor australiano red merle de cuatro meses y medio. Tengo más energía de la que me cabe en el cuerpo y un talento natural para mirar a cámara justo cuando toca.',
      'Creo contenido UGC para marcas pet friendly: unboxings que se ven enteros, reviews honestas (si algo no me gusta, se me nota en la cara), fotografía de producto y vídeo orgánico con ese aire de “esto lo ha grabado alguien de verdad”.',
      'Detrás de la cámara está mi humana, que se encarga de la luz, del montaje y de que los premios no se acaben nunca.',
    ],
    photo: '/media/placeholders/sobre-mi.svg',
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
      { id: 'st1', src: '/media/placeholders/recorte-1.svg', alt: 'Recorte de Kayro 1', x: 15, y: 27, w: 18, rot: -9 },
      { id: 'st2', src: '/media/placeholders/recorte-2.svg', alt: 'Recorte de Kayro 2', x: 85, y: 23, w: 19, rot: 8 },
      { id: 'st3', src: '/media/placeholders/recorte-3.svg', alt: 'Recorte de Kayro 3', x: 19, y: 75, w: 16, rot: 7 },
      { id: 'st4', src: '/media/placeholders/recorte-4.svg', alt: 'Recorte de Kayro 4', x: 82, y: 76, w: 16, rot: -7 },
      { id: 'st5', src: '/media/placeholders/recorte-5.svg', alt: 'Recorte de Kayro 5', x: 50, y: 88, w: 18, rot: -3 },
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
      // Huecos a la espera del material real. Se sustituyen desde /?edit=1,
      // subiendo una foto o un vídeo a cada tarjeta.
      { id: 'g1', type: 'image', src: '/media/placeholders/pieza-1.svg', thumb: '/media/placeholders/pieza-1.svg', caption: 'Unboxing en el campo', category: 'unboxing' },
      { id: 'g2', type: 'image', src: '/media/placeholders/pieza-2.svg', thumb: '/media/placeholders/pieza-2.svg', caption: 'Review de producto', category: 'unboxing' },
      { id: 'g3', type: 'image', src: '/media/placeholders/pieza-3.svg', thumb: '/media/placeholders/pieza-3.svg', caption: 'Cuando escucho la bolsa de premios', category: 'humor' },
      { id: 'g4', type: 'image', src: '/media/placeholders/pieza-4.svg', thumb: '/media/placeholders/pieza-4.svg', caption: 'Un vídeo para TikTok', category: 'humor' },
      { id: 'g5', type: 'image', src: '/media/placeholders/pieza-5.svg', thumb: '/media/placeholders/pieza-5.svg', caption: 'Producto en exterior', category: 'producto' },
      { id: 'g6', type: 'image', src: '/media/placeholders/pieza-6.svg', thumb: '/media/placeholders/pieza-6.svg', caption: 'Bodegón con luz natural', category: 'producto' },
      { id: 'g7', type: 'image', src: '/media/placeholders/pieza-7.svg', thumb: '/media/placeholders/pieza-7.svg', caption: 'Un día en la montaña', category: 'organico' },
      { id: 'g8', type: 'image', src: '/media/placeholders/pieza-8.svg', thumb: '/media/placeholders/pieza-8.svg', caption: 'Rutina de mañana', category: 'organico' },
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
