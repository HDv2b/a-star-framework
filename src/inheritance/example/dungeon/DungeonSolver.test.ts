import { describe, test } from "node:test";
import { strict as assert } from "node:assert";

import DungeonSolver from "./DungeonSolver.ts";
import type { Grid, N } from "./types.ts";

describe("DungeonSolver", () => {
  const X = false as const; // impassable
  const _ = true as const; // open
  const grid: Grid = [
    [_, _, _, _, _, _, _, _, _, _, _],
    [X, X, X, _, X, X, X, _, X, _, _],
    [_, _, _, _, X, _, _, _, X, _, _],
    [_, _, X, X, _, _, _, X, X, X, X],
    [_, _, _, _, _, X, _, _, _, _, _],
  ] as const;

  const start = { row: 0, col: 0 } as N; // top left
  const end = { row: grid.length - 1, col: grid[0].length - 1 } as N; // bottom right

  const dungeonSolver = new DungeonSolver();
  const path = dungeonSolver.solve(grid, start, end);

  // whether giving end as an object or function, solve() still works and gives the same result
  test("Can solve the grid", () => {
    assert.deepStrictEqual(path, [
      {
        col: 0,
        row: 0,
      },
      {
        col: 1,
        row: 0,
      },
      {
        col: 2,
        row: 0,
      },
      {
        col: 3,
        row: 1,
      },
      {
        col: 3,
        row: 2,
      },
      {
        col: 4,
        row: 3,
      },
      {
        col: 5,
        row: 3,
      },
      {
        col: 6,
        row: 3,
      },
      {
        col: 7,
        row: 4,
      },
      {
        col: 8,
        row: 4,
      },
      {
        col: 9,
        row: 4,
      },
      {
        col: 10,
        row: 4,
      },
    ]);
  });

  // whether giving end as an object or function, solve() still works and gives the same result
  // test("Can solve with funational comparison", () => {
  //     const path2 = example.solve(
  //         start,
  //         (node) => node.r === grid.length - 1 && node.c === grid[0].length - 1
  //     );
  //     console.log("function to check goal condition given:", path2);
  //     assert.deepStrictEqual(path2, []);
  // })
});
