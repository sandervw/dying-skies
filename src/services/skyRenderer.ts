import type { Dot } from "../types/sky";

const FULL_CIRCLE_RADIANS = Math.PI * 2;
const DOT_RADIUS = 1;

// clear, then paint each dot as a white pixel.
const drawDots = (
  context: CanvasRenderingContext2D,
  dots: readonly Dot[],
  width: number,
  height: number,
): void => {
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#ffffff";
  for (const dot of dots) {
    context.beginPath();
    context.arc(dot.x * width, dot.y * height, DOT_RADIUS, 0, FULL_CIRCLE_RADIANS);
    context.fill();
  }
};

export { drawDots };
