import { GofCanvas } from "./canvas";

export class Shape {
  canvas: GofCanvas;
  current: Cell[];
  collection: Collection;

  constructor(canvas: GofCanvas) {
    this.canvas = canvas;
    this.current = [];
    this.collection = [
      {name: "Clear", data: []},
      {name: "Glider", data: [[1, 0], [2, 1], [2, 2], [1, 2], [0, 2]]},
      {name: "Small Exploder", data: [[0, 1], [0, 2], [1, 0], [1, 1], [1, 3], [2, 1], [2, 2]]},
      {
        name: "Exploder",
        data: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [2, 0], [2, 4], [4, 0], [4, 1], [4, 2], [4, 3], [4, 4]],
      },
      {name: "10 Cell Row", data: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0]]},
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
      }
    ];
  }

  get() {
    return this.current;
  }

  set(shape: Cell[]) {
    this.current = shape;
  }

  copy(shape: Cell[]) {
    var shapeCopy = shape.map(function (el) {
      return [el[0], el[1]];
    });
    this.set(shapeCopy);
  }

  redraw() {
    this.canvas.draw(this.current);
  }

  center() {
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
    cells.forEach(function (cell: Cell) {
      cell[0] += shapeLeft;
      cell[1] += shapeTop;
    });
    this.set(cells);
  }

  offset(dx: number, dy: number) {
    this.current.forEach(function (cell: Cell) {
      cell[0] += dx;
      cell[1] += dy;
    });
    this.redraw();
  }

  toggle(cell: Cell) {
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
  }
}


