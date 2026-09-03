import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { bakeScore, generateScore, scheduleChunk } from "../services/musicEngineService";
import { deriveSeed } from "../services/randomService";
import { useSkySeed } from "./useSkySeed";

const FADE_SECONDS = 2;

/** play a sky's score live from one-shot buffers baked once per score. */
const useSkyMusic = (muted: boolean): void => {
  const { seed } = useSkySeed();
  const mutedRef = useRef(muted);
  const fadeRef = useRef<Tone.Gain | null>(null);

  useEffect((): void => {
    mutedRef.current = muted;
    fadeRef.current?.gain.rampTo(muted ? 0 : 1, FADE_SECONDS);
  }, [muted]);

  // the context stays suspended until a gesture; every click retries it.
  useEffect((): (() => void) => {
    const unlock = (): void => {
      void Tone.start();
    };
    window.addEventListener("pointerdown", unlock);
    return (): void => {
      window.removeEventListener("pointerdown", unlock);
    };
  }, []);

  useEffect((): (() => void) => {
    const score = generateScore(deriveSeed(seed, "music"));
    // fresh scatter per visit, like the old live Math.random placement.
    const visitSalt = Math.floor(Math.random() * 4294967296);
    let stopped = false;
    let timer = 0;
    let fade: Tone.Gain | null = null;
    let chain: Tone.ToneAudioNode[] = [];

    void bakeScore(score).then(
      (baked): void => {
        if (stopped) {
          return;
        }
        const limiter = new Tone.Limiter(-3).toDestination();
        // sub-audible rumble only speakers choke on; nothing plays this low.
        const highpass = new Tone.Filter({ type: "highpass", frequency: 35, rolloff: -24 }).connect(limiter);
        fade = new Tone.Gain(0).connect(highpass);
        const level = new Tone.Gain(baked.gain).connect(fade);
        chain = [limiter, highpass, fade, level];
        fadeRef.current = fade;
        fade.gain.rampTo(mutedRef.current ? 0 : 1, FADE_SECONDS);
        let startTime = 0;
        const queue = (index: number): void => {
          // a suspended context freezes the clock; wait rather than stack chunks.
          if (Tone.getContext().state !== "running") {
            timer = window.setTimeout((): void => queue(index), 500);
            return;
          }
          startTime = Math.max(startTime, Tone.now() + 0.2);
          startTime += scheduleChunk(score, index, visitSalt, baked, level, startTime);
          // queue the next chunk a second before this one runs out.
          timer = window.setTimeout((): void => queue(index + 1), (startTime - Tone.now() - 1) * 1000);
        };
        queue(0);
      },
      (): void => {
        // a failed bake leaves the sky silent; nothing to clean up.
      },
    );

    return (): void => {
      stopped = true;
      window.clearTimeout(timer);
      fadeRef.current = null;
      fade?.gain.rampTo(0, FADE_SECONDS);
      // notes already scheduled ring on until the faded chain goes away.
      const dying = chain;
      window.setTimeout((): void => {
        for (const node of dying) {
          node.dispose();
        }
      }, FADE_SECONDS * 1000);
    };
  }, [seed]);
};

export { useSkyMusic };
