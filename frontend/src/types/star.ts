import type { Seed } from "../services/randomService";

/** one coloured pixel, offset from the star's centre. */
interface StarPixel {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly colorIndex: number;
}

/** one live falling star; seed is identity, position moves. */
interface FallingStar {
  readonly id: number;
  readonly seed: Seed;
  readonly tag: string | null;
  positionX: number;
  positionY: number;
  readonly velocityX: number;
  readonly velocityY: number;
  readonly pixelSize: number;
  readonly halfLength: number;
  readonly wobblePhase: number;
  readonly pixels: readonly StarPixel[];
}

/** the whole simulation at one instant; each step returns the next. */
interface StarFieldState {
  readonly stars: readonly FallingStar[];
  readonly spawnAccumulator: number;
  readonly nextStarId: number;
}

export type { StarPixel, FallingStar, StarFieldState };
