/**
 * A Throwaway file for testing; may break code style/conventions
 * Audio engine is imported from musicService.ts; this adds visuals.
 */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactElement } from "react";
import * as Tone from "tone";
import { INSTRUMENT_SETS } from "../utils/instrumentSets";
import { MODES } from "../utils/modes";
import { PRESETS } from "../utils/presets";
import {
  LOOP_BARS,
  MIN_REGISTER,
  MAX_REGISTER,
  TAIL,
  masterBus,
  reverbBus,
  buildVoice,
  buildScore,
  slip,
  buildPart,
  finalize,
} from "../services/musicService";
import type { InstrumentSpec, Role } from "../types/music";

const BEATS_PER_BAR = 4;

const SET_NAMES = Object.keys(INSTRUMENT_SETS);
const MODE_NAMES = Object.keys(MODES);
const PRESET_NAMES = Object.keys(PRESETS);

// one distinct colour per instrument slot, reused by audio + visuals.
const ROLE_COLORS: Record<Role, string> = {
  bass: "#5b6cff",
  harmony: "#39c8a0",
  accent: "#ffd24a",
  lead: "#ff6b4a",
  counter: "#e05bff",
};

// one drawable note: time, length, volume, pitch.
interface VizNote {
  role: Role;
  color: string;
  timeSec: number;
  durSec: number;
  midi: number | null;
  gain: number;
}

// everything the canvas needs to animate the currently sounding chunk.
interface Playback {
  context: AudioContext;
  chunkStartTime: number;
  loopSeconds: number;
  tempo: number;
  secPerBeat: number;
  notes: VizNote[];
  schedule: { startTime: number; notes: VizNote[] }[];
  voices: { role: Role; color: string; gain: number }[];
  analyser: AnalyserNode | null;
  stopped: boolean;
  stop: () => void;
}

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

const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

const buildPlan = (setName: string, presetName: string, modeName: string) => {
  const set = INSTRUMENT_SETS[setName];
  const preset = PRESETS[presetName];
  const offsets = MODES[modeName];
  const roles = [...preset.instruments];
  const tempo = preset.tempo;
  const secPerBeat = 60 / tempo;
  const loopSeconds = (LOOP_BARS * BEATS_PER_BAR * 60) / tempo;
  const voices = roles.map((role) => {
    const spec = set[role];
    const register = clamp(
      (spec.register ?? 2) + preset.registerShift,
      MIN_REGISTER,
      MAX_REGISTER,
    );
    return { role, spec, register };
  });
  return { preset, offsets, tempo, secPerBeat, loopSeconds, voices };
};

type ScoredVoice = {
  role: Role;
  spec: InstrumentSpec;
  register: number;
  events: [number, number, number][];
};

// the locked score: one random score per voice, slipped each repeat
const scoreVoices = (plan: ReturnType<typeof buildPlan>): ScoredVoice[] =>
  plan.voices.map((voice) => ({
    ...voice,
    events: buildScore(
      plan.preset.density[voice.role],
      plan.offsets.length + 1,
      voice.spec.hold,
      LOOP_BARS,
    ),
  }));

// flatten scored voices into per-note visual data mirroring the triggers.
const scoredToNotes = (
  voices: ScoredVoice[],
  offsets: readonly number[],
  secPerBeat: number,
  chunkSec: number,
): VizNote[] => {
  const notes: VizNote[] = [];
  for (const voice of voices) {
    const isNoise = voice.spec.synth === Tone.NoiseSynth;
    const durSec = voice.spec.hold * secPerBeat;
    for (const [bar, beat, step] of voice.events) {
      const timeSec = (bar * BEATS_PER_BAR + beat) * secPerBeat;
      let midi: number | null = null;
      if (!isNoise) {
        const semitone =
          offsets[step % offsets.length] +
          12 * Math.floor(step / offsets.length);
        midi = Tone.Frequency(`C${voice.register}`)
          .transpose(semitone)
          .toMidi();
      }
      notes.push({
        role: voice.role,
        color: ROLE_COLORS[voice.role],
        timeSec,
        durSec: Math.min(durSec, chunkSec - timeSec),
        midi,
        gain: voice.spec.gain,
      });
    }
  }
  return notes;
};

const startPlayback = (
  setName: string,
  presetName: string,
  modeName: string,
): Playback => {
  const plan = buildPlan(setName, presetName, modeName);
  const context = Tone.getContext().rawContext as unknown as AudioContext;

  // analyser tap for visuals; audio is finalized per chunk
  const analyser = context.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.82;
  analyser.connect(context.destination);

  const active = new Set<AudioBufferSourceNode>();
  let filling = false;
  let nextTime = context.currentTime + 0.2;
  let timer: ReturnType<typeof setInterval>;

  const playback: Playback = {
    context,
    chunkStartTime: context.currentTime,
    loopSeconds: plan.loopSeconds,
    tempo: plan.tempo,
    secPerBeat: plan.secPerBeat,
    notes: [],
    schedule: [],
    voices: plan.voices.map((voice) => ({
      role: voice.role,
      color: ROLE_COLORS[voice.role],
      gain: voice.spec.gain,
    })),
    analyser,
    stopped: false,
    stop: (): void => {
      playback.stopped = true;
      clearInterval(timer);
      for (const source of active) {
        try {
          source.stop();
        } catch {
          /* already ended */
        }
      }
      analyser.disconnect();
    },
  };

  // locked score: built once, a fraction of notes slips each repeat
  const steps = plan.offsets.length + 1;
  const score = scoreVoices(plan);

  // render the locked (then slipped) loop plus tail offline
  const renderChunk = async (): Promise<AudioBuffer> => {
    let busMs = 0;
    let voicesMs = 0;
    const offlineStart = performance.now();
    const rendered = await Tone.Offline(async ({ transport }) => {
      const busStart = performance.now();
      const master = masterBus();
      const send = await reverbBus(
        master,
        plan.preset.reverbDecay,
        plan.preset.reverbWet,
      );
      busMs = performance.now() - busStart;
      const voicesStart = performance.now();
      for (const voice of score) {
        const synth = buildVoice(voice.spec, master, send)[0];
        buildPart(
          voice.spec,
          synth,
          voice.events,
          plan.offsets,
          voice.register,
          plan.tempo,
          plan.loopSeconds,
        );
      }
      voicesMs = performance.now() - voicesStart;
      transport.bpm.value = plan.tempo;
      transport.start();
    }, plan.loopSeconds + TAIL);
    const offlineMs = performance.now() - offlineStart;
    const finalizeStart = performance.now();
    const buffer = finalize(rendered.get() as AudioBuffer);
    const finalizeMs = performance.now() - finalizeStart;
    console.log(
      `[chunk] offline ${offlineMs.toFixed(1)}ms ` +
        `(bus ${busMs.toFixed(1)}ms, voices ${voicesMs.toFixed(1)}ms) | ` +
        `finalize ${finalizeMs.toFixed(1)}ms`,
    );
    return buffer;
  };

  // keep one chunk queued ahead; tails overlap for a seamless seam
  let firstChunk = true;
  const fill = async (): Promise<void> => {
    if (filling) return;
    filling = true;
    while (
      !playback.stopped &&
      nextTime < context.currentTime + plan.loopSeconds
    ) {
      const chunkStart = performance.now();
      let slipMs = 0;
      if (!firstChunk) {
        const slipStart = performance.now();
        for (const voice of score)
          slip(
            voice.spec.hold,
            voice.events,
            steps,
            plan.preset.density[voice.role],
          );
        slipMs = performance.now() - slipStart;
      }
      const buffer = await renderChunk();
      if (playback.stopped) break;
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(analyser);
      if (nextTime < context.currentTime) nextTime = context.currentTime + 0.05;
      source.start(nextTime);
      const notesStart = performance.now();
      const notes = scoredToNotes(
        score,
        plan.offsets,
        plan.secPerBeat,
        plan.loopSeconds,
      );
      const notesMs = performance.now() - notesStart;
      playback.schedule.push({ startTime: nextTime, notes });
      console.log(
        `[chunk] slip ${slipMs.toFixed(1)}ms | ` +
          `scoredToNotes ${notesMs.toFixed(1)}ms | ` +
          `total ${(performance.now() - chunkStart).toFixed(1)}ms`,
      );
      nextTime += plan.loopSeconds;
      firstChunk = false;
      active.add(source);
      source.onended = (): void => {
        active.delete(source);
      };
    }
    filling = false;
  };

  timer = setInterval((): void => {
    void fill();
  }, 500);
  void fill();

  return playback;
};

// draw one animation frame: grid, notes, playhead, seam, spectrum, meter.
const drawFrame = (canvas: HTMLCanvasElement, playback: Playback): void => {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (
    canvas.width !== Math.round(width * dpr) ||
    canvas.height !== Math.round(height * dpr)
  ) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const context = canvas.getContext("2d");
  if (context === null) return;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);

  const left = 44;
  const right = width - 12;
  const top = 12;
  const spectrumHeight = 70;
  const percussionHeight = 26;
  const rollBottom = height - spectrumHeight - percussionHeight - 24;
  const rollTop = top;
  const rollHeight = Math.max(20, rollBottom - rollTop);
  const spanX = Math.max(1, right - left);
  const now =
    (playback.context.currentTime - playback.chunkStartTime) %
    playback.loopSeconds;
  const xOf = (timeSec: number): number =>
    left + (timeSec / playback.loopSeconds) * spanX;

  const pitched = playback.notes.filter((note) => note.midi !== null);
  let lowMidi = 48;
  let highMidi = 72;
  if (pitched.length > 0) {
    lowMidi = Math.min(...pitched.map((note) => note.midi as number)) - 2;
    highMidi = Math.max(...pitched.map((note) => note.midi as number)) + 2;
  }
  const midiSpan = Math.max(1, highMidi - lowMidi);
  const yOf = (midi: number): number =>
    rollBottom - ((midi - lowMidi) / midiSpan) * rollHeight;

  // bar blocks and beat seams: thick per bar, faint per beat.
  const secPerBar = playback.secPerBeat * BEATS_PER_BAR;
  for (let bar = 0; bar <= LOOP_BARS; bar++) {
    const x = xOf(bar * secPerBar);
    context.strokeStyle = "rgba(255,255,255,0.14)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(x, rollTop);
    context.lineTo(x, rollBottom + percussionHeight + 6);
    context.stroke();
    if (bar < LOOP_BARS) {
      context.fillStyle = "rgba(255,255,255,0.28)";
      context.font = "10px monospace";
      context.fillText(String(bar + 1), x + 3, rollTop + 10);
      for (let beat = 1; beat < BEATS_PER_BAR; beat++) {
        const bx = xOf(bar * secPerBar + beat * playback.secPerBeat);
        context.strokeStyle = "rgba(255,255,255,0.05)";
        context.beginPath();
        context.moveTo(bx, rollTop);
        context.lineTo(bx, rollBottom);
        context.stroke();
      }
    }
  }

  // loop seam: where the rendered loop crossfades back onto itself.
  for (const seamX of [left, right]) {
    context.strokeStyle = "rgba(120,200,255,0.55)";
    context.lineWidth = 1.5;
    context.setLineDash([4, 4]);
    context.beginPath();
    context.moveTo(seamX, rollTop - 2);
    context.lineTo(seamX, rollBottom + percussionHeight + 6);
    context.stroke();
    context.setLineDash([]);
  }
  context.fillStyle = "rgba(120,200,255,0.75)";
  context.font = "10px monospace";
  context.fillText("loop seam", right - 58, rollBottom + percussionHeight + 4);

  // percussion lane divider (unpitched hits live here).
  context.strokeStyle = "rgba(255,255,255,0.10)";
  context.beginPath();
  context.moveTo(left, rollBottom);
  context.lineTo(right, rollBottom);
  context.stroke();

  // notes: colour by instrument, size and glow by volume.
  for (const note of playback.notes) {
    const x = xOf(note.timeSec);
    const w = Math.max(3, (note.durSec / playback.loopSeconds) * spanX);
    const nearness = 1 - Math.min(1, Math.abs(note.timeSec - now) / 0.35);
    const alpha =
      clamp(0.35 + note.gain * 0.8, 0.3, 1) * (0.55 + 0.45 * nearness);
    context.globalAlpha = alpha;
    context.fillStyle = note.color;
    if (nearness > 0.05) {
      context.shadowColor = note.color;
      context.shadowBlur = 12 * nearness;
    }
    if (note.midi === null) {
      const cy = rollBottom + percussionHeight / 2;
      const size = 4 + note.gain * 6;
      context.beginPath();
      context.moveTo(x, cy - size);
      context.lineTo(x + size, cy);
      context.lineTo(x, cy + size);
      context.lineTo(x - size, cy);
      context.closePath();
      context.fill();
    } else {
      const barHeight = 3 + note.gain * 9;
      const y = yOf(note.midi) - barHeight / 2;
      context.fillRect(x, y, w, barHeight);
    }
    context.shadowBlur = 0;
  }
  context.globalAlpha = 1;

  // playhead sweeping across the loop.
  const headX = xOf(now);
  context.strokeStyle = "#ffffff";
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(headX, rollTop);
  context.lineTo(headX, rollBottom + percussionHeight + 6);
  context.stroke();

  const analyser = playback.analyser;
  let rms = 0;
  if (analyser !== null) {
    // live spectrum bars along the bottom.
    const freq = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freq);
    const bars = 72;
    const barWidth = spanX / bars;
    const specTop = rollBottom + percussionHeight + 18;
    for (let index = 0; index < bars; index++) {
      const value = freq[Math.floor((index / bars) * freq.length)] / 255;
      const h = value * spectrumHeight;
      const hue = 200 - index * 2;
      context.fillStyle = `hsl(${hue}, 70%, ${30 + value * 40}%)`;
      context.fillRect(
        left + index * barWidth,
        specTop + spectrumHeight - h,
        barWidth - 1,
        h,
      );
    }

    // master volume from the time-domain signal.
    const time = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(time);
    let sum = 0;
    for (const sample of time) {
      const centered = (sample - 128) / 128;
      sum += centered * centered;
    }
    rms = Math.sqrt(sum / time.length);
  }

  // master meter on the left rail.
  const meterHeight = rollBottom - rollTop;
  const level = clamp(rms * 2.6, 0, 1);
  context.fillStyle = "rgba(255,255,255,0.08)";
  context.fillRect(12, rollTop, 16, meterHeight);
  const filled = level * meterHeight;
  const gradient = context.createLinearGradient(0, rollBottom, 0, rollTop);
  gradient.addColorStop(0, "#39c8a0");
  gradient.addColorStop(0.7, "#ffd24a");
  gradient.addColorStop(1, "#ff6b4a");
  context.fillStyle = gradient;
  context.fillRect(12, rollBottom - filled, 16, filled);
  context.fillStyle = "rgba(255,255,255,0.4)";
  context.font = "9px monospace";
  context.save();
  context.translate(10, rollBottom + 2);
  context.rotate(-Math.PI / 2);
  context.fillText("VOL", 0, 0);
  context.restore();

  // legend: pulse each voice while it is sounding.
  let legendX = left;
  const legendY = rollBottom + percussionHeight + spectrumHeight + 22;
  for (const voice of playback.voices) {
    const sounding = playback.notes.some(
      (note) =>
        note.role === voice.role &&
        now >= note.timeSec &&
        now <= note.timeSec + note.durSec,
    );
    context.globalAlpha = sounding ? 1 : 0.45;
    context.fillStyle = voice.color;
    context.fillRect(legendX, legendY - 8, 10, 10);
    context.fillStyle = "#e6e6e6";
    context.font = sounding ? "bold 11px monospace" : "11px monospace";
    context.fillText(voice.role, legendX + 14, legendY);
    legendX += 22 + context.measureText(voice.role).width + 14;
  }
  context.globalAlpha = 1;
};

const MusicLab = (): ReactElement => {
  const [setName, setSetName] = useState<string>("lunacid");
  const [presetName, setPresetName] = useState<string>("cavern");
  const [modeName, setModeName] = useState<string>("majorPentatonic");
  const [playing, setPlaying] = useState(false);
  const [playback, setPlayback] = useState<Playback | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect((): (() => void) | void => {
    if (playback === null) return;
    const canvas = canvasRef.current;
    if (canvas === null) return;
    let frame = 0;
    const loop = (): void => {
      const now = playback.context.currentTime;
      while (
        playback.schedule.length > 0 &&
        playback.schedule[0].startTime <= now
      ) {
        const entry = playback.schedule.shift() as {
          startTime: number;
          notes: VizNote[];
        };
        playback.notes = entry.notes;
        playback.chunkStartTime = entry.startTime;
      }
      drawFrame(canvas, playback);
      frame = requestAnimationFrame(loop);
    };
    loop();
    return (): void => cancelAnimationFrame(frame);
  }, [playback]);

  const handlePlay = async (): Promise<void> => {
    playback?.stop();
    await Tone.start();
    setPlayback(startPlayback(setName, presetName, modeName));
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
            onChange={(e) => setSetName(e.target.value)}
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
            onChange={(e) => setPresetName(e.target.value)}
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
            onChange={(e) => setModeName(e.target.value)}
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
          <canvas ref={canvasRef} style={styles.canvas} />
        </div>
      </main>
    </div>
  );
};

export { MusicLab };
