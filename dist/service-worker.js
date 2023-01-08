if (!self.define) {
  let e,
    i = {};
  const n = (n, s) => (
    (n = new URL(n + ".js", s).href),
    i[n] ||
      new Promise((i) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = n), (e.onload = i), document.head.appendChild(e);
        } else (e = n), importScripts(n), i();
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
      d = { module: { uri: t }, exports: o, require: c };
    i[t] = Promise.all(s.map((e) => d[e] || c(e))).then((e) => (r(...e), o));
  };
}
define(["./workbox-5e39d866"], function (e) {
  "use strict";
  self.addEventListener("message", (e) => {
    e.data && "SKIP_WAITING" === e.data.type && self.skipWaiting();
  }),
    e.precacheAndRoute(
      [
        { url: "index.html", revision: "8e929b9284b6e5153de87c9c54c1d060" },
        { url: "style.css", revision: "021364ad2a5685dd2ac2cf23123014fb" },
        { url: "gol.wasm", revision: "b8ccae993f4b38bffe4d5ae0c11797c4" },
        { url: "manifest.json", revision: "447d14650650e66f0998fc80a997e042" },
        { url: "bundle.min.js", revision: "1d69a7948b5c7c453782d73dba152867" },
      ],
      { directoryIndex: "index.html" }
    ),
    e.registerRoute(
      new e.NavigationRoute(e.createHandlerBoundToURL("/index.html"))
    ),
    e.registerRoute(/./, new e.StaleWhileRevalidate(), "GET");
});
//# sourceMappingURL=service-worker.js.map
