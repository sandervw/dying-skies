import { useEffect, useRef } from "react";
import type { MouseEvent, ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate } from "react-router-dom";
import { fetchMyStars } from "../services/starApiService";
import { useAuth } from "../hooks/useAuth";
import { decodeSeed, seedToPath } from "../services/routeService";
import { generateSky, renderConstellation } from "../services/skyService";
import {
  buildStar,
  drawStar,
  findStarAtCoordinates,
  generateSkyProfile,
} from "../services/starService";
import type { FallingStar } from "../types/star";
import type { SkyProfile } from "../types/sky";
import type { Seed } from "../services/randomService";

const GALLERY_QUERY_KEY = ["stars", "mine"] as const;

// one clickable tile: a saved sky's constellation and its wagging star.
const GallerySkyBox = ({
  seed,
  onSelect,
}: {
  seed: Seed;
  onSelect: (seed: Seed) => void;
}): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starRef = useRef<FallingStar | null>(null);
  const profileRef = useRef<SkyProfile | null>(null);
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
    starRef.current = star;
    profileRef.current = profile;
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

    // only animate while the tile is on screen; pause once scrolled away.
    const observer = new IntersectionObserver((entries): void => {
      const isVisible = entries[0]?.isIntersecting ?? false;
      if (isVisible && frame === 0) {
        frame = window.requestAnimationFrame(draw);
      } else if (!isVisible && frame !== 0) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    observer.observe(canvas);

    return (): void => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [seed]);

  // true when the pointer is over the star itself, not the backdrop.
  const isPointerOnStar = (event: MouseEvent<HTMLCanvasElement>): boolean => {
    const canvas = canvasRef.current;
    const star = starRef.current;
    const profile = profileRef.current;
    if (canvas === null || star === null || profile === null) {
      return false;
    }
    const rect = canvas.getBoundingClientRect();
    const pointX = event.clientX - rect.left - rect.width / 2;
    const pointY = event.clientY - rect.top - rect.height / 2;
    return findStarAtCoordinates([star], profile.fallAngle, pointX, pointY) !== null;
  };

  // navigate only when the click lands on the star, not the backdrop.
  const handleClick = (event: MouseEvent<HTMLCanvasElement>): void => {
    if (isPointerOnStar(event)) {
      onSelect(seed);
    }
  };

  // pointer cursor over the star, default elsewhere on the tile.
  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>): void => {
    const canvas = canvasRef.current;
    if (canvas !== null) {
      canvas.style.cursor = isPointerOnStar(event) ? "pointer" : "default";
    }
  };

  return (
    <div className="gallery-box">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        aria-label="Open sky"
      />
    </div>
  );
};

/** the saved-skies gallery: a scrollable grid, gated on login. */
const GalleryView = (): ReactElement => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: GALLERY_QUERY_KEY,
    queryFn: fetchMyStars,
    enabled: user !== null,
  });
  const skies = (data ?? [])
    .map((token) => ({ token, seed: decodeSeed(token) }))
    .filter((sky): sky is { token: string; seed: Seed } => sky.seed !== null);

  if (user === null) {
    return <Navigate to="/" replace />;
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
            <GallerySkyBox
              key={sky.token}
              seed={sky.seed}
              onSelect={(star) => navigate(seedToPath(star))}
            />
          ),
        )}
      </div>
    </div>
  );
};

export { GalleryView };
