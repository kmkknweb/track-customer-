/* Offline caching is deliberately limited to public menu assets.
   DO NOT cache Google Apps Script responses or customer information. */
const CACHE_NAME = 'committee-hub-static-v2';
const MENU_ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(MENU_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const target = new URL(request.url);
  if (target.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('./index.html')));
    return;
  }
  if (MENU_ASSETS.some(asset => new URL(asset, self.registration.scope).pathname === target.pathname)) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
  }
});
