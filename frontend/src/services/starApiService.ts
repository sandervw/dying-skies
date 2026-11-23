import { encodeSeed, decodeSeed } from "./routeService";
import { failFrom } from "./apiError";
import type { Seed } from "./randomService";

const base = import.meta.env.VITE_API_BASE_URL;

/** the query key prefix for the signed-in user's Saved tokens. */
const SAVED_STARS_QUERY_KEY = ["stars", "mine"] as const;

/** one backend-issued star: its seed and HMAC save tag. */
interface IssuedStar {
  readonly seed: Seed;
  readonly tag: string;
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

/** save a star by its seed and tag; rejects with ApiError. */
const saveStar = async (seed: Seed, tag: string): Promise<void> => {
  const response = await postBody("/stars/save", { seed: encodeSeed(seed), tag });
  if (!response.ok) {
    throw await failFrom(response);
  }
};

/** destroy a saved sky and forget its tag; rejects with ApiError. */
const destroyStar = async (seed: Seed): Promise<void> => {
  const response = await postBody("/stars/destroy", { seed: encodeSeed(seed) });
  if (!response.ok) {
    throw await failFrom(response);
  }
  tagsByToken.delete(encodeSeed(seed));
};

/** fetch the caller's saved sky tokens, newest first; rejects with ApiError. */
const fetchMyStars = async (): Promise<readonly string[]> => {
  const response = await fetch(`${base}/stars/mine`, { credentials: "include" });
  if (!response.ok) {
    throw await failFrom(response);
  }
  return parseSavedSeeds(await response.json());
};

const hasSeed = (star: unknown): star is { seed: string } =>
  typeof (star as { seed?: unknown } | null)?.seed === "string";

// throws naming the body when it is not a list of seeds.
const parseSavedSeeds = (body: unknown): readonly string[] => {
  const stars: unknown = (body as { stars?: unknown } | null)?.stars;
  if (!Array.isArray(stars) || !stars.every(hasSeed)) {
    throw new Error(`malformed /stars/mine body: ${JSON.stringify(body)}`);
  }
  return stars.map((star) => star.seed);
};

export {
  SAVED_STARS_QUERY_KEY,
  fetchStarBatch,
  saveStar,
  destroyStar,
  fetchMyStars,
  rememberTag,
  tagForSeed,
};
export type { IssuedStar };
