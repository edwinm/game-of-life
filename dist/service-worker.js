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
    const c = (e) => n(e, t),
      l = { module: { uri: t }, exports: o, require: c };
    i[t] = Promise.all(s.map((e) => l[e] || c(e))).then((e) => (r(...e), o));
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
        { url: "gol.wasm", revision: "b8ccae993f4b38bffe4d5ae0c11797c4" },
        { url: "manifest.json", revision: "ee377d2af29bff92d134be9793d7a591" },
        { url: "bundle.min.js", revision: "59a213bea52a7ae94bb3ba72330664cf" },
      ],
      { directoryIndex: "index.html" }
    ),
    e.registerRoute(
      new e.NavigationRoute(e.createHandlerBoundToURL("/index.html"))
    ),
    e.registerRoute(/./, new e.StaleWhileRevalidate(), "GET"));
});
//# sourceMappingURL=service-worker.js.map
