interface Neighbours {
  neighbours: number;
  cell: Cell;
  populated: boolean;
}

export function gofNext(shape: Cell[]) {
  console.log("obsolete");
  return;

  let neighbourCells = <Neighbours[]>[];
  let newShape = <Cell[]>[];

  shape.forEach((cell) => {
    let index: string;

    index = `${cell.x - 1},${cell.y - 1}`;
    if (neighbourCells[index]) {
      neighbourCells[index].neighbours++;
    } else {
      neighbourCells[index] = {
        neighbours: 1,
        cell: { x: cell.x - 1, y: cell.y - 1 },
      };
    }
    index = `${cell.x},${cell.y - 1}`;
    if (neighbourCells[index]) {
      neighbourCells[index].neighbours++;
    } else {
      neighbourCells[index] = {
        neighbours: 1,
        cell: { x: cell.x, y: cell.y - 1 },
      };
    }
    index = `${cell.x + 1},${cell.y - 1}`;
    if (neighbourCells[index]) {
      neighbourCells[index].neighbours++;
    } else {
      neighbourCells[index] = {
        neighbours: 1,
        cell: { x: cell.x + 1, y: cell.y - 1 },
      };
    }
    index = `${cell.x - 1},${cell.y}`;
    if (neighbourCells[index]) {
      neighbourCells[index].neighbours++;
    } else {
      neighbourCells[index] = {
        neighbours: 1,
        cell: { x: cell.x - 1, y: cell.y },
      };
    }
    index = `${cell.x + 1},${cell.y}`;
    if (neighbourCells[index]) {
      neighbourCells[index].neighbours++;
    } else {
      neighbourCells[index] = {
        neighbours: 1,
        cell: { x: cell.x + 1, y: cell.y },
      };
    }
    index = `${cell.x - 1},${cell.y + 1}`;
    if (neighbourCells[index]) {
      neighbourCells[index].neighbours++;
    } else {
      neighbourCells[index] = {
        neighbours: 1,
        cell: { x: cell.x - 1, y: cell.y + 1 },
      };
    }
    index = `${cell.x},${cell.y + 1}`;
    if (neighbourCells[index]) {
      neighbourCells[index].neighbours++;
    } else {
      neighbourCells[index] = {
        neighbours: 1,
        cell: { x: cell.x, y: cell.y + 1 },
      };
    }
    index = `${cell.x + 1},${cell.y + 1}`;
    if (neighbourCells[index]) {
      neighbourCells[index].neighbours++;
    } else {
      neighbourCells[index] = {
        neighbours: 1,
        cell: { x: cell.x + 1, y: cell.y + 1 },
      };
    }
  });

  shape.forEach(function (cell) {
    const neighbour = neighbourCells[`${cell.x},${cell.y}`];
    if (neighbour && neighbour.neighbours == 2) {
      neighbour.neighbours = 3;
    }
  });

  for (const index in neighbourCells) {
    if (neighbourCells[index].neighbours == 3) {
      newShape.push(neighbourCells[index].cell);
    }
  }

  return newShape;
}
