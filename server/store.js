/**
 * Guarda el contenido de la web.
 *
 * - Con DATABASE_URL (Railway Postgres) usa una tabla con una sola fila JSONB.
 * - Sin base de datos, cae a un JSON dentro de la carpeta persistente, así que
 *   la web funciona igual en local y en el primer despliegue.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { DATABASE_URL, DATA_DIR } from './config.js';
import { cloneDefaults } from './default-content.js';

const FILE = path.join(DATA_DIR, 'content.json');

let pool = null;
let ready = null;
let cache = null;

export const usingDatabase = () => Boolean(DATABASE_URL);

function makePool() {
  return new pg.Pool({
    connectionString: DATABASE_URL,
    // Railway sirve Postgres con certificado propio dentro de su red privada.
    ssl: /\bsslmode=disable\b/.test(DATABASE_URL) || DATABASE_URL.includes('railway.internal')
      ? false
      : { rejectUnauthorized: false },
    max: 4,
    idleTimeoutMillis: 30_000,
  });
}

async function init() {
  if (!usingDatabase()) return;
  pool = makePool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      id         SMALLINT PRIMARY KEY DEFAULT 1,
      data       JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT site_content_single_row CHECK (id = 1)
    )
  `);
}

export function initStore() {
  ready ??= init().catch((err) => {
    console.error('[store] No he podido preparar Postgres, sigo con el fichero JSON:', err.message);
    pool = null;
  });
  return ready;
}

/** Rellena con los valores por defecto las claves que falten (p. ej. tras actualizar la web). */
function withDefaults(saved) {
  const base = cloneDefaults();
  if (!saved || typeof saved !== 'object') return base;
  const merge = (target, source) => {
    for (const [key, value] of Object.entries(source)) {
      if (value === undefined) continue;
      if (Array.isArray(value) || value === null || typeof value !== 'object') {
        target[key] = value;
      } else {
        target[key] = merge(typeof target[key] === 'object' && target[key] !== null ? target[key] : {}, value);
      }
    }
    return target;
  };
  return merge(base, saved);
}

export async function getContent() {
  if (cache) return cache;
  await initStore();

  if (pool) {
    try {
      const { rows } = await pool.query('SELECT data FROM site_content WHERE id = 1');
      cache = withDefaults(rows[0]?.data);
      return cache;
    } catch (err) {
      console.error('[store] Lectura de Postgres fallida, uso el fichero:', err.message);
    }
  }

  try {
    cache = withDefaults(JSON.parse(await fs.readFile(FILE, 'utf8')));
  } catch {
    cache = cloneDefaults();
  }
  return cache;
}

export async function saveContent(content) {
  const merged = withDefaults(content);
  await initStore();

  if (pool) {
    await pool.query(
      `INSERT INTO site_content (id, data, updated_at) VALUES (1, $1, now())
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
      [merged],
    );
  } else {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(merged, null, 2), 'utf8');
  }

  cache = merged;
  return merged;
}

/** Vuelve al contenido original de fábrica. */
export async function resetContent() {
  cache = null;
  return saveContent(cloneDefaults());
}

export async function storeHealth() {
  if (!pool) return { kind: 'archivo', ok: true, path: FILE };
  try {
    await pool.query('SELECT 1');
    return { kind: 'postgres', ok: true };
  } catch (err) {
    return { kind: 'postgres', ok: false, error: err.message };
  }
}
