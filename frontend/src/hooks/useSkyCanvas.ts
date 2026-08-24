import { useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent, RefObject } from "react";
import { createSeededRandom } from "../services/randomService";
import type { Seed } from "../services/randomService";
import { useSkySeed } from "./useSkySeed";
import { fetchStarBatch, rememberTag } from "../services/starApiService";
import type { IssuedStar } from "../services/starApiService";
import { generateSky, renderSky } from "../services/skyService";
import {
  findStarAtCoordinates,
  generateSkyProfile,
  populateStarField,
  renderStarField,
  stepStarField,
} from "../services/starService";
import type { StarFieldState } from "../types/star";

// stars requested per batch call; the backend caps a batch at 100.
const BATCH_SIZE = 100;
// refill once the issuance queue drops below this many stars.
const REFILL_THRESHOLD = 20;
// wait this long before retrying a failed or empty batch call.
const RETRY_DELAY_MS = 2000;

interface SkyHandle {
  readonly canvasRef: RefObject<HTMLCanvasElement | null>;
  readonly handleClick: (event: ReactMouseEvent<HTMLCanvasElement>) => void;
  readonly handleMouseMove: (event: ReactMouseEvent<HTMLCanvasElement>) => void;
  readonly handleMouseLeave: () => void;
}

/** paint the sky and falling-star loop on one canvas per seed. */
const useSkyCanvas = (onSelectStar?: (starSeed: Seed) => void): SkyHandle => {
  const { seed } = useSkySeed();
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
      if (star.tag !== null) {
        rememberTag(star.seed, star.tag);
      }
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

    const sky = generateSky(seed);
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

    // coalesce a burst of resize events into one resize per frame.
    let resizeFrame = 0;
    const scheduleResize = (): void => {
      if (resizeFrame !== 0) {
        return;
      }
      resizeFrame = window.requestAnimationFrame((): void => {
        resizeFrame = 0;
        resize();
      });
    };

    const issuedQueue: IssuedStar[] = [];
    let isRefilling = false;
    let refillAfterMs = 0;

    // top up the queue from the backend, throttled on failure or empty.
    const refillQueue = (): void => {
      if (isRefilling || Date.now() < refillAfterMs) {
        return;
      }
      isRefilling = true;
      refillAfterMs = Date.now() + RETRY_DELAY_MS;
      void fetchStarBatch(BATCH_SIZE)
        .then((batch): void => {
          issuedQueue.push(...batch);
        })
        .catch((): void => {})
        .finally((): void => {
          isRefilling = false;
        });
    };

    // hand out one issued pair, refilling as the queue runs low.
    const takeSeedAndTag = (): IssuedStar | null => {
      if (issuedQueue.length < REFILL_THRESHOLD) {
        refillQueue();
      }
      return issuedQueue.shift() ?? null;
    };

    resize();
    let state = populateStarField(
      profile,
      sessionRandom,
      logicalWidth,
      logicalHeight,
      takeSeedAndTag,
    );
    stateRef.current = state;
    let previousTime = performance.now();
    let elapsedSeconds = 0;
    let animationFrame = 0;

    // one tick: advance by real elapsed time, then paint sky beneath stars.
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
        takeSeedAndTag,
        hoveredStarIdRef.current,
      );
      stateRef.current = state;
      renderSky(context, sky, logicalWidth, logicalHeight);
      renderStarField(context, state, profile, elapsedSeconds);
      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);
    window.addEventListener("resize", scheduleResize);

    return (): void => {
      window.cancelAnimationFrame(animationFrame);
      window.cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", scheduleResize);
      stateRef.current = null;
      hoveredStarIdRef.current = null;
    };
  }, [seed]);

  return { canvasRef, handleClick, handleMouseMove, handleMouseLeave };
};

export { useSkyCanvas };
