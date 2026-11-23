import { encodeSeed, decodeSeed } from "./routeService";
import type { Seed } from "./randomService";

const base = import.meta.env.VITE_API_BASE_URL;

/** one backend-issued star: its seed and HMAC save tag. */
interface IssuedStar {
  readonly seed: Seed;
  readonly tag: string;
}

/** a refused star call, carrying the backend's error code. */
class StarApiError extends Error {
  readonly code: string;
  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

const tagsByToken = new Map<string, string>();

/** remember an issued star's tag so its sky can later be saved. */
const rememberTag = (seed: Seed, tag: string): void => {
  tagsByToken.set(encodeSeed(seed), tag);
};

/** look up a seed's remembered save tag, or null when unknown. */
const tagForSeed = (seed: Seed): string | null =>
  tagsByToken.get(encodeSeed(seed)) ?? null;

const postBody = (path: string, body: unknown): Promise<Response> =>
  fetch(`${base}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const failFrom = async (response: Response): Promise<StarApiError> => {
  const data = await response.json().catch((): Record<string, never> => ({}));
  return new StarApiError(data.code ?? "request_failed");
};

/** request a batch of backend-issued seed/tag pairs; empty on failure. */
const fetchStarBatch = async (count: number): Promise<readonly IssuedStar[]> => {
  const response = await postBody("/stars/batch", { count });
  if (!response.ok) {
    return [];
  }
  const data = await response.json().catch(() => null);
  return ((data?.stars ?? []) as { seed: string; tag: string }[])
    .map((star): IssuedStar | null => {
      const seed = decodeSeed(star.seed);
      return seed === null ? null : { seed, tag: star.tag };
    })
    .filter((star): star is IssuedStar => star !== null);
};

/** save a star by its seed and tag; rejects with StarApiError. */
const saveStar = async (seed: Seed, tag: string): Promise<void> => {
  const response = await postBody("/stars/save", { seed: encodeSeed(seed), tag });
  if (!response.ok) {
    throw await failFrom(response);
  }
};

/** destroy a saved sky and forget its tag; rejects with StarApiError. */
const destroyStar = async (seed: Seed): Promise<void> => {
  const response = await postBody("/stars/destroy", { seed: encodeSeed(seed) });
  if (!response.ok) {
    throw await failFrom(response);
  }
  tagsByToken.delete(encodeSeed(seed));
};

/** fetch the caller's saved sky tokens, newest first; rejects with StarApiError. */
const fetchMyStars = async (): Promise<readonly string[]> => {
  const response = await fetch(`${base}/stars/mine`, { credentials: "include" });
  if (!response.ok) {
    throw await failFrom(response);
  }
  const data = await response.json().catch(() => null);
  return ((data?.stars ?? []) as { seed: string }[]).map((star) => star.seed);
};

export {
  StarApiError,
  fetchStarBatch,
  saveStar,
  destroyStar,
  fetchMyStars,
  rememberTag,
  tagForSeed,
};
export type { IssuedStar };
