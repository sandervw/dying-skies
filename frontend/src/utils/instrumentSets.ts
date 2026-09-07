import * as Tone from "tone";
import type { InstrumentSetName, InstrumentSpec, Role } from "../types/music";

// Peaceful Waters, plus Silt Sunrise for the drone.
const morrowind: Record<Role, InstrumentSpec> = {
  // deep foundation sub-drone
  drone: {
    synth: Tone.MonoSynth,
    options: {
      oscillator: { type: "triangle" },
      filterEnvelope: { attack: 2.0, decay: 1.0, sustain: 1.0, release: 3.0, octaves: 0.5 },
      envelope: { attack: 1.8, decay: 0.5, sustain: 1.0, release: 3.0 },
      portamento: 0.2,
    },
    register: 1, hold: 8, gain: 0.9,
    filter: { type: "lowpass", frequency: 140, rolloff: -24 },
    effects: [],
  },
  // orchestral string section
  pad: {
    synth: Tone.Synth, polyphony: 6,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 25 },
      envelope: { attack: 1.8, decay: 1.2, sustain: 0.85, release: 2.5 },
    },
    register: 3, hold: 6, gain: 0.5,
    filter: { type: "lowpass", frequency: 600, rolloff: -24 },
    effects: [
      [Tone.Chorus, { frequency: 1.5, delayTime: 3.5, depth: 0.7, wet: 0.4 }],
      [Tone.StereoWidener, { width: 0.8, wet: 1.0 }],
    ],
  },
  // airy shimmer texture
  sparkle: {
    synth: Tone.FMSynth, polyphony: 4,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "sine" }, harmonicity: 3.01, modulationIndex: 2.0,
      envelope: { attack: 0.6, decay: 2.0, sustain: 0.6, release: 3.5 },
    },
    register: 6, hold: 2, gain: 0.35,
    filter: { type: "highpass", frequency: 2500, rolloff: -12 },
    effects: [
      [Tone.FeedbackDelay, { delayTime: 0.375, feedback: 0.45, wet: 0.35 }],
      [Tone.AutoPanner, { frequency: 0.2, depth: 0.7, wet: 1.0 }],
    ],
  },
  // plucked acoustic harp
  lead: {
    synth: Tone.FMSynth, polyphony: 4,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "triangle" }, harmonicity: 3.5, modulationIndex: 1.8,
      envelope: { attack: 0.005, decay: 0.85, sustain: 0.0, release: 1.2 },
    },
    register: 5, hold: 3, gain: 0.4,
    filter: { type: "lowpass", frequency: 4500, rolloff: -12 },
    effects: [[Tone.FeedbackDelay, { delayTime: "8n.", feedback: 0.35, wet: 0.3 }]],
  },
  // cinematic brass ensemble swell
  counter: {
    synth: Tone.Synth, polyphony: 4,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 18 },
      envelope: { attack: 2.0, decay: 1.5, sustain: 0.8, release: 2.5 },
    },
    register: 2, hold: 6, gain: 0.4,
    filter: { type: "lowpass", frequency: 900, rolloff: -24 },
    effects: [
      [Tone.Chorus, { frequency: 0.5, delayTime: 3.5, depth: 0.6, wet: 0.4 }],
      [Tone.AutoFilter, { frequency: 0.12, baseFrequency: 500, octaves: 2, wet: 0.6 }],
    ],
  },
};

// Big Mine, plus East Village for chimes and choir.
const kingsfield: Record<Role, InstrumentSpec> = {
  // deep ambient sub-drone
  drone: {
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
  pad: {
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
  sparkle: {
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

// Title Theme, plus Majora's Theme for drone and horns.
const majorasmask: Record<Role, InstrumentSpec> = {
  // deep sub foundation
  drone: {
    synth: Tone.MonoSynth,
    options: {
      oscillator: { type: "triangle" },
      filterEnvelope: { attack: 0.08, decay: 0.5, sustain: 0.85, release: 0.6, octaves: 0.8 },
      envelope: { attack: 0.08, decay: 0.5, sustain: 0.85, release: 0.6 },
      portamento: 0.05,
    },
    register: 1, hold: 8, gain: 0.85,
    filter: { type: "lowpass", frequency: 180, rolloff: -24 },
    effects: [],
  },
  // french horn ensemble
  pad: {
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
  sparkle: {
    synth: Tone.FMSynth, polyphony: 4,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "sine" }, harmonicity: 3.5, modulationIndex: 2.2,
      envelope: { attack: 0.001, decay: 1.4, sustain: 0.02, release: 1.5 },
      modulationEnvelope: { attack: 0.001, decay: 0.3, sustain: 0.0, release: 0.3 },
    },
    register: 6, hold: 2, gain: 0.4,
    effects: [[Tone.PingPongDelay, { delayTime: "4n", feedback: 0.35, wet: 0.25 }]],
  },
  // airy woodwind melody
  lead: {
    synth: Tone.Synth,
    options: {
      oscillator: { type: "sine" },
      envelope: { attack: 0.06, decay: 0.2, sustain: 0.85, release: 0.25 },
      portamento: 0.04,
    },
    register: 5, hold: 3, gain: 0.4,
    filter: { type: "lowpass", frequency: 3200, rolloff: -12 },
    effects: [[Tone.FeedbackDelay, { delayTime: "4n", feedback: 0.3, wet: 0.25 }]],
  },
  // symphonic string section swells
  counter: {
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

// Hong Kong Streets 5, plus Liberty Island 1 for the drone.
const deusex: Record<Role, InstrumentSpec> = {
  // high shimmering airy drone bed
  drone: {
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
  pad: {
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
  sparkle: {
    synth: Tone.FMSynth, polyphony: 4,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "triangle" }, harmonicity: 3.5, modulationIndex: 2.0,
      envelope: { attack: 0.005, decay: 1.8, sustain: 0.0, release: 2.5 },
    },
    register: 6, hold: 2, gain: 0.35,
    filter: { type: "highpass", frequency: 2200, rolloff: -12 },
    effects: [[Tone.PingPongDelay, { delayTime: "8n.", feedback: 0.45, wet: 0.4 }]],
  },
  // plucked harp/kora ostinato
  lead: {
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

// Suture Self, plus Chocolate Outline for the drone.
const aom: Record<Role, InstrumentSpec> = {
  // root sub drone
  drone: {
    synth: Tone.Synth, polyphony: 4,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 18 },
      envelope: { attack: 1.8, decay: 2.0, sustain: 0.85, release: 2.5 },
      portamento: 0.2,
    },
    register: 1, hold: 8, gain: 0.8,
    filter: { type: "lowpass", frequency: 420, rolloff: -24 },
    effects: [[Tone.Chorus, { frequency: 0.8, delayTime: 4.0, depth: 0.5, wet: 0.4 }]],
  },
  // fingerpicked acoustic guitar
  pad: {
    synth: Tone.FMSynth, polyphony: 4,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "triangle" }, harmonicity: 3.5, modulationIndex: 12,
      envelope: { attack: 0.005, decay: 0.8, sustain: 0.0, release: 0.6 },
    },
    register: 3, hold: 3, gain: 0.45,
    filter: { type: "lowpass", frequency: 2200, rolloff: -24 },
    effects: [[Tone.PingPongDelay, { delayTime: "8n.", feedback: 0.35, wet: 0.25 }]],
  },
  // chimes and bell accents
  sparkle: {
    synth: Tone.FMSynth, polyphony: 8,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "triangle" }, harmonicity: 3.5, modulationIndex: 12,
      envelope: { attack: 0.002, decay: 0.9, sustain: 0.0, release: 0.6 },
    },
    register: 5, hold: 2, gain: 0.4,
    filter: { type: "lowpass", frequency: 4500, rolloff: -12 },
    effects: [
      [Tone.PingPongDelay, { delayTime: "8n.", feedback: 0.35, wet: 0.25 }],
      [Tone.AutoPanner, { frequency: 0.25, depth: 0.6, wet: 1.0 }],
    ],
  },
  // breathy native american flute
  lead: {
    synth: Tone.MonoSynth,
    options: {
      oscillator: { type: "sawtooth" },
      filterEnvelope: { attack: 0.1, decay: 0.4, sustain: 0.7, release: 0.6, baseFrequency: 700, octaves: 1.5 },
      envelope: { attack: 0.08, decay: 0.3, sustain: 0.85, release: 0.6 },
      portamento: 0.06,
    },
    register: 5, hold: 4, gain: 0.4,
    filter: { type: "lowpass", frequency: 1800, rolloff: -12 },
    effects: [
      [Tone.Chorus, { frequency: 1.5, delayTime: 3.5, depth: 0.4, wet: 0.3 }],
      [Tone.FeedbackDelay, { delayTime: "4n", feedback: 0.3, wet: 0.2 }],
    ],
  },
  // wordless female vocal wash
  counter: {
    synth: Tone.Synth, polyphony: 6,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 25 },
      envelope: { attack: 1.2, decay: 1.5, sustain: 0.9, release: 2.4 },
    },
    register: 4, hold: 8, gain: 0.38,
    filter: { type: "lowpass", frequency: 900, rolloff: -24 },
    effects: [
      [Tone.Chorus, { frequency: 0.8, delayTime: 4.0, depth: 0.7, wet: 0.5 }],
      [Tone.StereoWidener, { width: 0.9, wet: 0.8 }],
    ],
  },
};

const zoombinis: Record<Role, InstrumentSpec> = {
  drone: {
    synth: Tone.MonoSynth,
    options: {
      oscillator: { type: "triangle" },
      filterEnvelope: { attack: 0.02, decay: 0.4, sustain: 0.2, release: 0.6, octaves: 1.5 },
      envelope: { attack: 0.04, decay: 0.6, sustain: 0.5, release: 0.8 },
      portamento: 0.02,
    },
    register: 1, hold: 8, gain: 0.85,
    filter: { type: "lowpass", frequency: 180, rolloff: -24 },
    effects: [[Tone.Distortion, { distortion: 0.1, wet: 0.15 }]],
  },
  pad: {
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
  sparkle: {
    synth: Tone.FMSynth, polyphony: 4,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "sine" }, harmonicity: 3.5, modulationIndex: 12,
      envelope: { attack: 0.002, decay: 1.2, sustain: 0.0, release: 1.0 },
    },
    register: 5, hold: 2, gain: 0.4,
    filter: { type: "lowpass", frequency: 8000, rolloff: -12 },
    effects: [[Tone.FeedbackDelay, { delayTime: "8n.", feedback: 0.35, wet: 0.3 }]],
  },
  lead: {
    synth: Tone.MonoSynth,
    options: {
      oscillator: { type: "sine" },
      filterEnvelope: { attack: 0.08, decay: 0.2, sustain: 0.7, release: 0.5, baseFrequency: 1000, octaves: 1.0 },
      envelope: { attack: 0.08, decay: 0.3, sustain: 0.75, release: 0.6 },
      portamento: 0.06,
    },
    register: 5, hold: 3, gain: 0.4,
    filter: { type: "lowpass", frequency: 2200, rolloff: -12 },
    effects: [
      [Tone.Chorus, { frequency: 1.5, delayTime: 3.5, depth: 0.4, wet: 0.25 }],
      [Tone.PingPongDelay, { delayTime: "4n", feedback: 0.25, wet: 0.2 }],
    ],
  },
  counter: {
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

/** the six instrument sets, each filling all five roles. */
const INSTRUMENT_SETS: Record<InstrumentSetName, Record<Role, InstrumentSpec>> = {
  morrowind, kingsfield, majorasmask, deusex, aom, zoombinis,
};

export { INSTRUMENT_SETS };
