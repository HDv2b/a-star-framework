import AStar from "../../AStar.ts";
import { type Junction } from "./types.ts";

export default class RoadTripSolver extends AStar<
  Junction,
  ReadonlyArray<Junction>
> {
  generateSuccessors(
    node: Junction,
    graph: ReadonlyArray<Junction>,
  ): Junction[] {
    return node.connections.map((connection) => {
      const { otherId } = connection;

      return graph.find(({ id }) => id === otherId) as Junction;
    });
  }

  nodesMatch(a: Junction, b: Junction): boolean {
    return a.id === b.id;
  }

  calculateDistanceBetweenNodes(a: Junction, b: Junction): number {
    if (a.id === b.id) {
      return 0;
    }
    const connection = a.connections.find(({ otherId }) => b.id === otherId);
    if (connection) {
      return connection.time;
    } else {
      throw "Error: These nodes are not directly connected.";
    }
  }

  calculateH(currentNode: Junction, endNode: Junction): number {
    return Math.sqrt(
      Math.pow(currentNode.lat - endNode.lat, 2) +
        Math.pow(currentNode.lng - endNode.lng, 2),
    );
  }
}
