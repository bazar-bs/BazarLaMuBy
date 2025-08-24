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
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Caching assets:', ASSETS);
      return cache.addAll(ASSETS);
    })
  );
});
// Activate → elimina vecchie cache
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[ServiceWorker] Deleting old cache:', k);
          return caches.delete(k);
        })
      )
    )
  );
});
// Fetch handler con log
self.addEventListener('fetch', event => {
  console.log('[ServiceWorker] Fetching:', event.request.url);
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse.status === 200) {
          console.log('[ServiceWorker] Network OK → caching:', event.request.url);
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        } else {
          console.warn('[ServiceWorker] Network response not 200:', networkResponse.status);
        }
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            console.log('[ServiceWorker] Serving from cache:', event.request.url);
          } else {
            console.log('[ServiceWorker] Serving from network:', event.request.url);
          }
          return cachedResponse || networkResponse;
        });
      })
      .catch(() => {
        console.warn('[ServiceWorker] Network failed → offline fallback');
        return caches.match('offline.html');
      })
  );
});