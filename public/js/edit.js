/* Modo edición: /?edit=1
 *
 * Todo lo que se cambia aquí vive en un único objeto de contenido que se envía
 * entero al servidor al pulsar "Guardar". Los archivos se suben aparte y solo
 * se guarda su ruta.
 */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  let content = null;
  let dirty = false;
  let bar = null;
  let status = null;

  /* ---------------------------------------------------- utilidades */

  const get = (path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), content);

  function set(path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((o, k) => (o[k] ??= {}), content);
    target[last] = value;
    markDirty();
  }

  function markDirty() {
    dirty = true;
    setStatus('Sin guardar', 'dirty');
  }

  function setStatus(text, state = '') {
    if (!status) return;
    status.textContent = text;
    status.dataset.state = state;
  }

  let toastTimer;
  function toast(message) {
    let el = $('.ed-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'ed-toast';
      document.body.append(el);
    }
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
  }

  async function api(url, options = {}) {
    const res = await fetch(url, { credentials: 'same-origin', ...options });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
    return data;
  }

  function button(label, className = '') {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `ed-chip ${className}`.trim();
    b.textContent = label;
    return b;
  }

  /* ------------------------------------------------- ventana modal */

  function modal({ title, description, field = 'password', value = '', confirmLabel = 'Entrar', onConfirm }) {
    const root = document.createElement('div');
    root.className = 'ed-modal';
    root.innerHTML = `
      <div class="ed-modal__card">
        <h2></h2>
        <p></p>
        ${field === 'none' ? '' : `<input type="${field === 'password' ? 'password' : 'text'}" autocomplete="${field === 'password' ? 'current-password' : 'off'}">`}
        <div class="ed-modal__error" role="alert"></div>
        <div class="ed-modal__row">
          <button type="button" class="ed-btn" data-cancel>Cancelar</button>
          <button type="button" class="ed-btn ed-btn--primary" data-ok></button>
        </div>
      </div>`;
    $('h2', root).textContent = title;
    $('p', root).textContent = description;
    $('[data-ok]', root).textContent = confirmLabel;
    const input = $('input', root);
    if (input) input.value = value;
    const error = $('.ed-modal__error', root);

    const close = () => root.remove();
    $('[data-cancel]', root).addEventListener('click', close);

    const confirm = async () => {
      error.textContent = '';
      try {
        const ok = await onConfirm(input ? input.value : null);
        if (ok !== false) close();
      } catch (err) {
        error.textContent = err.message;
      }
    };
    $('[data-ok]', root).addEventListener('click', confirm);
    input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirm(); });

    document.body.append(root);
    input?.focus();
    return root;
  }

  /* ------------------------------------------------------- subidas */

  /** Saca un fotograma del vídeo en el navegador para usarlo de portada. */
  function posterFromVideo(file) {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      video.src = URL.createObjectURL(file);
      const give = (blob) => { URL.revokeObjectURL(video.src); resolve(blob); };
      video.addEventListener('error', () => give(null), { once: true });
      video.addEventListener('loadeddata', () => {
        video.currentTime = Math.min(0.6, (video.duration || 1) / 3);
      }, { once: true });
      video.addEventListener('seeked', () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0);
          canvas.toBlob((blob) => give(blob), 'image/jpeg', 0.85);
        } catch { give(null); }
      }, { once: true });
      setTimeout(() => give(null), 8000);
    });
  }

  function pickFile(accept) {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.addEventListener('change', () => resolve(input.files?.[0] ?? null), { once: true });
      input.click();
    });
  }

  async function uploadFile(file) {
    const form = new FormData();
    form.append('file', file);
    if (file.type.startsWith('video/')) {
      const poster = await posterFromVideo(file);
      if (poster) form.append('poster', new File([poster], 'poster.jpg', { type: 'image/jpeg' }));
    }
    toast('Subiendo…');
    const result = await api('/api/upload', { method: 'POST', body: form });
    toast('Archivo subido');
    return result;
  }

  /* ------------------------------------------------- textos */

  function wireTexts() {
    $$('[data-edit]').forEach((el) => {
      el.setAttribute('contenteditable', 'plaintext-only');
      el.spellcheck = true;

      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); el.blur(); }
        if (e.key === 'Escape') { el.textContent = get(el.dataset.edit) ?? ''; el.blur(); }
      });

      el.addEventListener('blur', () => {
        const value = el.textContent.replace(/\s+/g, ' ').trim();
        if (value === get(el.dataset.edit)) return;
        set(el.dataset.edit, value);
      });
    });
  }

  /* ------------------------------------------------- hero y foto */

  function wireHero() {
    const hero = $('.hero');
    if (!hero) return;
    const tools = document.createElement('div');
    tools.className = 'ed-hero-tools';

    const replace = button('Cambiar vídeo del hero');
    replace.addEventListener('click', async () => {
      const file = await pickFile('video/*');
      if (!file) return;
      try {
        const up = await uploadFile(file);
        set('hero.video', up.src);
        set('hero.videoMobile', up.src);
        if (up.poster) set('hero.poster', up.poster);
        const video = $('[data-hero-video]');
        video.dataset.srcDesktop = up.src;
        video.dataset.srcMobile = up.src;
        video.src = up.src;
        if (up.poster) video.poster = up.poster;
        video.play().catch(() => {});
        toast('Vídeo cambiado. Recuerda guardar.');
      } catch (err) { toast(err.message); }
    });

    const fallback = button('Cambiar imagen de reserva');
    fallback.addEventListener('click', async () => {
      const file = await pickFile('image/*');
      if (!file) return;
      try {
        const up = await uploadFile(file);
        set('hero.fallback', up.src);
        hero.style.setProperty('--hero-fallback', `url('${up.src}')`);
        toast('Imagen de reserva cambiada. Recuerda guardar.');
      } catch (err) { toast(err.message); }
    });

    tools.append(replace, fallback);
    hero.append(tools);
  }

  function wireAboutPhoto() {
    const figure = $('.about__photo');
    if (!figure) return;
    const change = button('Cambiar foto');
    change.addEventListener('click', async () => {
      const file = await pickFile('image/*');
      if (!file) return;
      try {
        const up = await uploadFile(file);
        set('about.photo', up.src);
        $('img', figure).src = up.src;
        toast('Foto cambiada. Recuerda guardar.');
      } catch (err) { toast(err.message); }
    });
    figure.append(change);
  }

  /* ------------------------------------------------- stickers */

  function wireStickers() {
    const stage = $('[data-collage]');
    const layer = $('[data-stickers]');
    if (!stage || !layer) return;
    layer.classList.add('is-in');

    const tools = document.createElement('div');
    tools.className = 'ed-sticker-tools';
    const add = button('Añadir recorte');
    add.addEventListener('click', async () => {
      const file = await pickFile('image/*');
      if (!file) return;
      try {
        const up = await uploadFile(file);
        content.collage.stickers.push({
          id: `st${Date.now().toString(36)}`, src: up.src, alt: 'Kayro', x: 50, y: 50, w: 20, rot: 0,
        });
        markDirty();
        renderStickers();
        toast('Recorte añadido. Recuerda guardar.');
      } catch (err) { toast(err.message); }
    });
    tools.append(add);
    stage.append(tools);

    function renderStickers() {
      layer.replaceChildren();
      content.collage.stickers.forEach((sticker, index) => {
        const img = document.createElement('img');
        img.className = 'sticker';
        img.src = sticker.src;
        img.alt = sticker.alt || '';
        img.dataset.sticker = String(index);
        applyStyle(img, sticker);
        layer.append(img);
        makeDraggable(img, index);
      });
      layer.classList.add('is-in');
    }

    const applyStyle = (img, s) => {
      img.style.setProperty('--x', `${s.x}%`);
      img.style.setProperty('--y', `${s.y}%`);
      img.style.setProperty('--w', `${s.w}%`);
      img.style.setProperty('--rot', `${s.rot || 0}deg`);
    };

    function makeDraggable(img, index) {
      let pointerId = null;
      let moved = false;

      img.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        pointerId = event.pointerId;
        moved = false;
        img.setPointerCapture(pointerId);
        img.classList.add('is-dragging');
      });

      img.addEventListener('pointermove', (event) => {
        if (event.pointerId !== pointerId) return;
        moved = true;
        const box = stage.getBoundingClientRect();
        const x = Math.max(-10, Math.min(110, ((event.clientX - box.left) / box.width) * 100));
        const y = Math.max(-10, Math.min(110, ((event.clientY - box.top) / box.height) * 100));
        const sticker = content.collage.stickers[index];
        sticker.x = Math.round(x * 10) / 10;
        sticker.y = Math.round(y * 10) / 10;
        applyStyle(img, sticker);
      });

      const end = (event) => {
        if (event.pointerId !== pointerId) return;
        img.classList.remove('is-dragging');
        img.releasePointerCapture?.(pointerId);
        pointerId = null;
        if (moved) markDirty();
      };
      img.addEventListener('pointerup', end);
      img.addEventListener('pointercancel', end);

      // Pulsación larga (o clic derecho) para quitar el recorte.
      img.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        if (!window.confirm('¿Quitar este recorte del collage?')) return;
        content.collage.stickers.splice(index, 1);
        markDirty();
        renderStickers();
      });
    }

    renderStickers();
  }

  /* ------------------------------------------------- galería */

  function wireGallery() {
    const grid = $('[data-grid]');
    if (!grid) return;
    const categories = content.gallery.categories;

    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'ed-btn ed-btn--primary ed-gallery-add';
    add.textContent = 'Añadir pieza (foto o vídeo)';
    add.addEventListener('click', async () => {
      const file = await pickFile('image/*,video/*');
      if (!file) return;
      try {
        const up = await uploadFile(file);
        content.gallery.items.push({
          id: `g${Date.now().toString(36)}`,
          type: up.type,
          src: up.src,
          thumb: up.thumb || up.poster || up.src,
          poster: up.poster || '',
          caption: 'Nueva pieza',
          category: categories[0]?.id ?? 'organico',
        });
        markDirty();
        await refreshGallery();
        toast('Pieza añadida. Recuerda guardar.');
      } catch (err) { toast(err.message); }
    });
    grid.after(add);

    decorateCards();

    async function refreshGallery() {
      // Repintamos la cuadrícula a partir del contenido en memoria.
      grid.replaceChildren();
      content.gallery.items.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'card';
        li.dataset.item = item.id;
        li.dataset.category = item.category;
        li.dataset.index = String(index);
        li.innerHTML = `
          <div class="card__button">
            <span class="card__frame">
              <img src="${item.thumb || item.poster || item.src}" alt="" loading="lazy" decoding="async">
              ${item.type === 'video' ? '<span class="card__play" aria-hidden="true">▶</span>' : ''}
            </span>
            <span class="card__label" data-edit="gallery.items.${index}.caption">${item.caption}</span>
          </div>`;
        grid.append(li);
      });
      wireTexts();
      decorateCards();
    }

    function decorateCards() {
      $$('.card', grid).forEach((card) => {
        if ($('.ed-card-tools', card)) return;
        const index = Number(card.dataset.index);

        const tools = document.createElement('div');
        tools.className = 'ed-card-tools';

        const left = button('←');
        left.title = 'Mover antes';
        left.addEventListener('click', () => move(index, -1));

        const right = button('→');
        right.title = 'Mover después';
        right.addEventListener('click', () => move(index, 1));

        const remove = button('✕', 'ed-chip--danger');
        remove.title = 'Quitar';
        remove.addEventListener('click', async () => {
          const item = content.gallery.items[index];
          if (!window.confirm(`¿Quitar "${item.caption}"?`)) return;
          content.gallery.items.splice(index, 1);
          markDirty();
          await refreshGallery();
          if (item.src?.startsWith('/uploads/')) {
            api('/api/upload', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ src: item.src }),
            }).catch(() => {});
          }
        });

        tools.append(left, right, remove);
        card.append(tools);

        const select = document.createElement('select');
        select.className = 'ed-card-select';
        categories.forEach((cat) => {
          const option = document.createElement('option');
          option.value = cat.id;
          option.textContent = cat.label;
          select.append(option);
        });
        select.value = content.gallery.items[index].category;
        select.addEventListener('change', () => {
          content.gallery.items[index].category = select.value;
          card.dataset.category = select.value;
          markDirty();
        });
        card.append(select);
      });
    }

    async function move(index, delta) {
      const items = content.gallery.items;
      const target = index + delta;
      if (target < 0 || target >= items.length) return;
      [items[index], items[target]] = [items[target], items[index]];
      markDirty();
      await refreshGallery();
    }
  }

  /* ------------------------------------------------- barra y guardado */

  function buildBar() {
    bar = document.createElement('div');
    bar.className = 'ed-bar';

    status = document.createElement('span');
    status.className = 'ed-bar__status';
    status.textContent = 'Listo';

    const save = document.createElement('button');
    save.className = 'ed-btn ed-btn--primary';
    save.textContent = 'Guardar';
    save.addEventListener('click', saveAll);

    const discard = document.createElement('button');
    discard.className = 'ed-btn';
    discard.textContent = 'Descartar';
    discard.addEventListener('click', () => {
      if (dirty && !window.confirm('Se perderán los cambios sin guardar. ¿Seguir?')) return;
      dirty = false;
      location.reload();
    });

    const reset = document.createElement('button');
    reset.className = 'ed-btn ed-btn--danger';
    reset.textContent = 'Restaurar original';
    reset.addEventListener('click', async () => {
      if (!window.confirm('Esto devuelve toda la web al contenido original. ¿Seguro?')) return;
      try {
        await api('/api/content/reset', { method: 'POST' });
        dirty = false;
        location.reload();
      } catch (err) { toast(err.message); }
    });

    const exit = document.createElement('button');
    exit.className = 'ed-btn';
    exit.textContent = 'Salir';
    exit.addEventListener('click', async () => {
      if (dirty && !window.confirm('Tienes cambios sin guardar. ¿Salir igualmente?')) return;
      await api('/api/session', { method: 'DELETE' }).catch(() => {});
      dirty = false;
      location.href = '/';
    });

    bar.append(status, save, discard, reset, exit);
    document.body.append(bar);
  }

  async function saveAll() {
    setStatus('Guardando…');
    try {
      await api('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      dirty = false;
      setStatus('Guardado', 'saved');
      toast('Cambios guardados');
    } catch (err) {
      setStatus('Error', 'error');
      toast(err.message);
    }
  }

  addEventListener('beforeunload', (event) => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = '';
  });

  /* ------------------------------------------------- arranque */

  async function start() {
    content = await api('/api/content');
    buildBar();
    wireTexts();
    wireHero();
    wireAboutPhoto();
    wireStickers();
    wireGallery();
    setStatus('Listo');
  }

  async function boot() {
    const state = await api('/api/session').catch(() => ({ authed: false, enabled: false }));

    if (!state.enabled) {
      modal({
        title: 'Modo edición desactivado',
        description: 'Falta la variable de entorno EDIT_PASSWORD. Añádela en Railway y vuelve a desplegar.',
        field: 'none',
        confirmLabel: 'Entendido',
        onConfirm: () => true,
      });
      return;
    }

    if (state.authed) return start();

    modal({
      title: 'Modo edición',
      description: 'Escribe la contraseña para poder editar la web.',
      field: 'password',
      confirmLabel: 'Entrar',
      onConfirm: async (password) => {
        await api('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        await start();
        return true;
      },
    });
  }

  boot();
})();
