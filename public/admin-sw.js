// Admin Service Worker with Push Notification support
const CACHE_NAME = 'nbl2-admin-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)))
})

// ── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'Nuova Prenotazione', body: 'Hai una nuova richiesta di prenotazione!', url: '/it/admin/dashboard' }

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() }
    } catch {
      data.body = event.data.text()
    }
  }

  const options = {
    body: data.body,
    icon: '/images/logo.jpg',
    badge: '/images/logo.jpg',
    vibrate: [200, 100, 200],
    tag: 'new-booking',
    renotify: true,
    data: { url: data.url },
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/it/admin/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing admin tab if open
      for (const client of windowClients) {
        if (client.url.includes('/admin') && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise open new window
      return clients.openWindow(url)
    })
  )
})
