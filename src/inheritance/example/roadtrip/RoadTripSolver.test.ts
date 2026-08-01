import { describe, test } from "node:test";
import { strict as assert } from "node:assert";

import RoadTripSolver from "./RoadTripSolver.ts";
import {
  type Junction,
  type JunctionWithoutConnection,
  type Road,
} from "./types.ts";

describe("RoadTripSolver", () => {
  const junctionsWithoutConnection: ReadonlyArray<JunctionWithoutConnection> = [
    { id: 1, lat: 50, lng: 250 },
    { id: 2, lat: 150, lng: 300 },
    { id: 3, lat: 300, lng: 400 },
    { id: 4, lat: 490, lng: 360 },
    { id: 5, lat: 490, lng: 120 },
    { id: 6, lat: 270, lng: 100 },
    { id: 7, lat: 170, lng: 110 },
    { id: 8, lat: 470, lng: 470 },
    { id: 9, lat: 170, lng: 420 },
    { id: 10, lat: 250, lng: 260 },
  ] as const;

  const roads: ReadonlyArray<Road> = [
    { ids: [1, 2], time: 200 },
    { ids: [2, 3], time: 100 },
    { ids: [3, 4], time: 150 },
    { ids: [4, 5], time: 100 },
    { ids: [5, 6], time: 100 },
    { ids: [6, 7], time: 100 },
    { ids: [7, 1], time: 100 },
    { ids: [1, 9], time: 300 },
    { ids: [2, 9], time: 250 },
    { ids: [9, 10], time: 400 },
    { ids: [10, 8], time: 450 },
    { ids: [8, 4], time: 100 },
    { ids: [10, 7], time: 1000 },
  ] as const;

  const junctions: Junction[] = junctionsWithoutConnection.map((j) => {
    return {
      ...j,
      connections: roads.reduce(
        (acc: { otherId: number; time: number }[], { ids, time }) => {
          let otherId;

          if (ids[0] === j.id) {
            otherId = ids[1];
          } else if (ids[1] === j.id) {
            otherId = ids[0];
          } else {
            return acc;
          }

          const out = [...acc];
          out.push({ otherId, time });

          return out;
        },
        [],
      ),
    };
  });

  const start = junctions.find(({ id }) => id === 1) as Junction;
  const end = junctions.find(({ id }) => id === 4) as Junction;

  const roadTripSolver = new RoadTripSolver();

  test("Can solve the road network", () => {
    const path = roadTripSolver.solve(junctions, start, end);
    assert.deepStrictEqual(
      path,

      [
        {
          connections: [
            {
              otherId: 2,
              time: 200,
            },
            {
              otherId: 7,
              time: 100,
            },
            {
              otherId: 9,
              time: 300,
            },
          ],
          id: 1,
          lat: 50,
          lng: 250,
        },
        {
          connections: [
            {
              otherId: 6,
              time: 100,
            },
            {
              otherId: 1,
              time: 100,
            },
            {
              otherId: 10,
              time: 1000,
            },
          ],
          id: 7,
          lat: 170,
          lng: 110,
        },
        {
          connections: [
            {
              otherId: 5,
              time: 100,
            },
            {
              otherId: 7,
              time: 100,
            },
          ],
          id: 6,
          lat: 270,
          lng: 100,
        },
        {
          connections: [
            {
              otherId: 4,
              time: 100,
            },
            {
              otherId: 6,
              time: 100,
            },
          ],
          id: 5,
          lat: 490,
          lng: 120,
        },
        {
          connections: [
            {
              otherId: 3,
              time: 150,
            },
            {
              otherId: 5,
              time: 100,
            },
            {
              otherId: 8,
              time: 100,
            },
          ],
          id: 4,
          lat: 490,
          lng: 360,
        },
      ],
    );
  });
});
