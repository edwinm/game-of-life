"use strict";
var aa =
  "function" == typeof Object.defineProperties
    ? Object.defineProperty
    : function (a, b, c) {
        a != Array.prototype && a != Object.prototype && (a[b] = c.value);
      };
function ba(a) {
  a = [
    "object" == typeof window && window,
    "object" == typeof self && self,
    "object" == typeof global && global,
    a,
  ];
  for (var b = 0; b < a.length; ++b) {
    var c = a[b];
    if (c && c.Math == Math) return c;
  }
  throw Error("Cannot find global object");
}
var ca = ba(this);
function da(a, b) {
  if (b) {
    var c = ca;
    a = a.split(".");
    for (var f = 0; f < a.length - 1; f++) {
      var d = a[f];
      d in c || (c[d] = {});
      c = c[d];
    }
    a = a[a.length - 1];
    f = c[a];
    b = b(f);
    b != f &&
      null != b &&
      aa(c, a, { configurable: !0, writable: !0, value: b });
  }
}
da("Array.prototype.flat", function (a) {
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
});
var Module;
Module || (Module = typeof Module !== "undefined" ? Module : {});
var p = {},
  q;
for (q in Module) Module.hasOwnProperty(q) && (p[q] = Module[q]);
var r = !1,
  u = !1,
  v = !1,
  ea = !1;
r = "object" === typeof window;
u = "function" === typeof importScripts;
v =
  "object" === typeof process &&
  "object" === typeof process.versions &&
  "string" === typeof process.versions.node;
ea = !r && !v && !u;
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
else if (ea)
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
var ha = Module.print || console.log.bind(console),
  D = Module.printErr || console.warn.bind(console);
for (q in p) p.hasOwnProperty(q) && (Module[q] = p[q]);
p = null;
var ia = {
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
  ja = new WebAssembly.Table({ initial: 0, maximum: 0, element: "anyfunc" }),
  ka = !1;
function assert(a, b) {
  a || C("Assertion failed: " + b);
}
function la(a) {
  var b = Module["_" + a];
  assert(b, "Cannot call unknown function " + a + ", make sure it is exported");
  return b;
}
function ma(a, b, c, f) {
  var d = {
      string: function (e) {
        var m = 0;
        if (null !== e && void 0 !== e && 0 !== e) {
          var l = (e.length << 2) + 1;
          m = G(l);
          var h = m,
            g = H;
          if (0 < l) {
            l = h + l - 1;
            for (var t = 0; t < e.length; ++t) {
              var k = e.charCodeAt(t);
              if (55296 <= k && 57343 >= k) {
                var xa = e.charCodeAt(++t);
                k = (65536 + ((k & 1023) << 10)) | (xa & 1023);
              }
              if (127 >= k) {
                if (h >= l) break;
                g[h++] = k;
              } else {
                if (2047 >= k) {
                  if (h + 1 >= l) break;
                  g[h++] = 192 | (k >> 6);
                } else {
                  if (65535 >= k) {
                    if (h + 2 >= l) break;
                    g[h++] = 224 | (k >> 12);
                  } else {
                    if (h + 3 >= l) break;
                    g[h++] = 240 | (k >> 18);
                    g[h++] = 128 | ((k >> 12) & 63);
                  }
                  g[h++] = 128 | ((k >> 6) & 63);
                }
                g[h++] = 128 | (k & 63);
              }
            }
            g[h] = 0;
          }
        }
        return m;
      },
      array: function (e) {
        var m = G(e.length);
        I.set(e, m);
        return m;
      },
    },
    n = la(a),
    S = [];
  a = 0;
  if (f)
    for (var w = 0; w < f.length; w++) {
      var fa = d[c[w]];
      fa ? (0 === a && (a = na()), (S[w] = fa(f[w]))) : (S[w] = f[w]);
    }
  c = n.apply(null, S);
  c = (function (e) {
    if ("string" === b)
      if (e) {
        for (var m = H, l = e + NaN, h = e; m[h] && !(h >= l); ) ++h;
        if (16 < h - e && m.subarray && oa) e = oa.decode(m.subarray(e, h));
        else {
          for (l = ""; e < h; ) {
            var g = m[e++];
            if (g & 128) {
              var t = m[e++] & 63;
              if (192 == (g & 224))
                l += String.fromCharCode(((g & 31) << 6) | t);
              else {
                var k = m[e++] & 63;
                g =
                  224 == (g & 240)
                    ? ((g & 15) << 12) | (t << 6) | k
                    : ((g & 7) << 18) | (t << 12) | (k << 6) | (m[e++] & 63);
                65536 > g
                  ? (l += String.fromCharCode(g))
                  : ((g -= 65536),
                    (l += String.fromCharCode(
                      55296 | (g >> 10),
                      56320 | (g & 1023)
                    )));
              }
            } else l += String.fromCharCode(g);
          }
          e = l;
        }
      } else e = "";
    else e = "boolean" === b ? !!e : e;
    return e;
  })(c);
  0 !== a && pa(a);
  return c;
}
var oa = "undefined" !== typeof TextDecoder ? new TextDecoder("utf8") : void 0,
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
var qa = [],
  ra = [],
  sa = [],
  ta = [];
function ua() {
  var a = Module.preRun.shift();
  qa.unshift(a);
}
var va = Math.abs,
  wa = Math.ceil,
  ya = Math.floor,
  za = Math.min,
  R = 0,
  T = null,
  U = null;
Module.preloadedImages = {};
Module.preloadedAudios = {};
function C(a) {
  if (Module.onAbort) Module.onAbort(a);
  ha(a);
  D(a);
  ka = !0;
  throw new WebAssembly.RuntimeError(
    "abort(" + a + "). Build with -s ASSERTIONS=1 for more info."
  );
}
function V(a) {
  var b = W;
  return String.prototype.startsWith ? b.startsWith(a) : 0 === b.indexOf(a);
}
function Aa() {
  return V("data:application/octet-stream;base64,");
}
var W = "gof.wasm";
if (!Aa()) {
  var Ba = W;
  W = Module.locateFile ? Module.locateFile(Ba, x) : x + Ba;
}
function Ca() {
  try {
    if (E) return new Uint8Array(E);
    if (z) return z(W);
    throw "both async and sync fetching of the wasm failed";
  } catch (a) {
    C(a);
  }
}
function Da() {
  return E || (!r && !u) || "function" !== typeof fetch || V("file://")
    ? new Promise(function (a) {
        a(Ca());
      })
    : fetch(W, { credentials: "same-origin" })
        .then(function (a) {
          if (!a.ok) throw "failed to load wasm binary file at '" + W + "'";
          return a.arrayBuffer();
        })
        .catch(function () {
          return Ca();
        });
}
Module.asm = function () {
  function a(d) {
    Module.asm = d.exports;
    R--;
    Module.monitorRunDependencies && Module.monitorRunDependencies(R);
    0 == R &&
      (null !== T && (clearInterval(T), (T = null)),
      U && ((d = U), (U = null), d()));
  }
  function b(d) {
    a(d.instance);
  }
  function c(d) {
    return Da()
      .then(function (n) {
        return WebAssembly.instantiate(n, f);
      })
      .then(d, function (n) {
        D("failed to asynchronously prepare wasm: " + n);
        C(n);
      });
  }
  var f = {
    env: X,
    wasi_snapshot_preview1: X,
    global: { NaN, Infinity },
    "global.Math": Math,
    asm2wasm: ia,
  };
  R++;
  Module.monitorRunDependencies && Module.monitorRunDependencies(R);
  if (Module.instantiateWasm)
    try {
      return Module.instantiateWasm(f, a);
    } catch (d) {
      return D("Module.instantiateWasm callback failed with error: " + d), !1;
    }
  (function () {
    if (
      E ||
      "function" !== typeof WebAssembly.instantiateStreaming ||
      Aa() ||
      V("file://") ||
      "function" !== typeof fetch
    )
      return c(b);
    fetch(W, { credentials: "same-origin" }).then(function (d) {
      return WebAssembly.instantiateStreaming(d, f).then(b, function (n) {
        D("wasm streaming compile failed: " + n);
        D("falling back to ArrayBuffer instantiation");
        return c(b);
      });
    });
  })();
  return {};
};
var Y,
  Ea,
  X = {
    __memory_base: 1024,
    __table_base: 0,
    b: function () {
      return H.length;
    },
    a: function () {
      C("OOM");
    },
    memory: F,
    table: ja,
  };
Module.asm({}, X, J);
Module._free = function () {
  return (Module._free = Module.asm.c).apply(null, arguments);
};
Module._gof = function () {
  return (Module._gof = Module.asm.d).apply(null, arguments);
};
Module._malloc = function () {
  return (Module._malloc = Module.asm.e).apply(null, arguments);
};
var G = (Module.stackAlloc = function () {
    return (G = Module.stackAlloc = Module.asm.f).apply(null, arguments);
  }),
  pa = (Module.stackRestore = function () {
    return (pa = Module.stackRestore = Module.asm.g).apply(null, arguments);
  }),
  na = (Module.stackSave = function () {
    return (na = Module.stackSave = Module.asm.h).apply(null, arguments);
  });
Module.cwrap = function (a, b, c, f) {
  c = c || [];
  var d = c.every(function (n) {
    return "number" === n;
  });
  return "string" !== b && d && !f
    ? la(a)
    : function () {
        return ma(a, b, c, arguments);
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
      Ea = [
        b >>> 0,
        ((Y = b),
        1 <= +va(Y)
          ? 0 < Y
            ? (za(+ya(Y / 4294967296), 4294967295) | 0) >>> 0
            : ~~+wa((Y - +(~~Y >>> 0)) / 4294967296) >>> 0
          : 0),
      ];
      L[a >> 2] = Ea[0];
      L[(a + 4) >> 2] = Ea[1];
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
var Z;
U = function Fa() {
  Z || Ga();
  Z || (U = Fa);
};
function Ga() {
  function a() {
    if (!Z && ((Z = !0), (Module.calledRun = !0), !ka)) {
      Q(ra);
      Q(sa);
      if (Module.onRuntimeInitialized) Module.onRuntimeInitialized();
      if (Module.postRun)
        for (
          "function" == typeof Module.postRun &&
          (Module.postRun = [Module.postRun]);
          Module.postRun.length;

        ) {
          var b = Module.postRun.shift();
          ta.unshift(b);
        }
      Q(ta);
    }
  }
  if (!(0 < R)) {
    if (Module.preRun)
      for (
        "function" == typeof Module.preRun && (Module.preRun = [Module.preRun]);
        Module.preRun.length;

      )
        ua();
    Q(qa);
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
Module.run = Ga;
if (Module.preInit)
  for (
    "function" == typeof Module.preInit && (Module.preInit = [Module.preInit]);
    0 < Module.preInit.length;

  )
    Module.preInit.pop()();
noExitRuntime = !0;
Ga();
var Ha = Module.cwrap("gof", "number", ["number", "number", "number"]);
onmessage = function (a) {
  var b = [];
  a = a.data.flat();
  var c = new Int32Array(a),
    f = c.length,
    d = c.BYTES_PER_ELEMENT;
  a = Module._malloc(f * d * 8);
  var n = Module._malloc(f * d * 12);
  Module.HEAP32.set(c, a / d);
  c = 2 * Ha(a, n, f / 2);
  c = [...new Int32Array(Module.HEAP32.buffer, a, c)];
  Module._free(a);
  Module._free(n);
  for (a = 0; a < c.length; a += 2) b.push([c[a], c[a + 1]]);
  postMessage(b);
};
