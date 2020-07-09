#include <emscripten/emscripten.h>

EMSCRIPTEN_KEEPALIVE int add(x, y) { return x + y; }
