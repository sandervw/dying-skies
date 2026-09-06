import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { INSTRUMENT_SETS } from "../utils/instrumentSets";
import { createSeededRandom, deriveSeed } from "../services/randomService";
import type { InstrumentSetName, InstrumentSpec, Role } from "../types/music";
import { useSkySeed } from "./useSkySeed";

const TEMPO = 56;
const LOOP_BARS = 8;
const FADE_SECONDS = 2;

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
const buildVoice = (spec: InstrumentSpec, output: Tone.ToneAudioNode): Tone.ToneAudioNode[] => {
  const synth = spec.polyphony === undefined
    ? new spec.synth(spec.options)
    : new Tone.PolySynth({ maxPolyphony: spec.polyphony, voice: spec.synth as never, options: spec.options as never });
  const nodes: Tone.ToneAudioNode[] = [synth];
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
  }).connect(output);
  return nodes;
};

// loop the static score on one instrument set.
const playInstrumentSet = (name: InstrumentSetName): { fade: Tone.Gain; stop: () => void; } => {
  const limiter = new Tone.Limiter(-1).toDestination();
  const fade = new Tone.Gain(0).connect(limiter);
  const nodes: Tone.ToneAudioNode[] = [limiter, fade];
  const parts: Tone.Part[] = [];

  for (const role of Object.keys(SCORE) as Role[]) {
    const spec = INSTRUMENT_SETS[name][role];
    const voice = buildVoice(spec, fade);
    const synth = voice[0];
    const seconds = (spec.hold * 60) / TEMPO;
    const part = new Tone.Part((time, step: number): void => {
      const midi = (spec.register + 1) * 12 + SCALE[step];
      if (synth instanceof Tone.NoiseSynth) {
        synth.triggerAttackRelease(seconds, time);
      } else {
        (synth as Tone.PolySynth).triggerAttackRelease(440 * Math.pow(2, (midi - 69) / 12), seconds, time);
      }
    }, SCORE[role].map(([bar, beat, step]): [string, number] => [`${bar}:${beat}:0`, step]));
    part.loop = true;
    part.loopEnd = `${LOOP_BARS}m`;
    part.start(0);
    parts.push(part);
    nodes.push(...voice);
  }

  const transport = Tone.getTransport();
  transport.stop();
  transport.position = 0;
  transport.bpm.value = TEMPO;
  transport.start();

  // dispose past the fade; the ramp still needs the graph.
  const stop = (): void => {
    fade.gain.rampTo(0, FADE_SECONDS);
    window.setTimeout((): void => {
      transport.stop();
      for (const part of parts) {
        part.dispose();
      }
      for (const node of nodes) {
        node.dispose();
      }
    }, (FADE_SECONDS + 0.5) * 1000);
  };
  return { fade, stop };
};

/** play the current sky's instrument set on a loop. */
const useSkyMusic = (muted: boolean): void => {
  const { seed } = useSkySeed();
  const mutedRef = useRef(muted);
  const fadeRef = useRef<Tone.Gain | null>(null);

  useEffect((): void => {
    mutedRef.current = muted;
    fadeRef.current?.gain.rampTo(muted ? 0 : 1, FADE_SECONDS);
  }, [muted]);

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

  useEffect((): (() => void) => {
    const { fade, stop } = playInstrumentSet(pickInstrumentSet(seed));
    fadeRef.current = fade;
    fade.gain.rampTo(mutedRef.current ? 0 : 1, FADE_SECONDS);
    return (): void => {
      fadeRef.current = null;
      stop();
    };
  }, [seed]);
};

export { useSkyMusic };
