import { isFn } from "../utils/guards.ts";
import MinHeap from "../utils/MinHeap.ts";

/**
 * Internal wrapped node type used to keep track of parent nodes and cost functions.
 *
 * @todo maybe use branded types here to prevent mixing different node types or cost units (eg. time vs distance)
 *      or leave that up to user in their implementations?
 */
interface WrappedN<N> {
  node: N;
  parent?: WrappedN<N>;
  f: number; // total cost function (f = g + h)
  g: number; // known true cost from start to this node
  h?: number; // estimated cost from this node to goal
}

/**
 * Abstract A* pathfinding class.
 * @todo how to use
 *
 * @example
 *    @todo...
 */
export default abstract class AStar<N, Graph> {
  /**
   * The open list of nodes to be evaluated. Will start with initial node, and have successors added to it.
   * Lowest f-cost is at top of the heap.
   */
  #openList: MinHeap<WrappedN<N>>;
  /**
   * The closed list of nodes already evaluated and deemed redundant (known to not be on the most optimal route).
   * @todo: use Set?
   */
  #closedList: WrappedN<N>[];

  #handleAnimation?: (
    action: string,
    node: N,
    meta?: { parent: N; f: number; g: number; h: number },
  ) => void;

  constructor() {
    this.#openList = new MinHeap(
      (a: WrappedN<N>, b: WrappedN<N>) => a.f - b.f, // lowest f-cost to the top
      (node) => JSON.stringify(node.node),
    );
    this.#closedList = [];
  }

  /**
   * For given node, generate all valid successor nodes that can be reached from it. I.e.: all adjacent tiles in a
   * grid,or all directly connected junctions in a road map.
   * @param node
   * @param graph
   */
  abstract generateSuccessors(node: N, graph: Graph): N[];

  /**
   * Determine whether two nodes are equivalent (i.e. represent the same location in the search space).
   * @param a
   * @param b
   */
  abstract nodesMatch(a: N, b: N): boolean;

  /**
   * Calculate the true cost to move from node a to node b.
   * @param a
   * @param b
   */
  abstract calculateDistanceBetweenNodes(a: N, b: N): number;

  /**
   * Heuristic function to estimate the cost from the current node to the goal.
   * eg. the straight-line distance on a grid.
   *
   * @remarks
   * If H is of a different unit to F (eg distance vs time) then there will be trouble!
   * @todo type branding to prevent different H and F units
   *
   * @example
   *     calculateH(currentNode: N): number {
   *         return Math.sqrt(Math.pow(currentNode.x - endNode.x, 2) + Math.pow(currentNode.y - endNode.y, 2));
   *     }
   *
   * @param currentNode - The current node for which to calculate the heuristic.
   * @param endNode
   */
  abstract calculateH(currentNode: N, endNode?: N): number;

  /**
   * Node is still good to be evaluated (not in closed list).
   * @param node
   * @private
   */
  #nodeIsNotInClosedList(node: N): boolean {
    return (
      this.#closedList.findIndex((closedNode) =>
        this.nodesMatch(closedNode.node, node),
      ) === -1
    );
  }

  /**
   * Find a node in the open list.
   * @param node
   * @private
   */
  #findNodeInOpenList(node: N) {
    return this.#openList.get(JSON.stringify(node));
  }

  /**
   * Create the final path by working backwards up parent nodes from the goal node.
   * @param q
   * @private
   */
  #createFinalPath(q: WrappedN<N>) {
    const path = [q.node];
    let parentNode = q.parent;
    while (parentNode) {
      path.unshift(parentNode.node);
      parentNode = parentNode.parent;
    }
    return path;
  }

  /**
   * Add a node to the open list with lowest F-cost at top of the heap.
   * @param wrappedNode
   * @private
   */
  #addToOpenList(wrappedNode: WrappedN<N>) {
    this.#openList.push(wrappedNode);
    if (this.#handleAnimation) {
      this.#handleAnimation("added node to open list", wrappedNode.node);
    }
  }

  /**
   * Add a node to the closed list, meaning it has been evaluated and is not on the optimal path so should be ignored.
   * @param wrappedNode
   * @private
   */
  #addToClosedList(wrappedNode: WrappedN<N>) {
    this.#closedList.push(wrappedNode);
    if (this.#handleAnimation) {
      this.#handleAnimation("moved node to closed list", wrappedNode.node);
    }
  }

  /**
   * Take the node with the lowest F cost from the open list, i.e. the most promising node to explore next.
   * @private
   */
  #popLowestF(): WrappedN<N> | undefined {
    return this.#openList.popMin();
  }

  /**
   * Solve the path from startNode to either EndNode or verifier function using the A* algorithm.
   *
   * @todo: type overriding to allow for function vs object goalNodeObjOrFnc
   * @todo better explanation of params
   * @todo make remarks better
   * @remarks
   * The process for A* is basically this:
   * 1. Create an open list and a closed list that are both empty. Put the start node in the open list.
   * 2. Loop this until the goal is found or the open list is empty:
   *       a. Find the node with the lowest F cost in the open list and place it in the closed list.
   *       b. Expand this node and for the adjacent nodes to this node:
   *             i. If they are on the closed list, ignore.
   *             ii. If not on the open list, add to open list, store the current node as the parent for this adjacent node, and calculate the             F,G, H costs of the adjacent node.
   *             iii. If on the open list, compare the G costs of this path to the node and the old path to the node. If the G cost of using the             current node to get to the node is the lower cost, change the parent node of the adjacent node to the current node.             Recalculate F,G,H costs of the node.
   * 3. If open list is empty, fail.
   * @param graph
   * @param startNode
   * @param goalNodeObjOrFnc
   * @param handleAnimation
   */
  solve(
    graph: Graph,
    startNode: N,
    goalNodeObjOrFnc: ((node: N) => boolean) | N,
    handleAnimation?: (
      action: string,
      node: N,
      meta?: { parent: N; f: number; g: number; h: number },
    ) => void,
  ): N[] | null {
    this.#openList = new MinHeap(
      (a: WrappedN<N>, b: WrappedN<N>) => a.f - b.f,
      (node) => JSON.stringify(node.node),
    );
    this.#closedList = [];

    if (handleAnimation) {
      this.#handleAnimation = handleAnimation;
    }

    const nodeIsTargetDestination = isFn<N>(goalNodeObjOrFnc)
      ? (node: N) => goalNodeObjOrFnc(node)
      : (node: N) => this.nodesMatch(node, goalNodeObjOrFnc);

    this.#addToOpenList({ node: startNode, f: 0, g: 0 });

    while (this.#openList.size > 0) {
      const q = this.#popLowestF();
      if (!q) {
        break;
      }

      if (nodeIsTargetDestination(q.node)) {
        // success!
        return this.#createFinalPath(q);
      }

      this.#addToClosedList(q);
      this.generateSuccessors(q.node, graph)
        .filter((node) => this.#nodeIsNotInClosedList(node))
        .map((node) => {
          const g = q.g + this.calculateDistanceBetweenNodes(q.node, node);
          const h = isFn<N>(goalNodeObjOrFnc)
            ? this.calculateH(node)
            : this.calculateH(node, goalNodeObjOrFnc);
          const f = g + h;

          if (this.#handleAnimation) {
            this.#handleAnimation("added node to open list", node, {
              parent: q.node,
              f,
              g,
              h,
            });
          }

          return {
            node,
            parent: q,
            f,
            g,
            h,
          };
        })
        .forEach((wrappedChildNode) => {
          const nodeInOpenList = this.#findNodeInOpenList(
            wrappedChildNode.node,
          );
          if (!nodeInOpenList) {
            this.#addToOpenList(wrappedChildNode);
          } else {
            const thisRouteToSameNodeIsBetter =
              wrappedChildNode.g < nodeInOpenList.g;
            if (thisRouteToSameNodeIsBetter) {
              wrappedChildNode.parent = nodeInOpenList;
              wrappedChildNode.g =
                nodeInOpenList.g +
                this.calculateDistanceBetweenNodes(
                  wrappedChildNode.node,
                  nodeInOpenList.node,
                );
              wrappedChildNode.f = wrappedChildNode.g + wrappedChildNode.h;
              this.#addToOpenList(wrappedChildNode);
            }
          }
        });
    }

    // No route found
    return null;
  }
}
