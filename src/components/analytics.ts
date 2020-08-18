export function analyticsInit(id: string) {
  // @ts-ignore
  window.ga =
    window.ga ||
    function () {
      (ga.q = ga.q || []).push(arguments);
    };
  ga.l = +new Date();

  ga("create", id, "auto");
  ga("set", "forceSSL", true);
  ga("set", "anonymizeIp", true);
  ga("send", "pageview");
}

export function analyticsPageview(path: string) {
  ga("send", "pageview", path);
}

window.addEventListener("error", function (e) {
  ga("send", {
    hitType: "event",
    eventCategory: "Website",
    eventAction: "JavaScript Error",
    eventLabel: `${e.message} at ${e.filename}:${e.lineno}`,
  });
});
