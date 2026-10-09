// Service worker de Pachangueo: la app arranca sin conexión; el mapa necesita red.
const VERSION = 'pachangueo-v2';
const APP = [
  './', 'index.html', 'manifest.webmanifest', 'css/estilos.css',
  'js/app.js', 'js/datos.js', 'js/mapa.js', 'js/util.js', 'datos/demo.json',
  'iconos/icono-192.png', 'iconos/icono-512.png', 'iconos/icono-maskable-512.png', 'iconos/apple-touch-icon.png', 'iconos/favicon-32.png',
];
// Librerías y fuentes externas: se sirven de caché y se refrescan por detrás.
const EXTERNOS = ['https://unpkg.com/', 'https://fonts.googleapis.com/', 'https://fonts.gstatic.com/'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(APP)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((claves) => Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Navegación: red primero para tener siempre la última versión; sin red, la copia guardada.
  if (request.mode === 'navigate') {
    e.respondWith(fetch(request).catch(() => caches.match('index.html')));
    return;
  }
  // Archivos propios: red primero y copia de respaldo (en el prototipo cambian a menudo).
  if (url.origin === self.location.origin) {
    e.respondWith(fetch(request)
      .then((r) => { if (r.ok) { const copia = r.clone(); caches.open(VERSION).then((c) => c.put(request, copia)); } return r; })
      .catch(() => caches.match(request)));
    return;
  }
  if (EXTERNOS.some((p) => request.url.startsWith(p))) {
    e.respondWith(caches.open(VERSION).then(async (c) => {
      const guardada = await c.match(request);
      const red = fetch(request).then((r) => { if (r.ok || r.type === 'opaque') c.put(request, r.clone()); return r; }).catch(() => guardada);
      return guardada || red;
    }));
  }
  // Teselas del mapa y lo demás: directo a la red.
});
