import { $ } from "carbonium";
import { Cuprum } from "cuprum";

import { GolCanvas } from "./web-components/canvas";
import { GolInfo } from "./web-components/info";
import { GolControls } from "./web-components/controls";
import { Shape } from "./components/shape";
import { routeListener } from "./components/routelistener";
import { GolButton } from "./web-components/button";
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "https://ba196a3eefba43bb9747fdf793d32776@o224348.ingest.us.sentry.io/5373220",
});

setTimeout(() => {
  Sentry.metrics.count("lang", 1, {
    attributes: {
      version: "1.0.0",
      navigatorLanguage: navigator.language,
      topLanguage: navigator.languages?.[0],
      start: (
        document
          .querySelector("gol-controls")
          ?.shadowRoot.getElementById("start")
          ?.shadowRoot.querySelector("slot[class=visible]") as HTMLSlotElement
      )?.assignedElements()?.[0].textContent,
      clear: (
        document
          .querySelector("gol-controls")
          ?.shadowRoot.getElementById("clear")
          ?.shadowRoot.querySelector("slot[class=visible]") as HTMLSlotElement
      )?.assignedElements()?.[0].textContent,
    },
  });
}, 500);

document.addEventListener("DOMContentLoaded", () => {
  const canvas = <GolCanvas>$("gol-canvas");
  const controls = <GolControls>$("gol-controls");
  const info = <GolInfo>$("#info");
  const shape = new Shape();
  const newPattern$ = new Cuprum<string>();

  const { infoIsOpen$ } = info.getObservers();

  const { click$, dimension$, offset$, initialPattern$, zoom$ } =
    canvas.getObservers();

  const { redraw$ } = shape.getObservers();

  const { nextShape$, resize$, size$, reset$, clear$, rotate$ } =
    controls.getObservers();

  canvas.setObservers(redraw$, resize$, size$);

  shape.setObservers(
    initialPattern$,
    newPattern$,
    nextShape$,
    dimension$,
    click$,
    offset$,
    reset$,
    clear$,
    size$,
    rotate$
  );

  controls.setObservers(redraw$, click$, infoIsOpen$, newPattern$, zoom$);

  routeListener(newPattern$);

  try {
    navigator.serviceWorker.register("/service-worker.js");
  } catch (e) {}
});

// Prevent tree shaking of web components
if (GolCanvas && GolInfo && GolControls && GolButton) {
}
