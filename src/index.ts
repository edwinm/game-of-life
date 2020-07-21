import { $ } from "carbonium";
import { Cuprum, fromEvent } from "cuprum";

import { GofCanvas } from "./web-components/canvas";
import { GofInfo } from "./web-components/info";
import { GofControls } from "./web-components/controls";
import { Shape } from "./components/shape";
import { routeListener } from "./components/routelistener";
import { GofButton } from "./web-components/button";

fromEvent(document, "DOMContentLoaded").subscribe(() => {
  const canvas = <GofCanvas>$("gof-canvas");
  const controls = <GofControls>$("gof-controls");
  const info = <GofInfo>$("#info");
  const shape = new Shape();
  const newPattern$ = new Cuprum<string>();

  const { infoIsOpen$ } = info.getObservers();

  const {
    click$,
    dimension$,
    offset$,
    initialPattern$,
  } = canvas.getObservers();

  const { redraw$ } = shape.getObservers();

  const {
    nextShape$,
    resize$,
    size$,
    reset$,
    clear$,
  } = controls.getObservers();

  canvas.setObservers(redraw$, resize$, size$);

  shape.setObservers(
    initialPattern$,
    newPattern$,
    nextShape$,
    dimension$,
    click$,
    offset$,
    reset$,
    clear$
  );

  controls.setObservers(redraw$, click$, infoIsOpen$, newPattern$);

  routeListener(newPattern$);

  const userAgent = navigator.userAgent;
  if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i)) {
    $("main").classList.add("safari");
  }

  navigator.serviceWorker.register("/service-worker.js");
});

// Prevent tree shaking of web components
if (GofCanvas && GofInfo && GofControls && GofButton) {
}
