/** music content: modes, biome character, and instrument voices. */

import * as Tone from "tone";
import type { Biome, InstrumentSetName, InstrumentSpec, Mode, Role } from "../types/music";

/** semitone offsets from the root for each consonance mode. */
const MODES: Record<Mode, readonly number[]> = {
  "major-pentatonic": [0, 2, 4, 7, 9],
  "minor-pentatonic": [0, 3, 5, 7, 10],
  "dorian-pentatonic": [0, 2, 3, 7, 9],
  "lydian-pentatonic": [0, 2, 4, 6, 11],
  "whole-tone": [0, 2, 4, 6, 8, 10],
};

/** space and arrangement constants for one biome. */
interface BiomeConfig {
  readonly tempo: number;
  readonly reverbDecay: number;
  readonly reverbWet: number;
  readonly registerShift: number;
  readonly required: readonly Role[];
  readonly optional: readonly Role[];
  readonly density: Record<Role, number>;
}

/** the six biomes; density is events per bar per role. */
const BIOMES: Record<Biome, BiomeConfig> = {
  cavern: { tempo: 48, reverbDecay: 9, reverbWet: 0.65, registerShift: -1, required: ["drone", "pad"], optional: ["sparkle", "counter"], density: { drone: 0.15, pad: 0.4, sparkle: 0.8, lead: 0.3, counter: 0.3 } },
  chamber: { tempo: 72, reverbDecay: 2.5, reverbWet: 0.3, registerShift: 0, required: ["pad", "sparkle", "lead"], optional: ["drone", "counter"], density: { drone: 0.25, pad: 0.8, sparkle: 1.6, lead: 0.8, counter: 0.6 } },
  expanse: { tempo: 58, reverbDecay: 6, reverbWet: 0.5, registerShift: 0, required: ["drone", "pad", "lead"], optional: ["sparkle", "counter"], density: { drone: 0.2, pad: 0.6, sparkle: 1, lead: 0.5, counter: 0.4 } },
  veil: { tempo: 44, reverbDecay: 12, reverbWet: 0.75, registerShift: 1, required: ["pad", "counter"], optional: ["sparkle"], density: { drone: 0.1, pad: 0.3, sparkle: 0.5, lead: 0.2, counter: 0.25 } },
  scatter: { tempo: 84, reverbDecay: 4, reverbWet: 0.45, registerShift: 1, required: ["sparkle", "lead"], optional: ["pad", "counter"], density: { drone: 0.25, pad: 0.8, sparkle: 2.2, lead: 1.2, counter: 0.5 } },
  undertow: { tempo: 52, reverbDecay: 7, reverbWet: 0.55, registerShift: -1, required: ["drone", "pad", "counter"], optional: ["lead"], density: { drone: 0.2, pad: 0.5, sparkle: 0.6, lead: 0.35, counter: 0.4 } },
};

const morrowind: Record<Role, InstrumentSpec> = {
  drone: {
    synth: Tone.MonoSynth,
    options: { oscillator: { type: "triangle" }, portamento: 0.2,
      filterEnvelope: { attack: 1.0, decay: 1.5, sustain: 0.8, release: 2.0, octaves: 0.5 },
      envelope: { attack: 1.2 } },
    register: 1, hold: 8, gain: 0.9, send: 0.15,
    filter: { type: "lowpass", frequency: 140, rolloff: -24 },
    effects: [],
  },
  pad: {
    synth: Tone.Synth, polyphony: 4,
    options: { oscillator: { type: "fatsawtooth", count: 3, spread: 25 },
      envelope: { attack: 2.5 } },
    register: 3, hold: 6, gain: 0.5, send: 0.55,
    filter: { type: "lowpass", frequency: 800, rolloff: -24 },
    effects: [[Tone.Chorus, { frequency: 0.8, delayTime: 4.0, depth: 0.6, wet: 0.45 }],
      [Tone.StereoWidener, { width: 0.8, wet: 0.5 }]],
  },
  sparkle: {
    synth: Tone.FMSynth, polyphony: 4,
    options: { oscillator: { type: "sine" }, modulation: { type: "triangle" }, harmonicity: 3.5, modulationIndex: 1.8,
      envelope: { attack: 0.01 } },
    register: 5, hold: 2, gain: 0.45, send: 0.5,
    filter: { type: "lowpass", frequency: 3200, rolloff: -12 },
    effects: [[Tone.PingPongDelay, { delayTime: "8n.", feedback: 0.5, wet: 0.4 }]],
  },
  lead: {
    synth: Tone.Synth,
    options: { oscillator: { type: "sine" }, portamento: 0.1,
      envelope: { attack: 0.8 } },
    register: 5, hold: 4, gain: 0.35, send: 0.6,
    filter: { type: "lowpass", frequency: 3800, rolloff: -12 },
    effects: [[Tone.Chorus, { frequency: 1.5, delayTime: 3.5, depth: 0.4, wet: 0.3 }],
      [Tone.FeedbackDelay, { delayTime: "4n.", feedback: 0.45, wet: 0.35 }]],
  },
  counter: {
    synth: Tone.AMSynth, polyphony: 4,
    options: { oscillator: { type: "sine" }, modulation: { type: "sawtooth" }, harmonicity: 2.0,
      envelope: { attack: 1.2 } },
    register: 5, hold: 4, gain: 0.4, send: 0.6,
    filter: { type: "bandpass", frequency: 1800, rolloff: -12 },
    effects: [[Tone.FeedbackDelay, { delayTime: "4n", feedback: 0.4, wet: 0.35 }],
      [Tone.StereoWidener, { width: 0.8, wet: 0.5 }]],
  },
};

const kingsfield: Record<Role, InstrumentSpec> = {
  drone: {
    synth: Tone.MonoSynth,
    options: { oscillator: { type: "triangle" }, portamento: 0.3,
      filterEnvelope: { attack: 0.8, decay: 1.0, sustain: 1.0, release: 2.0, octaves: 0.5 },
      envelope: { attack: 0.8 } },
    register: 1, hold: 8, gain: 0.9, send: 0.2,
    filter: { type: "lowpass", frequency: 220, rolloff: -24 },
    effects: [[Tone.Distortion, { distortion: 0.05, wet: 0.15 }]],
  },
  pad: {
    synth: Tone.FMSynth, polyphony: 4,
    options: { oscillator: { type: "fatsawtooth", count: 3, spread: 18 }, modulation: { type: "sine" },
      harmonicity: 1.5, modulationIndex: 3.0,
      envelope: { attack: 2.2 } },
    register: 2, hold: 6, gain: 0.5, send: 0.55,
    filter: { type: "lowpass", frequency: 450, rolloff: -12 },
    effects: [[Tone.Chorus, { frequency: 0.5, delayTime: 3.5, depth: 0.7, wet: 0.4 }],
      [Tone.FeedbackDelay, { delayTime: "4n.", feedback: 0.35, wet: 0.25 }]],
  },
  sparkle: {
    synth: Tone.FMSynth, polyphony: 3,
    options: { oscillator: { type: "sine" }, modulation: { type: "sine" }, harmonicity: 3.5, modulationIndex: 1.8,
      envelope: { attack: 0.01 } },
    register: 5, hold: 2, gain: 0.4, send: 0.5,
    filter: { type: "lowpass", frequency: 3600, rolloff: -12 },
    effects: [[Tone.PingPongDelay, { delayTime: "8n.", feedback: 0.45, wet: 0.35 }]],
  },
  lead: {
    synth: Tone.MonoSynth,
    options: { oscillator: { type: "sawtooth" }, portamento: 0.25,
      filterEnvelope: { attack: 1.4, decay: 1.0, sustain: 0.5, release: 2.0, octaves: 3.0 },
      envelope: { attack: 1.2 } },
    register: 2, hold: 4, gain: 0.45, send: 0.6,
    filter: { type: "bandpass", frequency: 320, rolloff: -12 },
    effects: [[Tone.FeedbackDelay, { delayTime: "4n", feedback: 0.3, wet: 0.25 }]],
  },
  counter: {
    synth: Tone.NoiseSynth,
    options: { noise: { type: "pink" }, envelope: { attack: 1.8 } },
    register: 0, hold: 6, gain: 0.22, send: 0.6,
    filter: { type: "bandpass", frequency: 1600, rolloff: -12, Q: 3 },
    effects: [[Tone.PingPongDelay, { delayTime: "8n", feedback: 0.45, wet: 0.4 }], [Tone.StereoWidener, { width: 0.7, wet: 0.6 }]],
  },
};

const majorasmask: Record<Role, InstrumentSpec> = {
  drone: {
    synth: Tone.MonoSynth,
    options: { oscillator: { type: "sawtooth" }, portamento: 0.08,
      filterEnvelope: { attack: 0.8, decay: 1.5, sustain: 0.6, release: 2.0, octaves: 1.5 }, envelope: { attack: 0.6 } },
    register: 2, hold: 8, gain: 0.8, send: 0.3,
    filter: { type: "lowpass", frequency: 320, rolloff: -24 },
    effects: [],
  },
  pad: {
    synth: Tone.Synth, polyphony: 6,
    options: { oscillator: { type: "fatsawtooth", count: 3, spread: 18 },
      envelope: { attack: 0.45 } },
    register: 3, hold: 6, gain: 0.5, send: 0.45,
    filter: { type: "lowpass", frequency: 1600, rolloff: -24 },
    effects: [[Tone.Chorus, { frequency: 1.5, delayTime: 3.5, depth: 0.6, wet: 0.35 }]],
  },
  sparkle: {
    synth: Tone.FMSynth, polyphony: 4,
    options: { oscillator: { type: "sine" }, modulation: { type: "sine" }, harmonicity: 3.5, modulationIndex: 1.8,
      envelope: { attack: 0.01 },
      modulationEnvelope: { attack: 0.01, decay: 0.3, sustain: 0.0, release: 0.3 } },
    register: 5, hold: 2, gain: 0.4, send: 0.5,
    filter: { type: "lowpass", frequency: 4000, rolloff: -12 },
    effects: [[Tone.PingPongDelay, { delayTime: "4n", feedback: 0.35, wet: 0.25 }]],
  },
  lead: {
    synth: Tone.Synth,
    options: { oscillator: { type: "sine" }, portamento: 0.04,
      envelope: { attack: 0.06 } },
    register: 5, hold: 3, gain: 0.4, send: 0.35,
    filter: { type: "lowpass", frequency: 3200, rolloff: -12 },
    effects: [[Tone.FeedbackDelay, { delayTime: "4n", feedback: 0.3, wet: 0.25 }]],
  },
  counter: {
    synth: Tone.MonoSynth, polyphony: 4,
    options: { oscillator: { type: "triangle" },
      filterEnvelope: { attack: 0.01, decay: 0.25, sustain: 0.0, release: 0.5, octaves: 2.2 }, envelope: { attack: 0.01 } },
    register: 4, hold: 2, gain: 0.45, send: 0.35,
    filter: { type: "lowpass", frequency: 900, rolloff: -12 },
    effects: [[Tone.StereoWidener, { width: 0.5, wet: 0.4 }], [Tone.FeedbackDelay, { delayTime: "8n.", feedback: 0.28, wet: 0.22 }]],
  },
};

const deusex: Record<Role, InstrumentSpec> = {
  drone: {
    synth: Tone.MonoSynth,
    options: { oscillator: { type: "fatsawtooth", count: 3, spread: 15 }, portamento: 0.5,
      filterEnvelope: { attack: 2.0, decay: 1.0, sustain: 0.7, release: 3.0, octaves: 0.8 },
      envelope: { attack: 2.0 } },
    register: 1, hold: 8, gain: 0.85, send: 0.35,
    filter: { type: "lowpass", frequency: 110, rolloff: -24 },
    effects: [],
  },
  pad: {
    synth: Tone.Synth, polyphony: 6,
    options: { oscillator: { type: "fatsawtooth", count: 3, spread: 25 },
      envelope: { attack: 0.35 } },
    register: 3, hold: 4, gain: 0.5, send: 0.55,
    filter: { type: "lowpass", frequency: 1400, rolloff: -12 },
    effects: [[Tone.Chorus, { frequency: 1.5, delayTime: 3.5, depth: 0.7, wet: 0.4 }]],
  },
  sparkle: {
    synth: Tone.FMSynth, polyphony: 4,
    options: { oscillator: { type: "sine" }, modulation: { type: "sawtooth" }, harmonicity: 3.5, modulationIndex: 3.5,
      envelope: { attack: 0.01 } },
    register: 4, hold: 2, gain: 0.4, send: 0.35,
    filter: { type: "lowpass", frequency: 1200, rolloff: -24 },
    effects: [[Tone.FeedbackDelay, { delayTime: "8n.", feedback: 0.35, wet: 0.3 }]],
  },
  lead: {
    synth: Tone.DuoSynth,
    options: { harmonicity: 1.0, portamento: 0.06,
      voice0: { oscillator: { type: "pulse", width: 0.35 },
        filterEnvelope: { attack: 0.04, decay: 0.2, sustain: 0.5, release: 0.2, octaves: 1.2 }, envelope: { attack: 0.02 } },
      voice1: { oscillator: { type: "triangle" },
        filterEnvelope: { attack: 0.04, decay: 0.2, sustain: 0.5, release: 0.2, octaves: 1.2 }, envelope: { attack: 0.02 } } },
    register: 5, hold: 3, gain: 0.35, send: 0.4,
    filter: { type: "bandpass", frequency: 1800, rolloff: -12 },
    effects: [[Tone.PingPongDelay, { delayTime: "8n", feedback: 0.4, wet: 0.35 }]],
  },
  counter: {
    synth: Tone.NoiseSynth,
    options: { noise: { type: "pink" }, envelope: { attack: 4.0 } },
    register: 0, hold: 8, gain: 0.22, send: 0.65,
    filter: { type: "bandpass", frequency: 2200, rolloff: -12, Q: 2 },
    effects: [[Tone.StereoWidener, { width: 0.8, wet: 0.8 }], [Tone.Chorus, { frequency: 0.2, delayTime: 4.0, depth: 0.8, wet: 0.5 }]],
  },
};

const aom: Record<Role, InstrumentSpec> = {
  drone: {
    synth: Tone.MonoSynth,
    options: { oscillator: { type: "triangle" }, portamento: 0.05,
      filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.3, octaves: 1.0 },
      envelope: { attack: 0.01 } },
    register: 1, hold: 8, gain: 0.9, send: 0.15,
    filter: { type: "lowpass", frequency: 180, rolloff: -24 },
    effects: [[Tone.Distortion, { distortion: 0.08, wet: 0.15 }]],
  },
  pad: {
    synth: Tone.Synth, polyphony: 4,
    options: { oscillator: { type: "fatsawtooth", count: 3, spread: 18 },
      envelope: { attack: 1.2 } },
    register: 3, hold: 6, gain: 0.5, send: 0.65,
    filter: { type: "bandpass", frequency: 950, rolloff: -12 },
    effects: [[Tone.Chorus, { frequency: 1.2, delayTime: 3.5, depth: 0.6, wet: 0.45 }],
      [Tone.FeedbackDelay, { delayTime: "4n.", feedback: 0.4, wet: 0.3 }]],
  },
  sparkle: {
    synth: Tone.FMSynth, polyphony: 8,
    options: { oscillator: { type: "sine" }, modulation: { type: "triangle" }, harmonicity: 3.5, modulationIndex: 3.2,
      envelope: { attack: 0.01 } },
    register: 4, hold: 2, gain: 0.45, send: 0.35,
    filter: { type: "lowpass", frequency: 2800, rolloff: -12 },
    effects: [[Tone.Chorus, { frequency: 1.2, delayTime: 3.5, depth: 0.3, wet: 0.2 }],
      [Tone.FeedbackDelay, { delayTime: "8n.", feedback: 0.22, wet: 0.25 }]],
  },
  lead: {
    synth: Tone.MonoSynth,
    options: { oscillator: { type: "sawtooth" }, portamento: 0.035,
      filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.15, release: 0.25, octaves: 1.8 },
      envelope: { attack: 0.015 } },
    register: 4, hold: 2, gain: 0.45, send: 0.35,
    filter: { type: "lowpass", frequency: 1600, rolloff: -24 },
    effects: [[Tone.Chorus, { frequency: 1.5, delayTime: 3.5, depth: 0.3, wet: 0.25 }],
      [Tone.FeedbackDelay, { delayTime: "8n.", feedback: 0.28, wet: 0.22 }]],
  },
  counter: {
    synth: Tone.Synth, polyphony: 4,
    options: { oscillator: { type: "fatsawtooth", count: 3, spread: 25 },
      envelope: { attack: 1.8 } },
    register: 2, hold: 6, gain: 0.45, send: 0.65,
    effects: [[Tone.Chorus, { frequency: 0.8, delayTime: 4.0, depth: 0.7, wet: 0.4 }]],
  },
};

const zoombinis: Record<Role, InstrumentSpec> = {
  drone: {
    synth: Tone.MonoSynth,
    options: { oscillator: { type: "triangle" }, portamento: 0.02,
      filterEnvelope: { attack: 0.02, decay: 0.4, sustain: 0.2, release: 0.6, octaves: 1.5 },
      envelope: { attack: 0.04 } },
    register: 1, hold: 8, gain: 0.85, send: 0.1,
    filter: { type: "lowpass", frequency: 180, rolloff: -24 },
    effects: [[Tone.Distortion, { distortion: 0.1, wet: 0.15 }]],
  },
  pad: {
    synth: Tone.Synth, polyphony: 6,
    options: { oscillator: { type: "fatsawtooth", count: 3, spread: 15 },
      envelope: { attack: 0.8 } },
    register: 3, hold: 6, gain: 0.5, send: 0.55,
    filter: { type: "lowpass", frequency: 1100, rolloff: -24 },
    effects: [[Tone.Chorus, { frequency: 0.8, delayTime: 4.0, depth: 0.7, wet: 0.4 }]],
  },
  sparkle: {
    synth: Tone.FMSynth, polyphony: 4,
    options: { oscillator: { type: "sine" }, modulation: { type: "sine" }, harmonicity: 3.5, modulationIndex: 3.5,
      envelope: { attack: 0.01 } },
    register: 5, hold: 2, gain: 0.4, send: 0.45,
    filter: { type: "lowpass", frequency: 4200, rolloff: -12 },
    effects: [[Tone.FeedbackDelay, { delayTime: "8n.", feedback: 0.35, wet: 0.3 }]],
  },
  lead: {
    synth: Tone.MonoSynth,
    options: { oscillator: { type: "sine" }, portamento: 0.06,
      filterEnvelope: { attack: 0.08, decay: 0.2, sustain: 0.7, release: 0.5, octaves: 1.0 },
      envelope: { attack: 0.08 } },
    register: 5, hold: 3, gain: 0.4, send: 0.5,
    filter: { type: "lowpass", frequency: 2200, rolloff: -12 },
    effects: [[Tone.Chorus, { frequency: 1.5, delayTime: 3.5, depth: 0.4, wet: 0.25 }],
      [Tone.PingPongDelay, { delayTime: "4n", feedback: 0.25, wet: 0.2 }]],
  },
  counter: {
    synth: Tone.NoiseSynth,
    options: { noise: { type: "pink" }, envelope: { attack: 2.2 } },
    register: 0, hold: 8, gain: 0.22, send: 0.65,
    filter: { type: "bandpass", frequency: 1800, rolloff: -12, Q: 2 },
    effects: [[Tone.StereoWidener, { width: 0.8, wet: 0.8 }]],
  },
};

/** the six instrument sets keyed by name. */
const INSTRUMENT_SETS: Record<InstrumentSetName, Record<Role, InstrumentSpec>> = {
  morrowind, kingsfield, majorasmask, deusex, aom, zoombinis,
};

/** biome and set pairs the seed may not pick; empty by default. */
const EXCLUDED_PAIRINGS: readonly (readonly [Biome, InstrumentSetName])[] = [];

export { MODES, BIOMES, INSTRUMENT_SETS, EXCLUDED_PAIRINGS };
