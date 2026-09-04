/*
	Game of Life C implementation
	Copyright 2020 Edwin Martin
	Published under MIT license
*/

#include <stdint.h>

struct cells_struct {
	int x;
	int y;
};

/*
	Packs a coordinate into one 64-bit key. Flipping the sign bit of both
	coordinates makes the unsigned key order equal to the signed (y, x) order,
	so sorting keys sorts cells top to bottom, left to right.
*/
static uint64_t cell_key(int x, int y) {
	return ((uint64_t)((uint32_t)y ^ 0x80000000u) << 32) | ((uint32_t)x ^ 0x80000000u);
}

static void sift(uint64_t* keys, int root, int len) {
	uint64_t value = keys[root];

	for (;;) {
		int child = 2 * root + 1;

		if (child >= len) {
			break;
		}
		if (child + 1 < len && keys[child + 1] > keys[child]) {
			child++;
		}
		if (keys[child] <= value) {
			break;
		}

		keys[root] = keys[child];
		root = child;
	}

	keys[root] = value;
}

/*
	Heapsort: sorts in place, needs no recursion and has no bad case on the many
	duplicate keys in the neighbour list.
*/
static void sort_keys(uint64_t* keys, int len) {
	for (int i = len / 2 - 1; i >= 0; i--) {
		sift(keys, i, len);
	}

	for (int i = len - 1; i > 0; i--) {
		uint64_t top = keys[0];
		keys[0] = keys[i];
		keys[i] = top;
		sift(keys, 0, i);
	}
}

/*
	Computes one generation.

	Reads len cells from `cells` and writes the next generation back into it,
	returning the new number of cells. The caller must provide:

		cells    room for 4 * len cells; every surviving or newly born cell uses
		         up two of the 8 * len neighbour slots, so the result can never
		         be longer than that
		scratch  room for 9 * len keys
*/
int gol(struct cells_struct* cells, uint64_t* scratch, int len) {
	uint64_t* live = scratch;
	uint64_t* around = scratch + len;
	int around_count = 0;
	int out_count = 0;
	int live_index = 0;

	for (int i = 0; i < len; i++) {
		live[i] = cell_key(cells[i].x, cells[i].y);
	}

	for (int i = 0; i < len; i++) {
		int x = cells[i].x;
		int y = cells[i].y;

		around[around_count++] = cell_key(x - 1, y - 1);
		around[around_count++] = cell_key(x, y - 1);
		around[around_count++] = cell_key(x + 1, y - 1);
		around[around_count++] = cell_key(x - 1, y);
		around[around_count++] = cell_key(x + 1, y);
		around[around_count++] = cell_key(x - 1, y + 1);
		around[around_count++] = cell_key(x, y + 1);
		around[around_count++] = cell_key(x + 1, y + 1);
	}

	sort_keys(live, len);
	sort_keys(around, around_count);

	/*
		Each run of equal keys is one cell, and the length of the run is its
		number of live neighbours. Both lists are in the same order, so a single
		pointer walking `live` keeps up with the runs. The cells are not read
		any more at this point, so the result can overwrite them.
	*/
	for (int i = 0; i < around_count; ) {
		uint64_t key = around[i];
		int neighbours = 0;
		int is_live;

		while (i < around_count && around[i] == key) {
			neighbours++;
			i++;
		}

		while (live_index < len && live[live_index] < key) {
			live_index++;
		}
		is_live = live_index < len && live[live_index] == key;

		if (neighbours == 3 || (neighbours == 2 && is_live)) {
			cells[out_count].x = (int)((uint32_t)key ^ 0x80000000u);
			cells[out_count].y = (int)((uint32_t)(key >> 32) ^ 0x80000000u);
			out_count++;
		}
	}

	return out_count;
}
