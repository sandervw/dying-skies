import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { generateSky, renderSky } from "../services/skyService";

interface SkyHandle {
  readonly canvasRef: RefObject<HTMLCanvasElement | null>;
}

// wire a seed to the canvas; redraw when seed changes.
const useSky = (seed: number): SkyHandle => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // canvas is an external system, so drive it via effect.
  useEffect((): (() => void) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d") ?? null;
    if (canvas === null || context === null) {
      return (): void => {};
    }

    const sky = generateSky(seed);

    // size canvas to device pixels, then paint the sky.
    const render = (): void => {
      const ratio = window.devicePixelRatio;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      renderSky(context, sky, width, height);
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

export { useSky };
