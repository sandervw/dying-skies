import { useEffect } from "react";
import * as Tone from "tone";
import { playSky } from "../services/musicService";
import { useSkySeed } from "./useSkySeed";

/** play the current sky's instrument set on a loop. */
const useSkyMusic = (muted: boolean): void => {
  const { seed } = useSkySeed();

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

  // runs after render, or when `seed` or `muted` changes
  useEffect((): (() => void) | undefined => {
    return muted ? undefined : playSky(seed);
  }, [seed, muted]);
};

export { useSkyMusic };
