"use strict";
var aa =
  "function" == typeof Object.defineProperties
    ? Object.defineProperty
    : function (a, c, d) {
        a != Array.prototype && a != Object.prototype && (a[c] = d.value);
      };
function ba(a) {
  a = [
    "object" == typeof window && window,
    "object" == typeof self && self,
    "object" == typeof global && global,
    a,
  ];
  for (var c = 0; c < a.length; ++c) {
    var d = a[c];
    if (d && d.Math == Math) return d;
  }
  throw Error("Cannot find global object");
}
var ca = ba(this);
function da(a, c) {
  if (c) {
    var d = ca;
    a = a.split(".");
    for (var g = 0; g < a.length - 1; g++) {
      var e = a[g];
      e in d || (d[e] = {});
      d = d[e];
    }
    a = a[a.length - 1];
    g = d[a];
    c = c(g);
    c != g &&
      null != c &&
      aa(d, a, { configurable: !0, writable: !0, value: c });
  }
}
da("Array.prototype.flat", function (a) {
  return a
    ? a
    : function (c) {
        c = void 0 === c ? 1 : c;
        for (var d = [], g = 0; g < this.length; g++) {
          var e = this[g];
          Array.isArray(e) && 0 < c
            ? ((e = Array.prototype.flat.call(e, c - 1)), d.push.apply(d, e))
            : d.push(e);
        }
        return d;
      };
});
var b;
b || (b = typeof Module !== "undefined" ? Module : {});
var q = {},
  r;
for (r in b) b.hasOwnProperty(r) && (q[r] = b[r]);
var t = !1,
  v = !1,
  w = !1,
  ea = !1;
t = "object" === typeof window;
v = "function" === typeof importScripts;
w =
  "object" === typeof process &&
  "object" === typeof process.versions &&
  "string" === typeof process.versions.node;
ea = !t && !w && !v;
var y = "",
  z,
  A,
  B,
  C;
if (w)
  (y = v ? require("path").dirname(y) + "/" : __dirname + "/"),
    (z = function (a, c) {
      B || (B = require("fs"));
      C || (C = require("path"));
      a = C.normalize(a);
      return B.readFileSync(a, c ? null : "utf8");
    }),
    (A = function (a) {
      a = z(a, !0);
      a.buffer || (a = new Uint8Array(a));
      assert(a.buffer);
      return a;
    }),
    1 < process.argv.length && process.argv[1].replace(/\\/g, "/"),
    process.argv.slice(2),
    "undefined" !== typeof module && (module.exports = b),
    process.on("uncaughtException", function (a) {
      throw a;
    }),
    process.on("unhandledRejection", D),
    (b.inspect = function () {
      return "[Emscripten Module object]";
    });
else if (ea)
  "undefined" != typeof read &&
    (z = function (a) {
      return read(a);
    }),
    (A = function (a) {
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
    ? (y = self.location.href)
    : document.currentScript && (y = document.currentScript.src),
    (y = 0 !== y.indexOf("blob:") ? y.substr(0, y.lastIndexOf("/") + 1) : ""),
    (z = function (a) {
      var c = new XMLHttpRequest();
      c.open("GET", a, !1);
      c.send(null);
      return c.responseText;
    }),
    v &&
      (A = function (a) {
        var c = new XMLHttpRequest();
        c.open("GET", a, !1);
        c.responseType = "arraybuffer";
        c.send(null);
        return new Uint8Array(c.response);
      });
var fa = b.print || console.log.bind(console),
  E = b.printErr || console.warn.bind(console);
for (r in q) q.hasOwnProperty(r) && (b[r] = q[r]);
q = null;
var ia = {
    "f64-rem": function (a, c) {
      return a % c;
    },
    debugger: function () {},
  },
  F;
b.wasmBinary && (F = b.wasmBinary);
var noExitRuntime;
b.noExitRuntime && (noExitRuntime = b.noExitRuntime);
"object" !== typeof WebAssembly && E("no native wasm support detected");
var G,
  ja = new WebAssembly.Table({ initial: 0, maximum: 0, element: "anyfunc" }),
  ka = !1;
function assert(a, c) {
  a || D("Assertion failed: " + c);
}
function la(a) {
  var c = b["_" + a];
  assert(c, "Cannot call unknown function " + a + ", make sure it is exported");
  return c;
}
function ma(a, c, d, g) {
  var e = {
      string: function (f) {
        var n = 0;
        if (null !== f && void 0 !== f && 0 !== f) {
          var m = (f.length << 2) + 1;
          n = H(m);
          var k = n,
            h = I;
          if (0 < m) {
            m = k + m - 1;
            for (var u = 0; u < f.length; ++u) {
              var l = f.charCodeAt(u);
              if (55296 <= l && 57343 >= l) {
                var ya = f.charCodeAt(++u);
                l = (65536 + ((l & 1023) << 10)) | (ya & 1023);
              }
              if (127 >= l) {
                if (k >= m) break;
                h[k++] = l;
              } else {
                if (2047 >= l) {
                  if (k + 1 >= m) break;
                  h[k++] = 192 | (l >> 6);
                } else {
                  if (65535 >= l) {
                    if (k + 2 >= m) break;
                    h[k++] = 224 | (l >> 12);
                  } else {
                    if (k + 3 >= m) break;
                    h[k++] = 240 | (l >> 18);
                    h[k++] = 128 | ((l >> 12) & 63);
                  }
                  h[k++] = 128 | ((l >> 6) & 63);
                }
                h[k++] = 128 | (l & 63);
              }
            }
            h[k] = 0;
          }
        }
        return n;
      },
      array: function (f) {
        var n = H(f.length);
        J.set(f, n);
        return n;
      },
    },
    p = la(a),
    T = [];
  a = 0;
  if (g)
    for (var x = 0; x < g.length; x++) {
      var ha = e[d[x]];
      ha ? (0 === a && (a = na()), (T[x] = ha(g[x]))) : (T[x] = g[x]);
    }
  d = p.apply(null, T);
  d = (function (f) {
    if ("string" === c)
      if (f) {
        for (var n = I, m = f + NaN, k = f; n[k] && !(k >= m); ) ++k;
        if (16 < k - f && n.subarray && oa) f = oa.decode(n.subarray(f, k));
        else {
          for (m = ""; f < k; ) {
            var h = n[f++];
            if (h & 128) {
              var u = n[f++] & 63;
              if (192 == (h & 224))
                m += String.fromCharCode(((h & 31) << 6) | u);
              else {
                var l = n[f++] & 63;
                h =
                  224 == (h & 240)
                    ? ((h & 15) << 12) | (u << 6) | l
                    : ((h & 7) << 18) | (u << 12) | (l << 6) | (n[f++] & 63);
                65536 > h
                  ? (m += String.fromCharCode(h))
                  : ((h -= 65536),
                    (m += String.fromCharCode(
                      55296 | (h >> 10),
                      56320 | (h & 1023)
                    )));
              }
            } else m += String.fromCharCode(h);
          }
          f = m;
        }
      } else f = "";
    else f = "boolean" === c ? !!f : f;
    return f;
  })(d);
  0 !== a && pa(a);
  return d;
}
var oa = "undefined" !== typeof TextDecoder ? new TextDecoder("utf8") : void 0,
  K,
  J,
  I,
  L,
  M,
  N,
  O,
  P = b.INITIAL_MEMORY || 16777216;
b.wasmMemory
  ? (G = b.wasmMemory)
  : (G = new WebAssembly.Memory({ initial: P / 65536, maximum: P / 65536 }));
G && (K = G.buffer);
P = K.byteLength;
var Q = K;
K = Q;
b.HEAP8 = J = new Int8Array(Q);
b.HEAP16 = L = new Int16Array(Q);
b.HEAP32 = M = new Int32Array(Q);
b.HEAPU8 = I = new Uint8Array(Q);
b.HEAPU16 = new Uint16Array(Q);
b.HEAPU32 = new Uint32Array(Q);
b.HEAPF32 = N = new Float32Array(Q);
b.HEAPF64 = O = new Float64Array(Q);
M[640] = 5245632;
function R(a) {
  for (; 0 < a.length; ) {
    var c = a.shift();
    if ("function" == typeof c) c(b);
    else {
      var d = c.j;
      "number" === typeof d
        ? void 0 === c.i
          ? b.dynCall_v(d)
          : b.dynCall_vi(d, c.i)
        : d(void 0 === c.i ? null : c.i);
    }
  }
}
var qa = [],
  ra = [],
  sa = [],
  ta = [];
function ua() {
  var a = b.preRun.shift();
  qa.unshift(a);
}
var va = Math.abs,
  wa = Math.ceil,
  xa = Math.floor,
  za = Math.min,
  S = 0,
  U = null,
  V = null;
b.preloadedImages = {};
b.preloadedAudios = {};
function D(a) {
  if (b.onAbort) b.onAbort(a);
  fa(a);
  E(a);
  ka = !0;
  throw new WebAssembly.RuntimeError(
    "abort(" + a + "). Build with -s ASSERTIONS=1 for more info."
  );
}
function W(a) {
  var c = X;
  return String.prototype.startsWith ? c.startsWith(a) : 0 === c.indexOf(a);
}
function Aa() {
  return W("data:application/octet-stream;base64,");
}
var X = "gof.wasm";
if (!Aa()) {
  var Ba = X;
  X = b.locateFile ? b.locateFile(Ba, y) : y + Ba;
}
function Ca() {
  try {
    if (F) return new Uint8Array(F);
    if (A) return A(X);
    throw "both async and sync fetching of the wasm failed";
  } catch (a) {
    D(a);
  }
}
function Da() {
  return F || (!t && !v) || "function" !== typeof fetch || W("file://")
    ? new Promise(function (a) {
        a(Ca());
      })
    : fetch(X, { credentials: "same-origin" })
        .then(function (a) {
          if (!a.ok) throw "failed to load wasm binary file at '" + X + "'";
          return a.arrayBuffer();
        })
        .catch(function () {
          return Ca();
        });
}
b.asm = function () {
  function a(e) {
    b.asm = e.exports;
    S--;
    b.monitorRunDependencies && b.monitorRunDependencies(S);
    0 == S &&
      (null !== U && (clearInterval(U), (U = null)),
      V && ((e = V), (V = null), e()));
  }
  function c(e) {
    a(e.instance);
  }
  function d(e) {
    return Da()
      .then(function (p) {
        return WebAssembly.instantiate(p, g);
      })
      .then(e, function (p) {
        E("failed to asynchronously prepare wasm: " + p);
        D(p);
      });
  }
  var g = {
    env: Ea,
    wasi_snapshot_preview1: Ea,
    global: { NaN, Infinity },
    "global.Math": Math,
    asm2wasm: ia,
  };
  S++;
  b.monitorRunDependencies && b.monitorRunDependencies(S);
  if (b.instantiateWasm)
    try {
      return b.instantiateWasm(g, a);
    } catch (e) {
      return E("Module.instantiateWasm callback failed with error: " + e), !1;
    }
  (function () {
    if (
      F ||
      "function" !== typeof WebAssembly.instantiateStreaming ||
      Aa() ||
      W("file://") ||
      "function" !== typeof fetch
    )
      return d(c);
    fetch(X, { credentials: "same-origin" }).then(function (e) {
      return WebAssembly.instantiateStreaming(e, g).then(c, function (p) {
        E("wasm streaming compile failed: " + p);
        E("falling back to ArrayBuffer instantiation");
        return d(c);
      });
    });
  })();
  return {};
};
var Y,
  Fa,
  Ea = {
    __memory_base: 1024,
    __table_base: 0,
    b: function () {
      return I.length;
    },
    a: function () {
      D("OOM");
    },
    memory: G,
    table: ja,
  };
b.asm({}, Ea, K);
b._free = function () {
  return (b._free = b.asm.c).apply(null, arguments);
};
b._gof = function () {
  return (b._gof = b.asm.d).apply(null, arguments);
};
b._malloc = function () {
  return (b._malloc = b.asm.e).apply(null, arguments);
};
var H = (b.stackAlloc = function () {
    return (H = b.stackAlloc = b.asm.f).apply(null, arguments);
  }),
  pa = (b.stackRestore = function () {
    return (pa = b.stackRestore = b.asm.g).apply(null, arguments);
  }),
  na = (b.stackSave = function () {
    return (na = b.stackSave = b.asm.h).apply(null, arguments);
  });
b.cwrap = function (a, c, d, g) {
  d = d || [];
  var e = d.every(function (p) {
    return "number" === p;
  });
  return "string" !== c && e && !g
    ? la(a)
    : function () {
        return ma(a, c, d, arguments);
      };
};
b.setValue = function (a, c, d) {
  d = d || "i8";
  "*" === d.charAt(d.length - 1) && (d = "i32");
  switch (d) {
    case "i1":
      J[a >> 0] = c;
      break;
    case "i8":
      J[a >> 0] = c;
      break;
    case "i16":
      L[a >> 1] = c;
      break;
    case "i32":
      M[a >> 2] = c;
      break;
    case "i64":
      Fa = [
        c >>> 0,
        ((Y = c),
        1 <= +va(Y)
          ? 0 < Y
            ? (za(+xa(Y / 4294967296), 4294967295) | 0) >>> 0
            : ~~+wa((Y - +(~~Y >>> 0)) / 4294967296) >>> 0
          : 0),
      ];
      M[a >> 2] = Fa[0];
      M[(a + 4) >> 2] = Fa[1];
      break;
    case "float":
      N[a >> 2] = c;
      break;
    case "double":
      O[a >> 3] = c;
      break;
    default:
      D("invalid type for setValue: " + d);
  }
};
b.getValue = function (a, c) {
  c = c || "i8";
  "*" === c.charAt(c.length - 1) && (c = "i32");
  switch (c) {
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
      D("invalid type for getValue: " + c);
  }
  return null;
};
var Z;
V = function Ga() {
  Z || Ha();
  Z || (V = Ga);
};
function Ha() {
  function a() {
    if (!Z && ((Z = !0), (b.calledRun = !0), !ka)) {
      R(ra);
      R(sa);
      if (b.onRuntimeInitialized) b.onRuntimeInitialized();
      if (b.postRun)
        for (
          "function" == typeof b.postRun && (b.postRun = [b.postRun]);
          b.postRun.length;

        ) {
          var c = b.postRun.shift();
          ta.unshift(c);
        }
      R(ta);
    }
  }
  if (!(0 < S)) {
    if (b.preRun)
      for (
        "function" == typeof b.preRun && (b.preRun = [b.preRun]);
        b.preRun.length;

      )
        ua();
    R(qa);
    0 < S ||
      (b.setStatus
        ? (b.setStatus("Running..."),
          setTimeout(function () {
            setTimeout(function () {
              b.setStatus("");
            }, 1);
            a();
          }, 1))
        : a());
  }
}
b.run = Ha;
if (b.preInit)
  for (
    "function" == typeof b.preInit && (b.preInit = [b.preInit]);
    0 < b.preInit.length;

  )
    b.preInit.pop()();
noExitRuntime = !0;
Ha();
var Ia = b.cwrap("gof", "number", ["number", "number", "number"]);
onmessage = function (a) {
  var c = [];
  a = a.data.flat();
  var d = new Int32Array(a),
    g = d.length,
    e = d.BYTES_PER_ELEMENT;
  a = b._malloc(g * e * 8);
  var p = b._malloc(g * e * 12);
  b.HEAP32.set(d, a / e);
  d = 2 * Ia(a, p, g / 2);
  d = [...new Int32Array(b.HEAP32.buffer, a, d)];
  b._free(a);
  b._free(p);
  for (a = 0; a < d.length; a += 2) c.push([d[a], d[a + 1]]);
  postMessage(c);
};
