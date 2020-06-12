import { GofCanvas } from "./web-components/canvas";
import { GofInfo } from "./web-components/info";
import { GofControls } from "./web-components/controls";
import { Shape } from "./components/shape";
import { $ } from 'carbonium';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = <GofCanvas>$('gof-canvas');
  const controls = <GofControls>$('gof-controls');
  const info = <GofInfo>$('gof-info');
  const shape = new Shape();

  const {click$, dimension$} = canvas.getObservers();
  const {redraw$} = shape.getObservers();
  const {newShape$, nextShape$, resize$, size$, info$} = controls.getObservers();

  canvas.setObservers(redraw$, resize$, size$);
  shape.setObservers(size$, newShape$, nextShape$, resize$, dimension$, click$);
  info.setObservers(info$);
  controls.setObservers(redraw$, click$);

  if (window.navigator.standalone) {
    document.documentElement.classList.add('standalone');
  }

  // Prevent tree shaking of web components
  if (GofCanvas && GofInfo && GofControls) {
  }
});

declare global {
  interface Navigator {
    standalone: boolean;
  }
}
