export interface N {
  row: number & { __direction: "row" };
  col: number & { __direction: "column" };
}

export type Grid = boolean[][];

/**
 * Type safety checks:
 */
const test = { row: 0, col: 0 } as N;
// @ts-expect-error: Should not be able to mix rows with columns;
test.row = test.col;
