import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { createSeededRandom } from "../services/seededRandom";
import { generateDots } from "../services/skyGeneration";
import { drawDots } from "../services/skyRenderer";

interface SkyCanvasHandle {
  readonly canvasRef: RefObject<HTMLCanvasElement | null>;
}

// wire a seed to the canvas; redraw when seed changes.
const useSkyCanvas = (seed: number): SkyCanvasHandle => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // canvas is an external system, so drive it via effect.
  useEffect((): (() => void) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d") ?? null;
    if (canvas === null || context === null) {
      return (): void => {};
    }

    const dots = generateDots(createSeededRandom(seed));

    // size canvas to device pixels, then paint the dots.
    const render = (): void => {
      const ratio = window.devicePixelRatio;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      drawDots(context, dots, width, height);
    };

    // draw once, then repaint on every window resize.
    render();
    window.addEventListener("resize", render);
    return (): void => {
      window.removeEventListener("resize", render);
    };
  }, [seed]);

  return { canvasRef };
};

export { useSkyCanvas };
