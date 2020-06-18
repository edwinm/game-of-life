import { GofCanvas } from "./web-components/canvas";
import { GofInfo } from "./web-components/info";
import { GofControls } from "./web-components/controls";
import { Shape } from "./components/shape";
import { $ } from 'carbonium';
import { GofButton } from "./web-components/button";
import router from "./components/router";

document.addEventListener('DOMContentLoaded', () => {
  const canvas = <GofCanvas>$('gof-canvas');
  const controls = <GofControls>$('gof-controls');
  const info = <GofInfo>$('gof-info');
  const shape = new Shape();

  const {infoIsOpen$} = info.getObservers();
  const {click$, dimension$, offset$} = canvas.getObservers();
  const {redraw$} = shape.getObservers();
  const {newShape$, nextShape$, resize$, size$} = controls.getObservers();

  canvas.setObservers(redraw$, resize$, size$);
  shape.setObservers(newShape$, nextShape$, dimension$, click$, offset$);
  controls.setObservers(redraw$, click$, infoIsOpen$);

  routeListener();

  // Prevent tree shaking of web components
  if (GofCanvas && GofInfo && GofControls && GofButton) {
  }

  function routeListener() {
    router.observable$.subscribe((url, oldUrl) => {
      go(oldUrl, false);
      go(url, true);
    });
  }

  function go(url: string, enter: boolean) {
    switch(url) {
      case "/info":
        if (enter) {
          info.setAttribute('open', '');
        } else {
          info.removeAttribute('open');
        }
        break;
    }
  }
});


