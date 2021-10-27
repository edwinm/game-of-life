export function analyticsInit(id: string) {
  // @ts-ignore
  gtag("js", new Date());

  // @ts-ignore
  gtag("config", id, { anonymize_ip: true });

  // @ts-ignore
  gtag("event", "page_view");
}

export function analyticsPageview(page_location: string) {
  // @ts-ignore
  gtag("event", "page_view", { page_location });
}

window.addEventListener("error", function (error) {
  // @ts-ignore
  gtag("event", "exception", {
    description: `${error.message} at ${error.filename}:${error.lineno}`,
    fatal: false,
  });
});
