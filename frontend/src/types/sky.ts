import type { Palette } from "./palette";

/** deterministic, sky-level parameters shared by every falling star. */
interface SkyProfile {
  readonly palette: Palette;
  readonly fallAngle: number;
}

/** one static background dot; x/y are 0..1 fractions. */
interface Dot {
  readonly x: number;
  readonly y: number;
}

/** one constellation line linking two dots by index. */
interface Edge {
  readonly from: number;
  readonly to: number;
}

/** one constellation: its own member dots and connecting edges. */
interface Constellation {
  readonly dots: readonly Dot[];
  readonly edges: readonly Edge[];
}

/** a full sky: its scattered background dots plus one constellation. */
interface Sky {
  readonly backgroundDots: readonly Dot[];
  readonly constellation: Constellation;
}

/** a dot's index paired with its squared distance from an anchor. */
interface NearnessEntry {
  readonly index: number;
  readonly squaredDistance: number;
}

/** a non-tree edge with its squared length, for loop selection. */
interface CandidateEdge {
  readonly from: number;
  readonly to: number;
  readonly squaredDistance: number;
}

export type {
  SkyProfile,
  Dot,
  Edge,
  Constellation,
  Sky,
  NearnessEntry,
  CandidateEdge,
};
