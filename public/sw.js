// İzmir Uzmanı service worker: keeps recently viewed pages (timetables, pharmacies) available offline.
// Pages: network first, cached copy if offline. Static assets: cache first.
const VERSION = 'v1';
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const MAX_PAGES = 60;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(PAGES).then((c) => c.addAll(['/', '/toplu-tasima-saatleri/'])).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = new Set([PAGES, ASSETS]);
    for (const key of await caches.keys()) if (!keep.has(key)) await caches.delete(key);
    await self.clients.claim();
  })());
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const key = url.origin + url.pathname;
      try {
        const res = await fetch(req);
        if (res.ok) {
          const cache = await caches.open(PAGES);
          await cache.put(key, res.clone());
          trim(PAGES, MAX_PAGES);
        }
        return res;
      } catch {
        const cached = await caches.match(key, { cacheName: PAGES });
        if (cached) return cached;
        return new Response(
          '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Çevrimdışı</title>' +
          '<body style="font-family:system-ui;background:#FFF9F3;color:#1a1a1a;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:24px">' +
          '<div><h1 style="font-size:22px">İnternet bağlantısı yok</h1><p style="color:#666">Bu sayfa henüz cihazına kaydedilmedi. Daha önce açtığın saat tabloları çevrimdışı da açılır.</p>' +
          '<p><a href="/toplu-tasima-saatleri/" style="color:#062F96">Toplu taşıma saatleri</a></p></div></body>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
        );
      }
    })());
    return;
  }

  if (url.pathname.startsWith('/_astro/') || url.pathname.startsWith('/icons/') || url.pathname.startsWith('/images/')) {
    event.respondWith((async () => {
      const cached = await caches.match(req, { cacheName: ASSETS });
      if (cached) return cached;
      const res = await fetch(req);
      if (res.ok && url.pathname.startsWith('/_astro/')) (await caches.open(ASSETS)).put(req, res.clone());
      return res;
    })());
  }
});
