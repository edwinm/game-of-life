type customInstance = WebAssembly.Instance & {
  exports: {
    // Emscripten drops the leading underscore of the C name in the wasm export
    gol(
      shapeByteOffset: number,
      scratchByteOffset: number,
      shapeSize: number
    ): number;
    _initialize?(): void;
  };
};

// The 3MB above the stack holds two regions, per live cell:
//
//   cells    4 * 8 bytes   x and y of 4 bytes each; gol() can return up to four
//                          times the cells it was given, so there is room for it
//   scratch  9 * 8 bytes   nine 64-bit keys, one for the cell and eight for the
//                          neighbours it contributes to
//
// That is 104 bytes per cell: 3 * 1024 * 1024 / 104 = 30240 cells (% 32 == 0).

export const MAX_LIVE_CELLS = 30240;

// Stack = 1 * 1024 * 1024
const OFFSET = 1048576;

// 2016256, a multiple of 8 so the keys are aligned
const SCRATCH_OFFSET = OFFSET + MAX_LIVE_CELLS * 4 * 8;

let instance: customInstance;
let memory: WebAssembly.Memory;

export async function init() {
  memory = new WebAssembly.Memory({
    initial: 64, // 4MB (page is 64kB)
    maximum: 64,
  });
  const importObject = {
    env: {
      memory,
    },
  };

  const responsePromise = fetch("/gol2.wasm");

  if ("instantiateStreaming" in WebAssembly) {
    instance = <customInstance>(
      (await WebAssembly.instantiateStreaming(responsePromise, importObject))
        .instance
    );
  } else {
    const response = await responsePromise;
    const buffer = await response.arrayBuffer();
    const module = await WebAssembly.compile(buffer);
    instance = <customInstance>(
      await WebAssembly.instantiate(module, importObject)
    );
  }

  // Reactor modules built with --no-entry expect this before their first call
  instance.exports._initialize?.();
}

export function next(cells: Cell[]): Cell[] {
  const outShape = <Cell[]>[];

  // Beyond this the cells would be written past their region, into the scratch
  // keys and eventually past the end of the wasm memory
  if (cells.length > MAX_LIVE_CELLS) {
    return outShape;
  }

  const shapeHeap = new Int32Array(memory.buffer, OFFSET, cells.length * 2);

  cells.forEach((cell, i) => {
    shapeHeap[i * 2] = cell.x;
    shapeHeap[i * 2 + 1] = cell.y;
  });

  const newLength = instance.exports.gol(OFFSET, SCRATCH_OFFSET, cells.length);

  const result = new Int32Array(memory.buffer, OFFSET, newLength * 2);

  for (let i = 0; i < newLength; i++) {
    outShape.push({ x: result[i * 2], y: result[i * 2 + 1] });
  }

  return outShape;
}
