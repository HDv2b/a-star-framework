import { describe, test } from "node:test";
import { strict as assert } from "node:assert";

import CountdownSolver from "./CountdownSolver.ts";
import type { N } from "./types.ts";

describe("CountdownSolver", () => {
  const numbers = [100, 50, 2, 1, 10, 25];
  const target = 300;

  const countdownSolver = new CountdownSolver();
  const solution = countdownSolver.solve(
    [],
    { availableNumbers: numbers },
    (node: N) => node.availableNumbers.includes(target),
  );

  test("Can solve the round", () => {
    assert.deepStrictEqual(solution, [
      {
        availableNumbers: [1, 2, 10, 25, 50, 100],
      },
      {
        availableNumbers: [3, 10, 25, 50, 100],
        lastAction: {
          generated: 3,
          idxs: [2, 3], // todo shouldn't this be 1 and 0?
          numbers: [2, 1],
          operation: "add",
        },
      },
      {
        availableNumbers: [10, 25, 50, 300],
        lastAction: {
          generated: 300,
          idxs: [0, 4],
          numbers: [3, 100],
          operation: "times",
        },
      },
    ]);
  });
});
