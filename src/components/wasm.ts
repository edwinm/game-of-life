type customInstance = WebAssembly.Instance & {
  exports: {
    _gol(
      shapeByteOffset: number,
      neighbourByteOffset: number,
      shapeSize: number
    ): number;
  };
};

// shape cell size = 2 * 4 = 8 bytes
// neighbour cell size = 3 * 4 = 12 bytes
// 4MB - 1MB stack, shared for shape and neighbour cells:
// 3 * 1024 * 1024 / (8 + 12) * 8

const MAX_CELLS = 1258272; // Max 157.284 cells; MAX_CELLS % 32 == 0

// Stack = 1 * 1024 * 1024
const OFFSET = 1048576;

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

  const responsePromise = fetch("/gol.wasm");

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
}

export function next(cells: Cell[]): Cell[] {
  const outShape = <Cell[]>[];

  const shapeHeap = new Int32Array(memory.buffer, OFFSET, cells.length * 2);

  cells.forEach((cell, i) => {
    shapeHeap[i * 2] = cell.x;
    shapeHeap[i * 2 + 1] = cell.y;
  });

  const newLength = instance.exports._gol(OFFSET, MAX_CELLS, cells.length);

  const result = new Int32Array(memory.buffer, OFFSET, newLength * 2);

  for (let i = 0; i < newLength; i++) {
    outShape.push({ x: result[i * 2], y: result[i * 2 + 1] });
  }

  return outShape;
}
