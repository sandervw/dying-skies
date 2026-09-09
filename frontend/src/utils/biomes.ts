import type { Role } from "../types/music";

/** space and arrangement for one sky: tempo, reverb, register, roles, density. */
interface Biome {
  readonly tempo: number;
  readonly reverbDecay: number;
  readonly reverbWet: number;
  readonly registerShift: number;
  readonly instruments: readonly Role[];
  readonly density: Record<Role, number>;
}

/** the six biomes; the seed picks one. */
const BIOMES: Record<string, Biome> = {
  cavern: {
    tempo: 56, reverbDecay: 9.0, reverbWet: 0.65, registerShift: -1,
    instruments: ["drone", "pad", "sparkle", "counter"],
    density: { drone: 0.3, pad: 0.60, sparkle: 0.80, lead: 0.30, counter: 0.60 },
  },
  chamber: {
    tempo: 80, reverbDecay: 2.5, reverbWet: 0.30, registerShift: 0,
    instruments: ["drone", "pad", "sparkle", "lead"],
    density: { drone: 0.25, pad: 0.80, sparkle: 1.60, lead: 0.80, counter: 0.60 },
  },
  expanse: {
    tempo: 66, reverbDecay: 6.0, reverbWet: 0.50, registerShift: 0,
    instruments: ["drone", "pad", "sparkle", "lead", "counter"],
    density: { drone: 0.20, pad: 0.60, sparkle: 1.00, lead: 0.50, counter: 0.40 },
  },
  veil: {
    tempo: 52, reverbDecay: 12.0, reverbWet: 0.75, registerShift: 1,
    instruments: ["pad", "sparkle", "counter"],
    density: { drone: 0.2, pad: 0.60, sparkle: 0.50, lead: 0.20, counter: 0.5 },
  },
  scatter: {
    tempo: 92, reverbDecay: 4.0, reverbWet: 0.45, registerShift: 1,
    instruments: ["pad", "sparkle", "lead", "counter"],
    density: { drone: 0.25, pad: 0.80, sparkle: 2.20, lead: 1.20, counter: 0.50 },
  },
  undertow: {
    tempo: 60, reverbDecay: 7.0, reverbWet: 0.55, registerShift: -1,
    instruments: ["drone", "pad", "lead", "counter"],
    density: { drone: 0.20, pad: 0.50, sparkle: 0.60, lead: 0.35, counter: 0.40 },
  },
};

export { BIOMES };
export type { Biome };