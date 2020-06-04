import { GofCanvas } from "./components/canvas";
import { GofInfo } from "./components/info";
import { GofGameOfLife } from "./components/gameoflife";
import { GofControls } from "./components/controls";
import { Shape } from "./components/shape";
import { $ } from 'carbonium';
import { Cuprum, fromEvent } from "cuprum";

document.addEventListener('DOMContentLoaded', () => {
  const canvas = <GofCanvas>$('gof-canvas');
  const controls = <GofControls>$('gof-controls');
  const shape = new Shape(canvas);
  const gameoflife = new GofGameOfLife(canvas);
  const info = <GofInfo>$('gof-info');

  controls.construct(canvas, shape, gameoflife, info);
  
  controls.init(shape.collection);
  controls.shape.copy(shape.collection[1].data);
  controls.shape.center();
  controls.shape.redraw();

  canvas.setRedraw(controls.shape.redraw$);

  const resize$ = fromEvent(window, 'resize');
  canvas.setResize(resize$);
  controls.shape.setResize(resize$);

  // if (window.navigator.standalone) {
  //   document.documentElement.classList.add('standalone');
  // }
  console.log(GofCanvas && GofInfo && GofControls && "Game of Life");
});
