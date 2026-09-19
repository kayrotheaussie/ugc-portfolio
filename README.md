# Kayro The Aussie · Portfolio UGC

Web de una sola página para Kayro, pastor australiano cachorro y creador de
contenido para marcas pet friendly. Está pensada primero para el móvil, porque
es desde ahí desde donde la van a abrir las marcas.

- **Hero** con vídeo a pantalla completa, en bucle y sin sonido.
- **Sobre mí** con foto y notas tipo pegatina.
- **Collage** con el arco amarillo y los recortes de Kayro, que entran con un
  rebote al llegar scrolleando.
- **Galería** de tarjetas verticales con filtros por tipo de contenido y visor
  a pantalla completa (las piezas en vídeo se reproducen ahí mismo).
- **Contacto** con servicios, email e Instagram/TikTok.
- **Modo edición** en `/?edit=1` para cambiarlo todo sin tocar código.

> **Estado actual: placeholders.** Lo único real que hay ahora mismo es el
> vídeo del hero. La foto de "Sobre mí", los cinco recortes del collage y las
> ocho piezas de la galería son recuadros de color que dicen qué va en cada
> sitio. Se sustituyen uno a uno desde `/?edit=1`, sin tocar código ni volver a
> desplegar.

---

## 1. Ponerlo en marcha en tu ordenador

Necesitas [Node.js](https://nodejs.org) 20 o superior.

```bash
npm install
cp .env.example .env     # y pon una contraseña en EDIT_PASSWORD
npm run dev
```

Abre <http://localhost:3000>. Para editar, <http://localhost:3000/?edit=1>.

Sin base de datos configurada, el contenido se guarda en `.data/content.json`
y los archivos que subas en `.data/uploads/`. Funciona igual, solo que en tu
ordenador.

---

## 2. Publicarlo en Railway, paso a paso

Es la parte importante. Se hace una sola vez y son unos diez minutos.

### Paso 1 · Crear el proyecto

1. Entra en [railway.com](https://railway.com) y crea una cuenta (puedes usar
   la de GitHub).
2. Pulsa **New Project** → **Deploy from GitHub repo**.
3. Dale acceso a tu cuenta de GitHub y elige el repositorio `ugc-portfolio`.
4. Railway empieza a construir la web sola. Déjalo, todavía le falta lo demás.

### Paso 2 · Añadir la base de datos

Aquí se guardan los textos y la lista de piezas de la galería.

1. Dentro del proyecto, pulsa **+ Create** → **Database** → **Add PostgreSQL**.
2. Aparece un segundo bloque llamado **Postgres** al lado de tu web. Ya está;
   no hay que crear ninguna tabla, la crea la web sola la primera vez.

### Paso 3 · Añadir el almacenamiento (el volumen)

Aquí se guardan las fotos y los vídeos que subas desde el modo edición. Sin
esto, se borrarían cada vez que se vuelve a desplegar.

1. Haz clic en el bloque de **tu web** (no en el de Postgres).
2. Pestaña **Settings** → busca **Volumes** → **+ New Volume**.
3. En **Mount path** escribe exactamente:

   ```
   /data
   ```

4. Guarda. Con 1 GB vas sobrado para bastante tiempo.

### Paso 4 · Poner las variables de entorno

Son los "ajustes secretos" de la web.

1. Sigue en el bloque de tu web. Pestaña **Variables** → **+ New Variable**.
2. Añade estas tres, una a una:

   | Nombre | Valor |
   | --- | --- |
   | `EDIT_PASSWORD` | La contraseña que quieras para entrar a editar. Larga y que no uses en otro sitio. |
   | `SESSION_SECRET` | Otro texto largo y aleatorio, distinto del anterior. Sirve para firmar tu sesión. |
   | `DATABASE_URL` | `${{ Postgres.DATABASE_URL }}` ← cópialo tal cual, con las llaves incluidas. |

   > Ese `${{ Postgres.DATABASE_URL }}` es una referencia: Railway lo sustituye
   > solo por la dirección real de tu base de datos. Si tu bloque de Postgres se
   > llama de otra forma, cambia `Postgres` por ese nombre.

3. Opcionales, por si los quieres:

   | Nombre | Valor |
   | --- | --- |
   | `SITE_URL` | La dirección pública de la web (`https://…`). Mejora cómo se ve el enlace al compartirlo por WhatsApp o redes. |
   | `MAX_UPLOAD_MB` | Tamaño máximo por archivo subido. Por defecto, `120`. |

4. Railway vuelve a desplegar solo al guardar las variables.

### Paso 5 · Darle una dirección

1. Pestaña **Settings** → **Networking** → **Generate Domain**.
2. Te da una dirección tipo `kayro-production.up.railway.app`. Ya es pública.
3. Si tienes un dominio propio, en esa misma pantalla está **Custom Domain**:
   Railway te dice qué hay que poner en tu proveedor de dominios.

### Paso 6 · Comprobar que todo está bien

Abre `https://tu-direccion.up.railway.app/health`. Tiene que responder algo así:

```json
{"ok":true,"store":{"kind":"postgres","ok":true},"editing":true,"dataDir":"/data"}
```

Lo que importa:

- `"kind":"postgres"` → la base de datos está conectada. Si pone `"archivo"`,
  revisa la variable `DATABASE_URL`.
- `"editing":true` → el modo edición funciona. Si pone `false`, falta
  `EDIT_PASSWORD`.
- `"dataDir":"/data"` → el volumen está montado. Si pone otra cosa, revisa el
  **Mount path** del paso 3.

---

## 3. Editar la web desde el navegador

Entra en `https://tu-direccion.up.railway.app/?edit=1`, escribe la contraseña
de `EDIT_PASSWORD` y aparece una barra abajo.

| Qué quieres hacer | Cómo |
| --- | --- |
| Cambiar cualquier texto | Haz clic encima y escribe. `Enter` confirma, `Esc` deshace. |
| Cambiar el vídeo del hero | Botón **Cambiar vídeo del hero**, arriba del todo. |
| Cambiar la foto de "Sobre mí" | Botón **Cambiar foto**, sobre la propia foto. |
| Sustituir un recorte del collage | Quita el placeholder y usa **Añadir recorte**. |
| Mover un recorte del collage | Arrástralo con el dedo o el ratón. |
| Quitar un recorte | Clic derecho encima (o mantener pulsado en el móvil). |
| Añadir un recorte | Botón **Añadir recorte**, arriba del collage. |
| Añadir una pieza a la galería | Botón **Añadir pieza**, debajo de la cuadrícula. Vale foto o vídeo. |
| Reordenar la galería | Flechas **←** y **→** de cada tarjeta. |
| Quitar una pieza | Botón **✕** de la tarjeta. |
| Cambiar la categoría de una pieza | El desplegable de debajo de cada tarjeta. |

**Nada se guarda hasta que pulses "Guardar".** Mientras haya cambios sin
guardar, la barra pone *Sin guardar* en amarillo.

El botón **Restaurar original** devuelve todos los textos y la galería al
contenido de fábrica. Las fotos que hayas subido no se borran del volumen.

Cuando subes un vídeo, la portada se saca de un fotograma en tu propio
navegador, así que el servidor no necesita ffmpeg.

> **Sobre los vídeos del iPhone.** Grábalos o expórtalos en formato
> "Más compatible" (H.264). Si el vídeo va en HEVC, Safari lo reproduce pero
> Chrome y Firefox no, y tampoco se puede sacar la portada: la tarjeta se queda
> con un recuadro que pone "Vídeo sin portada". En el iPhone se cambia en
> *Ajustes → Cámara → Formatos → Más compatible*, o al compartir el vídeo en
> *Opciones → Más compatible*.

---

## 4. Poner el material de verdad

Casi todo se sube desde `/?edit=1` y no hace falta tocar el repo: la foto de
"Sobre mí", los recortes del collage y las piezas de la galería se cambian
desde el propio navegador, también desde el móvil.

La única excepción es **el vídeo del hero**, porque conviene comprimirlo antes
de subirlo. También se puede cambiar desde `/?edit=1`, pero si quieres el
vídeo bien optimizado:

```bash
# copia tu vídeo a assets/hero.mp4, y luego:
npm i -D ffmpeg-static   # solo la primera vez
npm run media            # genera las dos versiones ligeras
git add public/media && git commit -m "Nuevo vídeo del hero" && git push
```

Si tienes el portfolio de Canva en PDF, `npm run import-pdf` saca de dentro
todas las fotos a su resolución original (y conserva la transparencia de los
recortes). Las deja en `assets/extraidas/`, listas para subirlas desde
`/?edit=1`. El detalle está en [`assets/LEEME.md`](assets/LEEME.md).

---

## 5. Cómo está montado

```
server/          Servidor Express
  config.js        Variables de entorno y rutas
  auth.js          Contraseña del modo edición y cookie firmada
  store.js         Guarda el contenido (Postgres, o JSON si no hay base de datos)
  default-content.js  Todos los textos de fábrica
  render.js        Genera el HTML
  uploads.js       Subidas: imágenes a WebP, vídeos tal cual
  index.js         Rutas y arranque
public/          Lo que se sirve al navegador
  css/, js/, fonts/, media/
scripts/
  build-media.mjs  Comprime el vídeo del hero que hay en assets/
  import-pdf.mjs   Fotos que hay dentro del PDF de Canva
```

`public/media/placeholders/` son SVG diminutos (unos 60 KB en total) que
marcan los huecos del material que falta. Cuando subas el contenido real
dejan de usarse; puedes borrarlos entonces.

### Decisiones que conviene saber

- **El contenido es un único objeto JSON.** Al guardar se envía entero y se
  mezcla con los valores de fábrica, así que si algún día la web gana una
  sección nueva, aparece sola sin romper lo que ya tenías guardado.
- **Si no hay `DATABASE_URL`, la web sigue funcionando** guardando en un JSON
  dentro del volumen. Útil para el primer despliegue.
- **Sin `EDIT_PASSWORD` el modo edición queda apagado** y la API de escritura
  devuelve 503. Es lo que pasa si alguien encuentra `/?edit=1` antes de que
  configures nada.
- **Las tipografías se sirven desde el propio dominio** (`public/fonts/`): una
  conexión menos y ninguna petición a Google.
- **El vídeo del hero no se descarga hasta que la página ha cargado**, va en dos
  calidades según el ancho de pantalla, se pausa al salir de vista y no se
  descarga en absoluto si el móvil está en ahorro de datos. En ese caso se ve un
  recorte de Kayro sobre el amarillo.

### Seguridad del modo edición

- Cookie firmada con HMAC, `httpOnly`, válida 12 horas.
- La contraseña se compara en tiempo constante.
- Ocho intentos fallidos por IP bloquean 10 minutos.
- Las subidas están limitadas por tipo (imagen o vídeo) y por tamaño.

---

## Variables de entorno

| Variable | Obligatoria | Qué hace |
| --- | --- | --- |
| `EDIT_PASSWORD` | Para editar | Contraseña de `/?edit=1`. Sin ella, la edición está apagada. |
| `SESSION_SECRET` | Recomendada | Firma la cookie de sesión. Si falta, se usa `EDIT_PASSWORD`. |
| `DATABASE_URL` | Recomendada | Postgres. Sin ella, el contenido va a un JSON en `DATA_DIR`. |
| `DATA_DIR` | No | Carpeta persistente. Si existe `/data`, se usa sola. |
| `PORT` | No | La pone Railway. En local, 3000. |
| `SITE_URL` | No | Dirección pública, para las etiquetas de compartir. |
| `MAX_UPLOAD_MB` | No | Tamaño máximo por archivo. Por defecto 120. |
