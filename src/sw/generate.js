const workboxBuild = require("workbox-build");

// Documentation: https://developers.google.com/web/tools/workbox/modules/workbox-build

workboxBuild
  .generateSW({
    globDirectory: "dist",
    globPatterns: [
      "./index.html",
      "./style.css",
      "./gol.wasm",
      "./manifest.json",
      "./bundle.min.js",
      "./pix/header.png",
      "./pix/header-bg.png",
      "./pix/header-bg-dark.png",
    ],
    swDest: "dist/service-worker.js",
    runtimeCaching: [
      {
        urlPattern: /./,
        handler: "StaleWhileRevalidate",
      },
    ],
    navigateFallback: "/index.html",
    directoryIndex: "index.html",
    globStrict: true,
  })
  .then((args) => {
    console.log(`Generated new service worker.`, args);
  })
  .catch((err) => {
    console.error(`Unable to generate a new service worker.`, err);
  });
