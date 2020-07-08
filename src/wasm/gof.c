/*
	Game of Life C implementation
	Copyright 2020 Edwin Martin
	Published under MIT license
*/

#include <stdio.h>
#include <emscripten/emscripten.h>

struct neighbours_struct {
	int x;
	int y;
	int count;
};

int* input;
struct neighbours_struct* neighbours;
int neighbours_count;

void push(int x, int y) {
	struct neighbours_struct* current = &neighbours[neighbours_count];
	current->x = x;
	current->y = y;
	current->count = 1;
	neighbours_count++;
}

int gof(int* input_ptr, struct neighbours_struct* output_ptr, int len) {
	neighbours_count = 0;
	neighbours = output_ptr;
	int i;
	for(i = 0; i < len; i+=2) {
		push(input_ptr[i], input_ptr[i+1]);
	}

	return len * 1.5;
}



