/* ==========================================================================
   Kayro The Aussie — interacciones
   Sin dependencias. Las fotos y los vídeos salen de contenido.js
   ========================================================================== */
(function () {
  'use strict';

  var MEDIA = 'assets/media/';
  var datos = typeof CONTENIDO !== 'undefined' ? CONTENIDO : {};

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
      video.preload = 'metadata';
      if (opciones.controles) {
        video.controls = true;
        video.autoplay = true;
        video.muted = false;
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
     Hero: vídeo de fondo
     ---------------------------------------------------------------------- */
  var heroVideo = document.getElementById('hero-video');

  if (heroVideo && datos.hero && datos.hero.archivo) {
    if (datos.hero.poster) heroVideo.poster = MEDIA + datos.hero.poster;
    heroVideo.src = MEDIA + datos.hero.archivo;
    heroVideo.muted = true;                 // sin esto, algunos navegadores no arrancan
    var reproduccion = heroVideo.play();
    if (reproduccion && reproduccion.catch) reproduccion.catch(function () {});
  }

  /* ----------------------------------------------------------------------
     Sobre mí: la foto vertical
     ---------------------------------------------------------------------- */
  var contenedorFoto = document.getElementById('about-foto');

  if (contenedorFoto) {
    contenedorFoto.appendChild(crearMedia(datos.sobreMi, { clasePlaceholder: 'ph--portrait' }));
  }

  /* ----------------------------------------------------------------------
     UGC Content: la imagen con los stickers, entera
     ---------------------------------------------------------------------- */
  var contenedorCollage = document.getElementById('collage-imagen');

  if (contenedorCollage) {
    contenedorCollage.appendChild(crearMedia(datos.collage, { clasePlaceholder: 'ph--wide' }));
  }

  /* ----------------------------------------------------------------------
     Galería de vídeos
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
      tarjeta.setAttribute('aria-label', 'Abrir ' + (item.etiqueta || 'contenido'));

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

  /* Los vídeos de la cuadrícula se reproducen al pasar el ratón */
  tarjetas.forEach(function (tarjeta) {
    var video = tarjeta.querySelector('video');
    if (!video) return;
    tarjeta.addEventListener('mouseenter', function () {
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    });
    tarjeta.addEventListener('mouseleave', function () {
      video.pause();
      video.currentTime = 0;
    });
  });

  /* ----------------------------------------------------------------------
     Fotos: carrusel continuo
     La pista se duplica para que el bucle no tenga costura. El clon queda
     oculto para los lectores de pantalla.
     ---------------------------------------------------------------------- */
  var marquee = document.getElementById('marquee');
  var fotos = datos.fotos || [];

  if (marquee && fotos.length) {
    var pista = document.createElement('div');
    pista.className = 'marquee__track';

    fotos.forEach(function (foto) {
      var item = document.createElement('div');
      item.className = 'marquee__item';
      item.appendChild(crearMedia(foto, { clasePlaceholder: 'ph--portrait' }));
      pista.appendChild(item);
    });

    var clon = pista.cloneNode(true);
    clon.classList.add('marquee__track--clon');
    clon.setAttribute('aria-hidden', 'true');

    marquee.appendChild(pista);
    marquee.appendChild(clon);

    /* Más fotos, más recorrido: así la velocidad se mantiene constante */
    var segundos = fotos.length * 9;
    pista.style.animationDuration = segundos + 's';
    clon.style.animationDuration = segundos + 's';
  }

  /* ----------------------------------------------------------------------
     Lightbox: abre la tarjeta en grande (los vídeos, con sonido y controles)
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
    lightboxMedia.appendChild(crearMedia(item, { clasePlaceholder: 'ph--card', controles: true, sinLazy: true }));
    lightboxLabel.textContent = item.etiqueta || '';

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
