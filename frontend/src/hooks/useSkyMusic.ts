import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { generateScore, scheduleChunk } from "../services/musicEngineService";
import { FADE_SECONDS, bakeScore, buildMasterChain } from "../services/musicSoundService";
import { deriveSeed } from "../services/randomService";
import { useSkySeed } from "./useSkySeed";

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
        const master = buildMasterChain(baked.gain);
        fade = master.fade;
        chain = master.nodes;
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
          startTime += scheduleChunk(score, index, visitSalt, baked, master.input, startTime);
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
      // dispose past the ramp; Tone.now() leads the clock by lookAhead.
      const dying = chain;
      window.setTimeout((): void => {
        for (const node of dying) {
          node.dispose();
        }
      }, (FADE_SECONDS + 0.5) * 1000);
    };
  }, [seed]);
};

export { useSkyMusic };
