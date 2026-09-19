// Recorta a Kayro del fondo verde y le pone el borde amarillo, como en el PDF.
// Funciona por color: el fondo del vídeo es hierba/bosque (verde) y Kayro es
// blanco/canela, así que separamos por "cuánto verde" tiene cada píxel y
// propagamos desde los bordes para no abrir agujeros dentro del perro.
import sharp from 'sharp';

const isGreen = (r, g, b) => g - Math.max(r, b) > 8 || (g > r && g > b && g < 120);

/** Máscara de fondo conectada a los bordes (flood fill iterativo, sin recursión). */
function backgroundMask(data, w, h, channels) {
  const bg = new Uint8Array(w * h);
  const green = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const o = i * channels;
    green[i] = isGreen(data[o], data[o + 1], data[o + 2]) ? 1 : 0;
  }
  const stack = [];
  const push = (i) => {
    if (!bg[i] && green[i]) { bg[i] = 1; stack.push(i); }
  };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  while (stack.length) {
    const i = stack.pop();
    const x = i % w, y = (i / w) | 0;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (y > 0) push(i - w);
    if (y < h - 1) push(i + w);
  }
  return bg;
}

/** Componente conectado más grande del primer plano; devuelve su bbox. */
function largestBlobBox(bg, w, h) {
  const seen = new Uint8Array(w * h);
  let best = null;
  for (let s = 0; s < w * h; s++) {
    if (bg[s] || seen[s]) continue;
    const stack = [s];
    seen[s] = 1;
    let n = 0, x0 = w, y0 = h, x1 = 0, y1 = 0;
    while (stack.length) {
      const i = stack.pop();
      const x = i % w, y = (i / w) | 0;
      n++;
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
      const nb = [];
      if (x > 0) nb.push(i - 1);
      if (x < w - 1) nb.push(i + 1);
      if (y > 0) nb.push(i - w);
      if (y < h - 1) nb.push(i + w);
      for (const j of nb) if (!seen[j] && !bg[j]) { seen[j] = 1; stack.push(j); }
    }
    if (!best || n > best.n) best = { n, x0, y0, x1, y1 };
  }
  return best;
}

/** Localiza a Kayro en un fotograma completo. Devuelve bbox en píxeles del original. */
export async function findSubject(input, { pad = 0.1 } = {}) {
  const probeWidth = 480;
  const img = sharp(input).rotate();
  const meta = await img.metadata();
  const { data, info } = await img
    .clone()
    .resize({ width: probeWidth })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const bg = backgroundMask(data, info.width, info.height, info.channels);
  const blob = largestBlobBox(bg, info.width, info.height);
  if (!blob || blob.n < info.width * info.height * 0.004) return null;
  const k = meta.width / info.width;
  const bw = (blob.x1 - blob.x0) * k;
  const bh = (blob.y1 - blob.y0) * k;
  const px = bw * pad;
  const py = bh * pad;
  const left = Math.max(0, Math.round(blob.x0 * k - px));
  const top = Math.max(0, Math.round(blob.y0 * k - py));
  return {
    left,
    top,
    width: Math.min(meta.width - left, Math.round(bw + px * 2)),
    height: Math.min(meta.height - top, Math.round(bh + py * 2)),
    coverage: blob.n / (info.width * info.height),
  };
}

/**
 * Genera el PNG con transparencia + borde amarillo.
 * @returns {Promise<Buffer>} PNG listo para usar como sticker.
 */
export async function makeSticker(input, {
  width = 760,
  outline = 13,
  outlineColor = { r: 0xFC, g: 0xD9, b: 0x4E },
  feather = 1.1,
} = {}) {
  const base = sharp(input).rotate().resize({ width, withoutEnlargement: false }).removeAlpha();
  const { data, info } = await base.clone().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels } = info;
  const bg = backgroundMask(data, w, h, channels);

  // Alpha: 0 en el fondo conectado al borde, 255 en Kayro. Mediana para quitar
  // motas de hierba y blur suave para que el filo no quede dentado.
  const alpha = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) alpha[i] = bg[i] ? 0 : 255;
  const cleaned = await sharp(alpha, { raw: { width: w, height: h, channels: 1 } })
    .median(5)
    .blur(feather)
    .toColourspace('b-w')
    .toBuffer();

  // Lienzo con margen para que quepa el borde amarillo aunque Kayro toque el filo.
  const pad = Math.ceil(outline * 2.2);
  const W = w + pad * 2;
  const H = h + pad * 2;
  const rgb = Buffer.alloc(W * H * 3);
  const a = Buffer.alloc(W * H);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const src = (y * w + x);
      const dst = ((y + pad) * W + (x + pad));
      rgb[dst * 3] = data[src * channels];
      rgb[dst * 3 + 1] = data[src * channels + 1];
      rgb[dst * 3 + 2] = data[src * channels + 2];
      a[dst] = cleaned[src];
    }
  }

  // El borde = la silueta dilatada. blur + curva dura hace de dilatación barata.
  const ringAlpha = await sharp(a, { raw: { width: W, height: H, channels: 1 } })
    .blur(outline)
    .linear(7, -160)
    .blur(0.7)
    .toColourspace('b-w')
    .toBuffer();

  const ring = await sharp({ create: { width: W, height: H, channels: 3, background: outlineColor } })
    .joinChannel(ringAlpha, { raw: { width: W, height: H, channels: 1 } })
    .png()
    .toBuffer();

  const subject = await sharp(rgb, { raw: { width: W, height: H, channels: 3 } })
    .joinChannel(a, { raw: { width: W, height: H, channels: 1 } })
    .png()
    .toBuffer();

  // Dos pasadas: sharp aplica `trim` antes que `composite` dentro de un mismo
  // pipeline, así que primero pegamos a Kayro sobre el borde y recortamos después.
  const merged = await sharp(ring)
    .composite([{ input: subject, blend: 'over' }])
    .png()
    .toBuffer();

  return sharp(merged)
    .trim({ threshold: 1 })
    .png({ compressionLevel: 9 })
    .toBuffer();
}
