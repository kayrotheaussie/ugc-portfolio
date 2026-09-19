import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PUBLIC_DIR = path.join(ROOT, 'public');

/**
 * Carpeta persistente. En Railway se monta un volumen en /data; en local
 * usamos ./.data para no ensuciar el repo.
 */
function resolveDataDir() {
  if (process.env.DATA_DIR) return path.resolve(process.env.DATA_DIR);
  try {
    fs.accessSync('/data', fs.constants.W_OK);
    return '/data';
  } catch {
    return path.join(ROOT, '.data');
  }
}

export const DATA_DIR = resolveDataDir();
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
export const PORT = Number(process.env.PORT) || 3000;
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const EDIT_PASSWORD = process.env.EDIT_PASSWORD || '';
export const SESSION_SECRET = process.env.SESSION_SECRET || EDIT_PASSWORD;
export const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '');
// Railway no siempre define NODE_ENV, pero sí sus propias variables. Esto
// activa las cookies seguras y la caché larga en cuanto se despliega allí.
export const IS_PROD = process.env.NODE_ENV === 'production' || Boolean(process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_ENVIRONMENT);
/** Tamaño máximo de subida. Un vídeo vertical de 30 s ronda los 20-40 MB. */
export const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB) || 120;

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
