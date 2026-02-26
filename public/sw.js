// Minimal service worker for PWA installability
const CACHE_NAME = 'nbl2-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

self.addEventListener('fetch', (event) => {
  // Network-first strategy – just pass through
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)))
})
