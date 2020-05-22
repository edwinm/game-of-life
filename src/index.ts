import { GofCanvas } from "./components/canvas";
import { GofInfo } from "./components/info";
import { GofGameOfLife } from "./components/gameoflife";
import { GofControls } from "./components/controls";
import { Shape } from "./components/shape";
import $ from './lib/miq';

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


import {Eventer} from "./lib/Eventer";

const test1$ = new Eventer<string>();

const test3$ = test1$.pipe((val) => `[${val}]`).pipe((val) => ({a1:val}));

test1$.subscribe((value) => {
  console.log(`event1 value ${value}`);
})

test3$.subscribe((value) => {
  console.log(`event3 value`, value );
})

test1$.dispatch("a1");

test1$.subscribe(test2)

function test2(value: string) {
  console.log(`event2 value ${value}`);
}

(async function() {
  setTimeout(
    () =>
      test1$.dispatch("a2"),
    1000);

  console.log('await', await test1$.promise());
})();


test1$.unsubscribe(test2);

test1$.dispatch("a3");
