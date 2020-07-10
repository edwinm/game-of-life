"use strict";
var Module;
Module || (Module = typeof Module !== "undefined" ? Module : {});
var p = {},
  r;
for (r in Module) Module.hasOwnProperty(r) && (p[r] = Module[r]);
var t = !1,
  v = !1,
  w = !1,
  aa = !1;
t = "object" === typeof window;
v = "function" === typeof importScripts;
w =
  "object" === typeof process &&
  "object" === typeof process.versions &&
  "string" === typeof process.versions.node;
aa = !t && !w && !v;
var x = "",
  y,
  z,
  A,
  B;
if (w)
  (x = v ? require("path").dirname(x) + "/" : __dirname + "/"),
    (y = function (a, b) {
      A || (A = require("fs"));
      B || (B = require("path"));
      a = B.normalize(a);
      return A.readFileSync(a, b ? null : "utf8");
    }),
    (z = function (a) {
      a = y(a, !0);
      a.buffer || (a = new Uint8Array(a));
      assert(a.buffer);
      return a;
    }),
    1 < process.argv.length && process.argv[1].replace(/\\/g, "/"),
    process.argv.slice(2),
    "undefined" !== typeof module && (module.exports = Module),
    process.on("uncaughtException", function (a) {
      throw a;
    }),
    process.on("unhandledRejection", D),
    (Module.inspect = function () {
      return "[Emscripten Module object]";
    });
else if (aa)
  "undefined" != typeof read &&
    (y = function (a) {
      return read(a);
    }),
    (z = function (a) {
      if ("function" === typeof readbuffer)
        return new Uint8Array(readbuffer(a));
      a = read(a, "binary");
      assert("object" === typeof a);
      return a;
    }),
    "undefined" !== typeof print &&
      ("undefined" === typeof console && (console = {}),
      (console.log = print),
      (console.warn = console.error =
        "undefined" !== typeof printErr ? printErr : print));
else if (t || v)
  v
    ? (x = self.location.href)
    : document.currentScript && (x = document.currentScript.src),
    (x = 0 !== x.indexOf("blob:") ? x.substr(0, x.lastIndexOf("/") + 1) : ""),
    (y = function (a) {
      var b = new XMLHttpRequest();
      b.open("GET", a, !1);
      b.send(null);
      return b.responseText;
    }),
    v &&
      (z = function (a) {
        var b = new XMLHttpRequest();
        b.open("GET", a, !1);
        b.responseType = "arraybuffer";
        b.send(null);
        return new Uint8Array(b.response);
      });
var ba = Module.print || console.log.bind(console),
  E = Module.printErr || console.warn.bind(console);
for (r in p) p.hasOwnProperty(r) && (Module[r] = p[r]);
p = null;
var ca = {
    "f64-rem": function (a, b) {
      return a % b;
    },
    debugger: function () {},
  },
  F;
Module.wasmBinary && (F = Module.wasmBinary);
var noExitRuntime;
Module.noExitRuntime && (noExitRuntime = Module.noExitRuntime);
"object" !== typeof WebAssembly && E("no native wasm support detected");
var G,
  da = new WebAssembly.Table({ initial: 0, maximum: 0, element: "anyfunc" }),
  ea = !1;
function assert(a, b) {
  a || D("Assertion failed: " + b);
}
function ha(a) {
  var b = Module["_" + a];
  assert(b, "Cannot call unknown function " + a + ", make sure it is exported");
  return b;
}
function ia(a, b, c, f) {
  var h = {
      string: function (d) {
        var m = 0;
        if (null !== d && void 0 !== d && 0 !== d) {
          var l = (d.length << 2) + 1;
          m = H(l);
          var g = m,
            e = I;
          if (0 < l) {
            l = g + l - 1;
            for (var u = 0; u < d.length; ++u) {
              var k = d.charCodeAt(u);
              if (55296 <= k && 57343 >= k) {
                var ta = d.charCodeAt(++u);
                k = (65536 + ((k & 1023) << 10)) | (ta & 1023);
              }
              if (127 >= k) {
                if (g >= l) break;
                e[g++] = k;
              } else {
                if (2047 >= k) {
                  if (g + 1 >= l) break;
                  e[g++] = 192 | (k >> 6);
                } else {
                  if (65535 >= k) {
                    if (g + 2 >= l) break;
                    e[g++] = 224 | (k >> 12);
                  } else {
                    if (g + 3 >= l) break;
                    e[g++] = 240 | (k >> 18);
                    e[g++] = 128 | ((k >> 12) & 63);
                  }
                  e[g++] = 128 | ((k >> 6) & 63);
                }
                e[g++] = 128 | (k & 63);
              }
            }
            e[g] = 0;
          }
        }
        return m;
      },
      array: function (d) {
        var m = H(d.length);
        J.set(d, m);
        return m;
      },
    },
    n = ha(a),
    C = [];
  a = 0;
  if (f)
    for (var q = 0; q < f.length; q++) {
      var fa = h[c[q]];
      fa ? (0 === a && (a = ja()), (C[q] = fa(f[q]))) : (C[q] = f[q]);
    }
  c = n.apply(null, C);
  c = (function (d) {
    if ("string" === b)
      if (d) {
        for (var m = I, l = d + NaN, g = d; m[g] && !(g >= l); ) ++g;
        if (16 < g - d && m.subarray && ka) d = ka.decode(m.subarray(d, g));
        else {
          for (l = ""; d < g; ) {
            var e = m[d++];
            if (e & 128) {
              var u = m[d++] & 63;
              if (192 == (e & 224))
                l += String.fromCharCode(((e & 31) << 6) | u);
              else {
                var k = m[d++] & 63;
                e =
                  224 == (e & 240)
                    ? ((e & 15) << 12) | (u << 6) | k
                    : ((e & 7) << 18) | (u << 12) | (k << 6) | (m[d++] & 63);
                65536 > e
                  ? (l += String.fromCharCode(e))
                  : ((e -= 65536),
                    (l += String.fromCharCode(
                      55296 | (e >> 10),
                      56320 | (e & 1023)
                    )));
              }
            } else l += String.fromCharCode(e);
          }
          d = l;
        }
      } else d = "";
    else d = "boolean" === b ? !!d : d;
    return d;
  })(c);
  0 !== a && la(a);
  return c;
}
var ka = "undefined" !== typeof TextDecoder ? new TextDecoder("utf8") : void 0,
  K,
  J,
  I,
  L,
  M,
  N,
  O,
  P = Module.INITIAL_MEMORY || 16777216;
Module.wasmMemory
  ? (G = Module.wasmMemory)
  : (G = new WebAssembly.Memory({ initial: P / 65536, maximum: P / 65536 }));
G && (K = G.buffer);
P = K.byteLength;
var Q = K;
K = Q;
Module.HEAP8 = J = new Int8Array(Q);
Module.HEAP16 = L = new Int16Array(Q);
Module.HEAP32 = M = new Int32Array(Q);
Module.HEAPU8 = I = new Uint8Array(Q);
Module.HEAPU16 = new Uint16Array(Q);
Module.HEAPU32 = new Uint32Array(Q);
Module.HEAPF32 = N = new Float32Array(Q);
Module.HEAPF64 = O = new Float64Array(Q);
M[640] = 5245632;
function R(a) {
  for (; 0 < a.length; ) {
    var b = a.shift();
    if ("function" == typeof b) b(Module);
    else {
      var c = b.j;
      "number" === typeof c
        ? void 0 === b.i
          ? Module.dynCall_v(c)
          : Module.dynCall_vi(c, b.i)
        : c(void 0 === b.i ? null : b.i);
    }
  }
}
var ma = [],
  na = [],
  oa = [],
  pa = [];
function qa() {
  var a = Module.preRun.shift();
  ma.unshift(a);
}
var ra = Math.abs,
  sa = Math.ceil,
  ua = Math.floor,
  va = Math.min,
  S = 0,
  T = null,
  U = null;
Module.preloadedImages = {};
Module.preloadedAudios = {};
function D(a) {
  if (Module.onAbort) Module.onAbort(a);
  ba(a);
  E(a);
  ea = !0;
  throw new WebAssembly.RuntimeError(
    "abort(" + a + "). Build with -s ASSERTIONS=1 for more info."
  );
}
function V(a) {
  var b = W;
  return String.prototype.startsWith ? b.startsWith(a) : 0 === b.indexOf(a);
}
function wa() {
  return V("data:application/octet-stream;base64,");
}
var W = "gol.wasm";
if (!wa()) {
  var xa = W;
  W = Module.locateFile ? Module.locateFile(xa, x) : x + xa;
}
function ya() {
  try {
    if (F) return new Uint8Array(F);
    if (z) return z(W);
    throw "both async and sync fetching of the wasm failed";
  } catch (a) {
    D(a);
  }
}
function za() {
  return F || (!t && !v) || "function" !== typeof fetch || V("file://")
    ? new Promise(function (a) {
        a(ya());
      })
    : fetch(W, { credentials: "same-origin" })
        .then(function (a) {
          if (!a.ok) throw "failed to load wasm binary file at '" + W + "'";
          return a.arrayBuffer();
        })
        .catch(function () {
          return ya();
        });
}
Module.asm = function () {
  function a(h) {
    Module.asm = h.exports;
    S--;
    Module.monitorRunDependencies && Module.monitorRunDependencies(S);
    0 == S &&
      (null !== T && (clearInterval(T), (T = null)),
      U && ((h = U), (U = null), h()));
  }
  function b(h) {
    a(h.instance);
  }
  function c(h) {
    return za()
      .then(function (n) {
        return WebAssembly.instantiate(n, f);
      })
      .then(h, function (n) {
        E("failed to asynchronously prepare wasm: " + n);
        D(n);
      });
  }
  var f = {
    env: X,
    wasi_snapshot_preview1: X,
    global: { NaN, Infinity },
    "global.Math": Math,
    asm2wasm: ca,
  };
  S++;
  Module.monitorRunDependencies && Module.monitorRunDependencies(S);
  if (Module.instantiateWasm)
    try {
      return Module.instantiateWasm(f, a);
    } catch (h) {
      return E("Module.instantiateWasm callback failed with error: " + h), !1;
    }
  (function () {
    if (
      F ||
      "function" !== typeof WebAssembly.instantiateStreaming ||
      wa() ||
      V("file://") ||
      "function" !== typeof fetch
    )
      return c(b);
    fetch(W, { credentials: "same-origin" }).then(function (h) {
      return WebAssembly.instantiateStreaming(h, f).then(b, function (n) {
        E("wasm streaming compile failed: " + n);
        E("falling back to ArrayBuffer instantiation");
        return c(b);
      });
    });
  })();
  return {};
};
var Y,
  Aa,
  X = {
    __memory_base: 1024,
    __table_base: 0,
    b: function () {
      return I.length;
    },
    a: function () {
      D("OOM");
    },
    memory: G,
    table: da,
  };
Module.asm({}, X, K);
Module._free = function () {
  return (Module._free = Module.asm.c).apply(null, arguments);
};
Module._gol = function () {
  return (Module._gol = Module.asm.d).apply(null, arguments);
};
Module._malloc = function () {
  return (Module._malloc = Module.asm.e).apply(null, arguments);
};
var H = (Module.stackAlloc = function () {
    return (H = Module.stackAlloc = Module.asm.f).apply(null, arguments);
  }),
  la = (Module.stackRestore = function () {
    return (la = Module.stackRestore = Module.asm.g).apply(null, arguments);
  }),
  ja = (Module.stackSave = function () {
    return (ja = Module.stackSave = Module.asm.h).apply(null, arguments);
  });
Module.cwrap = function (a, b, c, f) {
  c = c || [];
  var h = c.every(function (n) {
    return "number" === n;
  });
  return "string" !== b && h && !f
    ? ha(a)
    : function () {
        return ia(a, b, c, arguments);
      };
};
Module.setValue = function (a, b, c) {
  c = c || "i8";
  "*" === c.charAt(c.length - 1) && (c = "i32");
  switch (c) {
    case "i1":
      J[a >> 0] = b;
      break;
    case "i8":
      J[a >> 0] = b;
      break;
    case "i16":
      L[a >> 1] = b;
      break;
    case "i32":
      M[a >> 2] = b;
      break;
    case "i64":
      Aa = [
        b >>> 0,
        ((Y = b),
        1 <= +ra(Y)
          ? 0 < Y
            ? (va(+ua(Y / 4294967296), 4294967295) | 0) >>> 0
            : ~~+sa((Y - +(~~Y >>> 0)) / 4294967296) >>> 0
          : 0),
      ];
      M[a >> 2] = Aa[0];
      M[(a + 4) >> 2] = Aa[1];
      break;
    case "float":
      N[a >> 2] = b;
      break;
    case "double":
      O[a >> 3] = b;
      break;
    default:
      D("invalid type for setValue: " + c);
  }
};
Module.getValue = function (a, b) {
  b = b || "i8";
  "*" === b.charAt(b.length - 1) && (b = "i32");
  switch (b) {
    case "i1":
      return J[a >> 0];
    case "i8":
      return J[a >> 0];
    case "i16":
      return L[a >> 1];
    case "i32":
      return M[a >> 2];
    case "i64":
      return M[a >> 2];
    case "float":
      return N[a >> 2];
    case "double":
      return O[a >> 3];
    default:
      D("invalid type for getValue: " + b);
  }
  return null;
};
var Z;
U = function Ba() {
  Z || Ca();
  Z || (U = Ba);
};
function Ca() {
  function a() {
    if (!Z && ((Z = !0), (Module.calledRun = !0), !ea)) {
      R(na);
      R(oa);
      if (Module.onRuntimeInitialized) Module.onRuntimeInitialized();
      if (Module.postRun)
        for (
          "function" == typeof Module.postRun &&
          (Module.postRun = [Module.postRun]);
          Module.postRun.length;

        ) {
          var b = Module.postRun.shift();
          pa.unshift(b);
        }
      R(pa);
    }
  }
  if (!(0 < S)) {
    if (Module.preRun)
      for (
        "function" == typeof Module.preRun && (Module.preRun = [Module.preRun]);
        Module.preRun.length;

      )
        qa();
    R(ma);
    0 < S ||
      (Module.setStatus
        ? (Module.setStatus("Running..."),
          setTimeout(function () {
            setTimeout(function () {
              Module.setStatus("");
            }, 1);
            a();
          }, 1))
        : a());
  }
}
Module.run = Ca;
if (Module.preInit)
  for (
    "function" == typeof Module.preInit && (Module.preInit = [Module.preInit]);
    0 < Module.preInit.length;

  )
    Module.preInit.pop()();
noExitRuntime = !0;
Ca();
const Da = Module.cwrap("gol", "number", ["number", "number", "number"]);
function Ea(a) {
  const b = [],
    c = [];
  a.forEach((q) => {
    c.push(q.x);
    c.push(q.y);
  });
  var f = new Int32Array(c);
  const h = f.length,
    n = f.BYTES_PER_ELEMENT;
  a = Module._malloc(h * n * 8);
  const C = Module._malloc(h * n * 12);
  Module.HEAP32.set(f, a / n);
  f = 2 * Da(a, C, h / 2);
  f = [...new Int32Array(Module.HEAP32.buffer, a, f)];
  Module._free(a);
  Module._free(C);
  for (a = 0; a < f.length; a += 2) b.push({ x: f[a], y: f[a + 1] });
  return b;
}
onmessage = (a) => {
  postMessage(Ea(a.data));
};
