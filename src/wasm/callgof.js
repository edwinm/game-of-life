const gol = Module.cwrap("gol", "number", ["number", "number", "number"]);

const MAX_CELLS = 10000;

let shapePtr = null;
let neighbourPtr = null;

onmessage = (event) => {
  const outShape = [];
  const inArr = [];
  const int32perCell = 2;

  if (shapePtr == null) {
    // Allocate memory once
    shapePtr = Module._malloc(MAX_CELLS * 4 * 8); // 4 bytes in 32 bits, 8 neighbours
    neighbourPtr = Module._malloc(MAX_CELLS * 4 * 12); // 4 bytes in 32 bits, 8 neighbours / 2 * 3
  }

  // Convert shape to linear array
  event.data.forEach((cell) => {
    inArr.push(cell.x, cell.y);
  });

  const inputArray = new Int32Array(inArr);

  // Fill memory
  Module.HEAP32.set(inputArray, shapePtr / inputArray.BYTES_PER_ELEMENT);

  // Call wasm function
  const newSize =
    gol(shapePtr, neighbourPtr, inputArray.length / int32perCell) *
    int32perCell;

  // Read memory
  const outArr = new Int32Array(Module.HEAP32.buffer, shapePtr, newSize);

  // Convert linear array to shape
  for (let i = 0; i < outArr.length; i += int32perCell) {
    outShape.push({ x: outArr[i], y: outArr[i + 1] });
  }

  postMessage(outShape);
};
