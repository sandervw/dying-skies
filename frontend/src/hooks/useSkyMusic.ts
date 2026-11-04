import { useEffect } from "react";
import type { Engine } from "webmusic-engine";
import { playSky } from "../services/musicService";
import { useSkySeed } from "./useSkySeed";

/** play the current sky's instrument set on a loop. */
const useSkyMusic = (muted: boolean): void => {
  const { seed } = useSkySeed();

  // runs after render, or when `seed` or `muted` changes
  useEffect((): (() => void) | undefined => {
    if (muted) return undefined;
    let engine: Engine | undefined;
    let disposed = false;
    const unlock = (): void => {
      void engine?.unlock();
    };
    window.addEventListener("pointerdown", unlock);
    void playSky(seed).then((created): void => {
      if (disposed) return created.dispose();
      engine = created;
      void engine.unlock(); // resumes when an earlier gesture already allowed audio
    });
    return (): void => {
      disposed = true;
      window.removeEventListener("pointerdown", unlock);
      engine?.dispose();
    };
  }, [seed, muted]);
};

export { useSkyMusic };
