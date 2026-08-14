// one palette colour as HSL components.
interface PaletteColor {
  readonly hue: number;
  readonly saturation: number;
  readonly lightness: number;
}

// a deterministic set of colours drawn for one sky.
interface Palette {
  readonly colors: readonly PaletteColor[];
}

export type { PaletteColor, Palette };
