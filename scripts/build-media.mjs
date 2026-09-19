#!/usr/bin/env node
/**
 * Genera el material web (vídeo ligero, póster, recortes y galería) a partir del
 * material original de `assets/`. Los resultados van a `public/media/` y se
 * suben al repo, así que Railway NO necesita ffmpeg para desplegar: esto se
 * ejecuta solo en tu ordenador cuando cambies el material.
 *
 *   npm run media
 *
 * Requisitos opcionales:
 *   - ffmpeg (o `npm i -D ffmpeg-static`) para el vídeo.
 *   - `npm i -D @imgly/background-removal-node` para recortar a Kayro del fondo
 *     automáticamente. Si no está, se usa el recorte por color (peor).
 */
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import sharp from 'sharp';
import { findSubject, makeSticker } from './lib/cutout.mjs';

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(ROOT, 'assets');
const OUT = path.join(ROOT, 'public', 'media');

const OUTLINE = { r: 0xF4, g: 0xBC, b: 0x36 }; // amarillo del borde de los recortes

async function resolveFfmpeg() {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  try {
    const mod = await import('ffmpeg-static');
    if (mod.default) return mod.default;
  } catch { /* sin ffmpeg-static */ }
  try {
    await run('ffmpeg', ['-version']);
    return 'ffmpeg';
  } catch { return null; }
}

async function findSourceVideo() {
  const candidates = ['hero.mp4', 'hero.mov', 'hero-source.mov', 'IMG_3325.mov'];
  for (const name of candidates) {
    const p = path.join(ASSETS, name);
    try { await fs.access(p); return p; } catch { /* siguiente */ }
  }
  // Cualquier vídeo suelto en assets/
  const entries = await fs.readdir(ASSETS).catch(() => []);
  const vid = entries.find((f) => /\.(mp4|mov|m4v|webm)$/i.test(f));
  return vid ? path.join(ASSETS, vid) : null;
}

async function ffmpeg(bin, args) {
  await run(bin, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { maxBuffer: 1 << 26 });
}

/** Vídeo del hero: dos calidades + póster. Sin audio y con faststart. */
async function buildHero(bin, src) {
  await fs.mkdir(path.join(OUT, 'hero'), { recursive: true });
  const common = ['-an', '-movflags', '+faststart', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow'];
  await ffmpeg(bin, ['-i', src, '-vf', "scale=1440:-2:flags=lanczos", '-crf', '27', ...common, path.join(OUT, 'hero', 'hero-1440.mp4')]);
  await ffmpeg(bin, ['-i', src, '-vf', "scale=960:-2:flags=lanczos", '-crf', '29', ...common, path.join(OUT, 'hero', 'hero-960.mp4')]);

  const frame = path.join(OUT, 'hero', '.poster-tmp.jpg');
  await ffmpeg(bin, ['-ss', '1.0', '-i', src, '-frames:v', '1', '-q:v', '2', frame]);
  await sharp(frame).resize({ width: 1000 }).webp({ quality: 60, effort: 6 }).toFile(path.join(OUT, 'hero', 'hero-poster.webp'));
  await fs.unlink(frame).catch(() => {});
}

/** Extrae fotogramas a máxima resolución en los instantes pedidos. */
async function grabFrames(bin, src, times, dir) {
  await fs.mkdir(dir, { recursive: true });
  const files = [];
  for (const t of times) {
    const f = path.join(dir, `f-${String(t).replace('.', '_')}.jpg`);
    await ffmpeg(bin, ['-ss', String(t), '-i', src, '-frames:v', '1', '-q:v', '2', f]);
    files.push(f);
  }
  return files;
}

/** Recorte con fondo transparente. Usa el modelo de IA si está disponible. */
async function cutout(file, scratch) {
  // Recortamos primero alrededor de Kayro: el modelo trabaja mejor y los
  // fotogramas en los que sale pequeño no quedan pixelados.
  const box = await findSubject(file, { pad: 0.25 }).catch(() => null);
  let input = file;
  if (box) {
    input = path.join(scratch, `crop-${path.basename(file)}`);
    await sharp(file).extract(box).resize({ width: 1400, withoutEnlargement: true }).jpeg({ quality: 95 }).toFile(input);
  }

  let png;
  try {
    const { removeBackground } = await import('@imgly/background-removal-node');
    const blob = await removeBackground(input, { output: { format: 'image/png' } });
    png = Buffer.from(await blob.arrayBuffer());
  } catch (err) {
    if (err?.code !== 'ERR_MODULE_NOT_FOUND') throw err;
    console.warn('  (sin @imgly/background-removal-node: recorte por color, menos limpio)');
    return makeSticker(input, { width: 900, outline: 0.001 });
  }

  // El modelo deja briznas de hierba con alpha bajo. Endurecemos la curva del
  // canal alpha: fuera lo translúcido, dentro lo opaco, filo suave en medio.
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const LO = 120;
  const HI = 205;
  for (let i = 0; i < info.width * info.height; i++) {
    const a = data[i * 4 + 3];
    data[i * 4 + 3] = a <= LO ? 0 : a >= HI ? 255 : Math.round(((a - LO) * 255) / (HI - LO));
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

/** Añade el borde amarillo a un PNG que ya tiene transparencia. */
async function addOutline(png, { width = 900, outline = 16 } = {}) {
  const src = sharp(png).ensureAlpha().trim({ threshold: 1 }).resize({ width, withoutEnlargement: true });
  const rgba = await src.raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = rgba.info;
  const pad = Math.ceil(outline * 2.4);
  const W = w + pad * 2;
  const H = h + pad * 2;

  const rgb = Buffer.alloc(W * H * 3);
  const a = Buffer.alloc(W * H);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const s = (y * w + x) * 4;
      const d = (y + pad) * W + (x + pad);
      rgb[d * 3] = rgba.data[s];
      rgb[d * 3 + 1] = rgba.data[s + 1];
      rgb[d * 3 + 2] = rgba.data[s + 2];
      a[d] = rgba.data[s + 3];
    }
  }

  const ringAlpha = await sharp(a, { raw: { width: W, height: H, channels: 1 } })
    .blur(outline).linear(8, -180).blur(0.8).toColourspace('b-w').toBuffer();
  const ring = await sharp({ create: { width: W, height: H, channels: 3, background: OUTLINE } })
    .joinChannel(ringAlpha, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
  const subject = await sharp(rgb, { raw: { width: W, height: H, channels: 3 } })
    .joinChannel(a, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();

  // sharp aplica `trim` antes que `composite`, así que van en dos pasadas.
  const merged = await sharp(ring).composite([{ input: subject }]).png().toBuffer();
  return sharp(merged).trim({ threshold: 1 }).webp({ quality: 88, alphaQuality: 90, effort: 6 }).toBuffer();
}

/** Tarjeta vertical 9:16 para la galería, centrada en Kayro. */
async function verticalCard(file, out, { width = 900 } = {}) {
  const meta = await sharp(file).metadata();
  const box = await findSubject(file, { pad: 0.6 }).catch(() => null);
  const cropW = Math.round(meta.height * 9 / 16);
  const centre = box ? box.left + box.width / 2 : meta.width / 2;
  const left = Math.max(0, Math.min(meta.width - cropW, Math.round(centre - cropW / 2)));
  const cropped = await sharp(file).extract({ left, top: 0, width: cropW, height: meta.height }).toBuffer();
  await sharp(cropped).resize({ width }).webp({ quality: 72, effort: 6 }).toFile(`${out}.webp`);
  await sharp(cropped).resize({ width: 460 }).webp({ quality: 68, effort: 6 }).toFile(`${out}-thumb.webp`);
}

async function main() {
  const bin = await resolveFfmpeg();
  const src = await findSourceVideo();
  if (!src) throw new Error('No encuentro ningún vídeo en assets/');
  console.log('Material original:', path.relative(ROOT, src));

  await fs.mkdir(OUT, { recursive: true });
  const tmp = path.join(OUT, '.tmp');

  if (!bin) {
    console.warn('! ffmpeg no disponible: me salto el vídeo y los fotogramas.');
    return;
  }

  console.log('· Vídeo del hero…');
  await buildHero(bin, src);

  console.log('· Fotogramas…');
  const stickerTimes = [1.0, 1.1, 0.86, 0.7, 0.55];
  const frames = await grabFrames(bin, src, stickerTimes, tmp);

  console.log('· Recortes con borde amarillo…');
  await fs.mkdir(path.join(OUT, 'stickers'), { recursive: true });
  for (let i = 0; i < frames.length; i++) {
    const png = await cutout(frames[i], tmp);
    const webp = await addOutline(png, { width: 900, outline: 20 });
    const dest = path.join(OUT, 'stickers', `kayro-${i + 1}.webp`);
    await fs.writeFile(dest, webp);
    console.log(`  kayro-${i + 1}.webp  ${(webp.length / 1024).toFixed(0)} KB`);
  }

  console.log('· Foto de "Sobre mí"…');
  await fs.mkdir(path.join(OUT, 'about'), { recursive: true });
  const portrait = frames[0];
  const pm = await sharp(portrait).metadata();
  const pw = Math.round(pm.height * 4 / 5);
  const pbox = await findSubject(portrait, { pad: 0.5 }).catch(() => null);
  const pc = pbox ? pbox.left + pbox.width / 2 : pm.width / 2;
  const pleft = Math.max(0, Math.min(pm.width - pw, Math.round(pc - pw / 2)));
  const pcrop = sharp(portrait).extract({ left: pleft, top: 0, width: pw, height: pm.height }).resize({ width: 760 });
  await pcrop.clone().webp({ quality: 72, effort: 6 }).toFile(path.join(OUT, 'about', 'kayro-humana.webp'));

  console.log('· Galería…');
  await fs.mkdir(path.join(OUT, 'gallery'), { recursive: true });
  const galleryTimes = [0.35, 0.5, 0.62, 0.75, 0.88, 1.0, 1.1, 1.2];
  const gframes = await grabFrames(bin, src, galleryTimes, tmp);
  for (let i = 0; i < gframes.length; i++) {
    await verticalCard(gframes[i], path.join(OUT, 'gallery', `pieza-${i + 1}`));
  }
  // Una pieza en vídeo, recortada a 9:16 y bien comprimida.
  await ffmpeg(bin, ['-i', src, '-vf', 'crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=720:-2', '-crf', '28',
    '-an', '-movflags', '+faststart', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-preset', 'slow',
    path.join(OUT, 'gallery', 'pieza-video.mp4')]);
  await ffmpeg(bin, ['-ss', '1.2', '-i', src, '-vf', 'crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=720:-2',
    '-frames:v', '1', '-q:v', '3', path.join(tmp, 'vidposter.jpg')]);
  await sharp(path.join(tmp, 'vidposter.jpg')).webp({ quality: 74 }).toFile(path.join(OUT, 'gallery', 'pieza-video.webp'));

  await fs.rm(tmp, { recursive: true, force: true });
  console.log('Listo.');
}

main().catch((err) => { console.error(err); process.exit(1); });
