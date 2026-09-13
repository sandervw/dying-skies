import type { Role, InstrumentType } from "../types/music";

/** space and arrangement for one sky: tempo, reverb, register, roles, density. */
interface Preset {
  readonly tempo: number;
  readonly reverbDecay: number;
  readonly reverbWet: number;
  readonly registerShift: number;
  // each role maps to the instrument types allowed to fill it.
  readonly instruments: Partial<Record<Role, readonly InstrumentType[]>>;
  readonly density: Partial<Record<Role, number>>;
}

/** the five presets; the seed picks one. */
const PRESETS: Record<string, Preset> = {
  cavern: {
    tempo: 48, reverbDecay: 9.0, reverbWet: 0.65, registerShift: -1,
    instruments: {
      bass: ["sub", "pluck", "noise"], harmony: ["pad", "strings", "choir"],
      counter: ["pad", "strings", "swell", "choir"],
    },
    density: { bass: 0.15, harmony: 0.40, counter: 0.30 },
  },
  chamber: {
    tempo: 72, reverbDecay: 2.5, reverbWet: 0.30, registerShift: 0,
    instruments: {
      bass: ["sub", "pluck", "noise"], harmony: ["pad", "strings", "choir"],
      accent: ["bell", "sparkle", "pluck"], lead: ["bell", "pluck", "keys", "winds"],
    },
    density: { bass: 0.25, harmony: 0.80, accent: 1.60, lead: 0.80 },
  },
  expanse: {
    tempo: 58, reverbDecay: 6.0, reverbWet: 0.50, registerShift: 0,
    instruments: {
      bass: ["sub", "pluck", "noise"], harmony: ["pad", "strings", "choir"],
      lead: ["bell", "pluck", "keys", "winds"],
    },
    density: { bass: 0.20, harmony: 0.60, lead: 0.50 },
  },
  veil: {
    tempo: 44, reverbDecay: 12.0, reverbWet: 0.75, registerShift: 1,
    instruments: {
      harmony: ["pad", "strings", "choir"], accent: ["bell", "sparkle", "pluck"],
      counter: ["pad", "strings", "swell", "choir"],
    },
    density: { harmony: 0.30, accent: 0.50, counter: 0.25 },
  },
  scatter: {
    tempo: 84, reverbDecay: 4.0, reverbWet: 0.45, registerShift: 1,
    instruments: {
      harmony: ["pad", "strings", "choir"], accent: ["bell", "sparkle", "pluck"],
      lead: ["bell", "pluck", "keys", "winds"],
    },
    density: { harmony: 1.10, accent: 2.20, lead: 1.70 },
  },
};

export { PRESETS };
export type { Preset };
