import AStar from "../../AStar.ts";
import { type N } from "./types.ts";

export default class CountdownSolver extends AStar<N, []> {
  calculateDistanceBetweenNodes(): number {
    return 1;
  }

  calculateH(node: N): number {
    // return 0;
    // goal for this function is to predict a number of steps between this sequence of numbers and the target
    // more available numbers = more possibilities (and less likely to be using duplicates that were made from other numbers)
    return 1 / node.availableNumbers.length;
  }

  generateSuccessors(node: N): N[] {
    const successors: N[] = [];

    for (let a = 0; a < node.availableNumbers.length - 1; a++) {
      for (let b = a + 1; b < node.availableNumbers.length; b++) {
        const availableNumbers: number[] = [...node.availableNumbers];
        // console.log(node.availableNumbers[a], node.availableNumbers[b]);

        const bNum: number = availableNumbers.splice(b, 1)[0];
        const aNum: number = availableNumbers.splice(a, 1)[0];

        successors.push({
          availableNumbers: [aNum + bNum, ...availableNumbers],
          lastAction: {
            generated: aNum + bNum,
            operation: "add",
            numbers: [aNum, bNum],
            idxs: [a, b],
          },
        });

        if (aNum !== 1 && bNum !== 1) {
          successors.push({
            availableNumbers: [aNum * bNum, ...availableNumbers],
            lastAction: {
              generated: aNum * bNum,
              operation: "times",
              numbers: [aNum, bNum],
              idxs: [a, b],
            },
          });
        }

        if (aNum - bNum > 0 && aNum - bNum !== bNum) {
          successors.push({
            availableNumbers: [aNum - bNum, ...availableNumbers],
            lastAction: {
              generated: aNum - bNum,
              operation: "subtract",
              numbers: [aNum, bNum],
              idxs: [a, b],
            },
          });
        } else if (bNum - aNum > 0 && bNum - aNum !== aNum) {
          successors.push({
            availableNumbers: [bNum - aNum, ...availableNumbers],
            lastAction: {
              generated: bNum - aNum,
              operation: "subtract",
              numbers: [bNum, aNum],
              idxs: [b, a],
            },
          });
        }

        if (bNum > 1 && aNum % bNum === 0) {
          successors.push({
            availableNumbers: [aNum / bNum, ...availableNumbers],
            lastAction: {
              generated: aNum / bNum,
              operation: "divide",
              numbers: [aNum, bNum],
              idxs: [a, b],
            },
          });
        } else if (aNum > 1 && bNum % aNum === 0) {
          successors.push({
            availableNumbers: [bNum / aNum, ...availableNumbers],
            lastAction: {
              generated: bNum / aNum,
              operation: "divide",
              numbers: [bNum, aNum],
              idxs: [b, a],
            },
          });
        }
      }
    }

    return successors;
  }

  nodesMatch(a: N, b: N): boolean {
    return (
      a.availableNumbers.length === b.availableNumbers.length &&
      a.availableNumbers
        .toSorted((a, b) => a - b)
        .every((n, i) => b.availableNumbers.toSorted((a, b) => a - b)[i] === n)
    );
  }
}
