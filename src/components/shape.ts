import { combine, Cuprum } from "cuprum";

export class Shape {
  current: Cell[];
  redraw$ = new Cuprum<Cell[]>();

  constructor() {
    this.current = [];
  }

  init(size$: Cuprum<number>, newShape$: Cuprum<Cell[]>, nextShape$: Cuprum<Cell[]>, resize$: Cuprum<Event>, dimension$: Cuprum<Dimension>, toggle$: Cuprum<ClickEvent>) {
    dimension$.subscribe((newDimension) => {
      this.offset(newDimension);
    });

    combine(newShape$, dimension$).subscribe(([shape, dimension]) => {
      this.copy(shape);
      this.center(dimension);
      this.redraw();
    });

    nextShape$.subscribe((shape) => {
      this.current = shape;
      this.redraw();
    });

    resize$.subscribe(() => {
      this.redraw();
    });

    toggle$.subscribe((event) => {
      this.toggle([event.cellX, event.cellY]);
    });
  }

  copy(shape: Cell[]) {
    const shapeCopy = shape.map(function (el) {
      return [el[0], el[1]];
    });
    this.current = shapeCopy;
  }

  redraw() {
    this.redraw$.dispatch(this.current);
  }

  center(dimension: Dimension) {
    let shapeWidth = 0;
    let shapeHeight = 0;
    this.current.forEach((cell, i) => {
      if (cell[0] > shapeWidth) {
        shapeWidth = cell[0];
      }
      if (cell[1] > shapeHeight) {
        shapeHeight = cell[1];
      }
    });

    const shapeLeft = Math.floor((dimension.width - shapeWidth) / 2);
    const shapeTop = Math.floor((dimension.height - shapeHeight) / 2);
    this.current.forEach((cell: Cell) => {
      cell[0] += shapeLeft;
      cell[1] += shapeTop;
    });
  }

  offset(dimension: Dimension) {
    const dx = Math.round((dimension.width - dimension.width) / 2);
    const dy = Math.round((dimension.height - dimension.height) / 2);

    this.current.forEach((cell: Cell) => {
      cell[0] += dx;
      cell[1] += dy;
    });
    this.redraw();
  }

  toggle(toggleCell: Cell) {
    const index = this.current.findIndex(
      (cell, index) => cell[0] == toggleCell[0] && cell[1] == toggleCell[1]
    );
    if (index == -1) {
      this.current.push(toggleCell);
    } else {
      this.current.splice(index, 1);
    }
    this.redraw();
  }
}


