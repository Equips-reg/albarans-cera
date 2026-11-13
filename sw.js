// Service worker: l'aplicació funciona sense connexió.
// La pàgina (index.html) es busca primer a internet, perquè les actualitzacions arribin de seguida;
// la resta de fitxers es serveixen des de la memòria cau.
const VERSIO = 'albarans-cera-v7';
const FITXERS = ['./', './index.html', './jspdf.umd.min.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSIO).then(c => c.addAll(FITXERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(claus => Promise.all(claus.filter(k => k !== VERSIO).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  const esPagina = e.request.mode === 'navigate' || e.request.url.endsWith('.html') || e.request.url.endsWith('/');
  if (esPagina) {
    e.respondWith(
      fetch(e.request).then(resp => {
        const copia = resp.clone();
        caches.open(VERSIO).then(c => c.put(e.request, copia));
        return resp;
      }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
