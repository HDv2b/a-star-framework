/**
 1. Add the starting square (or node) to the open list.

 2. Repeat the following:

 A) Look for the lowest F cost square on the open list. We refer to this as the current square.

 B). Switch it to the closed list.

 C) For each of the 8 squares adjacent to this current square …

 If it is not walkable or if it is on the closed list, ignore it. Otherwise do the following.
 If it isn’t on the open list, add it to the open list. Make the current square the parent of this square. Record the F, G, and H costs of the square.
 If it is on the open list already, check to see if this path to that square is better, using G cost as the measure. A lower G cost means that this is a better path. If so, change the parent of the square to the current square, and recalculate the G and F scores of the square. If you are keeping your open list sorted by F score, you may need to resort the list to account for the change.
 D) Stop when you:

 Add the target square to the closed list, in which case the path has been found, or
 Fail to find the target square, and the open list is empty. In this case, there is no path.
 3. Save the path. Working backwards from the target square, go from each square to its parent square until you reach the starting square. That is your path.
 **/

interface WrappedN<N> {
    node: N
    parent?: WrappedN<N>
    f: number
    g: number
    h?: number
}

export default abstract class AStar<N> {
    /**
    1.  Initialize the open list
    2.  Initialize the closed list
     **/
    private _openList: WrappedN<N>[];
    private _closedList: WrappedN<N>[];

    constructor() {
        this._openList = [];
        this._closedList = [];
    }

    abstract generateSuccessors(node: N): N[]

    abstract nodesMatch(a: N, b: N): Boolean

    abstract calculateDistanceBetweenNodes(a: N, b: N): number

    // doc note: if H is of a different unit to F (eg distance vs time) then there will be trouble!
    abstract calculateH(currentNode: N): number

    private _findNodeInClosedList(node: N) {
        return this._closedList.find(closedNode => this.nodesMatch(closedNode.node, node))
    }

    private _nodeIsNotInClosedList(node: N): boolean {
        return this._closedList.findIndex(closedNode => this.nodesMatch(closedNode.node, node)) === -1
    }

    private _findNodeInOpenList(node: N) {
        return this._openList.find(openNode => this.nodesMatch(openNode.node, node))
    }

    solve(startNode: N, goalNode: ((node: N) => boolean) | N) {
        this._openList = [];
        this._closedList = [];

        const goalNodeCheck = typeof goalNode === 'function'
            ? (node: N) => goalNode(node)
            : (node: N) => this.nodesMatch(node, goalNode);

        /**
         *  put the starting node on the open list (you can leave its f at zero)
         */
        this._openList.push({node: startNode, f: 0, g: 0});

        /**
         * 3.  while the open list is not empty
         */
        while(this._openList.length > 0) {
            /**
             * a) find the node with the least f on the open list, call it "q"
             * b) pop q off the open list, put into closed list
             */
            this._openList.sort((a, b) => a.f - b.f);
            const [q] = this._openList.splice(0, 1);

            this._closedList.push(q);

            // console.log(q.node, goalNodeCheck(q.node));

            if (goalNodeCheck(q.node)) {
                // success!
                // work backwards up parents from this node back to the beginning
                const path = [q.node];
                let parentNode = q.parent;
                while (parentNode && !this.nodesMatch(path[0], startNode)) {
                    path.unshift(parentNode.node);
                    parentNode = parentNode.parent
                }
                return path;
            }

            const successors = this.generateSuccessors(q.node)
                .filter(node => this._nodeIsNotInClosedList(node))
                .map(node => {
                    const g = q.g + this.calculateDistanceBetweenNodes(q.node, node);
                    const h = this.calculateH(node);

                    return ({
                        node,
                        parent: q,
                        f: g + h,
                        g,
                        h
                    });
                });

            successors.forEach(wrappedNode => {
                const nodeInOpenList = this._findNodeInOpenList(wrappedNode.node);
                if (!nodeInOpenList) {
                    this._openList.push(wrappedNode);
                } else {
                    //  If it is on the open list already, check to see if this path to that square is better, using G
                    //  cost as the measure. A lower G cost means that this is a better path. If so, change the parent
                    //  of the square to the current square, and recalculate the G and F scores of the square. If you
                    //  are keeping your open list sorted by F score, you may need to resort the list to account for
                    //  the change.
                    if (wrappedNode.g < nodeInOpenList.g) {
                        wrappedNode.parent = nodeInOpenList;
                        wrappedNode.g = nodeInOpenList.g + this.calculateDistanceBetweenNodes(wrappedNode.node, nodeInOpenList.node);
                        wrappedNode.f = wrappedNode.g + wrappedNode.h;
                    }
                }
            });

            // const successfulNode = typeof goalNode === 'function'
            //     ?
            //     : this._findNodeInClosedList(goalNode);

            // if (successfulNode) {
            //
            // }
        }

        // fail, no route found
        return null;
    }
}

