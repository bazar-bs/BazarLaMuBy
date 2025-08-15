const CACHE_NAME = 'offline-cache-v2';
const ASSETS = [
  'offline.html',
  'style.css',
  'lamuby_logo_bigtext_trasp_bianco.png',
  'lamuby_logo_bigtext.avif',
  'qr-lamuby.png',
  // aggiungi eventuali immagini o font qui
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', event => {
  // Gestione della navigazione (es. index.html dinamica)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('offline.html'))
    );
    return;
  }

  // Gestione asset statici (immagini, CSS, ecc.)
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});