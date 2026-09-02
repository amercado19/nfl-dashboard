/* NFL Predict service worker — generated copy; the cache name is stamped by the publisher (92329d1c8176).
   Strategy: navigation (index.html / current.html) = network-first with cached fallback (offline shows the last
   published snapshot, clearly dated in its header); icons / manifest / fonts = cache-first. Nothing here ever
   caches data from third-party APIs — the dashboard payload is embedded in index.html. */
var CACHE = 'nfl-predict-92329d1c8176';
var SHELL = ['./', './index.html', './manifest.webmanifest', './favicon-32x32.png', './apple-touch-icon.png', './android-chrome-192x192.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL).catch(function () { /* partial precache is fine */ }); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('nfl-predict-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function isNavigation(req) { return req.mode === 'navigate' || (req.destination === 'document') || /\/(index|current)\.html$/.test(new URL(req.url).pathname) || new URL(req.url).pathname.replace(/\/$/, '') === self.registration.scope.replace(/\/$/, '').replace(/^https?:\/\/[^/]+/, ''); }

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var sameOrigin = url.origin === self.location.origin;
  var font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !font) return; // ESPN logos etc. go straight to the network
  if (sameOrigin && isNavigation(req)) {
    e.respondWith(fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
      return res;
    }).catch(function () {
      return caches.match('./index.html').then(function (hit) { return hit || caches.match('./'); });
    }));
    return;
  }
  e.respondWith(caches.match(req).then(function (hit) {
    if (hit) return hit;
    return fetch(req).then(function (res) {
      if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    });
  }));
});

self.addEventListener('message', function (e) { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });
