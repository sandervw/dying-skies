/** repeatable 0..1 generator; same seed, same sequence. */
type RandomNumberGenerator = () => number;

/** a full 256-bit seed: 32 bytes, each 0..255. */
type Seed = readonly number[];

/** bytes in one seed. */
const SEED_BYTE_LENGTH = 32;

/** mulberry32: one seed becomes a repeatable random stream. */
const createSeededRandom = (seed: number): RandomNumberGenerator => {
  let state = seed >>> 0; // >>> 0 forces an unsigned 32-bit value
  // advance internal state, return the next 0..1 value.
  return (): number => {
    state = (state + 0x6d2b79f5) >>> 0; // step counter by a fixed odd constant, wrap to 32-bit
    let mixed = state; // copy it; we scramble this, not the counter
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1); // xor high bits down, then multiply to spread them
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61); // fold in another scrambled copy via xor
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296; // final xor-shift, scale to 0..1 (divide by 2^32)
  };
};

// FNV-1a hash folding a domain label into a 32-bit salt.
const hashDomain = (domain: string): number => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < domain.length; index += 1) {
    hash = Math.imul(hash ^ domain.charCodeAt(index), 0x01000193);
  }
  return hash >>> 0;
};

/** FNV-1a fold of all 32 seed bytes into one 32-bit hash. */
const hashSeedBytes = (seed: Seed): number => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < seed.length; index += 1) {
    hash = Math.imul(hash ^ seed[index], 0x01000193);
  }
  return hash >>> 0;
};

/** split one seed into independent per-domain seeds, breaking shared-draw correlation. */
const deriveSeed = (seed: Seed, domain: string): number => {
  let hash = (hashSeedBytes(seed) ^ hashDomain(domain)) >>> 0;
  hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b) >>> 0;
  hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b) >>> 0;
  return (hash ^ (hash >>> 16)) >>> 0;
};

/** draw a fresh 256-bit seed from a random stream. */
const generateSeed = (random: RandomNumberGenerator): Seed => {
  const bytes: number[] = [];
  for (let index = 0; index < SEED_BYTE_LENGTH; index += 1) {
    bytes.push(Math.floor(random() * 256));
  }
  return bytes;
};

/** compare two seeds byte-for-byte. */
const seedsEqual = (firstSeed: Seed, secondSeed: Seed): boolean => {
  if (firstSeed.length !== secondSeed.length) {
    return false;
  }
  for (let index = 0; index < firstSeed.length; index += 1) {
    if (firstSeed[index] !== secondSeed[index]) {
      return false;
    }
  }
  return true;
};

export type { RandomNumberGenerator, Seed };
export { SEED_BYTE_LENGTH, createSeededRandom, deriveSeed, generateSeed, seedsEqual };
