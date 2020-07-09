"use strict";

const imports = {
  env: {
    abort: function () {},
    __memory_base: 0,
    __table_base: 0,
    memory: new WebAssembly.Memory({ initial: 4 }),
    table: new WebAssembly.Table({ initial: 2, element: "anyfunc" }),
  },
};

WebAssembly.instantiateStreaming(fetch("hello.wasm"), imports)
  .then((obj) => console.log(obj.instance.exports._add(1, 2)))
  .catch((error) => console.log(error));
