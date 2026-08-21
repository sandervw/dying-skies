import { useEffect, useState } from "react";
import type { Seed } from "../services/randomService";
import { seedsEqual } from "../services/randomService";
import {
  ANALYTICS_PATH,
  GALLERY_PATH,
  isAnalyticsPath,
  isGalleryPath,
  seedFromPath,
  seedToPath,
} from "../services/routeService";

type View = "sky" | "analytics" | "gallery";

interface Routes {
  readonly seed: Seed;
  readonly view: View;
  readonly navigateToSeed: (starSeed: Seed) => void;
  readonly navigateToAnalytics: () => void;
  readonly navigateToGallery: () => void;
  readonly navigateBack: () => void;
}

// read the active view from a URL path.
const viewFromPath = (pathname: string): View => {
  if (isAnalyticsPath(pathname)) {
    return "analytics";
  }
  if (isGalleryPath(pathname)) {
    return "gallery";
  }
  return "sky";
};

/** drive the active sky seed and view from the URL, with back/forward support. */
const useRoutes = (): Routes => {
  const [seed, setSeed] = useState<Seed>((): Seed =>
    seedFromPath(window.location.pathname),
  );
  const [view, setView] = useState<View>((): View =>
    viewFromPath(window.location.pathname),
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

  const navigateToGallery = (): void => {
    window.history.pushState(null, "", GALLERY_PATH);
    setView("gallery");
  };

  const navigateBack = (): void => {
    window.history.back();
  };

  // history is an external system, so sync back/forward via effect.
  useEffect((): (() => void) => {
    const handlePopState = (): void => {
      const pathname = window.location.pathname;
      setView(viewFromPath(pathname));
      setSeed(seedFromPath(pathname));
    };
    window.addEventListener("popstate", handlePopState);
    return (): void => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return {
    seed,
    view,
    navigateToSeed,
    navigateToAnalytics,
    navigateToGallery,
    navigateBack,
  };
};

export { useRoutes };
export type { View };
