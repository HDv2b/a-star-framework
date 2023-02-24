interface WrappedN<N> {
    node: N
    parent?: WrappedN<N>
    f: number
    g: number
    h?: number
}

export default abstract class AStar<N> {
    private _openList: WrappedN<N>[];
    private _closedList: WrappedN<N>[];
    private _handleAnimation?: (action: string, node: N, meta?: { parent: N, f: number, g: number, h: number }) => void;

    constructor() {
        this._openList = [];
        this._closedList = [];
    }

    abstract generateSuccessors(node: N): N[]

    abstract nodesMatch(a: N, b: N): Boolean

    abstract calculateDistanceBetweenNodes(a: N, b: N): number

    // doc note: if H is of a different unit to F (eg distance vs time) then there will be trouble!
    abstract calculateH(currentNode: N): number

    private _nodeIsNotInClosedList(node: N): boolean {
        return this._closedList.findIndex(closedNode => this.nodesMatch(closedNode.node, node)) === -1
    }

    private _findNodeInOpenList(node: N) {
        return this._openList.find(openNode => this.nodesMatch(openNode.node, node))
    }

    private _createFinalPath(q: WrappedN<N>) {
        // work backwards up parents from this node back to the beginning
        const path = [q.node];
        let parentNode = q.parent;
        while (parentNode) {
            path.unshift(parentNode.node);
            parentNode = parentNode.parent
        }
        return path;
    }

    private _addToOpenList(wrappedNode: WrappedN<N>) {
        this._openList.push(wrappedNode);
        if (this._handleAnimation) {
            this._handleAnimation('added node to open list', wrappedNode.node)
        }
    }

    private _addToClosedList(wrappedNode: WrappedN<N>) {
        this._closedList.push(wrappedNode);
        if (this._handleAnimation) {
            this._handleAnimation('moved node to closed list', wrappedNode.node)
        }
    }

    private _spliceLowestF() {
        // todo keep openList sorted upon insertion to prevent needing to keep sorted every time.
        this._openList.sort((a, b) => a.f - b.f);
        return this._openList.splice(0, 1)[0];
    }

    solve(startNode: N, goalNodeObjOrFnc: ((node: N) => boolean) | N, handleAnimation?: (action: string, node: N, meta?: { parent: N, f: number, g: number, h: number }) => void) {
        this._openList = [];
        this._closedList = [];

        if (handleAnimation) {
            this._handleAnimation = handleAnimation
        }

        const isFn = (a: unknown): a is Function =>
            typeof a === 'function';

        const nodeIsTargetDestination = isFn(goalNodeObjOrFnc)
            ? (node: N) => goalNodeObjOrFnc(node)
            : (node: N) => this.nodesMatch(node, goalNodeObjOrFnc);

        this._addToOpenList({node: startNode, f: 0, g: 0});

        while (this._openList.length > 0) {
            const q = this._spliceLowestF();
            if (nodeIsTargetDestination(q.node)) {
                // success!
                return this._createFinalPath(q)
            }

            this._addToClosedList(q);
            this.generateSuccessors(q.node)
                .filter(node => this._nodeIsNotInClosedList(node))
                .map(node => {
                    const g = q.g + this.calculateDistanceBetweenNodes(q.node, node);
                    const h = this.calculateH(node);
                    const f = g + h;

                    if (this._handleAnimation) {
                        this._handleAnimation('added node to open list', node, {parent: q.node, f, g, h})
                    }

                    return ({
                        node,
                        parent: q,
                        f, g, h
                    });
                })
                .forEach(wrappedChildNode => {
                    const nodeInOpenList = this._findNodeInOpenList(wrappedChildNode.node);
                    if (!nodeInOpenList) {
                        this._addToOpenList(wrappedChildNode);
                    } else {
                        const thisRouteToSameNodeIsBetter = wrappedChildNode.g < nodeInOpenList.g;
                        if (thisRouteToSameNodeIsBetter) {
                            wrappedChildNode.parent = nodeInOpenList;
                            wrappedChildNode.g = nodeInOpenList.g + this.calculateDistanceBetweenNodes(wrappedChildNode.node, nodeInOpenList.node);
                            wrappedChildNode.f = wrappedChildNode.g + wrappedChildNode.h;
                            this._addToOpenList(wrappedChildNode);
                        }
                    }
                });
        }

        // No route found
        return null;
    }
}

