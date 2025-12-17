const CACHE_NAME = 'sheet-viewer-v1';
const urlsToCache = [
  '/',
  '/index.html'
];

// دامەزراندن
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// چالاککردن
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// بەکارهێنانی Cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Background Sync بۆ چێککردن
self.addEventListener('sync', event => {
  if (event.tag === 'check-updates') {
    event.waitUntil(checkForUpdates());
  }
});

async function checkForUpdates() {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'CHECK_UPDATES' });
  });
}

// Push Notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'نوێکردنەوە',
    icon: 'https://www.gstatic.com/images/branding/product/1x/sheets_2020q4_192dp.png',
    badge: 'https://www.gstatic.com/images/branding/product/1x/sheets_2020q4_192dp.png',
    vibrate: [200, 100, 200],
    data: data,
    requireInteraction: true,
    tag: 'sheet-update'
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '🔔 نوێکردنەوە', options)
  );
});

// کلیک لەسەر Notification
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});