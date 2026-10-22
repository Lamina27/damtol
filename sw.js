/* damtol service worker: the page is fetched from the network first (a new version arrives whenever the
   phone is online) and served from this cache when offline; icons, manifest and fonts come from the cache. */
const CACHE = "damtol-2.53.6";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
const keep = (req, r) => { if (r && (r.ok || r.type === "opaque")) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } return r; };
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((r) => keep("./index.html", r)).catch(() => caches.match("./index.html")));
    return;
  }
  if (url.origin === location.origin || url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.match(req).then((m) => m || fetch(req).then((r) => keep(req, r))));
  }
});
