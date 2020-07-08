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

struct cells_struct {
	int x;
	int y;
};

struct cells_struct* input;
struct neighbours_struct* neighbours;
int neighbours_count;

void push(int x, int y) {
	struct neighbours_struct* current = &neighbours[neighbours_count];
	current->x = x;
	current->y = y;
	current->count = 1;
	neighbours_count++;
}

int gof(struct cells_struct* input_ptr, struct neighbours_struct* output_ptr, int len) {
	neighbours_count = 0;
	neighbours = output_ptr;
	int i;
	for(i = 0; i < len; i++) {
		push(input_ptr[i].x-1, input_ptr[i].y-1);
		push(input_ptr[i].x, input_ptr[i].y-1);
		push(input_ptr[i].x+1, input_ptr[i].y-1);
		push(input_ptr[i].x-1, input_ptr[i].y);
		push(input_ptr[i].x+1, input_ptr[i].y);
		push(input_ptr[i].x-1, input_ptr[i].y+1);
		push(input_ptr[i].x, input_ptr[i].y+1);
		push(input_ptr[i].x+1, input_ptr[i].y+1);
	}

	return neighbours_count * 3;
}



