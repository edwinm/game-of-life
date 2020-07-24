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
  //ga("send", "pageview", path);
}
