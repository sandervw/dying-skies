import type { Seed } from "./randomService";
import { SEED_BYTE_LENGTH, seedsEqual } from "./randomService";

////////////////////////////////////////////////////////////
// SEED SPACE
////////////////////////////////////////////////////////////

// old 32-bit root (12345) padded in; Sander may swap this.
const ROOT_SEED: Seed = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 48, 57, 0, 0, 0,
];

////////////////////////////////////////////////////////////
// SEED CODEC
////////////////////////////////////////////////////////////

// pack a seed's bytes into a binary string.
const seedToBinary = (seed: Seed): string => {
  let binary = "";
  for (const byte of seed) {
    binary += String.fromCharCode(byte);
  }
  return binary;
};

// read a binary string of bytes back into a seed.
const binaryToSeed = (binary: string): Seed => {
  const bytes: number[] = [];
  for (let index = 0; index < binary.length; index += 1) {
    bytes.push(binary.charCodeAt(index));
  }
  return bytes;
};

/** encode a seed as a shareable base64url token (per PLAN URL structure). */
const encodeSeed = (seed: Seed): string =>
  btoa(seedToBinary(seed))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

/** decode a base64url token back into a seed, or null when malformed. */
const decodeSeed = (token: string): Seed | null => {
  const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
  try {
    const binary = atob(base64);
    if (binary.length !== SEED_BYTE_LENGTH) {
      return null;
    }
    return binaryToSeed(binary);
  } catch {
    return null;
  }
};

////////////////////////////////////////////////////////////
// PATH CODEC
////////////////////////////////////////////////////////////

// matches "/sky/<token>" with an optional trailing slash.
const SKY_PATH_PATTERN = /^\/sky\/([A-Za-z0-9\-_]+)\/?$/;

/** build the URL path for a seed; root lives at "/". */
const seedToPath = (seed: Seed): string =>
  seedsEqual(seed, ROOT_SEED) ? "/" : `/sky/${encodeSeed(seed)}`;

/** read the seed a URL path points at, else root. */
const seedFromPath = (pathname: string): Seed => {
  const match = SKY_PATH_PATTERN.exec(pathname);
  if (match === null) {
    return ROOT_SEED;
  }
  return decodeSeed(match[1]) ?? ROOT_SEED;
};

/** external URL for the deployed analytics site. */
const ANALYTICS_URL = "https://gufime.com/analytics/";

// matches "/gallery" with an optional trailing slash.
const GALLERY_PATH_PATTERN = /^\/gallery\/?$/;

/** the URL path for the saved-skies gallery view. */
const GALLERY_PATH = "/gallery";

/** true when a URL path points at the gallery view. */
const isGalleryPath = (pathname: string): boolean =>
  GALLERY_PATH_PATTERN.test(pathname);

export {
  ROOT_SEED,
  ANALYTICS_URL,
  GALLERY_PATH,
  encodeSeed,
  decodeSeed,
  seedToPath,
  seedFromPath,
  isGalleryPath,
};
