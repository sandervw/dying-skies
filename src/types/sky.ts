// one static background dot; x/y are 0..1 fractions.
interface Dot {
  readonly x: number;
  readonly y: number;
}

// one constellation line linking two dots by their index in the dot field.
interface Edge {
  readonly from: number;
  readonly to: number;
}

// a full sky: its dot field and constellation edges.
interface Sky {
  readonly dots: readonly Dot[];
  readonly edges: readonly Edge[];
}

// a dot's index paired with its squared distance from an anchor.
interface NearnessEntry {
  readonly index: number;
  readonly squaredDistance: number;
}

// a non-tree edge with its squared length, for loop selection.
interface CandidateEdge {
  readonly from: number;
  readonly to: number;
  readonly squaredDistance: number;
}

export type { Dot, Edge, Sky, NearnessEntry, CandidateEdge };
