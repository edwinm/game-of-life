if (!self.define) {
  let e,
    i = {};
  const n = (n, r) => (
    (n = new URL(n + ".js", r).href),
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
  self.define = (r, s) => {
    const t =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (i[t]) return;
    let o = {};
    const d = (e) => n(e, t),
      c = { module: { uri: t }, exports: o, require: d };
    i[t] = Promise.all(r.map((e) => c[e] || d(e))).then((e) => (s(...e), o));
  };
}
define(["./workbox-958dc79a"], function (e) {
  "use strict";
  (self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: "index.html", revision: "b4b956b622b1b274e41a1c2638447426" },
        { url: "style.css", revision: "a6f3dded34f6b85052fc51a5c5253195" },
        { url: "gol2.wasm", revision: "f2c95c4687189df267dbd750d7b461cf" },
        { url: "manifest.json", revision: "23d457c0f01d7872b096f4b40a4b385a" },
        { url: "bundle.min.js", revision: "3148445d998f274b4794f13086227c78" },
      ],
      { directoryIndex: "index.html" }
    ),
    e.registerRoute(
      new e.NavigationRoute(e.createHandlerBoundToURL("/index.html"))
    ),
    e.registerRoute(/./, new e.StaleWhileRevalidate(), "GET"));
});
//# sourceMappingURL=service-worker.js.map
