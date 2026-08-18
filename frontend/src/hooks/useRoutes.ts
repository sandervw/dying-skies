import { useEffect, useState } from "react";
import type { Seed } from "../services/randomService";
import { seedsEqual } from "../services/randomService";
import {
  ANALYTICS_PATH,
  isAnalyticsPath,
  seedFromPath,
  seedToPath,
} from "../services/routeService";

type View = "sky" | "analytics";

interface Routes {
  readonly seed: Seed;
  readonly view: View;
  readonly navigateToSeed: (starSeed: Seed) => void;
  readonly navigateToAnalytics: () => void;
}

/** drive the active sky seed and view from the URL, with back/forward support. */
const useRoutes = (): Routes => {
  const [seed, setSeed] = useState<Seed>((): Seed =>
    seedFromPath(window.location.pathname),
  );
  const [view, setView] = useState<View>((): View =>
    isAnalyticsPath(window.location.pathname) ? "analytics" : "sky",
  );

  const navigateToSeed = (starSeed: Seed): void => {
    setView("sky");
    if (seedsEqual(starSeed, seed)) {
      return;
    }
    window.history.pushState(null, "", seedToPath(starSeed));
    setSeed(starSeed);
  };

  const navigateToAnalytics = (): void => {
    window.history.pushState(null, "", ANALYTICS_PATH);
    setView("analytics");
  };

  // history is an external system, so sync back/forward via effect.
  useEffect((): (() => void) => {
    const handlePopState = (): void => {
      const pathname = window.location.pathname;
      if (isAnalyticsPath(pathname)) {
        setView("analytics");
        return;
      }
      setView("sky");
      setSeed(seedFromPath(pathname));
    };
    window.addEventListener("popstate", handlePopState);
    return (): void => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return { seed, view, navigateToSeed, navigateToAnalytics };
};

export { useRoutes };
