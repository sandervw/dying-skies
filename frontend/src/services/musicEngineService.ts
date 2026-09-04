/** turns a seed into audio: scoring, instrument baking, and live scheduling. */

import * as Tone from "tone";
import { createSeededRandom, hashDomain } from "./randomService";
import type { RandomNumberGenerator } from "./randomService";
import { BIOMES, EXCLUDED_PAIRINGS, INSTRUMENT_SETS, MODES } from "./musicSoundService";
import type { Biome, InstrumentSetName, InstrumentSpec, Mode, Role, Score } from "../types/music";

const MODE_NAMES = Object.keys(MODES) as Mode[];
const BIOME_NAMES = Object.keys(BIOMES) as Biome[];
const SET_NAMES = Object.keys(INSTRUMENT_SETS) as InstrumentSetName[];

const pick = <Item>(random: RandomNumberGenerator, items: readonly Item[]): Item =>
  items[Math.floor(random() * items.length)];

/** generate a score from one music-domain seed: three picks plus optional roles. */
const generateScore = (seed: number): Score => {
  const random = createSeededRandom(seed);
  const mode = pick(random, MODE_NAMES);
  const rootPitchClass = Math.floor(random() * 12);
  let biome = pick(random, BIOME_NAMES);
  let instrumentSet = pick(random, SET_NAMES);
  while (EXCLUDED_PAIRINGS.some(([excludedBiome, excludedSet]) => excludedBiome === biome && excludedSet === instrumentSet)) {
    biome = pick(random, BIOME_NAMES);
    instrumentSet = pick(random, SET_NAMES);
  }
  const config = BIOMES[biome];
  const roles = [...config.required, ...config.optional.filter(() => random() < 0.5)];
  return { seed, mode, rootPitchClass, biome, instrumentSet, roles };
};

/** independent 32-bit seed for one numbered chunk of a generated stream. */
const deriveChunkSeed = (seed: number, chunkIndex: number): number => {
  let hash = (seed ^ hashDomain(`chunk-${chunkIndex}`)) >>> 0;
  hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b) >>> 0;
  hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b) >>> 0;
  return (hash ^ (hash >>> 16)) >>> 0;
};

/** convert a MIDI note number into a frequency in Hz. */
const midiToFrequency = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12);

const BEATS_PER_BAR = 4;
/** wander off the beat; identical start times stack into one transient. */
const JITTER_SECONDS = 0.025;
const CHUNK_TARGET_SECONDS = 30;
const FIRST_CHUNK_TARGET_SECONDS = 10;

/** one scheduled note inside a chunk. */
interface ChunkEvent {
  readonly timeSeconds: number;
  readonly frequency: number;
}

/** bars per chunk; chunk zero is short so sound starts sooner. */
const chunkBars = (score: Score, chunkIndex: number): number => {
  const target = chunkIndex === 0 ? FIRST_CHUNK_TARGET_SECONDS : CHUNK_TARGET_SECONDS;
  return Math.max(2, Math.round((target * BIOMES[score.biome].tempo) / (BEATS_PER_BAR * 60)));
};

/** seconds of music in one chunk, before the last notes ring out. */
const chunkSeconds = (score: Score, chunkIndex: number): number =>
  (chunkBars(score, chunkIndex) * BEATS_PER_BAR * 60) / BIOMES[score.biome].tempo;

/** scatter one role's notes across a chunk; reseeded per chunk and role. */
const buildChunkEvents = (
  role: Role,
  score: Score,
  chunkIndex: number,
  bars: number,
  visitSalt: number,
): ChunkEvent[] => {
  const roleIndex = score.roles.indexOf(role);
  const random = createSeededRandom(deriveChunkSeed(score.seed ^ visitSalt ^ roleIndex, chunkIndex));
  const config = BIOMES[score.biome];
  const spec = INSTRUMENT_SETS[score.instrumentSet][role];
  const offsets = MODES[score.mode];
  const secondsPerBeat = 60 / config.tempo;
  const count = Math.max(1, Math.round(config.density[role] * bars));
  const events: ChunkEvent[] = [];
  for (let index = 0; index < count; index += 1) {
    const beat = Math.floor(random() * bars * BEATS_PER_BAR);
    const jitter = (random() - 0.5) * 2 * JITTER_SECONDS;
    const degree = offsets[Math.floor(random() * offsets.length)];
    const midi = (spec.register + config.registerShift + 1) * 12 + score.rootPitchClass + degree;
    events.push({ timeSeconds: Math.max(0, beat * secondsPerBeat + jitter), frequency: midiToFrequency(midi) });
  }
  events.sort((first, second) => first.timeSeconds - second.timeSeconds);
  return events;
};

const TARGET_PEAK = 0.7;
const CHANNEL_COUNT = 2;

/** one wet one-shot per role, in role order, plus the level they mix at. */
interface BakedScore {
  readonly voices: readonly { readonly buffer: Tone.ToneAudioBuffer; readonly frequency: number }[];
  readonly gain: number;
}

// one voice, optional filter, then effects; returns the synth and chain end.
const buildInstrument = (spec: InstrumentSpec): [Tone.ToneAudioNode, Tone.ToneAudioNode] => {
  const synth =
    spec.polyphony === undefined
      ? new spec.synth(spec.options)
      : new Tone.PolySynth({ maxPolyphony: spec.polyphony, voice: spec.synth as never, options: spec.options as never });
  const nodes: Tone.ToneAudioNode[] = spec.filter === undefined ? [] : [new Tone.Filter(spec.filter)];
  for (const [Effect, effectOptions] of spec.effects) {
    const effect = new Effect(effectOptions);
    effect.start?.();
    nodes.push(effect);
  }
  const output = nodes.reduce<Tone.ToneAudioNode>((previous, node) => {
    previous.connect(node);
    return node;
  }, synth);
  return [synth, output];
};

/** bake one wet note per role offline, at its middle degree. */
const bakeScore = async (score: Score): Promise<BakedScore> => {
  const biome = BIOMES[score.biome];
  const offsets = MODES[score.mode];
  const sampleRate = Tone.getContext().sampleRate;
  const impulse = await Tone.Offline((): void => {
    new Tone.NoiseSynth({ envelope: { attack: 0.01, decay: biome.reverbDecay, sustain: 0 } }).toDestination().triggerAttack(0);
  }, biome.reverbDecay, CHANNEL_COUNT, sampleRate);
  const voices: { buffer: Tone.ToneAudioBuffer; frequency: number }[] = [];
  let peakSum = 0;
  for (const role of score.roles) {
    const spec = INSTRUMENT_SETS[score.instrumentSet][role];
    const holdSeconds = (spec.hold * 60) / biome.tempo;
    const duration = holdSeconds + biome.reverbDecay;
    const midi = (spec.register + biome.registerShift + 1) * 12 + score.rootPitchClass + offsets[Math.floor(offsets.length / 2)];
    const frequency = midiToFrequency(midi);
    const buffer = await Tone.Offline((): void => {
      const [synth, output] = buildInstrument(spec);
      const reverb = new Tone.Convolver({ url: impulse }).connect(new Tone.Gain(biome.reverbWet).toDestination());
      output.connect(new Tone.Gain(spec.gain).toDestination());
      output.connect(new Tone.Gain(spec.send).connect(reverb));
      if (synth instanceof Tone.NoiseSynth) {
        synth.triggerAttackRelease(holdSeconds, 0);
      } else {
        (synth as Tone.PolySynth).triggerAttackRelease(frequency, holdSeconds, 0);
      }
    }, duration, CHANNEL_COUNT, sampleRate);
    let peak = 0;
    for (const sample of buffer.getChannelData(0)) {
      peak = Math.max(peak, Math.abs(sample));
    }
    // notes of a role overlap; uncorrelated peaks sum as their root.
    peakSum += peak * Math.sqrt(Math.max(1, (biome.density[role] * duration * biome.tempo) / 240));
    voices.push({ buffer, frequency });
  }
  // his gain.json, computed here: every role at once must not clip the master.
  return { voices, gain: Math.min(1, TARGET_PEAK / (peakSum || 1)) };
};

/** start one chunk of notes on the live graph; returns its music length. */
const scheduleChunk = (
  score: Score,
  chunkIndex: number,
  visitSalt: number,
  baked: BakedScore,
  destination: Tone.ToneAudioNode,
  startTime: number,
): number => {
  const bars = chunkBars(score, chunkIndex);
  score.roles.forEach((role, index): void => {
    const voice = baked.voices[index];
    for (const event of buildChunkEvents(role, score, chunkIndex, bars, visitSalt)) {
      // an online one-shot disposes itself once it stops sounding.
      new Tone.ToneBufferSource({ url: voice.buffer, playbackRate: event.frequency / voice.frequency })
        .connect(destination)
        .start(startTime + event.timeSeconds);
    }
  });
  return chunkSeconds(score, chunkIndex);
};

export { bakeScore, generateScore, scheduleChunk };
export type { BakedScore };
