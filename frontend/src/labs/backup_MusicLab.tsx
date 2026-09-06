import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import * as Tone from "tone";

// throwaway sound test: morrowind + scatter + minor-pentatonic drone, layer by layer.
const QUIET_DECIBELS = -12;

// Basic A1 Synth
const buildSimpleDrone = (): Tone.Synth =>
  new Tone.Synth({
    oscillator: { type: "triangle" },
    volume: QUIET_DECIBELS,
  });

// Basic A1 *MonoSynth*
const buildDrone = (): Tone.MonoSynth =>
  new Tone.MonoSynth({
    oscillator: { type: "triangle", volume: QUIET_DECIBELS },
  });

// MonoSynth with a filter envelop
const buildParkedDrone = (): Tone.MonoSynth =>
  new Tone.MonoSynth({
    oscillator: { type: "triangle", volume: QUIET_DECIBELS },
    filterEnvelope: { baseFrequency: 20000 },
  });

const MusicLab = (): ReactElement => {
  const [playing, setPlaying] = useState<string | null>(null);
  const [info, setInfo] = useState<string>("");
  const nodes = useRef<Tone.ToneAudioNode[]>([]);

  const readContext = (): void => {
    const context = Tone.getContext();
    setInfo(
      `state: ${context.state}\nsampleRate: ${context.sampleRate}\nlookAhead: ${context.lookAhead}`,
    );
  };

  useEffect(readContext, []);

  const stop = (): void => {
    const dying = nodes.current;
    nodes.current = [];
    setPlaying(null);
    for (const node of dying) {
      if (node instanceof Tone.Synth || node instanceof Tone.MonoSynth) {
        node.triggerRelease();
      }
    }
    window.setTimeout((): void => {
      for (const node of dying) {
        node.dispose();
      }
    }, 3000);
  };

  // known-good reference: plain synth, quiet, straight out.
  const playControl = async (): Promise<void> => {
    stop();
    await Tone.start();
    const synth = buildSimpleDrone().toDestination();
    synth.triggerAttack("A1");
    nodes.current = [synth];
    setPlaying("1. control: plain synth A1");
    readContext();
  };

  // the monosynth version.
  const playVoice = async (): Promise<void> => {
    stop();
    await Tone.start();
    const synth = buildDrone().toDestination();
    synth.triggerAttack("A1");
    nodes.current = [synth];
    setPlaying("2. Monosynth A1");
    readContext();
  };

  // same monosynth, internal filter no longer moving.
  const playParked = async (): Promise<void> => {
    stop();
    await Tone.start();
    const synth = buildParkedDrone().toDestination();
    synth.triggerAttack("A1");
    nodes.current = [synth];
    setPlaying("3. Monosynth A1, filter parked");
    readContext();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#e6e6e6",
        padding: 32,
        fontSize: 14,
      }}
    >
      <h1 style={{ fontSize: 18 }}>Sound isolation test</h1>
      <p style={{ color: "#888", maxWidth: 560 }}>
        No engine. Each button adds one layer of the drone voice. The first one
        that pops names the culprit.
      </p>
      <div
        style={{ display: "flex", gap: 8, margin: "16px 0", flexWrap: "wrap" }}
      >
        <button type="button" onClick={(): void => void playControl()}>
          1. Control synth A1
        </button>
        <button type="button" onClick={(): void => void playVoice()}>
          2. Drone voice, quiet
        </button>
        <button type="button" onClick={(): void => void playParked()}>
          3. Monosynth, filter parked
        </button>
        <button type="button" onClick={stop}>
          Stop
        </button>
      </div>
      <p>playing: {playing ?? "nothing"}</p>
      <pre style={{ fontSize: 12, background: "#141414", padding: 8 }}>
        {info}
      </pre>
    </div>
  );
};

export { MusicLab };
