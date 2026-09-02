import { createSeededRandom, deriveChunkSeed } from "./randomService";
import type { RandomNumberGenerator } from "./randomService";
import { EXCLUDED_PAIRINGS, INSTRUMENT_SETS } from "./instrumentSets";
import type { Biome, InstrumentSetName, Mode, Role, Score } from "../types/music";

/** semitone offsets from the root for each consonance mode. */
const MODE_OFFSETS: Record<Mode, readonly number[]> = {
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

const MODES = Object.keys(MODE_OFFSETS) as Mode[];
const BIOME_NAMES = Object.keys(BIOMES) as Biome[];
const SET_NAMES = Object.keys(INSTRUMENT_SETS) as InstrumentSetName[];

const pick = <Item>(random: RandomNumberGenerator, items: readonly Item[]): Item =>
  items[Math.floor(random() * items.length)];

/** generate a score from one music-domain seed: three picks plus optional roles. */
const generateScore = (seed: number): Score => {
  const random = createSeededRandom(seed);
  const mode = pick(random, MODES);
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

/** convert a MIDI note number into a frequency in Hz. */
const midiToFrequency = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12);

const BEATS_PER_BAR = 4;
/** wander off the beat; identical start times stack into one transient. */
const JITTER_SECONDS = 0.025;
const CHUNK_TARGET_SECONDS = 30;
const FIRST_CHUNK_TARGET_SECONDS = 10;

/** one scheduled note inside a rendered chunk. */
interface ChunkEvent {
  readonly timeSeconds: number;
  readonly frequency: number;
  readonly holdSeconds: number;
}

/** bars per chunk; chunk zero is short so sound starts sooner. */
const chunkBars = (score: Score, chunkIndex: number): number => {
  const target = chunkIndex === 0 ? FIRST_CHUNK_TARGET_SECONDS : CHUNK_TARGET_SECONDS;
  return Math.max(2, Math.round((target * BIOMES[score.biome].tempo) / (BEATS_PER_BAR * 60)));
};

/** seconds of music in one chunk, before the baked-in tail. */
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
  const offsets = MODE_OFFSETS[score.mode];
  const secondsPerBeat = 60 / config.tempo;
  const count = Math.max(1, Math.round(config.density[role] * bars));
  const events: ChunkEvent[] = [];
  for (let index = 0; index < count; index += 1) {
    const beat = Math.floor(random() * bars * BEATS_PER_BAR);
    const jitter = (random() - 0.5) * 2 * JITTER_SECONDS;
    const degree = offsets[Math.floor(random() * offsets.length)];
    const midi = (spec.register + config.registerShift + 1) * 12 + score.rootPitchClass + degree;
    const timeSeconds = Math.max(0, beat * secondsPerBeat + jitter);
    events.push({ timeSeconds, frequency: midiToFrequency(midi), holdSeconds: spec.hold * secondsPerBeat });
  }
  events.sort((first, second) => first.timeSeconds - second.timeSeconds);
  return events;
};

export { BIOMES, generateScore, chunkBars, chunkSeconds, buildChunkEvents };
export type { BiomeConfig, ChunkEvent };
