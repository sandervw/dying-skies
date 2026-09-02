import * as Tone from "tone";
import { encodeWavUrl } from "./audioEncodeService";
import { INSTRUMENT_SETS } from "./instrumentSets";
import { BIOMES, buildChunkEvents, chunkBars, chunkSeconds } from "./musicService";
import type { InstrumentSpec, Score } from "../types/music";

const MASTER_VOLUME = 0.25;
const HIGHPASS_HZ = 35;
const LIMITER_THRESHOLD_DB = -1;
const TAIL_MARGIN_SECONDS = 2;
const SAMPLE_RATE = 22050;
const CHANNEL_COUNT = 2;

/** one rendered chunk: a wav blob url plus its music length. */
interface RenderedChunk {
  readonly url: string;
  readonly musicSeconds: number;
}

// sustain zero over a linear decay: the note reaches silence on its own,
// so the release fires on an already-zero envelope and schedules nothing.
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
  const buffer = await Tone.Offline(async (): Promise<void> => {
    const limiter = new Tone.Limiter(LIMITER_THRESHOLD_DB).toDestination();
    // sub-audible rumble only speakers choke on; nothing plays this low.
    const highpass = new Tone.Filter({ type: "highpass", frequency: HIGHPASS_HZ, rolloff: -24 }).connect(limiter);
    const bus = new Tone.Gain(MASTER_VOLUME).connect(highpass);
    const reverb = new Tone.Reverb({ decay: biome.reverbDecay, wet: 1 });
    await reverb.ready;
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
  return { url: encodeWavUrl(raw), musicSeconds };
};

export { renderChunk };
export type { RenderedChunk };
