import $ from './miq';
import { GofGameOfLife } from "./components/gameoflife";
import { Shape } from "./components/shape";
import { GofControls } from "./components/controls";
import { GofCanvas } from "./components/canvas";

export default function () {
  const canvas = <GofCanvas>$('gof-canvas').first;
  const controls = <GofControls>$('gof-controls').first;
  const shape = new Shape(canvas);
  const gameoflife = new GofGameOfLife(canvas);

  console.log('controls', controls);

  controls.construct1(canvas, shape, gameoflife);

  controls.init(shape.collection);
  controls.shape.copy(shape.collection[1].data);
  controls.shape.center();
  controls.shape.redraw();

  window.addEventListener('resize', function () {
    canvas.calculateDimensions(canvas.getCanvas());
    shape.redraw();
  });
};

// if (window.navigator.standalone) {
//   document.documentElement.classList.add('standalone');
// }
