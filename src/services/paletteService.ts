import { createSeededRandom } from "./randomService";
import type { RandomNumberGenerator } from "./randomService";
import type { Palette, PaletteColor } from "../types/palette";

// tunable range for how many colours a palette holds.
const COLOR_COUNT_MINIMUM = 8;
const COLOR_COUNT_MAXIMUM = 12;

// tunable HSL ranges; kept off the extremes to avoid muddy or neon colours.
const SATURATION_MINIMUM = 45;
const SATURATION_MAXIMUM = 90;
const LIGHTNESS_MINIMUM = 45;
const LIGHTNESS_MAXIMUM = 72;

// how far a colour may wander from its anchor.
const HUE_JITTER_DEGREES = 12;

const DEGREES_IN_CIRCLE = 360;

// hue offsets from the base hue, spread analogously.
const ANALOGOUS_HUE_OFFSETS: readonly number[] = [-30, -15, 0, 15, 30];

// map a 0..1 draw into the [minimum, maximum) range.
const randomInRange = (
  random: RandomNumberGenerator,
  minimum: number,
  maximum: number,
): number => minimum + random() * (maximum - minimum);

// wrap any hue back into the 0..360 range.
const normalizeHue = (hue: number): number =>
  ((hue % DEGREES_IN_CIRCLE) + DEGREES_IN_CIRCLE) % DEGREES_IN_CIRCLE;

// build one colour: an anchored hue with jitter, plus constrained saturation/lightness.
const generateColor = (
  random: RandomNumberGenerator,
  baseHue: number,
  anchorOffset: number,
): PaletteColor => ({
  hue: normalizeHue(
    baseHue +
    anchorOffset +
    randomInRange(random, -HUE_JITTER_DEGREES, HUE_JITTER_DEGREES),
  ),
  saturation: randomInRange(random, SATURATION_MINIMUM, SATURATION_MAXIMUM),
  lightness: randomInRange(random, LIGHTNESS_MINIMUM, LIGHTNESS_MAXIMUM),
});

// generate a full palette from one seed.
const generatePalette = (seed: number): Palette => {
  const random = createSeededRandom(seed);
  const baseHue = random() * DEGREES_IN_CIRCLE;
  const colorCount = Math.floor(
    randomInRange(random, COLOR_COUNT_MINIMUM, COLOR_COUNT_MAXIMUM + 1),
  );
  const colors: PaletteColor[] = [];
  for (let index = 0; index < colorCount; index += 1) {
    const anchorOffset =
      ANALOGOUS_HUE_OFFSETS[index % ANALOGOUS_HUE_OFFSETS.length];
    colors.push(generateColor(random, baseHue, anchorOffset));
  }
  return { colors };
};

// format one palette colour as a CSS hsl() string.
const toCssColor = (color: PaletteColor): string =>
  `hsl(${color.hue}, ${color.saturation}%, ${color.lightness}%)`;

export { generatePalette, toCssColor };
