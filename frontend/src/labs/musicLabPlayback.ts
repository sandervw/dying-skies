/** Music Lab audio: musicService's loop, played through a visual tap. */

import type { Transport } from "webmusic-engine";
import { INSTRUMENT_SETS } from "../utils/instrumentSets";
import { MODES } from "../utils/modes";
import { PRESETS } from "../utils/presets";
import { LOOP_BARS, notePitch, playLoop } from "../services/musicService";
import type { Voice } from "../services/musicService";
import type { Role } from "../types/music";

/** beats in one bar. */
const BEATS_PER_BAR = 4;

// lab context whose destination is an analyser tap for visuals
const labContext = new AudioContext({ latencyHint: "playback" });
const analyser = labContext.createAnalyser();
analyser.fftSize = 1024;
analyser.smoothingTimeConstant = 0.82;
analyser.connect(labContext.destination);
Object.defineProperty(labContext, "destination", { value: analyser });

/** the lab's signal colours, shared by instruments and the meter. */
const LAB_COLORS = {
  blue: "#5b6cff",
  green: "#39c8a0",
  yellow: "#ffd24a",
  red: "#ff6b4a",
  violet: "#e05bff",
} as const;

// one distinct colour per instrument slot, reused by audio + visuals.
const ROLE_COLORS: Record<Role, string> = {
  bass: LAB_COLORS.blue,
  harmony: LAB_COLORS.green,
  accent: LAB_COLORS.yellow,
  lead: LAB_COLORS.red,
  counter: LAB_COLORS.violet,
};

/** one drawable note: start, length, volume, and pitch, null for noise. */
interface DrawnNote {
  role: Role;
  color: string;
  startSeconds: number;
  lengthSeconds: number;
  pitch: number | null;
  gain: number;
}

/** everything the canvas needs to animate the live loop. */
interface Playback {
  loopSeconds: number;
  tempo: number;
  beatSeconds: number;
  currentNotes: () => DrawnNote[];
  voices: { role: Role; color: string; gain: number }[];
  analyser: AnalyserNode | null;
  transport: Transport;
  stop: () => void;
}

// flatten the live voices into per-note visual data mirroring the triggers.
const voicesToNotes = (
  voices: readonly Voice[],
  offsets: readonly number[],
  beatSeconds: number,
  loopSeconds: number,
): DrawnNote[] => {
  const notes: DrawnNote[] = [];
  for (const voice of voices) {
    const isNoise = voice.spec.synth === "NoiseSynth";
    const holdSeconds = voice.spec.hold * beatSeconds;
    for (const [bar, beat, step] of voice.events) {
      const startSeconds = (bar * BEATS_PER_BAR + beat) * beatSeconds;
      notes.push({
        role: voice.role,
        color: ROLE_COLORS[voice.role],
        startSeconds,
        lengthSeconds: Math.min(holdSeconds, loopSeconds - startSeconds),
        pitch: isNoise ? null : notePitch(voice.register, offsets, step),
        gain: voice.spec.gain,
      });
    }
  }
  return notes;
};

/** loop one set, preset, and mode; return what the canvas draws. */
const startPlayback = async (
  setName: string,
  presetName: string,
  modeName: string,
): Promise<Playback> => {
  const preset = PRESETS[presetName];
  const offsets = MODES[modeName].offsets;
  const loop = await playLoop(INSTRUMENT_SETS[setName], preset, offsets, labContext);
  await loop.engine.unlock();
  const beatSeconds = 60 / preset.tempo;
  const loopSeconds = (LOOP_BARS * BEATS_PER_BAR * 60) / preset.tempo;
  return {
    loopSeconds,
    tempo: preset.tempo,
    beatSeconds,
    currentNotes: (): DrawnNote[] => voicesToNotes(loop.voices, offsets, beatSeconds, loopSeconds),
    voices: loop.voices.map((voice) => ({
      role: voice.role,
      color: ROLE_COLORS[voice.role],
      gain: voice.spec.gain,
    })),
    analyser,
    transport: loop.engine.transport,
    stop: (): void => loop.engine.dispose(),
  };
};

export type { DrawnNote, Playback };
export { BEATS_PER_BAR, LAB_COLORS, startPlayback };
