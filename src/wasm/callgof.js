const gof = Module.cwrap("gof", "number", ["number", "number", "number"]);

function callGof(cells) {
  const inputArray = new Int32Array(cells);
  const len = inputArray.length;
  const bytesPerElement = inputArray.BYTES_PER_ELEMENT;

  const inputPtr = Module._malloc(len * bytesPerElement * 8); // 8 neighbours
  const outputPtr = Module._malloc(len * bytesPerElement * 12); // 8 neighbours / 2 * 3

  Module.HEAP32.set(inputArray, inputPtr / bytesPerElement);

  const newSize = gof(inputPtr, outputPtr, len / 2) * 2;
  const inputArray2 = [
    ...new Int32Array(Module.HEAP32.buffer, inputPtr, newSize),
  ];

  Module._free(inputPtr);
  Module._free(outputPtr);

  return inputArray2;
}

export function doGof(shape) {
  const ret = [];
  const arr = callGof(shape.flat());
  for (let i = 0; i < arr.length; i += 2) {
    ret.push([arr[i], arr[i + 1]]);
  }
  return ret;
}

setTimeout(() => {
  const glider = [
    [1, 0],
    [2, 1],
    [2, 2],
    [1, 2],
    [0, 2],
  ];

  const nextGen = doGof(glider);
  console.log("nextGen", nextGen);
}, 1000);
