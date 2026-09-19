#!/usr/bin/env node
/**
 * Saca las fotos que llevas dentro del portfolio de Canva.
 *
 *   npm run import-pdf              (usa assets/Kayro.pdf)
 *   npm run import-pdf -- otro.pdf
 *
 * Las imágenes salen en assets/extraidas/ a su resolución original y
 * conservando la transparencia de los recortes. Desde ahí las subes a la web
 * con el modo edición (/?edit=1) o las copias a public/media/.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIN_SIDE = 200; // por debajo de esto son iconos y adornos, no fotos

async function loadPdfjs() {
  try {
    return await import('pdfjs-dist/legacy/build/pdf.mjs');
  } catch (err) {
    if (err?.code !== 'ERR_MODULE_NOT_FOUND') throw err;
    console.error('Falta pdfjs-dist. Instálalo con:  npm i -D pdfjs-dist');
    process.exit(1);
  }
}

/** Convierte el mapa de bits que devuelve pdf.js en un PNG. */
async function bitmapToPng(image) {
  const { width, height, kind } = image;
  const data = image.data;
  if (!data || !width || !height) return null;

  // kind: 1 = escala de grises, 2 = RGB (3 bytes), 3 = RGBA (4 bytes)
  const channels = kind === 3 ? 4 : kind === 2 ? 3 : 1;
  const expected = width * height * channels;

  if (data.length === expected) {
    return sharp(Buffer.from(data), { raw: { width, height, channels } }).png().toBuffer();
  }
  // Algunos PDF traen RGB en bloques de 4 bytes (con relleno).
  if (data.length === width * height * 4) {
    return sharp(Buffer.from(data), { raw: { width, height, channels: 4 } }).png().toBuffer();
  }
  return null;
}

async function main() {
  const { getDocument, OPS } = await loadPdfjs();
  const input = path.resolve(process.argv[2] || path.join(ROOT, 'assets', 'Kayro.pdf'));
  const outDir = path.join(ROOT, 'assets', 'extraidas');

  try {
    await fs.access(input);
  } catch {
    console.error(`No encuentro ${path.relative(ROOT, input)}.`);
    console.error('Copia ahí tu portfolio de Canva en PDF y vuelve a ejecutarlo.');
    process.exit(1);
  }

  await fs.mkdir(outDir, { recursive: true });
  const doc = await getDocument({
    data: new Uint8Array(await fs.readFile(input)),
    // Sin fuentes ni workers: solo queremos las imágenes.
    disableFontFace: true,
    useSystemFonts: false,
  }).promise;

  console.log(`${path.basename(input)} · ${doc.numPages} páginas`);
  const seen = new Set();
  let saved = 0;

  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const ops = await page.getOperatorList();
    const names = new Set();

    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];
      if (fn === OPS.paintImageXObject || fn === OPS.paintJpegXObject || fn === OPS.paintImageXObjectRepeat) {
        const name = ops.argsArray[i]?.[0];
        if (typeof name === 'string') names.add(name);
      }
    }

    for (const name of names) {
      // pdf.js lanza si el objeto aún no está resuelto; entonces se pide con callback.
      let image = null;
      try {
        image = page.objs.get(name);
      } catch {
        image = await new Promise((resolve) => {
          const timer = setTimeout(() => resolve(null), 10_000);
          page.objs.get(name, (value) => { clearTimeout(timer); resolve(value); });
        });
      }
      if (!image) continue;

      let png = null;
      try {
        if (image.data) png = await bitmapToPng(image);
        else if (image.bitmap) {
          // ImageBitmap (pdf.js moderno): lo pasamos por un canvas si existe.
          continue;
        }
      } catch { /* imagen que no sabemos leer */ }
      if (!png) continue;

      const meta = await sharp(png).metadata();
      if (Math.min(meta.width, meta.height) < MIN_SIDE) continue;

      const key = `${meta.width}x${meta.height}-${png.length}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const file = path.join(outDir, `pagina-${String(n).padStart(2, '0')}-${name.replace(/\W+/g, '')}.png`);
      await fs.writeFile(file, png);
      const alpha = meta.hasAlpha ? ' · con transparencia' : '';
      console.log(`  ${path.relative(ROOT, file)}  ${meta.width}×${meta.height}${alpha}`);
      saved++;
    }
    page.cleanup();
  }

  console.log(saved
    ? `\nListo: ${saved} imágenes en ${path.relative(ROOT, outDir)}/\n` +
      'Las que tengan transparencia son los recortes del collage; las verticales, la galería.\n' +
      'Súbelas desde /?edit=1 o cópialas a public/media/.'
    : '\nNo he encontrado imágenes grandes. Puede que el PDF las lleve vectorizadas:\n' +
      'exporta de nuevo desde Canva como "PDF estándar" o descarga las fotos sueltas.');
}

main().catch((err) => { console.error(err); process.exit(1); });
