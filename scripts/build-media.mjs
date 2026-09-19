#!/usr/bin/env node
/**
 * Convierte el vídeo del hero en dos versiones ligeras para la web.
 *
 *   npm run media
 *
 * El original vive en assets/ (hero.mp4 o hero-source.mov) y el resultado va a
 * public/media/hero/, que sí se sube al repo: así Railway no necesita ffmpeg
 * para desplegar.
 *
 * Este vídeo es solo el fondo del hero. El resto de fotos y vídeos (galería,
 * "Sobre mí", recortes del collage) se suben desde /?edit=1.
 *
 * Requiere ffmpeg. Si no lo tienes:  npm i -D ffmpeg-static
 */
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(ROOT, 'assets');
const OUT = path.join(ROOT, 'public', 'media', 'hero');

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
  for (const name of ['hero.mp4', 'hero.mov', 'hero-source.mov']) {
    const file = path.join(ASSETS, name);
    try { await fs.access(file); return file; } catch { /* siguiente */ }
  }
  const entries = await fs.readdir(ASSETS).catch(() => []);
  const video = entries.find((f) => /\.(mp4|mov|m4v|webm)$/i.test(f));
  return video ? path.join(ASSETS, video) : null;
}

const ffmpeg = (bin, args) =>
  run(bin, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { maxBuffer: 1 << 26 });

async function main() {
  const bin = await resolveFfmpeg();
  if (!bin) {
    console.error('No encuentro ffmpeg. Instálalo con:  npm i -D ffmpeg-static');
    process.exit(1);
  }

  const src = await findSourceVideo();
  if (!src) {
    console.error(`No hay ningún vídeo en ${path.relative(ROOT, ASSETS)}/.`);
    console.error('Copia ahí tu hero.mp4 y vuelve a ejecutarlo.');
    process.exit(1);
  }

  await fs.mkdir(OUT, { recursive: true });
  console.log('Original:', path.relative(ROOT, src));

  // Sin audio (el hero va silenciado), yuv420p para que iOS lo reproduzca y
  // faststart para que empiece a verse antes de descargarse entero.
  const common = ['-an', '-movflags', '+faststart', '-pix_fmt', 'yuv420p',
    '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow'];

  for (const [width, crf, name] of [[1440, 27, 'hero-1440.mp4'], [960, 29, 'hero-960.mp4']]) {
    const dest = path.join(OUT, name);
    await ffmpeg(bin, ['-i', src, '-vf', `scale=${width}:-2:flags=lanczos`, '-crf', String(crf), ...common, dest]);
    const { size } = await fs.stat(dest);
    console.log(`  ${name}  ${(size / 1024).toFixed(0)} KB`);
  }

  console.log('Listo.');
}

main().catch((err) => { console.error(err); process.exit(1); });
