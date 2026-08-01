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
        availableNumbers: [1, 2, 10, 25, 150],
        lastAction: {
          generated: 150,
          idxs: [0, 1],
          numbers: [100, 50],
          operation: "add",
        },
      },
      {
        availableNumbers: [1, 10, 25, 300],
        lastAction: {
          generated: 300,
          idxs: [1, 4],
          numbers: [2, 150],
          operation: "times",
        },
      },
    ]);
  });
});
