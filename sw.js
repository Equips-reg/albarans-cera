// Service worker: permet que l'aplicació funcioni sense connexió.
const VERSIO = 'albarans-cera-v4';
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
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      const copia = resp.clone();
      caches.open(VERSIO).then(c => c.put(e.request, copia));
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});
