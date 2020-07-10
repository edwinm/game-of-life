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
	for(int n = 0; n < neighbours_count; n++) {
		if (neighbours[n].x == x && neighbours[n].y == y) {
			neighbours[n].count++;
			return;
		}
	}

	neighbours[neighbours_count].x = x;
	neighbours[neighbours_count].y = y;
	neighbours[neighbours_count].count = 1;
	neighbours_count++;
}

int gol(struct cells_struct* cells, struct neighbours_struct* neighbours_in, int len) {
	neighbours_count = 0;
	neighbours = neighbours_in;

	int out_count = 0;

	for(int i = 0; i < len; i++) {
		push(cells[i].x-1, cells[i].y-1);
		push(cells[i].x, cells[i].y-1);
		push(cells[i].x+1, cells[i].y-1);
		push(cells[i].x-1, cells[i].y);
		push(cells[i].x+1, cells[i].y);
		push(cells[i].x-1, cells[i].y+1);
		push(cells[i].x, cells[i].y+1);
		push(cells[i].x+1, cells[i].y+1);
	}

	for(int i = 0; i < len; i++) {
		for(int n = 0; n < neighbours_count; n++) {
			if (neighbours[n].x == cells[i].x && neighbours[n].y == cells[i].y && neighbours[n].count == 2) {
				neighbours[n].count = 3;
			}
		}
	}

	for(int n = 0; n < neighbours_count; n++) {
		if (neighbours[n].count == 3) {
			cells[out_count].x = neighbours[n].x;
			cells[out_count].y = neighbours[n].y;
			out_count++;
		}
	}

	return out_count;
}



