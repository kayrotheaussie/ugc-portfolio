import express from 'express';
import cookieParser from 'cookie-parser';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  DATA_DIR, IS_PROD, MAX_UPLOAD_MB, PORT, PUBLIC_DIR, UPLOAD_DIR,
} from './config.js';
import {
  checkPassword, clearSessionCookie, editingEnabled, isAuthed, requireAuth, setSessionCookie,
} from './auth.js';
import { getContent, initStore, resetContent, saveContent, storeHealth, usingDatabase } from './store.js';
import { renderPage } from './render.js';
import { removeUpload, storeImage, storeVideo, upload } from './uploads.js';

const app = express();
app.set('trust proxy', 1); // Railway pone un proxy delante
app.disable('x-powered-by');

app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

const YEAR = 60 * 60 * 24 * 365;
app.use('/media', express.static(path.join(PUBLIC_DIR, 'media'), { maxAge: IS_PROD ? YEAR * 1000 : 0, immutable: IS_PROD }));
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: IS_PROD ? YEAR * 1000 : 0, immutable: IS_PROD, fallthrough: true }));
app.use(express.static(PUBLIC_DIR, { maxAge: IS_PROD ? 60 * 60 * 1000 : 0, index: false }));

/* ---------------------------------------------------------------- la web */

app.get('/', async (req, res, next) => {
  try {
    const content = await getContent();
    const editMode = req.query.edit === '1';
    res.setHeader('Cache-Control', editMode ? 'no-store' : 'public, max-age=0, must-revalidate');
    res.type('html').send(renderPage(content, { editMode, editingEnabled: editingEnabled() }));
  } catch (err) { next(err); }
});

app.get('/health', async (_req, res) => {
  const store = await storeHealth();
  res.json({ ok: true, store, editing: editingEnabled(), dataDir: DATA_DIR });
});

/* ------------------------------------------------------------------- API */

app.get('/api/session', (req, res) => {
  res.json({ authed: isAuthed(req), enabled: editingEnabled() });
});

app.post('/api/session', (req, res) => {
  const result = checkPassword(req.ip, req.body?.password);
  if (result.disabled) {
    return res.status(503).json({ error: 'El modo edición está desactivado: falta la variable EDIT_PASSWORD.' });
  }
  if (result.blocked) {
    return res.status(429).json({ error: 'Demasiados intentos. Prueba otra vez en 10 minutos.' });
  }
  if (!result.ok) return res.status(401).json({ error: 'Contraseña incorrecta.' });
  setSessionCookie(res);
  return res.json({ authed: true });
});

app.delete('/api/session', (req, res) => {
  clearSessionCookie(res);
  res.json({ authed: false });
});

app.get('/api/content', async (_req, res, next) => {
  try { res.json(await getContent()); } catch (err) { next(err); }
});

app.put('/api/content', requireAuth, async (req, res, next) => {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ error: 'Contenido no válido.' });
    }
    const saved = await saveContent(body);
    return res.json({ ok: true, content: saved });
  } catch (err) { return next(err); }
});

app.post('/api/content/reset', requireAuth, async (_req, res, next) => {
  try { res.json({ ok: true, content: await resetContent() }); } catch (err) { next(err); }
});

app.post('/api/upload', requireAuth, upload.fields([{ name: 'file', maxCount: 1 }, { name: 'poster', maxCount: 1 }]),
  async (req, res, next) => {
    try {
      const file = req.files?.file?.[0];
      if (!file) return res.status(400).json({ error: 'No has enviado ningún archivo.' });

      if (file.mimetype.startsWith('image/')) {
        return res.json(await storeImage(file.buffer));
      }

      const video = await storeVideo(file.buffer, file.mimetype);
      const posterFile = req.files?.poster?.[0];
      if (posterFile) {
        const poster = await storeImage(posterFile.buffer, { big: 900, thumb: 480 });
        return res.json({ ...video, poster: poster.src, thumb: poster.thumb });
      }
      return res.json(video);
    } catch (err) { return next(err); }
  });

app.delete('/api/upload', requireAuth, async (req, res, next) => {
  try { res.json({ ok: await removeUpload(req.body?.src) }); } catch (err) { next(err); }
});

/* ------------------------------------------------------------- errores */

app.use((_req, res) => res.status(404).type('html').send(
  '<!doctype html><meta charset="utf-8"><title>No encontrado</title>' +
  '<body style="font-family:system-ui;background:#FFFDF6;color:#2E3A48;display:grid;place-items:center;height:100vh;margin:0">' +
  '<div style="text-align:center"><h1 style="font-size:3rem;margin:0">404</h1>' +
  '<p>Esta página no existe. <a href="/" style="color:#4E9CCF">Volver al inicio</a></p></div>',
));

app.use((err, _req, res, _next) => {
  const tooBig = err?.code === 'LIMIT_FILE_SIZE';
  if (!tooBig) console.error('[error]', err);
  res.status(tooBig ? 413 : 500).json({
    error: tooBig ? `El archivo pesa más de ${MAX_UPLOAD_MB} MB.` : (err?.message || 'Error del servidor.'),
  });
});

await fs.mkdir(UPLOAD_DIR, { recursive: true });
await initStore();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Kayro The Aussie escuchando en :${PORT}`);
  console.log(`  contenido: ${usingDatabase() ? 'Postgres' : `fichero (${DATA_DIR})`}`);
  console.log(`  subidas:   ${UPLOAD_DIR}`);
  console.log(`  edición:   ${editingEnabled() ? 'activada (/?edit=1)' : 'desactivada (falta EDIT_PASSWORD)'}`);
});
