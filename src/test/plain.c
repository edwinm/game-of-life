#include <stdlib.h>
#include <emscripten.h>

//EMSCRIPTEN_KEEPALIVE
//void *malloc(unsigned long);

EMSCRIPTEN_KEEPALIVE
void *mem(int size) {
	return malloc(size);
}

EMSCRIPTEN_KEEPALIVE
int fib(int a) {
//  int *ptr = 16384L;
//  ptr[0] = 99;

//	emscripten_run_script("callJs");

  return 45 + a;
}

