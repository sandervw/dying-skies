import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { generateStarField, renderStarField } from "../services/starService";

interface StarFieldHandle {
  readonly canvasRef: RefObject<HTMLCanvasElement | null>;
}

// rebuild and redraw the canvas when the seed changes.
const useStarField = (seed: number): StarFieldHandle => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // canvas is an external system, so drive it via effect.
  useEffect((): (() => void) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d") ?? null;
    if (canvas === null || context === null) {
      return (): void => {};
    }

    const field = generateStarField(seed);

    // size canvas to device pixels, then paint the star field.
    const render = (): void => {
      const ratio = window.devicePixelRatio;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      renderStarField(context, field, width, height);
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

export { useStarField };
