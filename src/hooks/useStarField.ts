import { useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent, RefObject } from "react";
import { createSeededRandom } from "../services/randomService";
import {
  findStarAtCoordinates,
  generateSkyProfile,
  populateStarField,
  renderStarField,
  stepStarField,
} from "../services/starService";
import type { StarFieldState } from "../types/star";

interface StarFieldHandle {
  readonly canvasRef: RefObject<HTMLCanvasElement | null>;
  readonly handleClick: (event: ReactMouseEvent<HTMLCanvasElement>) => void;
  readonly handleMouseMove: (event: ReactMouseEvent<HTMLCanvasElement>) => void;
  readonly handleMouseLeave: () => void;
}

/** run the falling-star animation loop against a canvas for one sky seed. */
const useStarField = (
  seed: number,
  onSelectStar?: (starSeed: number) => void,
): StarFieldHandle => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<StarFieldState | null>(null);
  const fallAngleRef = useRef<number>(0);
  const hoveredStarIdRef = useRef<number | null>(null);

  const getCanvasCoordinates = (
    event: ReactMouseEvent<HTMLCanvasElement>,
  ): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return { x: 0, y: 0 };
    }
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handleMouseMove = (event: ReactMouseEvent<HTMLCanvasElement>): void => {
    const state = stateRef.current;
    const canvas = canvasRef.current;
    if (state === null || canvas === null) {
      return;
    }
    const { x, y } = getCanvasCoordinates(event);
    const star = findStarAtCoordinates(state.stars, fallAngleRef.current, x, y);
    hoveredStarIdRef.current = star?.id ?? null;
    canvas.style.cursor = star !== null ? "pointer" : "default";
  };

  const handleMouseLeave = (): void => {
    const canvas = canvasRef.current;
    hoveredStarIdRef.current = null;
    if (canvas !== null) {
      canvas.style.cursor = "default";
    }
  };

  const handleClick = (event: ReactMouseEvent<HTMLCanvasElement>): void => {
    const state = stateRef.current;
    if (state === null || onSelectStar === undefined) {
      return;
    }
    const { x, y } = getCanvasCoordinates(event);
    const star = findStarAtCoordinates(state.stars, fallAngleRef.current, x, y);
    if (star !== null) {
      onSelectStar(star.seed);
    }
  };

  // canvas and loop are external systems, so drive via effect.
  useEffect((): (() => void) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d") ?? null;
    if (canvas === null || context === null) {
      return (): void => {};
    }

    const profile = generateSkyProfile(seed);
    fallAngleRef.current = profile.fallAngle;
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
    stateRef.current = state;
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
        hoveredStarIdRef.current,
      );
      stateRef.current = state;
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
      stateRef.current = null;
      hoveredStarIdRef.current = null;
    };
  }, [seed]);

  return { canvasRef, handleClick, handleMouseMove, handleMouseLeave };
};

export { useStarField };
