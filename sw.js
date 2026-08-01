/* Anserarium service worker.
   Bump CACHE on every deploy or installed copies will serve stale files. */
const CACHE = 'anserarium-v2';

const ASSETS = [
  './',
  'index.html',
  'css/style.css',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'js/sound.js',
  'js/art.js',
  'js/state.js',
  'js/rewards.js',
  'js/views.js',
  'js/app.js',
  'js/data/flora.js',
  'js/data/lepidoptera.js',
  'js/data/fauna.js',
  'js/data/mineralia.js',
  'js/data/curiosities.js',
  'js/data/achievements.js',
  'js/data/fieldnotes.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Network-first for the page shell so an update lands promptly;
   cache-first for everything else so it opens instantly and offline. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  const isShell = e.request.mode === 'navigate' || url.pathname.endsWith('index.html');
  if (isShell) {
    e.respondWith(
      fetch(e.request)
        .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
        .catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }))
  );
});
