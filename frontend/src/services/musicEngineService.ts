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

const BEATS_PER_BAR = 4;
/** wander off the beat; identical start times stack into one transient. */
const JITTER_SECONDS = 0.025;
const CHUNK_TARGET_SECONDS = 30;
const FIRST_CHUNK_TARGET_SECONDS = 10;

/** one scheduled note inside a chunk. */
interface ChunkEvent {
  readonly timeSeconds: number;
  readonly interval: number;
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
  const offsets = MODES[score.mode];
  const middleDegree = offsets[Math.floor(offsets.length / 2)];
  const secondsPerBeat = 60 / config.tempo;
  const count = Math.max(1, Math.round(config.density[role] * bars));
  const events: ChunkEvent[] = [];
  for (let index = 0; index < count; index += 1) {
    const beat = Math.floor(random() * bars * BEATS_PER_BAR);
    const jitter = (random() - 0.5) * 2 * JITTER_SECONDS;
    const degree = offsets[Math.floor(random() * offsets.length)];
    events.push({ timeSeconds: Math.max(0, beat * secondsPerBeat + jitter), interval: degree - middleDegree });
  }
  events.sort((first, second) => first.timeSeconds - second.timeSeconds);
  return events;
};

const TARGET_PEAK = 0.7;
const CHANNEL_COUNT = 2;

/** one wet one-shot per role, in role order, plus the level they mix at. */
interface BakedScore {
  readonly voices: readonly Tone.ToneAudioBuffer[];
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
    nodes.push(new Effect(effectOptions));
  }
  const output = nodes.reduce<Tone.ToneAudioNode>((previous, node) => {
    previous.connect(node);
    return node;
  }, synth);
  return [synth, output];
};

// serial queue for Tone.Offline renders, matching Alex's createPrerenderedBuffer.
let renderQueue = Promise.resolve();
const runOffline = <T>(fn: () => Promise<T>): Promise<T> => {
  const next = renderQueue.then(fn, fn);
  renderQueue = next.then(() => {}, () => {});
  return next;
};

/** bake one wet note per role offline, at its middle degree. */
const bakeScore = (score: Score, onProgress?: (progress: number) => void): Promise<BakedScore> =>
  runOffline(async (): Promise<BakedScore> => {
    const biome = BIOMES[score.biome];
    const offsets = MODES[score.mode];
    const sampleRate = Tone.getContext().sampleRate;
    const voices: Tone.ToneAudioBuffer[] = [];
    let peakSum = 0;
    for (let index = 0; index < score.roles.length; index += 1) {
      const role = score.roles[index];
      const spec = INSTRUMENT_SETS[score.instrumentSet][role];
      const holdSeconds = (spec.hold * 60) / biome.tempo;
      const duration = holdSeconds + biome.reverbDecay;
      const midi = (spec.register + biome.registerShift + 1) * 12 + score.rootPitchClass + offsets[Math.floor(offsets.length / 2)];
      const pitch = Tone.Frequency(midi, "midi").toFrequency();
      const buffer = await Tone.Offline(async (): Promise<void> => {
        const [synth, output] = buildInstrument(spec);
        const reverb = await new Tone.Reverb(biome.reverbDecay).generate();
        reverb.wet.value = biome.reverbWet;
        output.connect(new Tone.Gain(spec.gain).toDestination());
        output.connect(new Tone.Gain(spec.send).connect(reverb.toDestination()));
        if (synth instanceof Tone.NoiseSynth) {
          synth.triggerAttackRelease(holdSeconds, 0);
        } else {
          (synth as Tone.PolySynth).triggerAttackRelease(pitch, holdSeconds, 0);
        }
      }, duration, CHANNEL_COUNT, sampleRate);
      let peak = 0;
      for (const sample of buffer.getChannelData(0)) {
        peak = Math.max(peak, Math.abs(sample));
      }
      // notes of a role overlap; uncorrelated peaks sum as their root.
      peakSum += peak * Math.sqrt(Math.max(1, (biome.density[role] * duration * biome.tempo) / 240));
      voices.push(buffer);
      onProgress?.((index + 1) / score.roles.length);
    }
    // his gain.json, computed here: every role at once must not clip the master.
    return { voices, gain: Math.min(1, TARGET_PEAK / (peakSum || 1)) };
  });

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
    const buffer = baked.voices[index];
    for (const event of buildChunkEvents(role, score, chunkIndex, bars, visitSalt)) {
      // an online one-shot disposes itself once it stops sounding.
      new Tone.ToneBufferSource({ url: buffer, playbackRate: Tone.intervalToFrequencyRatio(event.interval) })
        .connect(destination)
        .start(startTime + event.timeSeconds);
    }
  });
  return chunkSeconds(score, chunkIndex);
};

export { bakeScore, generateScore, scheduleChunk };
export type { BakedScore };
