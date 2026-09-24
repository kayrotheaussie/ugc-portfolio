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
    return /\.(mp4|webm|ogv|mov)$/i.test(archivo);
  }

  /* Devuelve el <img>/<video> real o, si no hay archivo, el recuadro de color */
  function crearMedia(item, extras) {
    var opciones = extras || {};

    if (!item.archivo) {
      var hueco = document.createElement('div');
      hueco.className = 'ph' + (opciones.clasePlaceholder ? ' ' + opciones.clasePlaceholder : '');
      hueco.textContent = item.etiqueta || '';
      return hueco;
    }

    if (esVideo(item.archivo)) {
      var video = document.createElement('video');
      video.src = MEDIA + item.archivo;
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
    img.loading = 'lazy';
    return img;
  }

  /* ----------------------------------------------------------------------
     Sobre mí: la foto vertical
     ---------------------------------------------------------------------- */
  var contenedorFoto = document.getElementById('about-foto');

  if (contenedorFoto && datos.sobreMi) {
    contenedorFoto.appendChild(crearMedia(datos.sobreMi, { clasePlaceholder: 'ph--portrait' }));
  }

  /* ----------------------------------------------------------------------
     Collage: los cinco stickers
     ---------------------------------------------------------------------- */
  (datos.stickers || []).forEach(function (sticker, i) {
    var hueco = document.getElementById('sticker-' + (i + 1));
    if (hueco) hueco.appendChild(crearMedia(sticker, { clasePlaceholder: 'ph--sticker' }));
  });

  /* ----------------------------------------------------------------------
     Galería: filtros y tarjetas
     ---------------------------------------------------------------------- */
  var contenedorFiltros = document.getElementById('gallery-filters');
  var rejilla = document.getElementById('gallery-grid');
  var galeria = datos.galeria || [];
  var categorias = datos.categorias || {};

  /* Solo se muestran los filtros de categorías que tienen contenido */
  if (contenedorFiltros) {
    var usadas = Object.keys(categorias).filter(function (clave) {
      return galeria.some(function (item) { return item.categoria === clave; });
    });

    ['all'].concat(usadas).forEach(function (clave, i) {
      var boton = document.createElement('button');
      boton.className = 'filter' + (i === 0 ? ' is-active' : '');
      boton.dataset.filter = clave;
      boton.type = 'button';
      boton.setAttribute('role', 'tab');
      boton.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      boton.textContent = clave === 'all' ? 'Todo' : categorias[clave];
      contenedorFiltros.appendChild(boton);
    });
  }

  if (rejilla) {
    galeria.forEach(function (item, i) {
      var tarjeta = document.createElement('figure');
      tarjeta.className = 'card reveal';
      tarjeta.dataset.category = item.categoria || '';
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

  var filtros = document.querySelectorAll('.filter');
  var tarjetas = document.querySelectorAll('.card');

  filtros.forEach(function (boton) {
    boton.addEventListener('click', function () {
      var valor = boton.dataset.filter;

      filtros.forEach(function (b) {
        var activo = b === boton;
        b.classList.toggle('is-active', activo);
        b.setAttribute('aria-selected', String(activo));
      });

      tarjetas.forEach(function (tarjeta) {
        var mostrar = valor === 'all' || tarjeta.dataset.category === valor;
        tarjeta.classList.toggle('is-hidden', !mostrar);
      });
    });
  });

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
    lightboxMedia.appendChild(crearMedia(item, { clasePlaceholder: 'ph--card', controles: true }));
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
     Año en el footer
     ---------------------------------------------------------------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------------------
     Vídeo del hero: algunos navegadores bloquean el autoplay hasta que
     confirmamos que está silenciado.
     ---------------------------------------------------------------------- */
  var heroVideo = document.querySelector('.hero__video');
  if (heroVideo) {
    heroVideo.muted = true;
    var reproduccion = heroVideo.play();
    if (reproduccion && reproduccion.catch) reproduccion.catch(function () {});
  }

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
