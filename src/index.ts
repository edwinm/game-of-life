import { $ } from "carbonium";
import { Cuprum } from "cuprum";

import { GolCanvas } from "./web-components/canvas";
import { GolInfo } from "./web-components/info";
import { GolControls } from "./web-components/controls";
import { Shape } from "./components/shape";
import { routeListener } from "./components/routelistener";
import { GolButton } from "./web-components/button";

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

  const { nextShape$, resize$, size$, reset$, clear$, rotate$, shift$ } =
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
    rotate$,
    shift$
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
