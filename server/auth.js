import crypto from 'node:crypto';
import { EDIT_PASSWORD, SESSION_SECRET, IS_PROD } from './config.js';

const COOKIE = 'kayro_edit';
const TTL_MS = 1000 * 60 * 60 * 12; // 12 h

/** Comparación en tiempo constante, tolerante a longitudes distintas. */
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export const editingEnabled = () => EDIT_PASSWORD.length > 0;

function sign(payload) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
}

export function issueToken() {
  const payload = String(Date.now() + TTL_MS);
  return `${payload}.${sign(payload)}`;
}

export function tokenIsValid(token) {
  if (!token || !editingEnabled()) return false;
  const dot = token.lastIndexOf('.');
  if (dot < 1) return false;
  const payload = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = sign(payload);
  if (mac.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return false;
  return Number(payload) > Date.now();
}

export function setSessionCookie(res) {
  res.cookie(COOKIE, issueToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: IS_PROD,
    maxAge: TTL_MS,
    path: '/',
  });
}

export const clearSessionCookie = (res) => res.clearCookie(COOKIE, { path: '/' });
export const isAuthed = (req) => tokenIsValid(req.cookies?.[COOKIE]);

/** Freno sencillo a la fuerza bruta: 8 intentos por IP cada 10 minutos. */
const attempts = new Map();
export function checkPassword(ip, password) {
  const now = Date.now();
  const entry = attempts.get(ip) ?? { count: 0, until: 0 };
  if (entry.until > now) return { ok: false, blocked: true };

  if (!editingEnabled()) return { ok: false, disabled: true };

  const ok = typeof password === 'string' && password.length > 0 && safeEqual(password, EDIT_PASSWORD);
  if (ok) {
    attempts.delete(ip);
    return { ok: true };
  }
  entry.count += 1;
  if (entry.count >= 8) {
    entry.count = 0;
    entry.until = now + 10 * 60 * 1000;
  }
  attempts.set(ip, entry);
  return { ok: false };
}

export function requireAuth(req, res, next) {
  if (!editingEnabled()) {
    return res.status(503).json({ error: 'El modo edición está desactivado: falta la variable EDIT_PASSWORD.' });
  }
  if (!isAuthed(req)) return res.status(401).json({ error: 'Sesión caducada. Vuelve a entrar.' });
  return next();
}
