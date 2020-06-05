import { combine, Cuprum } from "cuprum";

export class Shape {
  current: Cell[];
  redraw$ = new Cuprum<Cell[]>();

  constructor() {
    this.current = [];
  }

  init(size$: Cuprum<number>, newShape$: Cuprum<Cell[]>, nextShape$: Cuprum<Cell[]>, resize$: Cuprum<Event>, dimension$: Cuprum<Dimension>, toggle$:Cuprum<ClickEvent>) {
    dimension$.subscribe((newDimension) => {
      this.offset(newDimension);
    });

    combine(newShape$, dimension$).subscribe(([shape, dimension]) => {
      this.copy(shape);
      this.center(dimension);
      this.redraw();
    });

    nextShape$.subscribe((shape) => {
      this.set(shape);
      this.redraw();
    });

    resize$.subscribe(() => {
      this.redraw();
    });

    toggle$.subscribe((event) => {
      this.toggle([event.cellX, event.cellY]);
    });
  }

  // get() {
  //   return this.current;
  // }

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
    this.redraw$.dispatch(this.current);
  }

  center(dimension: Dimension) {
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

    var shapeLeft = Math.floor((dimension.width - shapeWidth) / 2);
    var shapeTop = Math.floor((dimension.height - shapeHeight) / 2);
    cells.forEach(function (cell: Cell) {
      cell[0] += shapeLeft;
      cell[1] += shapeTop;
    });
    this.set(cells);
  }

  offset(dimension) {
    const dx = Math.round((dimension.width - dimension.width) / 2);
    const dy = Math.round((dimension.height - dimension.height) / 2);

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


