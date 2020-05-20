import $ from './miq';
import { GofGameOfLife } from "./components/gameoflife";
import mClass from "./mclass";
import { Shape } from "./components/shape";

export default function () {
  var canvas = $('gof-canvas').first;

  var shape = new Shape(canvas);
  var gameoflife = new GofGameOfLife(canvas);
  var controls = new Controls(canvas, shape, gameoflife);
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

var Controls = mClass(function () {
  var controls;

  return {
    construct: function (canvas, shape, gameoflife) {
      controls = this;
      this.canvas = canvas;
      this.shape = shape;
      this.gameoflife = gameoflife;
      this.started = false;
      this.timer = null;
      this.generation = 0;
      this.generationElement = $('.generation').first;
    },
    public: {
      init: function (shapes) {
        var wheelDy = 0;
        var wheelDrag = 300;
        var shapesSelect = $('#shapes');
        shapes.forEach(function (shape, i) {
          var option = document.createElement('option');
          option.text = shape.name;
          shapesSelect.first.appendChild(option);
        });
        shapesSelect.on('change', function (e) {
          controls.setGeneration(0);
          controls.shape.copy(shapes[shapesSelect.first.selectedIndex].data);
          controls.shape.center();
          controls.shape.redraw();
        });

        $('#next').on('click', function () {
          controls.next();
        });

        $('#size')
          .on('change', sizeListener)
          .on('input', sizeListener);

        function sizeListener() {
          var oldGridSize = controls.canvas.getGridSize();
          var newGridSize = 13 - parseInt($('#size').val());
          var dimension = controls.canvas.getDimension();

          var dx = Math.round((dimension.width / newGridSize - dimension.width / oldGridSize) / 2);
          var dy = Math.round((dimension.height / newGridSize - dimension.height / oldGridSize) / 2);

          controls.shape.offset(dx, dy);
          controls.canvas.setGridSize(newGridSize);
          controls.shape.redraw();
        }

        var speed = $('#speed');
        this.speed = 520 - parseInt(speed.first.value);
        speed.on('change', speedListener);
        speed.on('input', speedListener);

        function speedListener() {
          controls.speed = 520 - parseInt(speed.first.value);
          if (controls.started) {
            controls.animate();
          }
        }

        var startStop = $('#start');
        startStop.on('click', function () {
          controls.started = !controls.started;
          if (controls.started) {
            startStop.first.value = 'Stop';
            controls.animate();
          } else {
            startStop.first.value = 'Start';
            clearInterval(controls.timer);
          }
        });

        this.canvas.action(function (evt) {
          controls.setGeneration(0);
          controls.shape.toggle([evt.cellX, evt.cellY]);
        });
      },

      setGeneration: function (gen) {
        this.generation = gen;
        this.generationElement.innerHTML = gen;
      },

      animate: function () {
        clearInterval(this.timer);
        this.timer = setInterval(function () {
          controls.next();
        }, controls.speed);
      },

      next: function () {
        var shape = this.shape.get();
        shape = this.gameoflife.next(shape);
        this.shape.set(shape);
        this.shape.redraw();
        this.setGeneration(this.generation + 1);
      },
    },
  }
});
