import * as Tone from "tone";
import { INSTRUMENT_SETS } from "../utils/instrumentSets";
import { MODES } from "../utils/modes";
import { PRESETS } from "../utils/presets";
import { createSeededRandom, deriveSeed } from "./randomService";
import type { Seed } from "./randomService";
import type { InstrumentSpec } from "../types/music";

const LOOP_BARS = 8;
const SLIP_CHANCE = 0.2; // fraction of notes re-rolled each repeat
const MAX_DENSITY = 2.5; // events per bar; caps loudness and overlap
const MIN_REGISTER = 1; // no subsonic rumble
const MAX_REGISTER = 6; // no piercing highs

const db = Tone.dbToGain;
const CEILING = db(-6); // final "loudness" ceiling everythings gets mult. by: -1 = normal, -6 = half as loud
const FADE = 0.01; // seconds, edge declick
const TAIL = 6; // seconds, release + reverb decay tail

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

/** per-sound strip: trim, HPF, EQ, comp, makeup, tonal LPF. */
const channel = (): Tone.ToneAudioNode[] => [
  new Tone.Gain(db(-12)),
  new Tone.Filter({ type: "highpass", frequency: 120, rolloff: -24 }),
  new Tone.Filter({ type: "peaking", frequency: 300, Q: 1, gain: -2 }),
  new Tone.Compressor({ ratio: 3, threshold: -18, attack: 0.008, release: 0.15, knee: 4 }),
  new Tone.Gain(db(-2)), // offsets compressor auto makeup gain
  new Tone.Filter({ type: "lowpass", frequency: 10000, rolloff: -12 }),
];

/** master audio signal chain; ends at the destination. */
const masterBus = (): Tone.ToneAudioNode => {
  const nodes = [
    new Tone.Gain(db(-6)), // headroom trim (turn down input signal to 1/2 audio; give effects "working room")
    new Tone.Filter({ type: "highpass", frequency: 25, rolloff: -24 }), // strip subsonic rumble
    new Tone.Filter({ type: "peaking", frequency: 250, Q: 0.7, gain: -1 }),
    new Tone.Compressor({ ratio: 2, threshold: -12, attack: 0.03, release: 0.2, knee: 6 }), // "glues" audio together
    new Tone.Gain(db(-1)), // Turn the gain back up post-compression
    new Tone.Filter({ type: "highshelf", frequency: 10000, gain: 1 }),
    new Tone.Limiter(-3), // soft safety net, not the ceiling
  ];
  nodes[0].chain(...nodes.slice(1), Tone.getDestination());
  return nodes[0];
};

/** reverb chain: wet reverb > filters > master. */
const reverbBus = async (
  master: Tone.ToneAudioNode,
  decay: number,
  wet: number,
): Promise<Tone.ToneAudioNode> => {
  const verb = new Tone.Reverb({ decay, preDelay: 0.03, wet });
  await verb.ready; // IR generated async; silent until ready
  const send = new Tone.Gain(db(-18));
  send.chain(
    verb,
    new Tone.Filter({ type: "highpass", frequency: 250 }),
    new Tone.Filter({ type: "lowpass", frequency: 8000 }),
    master,
  );
  return send;
};

/** build one instrument voice; fan dry to master, post to reverb send. */
const buildVoice = (
  spec: InstrumentSpec,
  master: Tone.ToneAudioNode,
  send: Tone.ToneAudioNode,
): Tone.ToneAudioNode[] => {
  const synth = spec.polyphony === undefined
    ? new spec.synth(spec.options)
    : new Tone.PolySynth({ maxPolyphony: spec.polyphony, voice: spec.synth as never, options: spec.options as never });
  const nodes: Tone.ToneAudioNode[] = [synth, new Tone.Gain(spec.gain)];
  if (spec.filter !== undefined) {
    nodes.push(new Tone.Filter(spec.filter));
  }
  for (const [Effect, options] of spec.effects) {
    const effect = new Effect(options);
    effect.start?.();
    nodes.push(effect);
  }
  nodes.push(...channel());
  nodes.reduce((previous, node): Tone.ToneAudioNode => {
    previous.connect(node);
    return node;
  }).fan(master, send);
  return nodes;
};

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
  const seen = new Set<string>(); // drop ties; two notes per slot crash Tone
  const slots = events.flatMap(([bar, beat, step]): [string, number][] =>
    seen.has(`${bar}:${beat}`) ? [] : (seen.add(`${bar}:${beat}`), [[`${bar}:${beat}:0`, step]]));
  const part = new Tone.Part((time, step: number): void => {
    const held = Math.min(seconds, chunkLength - time); // stop notes at the seam
    if (synth instanceof Tone.NoiseSynth) {
      synth.triggerAttackRelease(held, time); // pink noise has no pitch
    } else {
      const semitone = offsets[step % offsets.length] + 12 * Math.floor(step / offsets.length);
      const note = Tone.Frequency(`C${register}`).transpose(semitone).toFrequency();
      (synth as Tone.PolySynth).triggerAttackRelease(note, held, time);
    }
  }, slots);
  part.start(0);
};

/** peak-normalize the render to the ceiling, then fade both edges. */
const finalize = (buffer: AudioBuffer): AudioBuffer => {
  const channels = [...Array(buffer.numberOfChannels)].map((_, index) => buffer.getChannelData(index));
  const peak = Math.max(...channels.map((data) =>
    data.reduce((max, sample) => Math.max(max, Math.abs(sample)), 0)));
  const scale = peak > 0 ? CEILING / peak : 1;
  const fade = Math.round(FADE * buffer.sampleRate);
  for (const data of channels) {
    for (let index = 0; index < data.length; index++) data[index] *= scale;
    for (let index = 0; index < fade; index++) {
      data[index] *= index / fade;
      data[data.length - 1 - index] *= index / fade;
    }
  }
  return buffer;
};

/** play this sky as endless fresh chunks; the returned call stops it. */
const playSky = (seed: Seed): (() => void) => {
  // generate music settings based on seed value
  const random = createSeededRandom(deriveSeed(seed, "music"));
  const set = INSTRUMENT_SETS[pickSet(seed)];
  const preset = PRESETS[pick(random, PRESET_NAMES)];
  const mode = MODES[pick(random, MODE_NAMES)];
  const roles = [...preset.instruments];
  const steps = mode.length + 1;

  // locked score: built once, a fraction of notes slips each repeat
  const score = roles.map((role) => {
    const spec = set[role];
    const register = Math.min(MAX_REGISTER, Math.max(MIN_REGISTER, (spec.register ?? 2) + preset.registerShift));
    const events = buildScore(preset.density[role], steps, spec.hold, LOOP_BARS);
    return { spec, register, events, density: preset.density[role] };
  });

  const chunkSeconds = (bars: number): number => (bars * 4 * 60) / preset.tempo;

  // Tone context manages timing, scheduling, start/stop
  const context = Tone.getContext().rawContext as AudioContext;
  let stopped = false;
  let filling = false;
  let nextTime = context.currentTime + 0.2;
  const active = new Set<AudioBufferSourceNode>();

  // render `bars` bars plus tail offline with a fresh random score
  const renderChunk = (): Promise<AudioBuffer> =>
    // Tone.Offline spins up an audio context with no speaker
    Tone.Offline(async ({ transport }) => {
      // Construction is opposite of actual flow
      // Actual flow: voices > reverb send > master bus > speakers
      const master = masterBus();
      const send = await reverbBus(master, preset.reverbDecay, preset.reverbWet);
      for (const voice of score) {
        const synth = buildVoice(voice.spec, master, send)[0];
        buildPart(voice.spec, synth, voice.events, mode, voice.register, preset.tempo, chunkSeconds(LOOP_BARS));
      }
      transport.bpm.value = preset.tempo;
      transport.start(); // puts the synth sounds into the chunk
    }, chunkSeconds(LOOP_BARS) + TAIL)
      // After callback resolves, return the finished buffer
      .then((buffer): AudioBuffer => finalize(buffer.get() as AudioBuffer));

  // keep one chunk queued ahead; tails overlap for a seamless seam
  let firstChunk = true;
  const fill = async (): Promise<void> => {
    if (filling) return;
    filling = true;
    while (!stopped && nextTime < context.currentTime + chunkSeconds(LOOP_BARS)) {
      if (!firstChunk) for (const voice of score) slip(voice.spec.hold, voice.events, steps, voice.density);
      const buffer = await renderChunk(); // renders the chunk when the callback resolves
      if (stopped) break; // If audio was stopped during rendering, quit
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      if (nextTime < context.currentTime) nextTime = context.currentTime + 0.05;
      source.start(nextTime);
      nextTime += chunkSeconds(LOOP_BARS);
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
  };
};

/** name the instrument-set, mode, and preset a seed plays. */
const describeSky = (seed: Seed): { set: string; mode: string; preset: string; } => {
  // mirrors playSky's first three picks; keep this order.
  const random = createSeededRandom(deriveSeed(seed, "music"));
  const set = pickSet(seed);
  const preset = pick(random, PRESET_NAMES);
  const mode = pick(random, MODE_NAMES);
  return { set, mode, preset };
};

export {
  LOOP_BARS,
  MIN_REGISTER,
  MAX_REGISTER,
  TAIL,
  masterBus,
  reverbBus,
  buildVoice,
  buildScore,
  slip,
  buildPart,
  finalize,
  describeSky,
  playSky,
};
