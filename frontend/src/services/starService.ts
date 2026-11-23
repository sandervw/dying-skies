import { createSeededRandom, deriveSeed } from "./randomService";
import type { RandomNumberGenerator, Seed } from "./randomService";
import { generatePalette } from "./paletteService";
import type { FallingStar, StarFieldState, StarPixel } from "../types/star";
import type { SkyProfile } from "../types/sky";

////////////////////////////////////////////////////////////
// TUNABLES
////////////////////////////////////////////////////////////

// comet shape.
const SIZE_MINIMUM = 20;
const SIZE_MAXIMUM = 50;
const SHAPE_ASPECT = 3.2;
const PIXEL_SIZE = 2;

// fall speed in pixels per second; the spread gives free parallax depth.
const SPEED_MINIMUM = 70;
const SPEED_MAXIMUM = 130;

// how many stars we aim to keep alive on screen at once.
const TARGET_STAR_COUNT = 40;

// fall direction; degrees measured clockwise from the positive x-axis.
const FALL_ANGLE_MINIMUM_DEGREES = 70;
const FALL_ANGLE_MAXIMUM_DEGREES = 110;

// clamp a frame's elapsed time so hidden tabs cannot teleport stars.
const MAXIMUM_DELTA_SECONDS = 0.05;

////////////////////////////////////////////////////////////
// GENERATION
////////////////////////////////////////////////////////////

// a point in canvas pixels.
interface Point {
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
  (Math.PI / 180);

/** derive the sky's deterministic palette and fall angle from one seed. */
const generateSkyProfile = (seed: Seed): SkyProfile => {
  const palette = generatePalette(deriveSeed(seed, "palette"));
  const random = createSeededRandom(deriveSeed(seed, "fall-angle"));
  const fallAngle = pickFallAngle(random);
  return { palette, fallAngle };
};

/** build one star: its seed fixes the look, the caller places it. */
const buildStar = (
  identity: Pick<FallingStar, "seed" | "tag">,
  id: number,
  profile: SkyProfile,
  position: Point,
): FallingStar => {
  const shape = createSeededRandom(deriveSeed(identity.seed, "star-shape"));
  const length = randomInRange(shape, SIZE_MINIMUM, SIZE_MAXIMUM);
  const width = length / SHAPE_ASPECT;
  const speed = randomInRange(shape, SPEED_MINIMUM, SPEED_MAXIMUM);
  const pixels = buildCometPixels(shape, length, width, profile.palette.colors.length);
  return {
    id,
    seed: identity.seed,
    tag: identity.tag,
    positionX: position.x,
    positionY: position.y,
    velocityX: Math.cos(profile.fallAngle) * speed,
    velocityY: Math.sin(profile.fallAngle) * speed,
    pixelSize: PIXEL_SIZE,
    halfLength: length / 2,
    wobblePhase: shape() * Math.PI * 2,
    pixels,
  };
};

////////////////////////////////////////////////////////////
// SPAWNING
////////////////////////////////////////////////////////////

/** a seed paired with its real, backend-issued save tag. */
interface SeedTagPair {
  readonly seed: Seed;
  readonly tag: string;
}

/** what the field reads from outside: sky, randomness, size, issued stars. */
interface StarFieldInputs {
  readonly profile: SkyProfile;
  readonly sessionRandom: RandomNumberGenerator;
  readonly width: number;
  readonly height: number;
  readonly takeSeedAndTag: () => SeedTagPair | null;
}

// pick an entry just outside the top or inflow side, by flux.
const pickEntryPoint = (inputs: StarFieldInputs): Point => {
  const { profile, sessionRandom, width, height } = inputs;
  const directionX = Math.cos(profile.fallAngle);
  const directionY = Math.sin(profile.fallAngle);
  const topInflow = Math.abs(directionY) * width;
  const sideInflow = Math.abs(directionX) * height;
  const alongTop = sessionRandom() * (topInflow + sideInflow) < topInflow;
  const entryX = alongTop ? sessionRandom() * width : directionX > 0 ? 0 : width;
  const entryY = alongTop ? 0 : sessionRandom() * height;
  return { x: entryX - directionX * SIZE_MAXIMUM, y: entryY - directionY * SIZE_MAXIMUM };
};

// spawn rate that, at steady state, holds the target on-screen count.
const spawnRatePerSecond = (fallAngle: number, height: number): number => {
  const verticalSpeed = Math.max(1, Math.abs(Math.sin(fallAngle)) * ((SPEED_MINIMUM + SPEED_MAXIMUM) / 2));
  const lifetimeSeconds = height / verticalSpeed;
  return TARGET_STAR_COUNT / lifetimeSeconds;
};

/** fill the field to the target count with issued stars, if available. */
const populateStarField = (inputs: StarFieldInputs): StarFieldState => {
  const { profile, sessionRandom, width, height, takeSeedAndTag } = inputs;
  const stars: FallingStar[] = [];
  let nextStarId = 0;
  while (nextStarId < TARGET_STAR_COUNT) {
    const issued = takeSeedAndTag();
    if (issued === null) {
      break;
    }
    const position = { x: sessionRandom() * width, y: sessionRandom() * height };
    stars.push(buildStar(issued, nextStarId, profile, position));
    nextStarId += 1;
  }
  return { stars, spawnAccumulator: 0, nextStarId };
};

////////////////////////////////////////////////////////////
// SIMULATION
////////////////////////////////////////////////////////////

// slide one star along its velocity in place; frozen stars hold still.
const advanceStar = (
  star: FallingStar,
  deltaSeconds: number,
  isFrozen: boolean,
): void => {
  if (isFrozen) {
    return;
  }
  star.positionX += star.velocityX * deltaSeconds;
  star.positionY += star.velocityY * deltaSeconds;
};

// stars only fall, so cull once past the bottom or either side.
const isOnscreen = (star: FallingStar, width: number, height: number): boolean =>
  star.positionY <= height + SIZE_MAXIMUM &&
  star.positionX >= -SIZE_MAXIMUM &&
  star.positionX <= width + SIZE_MAXIMUM;

/** advance the field one frame: move, cull, then spawn replacements. */
const stepStarField = (
  state: StarFieldState,
  inputs: StarFieldInputs,
  deltaSeconds: number,
  frozenStarId?: number | null,
): StarFieldState => {
  const { profile, width, height, takeSeedAndTag } = inputs;
  const step = Math.min(deltaSeconds, MAXIMUM_DELTA_SECONDS);
  for (const star of state.stars) {
    advanceStar(star, step, star.id === frozenStarId);
  }
  const stars = state.stars.filter((star) => isOnscreen(star, width, height));

  let spawnAccumulator =
    state.spawnAccumulator + spawnRatePerSecond(profile.fallAngle, height) * step;
  let nextStarId = state.nextStarId;
  while (spawnAccumulator >= 1) {
    const issued = takeSeedAndTag();
    if (issued === null) {
      break;
    }
    spawnAccumulator -= 1;
    stars.push(buildStar(issued, nextStarId, profile, pickEntryPoint(inputs)));
    nextStarId += 1;
  }
  return { stars, spawnAccumulator, nextStarId };
};

export type { StarFieldInputs };
export {
  SHAPE_ASPECT,
  generateSkyProfile,
  buildStar,
  populateStarField,
  stepStarField,
};
