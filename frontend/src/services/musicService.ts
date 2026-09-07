import * as Tone from "tone";
import { INSTRUMENT_SETS } from "../utils/instrumentSets";
import { createSeededRandom, deriveSeed } from "./randomService";
import type { Seed } from "./randomService";
import type { InstrumentSetName, InstrumentSpec, Role } from "../types/music";

const TEMPO = 56;
const LOOP_BARS = 8;

/** semitones above the root for each scale step. */
const SCALE = [0, 3, 5, 7, 10, 12];

/** the static score: bar, beat, and scale step per role. */
const SCORE: Record<Role, readonly (readonly [number, number, number])[]> = {
  drone: [[0, 0, 0], [4, 0, 0]],
  pad: [[0, 0, 2], [2, 0, 4], [4, 0, 1], [6, 0, 3]],
  sparkle: [[0, 2, 3], [1, 0, 4], [2, 2, 5], [3, 0, 2], [4, 2, 4], [5, 0, 3], [6, 2, 5], [7, 0, 1]],
  lead: [[1, 0, 2], [3, 2, 4], [5, 0, 1], [7, 0, 3]],
  counter: [[2, 1, 0], [6, 1, 2]],
};

const SET_NAMES = Object.keys(INSTRUMENT_SETS) as InstrumentSetName[];

// wire nodes in order; the last one feeds the output.
const chainInto = (nodes: Tone.ToneAudioNode[], output: Tone.ToneAudioNode): void => {
  nodes.reduce((previous, node): Tone.ToneAudioNode => {
    previous.connect(node);
    return node;
  }).connect(output);
};

// the shared final gate: space, then glue, then ceiling.
const buildMaster = (): Tone.ToneAudioNode[] => {
  const nodes = [
    new Tone.Gain(0.8),
    new Tone.Filter({ type: "lowpass", frequency: 11000, rolloff: -12 }),
    new Tone.Reverb({ decay: 6.0, preDelay: 0.04, wet: 0.35 }),
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

// one looping part per role, scored against the set's voices.
const buildPart = (spec: InstrumentSpec, role: Role, synth: Tone.ToneAudioNode): Tone.Part => {
  const seconds = (spec.hold * 60) / TEMPO;
  const part = new Tone.Part((time, step: number): void => {
    if (synth instanceof Tone.NoiseSynth) {
      // pink noise has no pitch, so no note argument
      synth.triggerAttackRelease(seconds, time);
    } else {
      // the register's C, raised by the scale step
      const note = Tone.Frequency(`C${spec.register}`).transpose(SCALE[step]).toFrequency();
      (synth as Tone.PolySynth).triggerAttackRelease(note, seconds, time);
    }
  }, SCORE[role].map(([bar, beat, step]): [string, number] => [`${bar}:${beat}:0`, step]));
  part.loop = true;
  part.loopEnd = `${LOOP_BARS}m`;
  part.start(0);
  return part;
};

/** loop this sky's instrument set; the returned call tears it down. */
const playSky = (seed: Seed): (() => void) => {
  const random = createSeededRandom(deriveSeed(seed, "music"));
  const set = INSTRUMENT_SETS[SET_NAMES[Math.floor(random() * SET_NAMES.length)]];
  const master = buildMaster();
  const nodes: Tone.ToneAudioNode[] = [...master];
  const parts: Tone.Part[] = [];

  for (const role of Object.keys(SCORE) as Role[]) {
    const voice = buildVoice(set[role], master[0]);
    parts.push(buildPart(set[role], role, voice[0]));
    nodes.push(...voice);
  }

  const transport = Tone.getTransport();
  // reset and start
  transport.stop();
  transport.position = 0;
  transport.bpm.value = TEMPO;
  transport.start();

  return (): void => {
    for (const part of parts) {
      part.dispose();
    }
    for (const node of nodes) {
      node.dispose();
    }
    transport.stop();
  };
};

export { playSky };
