import type { Role } from "../types/music";

/** space and arrangement for one sky: tempo, reverb, register, roles, density. */
interface Preset {
  readonly tempo: number;
  readonly reverbDecay: number;
  readonly reverbWet: number;
  readonly registerShift: number;
  readonly instruments: readonly Role[];
  readonly density: Record<Role, number>;
}

/** the six presets; the seed picks one. */
const PRESETS: Record<string, Preset> = {
  cavern: {
    tempo: 48, reverbDecay: 9.0, reverbWet: 0.65, registerShift: -1,
    instruments: ["bass", "harmony", "accent", "counter"],
    density: { bass: 0.15, harmony: 0.40, accent: 0.80, lead: 0.30, counter: 0.30 },
  },
  chamber: {
    tempo: 72, reverbDecay: 2.5, reverbWet: 0.30, registerShift: 0,
    instruments: ["bass", "harmony", "accent", "lead"],
    density: { bass: 0.25, harmony: 0.80, accent: 1.60, lead: 0.80, counter: 0.60 },
  },
  expanse: {
    tempo: 58, reverbDecay: 6.0, reverbWet: 0.50, registerShift: 0,
    instruments: ["bass", "harmony", "accent", "lead", "counter"],
    density: { bass: 0.20, harmony: 0.60, accent: 1.00, lead: 0.50, counter: 0.40 },
  },
  veil: {
    tempo: 44, reverbDecay: 12.0, reverbWet: 0.75, registerShift: 1,
    instruments: ["harmony", "accent", "counter"],
    density: { bass: 0.10, harmony: 0.30, accent: 0.50, lead: 0.20, counter: 0.25 },
  },
  scatter: {
    tempo: 84, reverbDecay: 4.0, reverbWet: 0.45, registerShift: 1,
    instruments: ["harmony", "accent", "lead", "counter"],
    density: { bass: 0.25, harmony: 0.80, accent: 2.20, lead: 1.20, counter: 0.50 },
  },
  undertow: {
    tempo: 52, reverbDecay: 7.0, reverbWet: 0.55, registerShift: -1,
    instruments: ["bass", "harmony", "lead", "counter"],
    density: { bass: 0.20, harmony: 0.50, accent: 0.60, lead: 0.35, counter: 0.40 },
  },
};

export { PRESETS };
export type { Preset };
