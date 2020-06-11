interface Neighbours {
  n: number;
  cell: Cell;
  populated: boolean;
}

export function gofNext(shape: Cell[]) {
  let neighbours = <Neighbours>{};
  let newShape = <Cell[]>[];
  shape.forEach((cell) => {
    let index: string;

    index = `${cell.x - 1},${cell.y - 1}`;
    if (neighbours[index]) {
      neighbours[index].n++;
    } else {
      neighbours[index] = {n: 1, cell: {x: cell.x - 1, y: cell.y - 1}};
    }
    index = `${cell.x},${cell.y - 1}`;
    if (neighbours[index]) {
      neighbours[index].n++;
    } else {
      neighbours[index] = {n: 1, cell: {x: cell.x, y: cell.y - 1}};
    }
    index = `${cell.x + 1},${cell.y - 1}`;
    if (neighbours[index]) {
      neighbours[index].n++;
    } else {
      neighbours[index] = {n: 1, cell: {x: cell.x + 1, y: cell.y - 1}};
    }
    index = `${cell.x - 1},${cell.y}`;
    if (neighbours[index]) {
      neighbours[index].n++;
    } else {
      neighbours[index] = {n: 1, cell: {x: cell.x - 1, y: cell.y}};
    }
    index = `${cell.x + 1},${cell.y}`;
    if (neighbours[index]) {
      neighbours[index].n++;
    } else {
      neighbours[index] = {n: 1, cell: {x: cell.x + 1, y: cell.y}};
    }
    index = `${cell.x - 1},${cell.y + 1}`;
    if (neighbours[index]) {
      neighbours[index].n++;
    } else {
      neighbours[index] = {n: 1, cell: {x: cell.x - 1, y: cell.y + 1}};
    }
    index = `${cell.x},${cell.y + 1}`;
    if (neighbours[index]) {
      neighbours[index].n++;
    } else {
      neighbours[index] = {n: 1, cell: {x: cell.x, y: cell.y + 1}};
    }
    index = `${cell.x + 1},${cell.y + 1}`;
    if (neighbours[index]) {
      neighbours[index].n++;
    } else {
      neighbours[index] = {n: 1, cell: {x: cell.x + 1, y: cell.y + 1}};
    }
  });
  shape.forEach(function (cell, i) {
    const index = `${cell.x},${cell.y}`;
    if (neighbours[index]) {
      neighbours[index].populated = true;
    }
  });

  for (const index in neighbours) {
    if ((neighbours[index].n == 2 && neighbours[index].populated) || neighbours[index].n == 3) {
      newShape.push(neighbours[index].cell);
    }
  }
  return newShape;
}

