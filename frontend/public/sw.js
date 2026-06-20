if (self.location.hostname === 'localhost') {
  // Self-destruct / cleanup service worker for local development
  self.addEventListener('install', () => {
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => caches.delete(key))
        );
      }).then(() => {
        return self.registration.unregister();
      }).then(() => {
        return self.clients.matchAll();
      }).then((clients) => {
        clients.forEach(client => {
          if (client.navigate) {
            client.navigate(client.url);
          }
        });
      })
    );
  });
} else {
  // Normal production Service Worker logic
  const CACHE_NAME = 'dietplanner-cache-v1';
  const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/favicon.svg',
    '/manifest.json'
  ];

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
    );
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
    );
  });

  self.addEventListener('fetch', (event) => {
    // Only intercept HTTP/HTTPS (ignore chrome-extension URLs)
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          // Don't cache API requests or invalid responses
          if (!response || response.status !== 200 || response.type !== 'basic' || event.request.url.includes('/api/')) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        }).catch(() => {
          // Fallback or ignore
        });
      })
    );
  });
}

