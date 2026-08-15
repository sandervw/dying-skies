import { useEffect, useState } from "react";
import { SEED_RANGE, seedFromPath, seedToPath } from "../services/routeService";

interface SeedRoute {
  readonly seed: number;
  readonly navigateToSeed: (starSeed: number) => void;
  readonly navigateToRandomSeed: () => void;
}

// drive the active sky seed from the URL, with back/forward support.
const useSeedRoute = (): SeedRoute => {
  const [seed, setSeed] = useState<number>((): number =>
    seedFromPath(window.location.pathname),
  );

  const navigateToSeed = (starSeed: number): void => {
    if (starSeed >>> 0 === seed) {
      return;
    }
    window.history.pushState(null, "", seedToPath(starSeed));
    setSeed(starSeed >>> 0);
  };

  const navigateToRandomSeed = (): void => {
    navigateToSeed(Math.floor(Math.random() * SEED_RANGE));
  };

  // history is an external system, so sync back/forward via effect.
  useEffect((): (() => void) => {
    const handlePopState = (): void => {
      setSeed(seedFromPath(window.location.pathname));
    };
    window.addEventListener("popstate", handlePopState);
    return (): void => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return { seed, navigateToSeed, navigateToRandomSeed };
};

export { useSeedRoute };
