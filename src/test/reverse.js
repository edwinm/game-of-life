const fs = require("fs");

const memory = new WebAssembly.Memory({
  initial: 256,
  maximum: 256,
});
const heap = new Uint8Array(memory.buffer);
const imports = {
  env: {
    memory: memory,
  },
};

const wasmSource = new Uint8Array(fs.readFileSync("reverse.wasm"));
const wasmModule = new WebAssembly.Module(wasmSource);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);

function reverse(arr) {
  for (let i = 0; i < arr.length; ++i) {
    heap[i] = arr[i];
  }
  wasmInstance.exports._reverse(0, arr.length);

  const result = [];
  for (let i = 0; i < arr.length; ++i) {
    result.push(heap[i]);
  }
  return result;
}

const numbers = [14, 3, 77];
console.log(numbers, "becomes", reverse(numbers));
