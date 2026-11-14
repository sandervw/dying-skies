import { useEffect } from "react";
import type { Engine } from "webmusic-engine";
import { describeSky, phoneAudio, playSky } from "../services/musicService";
import { useSkySeed } from "./useSkySeed";

/** play the current sky's instrument set on a loop. */
const useSkyMusic = (muted: boolean): void => {
  const { seed } = useSkySeed();

  // runs after render, or when `seed` or `muted` changes
  useEffect((): (() => void) | undefined => {
    if (muted) {
      phoneAudio?.pause();
      return undefined;
    }
    let engine: Engine | undefined;
    let disposed = false;
    const unlock = (): void => {
      void engine?.unlock();
      void phoneAudio?.play(); // phones allow play only after a gesture
    };
    window.addEventListener("pointerdown", unlock);
    void playSky(seed).then((created): void => {
      if (disposed) return created.dispose();
      engine = created;
      unlock(); // resumes when an earlier gesture already allowed audio
    });

    // lock-screen title, phones only
    if (phoneAudio) {
      const sky = describeSky(seed);
      navigator.mediaSession.metadata = new MediaMetadata({ title: `${sky.set}, ${sky.mode}`, artist: "Dying Skies", album: sky.preset });
    }

    return (): void => {
      disposed = true;
      window.removeEventListener("pointerdown", unlock);
      engine?.dispose();
    };
  }, [seed, muted]);
};

export { useSkyMusic };
