#include <stdio.h>
#include <emscripten/emscripten.h>

int gof(int* input_ptr, int* output_ptr, int len){
	int i;
	for(i = 0; i < len; i++) {
    output_ptr[i] = input_ptr[i] + 1;
	}
  return 7;
}
