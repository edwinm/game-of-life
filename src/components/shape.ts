import { Cuprum, Observable } from "cuprum";

export class Shape {
  private current = <Cell[]>[];
  private redraw$ = new Cuprum<Cell[]>();

  getObservers() {
    return { redraw$: this.redraw$.observable() };
  }

  setObservers(
    newShape$: Observable<Cell[]>,
    nextShape$: Observable<Cell[]>,
    dimension$: Observable<Dimension>,
    toggle$: Observable<Cell>,
    offset$: Observable<Offset>
  ) {
    dimension$.subscribe((newDimension, oldDimension) => {
      this.setNewDimension(newDimension, oldDimension);
    });

    offset$.subscribe((offset) => {
      this.setOffset(offset);
    });

    newShape$.subscribe((shape) => {
      this.current = shape.map((cell) => ({ x: cell.x, y: cell.y }));
      this.center(dimension$.value());
      this.redraw();
    });

    nextShape$.subscribe((shape) => {
      this.current = shape;
      this.redraw();
    });

    toggle$.subscribe((event) => {
      this.toggle(event);
    });
  }

  private redraw() {
    this.redraw$.dispatch(this.current);
  }

  private center(dimension: Dimension) {
    let shapeWidth = 0;
    let shapeHeight = 0;
    this.current.forEach((cell) => {
      if (cell.x > shapeWidth) {
        shapeWidth = cell.x;
      }
      if (cell.y > shapeHeight) {
        shapeHeight = cell.y;
      }
    });

    const shapeLeft = Math.round((dimension.width - shapeWidth) / 2);
    const shapeTop = Math.round((dimension.height - shapeHeight) / 2);
    this.current.forEach((cell: Cell) => {
      cell.x += shapeLeft;
      cell.y += shapeTop;
    });
  }

  private setNewDimension(dimension: Dimension, oldDimension: Dimension) {
    if (
      oldDimension &&
      dimension.width != oldDimension.width &&
      dimension.height != oldDimension.height
    ) {
      const dx = Math.round((dimension.width - oldDimension.width) / 2.001);
      const dy = Math.round((dimension.height - oldDimension.height) / 2.001);

      this.current.forEach((cell: Cell) => {
        cell.x += dx;
        cell.y += dy;
      });
    }
    this.redraw();
  }

  private setOffset(offset: Offset) {
    this.current.forEach((cell: Cell) => {
      cell.x += offset.x;
      cell.y += offset.y;
    });
    this.redraw();
  }

  private toggle(toggleCell: Cell) {
    const index = this.current.findIndex(
      (cell, index) => cell.x == toggleCell.x && cell.y == toggleCell.y
    );
    if (index == -1) {
      this.current.push(toggleCell);
    } else {
      this.current.splice(index, 1);
    }
    this.redraw();
  }
}
