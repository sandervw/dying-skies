import { useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, ReactElement } from "react";
import * as Tone from "tone";
import { generateScore, DEFAULT_RANGES } from "../services/musicService";
import type { ScoreRanges } from "../services/musicService";
import { buildLayer, disposeLayer } from "../hooks/useSkyMusic";
import type { Score } from "../types/music";

const GRID_SEEDS = 8;

interface KnobDescriptor {
  readonly key: keyof ScoreRanges;
  readonly label: string;
  readonly section: string;
  readonly minimum: number;
  readonly maximum: number;
  readonly step: number;
}

const KNOBS: readonly KnobDescriptor[] = [
  { key: "tempoMinimum", label: "Tempo min", section: "Tempo", minimum: 30, maximum: 120, step: 1 },
  { key: "tempoMaximum", label: "Tempo max", section: "Tempo", minimum: 30, maximum: 120, step: 1 },
  { key: "layerCountMinimum", label: "Layer count min", section: "Layers", minimum: 1, maximum: 5, step: 1 },
  { key: "layerCountMaximum", label: "Layer count max", section: "Layers", minimum: 1, maximum: 5, step: 1 },
  { key: "reverbWetMinimum", label: "Reverb wet min", section: "Reverb", minimum: 0, maximum: 1, step: 0.05 },
  { key: "reverbWetMaximum", label: "Reverb wet max", section: "Reverb", minimum: 0, maximum: 1, step: 0.05 },
  { key: "reverbDecayMinimum", label: "Reverb decay min", section: "Reverb", minimum: 1, maximum: 12, step: 0.5 },
  { key: "reverbDecayMaximum", label: "Reverb decay max", section: "Reverb", minimum: 1, maximum: 12, step: 0.5 },
];

// build a fresh graph for one score, matching app playback; returns a stop function.
const startScore = (score: Score): () => void => {
  const reverb = new Tone.Reverb({ decay: score.reverbDecay, wet: score.reverbWet }).toDestination();
  const group = new Tone.Gain(1).connect(reverb);
  const nodes = score.layers.map((layer) => buildLayer(layer, score, group));
  Tone.getTransport().bpm.value = score.tempo;
  void Tone.start();
  Tone.getTransport().start();
  return (): void => { nodes.forEach(disposeLayer); group.dispose(); reverb.dispose(); };
};

// throwaway inline styling, kept out of the shared stylesheet.
const styles: Record<string, CSSProperties> = {
  page: { display: "flex", minHeight: "100vh", background: "#0a0a0a", color: "#e6e6e6" },
  panel: { width: 280, padding: 16, boxSizing: "border-box", overflowY: "auto", height: "100vh" },
  title: { fontSize: 18, margin: "0 0 12px" },
  section: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#888", margin: "14px 0 6px" },
  label: { display: "flex", flexDirection: "column", fontSize: 12, marginBottom: 8, gap: 4 },
  button: { padding: "6px 8px", cursor: "pointer", background: "#1c1c1c", color: "#e6e6e6", border: "1px solid #333" },
  main: { flex: 1, padding: 16, overflow: "auto", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 },
  card: { border: "1px solid #222", padding: 10, borderRadius: 4 },
  head: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  code: { fontSize: 10, background: "#141414", padding: 8, whiteSpace: "pre-wrap", overflowX: "auto", margin: 0 },
};

/** throwaway lab: audition seed-derived scores while tuning generation ranges. */
const MusicLab = (): ReactElement => {
  const [ranges, setRanges] = useState<ScoreRanges>(DEFAULT_RANGES);
  const [playing, setPlaying] = useState<number | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const stopCurrent = (): void => {
    stopRef.current?.();
    stopRef.current = null;
    setPlaying(null);
  };

  const toggle = (index: number, score: Score): void => {
    stopCurrent();
    if (playing !== index) {
      stopRef.current = startScore(score);
      setPlaying(index);
    }
  };

  const updateKnob =
    (key: keyof ScoreRanges) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      const value = Number(event.target.value);
      setRanges((previous): ScoreRanges => ({ ...previous, [key]: value }));
    };

  const scores = Array.from({ length: GRID_SEEDS }, (_unused, index) =>
    generateScore(index * 2654435761 + 1, ranges),
  );

  return (
    <div style={styles.page}>
      <aside style={styles.panel}>
        <h1 style={styles.title}>Music Lab</h1>
        {KNOBS.map((knob, index): ReactElement => (
          <div key={knob.key}>
            {index === 0 || KNOBS[index - 1].section !== knob.section ? (
              <h2 style={styles.section}>{knob.section}</h2>
            ) : null}
            <label style={styles.label}>
              <span>{knob.label}: {ranges[knob.key]}</span>
              <input
                type="range"
                min={knob.minimum}
                max={knob.maximum}
                step={knob.step}
                value={ranges[knob.key]}
                onChange={updateKnob(knob.key)}
              />
            </label>
          </div>
        ))}
        <button type="button" style={styles.button} onClick={(): void => setRanges(DEFAULT_RANGES)}>
          Reset
        </button>
      </aside>
      <main style={styles.main}>
        {scores.map((score, index): ReactElement => (
          <div key={index} style={styles.card}>
            <div style={styles.head}>
              <span>{score.biome} / {score.mode}</span>
              <button type="button" style={styles.button} onClick={(): void => toggle(index, score)}>
                {playing === index ? "Stop" : "Play"}
              </button>
            </div>
            <pre style={styles.code}>{JSON.stringify(score, null, 2)}</pre>
          </div>
        ))}
      </main>
    </div>
  );
};

export { MusicLab };
