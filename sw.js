// Force the service worker to update immediately
self.skipWaiting();

const cacheName = "aw-tasks-v2";
const dynamicCacheName = "aw-tasks-dynamic-v2";
const assetsToCache = [
  "/index.html",
  "/src/app.js",
  "/src/main.js",
  "/site.webmanifest",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (![cacheName, dynamicCacheName].includes(name)) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve from cache while updating the cache in the background
        fetch(event.request).then((networkResponse) => {
          caches.open(dynamicCacheName).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        });
        return cachedResponse;
      } else {
        return fetch(event.request)
          .then((networkResponse) => {
            return caches.open(dynamicCacheName).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(() => caches.match("/index.html")); // Fallback if offline
      }
    })
  );
});
