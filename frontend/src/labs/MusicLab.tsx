import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactElement } from "react";
import * as Tone from "tone";
import { bakeScore, generateScore, scheduleChunk } from "../services/musicEngineService";
import { BIOMES, INSTRUMENT_SETS } from "../services/musicSoundService";
import type { Biome, InstrumentSetName, Mode, Role, Score } from "../types/music";

const MODES: readonly Mode[] = [
  "major-pentatonic",
  "minor-pentatonic",
  "dorian-pentatonic",
  "lydian-pentatonic",
  "whole-tone",
];
const BIOME_NAMES = Object.keys(BIOMES) as Biome[];
const SET_NAMES = Object.keys(INSTRUMENT_SETS) as InstrumentSetName[];
const ROLES: readonly Role[] = ["drone", "pad", "sparkle", "lead", "counter"];
const PITCH_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// one baked score plus the numbers the balance pass needs.
interface LabRender {
  readonly bakeMilliseconds: number;
  readonly musicSeconds: number;
  readonly gain: number;
  readonly voiceCount: number;
}

// throwaway inline styling; deliberately kept out of the shared stylesheet.
const styles: Record<string, CSSProperties> = {
  page: { display: "flex", minHeight: "100vh", background: "#0a0a0a", color: "#e6e6e6" },
  panel: { width: 300, padding: 16, boxSizing: "border-box", overflowY: "auto", height: "100vh" },
  title: { fontSize: 18, margin: "0 0 12px" },
  section: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#888", margin: "14px 0 6px" },
  label: { display: "flex", flexDirection: "column", fontSize: 12, marginBottom: 8, gap: 4 },
  select: { background: "#1c1c1c", color: "#e6e6e6", border: "1px solid #333", padding: "5px 6px" },
  check: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, marginBottom: 4 },
  buttonRow: { display: "flex", gap: 8, margin: "12px 0" },
  button: { flex: 1, padding: "6px 8px", cursor: "pointer", background: "#1c1c1c", color: "#e6e6e6", border: "1px solid #333" },
  code: { fontSize: 11, background: "#141414", padding: 8, whiteSpace: "pre-wrap", overflowX: "auto" },
  main: { flex: 1, padding: 24, overflow: "auto" },
  heading: { fontSize: 15, margin: "0 0 12px" },
  table: { fontSize: 12, borderCollapse: "collapse" },
  cell: { padding: "3px 14px 3px 0", color: "#bbb" },
  muted: { fontSize: 13, color: "#888" },
};

/** throwaway lab: audition any mode, biome, and instrument set combination. */
const MusicLab = (): ReactElement => {
  const [mode, setMode] = useState<Mode>("minor-pentatonic");
  const [biome, setBiome] = useState<Biome>("chamber");
  const [instrumentSet, setInstrumentSet] = useState<InstrumentSetName>("morrowind");
  const [rootPitchClass, setRootPitchClass] = useState<number>(0);
  const [roles, setRoles] = useState<readonly Role[]>(BIOMES.chamber.required);
  const [chunkIndex, setChunkIndex] = useState<number>(0);
  const [visitSalt, setVisitSalt] = useState<number>(1);
  const [seedInput, setSeedInput] = useState<string>("1234");
  const [playing, setPlaying] = useState<boolean>(false);
  const [result, setResult] = useState<LabRender | null>(null);
  const output = useRef<Tone.Gain | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  // a biome change resets the arrangement to every role it allows.
  useEffect((): void => {
    const config = BIOMES[biome];
    setRoles([...config.required, ...config.optional]);
  }, [biome]);

  const toggleRole = (role: Role): void => {
    setRoles((previous): readonly Role[] =>
      previous.includes(role) ? previous.filter((entry) => entry !== role) : [...previous, role],
    );
  };

  // bake the current controls and play one chunk of them live.
  const play = async (): Promise<void> => {
    if (roles.length === 0 || playing) {
      return;
    }
    setPlaying(true);
    setFailure(null);
    const score: Score = { seed: Number(seedInput) || 0, mode, rootPitchClass, biome, instrumentSet, roles };
    const startedAt = performance.now();
    try {
      await Tone.start();
      const baked = await bakeScore(score);
      output.current?.dispose();
      output.current = new Tone.Gain(baked.gain).toDestination();
      const musicSeconds = scheduleChunk(score, chunkIndex, visitSalt, baked, output.current, Tone.now() + 0.2);
      setResult({ bakeMilliseconds: Math.round(performance.now() - startedAt), musicSeconds, gain: baked.gain, voiceCount: baked.voices.length });
    } catch (error) {
      setFailure(error instanceof Error ? error.message : String(error));
    }
    setPlaying(false);
  };

  // pull mode, biome, set, root, and roles from a real seed.
  const loadFromSeed = (): void => {
    const score = generateScore(Number(seedInput) || 0);
    setMode(score.mode);
    setInstrumentSet(score.instrumentSet);
    setRootPitchClass(score.rootPitchClass);
    setBiome(score.biome);
    window.setTimeout((): void => setRoles(score.roles), 0);
  };

  const config = BIOMES[biome];

  return (
    <div style={styles.page}>
      <aside style={styles.panel}>
        <h1 style={styles.title}>Music Lab</h1>

        <h2 style={styles.section}>Axes</h2>
        <label style={styles.label}>
          <span>Mode</span>
          <select style={styles.select} value={mode} onChange={(event): void => setMode(event.target.value as Mode)}>
            {MODES.map((entry): ReactElement => <option key={entry} value={entry}>{entry}</option>)}
          </select>
        </label>
        <label style={styles.label}>
          <span>Instrument set</span>
          <select style={styles.select} value={instrumentSet} onChange={(event): void => setInstrumentSet(event.target.value as InstrumentSetName)}>
            {SET_NAMES.map((entry): ReactElement => <option key={entry} value={entry}>{entry}</option>)}
          </select>
        </label>
        <label style={styles.label}>
          <span>Biome</span>
          <select style={styles.select} value={biome} onChange={(event): void => setBiome(event.target.value as Biome)}>
            {BIOME_NAMES.map((entry): ReactElement => <option key={entry} value={entry}>{entry}</option>)}
          </select>
        </label>
        <label style={styles.label}>
          <span>Root: {PITCH_NAMES[rootPitchClass]}</span>
          <input type="range" min={0} max={11} step={1} value={rootPitchClass}
            onChange={(event): void => setRootPitchClass(Number(event.target.value))} />
        </label>

        <h2 style={styles.section}>Roles</h2>
        {ROLES.map((role): ReactElement => (
          <label key={role} style={styles.check}>
            <input type="checkbox" checked={roles.includes(role)} onChange={(): void => toggleRole(role)} />
            <span>
              {role}
              <span style={{ color: "#777" }}>
                {" "}
                {config.required.includes(role) ? "required" : config.optional.includes(role) ? "optional" : "off-biome"}
              </span>
            </span>
          </label>
        ))}

        <h2 style={styles.section}>Performance</h2>
        <label style={styles.label}>
          <span>Chunk index: {chunkIndex}</span>
          <input type="range" min={0} max={12} step={1} value={chunkIndex}
            onChange={(event): void => setChunkIndex(Number(event.target.value))} />
        </label>
        <label style={styles.label}>
          <span>Seed</span>
          <input style={styles.select} type="number" value={seedInput}
            onChange={(event): void => setSeedInput(event.target.value)} />
        </label>

        <div style={styles.buttonRow}>
          <button type="button" style={styles.button} disabled={playing || roles.length === 0} onClick={(): void => void play()}>
            {playing ? "Baking..." : "Play"}
          </button>
          <button type="button" style={styles.button} onClick={(): void => setVisitSalt((previous) => previous + 1)}>
            Reshuffle
          </button>
        </div>
        <div style={styles.buttonRow}>
          <button type="button" style={styles.button} onClick={loadFromSeed}>
            Load from seed
          </button>
          <button type="button" style={styles.button} onClick={(): void => void output.current?.dispose()}>
            Stop
          </button>
        </div>

        <pre style={styles.code}>
          {JSON.stringify({ mode, biome, instrumentSet, rootPitchClass, roles, chunkIndex, visitSalt }, null, 2)}
        </pre>
      </aside>

      <main style={styles.main}>
        <h2 style={styles.heading}>
          {instrumentSet} / {biome} / {mode} / {PITCH_NAMES[rootPitchClass]}
        </h2>
        {failure === null ? null : <p style={{ color: "#ff6b6b", fontSize: 13 }}>{failure}</p>}
        {roles.length === 0 ? <p style={styles.muted}>Pick at least one role.</p> : null}
        {result === null ? (
          <p style={styles.muted}>Press Play to hear this combination.</p>
        ) : (
          <table style={styles.table}>
            <tbody>
              <tr><td style={styles.cell}>bake time</td><td>{result.bakeMilliseconds} ms</td></tr>
              <tr><td style={styles.cell}>music</td><td>{result.musicSeconds.toFixed(1)} s</td></tr>
              <tr><td style={styles.cell}>voices</td><td>{result.voiceCount}</td></tr>
              <tr><td style={styles.cell}>master gain</td><td>{result.gain.toFixed(3)}</td></tr>
              <tr><td style={styles.cell}>tempo</td><td>{config.tempo} bpm</td></tr>
              <tr><td style={styles.cell}>reverb</td><td>{config.reverbDecay}s decay, {config.reverbWet} wet</td></tr>
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
};

export { MusicLab };
