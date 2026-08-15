import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { createSeededRandom } from "../services/randomService";
import {
  generateSkyProfile,
  populateStarField,
  renderStarField,
  stepStarField,
} from "../services/starService";

interface StarFieldHandle {
  readonly canvasRef: RefObject<HTMLCanvasElement | null>;
}

// run the falling-star animation loop against a canvas for one sky seed.
const useStarField = (seed: number): StarFieldHandle => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // canvas and loop are external systems, so drive via effect.
  useEffect((): (() => void) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d") ?? null;
    if (canvas === null || context === null) {
      return (): void => {};
    }

    const profile = generateSkyProfile(seed);
    const sessionRandom = createSeededRandom(Date.now());
    let logicalWidth = window.innerWidth;
    let logicalHeight = window.innerHeight;

    // size the backing store to device pixels; draw in logical units.
    const resize = (): void => {
      const ratio = window.devicePixelRatio;
      logicalWidth = window.innerWidth;
      logicalHeight = window.innerHeight;
      canvas.width = Math.floor(logicalWidth * ratio);
      canvas.height = Math.floor(logicalHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resize();
    let state = populateStarField(profile, sessionRandom, logicalWidth, logicalHeight);
    let previousTime = performance.now();
    let elapsedSeconds = 0;
    let animationFrame = 0;

    // one tick: advance by real elapsed time, then paint.
    const tick = (currentTime: number): void => {
      const deltaSeconds = (currentTime - previousTime) / 1000;
      previousTime = currentTime;
      elapsedSeconds += deltaSeconds;
      state = stepStarField(
        state,
        profile,
        sessionRandom,
        logicalWidth,
        logicalHeight,
        deltaSeconds,
      );
      renderStarField(
        context,
        state,
        profile,
        logicalWidth,
        logicalHeight,
        elapsedSeconds,
      );
      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    return (): void => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, [seed]);

  return { canvasRef };
};

export { useStarField };
