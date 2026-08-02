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
        availableNumbers: [100, 50, 2, 1, 10, 25],
      },
      {
        availableNumbers: [3, 100, 50, 10, 25],
        lastAction: {
          generated: 3,
          idxs: [2, 3],
          numbers: [2, 1],
          operation: "add",
        },
      },
      {
        availableNumbers: [300, 50, 10, 25],
        lastAction: {
          generated: 300,
          idxs: [0, 1],
          numbers: [3, 100],
          operation: "times",
        },
      },
    ]);
  });
});
