/*
	Unit tests for the Game of Life C implementation
	Copyright 2020 Edwin Martin
	Published under MIT license

	Build and run:
		clang -O2 -o /tmp/gol_test src/wasm/gol_test.c && /tmp/gol_test
	Or:
		npm run test:wasm

	The grid size of the large random test can be overridden:
		/tmp/gol_test 1000
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#include "gol.c"

#define GRID_SIZE 300
#define FILL_NUMERATOR 1
#define FILL_DENOMINATOR 4

static int tests_run;
static int tests_failed;

/* ---------------------------------------------------------------- helpers */

/* splitmix64, so the generated grid is identical on every platform and run */
static unsigned long long rnd_state;

static void rnd_seed(unsigned long long seed) {
	rnd_state = seed;
}

static unsigned long long rnd_next(void) {
	unsigned long long z = (rnd_state += 0x9e3779b97f4a7c15ULL);
	z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9ULL;
	z = (z ^ (z >> 27)) * 0x94d049bb133111ebULL;
	return z ^ (z >> 31);
}

static int compare_cells(const void* a, const void* b) {
	const struct cells_struct* ca = a;
	const struct cells_struct* cb = b;

	if (ca->y != cb->y) {
		return ca->y < cb->y ? -1 : 1;
	}
	if (ca->x != cb->x) {
		return ca->x < cb->x ? -1 : 1;
	}
	return 0;
}

static void* checked_malloc(size_t size) {
	void* p = malloc(size);

	if (!p) {
		fprintf(stderr, "out of memory (%zu bytes)\n", size);
		exit(1);
	}
	return p;
}

/*
	Independent reference implementation of one Game of Life generation.
	Deliberately written the naive way -- a padded grid with a per-cell
	neighbour count -- so it shares no logic with gol().

	Returns the number of live cells and stores a sorted array in *out,
	which the caller frees.
*/
static int reference_gol(const struct cells_struct* cells, int len,
                         struct cells_struct** out) {
	int min_x, min_y, max_x, max_y;
	int width, height, x, y, i;
	unsigned char* alive;
	struct cells_struct* result;
	int result_count = 0;

	*out = NULL;

	if (len == 0) {
		return 0;
	}

	min_x = max_x = cells[0].x;
	min_y = max_y = cells[0].y;

	for (i = 1; i < len; i++) {
		if (cells[i].x < min_x) min_x = cells[i].x;
		if (cells[i].x > max_x) max_x = cells[i].x;
		if (cells[i].y < min_y) min_y = cells[i].y;
		if (cells[i].y > max_y) max_y = cells[i].y;
	}

	/* 2 cells of padding on every side: cells may be born just outside the
	   bounding box, and counting their neighbours reaches one cell further */
	width = max_x - min_x + 5;
	height = max_y - min_y + 5;

	alive = checked_malloc((size_t)width * (size_t)height);
	memset(alive, 0, (size_t)width * (size_t)height);

	for (i = 0; i < len; i++) {
		int gx = cells[i].x - min_x + 2;
		int gy = cells[i].y - min_y + 2;
		alive[(size_t)gy * width + gx] = 1;
	}

	result = checked_malloc(sizeof(struct cells_struct) * (size_t)width * (size_t)height);

	for (y = 1; y < height - 1; y++) {
		for (x = 1; x < width - 1; x++) {
			int neighbours_found = 0;
			int dx, dy;

			for (dy = -1; dy <= 1; dy++) {
				for (dx = -1; dx <= 1; dx++) {
					if (dx == 0 && dy == 0) {
						continue;
					}
					neighbours_found += alive[(size_t)(y + dy) * width + (x + dx)];
				}
			}

			if (neighbours_found == 3 ||
			    (neighbours_found == 2 && alive[(size_t)y * width + x])) {
				result[result_count].x = x + min_x - 2;
				result[result_count].y = y + min_y - 2;
				result_count++;
			}
		}
	}

	free(alive);

	qsort(result, (size_t)result_count, sizeof(struct cells_struct), compare_cells);

	*out = result;
	return result_count;
}

/*
	Runs one generation through gol() and compares it with the reference.
	`cells` is left untouched.
*/
static void assert_generation(const char* name, const struct cells_struct* cells, int len) {
	/* gol() writes its result back into the input array; every push() can add
	   at most one neighbour, so 8 * len + 1 entries is always enough */
	size_t capacity = (size_t)len * 8 + 1;
	struct cells_struct* actual = checked_malloc(sizeof(struct cells_struct) * capacity);
	struct neighbours_struct* scratch =
		checked_malloc(sizeof(struct neighbours_struct) * capacity);
	struct cells_struct* expected;
	int expected_count, actual_count;
	int ok;

	memcpy(actual, cells, sizeof(struct cells_struct) * (size_t)len);

	expected_count = reference_gol(cells, len, &expected);

	actual_count = gol(actual, scratch, len);
	qsort(actual, (size_t)actual_count, sizeof(struct cells_struct), compare_cells);

	ok = actual_count == expected_count &&
	     (actual_count == 0 ||
	      memcmp(actual, expected, sizeof(struct cells_struct) * (size_t)actual_count) == 0);

	tests_run++;

	if (ok) {
		printf("  ok   %-28s %d cells -> %d cells\n", name, len, actual_count);
	} else {
		int i;
		int shown = 0;

		tests_failed++;
		printf("  FAIL %-28s %d cells -> %d cells, expected %d\n",
		       name, len, actual_count, expected_count);

		for (i = 0; i < actual_count && i < expected_count && shown < 5; i++) {
			if (compare_cells(&actual[i], &expected[i]) != 0) {
				printf("         at %d: got (%d,%d), expected (%d,%d)\n",
				       i, actual[i].x, actual[i].y, expected[i].x, expected[i].y);
				shown++;
			}
		}
	}

	free(expected);
	free(scratch);
	free(actual);
}

/* ------------------------------------------------------------------ tests */

static void test_small_shapes(void) {
	static const struct cells_struct empty[1] = {{0, 0}};
	static const struct cells_struct single[] = {{5, 5}};
	static const struct cells_struct pair[] = {{5, 5}, {6, 5}};
	static const struct cells_struct block[] = {{1, 1}, {2, 1}, {1, 2}, {2, 2}};
	static const struct cells_struct blinker[] = {{10, 9}, {10, 10}, {10, 11}};
	static const struct cells_struct glider[] = {{1, 0}, {2, 1}, {0, 2}, {1, 2}, {2, 2}};
	/* straddles the origin, so cells are born at negative coordinates */
	static const struct cells_struct negative[] = {{-1, 0}, {0, 0}, {1, 0}};

	assert_generation("empty", empty, 0);
	assert_generation("single cell dies", single, 1);
	assert_generation("pair dies", pair, 2);
	assert_generation("block is stable", block, 4);
	assert_generation("blinker oscillates", blinker, 3);
	assert_generation("glider moves", glider, 5);
	assert_generation("negative coordinates", negative, 3);
}

/*
	Fills a size x size grid with exactly 25% live cells and checks one
	generation against the reference implementation.

	Uses Knuth's selection sampling: walk every position once and pick it with
	probability (remaining wanted / remaining positions). That yields exactly
	`wanted` cells, already in row-major order.
*/
static void test_large_random_grid(int size) {
	long long total = (long long)size * size;
	long long wanted = total * FILL_NUMERATOR / FILL_DENOMINATOR;
	long long remaining = wanted;
	struct cells_struct* cells =
		checked_malloc(sizeof(struct cells_struct) * (size_t)wanted);
	int len = 0;
	int x, y;
	char name[64];
	clock_t started;

	rnd_seed(20200803);

	for (y = 0; y < size; y++) {
		for (x = 0; x < size; x++) {
			long long left = total - ((long long)y * size + x);

			if (rnd_next() % (unsigned long long)left < (unsigned long long)remaining) {
				cells[len].x = x;
				cells[len].y = y;
				len++;
				remaining--;
			}
		}
	}

	if ((long long)len != wanted) {
		printf("  FAIL grid generator produced %d cells, expected %lld\n", len, wanted);
		tests_run++;
		tests_failed++;
		free(cells);
		return;
	}

	snprintf(name, sizeof(name), "random %dx%d, 25%% filled", size, size);

	/* gol() is O(live cells squared), so this takes minutes on a large grid */
	printf("  .... %-28s %d cells, please wait\n", name, len);

	started = clock();
	assert_generation(name, cells, len);
	printf("       (%.1f s)\n", (double)(clock() - started) / CLOCKS_PER_SEC);

	free(cells);
}

int main(int argc, char** argv) {
	int size = argc > 1 ? atoi(argv[1]) : GRID_SIZE;

	/* line buffering, so progress is visible when stdout is redirected to a file */
	setvbuf(stdout, NULL, _IOLBF, 0);

	if (size < 1) {
		fprintf(stderr, "usage: %s [grid size]\n", argv[0]);
		return 2;
	}

	printf("gol()\n");
	test_small_shapes();
	test_large_random_grid(size);

	printf("\n%d tests, %d failed\n", tests_run, tests_failed);

	return tests_failed == 0 ? 0 : 1;
}
