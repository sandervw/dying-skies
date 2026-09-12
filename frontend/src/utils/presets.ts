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

/** the eight presets; the seed picks one.
 *
 * tempo: Beats per minute. 46 is slow; 84 is fast.
 * reverbDecay: How long a sound rings out after it plays. 9.0 sounds like a cave.
 * reverbWet: How much of that echo you hear. 0.65 is distant; 0.30 is close.
 * registerShift: Moves everything up/down an octave.
 * density: Notes/Bar for each part.
 */
const PRESETS: Record<string, Preset> = {
  cavern: {
    tempo: 46, reverbDecay: 9.0, reverbWet: 0.65, registerShift: -1,
    instruments: {
      bass: ["sub", "noise"], harmony: ["pad", "strings"],
      counter: ["swell", "choir"], accent: ["sparkle", "bell"],
    },
    density: { bass: 0.15, harmony: 0.40, counter: 0.30, accent: 0.70 },
  },
  undertow: {
    tempo: 52, reverbDecay: 7.0, reverbWet: 0.55, registerShift: -1,
    instruments: {
      bass: ["sub"], harmony: ["strings", "pad"],
      counter: ["choir", "swell"], percussion: ["tom"],
    },
    density: { bass: 0.20, harmony: 0.50, counter: 0.40, percussion: 0.15 },
  },
  grain: {
    tempo: 64, reverbDecay: 5.0, reverbWet: 0.45, registerShift: 0,
    instruments: {
      bass: ["sub", "noise"], harmony: ["pad"],
      lead: ["keys", "pluck"], percussion: ["hat", "kick"],
    },
    density: { bass: 0.20, harmony: 0.55, lead: 0.50, percussion: 0.25 },
  },
  drift: {
    tempo: 58, reverbDecay: 8.0, reverbWet: 0.60, registerShift: 1,
    instruments: {
      harmony: ["strings", "choir"], counter: ["swell", "strings"],
      lead: ["winds"], accent: ["bell", "sparkle"],
    },
    density: { harmony: 0.45, counter: 0.35, lead: 0.40, accent: 0.60 },
  },
  chamber: {
    tempo: 72, reverbDecay: 2.5, reverbWet: 0.30, registerShift: 0,
    instruments: {
      bass: ["sub"], harmony: ["pad"],
      lead: ["pluck", "bell"], accent: ["sparkle"],
    },
    density: { bass: 0.25, harmony: 0.80, lead: 0.80, accent: 1.60 },
  },
  expanse: {
    tempo: 56, reverbDecay: 6.0, reverbWet: 0.50, registerShift: 0,
    instruments: {
      harmony: ["pad", "strings", "choir"], counter: ["swell", "choir", "strings"],
      lead: ["pluck", "bell", "winds"],
    },
    density: { harmony: 0.60, counter: 0.40, lead: 0.50 },
  },
  veil: {
    tempo: 50, reverbDecay: 10.0, reverbWet: 0.70, registerShift: 1,
    instruments: {
      bass: ["sub", "pluck"], harmony: ["pad"], accent: ["sparkle", "bell"],
    },
    density: { bass: 0.10, harmony: 0.35, accent: 0.50 },
  },
  scatter: {
    tempo: 84, reverbDecay: 4.0, reverbWet: 0.45, registerShift: 1,
    instruments: {
      harmony: ["pad"], lead: ["keys", "pluck"], percussion: ["hat", "kick"],
    },
    density: { harmony: 0.80, lead: 1.20, percussion: 0.25 },
  },
};

export { PRESETS };
export type { Preset };
