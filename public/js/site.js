/* Comportamiento de la web: vídeo del hero, apariciones, filtros y lightbox. */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------- vídeo del hero */
  const hero = $('.hero');
  const video = $('[data-hero-video]');

  if (hero && video) {
    // En móvil cargamos la versión ligera; el vídeo solo empieza a bajar
    // cuando el navegador ya ha pintado el póster.
    const small = matchMedia('(max-width: 48rem)').matches;
    const src = (small && video.dataset.srcMobile) || video.dataset.srcDesktop;

    const start = () => {
      video.src = src;
      video.load();
      const play = video.play();
      if (play?.catch) play.catch(() => { /* el fondo de reserva ya está puesto */ });
    };

    video.addEventListener('playing', () => {
      video.classList.add('is-ready');
      hero.classList.add('has-video');
    }, { once: true });

    video.addEventListener('error', () => {
      hero.classList.remove('has-video');
    });

    // Datos limitados o ahorro de batería: nos quedamos con el fondo fijo.
    const conn = navigator.connection;
    const cheap = conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''));
    if (!cheap) {
      if (document.readyState === 'complete') start();
      else addEventListener('load', start, { once: true });
    }

    // Pausamos cuando el hero sale de pantalla: ahorra batería en el móvil.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        if (!video.src) return;
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      }, { threshold: 0.1 }).observe(hero);
    }
  }

  /* ------------------------------------------- apariciones al scrollear */
  const revealables = [...$$('.reveal'), ...$$('.collage__stickers')];
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-in'));
  }

  /* --------------------------------------------------------- filtros */
  const grid = $('[data-grid]');
  $$('.filter').forEach((button) => {
    button.addEventListener('click', () => {
      const wanted = button.dataset.filter;
      $$('.filter').forEach((b) => b.classList.toggle('is-active', b === button));
      $$('.card', grid).forEach((card) => {
        card.hidden = wanted !== 'all' && card.dataset.category !== wanted;
      });
    });
  });

  /* -------------------------------------------------------- lightbox */
  const box = $('[data-lightbox]');
  if (!box || !grid) return;

  const stage = $('[data-stage]', box);
  const caption = $('[data-caption]', box);
  let items = [];
  let current = 0;
  let lastFocus = null;

  const readItems = () => {
    items = $$('.card', grid)
      .filter((card) => !card.hidden)
      .map((card) => {
        const img = $('img', card);
        return {
          el: card,
          src: card.dataset.full || img.src,
          type: card.dataset.type || (card.dataset.video ? 'video' : 'image'),
          video: card.dataset.video || '',
          poster: img.src,
          caption: $('.card__label', card)?.textContent?.trim() ?? '',
        };
      });
  };

  function show(index) {
    if (!items.length) return;
    current = (index + items.length) % items.length;
    const item = items[current];
    stage.replaceChildren();

    if (item.video) {
      const video = document.createElement('video');
      video.src = item.video;
      video.poster = item.poster;
      video.controls = true;
      video.playsInline = true;
      video.autoplay = true;
      video.loop = true;
      video.preload = 'metadata';
      stage.append(video);
      video.play().catch(() => {});
    } else {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.caption;
      stage.append(img);
    }
    caption.textContent = item.caption;
  }

  function open(index) {
    readItems();
    lastFocus = document.activeElement;
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    show(index);
    $('[data-close]', box).focus();
  }

  function close() {
    box.hidden = true;
    stage.replaceChildren();
    document.body.style.overflow = '';
    lastFocus?.focus?.();
  }

  grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-open]');
    if (!button || document.body.hasAttribute('data-edit-mode')) return;
    readItems();
    const card = button.closest('.card');
    const index = items.findIndex((i) => i.el === card);
    if (index >= 0) open(index);
  });

  $('[data-close]', box).addEventListener('click', close);
  $('[data-prev]', box).addEventListener('click', () => show(current - 1));
  $('[data-next]', box).addEventListener('click', () => show(current + 1));
  box.addEventListener('click', (event) => { if (event.target === box) close(); });

  addEventListener('keydown', (event) => {
    if (box.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });

  // Deslizar para cambiar de pieza en el móvil.
  let startX = 0;
  box.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 60) show(current + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();
