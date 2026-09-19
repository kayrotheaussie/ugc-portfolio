/* ==========================================================================
   Kayro The Aussie — interacciones
   Sin dependencias. Todo vanilla JS.
   ========================================================================== */
(function () {
  'use strict';

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
    var playPromise = heroVideo.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () { /* el póster/fondo se queda visible */ });
    }
  }

  /* ----------------------------------------------------------------------
     Menú móvil
     ---------------------------------------------------------------------- */
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('nav-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ----------------------------------------------------------------------
     Filtros de la galería
     ---------------------------------------------------------------------- */
  var filters = document.querySelectorAll('.filter');
  var cards = document.querySelectorAll('.card');

  filters.forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.dataset.filter;

      filters.forEach(function (b) {
        var active = b === button;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });

      cards.forEach(function (card) {
        var show = value === 'all' || card.dataset.category === value;
        card.classList.toggle('is-hidden', !show);
      });
    });
  });

  /* ----------------------------------------------------------------------
     Lightbox: clona el contenido de la tarjeta y lo muestra en grande.
     Al sustituir los placeholders por <img>/<video> seguirá funcionando.
     ---------------------------------------------------------------------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxMedia = document.getElementById('lightbox-media');
  var lightboxLabel = document.getElementById('lightbox-label');
  var lightboxClose = document.querySelector('.lightbox__close');
  var lastFocused = null;

  function openLightbox(card) {
    var media = card.querySelector('.card__media');
    var label = card.querySelector('.card__label');
    if (!media || !lightbox) return;

    lastFocused = card;
    lightboxMedia.innerHTML = '';
    lightboxMedia.appendChild(media.firstElementChild.cloneNode(true));
    lightboxLabel.textContent = label ? label.textContent.trim() : '';

    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    lightboxMedia.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  cards.forEach(function (card) {
    card.addEventListener('click', function () { openLightbox(card); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(card);
      }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ----------------------------------------------------------------------
     Aparición de los bloques al hacer scroll
     ---------------------------------------------------------------------- */
  var revealables = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealables.forEach(function (el) { observer.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  }

})();
