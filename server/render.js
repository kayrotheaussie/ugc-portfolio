import { SITE_URL } from './config.js';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** Marca un nodo como editable para el modo edición. */
const ed = (path) => ` data-edit="${esc(path)}"`;

const navLink = (href, label, key) =>
  `<a class="nav__link" href="${href}"><span${ed(key)}>${esc(label)}</span></a>`;

function heroSection(c) {
  const h = c.hero;
  return `
  <section class="hero" id="inicio" style="--hero-fallback:url('${esc(h.fallback)}')">
    <div class="hero__media" data-hero-media>
      <video
        class="hero__video"
        data-hero-video
        poster="${esc(h.poster)}"
        autoplay muted loop playsinline preload="none"
        disablepictureinpicture disableremoteplayback
        aria-hidden="true" tabindex="-1"
        data-src-desktop="${esc(h.video)}"
        data-src-mobile="${esc(h.videoMobile || h.video)}"></video>
    </div>
    <div class="hero__veil" aria-hidden="true"></div>

    <header class="nav">
      <a class="nav__brand" href="#inicio">Kayro<span class="nav__brand-dot">.</span></a>
      <nav class="nav__links" aria-label="Menú principal">
        ${navLink('#sobre-mi', c.nav.about, 'nav.about')}
        ${navLink('#contenido', c.nav.work, 'nav.work')}
        ${navLink('#contacto', c.nav.contact, 'nav.contact')}
      </nav>
    </header>

    <div class="hero__body">
      <p class="script hero__script"${ed('hero.script')}>${esc(h.script)}</p>
      <h1 class="hero__title"${ed('hero.title')}>${esc(h.title)}</h1>
      <p class="hero__tagline"${ed('hero.tagline')}>${esc(h.tagline)}</p>
    </div>

    <a class="hero__scroll" href="#sobre-mi">
      <span${ed('hero.scroll')}>${esc(h.scroll)}</span>
      <span class="hero__arrow" aria-hidden="true">↓</span>
    </a>
  </section>`;
}

function aboutSection(c) {
  const a = c.about;
  const notes = a.notes
    .map((note, i) => `<p class="note note--${i + 1}"${ed(`about.notes.${i}.text`)}>${esc(note.text)}</p>`)
    .join('\n        ');
  const body = a.body
    .map((p, i) => `<p${ed(`about.body.${i}`)}>${esc(p)}</p>`)
    .join('\n          ');

  return `
  <section class="about section" id="sobre-mi">
    <div class="about__grid">
      <figure class="about__photo reveal">
        <img src="${esc(a.photo)}" alt="${esc(a.photoAlt)}"
             loading="lazy" decoding="async" data-edit-image="about.photo">
        ${notes}
      </figure>

      <div class="about__text">
        <h2 class="display display--blue reveal"${ed('about.title')}>${esc(a.title)}</h2>
        <p class="kicker reveal"${ed('about.kicker')}>${esc(a.kicker)}</p>
        <div class="prose reveal" data-edit-list="about.body">
          ${body}
        </div>
      </div>
    </div>
  </section>`;
}

function collageSection(c) {
  const col = c.collage;
  const stickers = col.stickers
    .map(
      (s, i) => `
        <img class="sticker" data-sticker="${i}" src="${esc(s.src)}" alt="${esc(s.alt || '')}"
             loading="lazy" decoding="async"
             style="--x:${Number(s.x) || 0}%;--y:${Number(s.y) || 0}%;--w:${Number(s.w) || 24}%;--rot:${Number(s.rot) || 0}deg;--delay:${i * 90}ms">`,
    )
    .join('');

  return `
  <section class="collage section" aria-label="${esc(col.title)}">
    <div class="collage__stage" data-collage>
      <div class="collage__arch" aria-hidden="true"></div>
      <div class="collage__center">
        <p class="script collage__script"${ed('collage.script')}>${esc(col.script)}</p>
        <p class="display display--blue collage__title"${ed('collage.title')}>${esc(col.title)}</p>
        <p class="collage__tagline"${ed('collage.tagline')}>${esc(col.tagline)}</p>
      </div>
      <div class="collage__stickers" data-stickers>${stickers}</div>
    </div>
  </section>`;
}

function galleryCard(item, index) {
  const thumb = item.thumb || item.poster || item.src;
  const isVideo = item.type === 'video';
  return `
      <li class="card" data-item="${esc(item.id)}" data-category="${esc(item.category)}" data-index="${index}"
          data-type="${esc(item.type)}" data-full="${esc(isVideo ? (item.poster || thumb) : item.src)}"${isVideo ? ` data-video="${esc(item.src)}"` : ''}>
        <button class="card__button" type="button" data-open="${index}">
          <span class="card__frame">
            <img src="${esc(thumb)}" alt="${esc(item.caption)}" loading="lazy" decoding="async">
            ${isVideo ? '<span class="card__play" aria-hidden="true">▶</span>' : ''}
          </span>
          <span class="card__label"${ed(`gallery.items.${index}.caption`)}>${esc(item.caption)}</span>
        </button>
      </li>`;
}

function gallerySection(c) {
  const g = c.gallery;
  const filters = [{ id: 'all', label: g.allLabel }, ...g.categories]
    .map(
      (cat, i) =>
        `<button class="filter${i === 0 ? ' is-active' : ''}" type="button" data-filter="${esc(cat.id)}">${esc(cat.label)}</button>`,
    )
    .join('');

  return `
  <section class="gallery section" id="contenido">
    <div class="gallery__head">
      <h2 class="display display--blue reveal"${ed('gallery.title')}>${esc(g.title)}</h2>
      <p class="kicker reveal"${ed('gallery.kicker')}>${esc(g.kicker)}</p>
    </div>
    <div class="filters" role="group" aria-label="Filtrar por tipo de contenido">${filters}</div>
    <ul class="grid" data-grid>
      ${g.items.map(galleryCard).join('')}
    </ul>
  </section>`;
}

function contactSection(c) {
  const k = c.contact;
  const services = k.services
    .map((s, i) => `<li class="pill"${ed(`contact.services.${i}`)}>${esc(s)}</li>`)
    .join('');
  const social = k.social
    .map(
      (s, i) => `
        <a class="social" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" data-edit-link="contact.social.${i}.url">
          <span class="social__label"${ed(`contact.social.${i}.label`)}>${esc(s.label)}</span>
          <span class="social__handle"${ed(`contact.social.${i}.handle`)}>${esc(s.handle)}</span>
        </a>`,
    )
    .join('');

  return `
  <section class="contact section" id="contacto">
    <div class="contact__inner">
      <p class="script contact__script reveal"${ed('contact.script')}>${esc(k.script)}</p>
      <h2 class="display display--blue contact__title reveal"${ed('contact.title')}>${esc(k.title)}</h2>
      <p class="contact__intro reveal"${ed('contact.intro')}>${esc(k.intro)}</p>

      <h3 class="contact__subtitle"${ed('contact.servicesTitle')}>${esc(k.servicesTitle)}</h3>
      <ul class="pills" data-edit-list="contact.services">${services}</ul>

      <a class="button" href="mailto:${esc(k.email)}" data-edit-mail="contact.email">
        <span${ed('contact.emailLabel')}>${esc(k.emailLabel)}</span>
        <span class="button__mail"${ed('contact.email')}>${esc(k.email)}</span>
      </a>

      <div class="socials">${social}</div>
    </div>
    <footer class="footer"><p${ed('contact.footer')}>${esc(k.footer)}</p></footer>
  </section>`;
}

export function renderPage(content, { editMode = false, editingEnabled = false } = {}) {
  const canonical = SITE_URL ? `<link rel="canonical" href="${esc(SITE_URL)}/">` : '';
  const ogImage = SITE_URL ? `${SITE_URL}${content.hero.poster}` : content.hero.poster;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(content.meta.title)}</title>
<meta name="description" content="${esc(content.meta.description)}">
<meta name="theme-color" content="#FCF0C6">
${canonical}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(content.meta.title)}">
<meta property="og:description" content="${esc(content.meta.description)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" as="image" href="${esc(content.hero.poster)}" fetchpriority="high">
<link rel="preload" as="font" type="font/woff2" href="/fonts/anton-400-latin.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/fonts/dm-sans-latin.woff2" crossorigin>
<link rel="stylesheet" href="/fonts/fonts.css">
<link rel="stylesheet" href="/css/styles.css">
</head>
<body${editMode ? ' data-edit-mode' : ''}>
<a class="skip" href="#sobre-mi">Saltar al contenido</a>
<main>
${heroSection(content)}
${aboutSection(content)}
${collageSection(content)}
${gallerySection(content)}
${contactSection(content)}
</main>

<div class="lightbox" data-lightbox hidden>
  <button class="lightbox__close" type="button" data-close aria-label="Cerrar">×</button>
  <button class="lightbox__nav lightbox__nav--prev" type="button" data-prev aria-label="Anterior">‹</button>
  <figure class="lightbox__figure"><div data-stage></div><figcaption data-caption></figcaption></figure>
  <button class="lightbox__nav lightbox__nav--next" type="button" data-next aria-label="Siguiente">›</button>
</div>

<script>window.__KAYRO__=${JSON.stringify({ editMode, editingEnabled }).replace(/</g, '\\u003c')};</script>
<script src="/js/site.js" defer></script>
${editMode ? '<link rel="stylesheet" href="/css/edit.css"><script src="/js/edit.js" defer></script>' : ''}
</body>
</html>`;
}
