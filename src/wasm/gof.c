#include <stdio.h>
#include <emscripten/emscripten.h>

void addOne(int* input_ptr, int* output_ptr){
	*output_ptr = (*input_ptr) + 1;
}
