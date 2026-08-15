// repeatable 0..1 generator; same seed, same sequence.
type RandomNumberGenerator = () => number;

// mulberry32: one seed becomes a repeatable random stream.
const createSeededRandom = (seed: number): RandomNumberGenerator => {
  let state = seed >>> 0; // shifts bits of left number rightward; >>> 0 always produces an unsigned 32-bit
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

// split one seed into independent per-domain seeds, breaking shared-draw correlation.
const deriveSeed = (seed: number, domain: string): number => {
  let hash = (seed ^ hashDomain(domain)) >>> 0;
  hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b) >>> 0;
  hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b) >>> 0;
  return (hash ^ (hash >>> 16)) >>> 0;
};

export type { RandomNumberGenerator };
export { createSeededRandom, deriveSeed };
