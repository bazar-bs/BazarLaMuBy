self.addEventListener('fetch', (event) => {
  if (!navigator.onLine) {
    event.respondWith(
      new Response("<h1>Questa app funziona solo online</h1>", {
        headers: { "Content-Type": "text/html" }
      })
    );
  } else {
    event.respondWith(
      fetch(event.request, { cache: "no-store" }).catch(() => {
        return caches.open('offline-cache').then(cache => {
          return cache.match('offline.html');
        });
      })
    );
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('offline-cache').then(cache => {
      return cache.addAll(['offline.html']);
    })
  );
});
