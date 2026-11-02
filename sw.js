/* Service worker: o app abre offline. APIs externas (PubMed, Europe PMC, Claude) sempre usam a rede. */
const VERSAO = "fisio-v7";
const ARQUIVOS = [
  "./", "./index.html", "./manifest.webmanifest", "./css/style.css",
  "./js/app.js", "./js/marca.js", "./js/ia.js", "./js/artigos.js", "./js/instagram.js", "./js/reels.js",
  "./js/data/tecidos.js", "./js/data/achados.js", "./js/data/condicoes.js", "./js/data/testes.js",
  "./js/data/anatomia.js", "./js/data/evidencias.js", "./js/data/clinica.js",
  "./icons/monograma.png", "./icons/logo-dourada.png", "./icons/logo-verde.png", "./icons/icon-192.png", "./icons/icon-512.png"
];
const CACHE_EXTERNO = ["fonts.googleapis.com", "fonts.gstatic.com", "esm.sh"];

self.addEventListener("install", e => { e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  const local = url.origin === self.location.origin;
  if (!local && !CACHE_EXTERNO.includes(url.hostname)) return; // APIs: sempre rede
  // stale-while-revalidate: responde do cache e atualiza em segundo plano
  e.respondWith(caches.open(VERSAO).then(async cache => {
    const cached = await cache.match(req, { ignoreSearch: local });
    const rede = fetch(req).then(r => { if (r && (r.ok || r.type === "opaque")) cache.put(req, r.clone()); return r; }).catch(() => cached);
    return cached || rede;
  }));
});
