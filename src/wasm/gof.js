var b;
b || (b = typeof Module !== "undefined" ? Module : {});
var q = {},
  r;
for (r in b) b.hasOwnProperty(r) && (q[r] = b[r]);
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
else if (aa)
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
var ba = b.print || console.log.bind(console),
  E = b.printErr || console.warn.bind(console);
for (r in q) q.hasOwnProperty(r) && (b[r] = q[r]);
q = null;
var ca = {
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
  da = new WebAssembly.Table({ initial: 0, maximum: 0, element: "anyfunc" }),
  ea = !1;
function assert(a, c) {
  a || D("Assertion failed: " + c);
}
function fa(a) {
  var c = b["_" + a];
  assert(c, "Cannot call unknown function " + a + ", make sure it is exported");
  return c;
}
function ia(a, c, d, n) {
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
    k = fa(a),
    T = [];
  a = 0;
  if (n)
    for (var x = 0; x < n.length; x++) {
      var ha = h[d[x]];
      ha ? (0 === a && (a = ja()), (T[x] = ha(n[x]))) : (T[x] = n[x]);
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
  0 !== a && la(a);
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
var ma = [],
  na = [],
  oa = [],
  pa = [];
function qa() {
  var a = b.preRun.shift();
  ma.unshift(a);
}
var ra = Math.abs,
  sa = Math.ceil,
  ta = Math.floor,
  va = Math.min,
  S = 0,
  U = null,
  V = null;
b.preloadedImages = {};
b.preloadedAudios = {};
function D(a) {
  if (b.onAbort) b.onAbort(a);
  ba(a);
  E(a);
  ea = !0;
  throw new WebAssembly.RuntimeError(
    "abort(" + a + "). Build with -s ASSERTIONS=1 for more info."
  );
}
function W(a) {
  var c = X;
  return String.prototype.startsWith ? c.startsWith(a) : 0 === c.indexOf(a);
}
function wa() {
  return W("data:application/octet-stream;base64,");
}
var X = "gof.wasm";
if (!wa()) {
  var xa = X;
  X = b.locateFile ? b.locateFile(xa, y) : y + xa;
}
function ya() {
  try {
    if (F) return new Uint8Array(F);
    if (A) return A(X);
    throw "both async and sync fetching of the wasm failed";
  } catch (a) {
    D(a);
  }
}
function za() {
  return F || (!t && !v) || "function" !== typeof fetch || W("file://")
    ? new Promise(function (a) {
        a(ya());
      })
    : fetch(X, { credentials: "same-origin" })
        .then(function (a) {
          if (!a.ok) throw "failed to load wasm binary file at '" + X + "'";
          return a.arrayBuffer();
        })
        .catch(function () {
          return ya();
        });
}
b.asm = function () {
  function a(h) {
    b.asm = h.exports;
    S--;
    b.monitorRunDependencies && b.monitorRunDependencies(S);
    0 == S &&
      (null !== U && (clearInterval(U), (U = null)),
      V && ((h = V), (V = null), h()));
  }
  function c(h) {
    a(h.instance);
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
  b.monitorRunDependencies && b.monitorRunDependencies(S);
  if (b.instantiateWasm)
    try {
      return b.instantiateWasm(n, a);
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
b.asm({}, Aa, K);
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
  la = (b.stackRestore = function () {
    return (la = b.stackRestore = b.asm.g).apply(null, arguments);
  }),
  ja = (b.stackSave = function () {
    return (ja = b.stackSave = b.asm.h).apply(null, arguments);
  });
b.cwrap = function (a, c, d, n) {
  d = d || [];
  var h = d.every(function (k) {
    return "number" === k;
  });
  return "string" !== c && h && !n
    ? fa(a)
    : function () {
        return ia(a, c, d, arguments);
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
      Ba = [
        c >>> 0,
        ((Y = c),
        1 <= +ra(Y)
          ? 0 < Y
            ? (va(+ta(Y / 4294967296), 4294967295) | 0) >>> 0
            : ~~+sa((Y - +(~~Y >>> 0)) / 4294967296) >>> 0
          : 0),
      ];
      M[a >> 2] = Ba[0];
      M[(a + 4) >> 2] = Ba[1];
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
V = function Ca() {
  Z || Da();
  Z || (V = Ca);
};
function Da() {
  function a() {
    if (!Z && ((Z = !0), (b.calledRun = !0), !ea)) {
      R(na);
      R(oa);
      if (b.onRuntimeInitialized) b.onRuntimeInitialized();
      if (b.postRun)
        for (
          "function" == typeof b.postRun && (b.postRun = [b.postRun]);
          b.postRun.length;

        ) {
          var c = b.postRun.shift();
          pa.unshift(c);
        }
      R(pa);
    }
  }
  if (!(0 < S)) {
    if (b.preRun)
      for (
        "function" == typeof b.preRun && (b.preRun = [b.preRun]);
        b.preRun.length;

      )
        qa();
    R(ma);
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
b.run = Da;
if (b.preInit)
  for (
    "function" == typeof b.preInit && (b.preInit = [b.preInit]);
    0 < b.preInit.length;

  )
    b.preInit.pop()();
noExitRuntime = !0;
Da();
var Ea = b.cwrap("gof", "number", ["number", "number", "number"]);
onmessage = function (a) {
  var c = [];
  a = a.data.flat();
  var d = new Int32Array(a),
    n = d.length,
    h = d.BYTES_PER_ELEMENT;
  a = b._malloc(n * h * 8);
  var k = b._malloc(n * h * 12);
  b.HEAP32.set(d, a / h);
  d = 2 * Ea(a, k, n / 2);
  b._free(k);
  a = new Int32Array(b.HEAP32.buffer, a, d);
  for (k = 0; k < a.length; k += 2) c.push([a[k], a[k + 1]]);
  postMessage(c);
};
