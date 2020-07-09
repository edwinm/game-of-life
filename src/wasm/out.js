var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.arrayIteratorImpl = function (a) {
  var b = 0;
  return function () {
    return b < a.length ? { done: !1, value: a[b++] } : { done: !0 };
  };
};
$jscomp.arrayIterator = function (a) {
  return { next: $jscomp.arrayIteratorImpl(a) };
};
$jscomp.makeIterator = function (a) {
  var b = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
  return b ? b.call(a) : $jscomp.arrayIterator(a);
};
$jscomp.arrayFromIterator = function (a) {
  for (var b, c = []; !(b = a.next()).done; ) c.push(b.value);
  return c;
};
$jscomp.arrayFromIterable = function (a) {
  return a instanceof Array
    ? a
    : $jscomp.arrayFromIterator($jscomp.makeIterator(a));
};
$jscomp.getGlobal = function (a) {
  a = [
    "object" == typeof globalThis && globalThis,
    a,
    "object" == typeof window && window,
    "object" == typeof self && self,
    "object" == typeof global && global,
  ];
  for (var b = 0; b < a.length; ++b) {
    var c = a[b];
    if (c && c.Math == Math) return c;
  }
  throw Error("Cannot find global object");
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.ISOLATE_POLYFILLS = !1;
$jscomp.defineProperty =
  $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties
    ? Object.defineProperty
    : function (a, b, c) {
        if (a == Array.prototype || a == Object.prototype) return a;
        a[b] = c.value;
        return a;
      };
$jscomp.IS_SYMBOL_NATIVE =
  "function" === typeof Symbol && "symbol" === typeof Symbol("x");
$jscomp.TRUST_ES6_POLYFILLS =
  !$jscomp.ISOLATE_POLYFILLS || $jscomp.IS_SYMBOL_NATIVE;
$jscomp.polyfills = {};
$jscomp.propertyToPolyfillSymbol = {};
$jscomp.POLYFILL_PREFIX = "$jscp$";
var $jscomp$lookupPolyfilledValue = function (a, b) {
  var c = $jscomp.propertyToPolyfillSymbol[b];
  if (null == c) return a[b];
  c = a[c];
  return void 0 !== c ? c : a[b];
};
$jscomp.polyfill = function (a, b, c, f) {
  b &&
    ($jscomp.ISOLATE_POLYFILLS
      ? $jscomp.polyfillIsolated(a, b, c, f)
      : $jscomp.polyfillUnisolated(a, b, c, f));
};
$jscomp.polyfillUnisolated = function (a, b, c, f) {
  c = $jscomp.global;
  a = a.split(".");
  for (f = 0; f < a.length - 1; f++) {
    var d = a[f];
    if (!(d in c)) return;
    c = c[d];
  }
  a = a[a.length - 1];
  f = c[a];
  b = b(f);
  b != f &&
    null != b &&
    $jscomp.defineProperty(c, a, { configurable: !0, writable: !0, value: b });
};
$jscomp.polyfillIsolated = function (a, b, c, f) {
  var d = a.split(".");
  a = 1 === d.length;
  f = d[0];
  f = !a && f in $jscomp.polyfills ? $jscomp.polyfills : $jscomp.global;
  for (var l = 0; l < d.length - 1; l++) {
    var e = d[l];
    if (!(e in f)) return;
    f = f[e];
  }
  d = d[d.length - 1];
  c = $jscomp.IS_SYMBOL_NATIVE && "es6" === c ? f[d] : null;
  b = b(c);
  null != b &&
    (a
      ? $jscomp.defineProperty($jscomp.polyfills, d, {
          configurable: !0,
          writable: !0,
          value: b,
        })
      : b !== c &&
        (($jscomp.propertyToPolyfillSymbol[d] = $jscomp.IS_SYMBOL_NATIVE
          ? $jscomp.global.Symbol(d)
          : $jscomp.POLYFILL_PREFIX + d),
        (d = $jscomp.propertyToPolyfillSymbol[d]),
        $jscomp.defineProperty(f, d, {
          configurable: !0,
          writable: !0,
          value: b,
        })));
};
$jscomp.FORCE_POLYFILL_PROMISE = !1;
$jscomp.polyfill(
  "Promise",
  function (a) {
    function b() {
      this.batch_ = null;
    }
    function c(e) {
      return e instanceof d
        ? e
        : new d(function (g, k) {
            g(e);
          });
    }
    if (a && !$jscomp.FORCE_POLYFILL_PROMISE) return a;
    b.prototype.asyncExecute = function (e) {
      if (null == this.batch_) {
        this.batch_ = [];
        var g = this;
        this.asyncExecuteFunction(function () {
          g.executeBatch_();
        });
      }
      this.batch_.push(e);
    };
    var f = $jscomp.global.setTimeout;
    b.prototype.asyncExecuteFunction = function (e) {
      f(e, 0);
    };
    b.prototype.executeBatch_ = function () {
      for (; this.batch_ && this.batch_.length; ) {
        var e = this.batch_;
        this.batch_ = [];
        for (var g = 0; g < e.length; ++g) {
          var k = e[g];
          e[g] = null;
          try {
            k();
          } catch (h) {
            this.asyncThrow_(h);
          }
        }
      }
      this.batch_ = null;
    };
    b.prototype.asyncThrow_ = function (e) {
      this.asyncExecuteFunction(function () {
        throw e;
      });
    };
    var d = function (e) {
      this.state_ = 0;
      this.result_ = void 0;
      this.onSettledCallbacks_ = [];
      var g = this.createResolveAndReject_();
      try {
        e(g.resolve, g.reject);
      } catch (k) {
        g.reject(k);
      }
    };
    d.prototype.createResolveAndReject_ = function () {
      function e(h) {
        return function (m) {
          k || ((k = !0), h.call(g, m));
        };
      }
      var g = this,
        k = !1;
      return { resolve: e(this.resolveTo_), reject: e(this.reject_) };
    };
    d.prototype.resolveTo_ = function (e) {
      if (e === this)
        this.reject_(new TypeError("A Promise cannot resolve to itself"));
      else if (e instanceof d) this.settleSameAsPromise_(e);
      else {
        a: switch (typeof e) {
          case "object":
            var g = null != e;
            break a;
          case "function":
            g = !0;
            break a;
          default:
            g = !1;
        }
        g ? this.resolveToNonPromiseObj_(e) : this.fulfill_(e);
      }
    };
    d.prototype.resolveToNonPromiseObj_ = function (e) {
      var g = void 0;
      try {
        g = e.then;
      } catch (k) {
        this.reject_(k);
        return;
      }
      "function" == typeof g
        ? this.settleSameAsThenable_(g, e)
        : this.fulfill_(e);
    };
    d.prototype.reject_ = function (e) {
      this.settle_(2, e);
    };
    d.prototype.fulfill_ = function (e) {
      this.settle_(1, e);
    };
    d.prototype.settle_ = function (e, g) {
      if (0 != this.state_)
        throw Error(
          "Cannot settle(" +
            e +
            ", " +
            g +
            "): Promise already settled in state" +
            this.state_
        );
      this.state_ = e;
      this.result_ = g;
      this.executeOnSettledCallbacks_();
    };
    d.prototype.executeOnSettledCallbacks_ = function () {
      if (null != this.onSettledCallbacks_) {
        for (var e = 0; e < this.onSettledCallbacks_.length; ++e)
          l.asyncExecute(this.onSettledCallbacks_[e]);
        this.onSettledCallbacks_ = null;
      }
    };
    var l = new b();
    d.prototype.settleSameAsPromise_ = function (e) {
      var g = this.createResolveAndReject_();
      e.callWhenSettled_(g.resolve, g.reject);
    };
    d.prototype.settleSameAsThenable_ = function (e, g) {
      var k = this.createResolveAndReject_();
      try {
        e.call(g, k.resolve, k.reject);
      } catch (h) {
        k.reject(h);
      }
    };
    d.prototype.then = function (e, g) {
      function k(n, p) {
        return "function" == typeof n
          ? function (r) {
              try {
                h(n(r));
              } catch (t) {
                m(t);
              }
            }
          : p;
      }
      var h,
        m,
        q = new d(function (n, p) {
          h = n;
          m = p;
        });
      this.callWhenSettled_(k(e, h), k(g, m));
      return q;
    };
    d.prototype.catch = function (e) {
      return this.then(void 0, e);
    };
    d.prototype.callWhenSettled_ = function (e, g) {
      function k() {
        switch (h.state_) {
          case 1:
            e(h.result_);
            break;
          case 2:
            g(h.result_);
            break;
          default:
            throw Error("Unexpected state: " + h.state_);
        }
      }
      var h = this;
      null == this.onSettledCallbacks_
        ? l.asyncExecute(k)
        : this.onSettledCallbacks_.push(k);
    };
    d.resolve = c;
    d.reject = function (e) {
      return new d(function (g, k) {
        k(e);
      });
    };
    d.race = function (e) {
      return new d(function (g, k) {
        for (
          var h = $jscomp.makeIterator(e), m = h.next();
          !m.done;
          m = h.next()
        )
          c(m.value).callWhenSettled_(g, k);
      });
    };
    d.all = function (e) {
      var g = $jscomp.makeIterator(e),
        k = g.next();
      return k.done
        ? c([])
        : new d(function (h, m) {
            function q(r) {
              return function (t) {
                n[r] = t;
                p--;
                0 == p && h(n);
              };
            }
            var n = [],
              p = 0;
            do
              n.push(void 0),
                p++,
                c(k.value).callWhenSettled_(q(n.length - 1), m),
                (k = g.next());
            while (!k.done);
          });
    };
    return d;
  },
  "es6",
  "es3"
);
$jscomp.polyfill(
  "Array.prototype.flat",
  function (a) {
    return a
      ? a
      : function (b) {
          b = void 0 === b ? 1 : b;
          for (var c = [], f = 0; f < this.length; f++) {
            var d = this[f];
            Array.isArray(d) && 0 < b
              ? ((d = Array.prototype.flat.call(d, b - 1)), c.push.apply(c, d))
              : c.push(d);
          }
          return c;
        };
  },
  "es9",
  "es5"
);
var Module = "undefined" !== typeof Module ? Module : {},
  moduleOverrides = {},
  key;
for (key in Module)
  Module.hasOwnProperty(key) && (moduleOverrides[key] = Module[key]);
var arguments_ = [],
  thisProgram = "./this.program",
  quit_ = function (a, b) {
    throw b;
  },
  ENVIRONMENT_IS_WEB = !1,
  ENVIRONMENT_IS_WORKER = !1,
  ENVIRONMENT_IS_NODE = !1,
  ENVIRONMENT_IS_SHELL = !1;
ENVIRONMENT_IS_WEB = "object" === typeof window;
ENVIRONMENT_IS_WORKER = "function" === typeof importScripts;
ENVIRONMENT_IS_NODE =
  "object" === typeof process &&
  "object" === typeof process.versions &&
  "string" === typeof process.versions.node;
ENVIRONMENT_IS_SHELL =
  !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
var scriptDirectory = "";
function locateFile(a) {
  return Module.locateFile
    ? Module.locateFile(a, scriptDirectory)
    : scriptDirectory + a;
}
var read_, readAsync, readBinary, setWindowTitle, nodeFS, nodePath;
if (ENVIRONMENT_IS_NODE)
  (scriptDirectory = ENVIRONMENT_IS_WORKER
    ? require("path").dirname(scriptDirectory) + "/"
    : __dirname + "/"),
    (read_ = function (a, b) {
      nodeFS || (nodeFS = require("fs"));
      nodePath || (nodePath = require("path"));
      a = nodePath.normalize(a);
      return nodeFS.readFileSync(a, b ? null : "utf8");
    }),
    (readBinary = function (a) {
      a = read_(a, !0);
      a.buffer || (a = new Uint8Array(a));
      assert(a.buffer);
      return a;
    }),
    1 < process.argv.length &&
      (thisProgram = process.argv[1].replace(/\\/g, "/")),
    (arguments_ = process.argv.slice(2)),
    "undefined" !== typeof module && (module.exports = Module),
    process.on("uncaughtException", function (a) {
      if (!(a instanceof ExitStatus)) throw a;
    }),
    process.on("unhandledRejection", abort),
    (quit_ = function (a) {
      process.exit(a);
    }),
    (Module.inspect = function () {
      return "[Emscripten Module object]";
    });
else if (ENVIRONMENT_IS_SHELL)
  "undefined" != typeof read &&
    (read_ = function (a) {
      return read(a);
    }),
    (readBinary = function (a) {
      if ("function" === typeof readbuffer)
        return new Uint8Array(readbuffer(a));
      a = read(a, "binary");
      assert("object" === typeof a);
      return a;
    }),
    "undefined" != typeof scriptArgs
      ? (arguments_ = scriptArgs)
      : "undefined" != typeof arguments && (arguments_ = arguments),
    "function" === typeof quit &&
      (quit_ = function (a) {
        quit(a);
      }),
    "undefined" !== typeof print &&
      ("undefined" === typeof console && (console = {}),
      (console.log = print),
      (console.warn = console.error =
        "undefined" !== typeof printErr ? printErr : print));
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)
  ENVIRONMENT_IS_WORKER
    ? (scriptDirectory = self.location.href)
    : document.currentScript && (scriptDirectory = document.currentScript.src),
    (scriptDirectory =
      0 !== scriptDirectory.indexOf("blob:")
        ? scriptDirectory.substr(0, scriptDirectory.lastIndexOf("/") + 1)
        : ""),
    (read_ = function (a) {
      var b = new XMLHttpRequest();
      b.open("GET", a, !1);
      b.send(null);
      return b.responseText;
    }),
    ENVIRONMENT_IS_WORKER &&
      (readBinary = function (a) {
        var b = new XMLHttpRequest();
        b.open("GET", a, !1);
        b.responseType = "arraybuffer";
        b.send(null);
        return new Uint8Array(b.response);
      }),
    (readAsync = function (a, b, c) {
      var f = new XMLHttpRequest();
      f.open("GET", a, !0);
      f.responseType = "arraybuffer";
      f.onload = function () {
        200 == f.status || (0 == f.status && f.response) ? b(f.response) : c();
      };
      f.onerror = c;
      f.send(null);
    }),
    (setWindowTitle = function (a) {
      document.title = a;
    });
var out = Module.print || console.log.bind(console),
  err = Module.printErr || console.warn.bind(console);
for (key in moduleOverrides)
  moduleOverrides.hasOwnProperty(key) && (Module[key] = moduleOverrides[key]);
moduleOverrides = null;
Module.arguments && (arguments_ = Module.arguments);
Module.thisProgram && (thisProgram = Module.thisProgram);
Module.quit && (quit_ = Module.quit);
var asm2wasmImports = {
    "f64-rem": function (a, b) {
      return a % b;
    },
    debugger: function () {},
  },
  functionPointers = [],
  wasmBinary;
Module.wasmBinary && (wasmBinary = Module.wasmBinary);
var noExitRuntime;
Module.noExitRuntime && (noExitRuntime = Module.noExitRuntime);
"object" !== typeof WebAssembly && err("no native wasm support detected");
function setValue(a, b, c, f) {
  c = c || "i8";
  "*" === c.charAt(c.length - 1) && (c = "i32");
  switch (c) {
    case "i1":
      HEAP8[a >> 0] = b;
      break;
    case "i8":
      HEAP8[a >> 0] = b;
      break;
    case "i16":
      HEAP16[a >> 1] = b;
      break;
    case "i32":
      HEAP32[a >> 2] = b;
      break;
    case "i64":
      tempI64 = [
        b >>> 0,
        ((tempDouble = b),
        1 <= +Math_abs(tempDouble)
          ? 0 < tempDouble
            ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) |
                0) >>>
              0
            : ~~+Math_ceil(
                (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
              ) >>> 0
          : 0),
      ];
      HEAP32[a >> 2] = tempI64[0];
      HEAP32[(a + 4) >> 2] = tempI64[1];
      break;
    case "float":
      HEAPF32[a >> 2] = b;
      break;
    case "double":
      HEAPF64[a >> 3] = b;
      break;
    default:
      abort("invalid type for setValue: " + c);
  }
}
function getValue(a, b, c) {
  b = b || "i8";
  "*" === b.charAt(b.length - 1) && (b = "i32");
  switch (b) {
    case "i1":
      return HEAP8[a >> 0];
    case "i8":
      return HEAP8[a >> 0];
    case "i16":
      return HEAP16[a >> 1];
    case "i32":
      return HEAP32[a >> 2];
    case "i64":
      return HEAP32[a >> 2];
    case "float":
      return HEAPF32[a >> 2];
    case "double":
      return HEAPF64[a >> 3];
    default:
      abort("invalid type for getValue: " + b);
  }
  return null;
}
var wasmMemory,
  wasmTable = new WebAssembly.Table({
    initial: 0,
    maximum: 0,
    element: "anyfunc",
  }),
  ABORT = !1,
  EXITSTATUS = 0;
function assert(a, b) {
  a || abort("Assertion failed: " + b);
}
function getCFunc(a) {
  var b = Module["_" + a];
  assert(b, "Cannot call unknown function " + a + ", make sure it is exported");
  return b;
}
function ccall(a, b, c, f, d) {
  d = {
    string: function (h) {
      var m = 0;
      if (null !== h && void 0 !== h && 0 !== h) {
        var q = (h.length << 2) + 1;
        m = stackAlloc(q);
        stringToUTF8(h, m, q);
      }
      return m;
    },
    array: function (h) {
      var m = stackAlloc(h.length);
      writeArrayToMemory(h, m);
      return m;
    },
  };
  var l = getCFunc(a),
    e = [];
  a = 0;
  if (f)
    for (var g = 0; g < f.length; g++) {
      var k = d[c[g]];
      k ? (0 === a && (a = stackSave()), (e[g] = k(f[g]))) : (e[g] = f[g]);
    }
  c = l.apply(null, e);
  c = (function (h) {
    return "string" === b ? UTF8ToString(h) : "boolean" === b ? !!h : h;
  })(c);
  0 !== a && stackRestore(a);
  return c;
}
function cwrap(a, b, c, f) {
  c = c || [];
  var d = c.every(function (l) {
    return "number" === l;
  });
  return "string" !== b && d && !f
    ? getCFunc(a)
    : function () {
        return ccall(a, b, c, arguments, f);
      };
}
var UTF8Decoder =
  "undefined" !== typeof TextDecoder ? new TextDecoder("utf8") : void 0;
function UTF8ArrayToString(a, b, c) {
  var f = b + c;
  for (c = b; a[c] && !(c >= f); ) ++c;
  if (16 < c - b && a.subarray && UTF8Decoder)
    return UTF8Decoder.decode(a.subarray(b, c));
  for (f = ""; b < c; ) {
    var d = a[b++];
    if (d & 128) {
      var l = a[b++] & 63;
      if (192 == (d & 224)) f += String.fromCharCode(((d & 31) << 6) | l);
      else {
        var e = a[b++] & 63;
        d =
          224 == (d & 240)
            ? ((d & 15) << 12) | (l << 6) | e
            : ((d & 7) << 18) | (l << 12) | (e << 6) | (a[b++] & 63);
        65536 > d
          ? (f += String.fromCharCode(d))
          : ((d -= 65536),
            (f += String.fromCharCode(55296 | (d >> 10), 56320 | (d & 1023))));
      }
    } else f += String.fromCharCode(d);
  }
  return f;
}
function UTF8ToString(a, b) {
  return a ? UTF8ArrayToString(HEAPU8, a, b) : "";
}
function stringToUTF8Array(a, b, c, f) {
  if (!(0 < f)) return 0;
  var d = c;
  f = c + f - 1;
  for (var l = 0; l < a.length; ++l) {
    var e = a.charCodeAt(l);
    if (55296 <= e && 57343 >= e) {
      var g = a.charCodeAt(++l);
      e = (65536 + ((e & 1023) << 10)) | (g & 1023);
    }
    if (127 >= e) {
      if (c >= f) break;
      b[c++] = e;
    } else {
      if (2047 >= e) {
        if (c + 1 >= f) break;
        b[c++] = 192 | (e >> 6);
      } else {
        if (65535 >= e) {
          if (c + 2 >= f) break;
          b[c++] = 224 | (e >> 12);
        } else {
          if (c + 3 >= f) break;
          b[c++] = 240 | (e >> 18);
          b[c++] = 128 | ((e >> 12) & 63);
        }
        b[c++] = 128 | ((e >> 6) & 63);
      }
      b[c++] = 128 | (e & 63);
    }
  }
  b[c] = 0;
  return c - d;
}
function stringToUTF8(a, b, c) {
  return stringToUTF8Array(a, HEAPU8, b, c);
}
function writeArrayToMemory(a, b) {
  HEAP8.set(a, b);
}
var WASM_PAGE_SIZE = 65536,
  buffer,
  HEAP8,
  HEAPU8,
  HEAP16,
  HEAPU16,
  HEAP32,
  HEAPU32,
  HEAPF32,
  HEAPF64;
function updateGlobalBufferAndViews(a) {
  buffer = a;
  Module.HEAP8 = HEAP8 = new Int8Array(a);
  Module.HEAP16 = HEAP16 = new Int16Array(a);
  Module.HEAP32 = HEAP32 = new Int32Array(a);
  Module.HEAPU8 = HEAPU8 = new Uint8Array(a);
  Module.HEAPU16 = HEAPU16 = new Uint16Array(a);
  Module.HEAPU32 = HEAPU32 = new Uint32Array(a);
  Module.HEAPF32 = HEAPF32 = new Float32Array(a);
  Module.HEAPF64 = HEAPF64 = new Float64Array(a);
}
var DYNAMIC_BASE = 5245632,
  DYNAMICTOP_PTR = 2560,
  INITIAL_INITIAL_MEMORY = Module.INITIAL_MEMORY || 16777216;
if (
  (wasmMemory = Module.wasmMemory
    ? Module.wasmMemory
    : new WebAssembly.Memory({
        initial: INITIAL_INITIAL_MEMORY / WASM_PAGE_SIZE,
        maximum: INITIAL_INITIAL_MEMORY / WASM_PAGE_SIZE,
      }))
)
  buffer = wasmMemory.buffer;
INITIAL_INITIAL_MEMORY = buffer.byteLength;
updateGlobalBufferAndViews(buffer);
HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
function callRuntimeCallbacks(a) {
  for (; 0 < a.length; ) {
    var b = a.shift();
    if ("function" == typeof b) b(Module);
    else {
      var c = b.func;
      "number" === typeof c
        ? void 0 === b.arg
          ? Module.dynCall_v(c)
          : Module.dynCall_vi(c, b.arg)
        : c(void 0 === b.arg ? null : b.arg);
    }
  }
}
var __ATPRERUN__ = [],
  __ATINIT__ = [],
  __ATMAIN__ = [],
  __ATPOSTRUN__ = [],
  runtimeInitialized = !1;
function preRun() {
  if (Module.preRun)
    for (
      "function" == typeof Module.preRun && (Module.preRun = [Module.preRun]);
      Module.preRun.length;

    )
      addOnPreRun(Module.preRun.shift());
  callRuntimeCallbacks(__ATPRERUN__);
}
function initRuntime() {
  runtimeInitialized = !0;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function postRun() {
  if (Module.postRun)
    for (
      "function" == typeof Module.postRun &&
      (Module.postRun = [Module.postRun]);
      Module.postRun.length;

    )
      addOnPostRun(Module.postRun.shift());
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(a) {
  __ATPRERUN__.unshift(a);
}
function addOnPostRun(a) {
  __ATPOSTRUN__.unshift(a);
}
var Math_abs = Math.abs,
  Math_ceil = Math.ceil,
  Math_floor = Math.floor,
  Math_min = Math.min,
  runDependencies = 0,
  runDependencyWatcher = null,
  dependenciesFulfilled = null;
function addRunDependency(a) {
  runDependencies++;
  Module.monitorRunDependencies &&
    Module.monitorRunDependencies(runDependencies);
}
function removeRunDependency(a) {
  runDependencies--;
  Module.monitorRunDependencies &&
    Module.monitorRunDependencies(runDependencies);
  0 == runDependencies &&
    (null !== runDependencyWatcher &&
      (clearInterval(runDependencyWatcher), (runDependencyWatcher = null)),
    dependenciesFulfilled &&
      ((a = dependenciesFulfilled), (dependenciesFulfilled = null), a()));
}
Module.preloadedImages = {};
Module.preloadedAudios = {};
function abort(a) {
  if (Module.onAbort) Module.onAbort(a);
  a += "";
  out(a);
  err(a);
  ABORT = !0;
  EXITSTATUS = 1;
  throw new WebAssembly.RuntimeError(
    "abort(" + a + "). Build with -s ASSERTIONS=1 for more info."
  );
}
function hasPrefix(a, b) {
  return String.prototype.startsWith ? a.startsWith(b) : 0 === a.indexOf(b);
}
var dataURIPrefix = "data:application/octet-stream;base64,";
function isDataURI(a) {
  return hasPrefix(a, dataURIPrefix);
}
var fileURIPrefix = "file://";
function isFileURI(a) {
  return hasPrefix(a, fileURIPrefix);
}
var wasmBinaryFile = "gof.wasm";
isDataURI(wasmBinaryFile) || (wasmBinaryFile = locateFile(wasmBinaryFile));
function getBinary() {
  try {
    if (wasmBinary) return new Uint8Array(wasmBinary);
    if (readBinary) return readBinary(wasmBinaryFile);
    throw "both async and sync fetching of the wasm failed";
  } catch (a) {
    abort(a);
  }
}
function getBinaryPromise() {
  return wasmBinary ||
    (!ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) ||
    "function" !== typeof fetch ||
    isFileURI(wasmBinaryFile)
    ? new Promise(function (a, b) {
        a(getBinary());
      })
    : fetch(wasmBinaryFile, { credentials: "same-origin" })
        .then(function (a) {
          if (!a.ok)
            throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
          return a.arrayBuffer();
        })
        .catch(function () {
          return getBinary();
        });
}
function createWasm() {
  function a(d, l) {
    Module.asm = d.exports;
    removeRunDependency("wasm-instantiate");
  }
  function b(d) {
    a(d.instance);
  }
  function c(d) {
    return getBinaryPromise()
      .then(function (l) {
        return WebAssembly.instantiate(l, f);
      })
      .then(d, function (l) {
        err("failed to asynchronously prepare wasm: " + l);
        abort(l);
      });
  }
  var f = {
    env: asmLibraryArg,
    wasi_snapshot_preview1: asmLibraryArg,
    global: { NaN: NaN, Infinity: Infinity },
    "global.Math": Math,
    asm2wasm: asm2wasmImports,
  };
  addRunDependency("wasm-instantiate");
  if (Module.instantiateWasm)
    try {
      return Module.instantiateWasm(f, a);
    } catch (d) {
      return err("Module.instantiateWasm callback failed with error: " + d), !1;
    }
  (function () {
    if (
      wasmBinary ||
      "function" !== typeof WebAssembly.instantiateStreaming ||
      isDataURI(wasmBinaryFile) ||
      isFileURI(wasmBinaryFile) ||
      "function" !== typeof fetch
    )
      return c(b);
    fetch(wasmBinaryFile, { credentials: "same-origin" }).then(function (d) {
      return WebAssembly.instantiateStreaming(d, f).then(b, function (l) {
        err("wasm streaming compile failed: " + l);
        err("falling back to ArrayBuffer instantiation");
        return c(b);
      });
    });
  })();
  return {};
}
Module.asm = createWasm;
var tempDouble, tempI64;
function _emscripten_get_heap_size() {
  return HEAPU8.length;
}
function abortOnCannotGrowMemory(a) {
  abort("OOM");
}
function _emscripten_resize_heap(a) {
  abortOnCannotGrowMemory(a >>> 0);
}
var asmGlobalArg = {},
  asmLibraryArg = {
    __memory_base: 1024,
    __table_base: 0,
    b: _emscripten_get_heap_size,
    a: _emscripten_resize_heap,
    memory: wasmMemory,
    table: wasmTable,
  },
  asm = Module.asm(asmGlobalArg, asmLibraryArg, buffer),
  _free = (Module._free = function () {
    return (_free = Module._free = Module.asm.c).apply(null, arguments);
  }),
  _gof = (Module._gof = function () {
    return (_gof = Module._gof = Module.asm.d).apply(null, arguments);
  }),
  _malloc = (Module._malloc = function () {
    return (_malloc = Module._malloc = Module.asm.e).apply(null, arguments);
  }),
  stackAlloc = (Module.stackAlloc = function () {
    return (stackAlloc = Module.stackAlloc = Module.asm.f).apply(
      null,
      arguments
    );
  }),
  stackRestore = (Module.stackRestore = function () {
    return (stackRestore = Module.stackRestore = Module.asm.g).apply(
      null,
      arguments
    );
  }),
  stackSave = (Module.stackSave = function () {
    return (stackSave = Module.stackSave = Module.asm.h).apply(null, arguments);
  });
Module.cwrap = cwrap;
Module.setValue = setValue;
Module.getValue = getValue;
var calledRun;
function ExitStatus(a) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + a + ")";
  this.status = a;
}
dependenciesFulfilled = function runCaller() {
  calledRun || run();
  calledRun || (dependenciesFulfilled = runCaller);
};
function run(a) {
  function b() {
    if (!calledRun && ((calledRun = !0), (Module.calledRun = !0), !ABORT)) {
      initRuntime();
      preMain();
      if (Module.onRuntimeInitialized) Module.onRuntimeInitialized();
      postRun();
    }
  }
  0 < runDependencies ||
    (preRun(),
    0 < runDependencies ||
      (Module.setStatus
        ? (Module.setStatus("Running..."),
          setTimeout(function () {
            setTimeout(function () {
              Module.setStatus("");
            }, 1);
            b();
          }, 1))
        : b()));
}
Module.run = run;
if (Module.preInit)
  for (
    "function" == typeof Module.preInit && (Module.preInit = [Module.preInit]);
    0 < Module.preInit.length;

  )
    Module.preInit.pop()();
noExitRuntime = !0;
run();
var gof$$module$src$wasm$callgof = Module.cwrap("gof", "number", [
  "number",
  "number",
  "number",
]);
function callGof$$module$src$wasm$callgof(a) {
  var b = new Int32Array(a),
    c = b.length,
    f = b.BYTES_PER_ELEMENT;
  a = Module._malloc(c * f * 8);
  var d = Module._malloc(c * f * 12);
  Module.HEAP32.set(b, a / f);
  b = 2 * gof$$module$src$wasm$callgof(a, d, c / 2);
  b = [].concat(
    $jscomp.arrayFromIterable(new Int32Array(Module.HEAP32.buffer, a, b))
  );
  Module._free(a);
  Module._free(d);
  return b;
}
function doGof$$module$src$wasm$callgof(a) {
  var b = [];
  a = callGof$$module$src$wasm$callgof(a.flat());
  for (var c = 0; c < a.length; c += 2) b.push([a[c], a[c + 1]]);
  return b;
}
setTimeout(function () {
  var a = doGof$$module$src$wasm$callgof([
    [1, 0],
    [2, 1],
    [2, 2],
    [1, 2],
    [0, 2],
  ]);
  console.log("nextGen", a);
}, 1e3);
var module$src$wasm$callgof = {};
module$src$wasm$callgof.doGof = doGof$$module$src$wasm$callgof;
