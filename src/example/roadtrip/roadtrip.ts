import AStar from "../../index";

interface JunctionWithoutConnection {
    id: number,
    lat: number,
    lng: number,
}

interface Connection {
    ids: [number, number]
    time: number,
}

interface Junction {
    id: number,
    lat: number,
    lng: number,
    connections: {
        otherId: number,
        time: number
    }[]
}

const junctionsWithoutConnection: JunctionWithoutConnection[] = [
    {id: 1, lat: 50, lng: 250},
    {id: 2, lat: 150, lng: 300},
    {id: 3, lat: 300, lng: 400},
    {id: 4, lat: 490, lng: 360},
    {id: 5, lat: 490, lng: 120},
    {id: 6, lat: 270, lng: 100},
    {id: 7, lat: 170, lng: 110},
    {id: 8, lat: 470, lng: 470},
    {id: 9, lat: 170, lng: 420},
    {id: 10, lat: 250, lng: 260},
];

const roads: Connection[] = [
    { ids: [1, 2], time: 0},
    { ids: [2, 3], time: 0},
    { ids: [3, 4], time: 0},
    { ids: [4, 5], time: 100},
    { ids: [5, 6], time: 100},
    { ids: [6, 7], time: 100},
    { ids: [7, 1], time: 100},
    { ids: [1, 9], time: 300},
    { ids: [2, 9], time: 250},
    { ids: [9, 10], time: 400},
    { ids: [10, 8], time: 450},
    { ids: [8, 4], time: 100},
    { ids: [10, 7], time: 1000},
];

const junctions: Junction[] = junctionsWithoutConnection.map(j => {
    return {
        ...j,
        connections: roads.reduce((acc: {otherId: number, time: number}[], {ids, time}) => {
            let otherId;

            if (ids[0] === j.id) {
                otherId = ids[1];
            } else if (ids[1] === j.id) {
                otherId = ids[0];
            } else {
                return acc;
            }

            const out = [...acc];
            out.push({otherId, time});

            return out;
        }, [])
    }
});

const start = <Junction>junctions.find(({id}) => id === 1);
const end = <Junction>junctions.find(({id}) => id === 4);

class RoadTrip extends AStar<Junction> {
    calculateDistanceBetweenNodes(a: Junction, b: Junction): number {
        if (a.id === b.id) {
            return 0;
        }
        const connection = a.connections.find(({otherId}) => b.id === otherId);
        if (connection) {
            return connection.time
        } else {
            throw "connection missing!"
        }
    }

    calculateH(currentNode: Junction): number {
        return Math.sqrt(Math.pow(currentNode.lat - end.lat, 2) + Math.pow(currentNode.lng - end.lng, 2));
    }

    generateSuccessors(node: Junction): Junction[] {
        return node.connections.map((connection) => {
            const {otherId} = connection;

            return <Junction>junctions.find(({id}) => id === otherId);
        });
    }

    nodesMatch(a: Junction, b: Junction): Boolean {
        return a.id === b.id;
    }
}

const roadTrip = new RoadTrip();

// whether giving end as an object or function, solve() still works and gives the same result
const path = roadTrip.solve(start, end);
console.log('specific object to match given:', path);
const path2 = roadTrip.solve(start, (node) => node.id === 4);
console.log('function to check goal condition given:', path2);
