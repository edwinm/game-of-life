$(function () {
  var canvasElement = $('gof-canvas');
  var infoButton = $('#info');
  var infoSection = $('.info');

  var info = new Info(infoButton.first, infoSection.first);
  var canvas = new Canvas(canvasElement.first.getCanvas());
  var shape = new Shape(canvas);
  var gameoflife = new GameOfLife(canvas);
  var controls = new Controls(canvas, shape, gameoflife);
  controls.init(shape.collection);
  controls.shape.copy(shape.collection[1].data);
  controls.shape.center();
  controls.shape.redraw();

  window.addEventListener('resize', function () {
    canvas.calculateDimensions(canvasElement.first.getCanvas());
    shape.redraw();
  });
});

if (window.navigator.standalone) {
  document.documentElement.classList.add('standalone');
}


var Info = mClass(function () {
  var visible = true;
  var infoElement;

  return {
    construct: function (button, section) {
      infoElement = this;
      this.section = section;

      button.addEventListener('click', function () {
        infoElement.toggle();
        $('body').addClass('whitebox');
      });

      $($(section).find('[data-close]')).on('click', function () {
        infoElement.close();
        $('body').removeClass('whitebox');
      });

      $('body').on('keyup', function (e) {
        if (e.key == 'Escape') {
          infoElement.close();
          $('body').removeClass('whitebox');
        }
      });

      $('body').on('click', function (e) {
        if (e.target.classList.contains('whitebox')) {
          infoElement.close();
          $('body').removeClass('whitebox');
        }
      });
    },
    public: {
      close: function () {
        visible = false;
        $(this.section).addClass('hide');
      },
      toggle: function () {
        visible = !visible;
        if (visible) {
          $(this.section).removeClass('hide');
        } else {
          $(this.section).addClass('hide');
        }
      },
    },
  }
});

var Canvas = mClass(function () {
  var canvas;

  return {
    construct: function (canvasDomElement) {
      canvas = this;
      if (!canvasDomElement.getContext) {
        return;
      }

      try {
        let rect = canvasDomElement.getBoundingClientRect();
        this.offscreen = new OffscreenCanvas(rect.width, rect.height);
        this.ctx = this.offscreen.getContext('2d', {alpha: false});
        this.ctxOffscreen = canvasDomElement.getContext('bitmaprenderer');
      } catch(e) {
        console.error('OffscreenCanvas not supported or can\'t get 2d context of off-screen canvas.');
        this.ctx = canvasDomElement.getContext('2d', {alpha: false});
      }

      this.obj = $(canvasDomElement);
      this.setGridSize(11);
      this.calculateDimensions(canvasDomElement);
    },
    public: {
      draw: function (cells) {
        var ctx = this.ctx;
        var size = this.cellSize;

        ctx.fillStyle = "#7e7e7e";
        ctx.lineWidth = 1;
        ctx.fillRect(0, 0, this.pixelWidth, this.pixelHeight);
        ctx.strokeStyle = "#999";

        for (var n = this.cellSize; n < this.pixelWidth; n += this.cellSize) {
          ctx.beginPath();
          ctx.moveTo(n + .5, 0);
          ctx.lineTo(n + .5, this.pixelHeight);
          ctx.stroke();
        }
        for (n = this.cellSize; n < this.pixelHeight; n += this.cellSize) {
          ctx.beginPath();
          ctx.moveTo(0, n + .5);
          ctx.lineTo(this.pixelWidth, n + .5);
          ctx.stroke();
        }

        ctx.fillStyle = "yellow";
        ctx.lineWidth = 1;
        cells.forEach(function (cell, i) {
          ctx.fillRect(cell[0] * size + 1, cell[1] * size + 1, size - 1, size - 1);
        });

        if (this.ctxOffscreen) {
          var bitmap = this.offscreen.transferToImageBitmap();
          this.ctxOffscreen.transferFromImageBitmap(bitmap);
        }
      },

      calculateDimensions(canvasDomElement) {
        let rect = canvasDomElement.getBoundingClientRect();
        let width = document.documentElement.clientWidth;
        let height = rect.height;
        let widthMod = width % this.cellSize;
        width = width - widthMod;
        height = height - height % this.cellSize;
        $(canvasDomElement).css('left', `${widthMod / 2}px`);
        this.pixelWidth = canvasDomElement.width = width;
        this.pixelHeight = canvasDomElement.height = height;
        this.width = width / this.cellSize;
        this.height = height / this.cellSize;
      },

      click: function (fn) {
        this.obj.on('click', function (evt) {
          var rect = canvas.obj.first.getBoundingClientRect();
          var left = Math.floor(rect.left + window.pageXOffset);
          var top = Math.floor(rect.top + window.pageYOffset);
          var cellSize = canvas.cellSize;
          var clickEvent = {};
          clickEvent.cellX = Math.floor((evt.clientX - left + window.pageXOffset) / cellSize);
          clickEvent.cellY = Math.floor((evt.clientY - top + window.pageYOffset - 5) / cellSize); // TODO: Where's offset coming from?
          fn(clickEvent);
        });
      },

      getDimension: function () {
        return { width: this.pixelWidth, height: this.pixelHeight };
      },
      getGridSize: function () {
        return this.cellSize;
      },
      setGridSize: function (size) {
        this.cellSize = size;
        this.width = Math.floor(this.pixelWidth / this.cellSize);
        this.height = Math.floor(this.pixelHeight / this.cellSize);
      },
    },
  }
});


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
          index = -1;
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
          var newGridSize = 13 - parseInt(size.value);
          var dimension = controls.canvas.getDimension();

          var dx = Math.round((dimension.width / newGridSize - dimension.width / oldGridSize) / 2);
          var dy = Math.round((dimension.height / newGridSize - dimension.height / oldGridSize) / 2);

          controls.shape.offset(dx, dy);
          controls.canvas.setGridSize(newGridSize);
          controls.shape.redraw();
        }

        $('#canvas-div').on('wheel', function (evt) {
          wheelDy += parseInt(evt.deltaY);
          if (wheelDy > wheelDrag) {
            var gridSize = parseInt(size.value);
            if (gridSize > parseInt(size.getAttribute('min'))) {
              size.value = gridSize - 1;
            }
            wheelDy -= wheelDrag;
          } else if (wheelDy < -wheelDrag) {
            var gridSize = parseInt(size.value);
            if (gridSize < parseInt(size.getAttribute('max'))) {
              size.value = gridSize + 1;
            }
            wheelDy += wheelDrag;
          }
          evt.preventDefault();
          sizeListener();
        });

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

        this.canvas.click(function (evt) {
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

var GameOfLife = mClass(function () {
  return {
    public: {
      next: function (shape) {
        var neighbours = {};
        var newShape = [];
        shape.forEach(function (cell, i) {
          var index;

          index = 'c' + (cell[0] - 1) + ',' + (cell[1] - 1);
          if (neighbours[index]) {
            neighbours[index].n++;
          } else {
            neighbours[index] = { n: 1, cell: [cell[0] - 1, cell[1] - 1] };
          }
          index = 'c' + (cell[0]) + ',' + (cell[1] - 1);
          if (neighbours[index]) {
            neighbours[index].n++;
          } else {
            neighbours[index] = { n: 1, cell: [cell[0], cell[1] - 1] };
          }
          index = 'c' + (cell[0] + 1) + ',' + (cell[1] - 1);
          if (neighbours[index]) {
            neighbours[index].n++;
          } else {
            neighbours[index] = { n: 1, cell: [cell[0] + 1, cell[1] - 1] };
          }
          index = 'c' + (cell[0] - 1) + ',' + (cell[1]);
          if (neighbours[index]) {
            neighbours[index].n++;
          } else {
            neighbours[index] = { n: 1, cell: [cell[0] - 1, cell[1]] };
          }
          index = 'c' + (cell[0] + 1) + ',' + (cell[1]);
          if (neighbours[index]) {
            neighbours[index].n++;
          } else {
            neighbours[index] = { n: 1, cell: [cell[0] + 1, cell[1]] };
          }
          index = 'c' + (cell[0] - 1) + ',' + (cell[1] + 1);
          if (neighbours[index]) {
            neighbours[index].n++;
          } else {
            neighbours[index] = { n: 1, cell: [cell[0] - 1, cell[1] + 1] };
          }
          index = 'c' + (cell[0]) + ',' + (cell[1] + 1);
          if (neighbours[index]) {
            neighbours[index].n++;
          } else {
            neighbours[index] = { n: 1, cell: [cell[0], cell[1] + 1] };
          }
          index = 'c' + (cell[0] + 1) + ',' + (cell[1] + 1);
          if (neighbours[index]) {
            neighbours[index].n++;
          } else {
            neighbours[index] = { n: 1, cell: [cell[0] + 1, cell[1] + 1] };
          }
        });
        shape.forEach(function (cell, i) {
          index = 'c' + cell[0] + ',' + cell[1];
          if (neighbours[index]) {
            neighbours[index].populated = true;
          }
        });

        for (index in neighbours) {
          if ((neighbours[index].n == 2 && neighbours[index].populated) || neighbours[index].n == 3) {
            newShape.push(neighbours[index].cell);
          }
        }
        return newShape;
      },
    },
  };
});
