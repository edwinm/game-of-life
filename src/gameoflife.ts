import $ from './miq';
import { GofGameOfLife } from "./components/gameoflife";
import mClass from "./mclass";

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

var Shape = mClass(function () {
  return {
    construct: function (canvas) {
      this.canvas = canvas;
      this.current = [];
      this.collection = [
        { name: "Clear", data: [] },
        { name: "Glider", data: [[1, 0], [2, 1], [2, 2], [1, 2], [0, 2]] },
        { name: "Small Exploder", data: [[0, 1], [0, 2], [1, 0], [1, 1], [1, 3], [2, 1], [2, 2]] },
        {
          name: "Exploder",
          data: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [2, 0], [2, 4], [4, 0], [4, 1], [4, 2], [4, 3], [4, 4]],
        },
        { name: "10 Cell Row", data: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0]] },
        {
          name: "Lightweight spaceship",
          data: [[0, 1], [0, 3], [1, 0], [2, 0], [3, 0], [3, 3], [4, 0], [4, 1], [4, 2]],
        },
        {
          name: "Tumbler",
          data: [[0, 3], [0, 4], [0, 5], [1, 0], [1, 1], [1, 5], [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [5, 0], [5, 1], [5, 5], [6, 3], [6, 4], [6, 5]],
        },
        {
          name: "Gosper Glider Gun",
          data: [[0, 2], [0, 3], [1, 2], [1, 3], [8, 3], [8, 4], [9, 2], [9, 4], [10, 2], [10, 3], [16, 4], [16, 5], [16, 6], [17, 4], [18, 5], [22, 1], [22, 2], [23, 0], [23, 2], [24, 0], [24, 1], [24, 12], [24, 13], [25, 12], [25, 14], [26, 12], [34, 0], [34, 1], [35, 0], [35, 1], [35, 7], [35, 8], [35, 9], [36, 7], [37, 8]],
        },
      ];
    },
    public: {
      get: function () {
        return this.current;
      },
      set: function (shape) {
        this.current = shape;
      },
      copy: function (shape) {
        var shapeCopy = shape.map(function (el) {
          return [el[0], el[1]];
        });
        this.set(shapeCopy);
      },
      redraw: function () {
        this.canvas.draw(this.current);
      },
      center: function () {
        var cells = this.current;
        var shapeWidth = 0;
        var shapeHeight = 0;
        cells.forEach(function (cell, i) {
          if (cell[0] > shapeWidth) {
            shapeWidth = cell[0];
          }
          if (cell[1] > shapeHeight) {
            shapeHeight = cell[1];
          }
        });

        var shapeLeft = Math.floor((this.canvas.width - shapeWidth) / 2);
        var shapeTop = Math.floor((this.canvas.height - shapeHeight) / 2);
        cells.forEach(function (cell) {
          cell[0] += shapeLeft;
          cell[1] += shapeTop;
        });
        this.set(cells);
      },
      offset: function (dx, dy) {
        this.current.forEach(function (cell) {
          cell[0] += dx;
          cell[1] += dy;
        });
        this.redraw();
      },
      toggle: function (cell) {
        var n;
        var shape = this;
        if ((n = cellIndex(cell)) == -1) {
          this.current.push(cell);
        } else {
          this.current.splice(n, 1);
        }
        this.set(shape.current);
        this.redraw();

        function cellIndex(cell) {
          let index = -1;
          shape.current.forEach(function (c, i) {
            if (c[0] == cell[0] && c[1] == cell[1]) {
              index = i;
              return false;
            }
          });
          return index;
        }
      },
    },
  };
});

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
