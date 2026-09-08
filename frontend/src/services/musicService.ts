import * as Tone from "tone";
import { INSTRUMENT_SETS } from "../utils/instrumentSets";
import { MODES } from "../utils/modes";
import { BIOMES, type Biome } from "../utils/biomes";
import { createSeededRandom, deriveSeed } from "./randomService";
import type { Seed } from "./randomService";
import type { InstrumentSetName, InstrumentSpec } from "../types/music";

const LOOP_BARS = 8;
const MAX_DENSITY = 1.5; // events per bar; caps loudness and overlap
const MIN_REGISTER = 1; // no subsonic rumble
const MAX_REGISTER = 6; // no piercing highs

const SET_NAMES = Object.keys(INSTRUMENT_SETS) as InstrumentSetName[];
const MODE_NAMES = Object.keys(MODES);
const BIOME_NAMES = Object.keys(BIOMES);

// one random item from a list
const pick = <T>(random: () => number, items: readonly T[]): T =>
  items[Math.floor(random() * items.length)];

// wire nodes in order; the last one feeds the output.
const chainInto = (nodes: Tone.ToneAudioNode[], output: Tone.ToneAudioNode): void => {
  nodes.reduce((previous, node): Tone.ToneAudioNode => {
    previous.connect(node);
    return node;
  }).connect(output);
};

// shared final gate: block subsonic, space, glue, ceiling.
const buildMaster = (biome: Biome): Tone.ToneAudioNode[] => {
  const nodes = [
    new Tone.Filter({ type: "highpass", frequency: 30, rolloff: -12 }),
    new Tone.Gain(0.5),
    new Tone.Filter({ type: "lowpass", frequency: 7000, rolloff: -12 }),
    new Tone.Reverb({ decay: biome.reverbDecay, preDelay: 0.04, wet: biome.reverbWet }),
    new Tone.Compressor({ threshold: -20, ratio: 3, attack: 0.05, release: 0.3 }),
    new Tone.Limiter(-1),
  ];
  chainInto(nodes, Tone.getDestination());
  return nodes;
};

// synth, optional filter, effects, level; the chain ends at the master.
const buildVoice = (spec: InstrumentSpec, master: Tone.ToneAudioNode): Tone.ToneAudioNode[] => {
  const nodes: Tone.ToneAudioNode[] = [];
  const synth = spec.polyphony === undefined
    ? new spec.synth(spec.options)
    : new Tone.PolySynth({ maxPolyphony: spec.polyphony, voice: spec.synth as never, options: spec.options as never });
  nodes.push(synth);
  nodes.push(new Tone.Filter({ type: "highpass", frequency: 40, rolloff: -12 })); // sanitize raw source: block sub/DC pops
  if (spec.filter !== undefined) {
    nodes.push(new Tone.Filter(spec.filter));
  }
  for (const [Effect, options] of spec.effects) {
    const effect = new Effect(options);
    effect.start?.();
    nodes.push(effect);
  }
  nodes.push(new Tone.Gain(spec.gain));
  chainInto(nodes, master);
  return nodes;
};

// random events for one role: [bar, beat, step]. Not seed-derived.
const buildScore = (density: number, steps: number): [number, number, number][] => {
  const count = Math.min(Math.round(Math.min(density, MAX_DENSITY) * LOOP_BARS), LOOP_BARS * 4);
  const seen = new Set<string>();
  const events: [number, number, number][] = [];
  while (events.length < count) {
    const bar = Math.floor(Math.random() * LOOP_BARS);
    const beat = Math.floor(Math.random() * 4);
    const slot = `${bar}:${beat}`;
    if (seen.has(slot) || slot === "0:0") continue; // skip seam downbeat and dupes
    seen.add(slot);
    events.push([bar, beat, Math.floor(Math.random() * steps)]);
  }
  return events;
};

// one looping part per role; steps wrap up octaves.
const buildPart = (
  spec: InstrumentSpec,
  synth: Tone.ToneAudioNode,
  events: readonly [number, number, number][],
  offsets: readonly number[],
  register: number,
  tempo: number,
): void => {
  const seconds = (spec.hold * 60) / tempo;
  const part = new Tone.Part((time, step: number): void => {
    if (synth instanceof Tone.NoiseSynth) {
      synth.triggerAttackRelease(seconds, time); // pink noise has no pitch
    } else {
      const semitone = offsets[step % offsets.length] + 12 * Math.floor(step / offsets.length);
      const note = Tone.Frequency(`C${register}`).transpose(semitone).toFrequency();
      (synth as Tone.PolySynth).triggerAttackRelease(note, seconds, time);
    }
  }, events.map(([bar, beat, step]): [string, number] => [`${bar}:${beat}:0`, step]));
  part.start(0);
};

/** name the instrument set, mode, and biome a seed plays. */
const describeSky = (seed: Seed): { set: InstrumentSetName; mode: string; biome: string } => {
  // mirrors playSky's first three picks; keep this order.
  const random = createSeededRandom(deriveSeed(seed, "music"));
  const set = pick(random, SET_NAMES);
  const biome = pick(random, BIOME_NAMES);
  const mode = pick(random, MODE_NAMES);
  return { set, mode, biome };
};

/** play this sky as endless fresh chunks; the returned call stops it. */
const playSky = (seed: Seed): (() => void) => {
  const random = createSeededRandom(deriveSeed(seed, "music"));
  const set = INSTRUMENT_SETS[pick(random, SET_NAMES)];
  const biome = BIOMES[pick(random, BIOME_NAMES)];
  const offsets = MODES[pick(random, MODE_NAMES)];
  // required roles always sound; optional roles join at random
  const roles = [...biome.required, ...biome.optional.filter(() => random() < 0.5)];
  const loopSeconds = (LOOP_BARS * 4 * 60) / biome.tempo;

  // halve then tanh: smooth ceiling on any summed level
  const context = Tone.getContext().rawContext as unknown as AudioContext;
  const headroom = context.createGain();
  headroom.gain.value = 0.18;
  const shaper = context.createWaveShaper();
  const curve = new Float32Array(1024);
  for (let index = 0; index < curve.length; index++) {
    curve[index] = Math.tanh((index / (curve.length - 1)) * 8 - 4);
  }
  shaper.curve = curve;
  headroom.connect(shaper);
  shaper.connect(context.destination);

  let stopped = false;
  let filling = false;
  let nextTime = context.currentTime + 0.2;
  const active = new Set<AudioBufferSourceNode>();

  // render one loop plus tail offline with a fresh random score
  const renderChunk = (): Promise<AudioBuffer> =>
    Tone.Offline(({ transport }) => {
      const master = buildMaster(biome);
      for (const role of roles) {
        const spec = set[role];
        const register = Math.min(MAX_REGISTER, Math.max(MIN_REGISTER, (spec.register ?? 3) + biome.registerShift));
        const events = buildScore(biome.density[role], offsets.length + 1);
        const synth = buildVoice(spec, master[0])[0];
        buildPart(spec, synth, events, offsets, register, biome.tempo);
      }
      transport.bpm.value = biome.tempo;
      transport.start();
      return (master.find((node) => node instanceof Tone.Reverb) as Tone.Reverb).ready;
    }, loopSeconds + 6).then((buffer): AudioBuffer => buffer.get() as AudioBuffer);

  // keep one chunk queued ahead; tails overlap for a seamless seam
  const fill = async (): Promise<void> => {
    if (filling) return;
    filling = true;
    while (!stopped && nextTime < context.currentTime + loopSeconds) {
      const buffer = await renderChunk();
      if (stopped) break;
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(headroom);
      if (nextTime < context.currentTime) nextTime = context.currentTime + 0.05;
      source.start(nextTime);
      nextTime += loopSeconds;
      active.add(source);
      source.onended = (): void => { active.delete(source); };
    }
    filling = false;
  };

  const timer = setInterval((): void => { void fill(); }, 500);
  void fill();

  return (): void => {
    stopped = true;
    clearInterval(timer);
    for (const source of active) {
      try { source.stop(); } catch { /* already ended */ }
    }
    headroom.disconnect();
    shaper.disconnect();
  };
};

export { describeSky, playSky };
