if (!self.define) {
  let e,
    i = {};
  const n = (n, s) => (
    (n = new URL(n + ".js", s).href),
    i[n] ||
      new Promise((i) => {
        if ("document" in self) {
          const e = document.createElement("script");
          ((e.src = n), (e.onload = i), document.head.appendChild(e));
        } else ((e = n), importScripts(n), i());
      }).then(() => {
        let e = i[n];
        if (!e) throw new Error(`Module ${n} didn’t register its module`);
        return e;
      })
  );
  self.define = (s, r) => {
    const t =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (i[t]) return;
    let o = {};
    const d = (e) => n(e, t),
      c = { module: { uri: t }, exports: o, require: d };
    i[t] = Promise.all(s.map((e) => c[e] || d(e))).then((e) => (r(...e), o));
  };
}
define(["./workbox-3187bf51"], function (e) {
  "use strict";
  (self.addEventListener("message", (e) => {
    e.data && "SKIP_WAITING" === e.data.type && self.skipWaiting();
  }),
    e.precacheAndRoute(
      [
        { url: "index.html", revision: "cb9be77b096321e0e7b37fdb16e029fb" },
        { url: "style.css", revision: "72b0332aa571cea5e34c3862575279c6" },
        { url: "gol2.wasm", revision: "f2c95c4687189df267dbd750d7b461cf" },
        { url: "manifest.json", revision: "ee377d2af29bff92d134be9793d7a591" },
        { url: "bundle.min.js", revision: "8075d591f4d4c5987ec7308d447b3b85" },
      ],
      { directoryIndex: "index.html" }
    ),
    e.registerRoute(
      new e.NavigationRoute(e.createHandlerBoundToURL("/index.html"))
    ),
    e.registerRoute(/./, new e.StaleWhileRevalidate(), "GET"));
});
//# sourceMappingURL=service-worker.js.map
