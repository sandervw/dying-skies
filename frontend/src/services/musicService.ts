import { createEngine, toneSetToPatch } from "webmusic-engine";
import type { Engine, Instrument } from "webmusic-engine";
import { INSTRUMENT_SETS, INSTRUMENT_SET_DISPLAY_NAMES } from "../utils/instrumentSets";
import { MODES } from "../utils/modes";
import { PRESETS } from "../utils/presets";
import { createSeededRandom, deriveSeed } from "./randomService";
import type { Seed } from "./randomService";
import type { InstrumentSpec } from "../types/music";

// one shared context, so a single unlock covers every sky
const audioContext = new AudioContext({ latencyHint: "playback" });

const LOOP_BARS = 8;
const SLIP_CHANCE = 0.2; // fraction of notes re-rolled each repeat
const MAX_DENSITY = 2.5; // events per bar; caps loudness and overlap
const MIN_REGISTER = 1; // no subsonic rumble
const MAX_REGISTER = 6; // no piercing highs

const SET_NAMES = Object.keys(INSTRUMENT_SETS);
const MODE_NAMES = Object.keys(MODES);
const PRESET_NAMES = Object.keys(PRESETS);

// one random item from a list
const pick = <T>(random: () => number, items: readonly T[]): T =>
  items[Math.floor(random() * items.length)];

// rendezvous-hash set pick: stable as the catalog grows
const pickSet = (seed: Seed): string =>
  SET_NAMES.reduce((best, name) =>
    deriveSeed(seed, `set:${name}`) > deriveSeed(seed, `set:${best}`) ? name : best,
  );

/** random [bar, beat, step] events for one role. */
const buildScore = (density: number, steps: number, hold: number, bars = LOOP_BARS): [number, number, number][] => {
  const count = Math.min(Math.round(Math.min(density, MAX_DENSITY) * bars), bars * 4);
  const events: [number, number, number][] = [];
  const total = bars * 4;
  const span = total / count; // one event per even segment
  const latest = total - Math.min(Math.ceil(hold), total / 2); // reserve room for long notes
  const used = new Set<number>(); // one note per slot; mono synths reject ties
  for (let index = 0; index < count; index++) {
    const raw = Math.max(1, Math.floor((index + Math.random()) * span));
    let position = Math.min(raw, latest);
    while (used.has(position) && position < latest) position++;
    if (used.has(position)) continue;
    used.add(position);
    events.push([Math.floor(position / 4), position % 4, Math.floor(Math.random() * steps)]);
  }
  return events;
};

/** re-roll a fraction of a role's notes; drift count around its density. */
const slip = (
  hold: number,
  events: [number, number, number][],
  steps: number,
  density: number,
): void => {
  const total = LOOP_BARS * 4;
  const latest = total - Math.min(Math.ceil(hold), total / 2);

  // drift the count around the average this instrument's density implies
  const average = Math.min(density, MAX_DENSITY) * LOOP_BARS;
  const goal = Math.max(1, Math.floor(average) + (Math.random() < average % 1 ? 1 : 0));
  let drifted = false;
  if (events.length > goal) { events.pop(); drifted = true; }
  else if (events.length < goal) { events.push([0, 0, Math.floor(Math.random() * steps)]); drifted = true; }

  // a count change re-spaces every note; else slip a random few
  const count = events.length;
  const span = total / count;
  events.forEach((event, index) => {
    if (!drifted && Math.random() >= SLIP_CHANCE) return;
    if (!drifted) event[2] = Math.floor(Math.random() * steps);
    const position = Math.min(Math.max(1, Math.floor((index + Math.random()) * span)), latest);
    event[0] = Math.floor(position / 4);
    event[1] = position % 4;
  });
};

/** trigger one role's notes for this loop, timed off the passed time. */
const buildPart = (
  spec: InstrumentSpec,
  instrument: Instrument,
  events: readonly [number, number, number][],
  offsets: readonly number[],
  register: number,
  tempo: number,
  time: number,
): void => {
  const beat = 60 / tempo;
  const seconds = spec.hold * beat;
  const seen = new Set<string>(); // drop ties; mono voices take one note per slot
  for (const [bar, position, step] of events) {
    if (seen.has(`${bar}:${position}`)) continue;
    seen.add(`${bar}:${position}`);
    const at = time + (bar * 4 + position) * beat;
    const semitone = offsets[step % offsets.length] + 12 * Math.floor(step / offsets.length);
    instrument.triggerAttackRelease(12 * (register + 1) + semitone, seconds, at); // MIDI from C{register}; noise ignores pitch
  }
};

/** play this sky on a looping engine; dispose the engine to stop. */
const playSky = async (seed: Seed): Promise<Engine> => {
  // generate music settings based on seed value
  const random = createSeededRandom(deriveSeed(seed, "music"));
  const set = INSTRUMENT_SETS[pickSet(seed)];
  const preset = PRESETS[pick(random, PRESET_NAMES)];
  const mode = MODES[pick(random, MODE_NAMES)].offsets;
  const roles = [...preset.instruments];
  const steps = mode.length + 1;

  // locked score: built once, a fraction of notes slips each repeat
  const score = roles.map((role) => {
    const spec = set[role];
    const register = Math.min(MAX_REGISTER, Math.max(MIN_REGISTER, (spec.register ?? 2) + preset.registerShift));
    const events = buildScore(preset.density[role], steps, spec.hold, LOOP_BARS);
    return { spec, register, events, density: preset.density[role] };
  });

  const { patch, roles: mixRoles } = toneSetToPatch(set, {
    reverbSend: preset.reverbWet,
    roomSize: Math.min(0.85, preset.reverbDecay / 14),
  });
  const engine = await createEngine({ patch, roles: mixRoles, context: audioContext });
  const instruments = roles.map((role) => engine.instrument(role));
  engine.transport.bpm = preset.tempo;

  // each repeat: slip a fraction, then trigger from the passed time
  let first = true;
  engine.transport.scheduleRepeat((time): void => {
    if (!first) for (const voice of score) slip(voice.spec.hold, voice.events, steps, voice.density);
    first = false;
    score.forEach((voice, index) =>
      buildPart(voice.spec, instruments[index], voice.events, mode, voice.register, preset.tempo, time));
  }, `${LOOP_BARS}m`, 0);
  engine.transport.start();
  return engine;
};

/** name the instrument-set, mode, and preset a seed plays. */
const describeSky = (seed: Seed): { set: string; mode: string; preset: string; } => {
  // mirrors playSky's first three picks; keep this order.
  const random = createSeededRandom(deriveSeed(seed, "music"));
  const set = pickSet(seed);
  const preset = pick(random, PRESET_NAMES);
  const mode = pick(random, MODE_NAMES);
  return { set: INSTRUMENT_SET_DISPLAY_NAMES[set], mode: MODES[mode].displayName, preset: PRESETS[preset].displayName };
};

export {
  LOOP_BARS,
  MIN_REGISTER,
  MAX_REGISTER,
  buildScore,
  slip,
  buildPart,
  describeSky,
  playSky,
};
