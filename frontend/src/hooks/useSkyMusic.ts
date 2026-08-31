import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { deriveSeed } from "../services/randomService";
import { generateScore, midiToFrequency, MODE_OFFSETS } from "../services/musicService";
import { useSkySeed } from "./useSkySeed";
import type { Layer, Score } from "../types/music";

const FADE_SECONDS = 2;
const BEATS_PER_BAR = 4;

interface MusicEvent {
  readonly time: string;
  readonly frequency: number;
  readonly duration: string;
}

interface LayerNodes {
  readonly synth: Tone.PolySynth;
  readonly filter: Tone.Filter;
  readonly part: Tone.Part<MusicEvent>;
}

// note hold time per archetype; envelopes add the tail.
const holdFor = (layer: Layer): string =>
  layer.archetype === "drone" ? "2m" : layer.archetype === "pad" ? "1m" : layer.archetype === "bell" ? "2n" : "4n";

// scatter in-mode notes across the layer's prime-length loop, fresh each session.
const buildEvents = (layer: Layer, score: Score): MusicEvent[] => {
  const offsets = MODE_OFFSETS[score.mode];
  const count = Math.max(1, Math.round(layer.density * layer.loopLengthBars));
  const duration = holdFor(layer);
  const events: MusicEvent[] = [];
  for (let index = 0; index < count; index += 1) {
    const bar = Math.floor(Math.random() * layer.loopLengthBars);
    const beat = Math.floor(Math.random() * BEATS_PER_BAR);
    const degree = offsets[Math.floor(Math.random() * offsets.length)];
    const midi = (layer.octave + 1) * 12 + score.rootPitchClass + degree;
    events.push({ time: `${bar}:${beat}:0`, frequency: midiToFrequency(midi), duration });
  }
  return events;
};

/** build one layer's synth, filter, and looping part into the group. */
const buildLayer = (layer: Layer, score: Score, group: Tone.Gain): LayerNodes => {
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: layer.oscillator },
    envelope: { attack: layer.attack, decay: layer.decay, sustain: layer.sustain, release: layer.release },
  });
  const filter = new Tone.Filter(layer.cutoff, "lowpass");
  synth.connect(filter);
  filter.connect(group);
  const part = new Tone.Part<MusicEvent>((time, value) => {
    synth.triggerAttackRelease(value.frequency, value.duration, time);
  }, buildEvents(layer, score));
  part.loop = true;
  part.loopEnd = `${layer.loopLengthBars}m`;
  part.start(0);
  return { synth, filter, part };
};

/** stop and dispose one layer's Tone nodes. */
const disposeLayer = (nodes: LayerNodes): void => {
  nodes.part.stop();
  nodes.part.dispose();
  nodes.synth.dispose();
  nodes.filter.dispose();
};

/** build and play the seed's score on a shared master, honoring the mute toggle. */
const useSkyMusic = (muted: boolean): void => {
  const { seed } = useSkySeed();
  const masterRef = useRef<Tone.Gain | null>(null);

  useEffect((): (() => void) => {
    const master = new Tone.Gain(0);
    master.connect(Tone.getDestination());
    masterRef.current = master;
    Tone.getTransport().start();
    const resume = (): void => { void Tone.start(); };
    window.addEventListener("pointerdown", resume, { once: true });
    return (): void => {
      window.removeEventListener("pointerdown", resume);
      master.dispose();
      masterRef.current = null;
    };
  }, []);

  useEffect((): (() => void) => {
    const master = masterRef.current;
    if (master === null) {
      return (): void => {};
    }
    const score = generateScore(deriveSeed(seed, "music"));
    Tone.getTransport().bpm.value = score.tempo;
    const reverb = new Tone.Reverb({ decay: score.reverbDecay, wet: score.reverbWet });
    const group = new Tone.Gain(0);
    group.connect(reverb);
    reverb.connect(master);
    group.gain.rampTo(1, FADE_SECONDS);
    const layers = score.layers.map((layer) => buildLayer(layer, score, group));
    return (): void => {
      group.gain.rampTo(0, FADE_SECONDS);
      window.setTimeout((): void => {
        layers.forEach(disposeLayer);
        group.dispose();
        reverb.dispose();
      }, FADE_SECONDS * 1000 + 300);
    };
  }, [seed]);

  useEffect((): void => {
    masterRef.current?.gain.rampTo(muted ? 0 : 1, FADE_SECONDS);
  }, [muted]);
};

export { useSkyMusic, buildLayer, disposeLayer };
