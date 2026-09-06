/** turns a seed into a score and scheduled notes; all sound lives in musicSoundService. */

import * as Tone from "tone";
import { createSeededRandom } from "./randomService";
import type { RandomNumberGenerator } from "./randomService";
import { BEATS_PER_BAR, BIOMES, INSTRUMENT_SETS, MODES } from "./musicSoundService";
import type { BakedScore } from "./musicSoundService";
import type { Biome, InstrumentSetName, Mode, Role, Score } from "../types/music";

/** every sky sounds in the same key; only the mode moves. */
const ROOT_PITCH_CLASS = 0;

/** fixed phrase per role: beat offset, first degree, and step through the mode. */
const ROLE_PATTERNS: Record<Role, { readonly phase: number; readonly start: number; readonly step: number }> = {
  drone: { phase: 0, start: 0, step: 0 },
  pad: { phase: 0.5, start: 0, step: 2 },
  sparkle: { phase: 0.25, start: 2, step: 3 },
  lead: { phase: 0.75, start: 1, step: 4 },
  counter: { phase: 0.125, start: 3, step: 1 },
};

const pick = <Item>(random: RandomNumberGenerator, items: readonly Item[]): Item =>
  items[Math.floor(random() * items.length)];

/** generate a score from one music-domain seed: mode, biome, and set only. */
const generateScore = (seed: number): Score => {
  const random = createSeededRandom(seed);
  const mode = pick(random, Object.keys(MODES) as Mode[]);
  const biome = pick(random, Object.keys(BIOMES) as Biome[]);
  const instrumentSet = pick(random, Object.keys(INSTRUMENT_SETS) as InstrumentSetName[]);
  return { mode, rootPitchClass: ROOT_PITCH_CLASS, biome, instrumentSet, roles: BIOMES[biome].roles };
};

/** bars per chunk; chunk zero is short so sound starts sooner. */
const chunkBars = (score: Score, chunkIndex: number): number =>
  Math.max(2, Math.round(((chunkIndex === 0 ? 10 : 30) * BIOMES[score.biome].tempo) / (BEATS_PER_BAR * 60)));

/** space one role's notes evenly across a chunk and walk its degrees. */
const buildChunkEvents = (
  role: Role,
  score: Score,
  chunkIndex: number,
  bars: number,
): { timeSeconds: number; degreeIndex: number }[] => {
  const config = BIOMES[score.biome];
  const pattern = ROLE_PATTERNS[role];
  const degreeCount = MODES[score.mode].length;
  const secondsPerBeat = 60 / config.tempo;
  const totalBeats = bars * BEATS_PER_BAR;
  const count = Math.max(1, Math.round(config.density[role] * bars));
  const events = [];
  for (let index = 0; index < count; index += 1) {
    const beat = (index * totalBeats) / count + pattern.phase;
    const step = (chunkIndex * count + index) * pattern.step;
    events.push({ timeSeconds: beat * secondsPerBeat, degreeIndex: (pattern.start + step) % degreeCount });
  }
  return events;
};

/** start one chunk of notes on the live graph; returns its music length. */
const scheduleChunk = (
  score: Score,
  chunkIndex: number,
  baked: BakedScore,
  destination: Tone.ToneAudioNode,
  startTime: number,
): number => {
  const bars = chunkBars(score, chunkIndex);
  score.roles.forEach((role, index): void => {
    for (const event of buildChunkEvents(role, score, chunkIndex, bars)) {
      // an online one-shot disposes itself once it stops sounding.
      new Tone.ToneBufferSource({ url: baked.voices[index][event.degreeIndex] })
        .connect(destination)
        .start(startTime + event.timeSeconds);
    }
  });
  return (bars * BEATS_PER_BAR * 60) / BIOMES[score.biome].tempo;
};

export { generateScore, scheduleChunk };
