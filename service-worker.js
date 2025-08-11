const CACHE_NAME = 'offline-cache-v2';
const ASSETS = [
  'index.html',
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
  if (!navigator.onLine) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        return cachedResponse || caches.match('offline.html');
      })
    );
  } else {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() =>
        caches.match('offline.html')
      )
    );
  }
});

