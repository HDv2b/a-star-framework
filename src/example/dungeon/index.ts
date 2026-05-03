import AStar from "../../index";

type Grid = boolean[][];

const X = false as const; // impassable
const _ = true as const; // open
const grid: Grid = [
    [_,_,_,_,_,_,_,_,_,_,_],
    [X,X,X,_,X,X,X,_,X,_,_],
    [_,_,_,_,X,_,_,_,X,_,_],
    [_,_,X,X,_,_,_,X,X,X,X],
    [_,_,_,_,_,X,_,_,_,_,_]
];

const start: N = {r: 0, c: 0}; // top left
const end: N = {r: grid.length-1, c: grid[0].length-1}; // bottom right

interface N {
    // row
    r: number
    // column
    c: number
}

class Example extends AStar<N> {
    generateSuccessors(node: N) {
        const {r: oldR, c: oldC} = node;
        const out = [];

        // add tiles which fit within world bounds
        if (oldR > 0) { out.push({r: oldR - 1, c: oldC})}
        if (oldR < grid.length - 1) { out.push({r: oldR + 1, c: oldC})}

        if (oldC > 0) { out.push({r: oldR, c: oldC - 1})}
        if (oldC < grid[oldR].length - 1) { out.push({r: oldR, c: oldC + 1})}

        // allow for diagonals
        if (oldR > 0 && oldC > 0) { out.push({r: oldR - 1, c: oldC - 1})}
        if (oldR > 0 && oldC < grid[oldR].length) { out.push({r: oldR - 1, c: oldC + 1})}
        if (oldR < grid.length - 1 && oldC > 0) { out.push({r: oldR + 1, c: oldC - 1})}
        if (oldR < grid.length - 1 && oldC < grid[oldR].length) { out.push({r: oldR + 1, c: oldC + 1})}

        // filter out walls
        return out.filter(({r, c}) => grid[r][c] !== X);
    }

    nodesMatch(a:N, b:N) {
        return a.c === b.c && a.r === b.r
    }

    calculateDistanceBetweenNodes(a: N, b:N) {
        return Math.sqrt(Math.pow(a.c - b.c, 2) + Math.pow(a.r - b.r, 2))
    }

    calculateH(node: N) {
        return this.calculateDistanceBetweenNodes(node, end)
    }
}

const example = new Example();


// whether giving end as an object or function, solve() still works and gives the same result
const path = example.solve(start, end);
console.log('specific object to match given:', path);
const path2 = example.solve(start, node => node.r === grid.length-1 && node.c === grid[0].length-1);
console.log('function to check goal condition given:', path2);
