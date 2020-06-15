import { GofCanvas } from "./web-components/canvas";
import { GofInfo } from "./web-components/info";
import { GofControls } from "./web-components/controls";
import { Shape } from "./components/shape";
import { $ } from 'carbonium';
import { GofButton } from "./web-components/button";

document.addEventListener('DOMContentLoaded', () => {
  const canvas = <GofCanvas>$('gof-canvas');
  const controls = <GofControls>$('gof-controls');
  const info = <GofInfo>$('gof-info');
  const shape = new Shape();

  const {infoIsOpen$} = info.getObservers();
  const {click$, dimension$} = canvas.getObservers();
  const {redraw$} = shape.getObservers();
  const {newShape$, nextShape$, resize$, size$} = controls.getObservers();

  canvas.setObservers(redraw$, resize$, size$);
  shape.setObservers(size$, newShape$, nextShape$, resize$, dimension$, click$);
  controls.setObservers(redraw$, click$, infoIsOpen$);

  // Prevent tree shaking of web components
  if (GofCanvas && GofInfo && GofControls && GofButton) {
  }
});
