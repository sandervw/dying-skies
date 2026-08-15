////////////////////////////////////////////////////////////
// SEED SPACE
////////////////////////////////////////////////////////////

/** the fixed origin sky shown at the site root; homepage seed. */
const ROOT_SEED = 12345;

/** full range of an unsigned 32-bit seed. */
const SEED_RANGE = 0x100000000;

// bytes needed to hold one seed; base64url of 4 bytes is 6 url-safe chars.
const SEED_BYTE_LENGTH = 4;

////////////////////////////////////////////////////////////
// SEED CODEC
////////////////////////////////////////////////////////////

// pack a 32-bit seed into big-endian bytes as a binary string.
const seedToBinary = (seed: number): string => {
  const normalized = seed >>> 0;
  let binary = "";
  for (let shift = 24; shift >= 0; shift -= 8) {
    binary += String.fromCharCode((normalized >>> shift) & 0xff);
  }
  return binary;
};

// read a 4-byte big-endian binary string back into a 32-bit seed.
const binaryToSeed = (binary: string): number =>
  ((binary.charCodeAt(0) << 24) |
    (binary.charCodeAt(1) << 16) |
    (binary.charCodeAt(2) << 8) |
    binary.charCodeAt(3)) >>>
  0;

/** encode a seed as a shareable base64url token (per PLAN URL structure). */
const encodeSeed = (seed: number): string =>
  btoa(seedToBinary(seed))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

/** decode a base64url token back into a seed, or null when malformed. */
const decodeSeed = (token: string): number | null => {
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
const seedToPath = (seed: number): string =>
  seed >>> 0 === ROOT_SEED ? "/" : `/sky/${encodeSeed(seed)}`;

/** read the seed a URL path points at, else root. */
const seedFromPath = (pathname: string): number => {
  const match = SKY_PATH_PATTERN.exec(pathname);
  if (match === null) {
    return ROOT_SEED;
  }
  return decodeSeed(match[1]) ?? ROOT_SEED;
};

export { ROOT_SEED, SEED_RANGE, encodeSeed, decodeSeed, seedToPath, seedFromPath };
