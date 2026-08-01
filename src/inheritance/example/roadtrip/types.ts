export interface JunctionWithoutConnection {
  id: number;
  lat: number;
  lng: number;
}

export interface Road {
  ids: readonly [number, number]; // ids of start and end junctions
  time: number;
}

export interface Junction {
  id: number;
  lat: number;
  lng: number;
  connections: {
    otherId: number;
    time: number;
  }[];
}
