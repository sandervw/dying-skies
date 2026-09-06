/** turns a seed into a score and scheduled notes; all sound lives in musicSoundService. */

import * as Tone from "tone";
import { createSeededRandom, hashDomain } from "./randomService";
import type { RandomNumberGenerator } from "./randomService";
import { BEATS_PER_BAR, BIOMES, INSTRUMENT_SETS, JITTER_SECONDS, MODES } from "./musicSoundService";
import type { BakedScore } from "./musicSoundService";
import type { Biome, InstrumentSetName, Mode, Role, Score } from "../types/music";

const pick = <Item>(random: RandomNumberGenerator, items: readonly Item[]): Item =>
  items[Math.floor(random() * items.length)];

/** generate a score from one music-domain seed: three picks plus optional roles. */
const generateScore = (seed: number): Score => {
  const random = createSeededRandom(seed);
  const mode = pick(random, Object.keys(MODES) as Mode[]);
  const rootPitchClass = Math.floor(random() * 12);
  const biome = pick(random, Object.keys(BIOMES) as Biome[]);
  const instrumentSet = pick(random, Object.keys(INSTRUMENT_SETS) as InstrumentSetName[]);
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

/** bars per chunk; chunk zero is short so sound starts sooner. */
const chunkBars = (score: Score, chunkIndex: number): number =>
  Math.max(2, Math.round(((chunkIndex === 0 ? 10 : 30) * BIOMES[score.biome].tempo) / (BEATS_PER_BAR * 60)));

/** scatter one role's notes across a chunk; reseeded per chunk and role. */
const buildChunkEvents = (
  role: Role,
  score: Score,
  chunkIndex: number,
  bars: number,
  visitSalt: number,
): { timeSeconds: number; degreeIndex: number }[] => {
  const roleIndex = score.roles.indexOf(role);
  const random = createSeededRandom(deriveChunkSeed(score.seed ^ visitSalt ^ roleIndex, chunkIndex));
  const config = BIOMES[score.biome];
  const secondsPerBeat = 60 / config.tempo;
  const count = Math.max(1, Math.round(config.density[role] * bars));
  const events = [];
  for (let index = 0; index < count; index += 1) {
    const beat = Math.floor(random() * bars * BEATS_PER_BAR);
    const jitter = (random() - 0.5) * 2 * JITTER_SECONDS;
    const degreeIndex = Math.floor(random() * MODES[score.mode].length);
    events.push({ timeSeconds: Math.max(0, beat * secondsPerBeat + jitter), degreeIndex });
  }
  events.sort((first, second) => first.timeSeconds - second.timeSeconds);
  return events;
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
    for (const event of buildChunkEvents(role, score, chunkIndex, bars, visitSalt)) {
      // an online one-shot disposes itself once it stops sounding.
      new Tone.ToneBufferSource({ url: baked.voices[index][event.degreeIndex] })
        .connect(destination)
        .start(startTime + event.timeSeconds);
    }
  });
  return (bars * BEATS_PER_BAR * 60) / BIOMES[score.biome].tempo;
};

export { generateScore, scheduleChunk };
