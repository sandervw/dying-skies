import { createSeededRandom } from "./randomService";
import type { RandomNumberGenerator } from "./randomService";
import type { Palette, PaletteColor } from "../types/palette";

// tunable range for how many colours a palette holds.
const COLOR_COUNT_MINIMUM = 2;
const COLOR_COUNT_MAXIMUM = 12;

// each sky draws one saturation/lightness centre from these ranges.
const SATURATION_CENTER_MINIMUM = 17;
const SATURATION_CENTER_MAXIMUM = 85;
const LIGHTNESS_CENTER_MINIMUM = 15;
const LIGHTNESS_CENTER_MAXIMUM = 75;

// colours vary only slightly around their sky's centres.
const SATURATION_SPREAD = 12;
const LIGHTNESS_SPREAD = 12;

// how wide a sky's hue family spreads, drawn per sky.
const HUE_SPAN_MINIMUM = 7;
const HUE_SPAN_MAXIMUM = 106;
const HUE_STOP_COUNT = 5;

// how far a colour may wander from its hue anchor.
const HUE_JITTER_DEGREES = 8;

const DEGREES_IN_CIRCLE = 360;

// map a 0..1 draw into the [minimum, maximum) range.
const randomInRange = (
  random: RandomNumberGenerator,
  minimum: number,
  maximum: number,
): number => minimum + random() * (maximum - minimum);

// keep a percentage inside the valid 0..100 range.
const clampPercent = (value: number): number => Math.min(100, Math.max(0, value));

// wrap any hue back into the 0..360 range.
const normalizeHue = (hue: number): number =>
  ((hue % DEGREES_IN_CIRCLE) + DEGREES_IN_CIRCLE) % DEGREES_IN_CIRCLE;

// evenly spaced hue anchors across the span, centred on the base hue.
const buildHueOffsets = (spanDegrees: number, stopCount: number): number[] => {
  if (stopCount <= 1) {
    return [0];
  }
  const step = spanDegrees / (stopCount - 1);
  return Array.from(
    { length: stopCount },
    (_unused, index) => -spanDegrees / 2 + index * step,
  );
};

// build one colour: anchored hue with jitter, plus centre-hugging saturation/lightness.
const generateColor = (
  random: RandomNumberGenerator,
  baseHue: number,
  anchorOffset: number,
  saturationCenter: number,
  lightnessCenter: number,
): PaletteColor => ({
  hue: normalizeHue(
    baseHue +
    anchorOffset +
    randomInRange(random, -HUE_JITTER_DEGREES, HUE_JITTER_DEGREES),
  ),
  saturation: clampPercent(
    saturationCenter + randomInRange(random, -SATURATION_SPREAD, SATURATION_SPREAD),
  ),
  lightness: clampPercent(
    lightnessCenter + randomInRange(random, -LIGHTNESS_SPREAD, LIGHTNESS_SPREAD),
  ),
});

/** generate a full palette from one seed. */
const generatePalette = (seed: number): Palette => {
  const random = createSeededRandom(seed);
  const baseHue = random() * DEGREES_IN_CIRCLE;
  const saturationCenter = randomInRange(
    random,
    SATURATION_CENTER_MINIMUM,
    SATURATION_CENTER_MAXIMUM,
  );
  const lightnessCenter = randomInRange(
    random,
    LIGHTNESS_CENTER_MINIMUM,
    LIGHTNESS_CENTER_MAXIMUM,
  );
  const hueSpan = randomInRange(random, HUE_SPAN_MINIMUM, HUE_SPAN_MAXIMUM);
  const colorCount = Math.max(
    1,
    Math.floor(randomInRange(random, COLOR_COUNT_MINIMUM, COLOR_COUNT_MAXIMUM + 1)),
  );
  const offsets = buildHueOffsets(hueSpan, HUE_STOP_COUNT);
  const colors: PaletteColor[] = [];
  for (let index = 0; index < colorCount; index += 1) {
    const anchorOffset = offsets[index % offsets.length];
    colors.push(
      generateColor(random, baseHue, anchorOffset, saturationCenter, lightnessCenter),
    );
  }
  return { colors };
};

/** format one palette colour as a CSS hsl() string. */
const toCssColor = (color: PaletteColor): string =>
  `hsl(${color.hue}, ${color.saturation}%, ${color.lightness}%)`;

/** the palette's median colour by lightness, used as the accent. */
const pickAccentColor = (palette: Palette): PaletteColor => {
  const byLightness = [...palette.colors].sort(
    (first, second) => first.lightness - second.lightness,
  );
  return byLightness[Math.floor(byLightness.length / 2)];
};

export { generatePalette, toCssColor, pickAccentColor };
