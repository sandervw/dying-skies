/** turns a seed into audio: scoring, scheduling, rendering, encoding. */

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
  const offsets = MODES[score.mode];
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

const HEADER_BYTES = 44;
const BYTES_PER_SAMPLE = 2;

const writeAscii = (view: DataView, offset: number, text: string): void => {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index));
  }
};

/** encode an AudioBuffer as a 16-bit PCM WAV blob url, scaling every sample. */
const encodeWavUrl = (buffer: AudioBuffer, scale: number): string => {
  const channelCount = buffer.numberOfChannels;
  const blockAlign = channelCount * BYTES_PER_SAMPLE;
  const dataSize = buffer.length * blockAlign;
  const view = new DataView(new ArrayBuffer(HEADER_BYTES + dataSize));
  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataSize, true);
  const channels = Array.from(
    { length: channelCount },
    (_unused, channel): Float32Array => buffer.getChannelData(channel),
  );
  let offset = HEADER_BYTES;
  for (let frame = 0; frame < buffer.length; frame += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channels[channel][frame] * scale));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += BYTES_PER_SAMPLE;
    }
  }
  return URL.createObjectURL(new Blob([view.buffer], { type: "audio/wav" }));
};

const TARGET_RMS = 0.06;
const TARGET_PEAK = 0.7;
const HIGHPASS_HZ = 35;
const LIMITER_THRESHOLD_DB = -3;
const TAIL_MARGIN_SECONDS = 2;
const SAMPLE_RATE = 44100;
const CHANNEL_COUNT = 2;
const impulses = new Map<number, Tone.ToneAudioBuffer>();
const gains = new Map<number, number>();

/** one rendered chunk: a wav blob url plus its music length. */
interface RenderedChunk {
  readonly url: string;
  readonly musicSeconds: number;
}

// decay reaches silence before release fires; release is inert.
const shapeVoice = (voice: Record<string, unknown>, holdSeconds: number): Record<string, unknown> => {
  const envelope = (voice.envelope ?? {}) as { attack?: number };
  const attack = envelope.attack ?? 0;
  return {
    ...voice,
    envelope: { ...envelope, decay: Math.max(0.01, holdSeconds - attack), sustain: 0, decayCurve: "linear", release: 0.01 },
  };
};

/** shape the one voice, or both voices of a DuoSynth. */
const shapeOptions = (options: object, holdSeconds: number): object => {
  const record = options as Record<string, unknown>;
  return record.voice0 === undefined
    ? shapeVoice(record, holdSeconds)
    : {
        ...record,
        voice0: shapeVoice(record.voice0 as Record<string, unknown>, holdSeconds),
        voice1: shapeVoice(record.voice1 as Record<string, unknown>, holdSeconds),
      };
};

// one voice, optional filter, then effects; returns the synth and chain end.
const buildInstrument = (spec: InstrumentSpec, holdSeconds: number): [Tone.ToneAudioNode, Tone.ToneAudioNode] => {
  const options = shapeOptions(spec.options, holdSeconds);
  const synth =
    spec.polyphony === undefined
      ? new spec.synth(options)
      : new Tone.PolySynth({ maxPolyphony: spec.polyphony, voice: spec.synth as never, options: options as never });
  const nodes: Tone.ToneAudioNode[] = spec.filter === undefined ? [] : [new Tone.Filter(spec.filter)];
  for (const [Effect, effectOptions] of spec.effects) {
    const effect = new Effect(effectOptions);
    effect.start?.();
    nodes.push(effect);
  }
  const output = nodes.reduce<Tone.ToneAudioNode>((previous, node) => {
    previous.connect(node);
    return node;
  }, synth);
  return [synth, output];
};

/** render one chunk of a score offline into a wav blob url, tail included. */
const renderChunk = async (score: Score, chunkIndex: number, visitSalt: number): Promise<RenderedChunk> => {
  const bars = chunkBars(score, chunkIndex);
  const musicSeconds = chunkSeconds(score, chunkIndex);
  const biome = BIOMES[score.biome];
  const specs = score.roles.map((role) => INSTRUMENT_SETS[score.instrumentSet][role]);
  const events = score.roles.map((role) => buildChunkEvents(role, score, chunkIndex, bars, visitSalt));
  // the last note's ring, then the reverb decaying after it.
  const ringEnd = Math.max(
    ...events.flat().map((event) => event.timeSeconds + event.holdSeconds),
  );
  const renderSeconds = Math.max(musicSeconds, ringEnd + biome.reverbDecay + TAIL_MARGIN_SECONDS);
  // cached: Tone.Reverb regenerates its impulse per chunk, nested inside our render.
  let impulse = impulses.get(biome.reverbDecay);
  if (impulse === undefined) {
    impulse = await Tone.Offline((): void => {
      new Tone.NoiseSynth({ envelope: { attack: 0.01, decay: biome.reverbDecay, sustain: 0 } }).toDestination().triggerAttack(0);
    }, biome.reverbDecay, CHANNEL_COUNT, SAMPLE_RATE);
    impulses.set(biome.reverbDecay, impulse);
  }
  const buffer = await Tone.Offline((): void => {
    const limiter = new Tone.Limiter(LIMITER_THRESHOLD_DB).toDestination();
    // sub-audible rumble only speakers choke on; nothing plays this low.
    const highpass = new Tone.Filter({ type: "highpass", frequency: HIGHPASS_HZ, rolloff: -24 }).connect(limiter);
    const bus = new Tone.Gain().connect(highpass);
    const reverb = new Tone.Convolver({ url: impulse });
    reverb.connect(new Tone.Gain(biome.reverbWet).connect(bus));
    specs.forEach((spec, index): void => {
      const [synth, output] = buildInstrument(spec, events[index][0].holdSeconds);
      output.connect(new Tone.Gain(spec.gain).connect(bus));
      output.connect(new Tone.Gain(spec.send).connect(reverb));
      for (const event of events[index]) {
        if (synth instanceof Tone.NoiseSynth) {
          synth.triggerAttackRelease(event.holdSeconds, event.timeSeconds);
        } else {
          (synth as Tone.PolySynth).triggerAttackRelease(event.frequency, event.holdSeconds, event.timeSeconds);
        }
      }
    });
  }, renderSeconds, CHANNEL_COUNT, SAMPLE_RATE);
  const raw = buffer.get();
  if (raw === undefined) {
    throw new Error("offline render produced no buffer");
  }
  // his gain.json, measured here instead: average level per score, peak-clamped.
  let gain = gains.get(score.seed);
  if (gain === undefined) {
    const samples = raw.getChannelData(0);
    let sum = 0;
    let peak = 0;
    for (const sample of samples) {
      sum += sample * sample;
      peak = Math.max(peak, Math.abs(sample));
    }
    gain = Math.min(TARGET_PEAK / (peak || 1), TARGET_RMS / (Math.sqrt(sum / samples.length) || 1));
    gains.set(score.seed, gain);
  }
  return { url: encodeWavUrl(raw, gain), musicSeconds };
};

export { generateScore, renderChunk };
export type { RenderedChunk };
