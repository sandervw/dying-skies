import { createSeededRandom } from "./randomService";
import type { RandomNumberGenerator } from "./randomService";
import { generatePalette, toCssColor } from "./paletteService";
import type {
  FallingStar,
  SkyProfile,
  StarFieldState,
  StarPixel,
} from "../types/star";

////////////////////////////////////////////////////////////
// TUNABLES
////////////////////////////////////////////////////////////

// comet shape.
const SIZE_MINIMUM = 20;
const SIZE_MAXIMUM = 50;
const SHAPE_ASPECT = 3.2;
const PIXEL_SIZE = 2;

// fall speed in pixels per second; the spread gives free parallax depth.
const SPEED_MINIMUM = 110;
const SPEED_MAXIMUM = 170;
const AVERAGE_SPEED = (SPEED_MINIMUM + SPEED_MAXIMUM) / 2;

// how many stars we aim to keep alive on screen at once.
const TARGET_STAR_COUNT = 40;

// fall direction; degrees measured clockwise from the positive x-axis.
const FALL_ANGLE_MINIMUM_DEGREES = 70;
const FALL_ANGLE_MAXIMUM_DEGREES = 110;
const DEGREES_TO_RADIANS = Math.PI / 180;

// clamp a frame's elapsed time so hidden tabs cannot teleport stars.
const MAXIMUM_DELTA_SECONDS = 0.05;

// per-star wobble phase and tail-wag shape.
const TWO_PI = Math.PI * 2;
const WAG_AMPLITUDE = 1;
const WAG_FREQUENCY = 40;
const WAG_WAVENUMBER = 0.1;

// keep the palette independent of the star layout.
const PALETTE_SEED_STRIDE = 100003;

// full range of a 32-bit seed.
const SEED_RANGE = 0x100000000;

////////////////////////////////////////////////////////////
// GENERATION
////////////////////////////////////////////////////////////

// entry point where a fresh star crosses into the frame.
interface EntryPoint {
  readonly x: number;
  readonly y: number;
}

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

// draw one shared fall angle for the whole field.
const pickFallAngle = (random: RandomNumberGenerator): number =>
  randomInRange(random, FALL_ANGLE_MINIMUM_DEGREES, FALL_ANGLE_MAXIMUM_DEGREES) *
  DEGREES_TO_RADIANS;

// derive the sky's deterministic palette and fall angle from one seed.
const generateSkyProfile = (seed: number): SkyProfile => {
  const palette = generatePalette(seed * PALETTE_SEED_STRIDE);
  const random = createSeededRandom(seed);
  const fallAngle = pickFallAngle(random);
  return { palette, fallAngle };
};

////////////////////////////////////////////////////////////
// SPAWNING
////////////////////////////////////////////////////////////

// draw a fresh 32-bit star seed from the session stream.
const drawSeed = (sessionRandom: RandomNumberGenerator): number =>
  Math.floor(sessionRandom() * SEED_RANGE);

// build one star: seed fixes appearance, position is given.
const buildStar = (
  starSeed: number,
  id: number,
  profile: SkyProfile,
  positionX: number,
  positionY: number,
): FallingStar => {
  const shape = createSeededRandom(starSeed);
  const length = randomInRange(shape, SIZE_MINIMUM, SIZE_MAXIMUM);
  const width = length / SHAPE_ASPECT;
  const speed = randomInRange(shape, SPEED_MINIMUM, SPEED_MAXIMUM);
  const pixels = buildCometPixels(shape, length, width, profile.palette.colors.length);
  return {
    id,
    seed: starSeed,
    positionX,
    positionY,
    velocityX: Math.cos(profile.fallAngle) * speed,
    velocityY: Math.sin(profile.fallAngle) * speed,
    pixelSize: PIXEL_SIZE,
    halfLength: length / 2,
    wobblePhase: shape() * TWO_PI,
    pixels,
  };
};

// pick an entry on the top or inflow side, by flux.
const pickEntryPoint = (
  fallAngle: number,
  sessionRandom: RandomNumberGenerator,
  width: number,
  height: number,
  margin: number,
): EntryPoint => {
  const directionX = Math.cos(fallAngle);
  const directionY = Math.sin(fallAngle);
  const topInflow = Math.abs(directionY) * width;
  const sideInflow = Math.abs(directionX) * height;
  const alongTop = sessionRandom() * (topInflow + sideInflow) < topInflow;
  const x = alongTop ? sessionRandom() * width : directionX > 0 ? 0 : width;
  const y = alongTop ? 0 : sessionRandom() * height;
  return { x: x - directionX * margin, y: y - directionY * margin };
};

// spawn one star just outside the boundary so it slides in.
const spawnStar = (
  id: number,
  profile: SkyProfile,
  sessionRandom: RandomNumberGenerator,
  width: number,
  height: number,
): FallingStar => {
  const starSeed = drawSeed(sessionRandom);
  const entry = pickEntryPoint(profile.fallAngle, sessionRandom, width, height, SIZE_MAXIMUM);
  return buildStar(starSeed, id, profile, entry.x, entry.y);
};

// spawn rate that, at steady state, holds the target on-screen count.
const spawnRatePerSecond = (fallAngle: number, height: number): number => {
  const verticalSpeed = Math.max(1, Math.abs(Math.sin(fallAngle)) * AVERAGE_SPEED);
  const lifetimeSeconds = height / verticalSpeed;
  return TARGET_STAR_COUNT / lifetimeSeconds;
};

// start with the field already full, scattered across the whole frame.
const populateStarField = (
  profile: SkyProfile,
  sessionRandom: RandomNumberGenerator,
  width: number,
  height: number,
): StarFieldState => {
  const stars: FallingStar[] = [];
  for (let id = 0; id < TARGET_STAR_COUNT; id += 1) {
    const starSeed = drawSeed(sessionRandom);
    stars.push(
      buildStar(starSeed, id, profile, sessionRandom() * width, sessionRandom() * height),
    );
  }
  return { stars, spawnAccumulator: 0, nextStarId: TARGET_STAR_COUNT };
};

////////////////////////////////////////////////////////////
// SIMULATION
////////////////////////////////////////////////////////////

// slide one star along its velocity by the elapsed time.
const advanceStar = (star: FallingStar, deltaSeconds: number): FallingStar => ({
  ...star,
  positionX: star.positionX + star.velocityX * deltaSeconds,
  positionY: star.positionY + star.velocityY * deltaSeconds,
});

// stars only fall, so cull once past the bottom or either side.
const isOnscreen = (star: FallingStar, width: number, height: number): boolean =>
  star.positionY <= height + SIZE_MAXIMUM &&
  star.positionX >= -SIZE_MAXIMUM &&
  star.positionX <= width + SIZE_MAXIMUM;

// advance the field one frame: move, cull, then spawn replacements.
const stepStarField = (
  state: StarFieldState,
  profile: SkyProfile,
  sessionRandom: RandomNumberGenerator,
  width: number,
  height: number,
  deltaSeconds: number,
): StarFieldState => {
  const step = Math.min(deltaSeconds, MAXIMUM_DELTA_SECONDS);
  const survivors = state.stars
    .map((star) => advanceStar(star, step))
    .filter((star) => isOnscreen(star, width, height));

  let spawnAccumulator =
    state.spawnAccumulator + spawnRatePerSecond(profile.fallAngle, height) * step;
  let nextStarId = state.nextStarId;
  const stars: FallingStar[] = [...survivors];
  while (spawnAccumulator >= 1) {
    spawnAccumulator -= 1;
    stars.push(spawnStar(nextStarId, profile, sessionRandom, width, height));
    nextStarId += 1;
  }
  return { stars, spawnAccumulator, nextStarId };
};

////////////////////////////////////////////////////////////
// RENDERING
////////////////////////////////////////////////////////////

// transverse tail displacement; grows toward the tail, travels along it.
const tailWave = (
  pixel: StarPixel,
  star: FallingStar,
  elapsedSeconds: number,
): number => {
  const tailFraction = (star.halfLength - pixel.offsetX) / (2 * star.halfLength);
  const travel =
    elapsedSeconds * WAG_FREQUENCY + star.wobblePhase + WAG_WAVENUMBER * pixel.offsetX;
  return WAG_AMPLITUDE * tailFraction * Math.sin(travel);
};

// paint one comet as its cluster of pixels, tail wagging.
const drawStar = (
  context: CanvasRenderingContext2D,
  star: FallingStar,
  profile: SkyProfile,
  elapsedSeconds: number,
): void => {
  const offset = star.pixelSize / 2;
  for (const pixel of star.pixels) {
    const wag = tailWave(pixel, star, elapsedSeconds);
    context.fillStyle = toCssColor(profile.palette.colors[pixel.colorIndex]);
    context.fillRect(
      pixel.offsetX - offset,
      pixel.offsetY + wag - offset,
      star.pixelSize,
      star.pixelSize,
    );
  }
};

// clear, then paint every live star, tails wagging.
const renderStarField = (
  context: CanvasRenderingContext2D,
  state: StarFieldState,
  profile: SkyProfile,
  width: number,
  height: number,
  elapsedSeconds: number,
): void => {
  context.clearRect(0, 0, width, height);
  for (const star of state.stars) {
    context.save();
    context.translate(star.positionX, star.positionY);
    context.rotate(profile.fallAngle);
    drawStar(context, star, profile, elapsedSeconds);
    context.restore();
  }
};

export {
  generateSkyProfile,
  populateStarField,
  stepStarField,
  renderStarField,
};
