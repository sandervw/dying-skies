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

/** the six presets; the seed picks one.
 * 
 * tempo: Beats per minute. 48 is slow; 84 is fast.
 * reverbDecay: How long a sound rings out after it plays. 9.0 sounds like a cave.
 * reverbWet: How much of that echo you hear. 0.65 is distant; 0.30 is close.
 * registerShift: Moves everything up/down an octave.
 * density: Notes/Bar for each part.
 */
const PRESETS: Record<string, Preset> = {
  cavern: {
    tempo: 48, reverbDecay: 9.0, reverbWet: 0.65, registerShift: -1,
    instruments: {
      bass: ["sub", "noise"], harmony: ["pad", "strings"],
      accent: ["bell", "sparkle"], counter: ["choir", "swell"],
    },
    density: { bass: 0.15, harmony: 0.40, accent: 0.80, counter: 0.30 },
  },
  chamber: {
    tempo: 72, reverbDecay: 2.5, reverbWet: 0.30, registerShift: 0,
    instruments: {
      bass: ["sub"], harmony: ["pad", "strings"],
      accent: ["bell", "pluck"], lead: ["bell", "keys", "winds", "pluck"],
    },
    density: { bass: 0.25, harmony: 0.80, accent: 1.60, lead: 0.80 },
  },
  expanse: {
    tempo: 58, reverbDecay: 6.0, reverbWet: 0.50, registerShift: 0,
    instruments: {
      bass: ["sub", "noise"], harmony: ["pad", "strings"],
      accent: ["bell", "sparkle", "pluck"], lead: ["bell", "winds", "keys", "pluck"],
      counter: ["strings", "choir", "swell"],
    },
    density: { bass: 0.20, harmony: 0.60, accent: 1.00, lead: 0.50, counter: 0.40 },
  },
  veil: {
    tempo: 44, reverbDecay: 12.0, reverbWet: 0.75, registerShift: 1,
    instruments: {
      harmony: ["pad", "strings"], accent: ["sparkle"],
      counter: ["choir", "swell", "strings"],
    },
    density: { harmony: 0.30, accent: 0.50, counter: 0.25 },
  },
  scatter: {
    tempo: 84, reverbDecay: 4.0, reverbWet: 0.45, registerShift: 1,
    instruments: {
      harmony: ["pad", "strings"], accent: ["sparkle", "pluck", "bell"],
      lead: ["keys", "pluck", "bell"], counter: ["swell", "strings", "choir"],
    },
    density: { harmony: 0.80, accent: 2.20, lead: 1.20, counter: 0.50 },
  },
  undertow: {
    tempo: 52, reverbDecay: 7.0, reverbWet: 0.55, registerShift: -1,
    instruments: {
      bass: ["sub"], harmony: ["pad", "strings"],
      lead: ["pluck", "keys", "bell"], counter: ["swell", "strings"],
    },
    density: { bass: 0.20, harmony: 0.50, lead: 0.35, counter: 0.40 },
  },
};

export { PRESETS };
export type { Preset };
