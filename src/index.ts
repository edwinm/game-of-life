import { GofCanvas } from "./components/canvas";
import { GofInfo } from "./components/info";
import { GofGameOfLife } from "./components/gameoflife";
import { GofControls } from "./components/controls";
import $ from './miq';
import { Shape } from "./components/shape";

$(function () {
  const canvas = <GofCanvas>$('gof-canvas').first;
  const controls = <GofControls>$('gof-controls').first;
  const shape = new Shape(canvas);
  const gameoflife = new GofGameOfLife(canvas);

  controls.construct(canvas, shape, gameoflife, <GofInfo>$('gof-info').first);

  controls.init(shape.collection);
  controls.shape.copy(shape.collection[1].data);
  controls.shape.center();
  controls.shape.redraw();

  window.addEventListener('resize', function () {
    canvas.calculateDimensions(canvas.getCanvas());
    shape.redraw();
  });

  // if (window.navigator.standalone) {
  //   document.documentElement.classList.add('standalone');
  // }
});
console.log(GofCanvas && GofInfo && GofControls && "Game of Life");
