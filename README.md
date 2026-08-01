# A Star as a Framework

The [A-Star algorithm](https://en.wikipedia.org/wiki/A*_search_algorithm) is a commonly used path-finding algorithm.
In this project it is provided as a single-class framework which
takes care of the fundamentals, you just need to provide a few
situational functions to fill the blanks.

Ideally you should have some familiarity with A-Star, but hopefully
this framework is useful enough that you don't need to remember the details.

A-star is useful when you can:

- Break down a route into distinct steps, with a clear start and end.
- Calculate an exact cost between steps.
- Guess a rough-but-meaningful estimate cost between a given node and the destination.

Therefore, it is up to you to define these points based on your given scenario,
these are the blanks you will need to fill in!

## Guide

You can follow along while looking at the following examples:

- Grid-based layout: [dungeon example](src/inheritance/example/dungeon/DungeonSolver.ts)
- Network or graph layout: [roadtrip example](src/inheritance/example/roadtrip/RoadTripSolver.ts)

### Shaping the node

The first step is to create your `N` (node) interface or type, which defines a single node in your map or graph.
Each node needs have whatever data you require to work out:

- Which other nodes it is connected to,
- The cost of travelling from that node to each of its neighbours,
- Some unique way of identifying the node.

In the grid example, providing each node with a coordinate is sufficient to do all of the above assuming every tile is
accessible to its neighbour with equal cost to travel in any direction.

In the roadtrip example, each connection and travel cost is explicitly listed.

### Fleshing out the class

- `abstract generateSuccessors(node: N): N[]`: for a given node, produce a list of adjacent nodes. You don't need to filter
  out nodes already travelled through, this will be taken care of.

- `abstract nodesMatch(a: N, b: N): boolean`: Simply defines if two nodes are the same, e.g. same row and column number.

- `abstract calculateDistanceBetweenNodes(a: N, b: N): number`: The real distance cost between two nodes.

- `abstract calculateH(currentNode: N): number`: The heuristic, i.e. a rough-estimate of the cost to travel from a given node to the final destination.

### Solve

Running `solve` will perform the algorithm and returns a list of nodes along the route.
