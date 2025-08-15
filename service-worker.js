const CACHE_NAME = 'lamuby-cache-v3';
const OFFLINE_URL = 'offline.html';
const ASSETS = [
  'index.html',
  OFFLINE_URL,
  'style.css',
  'lamuby_logo_bigtext_trasp_bianco.png',
  'lamuby_logo_bigtext.avif',
  'qr-lamuby.png'
];

// Installazione e precaching
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // Attiva subito la nuova versione
});

// Pulizia delle vecchie cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }))
    )
  );
  self.clients.claim(); // Controlla subito tutte le pagine
});

// Strategia di caching
self.addEventListener('fetch', event => {
  const request = event.request;

  // Per le pagine HTML → network first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then(r => r || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Per asset statici (CSS, immagini) → cache first
  if (ASSETS.some(asset => request.url.includes(asset))) {
    event.respondWith(
      caches.match(request).then(cached => {
        return cached || fetch(request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Default: network fallback a cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
