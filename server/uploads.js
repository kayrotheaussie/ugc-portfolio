/**
 * Subida de archivos al volumen persistente.
 *
 * Las imágenes se reconvierten a WebP (grande + miniatura) para que la web
 * cargue rápido en el móvil. Los vídeos se guardan tal cual: el póster lo
 * genera el navegador antes de subirlo, así el servidor no necesita ffmpeg.
 */
import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import sharp from 'sharp';
import { MAX_UPLOAD_MB, UPLOAD_DIR } from './config.js';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/heic', 'image/heif']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']);
const VIDEO_EXT = { 'video/mp4': '.mp4', 'video/quicktime': '.mp4', 'video/webm': '.webm', 'video/x-m4v': '.mp4' };

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024, files: 2 },
  fileFilter(_req, file, cb) {
    if (IMAGE_TYPES.has(file.mimetype) || VIDEO_TYPES.has(file.mimetype)) return cb(null, true);
    return cb(new Error(`Formato no admitido: ${file.mimetype}`));
  },
});

const stamp = () => `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;

async function writeImage(buffer, name, width, quality) {
  const file = `${name}.webp`;
  await sharp(buffer)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toFile(path.join(UPLOAD_DIR, file));
  return `/uploads/${file}`;
}

/** @returns {Promise<{type:'image', src:string, thumb:string, width:number, height:number}>} */
export async function storeImage(buffer, { big = 1400, thumb = 480 } = {}) {
  const id = stamp();
  const meta = await sharp(buffer).rotate().metadata();
  const [src, thumbUrl] = await Promise.all([
    writeImage(buffer, id, big, 78),
    writeImage(buffer, `${id}-thumb`, thumb, 72),
  ]);
  return { type: 'image', src, thumb: thumbUrl, width: meta.width ?? null, height: meta.height ?? null };
}

/** @returns {Promise<{type:'video', src:string}>} */
export async function storeVideo(buffer, mimetype) {
  const file = `${stamp()}${VIDEO_EXT[mimetype] ?? '.mp4'}`;
  await fs.writeFile(path.join(UPLOAD_DIR, file), buffer);
  return { type: 'video', src: `/uploads/${file}` };
}

/** Borra un archivo subido. Ignora todo lo que no viva en /uploads. */
export async function removeUpload(url) {
  if (typeof url !== 'string' || !url.startsWith('/uploads/')) return false;
  const name = path.basename(url);
  const target = path.join(UPLOAD_DIR, name);
  if (path.dirname(target) !== UPLOAD_DIR) return false;
  await fs.unlink(target).catch(() => {});
  return true;
}
