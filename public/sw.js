/**
 * Service Worker for Polish Flashcards
 * Provides offline support and background sync
 */

const CACHE_NAME = 'polish-flashcards-v1';
const RUNTIME_CACHE = 'polish-flashcards-runtime';
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache critical assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker');

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching critical assets');
      // Don't fail if critical assets can't be cached
      return cache.addAll(CRITICAL_ASSETS).catch(err => {
        console.warn('[SW] Failed to cache critical assets:', err);
      });
    })
  );

  // Skip waiting - activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Claim all clients immediately
  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.navigate(client.url));
  });
});

// Fetch event - cache-first strategy for assets, network-first for API
self.addEventListener('fetch', event => {
  const { request } = event;
  const { method, url } = request;

  // Skip non-GET requests
  if (method !== 'GET') {
    return;
  }

  // Skip Chrome extensions and other non-http(s)
  if (!url.startsWith('http')) {
    return;
  }

  // For JS/CSS/images - cache first
  if (
    url.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/i) ||
    url.includes('/assets/')
  ) {
    event.respondWith(
      caches.match(request).then(response => {
        if (response) {
          return response;
        }

        return fetch(request).then(response => {
          // Only cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        }).catch(() => {
          // Return offline page or empty response
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
    );
    return;
  }

  // For HTML and API calls - network first
  event.respondWith(
    fetch(request)
      .then(response => {
        // Only cache successful responses
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Try cache on network failure
        return caches.match(request).then(response => {
          if (response) {
            console.log('[SW] Serving from cache:', url);
            return response;
          }

          // Return offline response
          console.log('[SW] No cache for:', url);
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', event => {
  console.log('[SW] Received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'SYNC_PROGRESS') {
    // This will be handled by background sync or manual sync from the app
    event.ports[0].postMessage({ synced: true });
  }
});

// Periodic background sync (optional - requires browser support)
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-progress') {
    event.waitUntil(
      // Send message to client to trigger sync
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_REQUESTED'
          });
        });
      })
    );
  }
});
