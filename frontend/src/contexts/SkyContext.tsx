import { createContext, useMemo } from "react";
import type { ReactElement, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { seedFromPath, ROOT_SEED } from "../services/routeService";
import { saveStar, tagForSeed } from "../services/starApiService";
import type { Seed } from "../services/randomService";

/** the visible sky: its route-derived seed, save tag, and save action. */
const SkyContext = createContext<{
  seed: Seed;
  tag: string | null;
  save: () => void;
}>({ seed: ROOT_SEED, tag: null, save: () => {} });

/** provides the visible sky; a route change re-derives seed and tag. */
const SkyProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const queryClient = useQueryClient();
  const pathname = useLocation().pathname;
  // stable reference per path; re-renders must not restart the star loop.
  const seed = useMemo(() => seedFromPath(pathname), [pathname]);
  const tag = tagForSeed(seed);
  const mutation = useMutation({
    mutationFn: () => saveStar(seed, tag ?? ""),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["stars", "mine"] }),
  });

  // save the visible sky; a tagless sky cannot be saved.
  const save = (): void => {
    if (tag === null) {
      return;
    }
    mutation.mutate();
  };

  return (
    <SkyContext.Provider value={{ seed, tag, save }}>
      {children}
    </SkyContext.Provider>
  );
};

export { SkyContext, SkyProvider };
