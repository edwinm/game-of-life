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
    clear$: Observable<void>,
    size$: Observable<number>,
    rotate$: Observable<Event>
  ) {
    dimension$.subscribe(() => {
      this.redraw();
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
      this.center(dimension$.value());
      this.redraw();
    });

    rotate$.subscribe(() => {
      this.center(dimension$.value());
      this.redraw();
    });

    clear$.subscribe(() => {
      this.current = [];
      this.last = [];
      this.redraw();
    });

    size$.subscribe((newGridSize, oldGridSize) => {
      if (oldGridSize == undefined || newGridSize == oldGridSize) {
        return;
      }

      const dimension = dimension$.value();
      this.setOffset({
        x: Math.round(
          (dimension.width - (dimension.width * newGridSize) / oldGridSize) / 2
        ),
        y: Math.round(
          (dimension.height - (dimension.height * newGridSize) / oldGridSize) /
            2
        ),
      });
      this.redraw();
    });
  }

  private setOffset(offset: Offset) {
    this.current.forEach((cell: Cell) => {
      cell.x += offset.x;
      cell.y += offset.y;
    });
  }

  private redraw(isNew = false) {
    this.redraw$.dispatch({ pattern: this.current, isNew });
  }

  private center(dimension: Dimension) {
    let shapeLeft = Number.MAX_VALUE;
    let shapeRight = 0;
    let shapeTop = Number.MAX_VALUE;
    let shapeBottom = 0;
    this.current.forEach((cell) => {
      if (cell.x > shapeRight) {
        shapeRight = cell.x;
      }
      if (cell.x < shapeLeft) {
        shapeLeft = cell.x;
      }
      if (cell.y > shapeBottom) {
        shapeBottom = cell.y;
      }
      if (cell.y < shapeTop) {
        shapeTop = cell.y;
      }
    });

    const shapeMoveRight = Math.round(
      dimension.width / 2 - shapeLeft - (shapeRight - shapeLeft) / 2
    );
    const shapeMoveDown = Math.round(
      dimension.height / 2 - shapeTop - (shapeBottom - shapeTop) / 2
    );
    this.current.forEach((cell: Cell) => {
      cell.x += shapeMoveRight;
      cell.y += shapeMoveDown;
    });
    this.last = [...this.current];
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
