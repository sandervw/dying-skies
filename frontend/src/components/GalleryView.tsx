import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyStars, saveStar } from "../services/starApiService";
import { decodeSeed } from "../services/routeService";
import { generateSky, renderConstellation } from "../services/skyService";
import { buildStar, drawStar, generateSkyProfile } from "../services/starService";
import type { AuthUser } from "../types/auth";
import type { Seed } from "../services/randomService";

const GALLERY_QUERY_KEY = ["stars", "mine"] as const;

/** save the open sky's star; refreshes the gallery on success. */
const useSaveStar = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ seed, tag }: { seed: Seed; tag: string }) => saveStar(seed, tag),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY }),
  });
  return { save: mutation.mutate };
};

// one clickable tile: a saved sky's constellation and its wagging star.
const GallerySkyBox = ({
  seed,
  onSelect,
}: {
  seed: Seed;
  onSelect: (seed: Seed) => void;
}): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect((): (() => void) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d") ?? null;
    if (canvas === null || context === null) {
      return (): void => {};
    }
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio;
    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const { constellation } = generateSky(seed);
    const profile = generateSkyProfile(seed);
    const star = buildStar(seed, null, 0, profile, 0, 0);
    let frame = 0;
    const startedAt = performance.now();

    // one frame: constellation, then the star with its tail wagging.
    const draw = (now: number): void => {
      context.clearRect(0, 0, rect.width, rect.height);
      renderConstellation(context, constellation, rect.width, rect.height);
      context.save();
      context.translate(rect.width / 2, rect.height / 2);
      context.rotate(profile.fallAngle);
      drawStar(context, star, profile, (now - startedAt) / 1000);
      context.restore();
      frame = window.requestAnimationFrame(draw);
    };
    frame = window.requestAnimationFrame(draw);
    return (): void => window.cancelAnimationFrame(frame);
  }, [seed]);

  return (
    <button className="gallery-box" onClick={() => onSelect(seed)} aria-label="Open sky">
      <canvas ref={canvasRef} />
    </button>
  );
};

interface GalleryViewProps {
  readonly user: AuthUser | null;
  readonly navigateToSeed: (seed: Seed) => void;
}

/** the saved-skies gallery: a scrollable grid, gated on login. */
const GalleryView = ({ user, navigateToSeed }: GalleryViewProps): ReactElement => {
  const { data, isLoading } = useQuery({
    queryKey: GALLERY_QUERY_KEY,
    queryFn: fetchMyStars,
    enabled: user !== null,
  });
  const skies = (data ?? [])
    .map((token) => ({ token, seed: decodeSeed(token) }))
    .filter((sky): sky is { token: string; seed: Seed } => sky.seed !== null);

  if (user === null) {
    return <p className="tagline text-center">Sign in to view your saved skies.</p>;
  }
  if (isLoading) {
    return <p className="tagline text-center">Loading your saved skies...</p>;
  }
  if (skies.length === 0) {
    return <p className="tagline text-center">No saved skies yet.</p>;
  }
  return (
    <div className="gallery">
      <div className="gallery-grid">
        {skies.map(
          (sky): ReactElement => (
            <GallerySkyBox key={sky.token} seed={sky.seed} onSelect={navigateToSeed} />
          ),
        )}
      </div>
    </div>
  );
};

export { GalleryView, useSaveStar };
