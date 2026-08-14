import type { Palette } from "./palette";

// one coloured pixel, offset from the star's centre.
interface StarPixel {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly colorIndex: number;
}

// one falling star: position, pixel size, pixel cluster.
interface Star {
  readonly fractionX: number;
  readonly fractionY: number;
  readonly pixelSize: number;
  readonly pixels: readonly StarPixel[];
}

// a full field: palette, stars, and shared fall angle.
interface StarField {
  readonly palette: Palette;
  readonly stars: readonly Star[];
  readonly fallAngle: number;
}

export type { StarPixel, Star, StarField };
