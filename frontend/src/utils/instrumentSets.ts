/**
 * This file is permitted to go beyond the project's 300 line limit
 * THE INSTRUMENTS MUST NEVER BE ADJUSTED WITHOUT EXPLICIT INSTRUCTIONS;
 *   Treat instruments as raw sound sources - fixes must go in musicService.ts
 */

import * as Tone from "tone";
import type { InstrumentSetName, InstrumentSpec, Role } from "../types/music";

// Big Mine, plus East Village for chimes and choir.
const kingsfield: Partial<Record<Role, InstrumentSpec>> = {
  // deep ambient sub-drone
  bass: {
    type: "sub",
    synth: Tone.MonoSynth,
    options: {
      oscillator: { type: "triangle" },
      filterEnvelope: { attack: 0.8, decay: 1.0, sustain: 1.0, release: 2.0, octaves: 0.5 },
      envelope: { attack: 0.8, decay: 1.0, sustain: 1.0, release: 2.0 },
      portamento: 0.3,
    },
    register: 1, hold: 8, gain: 0.9,
    filter: { type: "lowpass", frequency: 220, rolloff: -24 },
    effects: [[Tone.Distortion, { distortion: 0.05, wet: 0.15 }]],
  },
  // warm ethereal dream pad
  harmony: {
    type: "pad",
    synth: Tone.Synth, polyphony: 6,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 20 },
      envelope: { attack: 1.8, decay: 2.0, sustain: 0.85, release: 3.0 },
    },
    register: 3, hold: 6, gain: 0.5,
    filter: { type: "lowpass", frequency: 1200, rolloff: -24 },
    effects: [
      [Tone.Chorus, { frequency: 0.8, delayTime: 4.0, depth: 0.7, wet: 0.5 }],
      [Tone.StereoWidener, { width: 0.7, wet: 0.6 }],
    ],
  },
  // crystalline glass chimes
  accent: {
    type: "bell",
    synth: Tone.FMSynth, polyphony: 3,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "sine" }, harmonicity: 3.5, modulationIndex: 2.2,
      envelope: { attack: 0.005, decay: 2.2, sustain: 0.0, release: 2.5 },
    },
    register: 5, hold: 2, gain: 0.4,
    filter: { type: "lowpass", frequency: 5000, rolloff: -12 },
    effects: [[Tone.PingPongDelay, { delayTime: "8n.", feedback: 0.45, wet: 0.35 }]],
  },
  // plucked bell-like synth lead
  lead: {
    type: "bell",
    synth: Tone.FMSynth, polyphony: 4,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "sine" }, harmonicity: 3.5, modulationIndex: 8.0,
      envelope: { attack: 0.005, decay: 0.6, sustain: 0.1, release: 0.8 },
    },
    register: 4, hold: 3, gain: 0.4,
    filter: { type: "lowpass", frequency: 3500, rolloff: -12 },
    effects: [
      [Tone.Chorus, { frequency: 1.5, delayTime: 3.5, depth: 0.4, wet: 0.35 }],
      [Tone.FeedbackDelay, { delayTime: "8n.", feedback: 0.45, wet: 0.35 }],
    ],
  },
  // ethereal vocal choir swells
  counter: {
    type: "choir",
    synth: Tone.Synth, polyphony: 4,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 22 },
      envelope: { attack: 1.4, decay: 1.5, sustain: 0.75, release: 2.5 },
    },
    register: 4, hold: 6, gain: 0.32,
    filter: { type: "bandpass", frequency: 900, rolloff: -12, Q: 1.6 },
    effects: [
      [Tone.Chorus, { frequency: 0.8, delayTime: 4.0, depth: 0.7, wet: 0.5 }],
      [Tone.StereoWidener, { width: 0.85, wet: 0.8 }],
    ],
  },
};

// Title Theme, plus Majora's Theme for bass and horns.
const majorasmask: Partial<Record<Role, InstrumentSpec>> = {
  // deep sub foundation
  bass: {
    type: "sub",
    synth: Tone.MonoSynth,
    options: {
      oscillator: { type: "triangle" },
      filterEnvelope: { attack: 0.8, decay: 1.0, sustain: 1.0, release: 2.0, octaves: 0.8 },
      envelope: { attack: 0.8, decay: 1.0, sustain: 1.0, release: 2.0 },
      portamento: 0.3,
    },
    register: 1, hold: 8, gain: 0.85,
    filter: { type: "lowpass", frequency: 180, rolloff: -24 },
    effects: [],
  },
  // french horn ensemble
  harmony: {
    type: "pad",
    synth: Tone.Synth, polyphony: 6,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 18 },
      envelope: { attack: 0.35, decay: 1.2, sustain: 0.75, release: 1.5 },
    },
    register: 2, hold: 6, gain: 0.5,
    filter: { type: "lowpass", frequency: 450, rolloff: -24 },
    effects: [[Tone.Chorus, { frequency: 1.2, delayTime: 3.5, depth: 0.6, wet: 0.35 }]],
  },
  // celesta and bell plucks
  accent: {
    type: "bell",
    synth: Tone.FMSynth, polyphony: 4,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "sine" }, harmonicity: 3.5, modulationIndex: 2.2,
      envelope: { attack: 0.005, decay: 1.4, sustain: 0.02, release: 1.5 },
      modulationEnvelope: { attack: 0.001, decay: 0.3, sustain: 0.0, release: 0.3 },
    },
    register: 6, hold: 2, gain: 0.4,
    effects: [[Tone.PingPongDelay, { delayTime: "4n", feedback: 0.35, wet: 0.25 }]],
  },
  // airy woodwind melody
  lead: {
    type: "winds",
    synth: Tone.Synth, polyphony: 4,
    options: {
      oscillator: { type: "sine" },
      envelope: { attack: 0.15, decay: 0.3, sustain: 0.8, release: 0.6 },
    },
    register: 4, hold: 3, gain: 0.4,
    filter: { type: "lowpass", frequency: 3200, rolloff: -12 },
    effects: [[Tone.FeedbackDelay, { delayTime: "4n", feedback: 0.3, wet: 0.25 }]],
  },
  // symphonic string section swells
  counter: {
    type: "strings",
    synth: Tone.Synth, polyphony: 6,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 18 },
      envelope: { attack: 1.5, decay: 1.2, sustain: 0.75, release: 2.4 },
    },
    register: 3, hold: 8, gain: 0.4,
    filter: { type: "lowpass", frequency: 1600, rolloff: -24 },
    effects: [
      [Tone.Chorus, { frequency: 1.5, delayTime: 3.5, depth: 0.6, wet: 0.35 }],
      [Tone.StereoWidener, { width: 0.6, wet: 0.5 }],
    ],
  },
};

// Hong Kong Streets 5, plus Liberty Island 1 for the bass.
const deusex: Partial<Record<Role, InstrumentSpec>> = {
  // high shimmering airy drone bed
  bass: {
    type: "noise",
    synth: Tone.NoiseSynth,
    options: {
      noise: { type: "pink" },
      envelope: { attack: 4.0, decay: 2.5, sustain: 0.6, release: 5.0 },
    },
    hold: 8, gain: 0.3,
    filter: { type: "bandpass", frequency: 3200, rolloff: -12 },
    effects: [
      [Tone.StereoWidener, { width: 0.9, wet: 1.0 }],
      [Tone.Chorus, { frequency: 0.2, delayTime: 4.0, depth: 0.8, wet: 0.5 }],
    ],
  },
  // ambient string swell pad
  harmony: {
    type: "strings",
    synth: Tone.Synth, polyphony: 6,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 20 },
      envelope: { attack: 1.2, decay: 2.0, sustain: 0.7, release: 2.5 },
    },
    register: 3, hold: 6, gain: 0.5,
    filter: { type: "lowpass", frequency: 650, rolloff: -12 },
    effects: [[Tone.Chorus, { frequency: 0.8, delayTime: 4.0, depth: 0.6, wet: 0.45 }]],
  },
  // glassy shimmer tails
  accent: {
    type: "sparkle",
    synth: Tone.FMSynth, polyphony: 4,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "triangle" }, harmonicity: 3.5, modulationIndex: 2.0,
      envelope: { attack: 0.005, decay: 1.8, sustain: 0.0, release: 2.5 },
    },
    register: 6, hold: 2, gain: 0.35,
    filter: { type: "lowpass", frequency: 5000, rolloff: -12 },
    effects: [[Tone.PingPongDelay, { delayTime: "8n.", feedback: 0.45, wet: 0.4 }]],
  },
  // plucked harp/kora ostinato
  lead: {
    type: "pluck",
    synth: Tone.FMSynth, polyphony: 4,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "triangle" }, harmonicity: 2.0, modulationIndex: 3.5,
      envelope: { attack: 0.005, decay: 0.45, sustain: 0.05, release: 0.6 },
    },
    register: 5, hold: 2, gain: 0.4,
    filter: { type: "lowpass", frequency: 1800, rolloff: -24 },
    effects: [
      [Tone.Chorus, { frequency: 1.5, delayTime: 3.5, depth: 0.4, wet: 0.3 }],
      [Tone.FeedbackDelay, { delayTime: "8n.", feedback: 0.35, wet: 0.25 }],
    ],
  },
  // metallic bowed friction textures
  counter: {
    type: "strings",
    synth: Tone.DuoSynth,
    options: {
      harmonicity: 1.5,
      portamento: 1.8,
      voice0: {
        oscillator: { type: "fatsawtooth", count: 3, spread: 30 },
        filterEnvelope: { attack: 1.8, decay: 1.0, sustain: 0.0, release: 1.2, octaves: 5.0 },
        envelope: { attack: 1.8, decay: 1.2, sustain: 0.0, release: 1.5 },
      },
      voice1: {
        oscillator: { type: "sine" },
        filterEnvelope: { attack: 1.8, decay: 1.0, sustain: 0.0, release: 1.2, octaves: 3.0 },
        envelope: { attack: 1.8, decay: 1.2, sustain: 0.0, release: 1.5 },
      },
    },
    register: 4, hold: 6, gain: 0.3,
    filter: { type: "bandpass", frequency: 2400, rolloff: -12, Q: 3.0 },
    effects: [
      [Tone.Chebyshev, { order: 2, wet: 0.2 }],
      [Tone.FeedbackDelay, { delayTime: "4n", feedback: 0.4, wet: 0.35 }],
    ],
  },
};

const zoombinis: Partial<Record<Role, InstrumentSpec>> = {
  bass: {
    synth: Tone.MonoSynth,
    options: {
      oscillator: { type: "triangle" },
      filterEnvelope: { attack: 0.8, decay: 1.0, sustain: 1.0, release: 2.0, octaves: 0.5 },
      envelope: { attack: 0.8, decay: 1.0, sustain: 1.0, release: 2.0 },
      portamento: 0.3,
    },
    type: "sub",
    register: 1, hold: 8, gain: 0.85,
    filter: { type: "lowpass", frequency: 180, rolloff: -24 },
    effects: [[Tone.Distortion, { distortion: 0.1, wet: 0.15 }]],
  },
  harmony: {
    type: "pad",
    synth: Tone.MonoSynth, polyphony: 6,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 15 },
      envelope: { attack: 0.8, decay: 1.5, sustain: 0.75, release: 2.2 },
      filter: { type: "lowpass", rolloff: -24 },
      filterEnvelope: { attack: 0.8, decay: 1.2, sustain: 0.6, release: 2.0, baseFrequency: 1100, octaves: 1.2 },
    },
    register: 3, hold: 6, gain: 0.5,
    effects: [
      [Tone.Vibrato, { frequency: 0.5, depth: 0.01 }],
      [Tone.Chorus, { frequency: 0.8, delayTime: 4.0, depth: 0.7, wet: 0.4 }],
    ],
  },
  accent: {
    type: "sparkle",
    synth: Tone.FMSynth, polyphony: 4,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "sine" }, harmonicity: 3.5, modulationIndex: 12,
      envelope: { attack: 0.005, decay: 1.2, sustain: 0.0, release: 1.0 },
    },
    register: 5, hold: 2, gain: 0.4,
    filter: { type: "lowpass", frequency: 8000, rolloff: -12 },
    effects: [[Tone.FeedbackDelay, { delayTime: "8n.", feedback: 0.35, wet: 0.3 }]],
  },
  lead: {
    type: "keys",
    synth: Tone.MonoSynth, polyphony: 4,
    options: {
      oscillator: { type: "sine" },
      filterEnvelope: { attack: 0.15, decay: 0.3, sustain: 0.7, release: 0.6, baseFrequency: 1000, octaves: 1.0 },
      envelope: { attack: 0.15, decay: 0.3, sustain: 0.75, release: 0.6 },
    },
    register: 4, hold: 3, gain: 0.4,
    filter: { type: "lowpass", frequency: 2200, rolloff: -12 },
    effects: [
      [Tone.Chorus, { frequency: 1.5, delayTime: 3.5, depth: 0.4, wet: 0.25 }],
      [Tone.PingPongDelay, { delayTime: "4n", feedback: 0.25, wet: 0.2 }],
    ],
  },
  counter: {
    type: "swell",
    synth: Tone.NoiseSynth,
    options: {
      noise: { type: "pink" },
      envelope: { attack: 2.2, decay: 3.0, sustain: 0.3, release: 3.5 },
    },
    hold: 8, gain: 0.25,
    filter: { type: "bandpass", frequency: 2200, rolloff: -12 },
    effects: [[Tone.AutoPanner, { frequency: 0.15, depth: 0.8, wet: 1.0 }]],
  },
};

// Winter And Slumber, plus Wind-Bitten for the counter.
const aindulmedir: Partial<Record<Role, InstrumentSpec>> = {
  // deep root sub-bass drone
  bass: {
    type: "sub",
    synth: Tone.MonoSynth,
    options: {
      oscillator: { type: "triangle" },
      filterEnvelope: { attack: 1.0, decay: 1.0, sustain: 1.0, release: 2.0, baseFrequency: 180, octaves: 0.5 },
      envelope: { attack: 1.2, decay: 1.0, sustain: 1.0, release: 2.5 },
      portamento: 0.4,
    },
    register: 1, hold: 8, gain: 0.85,
    filter: { type: "lowpass", frequency: 220, rolloff: -24 },
    effects: [],
  },
  // warm swelling velvet pad
  harmony: {
    type: "pad",
    synth: Tone.Synth, polyphony: 6,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 18 },
      envelope: { attack: 1.8, decay: 2.0, sustain: 0.75, release: 3.0 },
    },
    register: 3, hold: 6, gain: 0.5,
    filter: { type: "lowpass", frequency: 750, rolloff: -24 },
    effects: [
      [Tone.Chorus, { frequency: 0.8, delayTime: 4.0, depth: 0.5, wet: 0.4 }],
      [Tone.Reverb, { decay: 6.0, preDelay: 0.05, wet: 0.65 }],
    ],
  },
  // ethereal glass shimmer texture
  accent: {
    type: "sparkle",
    synth: Tone.AMSynth, polyphony: 3,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "triangle" }, harmonicity: 1.0,
      envelope: { attack: 0.8, decay: 2.0, sustain: 0.5, release: 3.5 },
    },
    register: 6, hold: 2, gain: 0.35,
    filter: { type: "lowpass", frequency: 5000, rolloff: -12 },
    effects: [
      [Tone.Chorus, { frequency: 1.2, delayTime: 2.5, depth: 0.6, wet: 0.5 }],
      [Tone.FeedbackDelay, { delayTime: "4n", feedback: 0.5, wet: 0.4 }],
      [Tone.Reverb, { decay: 7.0, preDelay: 0.08, wet: 0.75 }],
    ],
  },
  // crystalline harp pluck
  lead: {
    type: "pluck",
    synth: Tone.FMSynth, polyphony: 4,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "sine" }, harmonicity: 2.0, modulationIndex: 1.8,
      envelope: { attack: 0.005, decay: 1.2, sustain: 0.1, release: 1.8 },
    },
    register: 5, hold: 3, gain: 0.4,
    filter: { type: "lowpass", frequency: 3200, rolloff: -12 },
    effects: [
      [Tone.PingPongDelay, { delayTime: "8n.", feedback: 0.45, wet: 0.35 }],
      [Tone.Chorus, { frequency: 1.5, delayTime: 3.5, depth: 0.4, wet: 0.25 }],
      [Tone.Reverb, { decay: 4.5, preDelay: 0.02, wet: 0.55 }],
    ],
  },
  // slow warm harmonic swell
  counter: {
    type: "swell",
    synth: Tone.Synth, polyphony: 6,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 18 },
      envelope: { attack: 3.0, decay: 2.0, sustain: 0.85, release: 4.5 },
    },
    register: 2, hold: 6, gain: 0.4,
    filter: { type: "lowpass", frequency: 650, rolloff: -24 },
    effects: [
      [Tone.Chorus, { frequency: 0.5, delayTime: 3.5, depth: 0.6, wet: 0.35 }],
      [Tone.Reverb, { decay: 8.0, preDelay: 0.04, wet: 0.6 }],
    ],
  },
};

// Above The Euromechopolis, plus Sneaking Suspicions for accent and counter.
const ogresound: Partial<Record<Role, InstrumentSpec>> = {
  // rumbling subterranean sub-drone
  bass: {
    type: "sub",
    synth: Tone.MonoSynth,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 15 },
      filterEnvelope: { attack: 2.5, decay: 2.0, sustain: 0.7, release: 3.0, baseFrequency: 90, octaves: 1.2 },
      envelope: { attack: 3.0, decay: 2.0, sustain: 1.0, release: 4.0 },
      portamento: 0.5,
    },
    register: 1, hold: 8, gain: 0.85,
    filter: { type: "lowpass", frequency: 180, rolloff: -12 },
    effects: [
      [Tone.Distortion, { distortion: 0.15, wet: 0.2 }],
      [Tone.Reverb, { decay: 5.0, preDelay: 0.05, wet: 0.25 }],
    ],
  },
  // warm broad cinematic swell pad
  harmony: {
    type: "pad",
    synth: Tone.Synth, polyphony: 6,
    options: {
      oscillator: { type: "sawtooth" },
      envelope: { attack: 2.2, decay: 2.0, sustain: 0.8, release: 3.5 },
    },
    register: 3, hold: 6, gain: 0.5,
    filter: { type: "lowpass", frequency: 500, rolloff: -12 },
    effects: [
      [Tone.Chorus, { frequency: 1.2, delayTime: 3.5, depth: 0.65, wet: 0.5 }],
      [Tone.StereoWidener, { width: 0.75, wet: 1.0 }],
      [Tone.Reverb, { decay: 6.0, preDelay: 0.04, wet: 0.55 }],
    ],
  },
  // crisp glassy fm pluck
  accent: {
    type: "pluck",
    synth: Tone.FMSynth,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "sine" }, harmonicity: 2.0, modulationIndex: 6.5,
      envelope: { attack: 0.005, decay: 0.45, sustain: 0.05, release: 0.6 },
    },
    register: 6, hold: 2, gain: 0.4,
    filter: { type: "lowpass", frequency: 2400, rolloff: -12 },
    effects: [
      [Tone.PingPongDelay, { delayTime: 0.25, feedback: 0.45, wet: 0.35 }],
      [Tone.Reverb, { decay: 3.5, preDelay: 0.02, wet: 0.4 }],
    ],
  },
  // snappy kinetic ostinato pluck
  lead: {
    type: "pluck",
    synth: Tone.MonoSynth,
    options: {
      oscillator: { type: "pulse", width: 0.3 },
      filterEnvelope: { attack: 0.002, decay: 0.15, sustain: 0.0, release: 0.15, baseFrequency: 1200, octaves: 3.0 },
      envelope: { attack: 0.005, decay: 0.22, sustain: 0.0, release: 0.18 },
    },
    register: 4, hold: 2, gain: 0.4,
    filter: { type: "lowpass", frequency: 1200, rolloff: -24 },
    effects: [
      [Tone.FeedbackDelay, { delayTime: "8n.", feedback: 0.45, wet: 0.35 }],
      [Tone.PingPongDelay, { delayTime: "16n", feedback: 0.2, wet: 0.2 }],
      [Tone.Reverb, { decay: 3.5, preDelay: 0.02, wet: 0.3 }],
    ],
  },
  // dusty grainy ominous atmospheric bed
  counter: {
    type: "swell",
    synth: Tone.Synth, polyphony: 4,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 25 },
      envelope: { attack: 2.5, decay: 1.8, sustain: 0.85, release: 3.0 },
    },
    register: 3, hold: 6, gain: 0.42,
    filter: { type: "bandpass", frequency: 650, rolloff: -12 },
    effects: [
      [Tone.Chorus, { frequency: 0.5, delayTime: 3.5, depth: 0.7, wet: 0.5 }],
      [Tone.Reverb, { decay: 6.0, preDelay: 0.04, wet: 0.65 }],
    ],
  },
};

/** the instrument sets; each fills any subset of roles. */
const INSTRUMENT_SETS: Record<InstrumentSetName, Partial<Record<Role, InstrumentSpec>>> = {
  kingsfield, majorasmask, deusex, zoombinis,
  aindulmedir, ogresound,
};

export { INSTRUMENT_SETS };
