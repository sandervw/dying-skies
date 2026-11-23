import { toCssColor } from "./paletteService";
import { SHAPE_ASPECT } from "./starService";
import type { FallingStar, StarFieldState, StarPixel } from "../types/star";
import type { SkyProfile } from "../types/sky";

////////////////////////////////////////////////////////////
// TUNABLES
////////////////////////////////////////////////////////////

// extra hit-target padding in pixels around the star silhouette.
const HIT_PADDING = 6;

// per-star wobble phase and tail-wag shape.
const WAG_AMPLITUDE = 1;
const WAG_FREQUENCY = 40;
const WAG_WAVENUMBER = 0.1;

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

/** paint one comet as its cluster of pixels, tail wagging. */
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

/** paint every live star, tails wagging; caller clears first. */
const renderStarField = (
  context: CanvasRenderingContext2D,
  state: StarFieldState,
  profile: SkyProfile,
  elapsedSeconds: number,
): void => {
  for (const star of state.stars) {
    context.save();
    context.translate(star.positionX, star.positionY);
    context.rotate(profile.fallAngle);
    drawStar(context, star, profile, elapsedSeconds);
    context.restore();
  }
};

////////////////////////////////////////////////////////////
// HIT TESTING
////////////////////////////////////////////////////////////

// test if a point (px, py) intersects a falling star with orientation.
const isPointInsideStar = (
  star: FallingStar,
  fallAngle: number,
  pointX: number,
  pointY: number,
): boolean => {
  const deltaX = pointX - star.positionX;
  const deltaY = pointY - star.positionY;
  const cosine = Math.cos(-fallAngle);
  const sine = Math.sin(-fallAngle);
  const localX = deltaX * cosine - deltaY * sine;
  const localY = deltaX * sine + deltaY * cosine;
  const halfLength = star.halfLength + HIT_PADDING;
  const radius = star.halfLength / SHAPE_ASPECT + HIT_PADDING;
  const headX = star.halfLength - star.halfLength / SHAPE_ASPECT;
  const insideHead = (localX - headX) ** 2 + localY ** 2 <= radius ** 2;
  const taperHalf =
    (radius * (localX + halfLength)) / (2 * star.halfLength - star.halfLength / SHAPE_ASPECT);
  const insideTail =
    localX >= -halfLength &&
    localX <= headX &&
    Math.abs(localY) <= Math.max(taperHalf, HIT_PADDING);
  return insideHead || insideTail;
};

/** find the topmost falling star under given coordinates. */
const findStarAtCoordinates = (
  stars: readonly FallingStar[],
  fallAngle: number,
  pointX: number,
  pointY: number,
): FallingStar | null => {
  for (let index = stars.length - 1; index >= 0; index -= 1) {
    const star = stars[index];
    if (isPointInsideStar(star, fallAngle, pointX, pointY)) {
      return star;
    }
  }
  return null;
};

export { drawStar, renderStarField, findStarAtCoordinates };
