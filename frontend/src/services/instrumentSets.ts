import * as Tone from "tone";
import type { Biome, InstrumentSetName, InstrumentSpec, Role } from "../types/music";

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
    register: 6, hold: 4, gain: 0.35, send: 0.6,
    filter: { type: "lowpass", frequency: 5000, rolloff: -12 },
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
      [Tone.AutoPanner, { frequency: 0.15, depth: 0.4, wet: 1.0 }]],
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
    options: { oscillator: { type: "sine" }, modulation: { type: "sine" }, harmonicity: 3.5, modulationIndex: 2.2,
      envelope: { attack: 0.005 } },
    register: 5, hold: 2, gain: 0.4, send: 0.5,
    filter: { type: "lowpass", frequency: 5000, rolloff: -12 },
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
    register: 0, hold: 6, gain: 0.25, send: 0.7,
    filter: { type: "bandpass", frequency: 2200, rolloff: -24, Q: 6 },
    effects: [[Tone.PingPongDelay, { delayTime: "8n", feedback: 0.45, wet: 0.4 }],
      [Tone.AutoPanner, { frequency: 0.15, depth: 0.7, wet: 1.0 }]],
  },
};

const majorasmask: Record<Role, InstrumentSpec> = {
  drone: {
    synth: Tone.MonoSynth,
    options: { oscillator: { type: "sawtooth" }, portamento: 0.08,
      filterEnvelope: { attack: 0.8, decay: 1.5, sustain: 0.6, release: 2.0, octaves: 1.5 },
      envelope: { attack: 0.6 } },
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
    options: { oscillator: { type: "sine" }, modulation: { type: "sine" }, harmonicity: 3.5, modulationIndex: 2.2,
      envelope: { attack: 0.001 },
      modulationEnvelope: { attack: 0.001, decay: 0.3, sustain: 0.0, release: 0.3 } },
    register: 6, hold: 2, gain: 0.4, send: 0.5,
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
      filterEnvelope: { attack: 0.001, decay: 0.25, sustain: 0.0, release: 0.5, octaves: 3.0 },
      envelope: { attack: 0.003 } },
    register: 4, hold: 2, gain: 0.45, send: 0.35,
    filter: { type: "lowpass", frequency: 900, rolloff: -12 },
    effects: [[Tone.StereoWidener, { width: 0.5, wet: 0.4 }],
      [Tone.FeedbackDelay, { delayTime: "8n.", feedback: 0.28, wet: 0.22 }]],
  },
};

const deusexLeadFilterEnvelope = { attack: 0.04, decay: 0.2, sustain: 0.5, release: 0.2, octaves: 1.2 };
const deusexLeadEnvelope = { attack: 0.02 };

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
    options: { oscillator: { type: "sine" }, modulation: { type: "sawtooth" }, harmonicity: 3.5, modulationIndex: 8,
      envelope: { attack: 0.003 } },
    register: 4, hold: 2, gain: 0.4, send: 0.35,
    filter: { type: "lowpass", frequency: 900, rolloff: -24 },
    effects: [[Tone.FeedbackDelay, { delayTime: "8n.", feedback: 0.35, wet: 0.3 }]],
  },
  lead: {
    synth: Tone.DuoSynth,
    options: { harmonicity: 1.0, portamento: 0.06,
      voice0: { oscillator: { type: "pulse", width: 0.35 }, filterEnvelope: deusexLeadFilterEnvelope, envelope: deusexLeadEnvelope },
      voice1: { oscillator: { type: "triangle" }, filterEnvelope: deusexLeadFilterEnvelope, envelope: deusexLeadEnvelope } },
    register: 5, hold: 3, gain: 0.35, send: 0.4,
    filter: { type: "bandpass", frequency: 1800, rolloff: -12 },
    effects: [[Tone.PingPongDelay, { delayTime: "8n", feedback: 0.4, wet: 0.35 }]],
  },
  counter: {
    synth: Tone.NoiseSynth,
    options: { noise: { type: "pink" }, envelope: { attack: 4.0 } },
    register: 0, hold: 8, gain: 0.25, send: 0.75,
    filter: { type: "bandpass", frequency: 3200, rolloff: -12 },
    effects: [[Tone.StereoWidener, { width: 0.9, wet: 1.0 }],
      [Tone.Chorus, { frequency: 0.2, delayTime: 4.0, depth: 0.8, wet: 0.5 }]],
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
    options: { oscillator: { type: "sine" }, modulation: { type: "triangle" }, harmonicity: 3.5, modulationIndex: 8.0,
      envelope: { attack: 0.002 } },
    register: 4, hold: 2, gain: 0.45, send: 0.35,
    filter: { type: "lowpass", frequency: 3200, rolloff: -12 },
    effects: [[Tone.Chorus, { frequency: 1.5, delayTime: 3.5, depth: 0.3, wet: 0.2 }],
      [Tone.FeedbackDelay, { delayTime: "8n.", feedback: 0.22, wet: 0.25 }]],
  },
  lead: {
    synth: Tone.MonoSynth,
    options: { oscillator: { type: "sawtooth" }, portamento: 0.035,
      filterEnvelope: { attack: 0.002, decay: 0.15, sustain: 0.1, release: 0.2, octaves: 2.2 },
      envelope: { attack: 0.003 } },
    register: 4, hold: 2, gain: 0.45, send: 0.35,
    filter: { type: "lowpass", frequency: 1800, rolloff: -24 },
    effects: [[Tone.Chorus, { frequency: 1.5, delayTime: 3.5, depth: 0.3, wet: 0.25 }],
      [Tone.FeedbackDelay, { delayTime: "8n.", feedback: 0.28, wet: 0.22 }]],
  },
  counter: {
    synth: Tone.Synth, polyphony: 4,
    options: { oscillator: { type: "fatsawtooth", count: 3, spread: 25 },
      envelope: { attack: 1.8 } },
    register: 2, hold: 6, gain: 0.45, send: 0.65,
    effects: [[Tone.AutoFilter, { frequency: 0.15, baseFrequency: 500, octaves: 2, wet: 0.7 }]],
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
    options: { oscillator: { type: "sine" }, modulation: { type: "sine" }, harmonicity: 3.5, modulationIndex: 12,
      envelope: { attack: 0.002 } },
    register: 5, hold: 2, gain: 0.4, send: 0.45,
    filter: { type: "lowpass", frequency: 8000, rolloff: -12 },
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
    register: 0, hold: 8, gain: 0.25, send: 0.7,
    filter: { type: "bandpass", frequency: 2200, rolloff: -12 },
    effects: [[Tone.AutoPanner, { frequency: 0.15, depth: 0.8, wet: 1.0 }]],
  },
};

/** the six instrument sets keyed by name. */
const INSTRUMENT_SETS: Record<InstrumentSetName, Record<Role, InstrumentSpec>> = {
  morrowind, kingsfield, majorasmask, deusex, aom, zoombinis,
};

/** biome and set pairs the seed may not pick; empty by default. */
const EXCLUDED_PAIRINGS: readonly (readonly [Biome, InstrumentSetName])[] = [];

export { INSTRUMENT_SETS, EXCLUDED_PAIRINGS };
