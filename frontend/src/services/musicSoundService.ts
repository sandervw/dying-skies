/** every sound decision: modes, biomes, voices, baking, and the master chain. */

import * as Tone from "tone";
import type { Biome, InstrumentSetName, InstrumentSpec, Mode, Role, Score } from "../types/music";

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
    options: { oscillator: { type: "triangle" },
      filterEnvelope: { attack: 1.0, decay: 1.5, sustain: 0.8, release: 2.0, octaves: 0.5 },
      envelope: { attack: 1.2 } },
    register: 2, hold: 8, gain: 0.9, send: 0.15,
    filter: { type: "lowpass", frequency: 140, rolloff: -24 },
    effects: [],
  },
  pad: {
    synth: Tone.Synth, polyphony: 4,
    options: { oscillator: { type: "fatsawtooth", count: 3, spread: 25 },
      envelope: { attack: 2.5 } },
    register: 3, hold: 6, gain: 0.5, send: 0.55,
    filter: { type: "lowpass", frequency: 800, rolloff: -24 },
    effects: [[Tone.StereoWidener, { width: 0.8, wet: 0.5 }]],
  },
  sparkle: {
    synth: Tone.FMSynth, polyphony: 4,
    options: { oscillator: { type: "sine" }, modulation: { type: "triangle" }, harmonicity: 3.5, modulationIndex: 1.8,
      envelope: { attack: 0.01 } },
    register: 5, hold: 2, gain: 0.3, send: 0.5,
    filter: { type: "lowpass", frequency: 2200, rolloff: -12 },
    effects: [],
  },
  lead: {
    synth: Tone.Synth,
    options: { oscillator: { type: "sine" },
      envelope: { attack: 0.8 } },
    register: 5, hold: 4, gain: 0.28, send: 0.6,
    filter: { type: "lowpass", frequency: 2600, rolloff: -12 },
    effects: [],
  },
  counter: {
    synth: Tone.AMSynth, polyphony: 4,
    options: { oscillator: { type: "sine" }, modulation: { type: "sawtooth" }, harmonicity: 2.0,
      envelope: { attack: 1.2 } },
    register: 5, hold: 4, gain: 0.35, send: 0.6,
    filter: { type: "bandpass", frequency: 1800, rolloff: -12 },
    effects: [],
  },
};

const kingsfield: Record<Role, InstrumentSpec> = {
  drone: {
    synth: Tone.MonoSynth,
    options: { oscillator: { type: "triangle" },
      filterEnvelope: { attack: 0.8, decay: 1.0, sustain: 1.0, release: 2.0, octaves: 0.5 },
      envelope: { attack: 0.8 } },
    register: 2, hold: 8, gain: 0.9, send: 0.2,
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
    effects: [],
  },
  sparkle: {
    synth: Tone.FMSynth, polyphony: 3,
    options: { oscillator: { type: "sine" }, modulation: { type: "sine" }, harmonicity: 3.5, modulationIndex: 2.2,
      envelope: { attack: 0.005 } },
    register: 5, hold: 2, gain: 0.3, send: 0.5,
    filter: { type: "lowpass", frequency: 2400, rolloff: -12 },
    effects: [],
  },
  lead: {
    synth: Tone.MonoSynth,
    options: { oscillator: { type: "sawtooth" },
      filterEnvelope: { attack: 1.4, decay: 1.0, sustain: 0.5, release: 2.0, octaves: 3.0 },
      envelope: { attack: 1.2 } },
    register: 2, hold: 4, gain: 0.4, send: 0.6,
    filter: { type: "bandpass", frequency: 320, rolloff: -12 },
    effects: [],
  },
  counter: {
    synth: Tone.NoiseSynth,
    options: { noise: { type: "pink" }, envelope: { attack: 1.8 } },
    register: 2, hold: 6, gain: 0.25, send: 0.7,
    filter: { type: "bandpass", frequency: 2200, rolloff: -24, Q: 1.5 },
    effects: [],
  },
};

const majorasmask: Record<Role, InstrumentSpec> = {
  drone: {
    synth: Tone.MonoSynth,
    options: { oscillator: { type: "sawtooth" },
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
    effects: [],
  },
  sparkle: {
    synth: Tone.FMSynth, polyphony: 4,
    options: { oscillator: { type: "sine" }, modulation: { type: "sine" }, harmonicity: 3.5, modulationIndex: 2.2,
      envelope: { attack: 0.005 },
      modulationEnvelope: { attack: 0.005, decay: 0.3, sustain: 0.0, release: 0.3 } },
    register: 5, hold: 2, gain: 0.3, send: 0.5,
    filter: { type: "lowpass", frequency: 2600, rolloff: -12 },
    effects: [],
  },
  lead: {
    synth: Tone.Synth,
    options: { oscillator: { type: "sine" },
      envelope: { attack: 0.06 } },
    register: 5, hold: 3, gain: 0.32, send: 0.35,
    filter: { type: "lowpass", frequency: 2200, rolloff: -12 },
    effects: [],
  },
  counter: {
    synth: Tone.MonoSynth, polyphony: 4,
    options: { oscillator: { type: "triangle" },
      filterEnvelope: { attack: 0.005, decay: 0.25, sustain: 0.0, release: 0.5, octaves: 3.0 },
      envelope: { attack: 0.005 } },
    register: 4, hold: 2, gain: 0.35, send: 0.35,
    filter: { type: "lowpass", frequency: 900, rolloff: -12 },
    effects: [[Tone.StereoWidener, { width: 0.5, wet: 0.4 }]],
  },
};

const deusex: Record<Role, InstrumentSpec> = {
  drone: {
    synth: Tone.MonoSynth,
    options: { oscillator: { type: "fatsawtooth", count: 3, spread: 15 },
      filterEnvelope: { attack: 2.0, decay: 1.0, sustain: 0.7, release: 3.0, octaves: 0.8 },
      envelope: { attack: 2.0 } },
    register: 2, hold: 8, gain: 0.85, send: 0.35,
    filter: { type: "lowpass", frequency: 110, rolloff: -24 },
    effects: [],
  },
  pad: {
    synth: Tone.Synth, polyphony: 6,
    options: { oscillator: { type: "fatsawtooth", count: 3, spread: 25 },
      envelope: { attack: 0.35 } },
    register: 3, hold: 4, gain: 0.5, send: 0.55,
    filter: { type: "lowpass", frequency: 1400, rolloff: -12 },
    effects: [],
  },
  sparkle: {
    synth: Tone.FMSynth, polyphony: 4,
    options: { oscillator: { type: "sine" }, modulation: { type: "sawtooth" }, harmonicity: 3.5, modulationIndex: 8,
      envelope: { attack: 0.005 } },
    register: 4, hold: 2, gain: 0.32, send: 0.35,
    filter: { type: "lowpass", frequency: 900, rolloff: -24 },
    effects: [],
  },
  lead: {
    synth: Tone.DuoSynth,
    options: { harmonicity: 1.0,
      voice0: { oscillator: { type: "pulse", width: 0.35 },
        filterEnvelope: { attack: 0.04, decay: 0.2, sustain: 0.5, release: 0.2, octaves: 1.2 }, envelope: { attack: 0.02 } },
      voice1: { oscillator: { type: "triangle" },
        filterEnvelope: { attack: 0.04, decay: 0.2, sustain: 0.5, release: 0.2, octaves: 1.2 }, envelope: { attack: 0.02 } } },
    register: 5, hold: 3, gain: 0.3, send: 0.4,
    filter: { type: "bandpass", frequency: 1800, rolloff: -12 },
    effects: [],
  },
  counter: {
    synth: Tone.NoiseSynth,
    options: { noise: { type: "pink" }, envelope: { attack: 4.0 } },
    register: 2, hold: 8, gain: 0.25, send: 0.75,
    filter: { type: "bandpass", frequency: 2400, rolloff: -12 },
    effects: [[Tone.StereoWidener, { width: 0.9, wet: 1.0 }]],
  },
};

const aom: Record<Role, InstrumentSpec> = {
  drone: {
    synth: Tone.MonoSynth,
    options: { oscillator: { type: "triangle" },
      filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.3, octaves: 1.0 },
      envelope: { attack: 0.01 } },
    register: 2, hold: 8, gain: 0.9, send: 0.15,
    filter: { type: "lowpass", frequency: 180, rolloff: -24 },
    effects: [[Tone.Distortion, { distortion: 0.08, wet: 0.15 }]],
  },
  pad: {
    synth: Tone.Synth, polyphony: 4,
    options: { oscillator: { type: "fatsawtooth", count: 3, spread: 18 },
      envelope: { attack: 1.2 } },
    register: 3, hold: 6, gain: 0.5, send: 0.65,
    filter: { type: "bandpass", frequency: 950, rolloff: -12 },
    effects: [],
  },
  sparkle: {
    synth: Tone.FMSynth, polyphony: 8,
    options: { oscillator: { type: "sine" }, modulation: { type: "triangle" }, harmonicity: 3.5, modulationIndex: 8.0,
      envelope: { attack: 0.005 } },
    register: 4, hold: 2, gain: 0.32, send: 0.35,
    filter: { type: "lowpass", frequency: 2400, rolloff: -12 },
    effects: [],
  },
  lead: {
    synth: Tone.MonoSynth,
    options: { oscillator: { type: "sawtooth" },
      filterEnvelope: { attack: 0.005, decay: 0.15, sustain: 0.1, release: 0.2, octaves: 2.2 },
      envelope: { attack: 0.005 } },
    register: 4, hold: 2, gain: 0.35, send: 0.35,
    filter: { type: "lowpass", frequency: 1800, rolloff: -24 },
    effects: [],
  },
  counter: {
    synth: Tone.Synth, polyphony: 4,
    options: { oscillator: { type: "fatsawtooth", count: 3, spread: 25 },
      envelope: { attack: 1.8 } },
    register: 2, hold: 6, gain: 0.4, send: 0.65,
    filter: { type: "lowpass", frequency: 1200, rolloff: -12 },
    effects: [],
  },
};

const zoombinis: Record<Role, InstrumentSpec> = {
  drone: {
    synth: Tone.MonoSynth,
    options: { oscillator: { type: "triangle" },
      filterEnvelope: { attack: 0.02, decay: 0.4, sustain: 0.2, release: 0.6, octaves: 1.5 },
      envelope: { attack: 0.04 } },
    register: 2, hold: 8, gain: 0.85, send: 0.1,
    filter: { type: "lowpass", frequency: 180, rolloff: -24 },
    effects: [[Tone.Distortion, { distortion: 0.1, wet: 0.15 }]],
  },
  pad: {
    synth: Tone.Synth, polyphony: 6,
    options: { oscillator: { type: "fatsawtooth", count: 3, spread: 15 },
      envelope: { attack: 0.8 } },
    register: 3, hold: 6, gain: 0.5, send: 0.55,
    filter: { type: "lowpass", frequency: 1100, rolloff: -24 },
    effects: [],
  },
  sparkle: {
    synth: Tone.FMSynth, polyphony: 4,
    options: { oscillator: { type: "sine" }, modulation: { type: "sine" }, harmonicity: 3.5, modulationIndex: 12,
      envelope: { attack: 0.005 } },
    register: 5, hold: 2, gain: 0.3, send: 0.45,
    filter: { type: "lowpass", frequency: 2600, rolloff: -12 },
    effects: [],
  },
  lead: {
    synth: Tone.MonoSynth,
    options: { oscillator: { type: "sine" },
      filterEnvelope: { attack: 0.08, decay: 0.2, sustain: 0.7, release: 0.5, octaves: 1.0 },
      envelope: { attack: 0.08 } },
    register: 5, hold: 3, gain: 0.32, send: 0.5,
    filter: { type: "lowpass", frequency: 2200, rolloff: -12 },
    effects: [],
  },
  counter: {
    synth: Tone.NoiseSynth,
    options: { noise: { type: "pink" }, envelope: { attack: 2.2 } },
    register: 2, hold: 8, gain: 0.25, send: 0.7,
    filter: { type: "bandpass", frequency: 2200, rolloff: -12 },
    effects: [],
  },
};

/** the six instrument sets keyed by name. */
const INSTRUMENT_SETS: Record<InstrumentSetName, Record<Role, InstrumentSpec>> = {
  morrowind, kingsfield, majorasmask, deusex, aom, zoombinis,
};

const BEATS_PER_BAR = 4;
/** wander off the beat; identical start times stack into one transient. */
const JITTER_SECONDS = 0.025;
const TARGET_PEAK = 0.7;
const TAIL_MARGIN_SECONDS = 2;
const TAIL_FADE_SECONDS = 0.08;
const CHANNEL_COUNT = 2;
const FADE_SECONDS = 2;

/** one wet one-shot per role per scale degree, plus the level they mix at. */
interface BakedScore {
  readonly voices: readonly (readonly Tone.ToneAudioBuffer[])[];
  readonly gain: number;
}

const impulses = new Map<number, Tone.ToneAudioBuffer>();
const bakes = new Map<string, BakedScore>();

// decay reaches silence before release fires; release is inert.
const shapeVoice = (voice: Record<string, unknown>, holdSeconds: number): Record<string, unknown> => {
  const envelope = (voice.envelope ?? {}) as { attack?: number };
  return {
    ...voice,
    envelope: { ...envelope, decay: Math.max(0.01, holdSeconds - (envelope.attack ?? 0)), sustain: 0, decayCurve: "linear", release: 0.01 },
  };
};

/** shape the one voice, or both voices of a DuoSynth. */
const shapeOptions = (options: object, holdSeconds: number): object => {
  const record = options as Record<string, unknown>;
  return record.voice0 === undefined
    ? shapeVoice(record, holdSeconds)
    : {
        ...record,
        voice0: shapeVoice(record.voice0 as Record<string, unknown>, holdSeconds),
        voice1: shapeVoice(record.voice1 as Record<string, unknown>, holdSeconds),
      };
};

// one voice, optional filter, then effects; returns the synth and chain end.
const buildInstrument = (spec: InstrumentSpec, holdSeconds: number): [Tone.ToneAudioNode, Tone.ToneAudioNode] => {
  const options = shapeOptions(spec.options, holdSeconds);
  const synth =
    spec.polyphony === undefined
      ? new spec.synth(options)
      : new Tone.PolySynth({ maxPolyphony: spec.polyphony, voice: spec.synth as never, options: options as never });
  const nodes: Tone.ToneAudioNode[] = spec.filter === undefined ? [] : [new Tone.Filter(spec.filter)];
  for (const [Effect, effectOptions] of spec.effects) {
    const effect = new Effect(effectOptions);
    effect.start?.();
    nodes.push(effect);
  }
  return [synth, nodes.reduce<Tone.ToneAudioNode>((previous, node) => {
    previous.connect(node);
    return node;
  }, synth)];
};

/** bake one wet one-shot per role and scale degree; cached per score. */
const bakeScore = async (score: Score): Promise<BakedScore> => {
  const key = JSON.stringify(score);
  const cached = bakes.get(key);
  if (cached !== undefined) {
    return cached;
  }
  const biome = BIOMES[score.biome];
  const sampleRate = Tone.getContext().sampleRate;
  // cached: Tone.Reverb regenerates its impulse per render, nested inside ours.
  let impulse = impulses.get(biome.reverbDecay);
  if (impulse === undefined) {
    impulse = await Tone.Offline((): void => {
      new Tone.NoiseSynth({ envelope: { attack: 0.01, decay: biome.reverbDecay, sustain: 0 } }).toDestination().triggerAttack(0);
    }, biome.reverbDecay, CHANNEL_COUNT, sampleRate);
    impulses.set(biome.reverbDecay, impulse);
  }
  const voices: Tone.ToneAudioBuffer[][] = [];
  let peakSum = 0;
  for (const role of score.roles) {
    const spec = INSTRUMENT_SETS[score.instrumentSet][role];
    const holdSeconds = (spec.hold * 60) / biome.tempo;
    const duration = holdSeconds + biome.reverbDecay + TAIL_MARGIN_SECONDS;
    const bakedDegrees: Tone.ToneAudioBuffer[] = [];
    let peak = 0;
    for (const degree of MODES[score.mode]) {
      const midi = (spec.register + biome.registerShift + 1) * 12 + score.rootPitchClass + degree;
      const buffer = await Tone.Offline((): void => {
        const [synth, output] = buildInstrument(spec, holdSeconds);
        const reverb = new Tone.Convolver({ url: impulse }).connect(new Tone.Gain(biome.reverbWet).toDestination());
        output.connect(new Tone.Gain(spec.gain).toDestination());
        output.connect(new Tone.Gain(spec.send).connect(reverb));
        if (synth instanceof Tone.NoiseSynth) {
          synth.triggerAttackRelease(holdSeconds, 0);
        } else {
          (synth as Tone.PolySynth).triggerAttackRelease(440 * Math.pow(2, (midi - 69) / 12), holdSeconds, 0);
        }
      }, duration, CHANNEL_COUNT, sampleRate);
      // a truncated ringing tail clicks; ramp the cut edge.
      const fadeSamples = Math.max(1, Math.round(sampleRate * TAIL_FADE_SECONDS));
      for (let channel = 0; channel < CHANNEL_COUNT; channel += 1) {
        const samples = buffer.getChannelData(channel);
        for (let index = 0; index < samples.length; index += 1) {
          samples[index] *= Math.min(1, (samples.length - index) / fadeSamples);
          peak = Math.max(peak, Math.abs(samples[index]));
        }
      }
      bakedDegrees.push(buffer);
    }
    // notes of a role overlap; uncorrelated peaks sum as their root.
    peakSum += peak * Math.sqrt(Math.max(1, (biome.density[role] * duration * biome.tempo) / 240));
    voices.push(bakedDegrees);
  }
  const baked: BakedScore = { voices, gain: Math.min(1, TARGET_PEAK / (peakSum || 1)) };
  bakes.set(key, baked);
  return baked;
};

/** live master chain: score level, mute fade, rumble cut, then ceiling. */
const buildMasterChain = (gain: number): { input: Tone.Gain; fade: Tone.Gain; nodes: Tone.ToneAudioNode[] } => {
  const limiter = new Tone.Limiter(-1).toDestination();
  const highpass = new Tone.Filter({ type: "highpass", frequency: 35, rolloff: -24 }).connect(limiter);
  const fade = new Tone.Gain(0).connect(highpass);
  const input = new Tone.Gain(gain).connect(fade);
  return { input, fade, nodes: [limiter, highpass, fade, input] };
};

export { MODES, BIOMES, INSTRUMENT_SETS, BEATS_PER_BAR, JITTER_SECONDS, FADE_SECONDS, bakeScore, buildMasterChain };
export type { BakedScore };
