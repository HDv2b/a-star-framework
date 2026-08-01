import AStar from "../../AStar.ts";
import { type Grid, type N } from "./types.ts";

export default class DungeonSolver extends AStar<N, Grid> {
  generateSuccessors(node: N, grid: Grid): N[] {
    const { row: oldR, col: oldC } = node;
    const out = [];

    // add tiles which fit within world bounds
    if (oldR > 0) {
      out.push({ row: oldR - 1, col: oldC } as N);
    }
    if (oldR < grid.length - 1) {
      out.push({ row: oldR + 1, col: oldC } as N);
    }

    if (oldC > 0) {
      out.push({ row: oldR, col: oldC - 1 } as N);
    }
    if (oldC < grid[oldR].length - 1) {
      out.push({ row: oldR, col: oldC + 1 } as N);
    }

    // allow for diagonals
    if (oldR > 0 && oldC > 0) {
      out.push({ row: oldR - 1, col: oldC - 1 } as N);
    }
    if (oldR > 0 && oldC < grid[oldR].length) {
      out.push({ row: oldR - 1, col: oldC + 1 } as N);
    }
    if (oldR < grid.length - 1 && oldC > 0) {
      out.push({ row: oldR + 1, col: oldC - 1 } as N);
    }
    if (oldR < grid.length - 1 && oldC < grid[oldR].length) {
      out.push({ row: oldR + 1, col: oldC + 1 } as N);
    }

    // filter out walls
    return out.filter(({ row, col }) => grid[row][col]);
  }

  nodesMatch(a: N, b: N): boolean {
    return a.col === b.col && a.row === b.row;
  }

  calculateDistanceBetweenNodes(a: N, b: N): number {
    return Math.sqrt(Math.pow(a.col - b.col, 2) + Math.pow(a.row - b.row, 2));
  }

  calculateH(currentNode: N, endNode: N): number {
    return this.calculateDistanceBetweenNodes(currentNode, endNode);
  }
}
