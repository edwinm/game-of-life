const gol = Module.cwrap("gol", "number", ["number", "number", "number"]);

function doGol(inShape) {
  const outShape = [];
  const inArr = [];

  inShape.forEach((cell) => {
    inArr.push(cell.x);
    inArr.push(cell.y);
  });

  const inputArray = new Int32Array(inArr);
  const len = inputArray.length;
  const bytesPerElement = inputArray.BYTES_PER_ELEMENT;
  // const MAX_CELLS = 10000;

  const inputPtr = Module._malloc(len * bytesPerElement * 8); // 8 neighbours
  const outputPtr = Module._malloc(len * bytesPerElement * 12); // 8 neighbours / 2 * 3

  Module.HEAP32.set(inputArray, inputPtr / bytesPerElement);

  const newSize = gol(inputPtr, outputPtr, len / 2) * 2;

  const outArr = [...new Int32Array(Module.HEAP32.buffer, inputPtr, newSize)];

  Module._free(inputPtr);
  Module._free(outputPtr);

  for (let i = 0; i < outArr.length; i += 2) {
    outShape.push({ x: outArr[i], y: outArr[i + 1] });
  }
  return outShape;
}

onmessage = (event) => {
  postMessage(doGol(event.data));
};
