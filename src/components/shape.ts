import { Cuprum, merge, Observable } from "cuprum";
import { Draw } from "../models/draw";

export class Shape {
  private current = <Cell[]>[];
  private last = <Cell[]>[];
  private redraw$ = new Cuprum<Draw>();

  getObservers() {
    return { redraw$: this.redraw$.observable() };
  }

  setObservers(
    initialPattern$: Observable<string>,
    newPattern$: Observable<string>,
    nextShape$: Observable<Cell[]>,
    dimension$: Observable<Dimension>,
    toggle$: Observable<Cell>,
    offset$: Observable<Offset>,
    reset$: Observable<void>,
    clear$: Observable<void>
  ) {
    dimension$.subscribe((newDimension, oldDimension) => {
      this.setNewDimension(newDimension, oldDimension);
    });

    merge(initialPattern$, newPattern$).subscribe((initialPattern) => {
      this.current = this.patternToShape(initialPattern);
      this.last = [...this.current];
      const dimension = dimension$.value();
      if (dimension) {
        this.center(dimension);
      }
      this.redraw(true);
    });

    offset$.subscribe((offset) => {
      this.setOffset(offset);
      this.redraw();
    });

    nextShape$.subscribe((shape) => {
      this.current = shape;
      this.redraw();
    });

    toggle$.subscribe((event) => {
      this.toggle(event);
    });

    reset$.subscribe(() => {
      this.current = [...this.last];
      this.redraw();
    });

    clear$.subscribe(() => {
      this.current = [];
      this.last = [];
      this.redraw();
    });
  }

  private redraw(isNew = false) {
    this.redraw$.dispatch({ pattern: this.current, isNew });
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
    this.last = [...this.current];
  }

  private setNewDimension(dimension: Dimension, oldDimension: Dimension) {
    if (
      oldDimension &&
      dimension.width != oldDimension.width &&
      dimension.height != oldDimension.height
    ) {
      this.setOffset({
        x: Math.round((dimension.width - oldDimension.width) / 2.001),
        y: Math.round((dimension.height - oldDimension.height) / 2.001),
      });
    }
    this.redraw();
  }

  private setOffset(offset: Offset) {
    this.current.forEach((cell: Cell) => {
      cell.x += offset.x;
      cell.y += offset.y;
    });
  }

  private toggle(toggleCell: Cell) {
    const index = this.current.findIndex(
      (cell) => cell.x == toggleCell.x && cell.y == toggleCell.y
    );
    if (index == -1) {
      this.current.push(toggleCell);
    } else {
      this.current.splice(index, 1);
    }
    this.last = [...this.current];
    this.redraw();
  }

  private patternToShape(pattern: string): Cell[] {
    let cells = <Cell[]>[];

    const lines = pattern.split(/\n/);
    if (lines[0].trim() == "") {
      lines.shift(); // Skip first empty line
    }

    for (let y = 0; y < lines.length; y++) {
      for (let x = 0; x < lines[y].length; x++) {
        const line = lines[y].trim();
        if (line[x] == "O") {
          cells.push({ x, y });
        }
      }
    }
    return cells;
  }
}
