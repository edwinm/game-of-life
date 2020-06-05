import { GofCanvas } from "./components/canvas";
import { GofInfo } from "./components/info";
import { GofGameOfLife } from "./components/gameoflife";
import { GofControls } from "./components/controls";
import { Shape } from "./components/shape";
import { $ } from 'carbonium';
import { fromEvent } from "cuprum";

document.addEventListener('DOMContentLoaded', () => {
  const canvas = <GofCanvas>$('gof-canvas');
  const controls = <GofControls>$('gof-controls');
  const shape = new Shape(canvas);
  const gameoflife = new GofGameOfLife(canvas);
  const info = <GofInfo>$('gof-info');

  controls.construct(canvas, shape, gameoflife, info);

  const resize$ = fromEvent(window, 'resize');

  controls.init();
  canvas.init(controls.shape.redraw$, resize$);
  shape.init(controls.size$);

  shape.copy(controls.collection[1].data);
  shape.center();
  shape.redraw();

  shape.setResize(resize$);

  // if (window.navigator.standalone) {
  //   document.documentElement.classList.add('standalone');
  // }
  console.log(GofCanvas && GofInfo && GofControls && "Game of Life");
});
