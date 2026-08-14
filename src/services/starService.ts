import { createSeededRandom } from "./randomService";
import type { RandomNumberGenerator } from "./randomService";
import { generatePalette, toCssColor } from "./paletteService";
import type { Palette } from "../types/palette";
import type { Star, StarField, StarPixel } from "../types/star";

////////////////////////////////////////////////////////////
// GENERATION
////////////////////////////////////////////////////////////

// tunable field size and comet shape.
const STAR_COUNT = 59;
const SIZE_MINIMUM = 20;
const SIZE_MAXIMUM = 50;
const SHAPE_ASPECT = 3.2; // length divided by width
const PIXEL_SIZE = 2;

// tunable fall direction; degrees measured clockwise from the positive x-axis.
const FALL_ANGLE_MINIMUM_DEGREES = 70;
const FALL_ANGLE_MAXIMUM_DEGREES = 110;
const DEGREES_TO_RADIANS = Math.PI / 180;

// keep palette independent of the star layout.
const PALETTE_SEED_STRIDE = 100003;

// map a 0..1 draw into the [minimum, maximum) range.
const randomInRange = (
  random: RandomNumberGenerator,
  minimum: number,
  maximum: number,
): number => minimum + random() * (maximum - minimum);

// fill a round-headed, tapering comet silhouette with randomly coloured pixels.
const buildCometPixels = (
  random: RandomNumberGenerator,
  length: number,
  width: number,
  paletteLength: number,
): readonly StarPixel[] => {
  const halfLength = length / 2;
  const radius = width / 2;
  const headX = halfLength - radius;
  const columns = Math.max(1, Math.round(length / PIXEL_SIZE));
  const rows = Math.max(1, Math.round(width / PIXEL_SIZE));
  const pixels: StarPixel[] = [];
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      const offsetX = -halfLength + (column + 0.5) * PIXEL_SIZE;
      const offsetY = -radius + (row + 0.5) * PIXEL_SIZE;
      const insideHead = (offsetX - headX) ** 2 + offsetY ** 2 <= radius ** 2;
      const taperHalf = (radius * (offsetX + halfLength)) / (length - radius);
      const insideTail = offsetX <= headX && Math.abs(offsetY) <= taperHalf;
      if (insideHead || insideTail) {
        pixels.push({
          offsetX,
          offsetY,
          colorIndex: Math.floor(random() * paletteLength),
        });
      }
    }
  }
  return pixels;
};

// build a deterministic field of scattered comets.
const buildStars = (
  random: RandomNumberGenerator,
  paletteLength: number,
): readonly Star[] => {
  const stars: Star[] = [];
  for (let index = 0; index < STAR_COUNT; index += 1) {
    const length = randomInRange(random, SIZE_MINIMUM, SIZE_MAXIMUM);
    const width = length / SHAPE_ASPECT;
    stars.push({
      fractionX: random(),
      fractionY: random(),
      pixelSize: PIXEL_SIZE,
      pixels: buildCometPixels(random, length, width, paletteLength),
    });
  }
  return stars;
};

// draw one shared fall angle for the whole field.
const pickFallAngle = (random: RandomNumberGenerator): number =>
  randomInRange(random, FALL_ANGLE_MINIMUM_DEGREES, FALL_ANGLE_MAXIMUM_DEGREES) *
  DEGREES_TO_RADIANS;

// generate a full star field (palette + stars + fall angle) from one seed.
const generateStarField = (seed: number): StarField => {
  const palette = generatePalette(seed * PALETTE_SEED_STRIDE);
  const random = createSeededRandom(seed);
  const stars = buildStars(random, palette.colors.length);
  const fallAngle = pickFallAngle(random);
  return { palette, stars, fallAngle };
};

////////////////////////////////////////////////////////////
// RENDERING
////////////////////////////////////////////////////////////

// paint one comet as its cluster of coloured pixels.
const drawStar = (
  context: CanvasRenderingContext2D,
  star: Star,
  palette: Palette,
): void => {
  const offset = star.pixelSize / 2;
  for (const pixel of star.pixels) {
    context.fillStyle = toCssColor(palette.colors[pixel.colorIndex]);
    context.fillRect(
      pixel.offsetX - offset,
      pixel.offsetY - offset,
      star.pixelSize,
      star.pixelSize,
    );
  }
};

// clear the field, then paint every comet at the shared fall angle.
const renderStarField = (
  context: CanvasRenderingContext2D,
  field: StarField,
  width: number,
  height: number,
): void => {
  context.clearRect(0, 0, width, height);
  for (const star of field.stars) {
    context.save();
    context.translate(star.fractionX * width, star.fractionY * height);
    context.rotate(field.fallAngle);
    drawStar(context, star, field.palette);
    context.restore();
  }
};

export { generateStarField, renderStarField };
