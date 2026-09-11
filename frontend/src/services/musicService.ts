import * as Tone from "tone";
import { INSTRUMENT_SETS } from "../utils/instrumentSets";
import { MODES } from "../utils/modes";
import { PRESETS, type Preset } from "../utils/presets";
import { createSeededRandom, deriveSeed } from "./randomService";
import type { Seed } from "./randomService";
import type { InstrumentSetName, InstrumentSpec } from "../types/music";

const LOOP_BARS = 8;
const MAX_DENSITY = 1.5; // events per bar; caps loudness and overlap
const MIN_REGISTER = 1; // no subsonic rumble
const MAX_REGISTER = 6; // no piercing highs

const SET_NAMES = Object.keys(INSTRUMENT_SETS) as InstrumentSetName[];
const MODE_NAMES = Object.keys(MODES);
const PRESET_NAMES = Object.keys(PRESETS);

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

/** shared final sound gate; ends at the destination. */
const buildMaster = (preset: Preset): Tone.ToneAudioNode[] => {
  const nodes = [
    // cut volume
    new Tone.Gain(0.4),
    // cut high hz
    new Tone.Filter({ type: "lowpass", frequency: 7000, rolloff: -12 }),
    // simulates space (makes it sound like its all in 1 room)
    new Tone.Reverb({ decay: preset.reverbDecay, preDelay: 0.04, wet: preset.reverbWet }),
    // cut low hz
    new Tone.Filter({ type: "highpass", frequency: 40, rolloff: -12 }),
    // gentler cut of high volume above a -20 dB threshold
    new Tone.Compressor({ threshold: -20, ratio: 3, attack: 0.05, release: 0.3 }),
    // hard cut above -1 dB threshold
    new Tone.Limiter(-1),
  ];
  chainInto(nodes, Tone.getDestination());
  return nodes;
};

// per-instrument sound gate
const equalize = (spec: InstrumentSpec, register: number): [Tone.Filter, Tone.Gain] => {
  // cut off low hz
  const highpass = new Tone.Filter({ type: "highpass", frequency: 40, rolloff: -12 });
  // lower volume below register 2, further below 1
  const trim = register <= 1 ? 0.3 : register <= 2 ? 0.5 : 1;
  return [highpass, new Tone.Gain(spec.gain * trim)];
};

/** build one instrument voice chain into the master. */
const buildVoice = (spec: InstrumentSpec, register: number, master: Tone.ToneAudioNode): Tone.ToneAudioNode[] => {
  const synth = spec.polyphony === undefined
    ? new spec.synth(spec.options)
    : new Tone.PolySynth({ maxPolyphony: spec.polyphony, voice: spec.synth as never, options: spec.options as never });
  const [highpass, gain] = equalize(spec, register);
  const nodes: Tone.ToneAudioNode[] = [synth];
  if (spec.filter !== undefined) {
    nodes.push(new Tone.Filter(spec.filter));
  }
  for (const [Effect, options] of spec.effects) {
    const effect = new Effect(options);
    effect.start?.();
    nodes.push(effect);
  }
  nodes.push(highpass, gain);
  chainInto(nodes, master);
  return nodes;
};

/** random [bar, beat, step] events for one role. */
const buildScore = (density: number, steps: number, bars = LOOP_BARS): [number, number, number][] => {
  const count = Math.min(Math.round(Math.min(density, MAX_DENSITY) * bars), bars * 4);
  const events: [number, number, number][] = [];
  const span = (bars * 4) / count; // one event per even segment
  for (let index = 0; index < count; index++) {
    const position = Math.max(1, Math.floor((index + Math.random()) * span)); // skip seam
    events.push([Math.floor(position / 4), position % 4, Math.floor(Math.random() * steps)]);
  }
  return events;
};

/** schedule one role's looping part; steps wrap octaves. */
const buildPart = (
  spec: InstrumentSpec,
  synth: Tone.ToneAudioNode,
  events: readonly [number, number, number][],
  offsets: readonly number[],
  register: number,
  tempo: number,
  chunkLength: number,
): void => {
  const seconds = (spec.hold * 60) / tempo;
  const part = new Tone.Part((time, step: number): void => {
    const held = Math.min(seconds, chunkLength - time); // stop notes at the seam
    if (synth instanceof Tone.NoiseSynth) {
      synth.triggerAttackRelease(held, time); // pink noise has no pitch
    } else {
      const semitone = offsets[step % offsets.length] + 12 * Math.floor(step / offsets.length);
      const note = Tone.Frequency(`C${register}`).transpose(semitone).toFrequency();
      (synth as Tone.PolySynth).triggerAttackRelease(note, held, time);
    }
  }, events.map(([bar, beat, step]): [string, number] => [`${bar}:${beat}:0`, step]));
  part.start(0);
};

/** name the instrument set, mode, and preset a seed plays. */
const describeSky = (seed: Seed): { set: InstrumentSetName; mode: string; preset: string; } => {
  // mirrors playSky's first three picks; keep this order.
  const random = createSeededRandom(deriveSeed(seed, "music"));
  const set = pick(random, SET_NAMES);
  const preset = pick(random, PRESET_NAMES);
  const mode = pick(random, MODE_NAMES);
  return { set, mode, preset };
};

/** ramp buffer edges to zero; prevents truncation pops. */
const deClick = (audio: AudioBuffer): AudioBuffer => {
  const fade = Math.floor(audio.sampleRate * 0.02);
  for (let channel = 0; channel < audio.numberOfChannels; channel++) {
    const data = audio.getChannelData(channel);
    for (let index = 0; index < fade; index++) {
      const gain = index / fade;
      data[index] *= gain;
      data[data.length - 1 - index] *= gain;
    }
  }
  return audio;
};

/** play this sky as endless fresh chunks; the returned call stops it. */
const playSky = (seed: Seed): (() => void) => {
  const random = createSeededRandom(deriveSeed(seed, "music"));
  const set = INSTRUMENT_SETS[pick(random, SET_NAMES)];
  const preset = PRESETS[pick(random, PRESET_NAMES)];
  const offsets = MODES[pick(random, MODE_NAMES)];
  const roles = [...preset.instruments];
  const chunkSeconds = (bars: number): number => (bars * 4 * 60) / preset.tempo;

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

  // render `bars` bars plus tail offline with a fresh random score
  const renderChunk = (bars: number): Promise<AudioBuffer> =>
    Tone.Offline(({ transport }) => {
      const master = buildMaster(preset);
      for (const role of roles) {
        const spec = set[role];
        const register = Math.min(MAX_REGISTER, Math.max(MIN_REGISTER, (spec.register ?? 3) + preset.registerShift));
        const events = buildScore(preset.density[role], offsets.length + 1, bars);
        const synth = buildVoice(spec, register, master[0])[0];
        buildPart(spec, synth, events, offsets, register, preset.tempo, chunkSeconds(bars));
      }
      transport.bpm.value = preset.tempo;
      transport.start();
      return (master.find((node) => node instanceof Tone.Reverb) as Tone.Reverb).ready;
      //
    }, chunkSeconds(bars) + 6) // add a 6 second tail to let reverb ring out
      .then((buffer): AudioBuffer => deClick(buffer.get() as AudioBuffer));

  // keep one chunk queued ahead; tails overlap for a seamless seam
  let firstChunk = true;
  const fill = async (): Promise<void> => {
    if (filling) return;
    filling = true;
    while (!stopped && nextTime < context.currentTime + chunkSeconds(LOOP_BARS)) {
      const bars = firstChunk ? 2 : LOOP_BARS; // short first chunk plays sooner
      const buffer = await renderChunk(bars);
      if (stopped) break;
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(headroom);
      if (nextTime < context.currentTime) nextTime = context.currentTime + 0.05;
      source.start(nextTime);
      nextTime += chunkSeconds(bars);
      firstChunk = false;
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

export {
  LOOP_BARS,
  MIN_REGISTER,
  MAX_REGISTER,
  buildMaster,
  buildVoice,
  buildScore,
  buildPart,
  deClick,
  describeSky,
  playSky,
};
