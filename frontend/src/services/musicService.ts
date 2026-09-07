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

// the shared final gate: space, then glue, then ceiling.
const buildMaster = (biome: Biome): Tone.ToneAudioNode[] => {
  const nodes = [
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
    if (seen.has(slot)) continue; // one note per slot: no voice-steal clicks
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

// wrap the reverb tail into the head, then encode wav.
const toWavUrl = (buffer: AudioBuffer, loopFrames: number): string => {
  const channels = buffer.numberOfChannels;
  const view = new DataView(new ArrayBuffer(44 + loopFrames * channels * 2));
  const writeText = (at: number, text: string): void => {
    for (let index = 0; index < text.length; index++) view.setUint8(at + index, text.charCodeAt(index));
  };
  writeText(0, "RIFF");
  view.setUint32(4, view.byteLength - 8, true);
  writeText(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, view.byteLength - 44, true);
  let position = 44;
  for (let frame = 0; frame < loopFrames; frame++) {
    for (let channel = 0; channel < channels; channel++) {
      const data = buffer.getChannelData(channel);
      const tail = frame + loopFrames < buffer.length ? data[frame + loopFrames] : 0;
      const sample = Math.max(-1, Math.min(1, data[frame] + tail));
      view.setInt16(position, sample * 0x7fff, true);
      position += 2;
    }
  }
  return URL.createObjectURL(new Blob([view], { type: "audio/wav" }));
};

/** loop this sky's music; the returned call tears it down. */
const playSky = (seed: Seed): (() => void) => {
  const random = createSeededRandom(deriveSeed(seed, "music"));
  const set = INSTRUMENT_SETS[pick(random, SET_NAMES)];
  const biome = BIOMES[pick(random, BIOME_NAMES)];
  const offsets = MODES[pick(random, MODE_NAMES)];
  // required roles always sound; optional roles join at random
  const roles = [...biome.required, ...biome.optional.filter(() => random() < 0.5)];

  const loopSeconds = (LOOP_BARS * 4 * 60) / biome.tempo;
  const audio = new Audio();
  audio.loop = true;
  let stopped = false;

  // render loop plus tail offline for a seamless wrap
  void Tone.Offline(({ transport }) => {
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
  }, loopSeconds + 6).then((buffer): void => {
    if (stopped) return;
    const rendered = buffer.get() as AudioBuffer;
    audio.src = toWavUrl(rendered, Math.round(loopSeconds * rendered.sampleRate));
    void audio.play();
  });

  return (): void => {
    stopped = true;
    audio.pause();
    if (audio.src) URL.revokeObjectURL(audio.src);
  };
};

export { playSky };
