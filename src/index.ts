import { GofCanvas } from "./components/canvas";
import { GofInfo } from "./components/info";
import { GofControls } from "./components/controls";
import { Shape } from "./components/shape";
import { $ } from 'carbonium';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = <GofCanvas>$('gof-canvas');
  const controls = <GofControls>$('gof-controls');
  const info = <GofInfo>$('gof-info');
  const shape = new Shape();

  controls.init(shape.redraw$, canvas.click$);
  canvas.init(shape.redraw$, controls.resize$, controls.size$);
  shape.init(controls.size$, controls.newShape$, controls.nextShape$, controls.resize$, canvas.dimension$, canvas.click$);
  info.init(controls.info$);

  // TODO
  // if (window.navigator.standalone) {
  //   document.documentElement.classList.add('standalone');
  // }

  // TODO
  console.log(GofCanvas && GofInfo && GofControls && "Game of Life");
});
