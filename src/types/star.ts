import type { Palette } from "./palette";

/** one coloured pixel, offset from the star's centre. */
interface StarPixel {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly colorIndex: number;
}

/** one live falling star; seed is identity, position moves. */
interface FallingStar {
  readonly id: number;
  readonly seed: number;
  readonly positionX: number;
  readonly positionY: number;
  readonly velocityX: number;
  readonly velocityY: number;
  readonly pixelSize: number;
  readonly halfLength: number;
  readonly wobblePhase: number;
  readonly pixels: readonly StarPixel[];
}

/** deterministic, sky-level parameters shared by every falling star. */
interface SkyProfile {
  readonly palette: Palette;
  readonly fallAngle: number;
}

/** the whole simulation at one instant; each step returns the next. */
interface StarFieldState {
  readonly stars: readonly FallingStar[];
  readonly spawnAccumulator: number;
  readonly nextStarId: number;
}

export type { StarPixel, FallingStar, SkyProfile, StarFieldState };
