var a;
a || (a = typeof Module !== "undefined" ? Module : {});
var q = {},
  r;
for (r in a) a.hasOwnProperty(r) && (q[r] = a[r]);
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
var y = "",
  z,
  A,
  B,
  C;
if (w)
  (y = v ? require("path").dirname(y) + "/" : __dirname + "/"),
    (z = function (b, c) {
      B || (B = require("fs"));
      C || (C = require("path"));
      b = C.normalize(b);
      return B.readFileSync(b, c ? null : "utf8");
    }),
    (A = function (b) {
      b = z(b, !0);
      b.buffer || (b = new Uint8Array(b));
      assert(b.buffer);
      return b;
    }),
    1 < process.argv.length && process.argv[1].replace(/\\/g, "/"),
    process.argv.slice(2),
    "undefined" !== typeof module && (module.exports = a),
    process.on("uncaughtException", function (b) {
      throw b;
    }),
    process.on("unhandledRejection", D),
    (a.inspect = function () {
      return "[Emscripten Module object]";
    });
else if (aa)
  "undefined" != typeof read &&
    (z = function (b) {
      return read(b);
    }),
    (A = function (b) {
      if ("function" === typeof readbuffer)
        return new Uint8Array(readbuffer(b));
      b = read(b, "binary");
      assert("object" === typeof b);
      return b;
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
    (z = function (b) {
      var c = new XMLHttpRequest();
      c.open("GET", b, !1);
      c.send(null);
      return c.responseText;
    }),
    v &&
      (A = function (b) {
        var c = new XMLHttpRequest();
        c.open("GET", b, !1);
        c.responseType = "arraybuffer";
        c.send(null);
        return new Uint8Array(c.response);
      });
var ba = a.print || console.log.bind(console),
  E = a.printErr || console.warn.bind(console);
for (r in q) q.hasOwnProperty(r) && (a[r] = q[r]);
q = null;
var ca = {
    "f64-rem": function (b, c) {
      return b % c;
    },
    debugger: function () {},
  },
  F;
a.wasmBinary && (F = a.wasmBinary);
var noExitRuntime;
a.noExitRuntime && (noExitRuntime = a.noExitRuntime);
"object" !== typeof WebAssembly && E("no native wasm support detected");
var G,
  da = new WebAssembly.Table({ initial: 0, maximum: 0, element: "anyfunc" }),
  ea = !1;
function assert(b, c) {
  b || D("Assertion failed: " + c);
}
function fa(b) {
  var c = a["_" + b];
  assert(c, "Cannot call unknown function " + b + ", make sure it is exported");
  return c;
}
function ia(b, c, d, n) {
  var h = {
      string: function (e) {
        var p = 0;
        if (null !== e && void 0 !== e && 0 !== e) {
          var m = (e.length << 2) + 1;
          p = H(m);
          var g = p,
            f = I;
          if (0 < m) {
            m = g + m - 1;
            for (var u = 0; u < e.length; ++u) {
              var l = e.charCodeAt(u);
              if (55296 <= l && 57343 >= l) {
                var ua = e.charCodeAt(++u);
                l = (65536 + ((l & 1023) << 10)) | (ua & 1023);
              }
              if (127 >= l) {
                if (g >= m) break;
                f[g++] = l;
              } else {
                if (2047 >= l) {
                  if (g + 1 >= m) break;
                  f[g++] = 192 | (l >> 6);
                } else {
                  if (65535 >= l) {
                    if (g + 2 >= m) break;
                    f[g++] = 224 | (l >> 12);
                  } else {
                    if (g + 3 >= m) break;
                    f[g++] = 240 | (l >> 18);
                    f[g++] = 128 | ((l >> 12) & 63);
                  }
                  f[g++] = 128 | ((l >> 6) & 63);
                }
                f[g++] = 128 | (l & 63);
              }
            }
            f[g] = 0;
          }
        }
        return p;
      },
      array: function (e) {
        var p = H(e.length);
        J.set(e, p);
        return p;
      },
    },
    k = fa(b),
    T = [];
  b = 0;
  if (n)
    for (var x = 0; x < n.length; x++) {
      var ha = h[d[x]];
      ha ? (0 === b && (b = ja()), (T[x] = ha(n[x]))) : (T[x] = n[x]);
    }
  d = k.apply(null, T);
  d = (function (e) {
    if ("string" === c)
      if (e) {
        for (var p = I, m = e + NaN, g = e; p[g] && !(g >= m); ) ++g;
        if (16 < g - e && p.subarray && ka) e = ka.decode(p.subarray(e, g));
        else {
          for (m = ""; e < g; ) {
            var f = p[e++];
            if (f & 128) {
              var u = p[e++] & 63;
              if (192 == (f & 224))
                m += String.fromCharCode(((f & 31) << 6) | u);
              else {
                var l = p[e++] & 63;
                f =
                  224 == (f & 240)
                    ? ((f & 15) << 12) | (u << 6) | l
                    : ((f & 7) << 18) | (u << 12) | (l << 6) | (p[e++] & 63);
                65536 > f
                  ? (m += String.fromCharCode(f))
                  : ((f -= 65536),
                    (m += String.fromCharCode(
                      55296 | (f >> 10),
                      56320 | (f & 1023)
                    )));
              }
            } else m += String.fromCharCode(f);
          }
          e = m;
        }
      } else e = "";
    else e = "boolean" === c ? !!e : e;
    return e;
  })(d);
  0 !== b && la(b);
  return d;
}
var ka = "undefined" !== typeof TextDecoder ? new TextDecoder("utf8") : void 0,
  K,
  J,
  I,
  L,
  M,
  N,
  O,
  P = a.INITIAL_MEMORY || 16777216;
a.wasmMemory
  ? (G = a.wasmMemory)
  : (G = new WebAssembly.Memory({ initial: P / 65536, maximum: P / 65536 }));
G && (K = G.buffer);
P = K.byteLength;
var Q = K;
K = Q;
a.HEAP8 = J = new Int8Array(Q);
a.HEAP16 = L = new Int16Array(Q);
a.HEAP32 = M = new Int32Array(Q);
a.HEAPU8 = I = new Uint8Array(Q);
a.HEAPU16 = new Uint16Array(Q);
a.HEAPU32 = new Uint32Array(Q);
a.HEAPF32 = N = new Float32Array(Q);
a.HEAPF64 = O = new Float64Array(Q);
M[640] = 5245632;
function R(b) {
  for (; 0 < b.length; ) {
    var c = b.shift();
    if ("function" == typeof c) c(a);
    else {
      var d = c.j;
      "number" === typeof d
        ? void 0 === c.i
          ? a.dynCall_v(d)
          : a.dynCall_vi(d, c.i)
        : d(void 0 === c.i ? null : c.i);
    }
  }
}
var ma = [],
  na = [],
  oa = [],
  pa = [];
function qa() {
  var b = a.preRun.shift();
  ma.unshift(b);
}
var ra = Math.abs,
  sa = Math.ceil,
  ta = Math.floor,
  va = Math.min,
  S = 0,
  U = null,
  V = null;
a.preloadedImages = {};
a.preloadedAudios = {};
function D(b) {
  if (a.onAbort) a.onAbort(b);
  ba(b);
  E(b);
  ea = !0;
  throw new WebAssembly.RuntimeError(
    "abort(" + b + "). Build with -s ASSERTIONS=1 for more info."
  );
}
function W(b) {
  var c = X;
  return String.prototype.startsWith ? c.startsWith(b) : 0 === c.indexOf(b);
}
function wa() {
  return W("data:application/octet-stream;base64,");
}
var X = "gof.wasm";
if (!wa()) {
  var xa = X;
  X = a.locateFile ? a.locateFile(xa, y) : y + xa;
}
function ya() {
  try {
    if (F) return new Uint8Array(F);
    if (A) return A(X);
    throw "both async and sync fetching of the wasm failed";
  } catch (b) {
    D(b);
  }
}
function za() {
  return F || (!t && !v) || "function" !== typeof fetch || W("file://")
    ? new Promise(function (b) {
        b(ya());
      })
    : fetch(X, { credentials: "same-origin" })
        .then(function (b) {
          if (!b.ok) throw "failed to load wasm binary file at '" + X + "'";
          return b.arrayBuffer();
        })
        .catch(function () {
          return ya();
        });
}
a.asm = function () {
  function b(h) {
    a.asm = h.exports;
    S--;
    a.monitorRunDependencies && a.monitorRunDependencies(S);
    0 == S &&
      (null !== U && (clearInterval(U), (U = null)),
      V && ((h = V), (V = null), h()));
  }
  function c(h) {
    b(h.instance);
  }
  function d(h) {
    return za()
      .then(function (k) {
        return WebAssembly.instantiate(k, n);
      })
      .then(h, function (k) {
        E("failed to asynchronously prepare wasm: " + k);
        D(k);
      });
  }
  var n = {
    env: Aa,
    wasi_snapshot_preview1: Aa,
    global: { NaN: NaN, Infinity: Infinity },
    "global.Math": Math,
    asm2wasm: ca,
  };
  S++;
  a.monitorRunDependencies && a.monitorRunDependencies(S);
  if (a.instantiateWasm)
    try {
      return a.instantiateWasm(n, b);
    } catch (h) {
      return E("Module.instantiateWasm callback failed with error: " + h), !1;
    }
  (function () {
    if (
      F ||
      "function" !== typeof WebAssembly.instantiateStreaming ||
      wa() ||
      W("file://") ||
      "function" !== typeof fetch
    )
      return d(c);
    fetch(X, { credentials: "same-origin" }).then(function (h) {
      return WebAssembly.instantiateStreaming(h, n).then(c, function (k) {
        E("wasm streaming compile failed: " + k);
        E("falling back to ArrayBuffer instantiation");
        return d(c);
      });
    });
  })();
  return {};
};
var Y,
  Ba,
  Aa = {
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
a.asm({}, Aa, K);
a._free = function () {
  return (a._free = a.asm.c).apply(null, arguments);
};
a._gof = function () {
  return (a._gof = a.asm.d).apply(null, arguments);
};
a._malloc = function () {
  return (a._malloc = a.asm.e).apply(null, arguments);
};
var H = (a.stackAlloc = function () {
    return (H = a.stackAlloc = a.asm.f).apply(null, arguments);
  }),
  la = (a.stackRestore = function () {
    return (la = a.stackRestore = a.asm.g).apply(null, arguments);
  }),
  ja = (a.stackSave = function () {
    return (ja = a.stackSave = a.asm.h).apply(null, arguments);
  });
a.cwrap = function (b, c, d, n) {
  d = d || [];
  var h = d.every(function (k) {
    return "number" === k;
  });
  return "string" !== c && h && !n
    ? fa(b)
    : function () {
        return ia(b, c, d, arguments);
      };
};
a.setValue = function (b, c, d) {
  d = d || "i8";
  "*" === d.charAt(d.length - 1) && (d = "i32");
  switch (d) {
    case "i1":
      J[b >> 0] = c;
      break;
    case "i8":
      J[b >> 0] = c;
      break;
    case "i16":
      L[b >> 1] = c;
      break;
    case "i32":
      M[b >> 2] = c;
      break;
    case "i64":
      Ba = [
        c >>> 0,
        ((Y = c),
        1 <= +ra(Y)
          ? 0 < Y
            ? (va(+ta(Y / 4294967296), 4294967295) | 0) >>> 0
            : ~~+sa((Y - +(~~Y >>> 0)) / 4294967296) >>> 0
          : 0),
      ];
      M[b >> 2] = Ba[0];
      M[(b + 4) >> 2] = Ba[1];
      break;
    case "float":
      N[b >> 2] = c;
      break;
    case "double":
      O[b >> 3] = c;
      break;
    default:
      D("invalid type for setValue: " + d);
  }
};
a.getValue = function (b, c) {
  c = c || "i8";
  "*" === c.charAt(c.length - 1) && (c = "i32");
  switch (c) {
    case "i1":
      return J[b >> 0];
    case "i8":
      return J[b >> 0];
    case "i16":
      return L[b >> 1];
    case "i32":
      return M[b >> 2];
    case "i64":
      return M[b >> 2];
    case "float":
      return N[b >> 2];
    case "double":
      return O[b >> 3];
    default:
      D("invalid type for getValue: " + c);
  }
  return null;
};
var Z;
V = function Ca() {
  Z || Da();
  Z || (V = Ca);
};
function Da() {
  function b() {
    if (!Z && ((Z = !0), (a.calledRun = !0), !ea)) {
      R(na);
      R(oa);
      if (a.onRuntimeInitialized) a.onRuntimeInitialized();
      if (a.postRun)
        for (
          "function" == typeof a.postRun && (a.postRun = [a.postRun]);
          a.postRun.length;

        ) {
          var c = a.postRun.shift();
          pa.unshift(c);
        }
      R(pa);
    }
  }
  if (!(0 < S)) {
    if (a.preRun)
      for (
        "function" == typeof a.preRun && (a.preRun = [a.preRun]);
        a.preRun.length;

      )
        qa();
    R(ma);
    0 < S ||
      (a.setStatus
        ? (a.setStatus("Running..."),
          setTimeout(function () {
            setTimeout(function () {
              a.setStatus("");
            }, 1);
            b();
          }, 1))
        : b());
  }
}
a.run = Da;
if (a.preInit)
  for (
    "function" == typeof a.preInit && (a.preInit = [a.preInit]);
    0 < a.preInit.length;

  )
    a.preInit.pop()();
noExitRuntime = !0;
Da();
var Ea = a.cwrap("gof", "number", ["number", "number", "number"]);
setTimeout(function () {
  var b = [];
  var c = [
    [1, 0],
    [2, 1],
    [2, 2],
    [1, 2],
    [0, 2],
  ].flat();
  var d = new Int32Array(c),
    n = d.length,
    h = d.BYTES_PER_ELEMENT;
  c = a._malloc(n * h * 8);
  var k = a._malloc(n * h * 12);
  a.HEAP32.set(d, c / h);
  d = 2 * Ea(c, k, n / 2);
  a._free(k);
  c = new Int32Array(a.HEAP32.buffer, c, d);
  for (k = 0; k < c.length; k += 2) b.push([c[k], c[k + 1]]);
  console.log("nextGen", b);
}, 1e3);
