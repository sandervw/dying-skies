import { useEffect } from "react";
import * as Tone from "tone";
import { INSTRUMENT_SETS } from "../utils/instrumentSets";
import { createSeededRandom, deriveSeed } from "../services/randomService";
import type { InstrumentSetName, InstrumentSpec, Role } from "../types/music";
import { useSkySeed } from "./useSkySeed";

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

// the instrument set this sky plays.
const pickInstrumentSet = (seed: Parameters<typeof deriveSeed>[0]): InstrumentSetName =>
  SET_NAMES[Math.floor(createSeededRandom(deriveSeed(seed, "music"))() * SET_NAMES.length)];

// synth, optional filter, effects, level; last node feeds the output.
const buildVoice = (spec: InstrumentSpec): Tone.ToneAudioNode[] => {
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
  nodes.reduce((previous, node): Tone.ToneAudioNode => {
    previous.connect(node);
    return node;
  }).toDestination();
  return nodes;
};

// loop the static score on one instrument set.
const playInstrumentSet = (name: InstrumentSetName): { stop: () => void; } => {
  const nodes: Tone.ToneAudioNode[] = [];
  const parts: Tone.Part[] = [];

  for (const role of Object.keys(SCORE) as Role[]) {
    const spec = INSTRUMENT_SETS[name][role];
    const voice = buildVoice(spec);
    const synth = voice[0];
    const seconds = (spec.hold * 60) / TEMPO;
    const part = new Tone.Part((time, step: number): void => {
      if (synth instanceof Tone.NoiseSynth) {
        // for Pink Noise (noise = no pitch = no note argument); kingsfield/deusex/zommbinis counters
        synth.triggerAttackRelease(seconds, time);
      } else {
        // `register` gets the C key of a given register; `scale` adds semitones; converted to frequency
        const note = Tone.Frequency(`C${spec.register}`).transpose(SCALE[step]).toFrequency();
        (synth as Tone.PolySynth).triggerAttackRelease(note, seconds, time);
      }
    }, SCORE[role].map(([bar, beat, step]): [string, number] => [`${bar}:${beat}:0`, step]));
    part.loop = true;
    part.loopEnd = `${LOOP_BARS}m`;
    part.start(0);
    parts.push(part);
    nodes.push(...voice);
  }

  const transport = Tone.getTransport();
  // rest and start
  transport.stop();
  transport.position = 0;
  transport.bpm.value = TEMPO;
  transport.start();

  // tear down parts, nodes, and transport.
  const stop = (): void => {
    for (const part of parts) {
      part.dispose();
    }
    for (const node of nodes) {
      node.dispose();
    }
    transport.stop();
  };

  return { stop };
};

/** play the current sky's instrument set on a loop. */
const useSkyMusic = (muted: boolean): void => {
  const { seed } = useSkySeed();

  // the context stays suspended until a gesture; every click retries it.
  useEffect((): (() => void) => {
    const unlock = (): void => {
      void Tone.start();
    };
    window.addEventListener("pointerdown", unlock);
    return (): void => {
      window.removeEventListener("pointerdown", unlock);
    };
  }, []);

  // the play effect; runs after render, or when `seed` or `muted` changes
  useEffect((): (() => void) | undefined => {
    if (muted) {
      return undefined;
    }
    const { stop } = playInstrumentSet(pickInstrumentSet(seed));
    return stop;
  }, [seed, muted]);
};

export { useSkyMusic };
