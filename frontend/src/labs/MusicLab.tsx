/** Throwaway test page; musicService supplies the audio, this adds visuals. */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactElement } from "react";
import { INSTRUMENT_SETS } from "../utils/instrumentSets";
import { MODES } from "../utils/modes";
import { PRESETS } from "../utils/presets";
import { startPlayback } from "./musicLabPlayback";
import type { Playback } from "./musicLabPlayback";
import { drawFrame } from "./musicLabCanvas";

const SET_NAMES = Object.keys(INSTRUMENT_SETS);
const MODE_NAMES = Object.keys(MODES);
const PRESET_NAMES = Object.keys(PRESETS);

const styles: Record<string, CSSProperties> = {
  page: {
    display: "flex",
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#e6e6e6",
  },
  panel: {
    width: 280,
    padding: 16,
    boxSizing: "border-box",
    overflowY: "auto",
    height: "100vh",
    flexShrink: 0,
  },
  title: { fontSize: 18, margin: "0 0 12px" },
  section: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#888",
    margin: "14px 0 6px",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    fontSize: 12,
    marginBottom: 10,
    gap: 4,
  },
  select: {
    background: "#1c1c1c",
    color: "#e6e6e6",
    border: "1px solid #333",
    padding: 4,
    borderRadius: 2,
  },
  button: {
    padding: "8px 16px",
    cursor: "pointer",
    background: "#1c3466",
    color: "#e6e6e6",
    border: "1px solid #335",
    borderRadius: 2,
  },
  buttonDisabled: { opacity: 0.4 },
  main: {
    flex: 1,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    minWidth: 0,
  },
  info: { fontSize: 12, color: "#888", lineHeight: 1.6 },
  canvasWrap: {
    flex: 1,
    minHeight: 0,
    border: "1px solid #222",
    borderRadius: 4,
    overflow: "hidden",
    background: "#060608",
  },
  canvas: { display: "block", width: "100%", height: "100%" },
};

const pick = <T,>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)];

/** the Music Lab page: pick a set, preset, and mode, then listen. */
const MusicLab = (): ReactElement => {
  const [setName, setSetName] = useState<string>("lunacid");
  const [presetName, setPresetName] = useState<string>("cavern");
  const [modeName, setModeName] = useState<string>("majorPentatonic");
  const [playing, setPlaying] = useState(false);
  const [playback, setPlayback] = useState<Playback | null>(null);
  const canvasReference = useRef<HTMLCanvasElement>(null);

  useEffect((): (() => void) | void => {
    if (playback === null) return;
    const canvas = canvasReference.current;
    if (canvas === null) return;
    let frame = 0;
    const loop = (): void => {
      drawFrame(canvas, playback);
      frame = requestAnimationFrame(loop);
    };
    loop();
    return (): void => cancelAnimationFrame(frame);
  }, [playback]);

  const handlePlay = async (): Promise<void> => {
    playback?.stop();
    setPlayback(await startPlayback(setName, presetName, modeName));
    setPlaying(true);
  };

  const handleStop = (): void => {
    playback?.stop();
    setPlayback(null);
    setPlaying(false);
  };

  const handleRandom = (): void => {
    setSetName(pick(SET_NAMES));
    setPresetName(pick(PRESET_NAMES));
    setModeName(pick(MODE_NAMES));
  };

  return (
    <div style={styles.page}>
      <aside style={styles.panel}>
        <h1 style={styles.title}>Music Lab</h1>

        <h2 style={styles.section}>Instrument Set</h2>
        <label style={styles.label}>
          <select
            style={styles.select}
            value={setName}
            onChange={(event) => setSetName(event.target.value)}
          >
            {SET_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <h2 style={styles.section}>Preset</h2>
        <label style={styles.label}>
          <select
            style={styles.select}
            value={presetName}
            onChange={(event) => setPresetName(event.target.value)}
          >
            {PRESET_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <h2 style={styles.section}>Mode</h2>
        <label style={styles.label}>
          <select
            style={styles.select}
            value={modeName}
            onChange={(event) => setModeName(event.target.value)}
          >
            {MODE_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginTop: 16,
          }}
        >
          <button
            type="button"
            style={styles.button}
            onClick={() => {
              void handlePlay();
            }}
          >
            Play
          </button>
          <button
            type="button"
            style={{
              ...styles.button,
              ...(playing ? {} : styles.buttonDisabled),
            }}
            onClick={handleStop}
            disabled={!playing}
          >
            Stop
          </button>
          <button
            type="button"
            style={{
              ...styles.button,
              background: "#1c1c1c",
              border: "1px solid #333",
            }}
            onClick={handleRandom}
          >
            Randomise
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.info}>
          <strong>{setName}</strong> + <strong>{presetName}</strong> +{" "}
          <strong>{modeName}</strong>
          {" — "}tempo {PRESETS[presetName].tempo}bpm, register shift{" "}
          {PRESETS[presetName].registerShift > 0 ? "+" : ""}
          {PRESETS[presetName].registerShift}
          {" — "}
          {playing ? "looping" : "stopped"}
        </div>
        <div style={styles.canvasWrap}>
          <canvas ref={canvasReference} style={styles.canvas} />
        </div>
      </main>
    </div>
  );
};

export { MusicLab };
