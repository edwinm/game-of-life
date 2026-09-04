/*
	Tests the compiled dist/gol2.wasm through the exact memory layout the app
	uses. gol_test.c already checks the algorithm; this checks the wiring, so
	that a wrong byte offset or cell limit in src/components/wasm.ts fails here
	instead of in the browser.

	Run with:
		npm run test:wasm-build
*/

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Keep in sync with src/components/wasm.ts
const MAX_LIVE_CELLS = 30240;
const OFFSET = 1048576;
const SCRATCH_OFFSET = OFFSET + MAX_LIVE_CELLS * 4 * 8;
const PAGES = 64;

const memory = new WebAssembly.Memory({ initial: PAGES, maximum: PAGES });
const wasmBuffer = await readFile(
	new URL("../../dist/gol2.wasm", import.meta.url)
);
const { instance } = await WebAssembly.instantiate(wasmBuffer, {
	env: { memory },
});

function gol(cells) {
	const heap = new Int32Array(memory.buffer, OFFSET, cells.length * 2);

	cells.forEach((cell, i) => {
		heap[i * 2] = cell.x;
		heap[i * 2 + 1] = cell.y;
	});

	const newLength = instance.exports.gol(OFFSET, SCRATCH_OFFSET, cells.length);
	const result = new Int32Array(memory.buffer, OFFSET, newLength * 2);
	const out = [];

	for (let i = 0; i < newLength; i++) {
		out.push({ x: result[i * 2], y: result[i * 2 + 1] });
	}

	return out;
}

// Independent reference: count how often each cell is a neighbour, then apply
// the rules. Shares nothing with the C implementation.
function referenceGol(cells) {
	const live = new Set(cells.map(({ x, y }) => `${x},${y}`));
	const counts = new Map();

	for (const { x, y } of cells) {
		for (let dy = -1; dy <= 1; dy++) {
			for (let dx = -1; dx <= 1; dx++) {
				if (dx == 0 && dy == 0) {
					continue;
				}
				const key = `${x + dx},${y + dy}`;
				counts.set(key, (counts.get(key) ?? 0) + 1);
			}
		}
	}

	const out = [];

	for (const [key, count] of counts) {
		if (count == 3 || (count == 2 && live.has(key))) {
			const [x, y] = key.split(",").map(Number);
			out.push({ x, y });
		}
	}

	return out;
}

const sorted = (cells) =>
	[...cells]
		.sort((a, b) => a.y - b.y || a.x - b.x)
		.map(({ x, y }) => `${x},${y}`);

// splitmix64, matching gol_test.c so both tests walk the same grids
function makeRandom(seed) {
	let state = BigInt(seed);
	const mask = (1n << 64n) - 1n;

	return () => {
		state = (state + 0x9e3779b97f4a7c15n) & mask;
		let z = state;
		z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & mask;
		z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & mask;
		return z ^ (z >> 31n);
	};
}

// Exactly `wanted` cells out of size * size, by Knuth's selection sampling
function randomGrid(size, wanted) {
	const random = makeRandom(20200803);
	const total = BigInt(size) * BigInt(size);
	const cells = [];
	let remaining = BigInt(wanted);

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const left = total - (BigInt(y) * BigInt(size) + BigInt(x));

			if (random() % left < remaining) {
				cells.push({ x, y });
				remaining--;
			}
		}
	}

	return cells;
}

test("glider moves", () => {
	const glider = [
		{ x: 1, y: 0 },
		{ x: 2, y: 1 },
		{ x: 0, y: 2 },
		{ x: 1, y: 2 },
		{ x: 2, y: 2 },
	];

	assert.deepEqual(sorted(gol(glider)), sorted(referenceGol(glider)));
});

test("cells at negative coordinates", () => {
	const row = [
		{ x: -1, y: 0 },
		{ x: 0, y: 0 },
		{ x: 1, y: 0 },
	];

	assert.deepEqual(sorted(gol(row)), sorted(referenceGol(row)));
});

test("a full MAX_LIVE_CELLS pattern stays inside the wasm memory", () => {
	// 350 * 350 is the smallest square that holds MAX_LIVE_CELLS at 25% fill
	const cells = randomGrid(350, MAX_LIVE_CELLS);

	assert.equal(cells.length, MAX_LIVE_CELLS);

	const result = gol(cells);

	assert.deepEqual(sorted(result), sorted(referenceGol(cells)));

	// The result must not have run past the region reserved for it
	assert.ok(
		OFFSET + result.length * 8 <= SCRATCH_OFFSET,
		`result of ${result.length} cells overflows the cells region`
	);
});
