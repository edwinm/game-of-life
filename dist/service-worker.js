if (!self.define) {
  const e = (e) => {
      "require" !== e && (e += ".js");
      let r = Promise.resolve();
      return (
        i[e] ||
          (r = new Promise(async (r) => {
            if ("document" in self) {
              const i = document.createElement("script");
              (i.src = e), document.head.appendChild(i), (i.onload = r);
            } else importScripts(e), r();
          })),
        r.then(() => {
          if (!i[e]) throw new Error(`Module ${e} didn’t register its module`);
          return i[e];
        })
      );
    },
    r = (r, i) => {
      Promise.all(r.map(e)).then((e) => i(1 === e.length ? e[0] : e));
    },
    i = { require: Promise.resolve(r) };
  self.define = (r, s, n) => {
    i[r] ||
      (i[r] = Promise.resolve().then(() => {
        let i = {};
        const o = { uri: location.origin + r.slice(1) };
        return Promise.all(
          s.map((r) => {
            switch (r) {
              case "exports":
                return i;
              case "module":
                return o;
              default:
                return e(r);
            }
          })
        ).then((e) => {
          const r = n(...e);
          return i.default || (i.default = r), i;
        });
      }));
  };
}
define("./service-worker.js", ["./workbox-7f1d7524"], function (e) {
  "use strict";
  self.addEventListener("message", (e) => {
    e.data && "SKIP_WAITING" === e.data.type && self.skipWaiting();
  }),
    e.precacheAndRoute(
      [
        { url: "index.html", revision: "d85a9ad311478466b94851dc80ae3ec4" },
        { url: "style.css", revision: "1857ac5e03b4993d208f5633503016c8" },
        { url: "gol.wasm", revision: "b8ccae993f4b38bffe4d5ae0c11797c4" },
        { url: "manifest.json", revision: "879ef2270c6a566a837aca040b1f023e" },
        { url: "bundle.min.js", revision: "4b622f58fa4aa324a4fc35092933545b" },
        { url: "pix/header.png", revision: "acc2d3ae99631163d385982c1a4cf7b7" },
        {
          url: "pix/header-bg.png",
          revision: "f7d7efeb0f57aa704c93d6e46bfbfddb",
        },
        {
          url: "pix/header-bg-dark.png",
          revision: "822436dd82a6a76baea94478e3fde8ea",
        },
      ],
      { directoryIndex: "index.html" }
    ),
    e.registerRoute(
      new e.NavigationRoute(e.createHandlerBoundToURL("/index.html"))
    ),
    e.registerRoute(/./, new e.StaleWhileRevalidate(), "GET");
});
//# sourceMappingURL=service-worker.js.map
