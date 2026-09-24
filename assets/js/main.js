/* ==========================================================================
   Kayro the Aussie — interacciones
   Sin dependencias. Las fotos y los vídeos salen de contenido.js
   ========================================================================== */
(function () {
  'use strict';

  var MEDIA = 'assets/media/';
  var datos = typeof CONTENIDO !== 'undefined' ? CONTENIDO : {};

  /* ----------------------------------------------------------------------
     Reproducir un vídeo sin que el navegador lo bloquee.
     La regla es: si está silenciado y es "inline", dejan reproducir solo.
     Aun así puede fallar (modo de ahorro de energía), y entonces se queda
     el póster, que por eso lleva todos los vídeos.
     ---------------------------------------------------------------------- */
  function reproducir(video) {
    if (!video) return;
    video.muted = true;           // imprescindible para el autoplay
    var intento = video.play();
    if (intento && intento.catch) intento.catch(function () {});
  }

  /* ----------------------------------------------------------------------
     Hero: el <video> ya viene escrito en el HTML. Aquí solo insistimos,
     por si el navegador no arrancó solo.
     ---------------------------------------------------------------------- */
  var heroVideo = document.getElementById('hero-video');

  if (heroVideo) {
    reproducir(heroVideo);
    heroVideo.addEventListener('loadeddata', function () { reproducir(heroVideo); });
    heroVideo.addEventListener('canplay', function () { reproducir(heroVideo); });

    /* Al volver a la pestaña, algunos navegadores lo dejan pausado */
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) reproducir(heroVideo);
    });

    /* Si el navegador exige un gesto, el primer toque lo arranca */
    ['pointerdown', 'touchstart', 'keydown'].forEach(function (evento) {
      document.addEventListener(evento, function arranca() {
        reproducir(heroVideo);
        document.removeEventListener(evento, arranca);
      }, { once: true, passive: true });
    });
  }

  /* ----------------------------------------------------------------------
     Utilidades de contenido
     ---------------------------------------------------------------------- */

  function esVideo(archivo) {
    return /\.(mp4|webm|ogv)$/i.test(archivo);
  }

  /* Devuelve el <img>/<video> real o, si no hay archivo, el recuadro de color */
  function crearMedia(item, opciones) {
    opciones = opciones || {};

    if (!item || !item.archivo) {
      var hueco = document.createElement('div');
      hueco.className = 'ph' + (opciones.clasePlaceholder ? ' ' + opciones.clasePlaceholder : '');
      hueco.textContent = (item && item.etiqueta) || '';
      return hueco;
    }

    if (esVideo(item.archivo)) {
      var video = document.createElement('video');
      video.src = MEDIA + item.archivo;
      if (item.poster) video.poster = MEDIA + item.poster;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');          // iOS antiguos
      video.setAttribute('webkit-playsinline', '');
      video.preload = 'metadata';
      if (opciones.controles) {
        video.controls = true;
        video.muted = false;      // en el lightbox sí queremos oírlo
        video.volume = 1;
        video.preload = 'auto';
      } else {
        video.autoplay = true;                        // sin controles a la vista
      }
      return video;
    }

    var img = document.createElement('img');
    img.src = MEDIA + item.archivo;
    img.alt = item.alt || item.etiqueta || '';
    if (!opciones.sinLazy) img.loading = 'lazy';
    return img;
  }

  /* ----------------------------------------------------------------------
     Sobre mí: la foto vertical
     ---------------------------------------------------------------------- */
  var contenedorFoto = document.getElementById('about-foto');
  if (contenedorFoto) {
    contenedorFoto.appendChild(crearMedia(datos.sobreMi, { clasePlaceholder: 'ph--portrait' }));
  }

  /* ----------------------------------------------------------------------
     Vídeos UGC
     ---------------------------------------------------------------------- */
  var rejilla = document.getElementById('gallery-grid');
  var galeria = datos.galeria || [];

  if (rejilla) {
    galeria.forEach(function (item, i) {
      var tarjeta = document.createElement('figure');
      tarjeta.className = 'card reveal';
      tarjeta.dataset.index = String(i);
      tarjeta.tabIndex = 0;
      tarjeta.setAttribute('role', 'button');
      tarjeta.setAttribute('aria-label', 'Abrir ' + (item.etiqueta || 'vídeo'));

      var media = document.createElement('div');
      media.className = 'card__media';
      media.appendChild(crearMedia(item, { clasePlaceholder: 'ph--card' }));

      var pie = document.createElement('figcaption');
      pie.className = 'card__label';
      pie.textContent = item.etiqueta || '';

      tarjeta.appendChild(media);
      tarjeta.appendChild(pie);
      rejilla.appendChild(tarjeta);
    });
  }

  var tarjetas = document.querySelectorAll('.card');

  /* ----------------------------------------------------------------------
     Los vídeos se reproducen solo mientras están en pantalla. Fuera de ella
     se pausan: seis vídeos a la vez consumen batería para nada.
     ---------------------------------------------------------------------- */
  var videosUGC = document.querySelectorAll('.card__media video');

  if ('IntersectionObserver' in window) {
    var vigilante = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        var video = entrada.target;
        if (entrada.isIntersecting) {
          reproducir(video);
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.25 });

    videosUGC.forEach(function (video) { vigilante.observe(video); });
  } else {
    videosUGC.forEach(reproducir);
  }

  /* ----------------------------------------------------------------------
     Lightbox: el vídeo en grande y con sonido
     ---------------------------------------------------------------------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxMedia = document.getElementById('lightbox-media');
  var lightboxLabel = document.getElementById('lightbox-label');
  var lightboxClose = document.querySelector('.lightbox__close');
  var ultimoFoco = null;

  function abrirLightbox(tarjeta) {
    var item = galeria[Number(tarjeta.dataset.index)];
    if (!item || !lightbox) return;

    ultimoFoco = tarjeta;
    lightboxMedia.innerHTML = '';
    var medio = crearMedia(item, { clasePlaceholder: 'ph--card', controles: true, sinLazy: true });
    lightboxMedia.appendChild(medio);
    lightboxLabel.textContent = item.etiqueta || '';

    /* Arrancamos con sonido desde el propio clic, que es lo que los
       navegadores exigen para dejar sonar un vídeo. Si aun así lo bloquean,
       lo dejamos pausado PERO con sonido: al darle al play se oye. Silenciarlo
       aquí sería peor, porque parecería que el vídeo no tiene audio. */
    if (medio.tagName === 'VIDEO') {
      var conSonido = medio.play();
      if (conSonido && conSonido.catch) conSonido.catch(function () {});
    }

    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
  }

  function cerrarLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    lightboxMedia.innerHTML = '';   // esto también para el vídeo
    document.body.style.overflow = '';
    if (ultimoFoco) ultimoFoco.focus();
  }

  tarjetas.forEach(function (tarjeta) {
    tarjeta.addEventListener('click', function () { abrirLightbox(tarjeta); });
    tarjeta.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        abrirLightbox(tarjeta);
      }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', cerrarLightbox);

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) cerrarLightbox();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') cerrarLightbox();
  });

  /* ----------------------------------------------------------------------
     Fotografía: dos filas que se cruzan.
     Las fotos de contenido.js se reparten alternándolas, así las dos filas
     quedan equilibradas aunque el número sea impar. Cada fila duplica su
     pista para que el bucle no tenga costura, y el clon queda oculto para
     los lectores de pantalla.
     ---------------------------------------------------------------------- */
  var fotos = datos.fotos || [];

  function montarFila(contenedor, lista) {
    if (!contenedor || !lista.length) return;

    var pista = document.createElement('div');
    pista.className = 'marquee__track';

    lista.forEach(function (foto) {
      var item = document.createElement('div');
      item.className = 'marquee__item';
      item.appendChild(crearMedia(foto, { clasePlaceholder: 'ph--portrait' }));
      pista.appendChild(item);
    });

    var clon = pista.cloneNode(true);
    clon.classList.add('marquee__track--clon');
    clon.setAttribute('aria-hidden', 'true');

    contenedor.appendChild(pista);
    contenedor.appendChild(clon);

    /* Cuantas más fotos, más recorrido: así la velocidad no cambia */
    var segundos = lista.length * 11;
    pista.style.animationDuration = segundos + 's';
    clon.style.animationDuration = segundos + 's';
  }

  montarFila(document.getElementById('marquee-1'), fotos.filter(function (_, i) { return i % 2 === 0; }));
  montarFila(document.getElementById('marquee-2'), fotos.filter(function (_, i) { return i % 2 === 1; }));

  /* ----------------------------------------------------------------------
     Formulario: FormSubmit necesita una URL absoluta en _next, y la web
     puede acabar en cualquier dominio, así que la calculamos aquí.
     ---------------------------------------------------------------------- */
  var campoNext = document.getElementById('form-next');

  if (campoNext) {
    var base = window.location.href.split(/[?#]/)[0].replace(/[^/]*$/, '');
    if (/^https?:/.test(base)) campoNext.value = base + 'gracias.html';
  }

  /* ----------------------------------------------------------------------
     Año en el footer
     ---------------------------------------------------------------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------------------
     Menú móvil
     ---------------------------------------------------------------------- */
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('nav-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var abierto = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(abierto));
    });

    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ----------------------------------------------------------------------
     Aparición de los bloques al hacer scroll
     ---------------------------------------------------------------------- */
  var animables = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('is-visible');
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    animables.forEach(function (el) { observador.observe(el); });
  } else {
    animables.forEach(function (el) { el.classList.add('is-visible'); });
  }

})();
