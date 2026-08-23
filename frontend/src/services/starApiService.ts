import { encodeSeed, decodeSeed } from "./routeService";
import type { Seed } from "./randomService";

const base = import.meta.env.VITE_API_BASE_URL;

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

const postJson = (path: string, body: unknown): Promise<Response> =>
  fetch(`${base}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

/** request a batch of backend-issued seed/tag pairs; empty on failure. */
const fetchStarBatch = async (count: number): Promise<readonly IssuedStar[]> => {
  const response = await postJson("/stars/batch", { count });
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

/** save a star by its issued seed and tag; rejects on any failure. */
const saveStar = async (seed: Seed, tag: string): Promise<void> => {
  const response = await postJson("/stars/save", { seed: encodeSeed(seed), tag });
  if (!response.ok) {
    throw new Error("save_failed");
  }
};

/** destroy a saved sky by its seed; rejects on any failure. */
const destroyStar = async (seed: Seed): Promise<void> => {
  const response = await postJson("/stars/destroy", { seed: encodeSeed(seed) });
  if (!response.ok) {
    throw new Error("destroy_failed");
  }
};

/** fetch the caller's saved sky tokens, newest first; empty on failure. */
const fetchMyStars = async (): Promise<readonly string[]> => {
  const response = await fetch(`${base}/stars/mine`, { credentials: "include" });
  if (!response.ok) {
    return [];
  }
  const data = await response.json().catch(() => null);
  return ((data?.stars ?? []) as { seed: string }[]).map((star) => star.seed);
};

export {
  fetchStarBatch,
  saveStar,
  destroyStar,
  fetchMyStars,
  rememberTag,
  tagForSeed,
};
export type { IssuedStar };
