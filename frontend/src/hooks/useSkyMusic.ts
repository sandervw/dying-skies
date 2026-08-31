import { useEffect, useRef } from "react";
import { renderChunk } from "../services/audioRenderService";
import type { RenderedChunk } from "../services/audioRenderService";
import { generateScore } from "../services/musicService";
import { deriveSeed } from "../services/randomService";
import { useSkySeed } from "./useSkySeed";

const FADE_SECONDS = 2;
const MONITOR_INTERVAL_MS = 100;
const HANDOFF_LEAD_SECONDS = 0.2;

/** one rendered chunk wired to a playing audio element. */
interface LiveChunk {
  readonly element: HTMLAudioElement;
  readonly url: string;
}

const fadeCancelers = new WeakMap<HTMLAudioElement, () => void>();

/** ramp an element's volume toward a target, replacing any earlier ramp. */
const fadeVolume = (element: HTMLAudioElement, target: number, seconds: number, onSettled?: () => void): void => {
  fadeCancelers.get(element)?.();
  const start = element.volume;
  if (start === target) {
    onSettled?.();
    return;
  }
  const startedAt = performance.now();
  const timer = window.setInterval((): void => {
    const progress = Math.min(1, (performance.now() - startedAt) / (seconds * 1000));
    element.volume = start + (target - start) * progress;
    if (progress >= 1) {
      window.clearInterval(timer);
      fadeCancelers.delete(element);
      onSettled?.();
    }
  }, 50);
  fadeCancelers.set(element, (): void => {
    window.clearInterval(timer);
  });
};

/** play a score as endless offline-rendered wav chunks through audio elements. */
const useSkyMusic = (muted: boolean): void => {
  const { seed } = useSkySeed();
  const mutedRef = useRef(muted);
  const blockedRef = useRef<HTMLAudioElement | null>(null);
  const liveRef = useRef<LiveChunk[]>([]);

  useEffect((): void => {
    mutedRef.current = muted;
    for (const chunk of liveRef.current) {
      fadeVolume(chunk.element, muted ? 0 : 1, FADE_SECONDS);
    }
  }, [muted]);

  // a blocked play() retries on the next pointer gesture, then fades in.
  useEffect((): (() => void) => {
    const retry = (): void => {
      const element = blockedRef.current;
      if (element === null) {
        return;
      }
      void element
        .play()
        .then((): void => {
          if (blockedRef.current === element) {
            blockedRef.current = null;
          }
          if (!mutedRef.current && element.volume === 0) {
            fadeVolume(element, 1, FADE_SECONDS);
          }
        })
        .catch((): void => {
          blockedRef.current = element;
        });
    };
    window.addEventListener("pointerdown", retry);
    return (): void => {
      window.removeEventListener("pointerdown", retry);
    };
  }, []);

  useEffect((): (() => void) => {
    const score = generateScore(deriveSeed(seed, "music"));
    // fresh scatter per visit, like the old live Math.random placement.
    const visitSalt = Math.floor(Math.random() * 4294967296);
    let stopped = false;
    let nextIndex = 1;
    let activeElement: HTMLAudioElement | null = null;
    let activeMusicSeconds = 0;
    let advancing = false;
    let nextChunk: Promise<RenderedChunk> | null = null;

    const startPlaying = (rendered: RenderedChunk, isFirstChunk: boolean): void => {
      const element = new Audio();
      element.preload = "auto";
      element.src = rendered.url;
      element.volume = isFirstChunk || mutedRef.current ? 0 : 1;
      activeElement = element;
      activeMusicSeconds = rendered.musicSeconds;
      const chunk: LiveChunk = { element, url: rendered.url };
      liveRef.current = [...liveRef.current, chunk];
      element.onended = (): void => {
        liveRef.current = liveRef.current.filter((entry): boolean => entry !== chunk);
        if (activeElement === element) {
          activeElement = null;
        }
        URL.revokeObjectURL(chunk.url);
      };
      void element
        .play()
        .then((): void => {
          if (blockedRef.current === element) {
            blockedRef.current = null;
          }
          if (isFirstChunk) {
            fadeVolume(element, mutedRef.current ? 0 : 1, FADE_SECONDS);
          }
        })
        .catch((): void => {
          blockedRef.current = element;
        });
    };

    // swap in the pre-rendered next chunk when the active one's music ends.
    const handoff = (): void => {
      if (advancing) {
        return;
      }
      advancing = true;
      const upcoming = nextChunk ?? renderChunk(score, nextIndex, visitSalt);
      nextChunk = null;
      void upcoming.then(
        (rendered): void => {
          if (stopped) {
            URL.revokeObjectURL(rendered.url);
            return;
          }
          advancing = false;
          nextIndex += 1;
          nextChunk = renderChunk(score, nextIndex, visitSalt);
          startPlaying(rendered, false);
        },
        (): void => {
          advancing = false; // render failed; the monitor retries.
        },
      );
    };

    const monitor = window.setInterval((): void => {
      if (activeElement !== null && activeElement.currentTime + HANDOFF_LEAD_SECONDS >= activeMusicSeconds) {
        handoff();
      }
    }, MONITOR_INTERVAL_MS);

    void renderChunk(score, 0, visitSalt).then(
      (rendered): void => {
        if (stopped) {
          URL.revokeObjectURL(rendered.url);
          return;
        }
        nextChunk = renderChunk(score, nextIndex, visitSalt);
        startPlaying(rendered, true);
      },
      (): void => {
        // a failed first render leaves the sky silent; nothing to clean up.
      },
    );

    return (): void => {
      stopped = true;
      window.clearInterval(monitor);
      blockedRef.current = null;
      nextChunk?.then(
        (rendered): void => {
          URL.revokeObjectURL(rendered.url);
        },
        (): void => {
          // a rejected render needs no cleanup.
        },
      );
      nextChunk = null;
      for (const chunk of liveRef.current) {
        const element = chunk.element;
        element.onended = null;
        fadeVolume(element, 0, FADE_SECONDS, (): void => {
          element.pause();
          URL.revokeObjectURL(chunk.url);
        });
      }
      liveRef.current = [];
    };
  }, [seed]);
};

export { useSkyMusic };
