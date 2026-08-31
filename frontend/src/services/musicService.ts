import { createSeededRandom, deriveChunkSeed } from "./randomService";
import type { RandomNumberGenerator } from "./randomService";
import type {
  Archetype,
  Biome,
  Layer,
  Mode,
  OscillatorType,
  Role,
  Score,
} from "../types/music";

/** semitone offsets from the root for each consonance mode. */
const MODE_OFFSETS: Record<Mode, readonly number[]> = {
  "major-pentatonic": [0, 2, 4, 7, 9],
  "minor-pentatonic": [0, 3, 5, 7, 10],
  "dorian-pentatonic": [0, 2, 3, 7, 9],
  "lydian-pentatonic": [0, 2, 4, 6, 11],
  "whole-tone": [0, 2, 4, 6, 8, 10],
};

const MODES = Object.keys(MODE_OFFSETS) as Mode[];
const BIOMES: Biome[] = ["glass", "warm-drift", "deep-drone", "haze", "chime-rain", "ember"];
const RANKED_ROLES: Role[] = ["drone", "pad", "sparkle", "accent", "counter"];

interface ArchetypeRange {
  readonly oscillators: readonly OscillatorType[];
  readonly attack: readonly [number, number];
  readonly decay: readonly [number, number];
  readonly sustain: readonly [number, number];
  readonly release: readonly [number, number];
  readonly cutoff: readonly [number, number];
}

// per-archetype timbre ranges; oscillator plus ADSR seconds plus cutoff Hz.
const ARCHETYPE_RANGES: Record<Archetype, ArchetypeRange> = {
  drone: { oscillators: ["sine", "triangle"], attack: [2, 6], decay: [3, 6], sustain: [0.9, 1], release: [6, 12], cutoff: [400, 1000] },
  pad: { oscillators: ["triangle", "sawtooth"], attack: [1, 4], decay: [2, 4], sustain: [0.6, 0.9], release: [4, 9], cutoff: [600, 1200] },
  bell: { oscillators: ["sine", "triangle"], attack: [0.003, 0.01], decay: [3, 8], sustain: [0, 0], release: [3, 6], cutoff: [1500, 4000] },
  pluck: { oscillators: ["triangle", "sawtooth"], attack: [0.005, 0.02], decay: [0.5, 1.5], sustain: [0.1, 0.1], release: [1, 3], cutoff: [1500, 3500] },
};

// events per bar per role; drives how busy a layer sounds.
const ROLE_DENSITY: Record<Role, readonly [number, number]> = {
  drone: [0.2, 0.3],
  pad: [0.5, 1],
  sparkle: [1, 2],
  accent: [0.4, 0.6],
  counter: [0.25, 0.5],
};

// register band per role, as an inclusive octave range.
const ROLE_OCTAVE: Record<Role, readonly [number, number]> = {
  drone: [1, 2],
  pad: [2, 3],
  sparkle: [4, 5],
  accent: [4, 5],
  counter: [2, 3],
};

interface BiomeConfig {
  readonly archetypeByRole: Record<Role, Archetype>;
  readonly densityScale: number;
  readonly registerShift: number;
  readonly reverbLean: number;
}

// each biome bundles archetype assignments plus register and density leans.
const BIOME_CONFIG: Record<Biome, BiomeConfig> = {
  glass: { archetypeByRole: { drone: "drone", pad: "pad", sparkle: "bell", accent: "bell", counter: "pad" }, densityScale: 0.8, registerShift: 1, reverbLean: 0.15 },
  "warm-drift": { archetypeByRole: { drone: "drone", pad: "pad", sparkle: "bell", accent: "pluck", counter: "pad" }, densityScale: 1, registerShift: 0, reverbLean: 0 },
  "deep-drone": { archetypeByRole: { drone: "drone", pad: "pad", sparkle: "bell", accent: "pluck", counter: "drone" }, densityScale: 0.7, registerShift: -1, reverbLean: 0 },
  haze: { archetypeByRole: { drone: "drone", pad: "pad", sparkle: "pad", accent: "pad", counter: "pad" }, densityScale: 0.7, registerShift: 0, reverbLean: 0.15 },
  "chime-rain": { archetypeByRole: { drone: "drone", pad: "pad", sparkle: "pluck", accent: "bell", counter: "pad" }, densityScale: 1.4, registerShift: 1, reverbLean: 0 },
  ember: { archetypeByRole: { drone: "drone", pad: "pad", sparkle: "bell", accent: "pluck", counter: "drone" }, densityScale: 1, registerShift: -1, reverbLean: -0.05 },
};

/** global numeric ranges the generator draws from; the lab overrides these. */
interface ScoreRanges {
  readonly tempoMinimum: number;
  readonly tempoMaximum: number;
  readonly layerCountMinimum: number;
  readonly layerCountMaximum: number;
  readonly reverbWetMinimum: number;
  readonly reverbWetMaximum: number;
  readonly reverbDecayMinimum: number;
  readonly reverbDecayMaximum: number;
}

/** default generation ranges from the music reference. */
const DEFAULT_RANGES: ScoreRanges = {
  tempoMinimum: 50,
  tempoMaximum: 75,
  layerCountMinimum: 3,
  layerCountMaximum: 5,
  reverbWetMinimum: 0.3,
  reverbWetMaximum: 0.7,
  reverbDecayMinimum: 4,
  reverbDecayMaximum: 8,
};

const randomInRange = (random: RandomNumberGenerator, minimum: number, maximum: number): number =>
  minimum + random() * (maximum - minimum);

const randomInteger = (random: RandomNumberGenerator, minimum: number, maximum: number): number =>
  Math.floor(randomInRange(random, minimum, maximum + 1));

const pick = <Item>(random: RandomNumberGenerator, items: readonly Item[]): Item =>
  items[Math.floor(random() * items.length)];

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

// draw one layer from its role and biome archetype.
const generateLayer = (
  random: RandomNumberGenerator,
  role: Role,
  config: BiomeConfig,
): Layer => {
  const archetype = config.archetypeByRole[role];
  const range = ARCHETYPE_RANGES[archetype];
  const octaveBand = ROLE_OCTAVE[role];
  const density = ROLE_DENSITY[role];
  return {
    role,
    archetype,
    oscillator: pick(random, range.oscillators),
    octave: clamp(randomInteger(random, octaveBand[0], octaveBand[1]) + config.registerShift, 0, 7),
    density: randomInRange(random, density[0], density[1]) * config.densityScale,
    attack: randomInRange(random, range.attack[0], range.attack[1]),
    decay: randomInRange(random, range.decay[0], range.decay[1]),
    sustain: randomInRange(random, range.sustain[0], range.sustain[1]),
    release: randomInRange(random, range.release[0], range.release[1]),
    cutoff: randomInRange(random, range.cutoff[0], range.cutoff[1]),
  };
};

/** generate a full static score from one music-domain seed. */
const generateScore = (seed: number, ranges: ScoreRanges = DEFAULT_RANGES): Score => {
  const random = createSeededRandom(seed);
  const biome = pick(random, BIOMES);
  const mode = pick(random, MODES);
  const rootPitchClass = Math.floor(random() * 12);
  const tempo = randomInRange(random, ranges.tempoMinimum, ranges.tempoMaximum);
  const reverbDecay = randomInRange(random, ranges.reverbDecayMinimum, ranges.reverbDecayMaximum);
  const config = BIOME_CONFIG[biome];
  const reverbWet = clamp(
    randomInRange(random, ranges.reverbWetMinimum, ranges.reverbWetMaximum) + config.reverbLean,
    0.3,
    0.7,
  );
  const layerCount = randomInteger(random, ranges.layerCountMinimum, ranges.layerCountMaximum);
  const roles = RANKED_ROLES.slice(0, layerCount);
  const layers = roles.map((role) => generateLayer(random, role, config));
  return { seed, biome, mode, rootPitchClass, tempo, reverbWet, reverbDecay, layers };
};

/** convert a MIDI note number into a frequency in Hz. */
const midiToFrequency = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12);

const BEATS_PER_BAR = 4;
const CHUNK_TARGET_SECONDS = 30;

/** one scheduled note inside a rendered chunk. */
interface ChunkEvent {
  readonly timeSeconds: number;
  readonly frequency: number;
  readonly holdSeconds: number;
}

// note hold length in beats per archetype; envelopes add the tail.
const HOLD_BEATS: Record<Archetype, number> = { drone: 8, pad: 4, bell: 2, pluck: 1 };

/** bars of music per chunk; each chunk runs roughly thirty seconds. */
const chunkBars = (score: Score): number =>
  Math.max(4, Math.round((CHUNK_TARGET_SECONDS * score.tempo) / (BEATS_PER_BAR * 60)));

/** seconds of music in one chunk, before the baked-in reverb tail. */
const chunkSeconds = (score: Score): number => (chunkBars(score) * BEATS_PER_BAR * 60) / score.tempo;

/** scatter one layer's notes across a chunk; reseeded per chunk. */
const buildChunkEvents = (
  layer: Layer,
  score: Score,
  chunkIndex: number,
  bars: number,
  visitSalt: number,
): ChunkEvent[] => {
  const random = createSeededRandom(deriveChunkSeed(score.seed ^ visitSalt, chunkIndex));
  const offsets = MODE_OFFSETS[score.mode];
  const secondsPerBeat = 60 / score.tempo;
  const count = Math.max(1, Math.round(layer.density * bars));
  const events: ChunkEvent[] = [];
  for (let index = 0; index < count; index += 1) {
    const beat = Math.floor(random() * bars * BEATS_PER_BAR);
    const degree = offsets[Math.floor(random() * offsets.length)];
    const midi = (layer.octave + 1) * 12 + score.rootPitchClass + degree;
    events.push({
      timeSeconds: beat * secondsPerBeat,
      frequency: midiToFrequency(midi),
      holdSeconds: HOLD_BEATS[layer.archetype] * secondsPerBeat,
    });
  }
  return events;
};

export { generateScore, DEFAULT_RANGES, chunkBars, chunkSeconds, buildChunkEvents };
export type { ScoreRanges, ChunkEvent };
