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
      l = { module: { uri: t }, exports: o, require: c };
    i[t] = Promise.all(s.map((e) => l[e] || c(e))).then((e) => (r(...e), o));
  };
}
define(["./workbox-1c06481a"], function (e) {
  "use strict";
  self.addEventListener("message", (e) => {
    e.data && "SKIP_WAITING" === e.data.type && self.skipWaiting();
  }),
    e.precacheAndRoute(
      [
        { url: "index.html", revision: "ba0a76e170be96cb37f27709fcfbee80" },
        { url: "style.css", revision: "6826e4a78f2afb3ca629d000771d42e6" },
        { url: "gol.wasm", revision: "b8ccae993f4b38bffe4d5ae0c11797c4" },
        { url: "manifest.json", revision: "447d14650650e66f0998fc80a997e042" },
        { url: "bundle.min.js", revision: "bb339935ba405b06521b35029b4e9302" },
      ],
      { directoryIndex: "index.html" }
    ),
    e.registerRoute(
      new e.NavigationRoute(e.createHandlerBoundToURL("/index.html"))
    ),
    e.registerRoute(/./, new e.StaleWhileRevalidate(), "GET");
});
//# sourceMappingURL=service-worker.js.map
