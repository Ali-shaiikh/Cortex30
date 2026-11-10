// Mind Gym service worker: caches static assets for speed and shows an offline page.
// Pages and API calls always go to the network (answers and feedback must never be stale).
const CACHE = "mind-gym-v1";
const OFFLINE_HTML = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Offline · Mind Gym</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#07090f;color:#e6e9f2;font-family:system-ui">
<div style="text-align:center"><h1 style="font-weight:600">You're offline</h1><p style="opacity:.6">Your coach needs a connection. Reconnect and refresh.</p></div></body>`;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/icons/icon.svg", "/manifest.webmanifest"])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
            return res;
          }),
      ),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => new Response(OFFLINE_HTML, { headers: { "Content-Type": "text/html" } })));
  }
});
