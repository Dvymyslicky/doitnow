// DoItNow service worker — network-first for same-origin, so the app
// always loads the latest version when online, with offline fallback.
const CACHE = "doitnow-cache-v1";

self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // only handle our own files (let Supabase & others go straight to network)
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith((async () => {
    try {
      const res = await fetch(e.request);
      const cache = await caches.open(CACHE);
      cache.put(e.request, res.clone());
      return res;
    } catch (err) {
      const cached = await caches.match(e.request);
      return cached || Response.error();
    }
  })());
});
