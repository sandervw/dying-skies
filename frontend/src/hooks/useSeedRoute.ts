import { useEffect, useState } from "react";
import type { Seed } from "../services/randomService";
import { createSeededRandom, generateSeed, seedsEqual } from "../services/randomService";
import { seedFromPath, seedToPath } from "../services/routeService";

interface SeedRoute {
  readonly seed: Seed;
  readonly navigateToSeed: (starSeed: Seed) => void;
  readonly navigateToRandomSeed: () => void;
}

/** drive the active sky seed from the URL, with back/forward support. */
const useSeedRoute = (): SeedRoute => {
  const [seed, setSeed] = useState<Seed>((): Seed =>
    seedFromPath(window.location.pathname),
  );

  const navigateToSeed = (starSeed: Seed): void => {
    if (seedsEqual(starSeed, seed)) {
      return;
    }
    window.history.pushState(null, "", seedToPath(starSeed));
    setSeed(starSeed);
  };

  const navigateToRandomSeed = (): void => {
    navigateToSeed(generateSeed(createSeededRandom(Date.now())));
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
