export interface N {
  availableNumbers: number[];
  lastAction?: {
    generated: number;
    operation: "times" | "add" | "subtract" | "divide";
    numbers: [number, number];
    idxs: [number, number];
  };
}
