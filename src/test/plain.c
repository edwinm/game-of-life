#include <emscripten/emscripten.h>

EMSCRIPTEN_KEEPALIVE
int fib() {
  return 42;
}

