const CACHE_NAME = 'lamuby-cache-v4';
const ASSETS = [
  'lamuby_logo_bigtext_trasp_bianco.png',
  'lamuby_logo_bigtext.avif',
  'qr-lamuby.avif',
  'immagine-non-disponibile.webp',
  'style.css',
  'offline.html'
];

// Install → precache asset e offline page
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Activate → elimina vecchie cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// Fetch handler
self.addEventListener('fetch', event => {
  event.respondWith(
    // Prova a fare fetch (rete)
    fetch(event.request)
      .then(networkResponse => {
        // Se la risposta è valida → aggiorna la cache in background
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
        });
        return caches.match(event.request).then(cachedResponse => {
          // Se c’è cache → mostra subito cache, altrimenti rete
          return cachedResponse || networkResponse;
        });
      })
      .catch(() => {
        // Se offline → mostra offline.html
        return caches.match('offline.html');
      })
  );
});
