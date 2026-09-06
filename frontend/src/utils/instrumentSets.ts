import * as Tone from "tone";
import type { InstrumentSetName, InstrumentSpec, Role } from "../types/music";

const morrowind: Record<Role, InstrumentSpec> = {
  drone: {
    synth: Tone.MonoSynth,
    options: {
      oscillator: { type: "sawtooth" },
      filterEnvelope: { attack: 1.0, decay: 1.5, sustain: 0.8, release: 2.0, octaves: 0.5 },
      envelope: { attack: 1.2 }
    },
    register: 2, hold: 8, gain: 0.9,
    filter: { type: "lowpass", frequency: 200, Q: 4 },
    effects: [],
  },
  pad: {
    synth: Tone.Synth, polyphony: 4,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 25 },
      envelope: { attack: 2.5 }
    },
    register: 3, hold: 6, gain: 0.5,
    filter: { type: "lowpass", frequency: 800, rolloff: -24 },
    effects: [[Tone.StereoWidener, { width: 0.8, wet: 0.5 }]],
  },
  sparkle: {
    synth: Tone.FMSynth, polyphony: 4,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "triangle" }, harmonicity: 3.5, modulationIndex: 1.8,
      envelope: { attack: 0.01 }
    },
    register: 5, hold: 2, gain: 0.3,
    filter: { type: "lowpass", frequency: 2200, rolloff: -12 },
    effects: [],
  },
  lead: {
    synth: Tone.Synth,
    options: {
      oscillator: { type: "sine" },
      envelope: { attack: 0.8 }
    },
    register: 5, hold: 4, gain: 0.28,
    filter: { type: "lowpass", frequency: 2600, rolloff: -12 },
    effects: [],
  },
  counter: {
    synth: Tone.AMSynth, polyphony: 4,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "sawtooth" }, harmonicity: 2.0,
      envelope: { attack: 1.2 }
    },
    register: 5, hold: 4, gain: 0.35,
    filter: { type: "bandpass", frequency: 1800, rolloff: -12 },
    effects: [],
  },
};

const kingsfield: Record<Role, InstrumentSpec> = {
  drone: {
    synth: Tone.MonoSynth,
    options: {
      oscillator: { type: "sawtooth" },
      filterEnvelope: { attack: 0.8, decay: 1.0, sustain: 1.0, release: 2.0, octaves: 0.5 },
      envelope: { attack: 0.8 }
    },
    register: 2, hold: 8, gain: 0.9,
    filter: { type: "lowpass", frequency: 200, Q: 4 },
    effects: [[Tone.Distortion, { distortion: 0.05, wet: 0.15 }]],
  },
  pad: {
    synth: Tone.FMSynth, polyphony: 4,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 18 }, modulation: { type: "sine" },
      harmonicity: 1.5, modulationIndex: 3.0,
      envelope: { attack: 2.2 }
    },
    register: 2, hold: 6, gain: 0.5,
    filter: { type: "lowpass", frequency: 450, rolloff: -12 },
    effects: [],
  },
  sparkle: {
    synth: Tone.FMSynth, polyphony: 3,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "sine" }, harmonicity: 3.5, modulationIndex: 2.2,
      envelope: { attack: 0.005 }
    },
    register: 5, hold: 2, gain: 0.3,
    filter: { type: "lowpass", frequency: 2400, rolloff: -12 },
    effects: [],
  },
  lead: {
    synth: Tone.MonoSynth,
    options: {
      oscillator: { type: "sawtooth" },
      filterEnvelope: { attack: 1.4, decay: 1.0, sustain: 0.5, release: 2.0, octaves: 3.0 },
      envelope: { attack: 1.2 }
    },
    register: 2, hold: 4, gain: 0.4,
    filter: { type: "bandpass", frequency: 320, rolloff: -12 },
    effects: [],
  },
  counter: {
    synth: Tone.NoiseSynth,
    options: { noise: { type: "pink" }, envelope: { attack: 1.8 } },
    register: 2, hold: 6, gain: 0.25,
    filter: { type: "bandpass", frequency: 2200, rolloff: -24, Q: 1.5 },
    effects: [],
  },
};

const majorasmask: Record<Role, InstrumentSpec> = {
  drone: {
    synth: Tone.MonoSynth,
    options: {
      oscillator: { type: "sawtooth" },
      filterEnvelope: { attack: 0.8, decay: 1.5, sustain: 0.6, release: 2.0, octaves: 1.5 },
      envelope: { attack: 0.6 }
    },
    register: 2, hold: 8, gain: 0.8,
    filter: { type: "lowpass", frequency: 200, Q: 4 },
    effects: [],
  },
  pad: {
    synth: Tone.Synth, polyphony: 6,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 18 },
      envelope: { attack: 0.45 }
    },
    register: 3, hold: 6, gain: 0.5,
    filter: { type: "lowpass", frequency: 1600, rolloff: -24 },
    effects: [],
  },
  sparkle: {
    synth: Tone.FMSynth, polyphony: 4,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "sine" }, harmonicity: 3.5, modulationIndex: 2.2,
      envelope: { attack: 0.005 },
      modulationEnvelope: { attack: 0.005, decay: 0.3, sustain: 0.0, release: 0.3 }
    },
    register: 5, hold: 2, gain: 0.3,
    filter: { type: "lowpass", frequency: 2600, rolloff: -12 },
    effects: [],
  },
  lead: {
    synth: Tone.Synth,
    options: {
      oscillator: { type: "sine" },
      envelope: { attack: 0.06 }
    },
    register: 5, hold: 3, gain: 0.32,
    filter: { type: "lowpass", frequency: 2200, rolloff: -12 },
    effects: [],
  },
  counter: {
    synth: Tone.MonoSynth, polyphony: 4,
    options: {
      oscillator: { type: "triangle" },
      filterEnvelope: { attack: 0.005, decay: 0.25, sustain: 0.0, release: 0.5, octaves: 3.0 },
      envelope: { attack: 0.005 }
    },
    register: 4, hold: 2, gain: 0.35,
    filter: { type: "lowpass", frequency: 900, rolloff: -12 },
    effects: [[Tone.StereoWidener, { width: 0.5, wet: 0.4 }]],
  },
};

const deusex: Record<Role, InstrumentSpec> = {
  drone: {
    synth: Tone.MonoSynth,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 15 },
      filterEnvelope: { attack: 2.0, decay: 1.0, sustain: 0.7, release: 3.0, octaves: 0.8 },
      envelope: { attack: 2.0 }
    },
    register: 2, hold: 8, gain: 0.85,
    filter: { type: "lowpass", frequency: 200, Q: 4 },
    effects: [],
  },
  pad: {
    synth: Tone.Synth, polyphony: 6,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 25 },
      envelope: { attack: 0.35 }
    },
    register: 3, hold: 4, gain: 0.5,
    filter: { type: "lowpass", frequency: 1400, rolloff: -12 },
    effects: [],
  },
  sparkle: {
    synth: Tone.FMSynth, polyphony: 4,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "sawtooth" }, harmonicity: 3.5, modulationIndex: 8,
      envelope: { attack: 0.005 }
    },
    register: 4, hold: 2, gain: 0.32,
    filter: { type: "lowpass", frequency: 900, rolloff: -24 },
    effects: [],
  },
  lead: {
    synth: Tone.DuoSynth,
    options: {
      harmonicity: 1.0,
      voice0: {
        oscillator: { type: "pulse", width: 0.35 },
        filterEnvelope: { attack: 0.04, decay: 0.2, sustain: 0.5, release: 0.2, octaves: 1.2 }, envelope: { attack: 0.02 }
      },
      voice1: {
        oscillator: { type: "triangle" },
        filterEnvelope: { attack: 0.04, decay: 0.2, sustain: 0.5, release: 0.2, octaves: 1.2 }, envelope: { attack: 0.02 }
      }
    },
    register: 5, hold: 3, gain: 0.3,
    filter: { type: "bandpass", frequency: 1800, rolloff: -12 },
    effects: [],
  },
  counter: {
    synth: Tone.NoiseSynth,
    options: { noise: { type: "pink" }, envelope: { attack: 4.0 } },
    register: 2, hold: 8, gain: 0.25,
    filter: { type: "bandpass", frequency: 2400, rolloff: -12 },
    effects: [[Tone.StereoWidener, { width: 0.9, wet: 1.0 }]],
  },
};

const aom: Record<Role, InstrumentSpec> = {
  drone: {
    synth: Tone.MonoSynth,
    options: {
      oscillator: { type: "sawtooth" },
      filterEnvelope: { attack: 0.2, decay: 0.2, sustain: 0.6, release: 0.3, octaves: 1.0 },
      envelope: { attack: 0.3 }
    },
    register: 2, hold: 8, gain: 0.9,
    filter: { type: "lowpass", frequency: 200, Q: 4 },
    effects: [[Tone.Distortion, { distortion: 0.08, wet: 0.15 }]],
  },
  pad: {
    synth: Tone.Synth, polyphony: 4,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 18 },
      envelope: { attack: 1.2 }
    },
    register: 3, hold: 6, gain: 0.5,
    filter: { type: "bandpass", frequency: 950, rolloff: -12 },
    effects: [],
  },
  sparkle: {
    synth: Tone.FMSynth, polyphony: 8,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "triangle" }, harmonicity: 3.5, modulationIndex: 8.0,
      envelope: { attack: 0.005 }
    },
    register: 4, hold: 2, gain: 0.32,
    filter: { type: "lowpass", frequency: 2400, rolloff: -12 },
    effects: [],
  },
  lead: {
    synth: Tone.MonoSynth,
    options: {
      oscillator: { type: "sawtooth" },
      filterEnvelope: { attack: 0.005, decay: 0.15, sustain: 0.1, release: 0.2, octaves: 2.2 },
      envelope: { attack: 0.005 }
    },
    register: 4, hold: 2, gain: 0.35,
    filter: { type: "lowpass", frequency: 1800, rolloff: -24 },
    effects: [],
  },
  counter: {
    synth: Tone.Synth, polyphony: 4,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 25 },
      envelope: { attack: 1.8 }
    },
    register: 2, hold: 6, gain: 0.4,
    filter: { type: "lowpass", frequency: 1200, rolloff: -12 },
    effects: [],
  },
};

const zoombinis: Record<Role, InstrumentSpec> = {
  drone: {
    synth: Tone.MonoSynth,
    options: {
      oscillator: { type: "sawtooth" },
      filterEnvelope: { attack: 0.2, decay: 0.4, sustain: 0.2, release: 0.6, octaves: 1.5 },
      envelope: { attack: 0.3 }
    },
    register: 2, hold: 8, gain: 0.85,
    filter: { type: "lowpass", frequency: 200, Q: 4 },
    effects: [[Tone.Distortion, { distortion: 0.1, wet: 0.15 }]],
  },
  pad: {
    synth: Tone.Synth, polyphony: 6,
    options: {
      oscillator: { type: "fatsawtooth", count: 3, spread: 15 },
      envelope: { attack: 0.8 }
    },
    register: 3, hold: 6, gain: 0.5,
    filter: { type: "lowpass", frequency: 1100, rolloff: -24 },
    effects: [],
  },
  sparkle: {
    synth: Tone.FMSynth, polyphony: 4,
    options: {
      oscillator: { type: "sine" }, modulation: { type: "sine" }, harmonicity: 3.5, modulationIndex: 12,
      envelope: { attack: 0.005 }
    },
    register: 5, hold: 2, gain: 0.3,
    filter: { type: "lowpass", frequency: 2600, rolloff: -12 },
    effects: [],
  },
  lead: {
    synth: Tone.MonoSynth,
    options: {
      oscillator: { type: "sine" },
      filterEnvelope: { attack: 0.08, decay: 0.2, sustain: 0.7, release: 0.5, octaves: 1.0 },
      envelope: { attack: 0.08 }
    },
    register: 5, hold: 3, gain: 0.32,
    filter: { type: "lowpass", frequency: 2200, rolloff: -12 },
    effects: [],
  },
  counter: {
    synth: Tone.NoiseSynth,
    options: { noise: { type: "pink" }, envelope: { attack: 2.2 } },
    register: 2, hold: 8, gain: 0.25,
    filter: { type: "bandpass", frequency: 2200, rolloff: -12 },
    effects: [],
  },
};

/** the six instrument sets, each filling all five roles. */
const INSTRUMENT_SETS: Record<InstrumentSetName, Record<Role, InstrumentSpec>> = {
  morrowind, kingsfield, majorasmask, deusex, aom, zoombinis,
};

export { INSTRUMENT_SETS };
