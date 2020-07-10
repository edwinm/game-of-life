"use strict";
var Module;
Module || (Module = typeof Module !== "undefined" ? Module : {});
var n = {},
  q;
for (q in Module) Module.hasOwnProperty(q) && (n[q] = Module[q]);
var r = !1,
  u = !1,
  v = !1,
  aa = !1;
r = "object" === typeof window;
u = "function" === typeof importScripts;
v =
  "object" === typeof process &&
  "object" === typeof process.versions &&
  "string" === typeof process.versions.node;
aa = !r && !v && !u;
var x = "",
  y,
  z,
  A,
  B;
if (v)
  (x = u ? require("path").dirname(x) + "/" : __dirname + "/"),
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
    process.on("unhandledRejection", C),
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
else if (r || u)
  u
    ? (x = self.location.href)
    : document.currentScript && (x = document.currentScript.src),
    (x = 0 !== x.indexOf("blob:") ? x.substr(0, x.lastIndexOf("/") + 1) : ""),
    (y = function (a) {
      var b = new XMLHttpRequest();
      b.open("GET", a, !1);
      b.send(null);
      return b.responseText;
    }),
    u &&
      (z = function (a) {
        var b = new XMLHttpRequest();
        b.open("GET", a, !1);
        b.responseType = "arraybuffer";
        b.send(null);
        return new Uint8Array(b.response);
      });
var ba = Module.print || console.log.bind(console),
  D = Module.printErr || console.warn.bind(console);
for (q in n) n.hasOwnProperty(q) && (Module[q] = n[q]);
n = null;
var ca = {
    "f64-rem": function (a, b) {
      return a % b;
    },
    debugger: function () {},
  },
  E;
Module.wasmBinary && (E = Module.wasmBinary);
var noExitRuntime;
Module.noExitRuntime && (noExitRuntime = Module.noExitRuntime);
"object" !== typeof WebAssembly && D("no native wasm support detected");
var F,
  da = new WebAssembly.Table({ initial: 0, maximum: 0, element: "anyfunc" }),
  ea = !1;
function assert(a, b) {
  a || C("Assertion failed: " + b);
}
function fa(a) {
  var b = Module["_" + a];
  assert(b, "Cannot call unknown function " + a + ", make sure it is exported");
  return b;
}
function ia(a, b, c, g) {
  var l = {
      string: function (d) {
        var m = 0;
        if (null !== d && void 0 !== d && 0 !== d) {
          var k = (d.length << 2) + 1;
          m = G(k);
          var f = m,
            e = H;
          if (0 < k) {
            k = f + k - 1;
            for (var t = 0; t < d.length; ++t) {
              var h = d.charCodeAt(t);
              if (55296 <= h && 57343 >= h) {
                var va = d.charCodeAt(++t);
                h = (65536 + ((h & 1023) << 10)) | (va & 1023);
              }
              if (127 >= h) {
                if (f >= k) break;
                e[f++] = h;
              } else {
                if (2047 >= h) {
                  if (f + 1 >= k) break;
                  e[f++] = 192 | (h >> 6);
                } else {
                  if (65535 >= h) {
                    if (f + 2 >= k) break;
                    e[f++] = 224 | (h >> 12);
                  } else {
                    if (f + 3 >= k) break;
                    e[f++] = 240 | (h >> 18);
                    e[f++] = 128 | ((h >> 12) & 63);
                  }
                  e[f++] = 128 | ((h >> 6) & 63);
                }
                e[f++] = 128 | (h & 63);
              }
            }
            e[f] = 0;
          }
        }
        return m;
      },
      array: function (d) {
        var m = G(d.length);
        I.set(d, m);
        return m;
      },
    },
    p = fa(a),
    T = [];
  a = 0;
  if (g)
    for (var w = 0; w < g.length; w++) {
      var ha = l[c[w]];
      ha ? (0 === a && (a = ja()), (T[w] = ha(g[w]))) : (T[w] = g[w]);
    }
  c = p.apply(null, T);
  c = (function (d) {
    if ("string" === b)
      if (d) {
        for (var m = H, k = d + NaN, f = d; m[f] && !(f >= k); ) ++f;
        if (16 < f - d && m.subarray && ka) d = ka.decode(m.subarray(d, f));
        else {
          for (k = ""; d < f; ) {
            var e = m[d++];
            if (e & 128) {
              var t = m[d++] & 63;
              if (192 == (e & 224))
                k += String.fromCharCode(((e & 31) << 6) | t);
              else {
                var h = m[d++] & 63;
                e =
                  224 == (e & 240)
                    ? ((e & 15) << 12) | (t << 6) | h
                    : ((e & 7) << 18) | (t << 12) | (h << 6) | (m[d++] & 63);
                65536 > e
                  ? (k += String.fromCharCode(e))
                  : ((e -= 65536),
                    (k += String.fromCharCode(
                      55296 | (e >> 10),
                      56320 | (e & 1023)
                    )));
              }
            } else k += String.fromCharCode(e);
          }
          d = k;
        }
      } else d = "";
    else d = "boolean" === b ? !!d : d;
    return d;
  })(c);
  0 !== a && la(a);
  return c;
}
var ka = "undefined" !== typeof TextDecoder ? new TextDecoder("utf8") : void 0,
  J,
  I,
  H,
  K,
  L,
  M,
  N,
  O = Module.INITIAL_MEMORY || 16777216;
Module.wasmMemory
  ? (F = Module.wasmMemory)
  : (F = new WebAssembly.Memory({ initial: O / 65536, maximum: O / 65536 }));
F && (J = F.buffer);
O = J.byteLength;
var P = J;
J = P;
Module.HEAP8 = I = new Int8Array(P);
Module.HEAP16 = K = new Int16Array(P);
Module.HEAP32 = L = new Int32Array(P);
Module.HEAPU8 = H = new Uint8Array(P);
Module.HEAPU16 = new Uint16Array(P);
Module.HEAPU32 = new Uint32Array(P);
Module.HEAPF32 = M = new Float32Array(P);
Module.HEAPF64 = N = new Float64Array(P);
L[640] = 5245632;
function Q(a) {
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
  ta = Math.floor,
  ua = Math.min,
  R = 0,
  S = null,
  U = null;
Module.preloadedImages = {};
Module.preloadedAudios = {};
function C(a) {
  if (Module.onAbort) Module.onAbort(a);
  ba(a);
  D(a);
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
    if (E) return new Uint8Array(E);
    if (z) return z(W);
    throw "both async and sync fetching of the wasm failed";
  } catch (a) {
    C(a);
  }
}
function za() {
  return E || (!r && !u) || "function" !== typeof fetch || V("file://")
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
  function a(l) {
    Module.asm = l.exports;
    R--;
    Module.monitorRunDependencies && Module.monitorRunDependencies(R);
    0 == R &&
      (null !== S && (clearInterval(S), (S = null)),
      U && ((l = U), (U = null), l()));
  }
  function b(l) {
    a(l.instance);
  }
  function c(l) {
    return za()
      .then(function (p) {
        return WebAssembly.instantiate(p, g);
      })
      .then(l, function (p) {
        D("failed to asynchronously prepare wasm: " + p);
        C(p);
      });
  }
  var g = {
    env: Aa,
    wasi_snapshot_preview1: Aa,
    global: { NaN, Infinity },
    "global.Math": Math,
    asm2wasm: ca,
  };
  R++;
  Module.monitorRunDependencies && Module.monitorRunDependencies(R);
  if (Module.instantiateWasm)
    try {
      return Module.instantiateWasm(g, a);
    } catch (l) {
      return D("Module.instantiateWasm callback failed with error: " + l), !1;
    }
  (function () {
    if (
      E ||
      "function" !== typeof WebAssembly.instantiateStreaming ||
      wa() ||
      V("file://") ||
      "function" !== typeof fetch
    )
      return c(b);
    fetch(W, { credentials: "same-origin" }).then(function (l) {
      return WebAssembly.instantiateStreaming(l, g).then(b, function (p) {
        D("wasm streaming compile failed: " + p);
        D("falling back to ArrayBuffer instantiation");
        return c(b);
      });
    });
  })();
  return {};
};
var X,
  Ba,
  Aa = {
    __memory_base: 1024,
    __table_base: 0,
    b: function () {
      return H.length;
    },
    a: function () {
      C("OOM");
    },
    memory: F,
    table: da,
  };
Module.asm({}, Aa, J);
Module._free = function () {
  return (Module._free = Module.asm.c).apply(null, arguments);
};
Module._gol = function () {
  return (Module._gol = Module.asm.d).apply(null, arguments);
};
Module._malloc = function () {
  return (Module._malloc = Module.asm.e).apply(null, arguments);
};
var G = (Module.stackAlloc = function () {
    return (G = Module.stackAlloc = Module.asm.f).apply(null, arguments);
  }),
  la = (Module.stackRestore = function () {
    return (la = Module.stackRestore = Module.asm.g).apply(null, arguments);
  }),
  ja = (Module.stackSave = function () {
    return (ja = Module.stackSave = Module.asm.h).apply(null, arguments);
  });
Module.cwrap = function (a, b, c, g) {
  c = c || [];
  var l = c.every(function (p) {
    return "number" === p;
  });
  return "string" !== b && l && !g
    ? fa(a)
    : function () {
        return ia(a, b, c, arguments);
      };
};
Module.setValue = function (a, b, c) {
  c = c || "i8";
  "*" === c.charAt(c.length - 1) && (c = "i32");
  switch (c) {
    case "i1":
      I[a >> 0] = b;
      break;
    case "i8":
      I[a >> 0] = b;
      break;
    case "i16":
      K[a >> 1] = b;
      break;
    case "i32":
      L[a >> 2] = b;
      break;
    case "i64":
      Ba = [
        b >>> 0,
        ((X = b),
        1 <= +ra(X)
          ? 0 < X
            ? (ua(+ta(X / 4294967296), 4294967295) | 0) >>> 0
            : ~~+sa((X - +(~~X >>> 0)) / 4294967296) >>> 0
          : 0),
      ];
      L[a >> 2] = Ba[0];
      L[(a + 4) >> 2] = Ba[1];
      break;
    case "float":
      M[a >> 2] = b;
      break;
    case "double":
      N[a >> 3] = b;
      break;
    default:
      C("invalid type for setValue: " + c);
  }
};
Module.getValue = function (a, b) {
  b = b || "i8";
  "*" === b.charAt(b.length - 1) && (b = "i32");
  switch (b) {
    case "i1":
      return I[a >> 0];
    case "i8":
      return I[a >> 0];
    case "i16":
      return K[a >> 1];
    case "i32":
      return L[a >> 2];
    case "i64":
      return L[a >> 2];
    case "float":
      return M[a >> 2];
    case "double":
      return N[a >> 3];
    default:
      C("invalid type for getValue: " + b);
  }
  return null;
};
var Y;
U = function Ca() {
  Y || Da();
  Y || (U = Ca);
};
function Da() {
  function a() {
    if (!Y && ((Y = !0), (Module.calledRun = !0), !ea)) {
      Q(na);
      Q(oa);
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
      Q(pa);
    }
  }
  if (!(0 < R)) {
    if (Module.preRun)
      for (
        "function" == typeof Module.preRun && (Module.preRun = [Module.preRun]);
        Module.preRun.length;

      )
        qa();
    Q(ma);
    0 < R ||
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
Module.run = Da;
if (Module.preInit)
  for (
    "function" == typeof Module.preInit && (Module.preInit = [Module.preInit]);
    0 < Module.preInit.length;

  )
    Module.preInit.pop()();
noExitRuntime = !0;
Da();
const Ea = Module.cwrap("gol", "number", ["number", "number", "number"]);
let Z = null,
  Fa = null;
onmessage = (a) => {
  const b = [],
    c = [];
  null == Z && ((Z = Module._malloc(32e4)), (Fa = Module._malloc(48e4)));
  a.data.forEach((g) => {
    c.push(g.x, g.y);
  });
  a = new Int32Array(c);
  Module.HEAP32.set(a, Z / a.BYTES_PER_ELEMENT);
  a = 2 * Ea(Z, Fa, a.length / 2);
  a = new Int32Array(Module.HEAP32.buffer, Z, a);
  for (let g = 0; g < a.length; g += 2) b.push({ x: a[g], y: a[g + 1] });
  postMessage(b);
};
