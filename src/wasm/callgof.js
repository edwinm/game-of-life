var gof = Module["cwrap"]("gof", "number", ["number", "number", "number"]);

function callGof(cells) {
  var inputArray = new Int32Array(cells);
  var len = inputArray.length;
  var bytesPerElement = inputArray.BYTES_PER_ELEMENT;

  var inputPtr = Module["_malloc"](len * bytesPerElement * 8); // 8 neighbours
  var outputPtr = Module["_malloc"](len * bytesPerElement * 12); // 8 neighbours / 2 * 3

  Module["HEAP32"]["set"](inputArray, inputPtr / bytesPerElement);

  var newSize = gof(inputPtr, outputPtr, len / 2) * 2;
  // var inputArray2 = [
  //   ...new Int32Array(Module.HEAP32.buffer, inputPtr, newSize),
  // ];

  // Module._free(inputPtr);
  Module["_free"](outputPtr);

  return new Int32Array(Module["HEAP32"].buffer, inputPtr, newSize);
}

function doGof(shape) {
  var ret = [];
  var arr = callGof(shape.flat());
  for (var i = 0; i < arr.length; i += 2) {
    ret.push([arr[i], arr[i + 1]]);
  }
  return ret;
}

setTimeout(function () {
  var glider = [
    [1, 0],
    [2, 1],
    [2, 2],
    [1, 2],
    [0, 2],
  ];

  var nextGen = doGof(glider);
  console.log("nextGen", nextGen);
}, 1000);