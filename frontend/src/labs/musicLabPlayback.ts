/** Music Lab audio: musicService's score, played through a visual tap. */

import { createEngine, toneSetToPatch } from "webmusic-engine";
import type { Transport } from "webmusic-engine";
import { INSTRUMENT_SETS } from "../utils/instrumentSets";
import { MODES } from "../utils/modes";
import { PRESETS } from "../utils/presets";
import {
  LOOP_BARS,
  MIN_REGISTER,
  MAX_REGISTER,
  buildScore,
  slip,
  buildPart,
} from "../services/musicService";
import type { InstrumentSpec, Role } from "../types/music";

/** beats in one bar. */
const BEATS_PER_BAR = 4;

// lab context whose destination is an analyser tap for visuals
const labContext = new AudioContext({ latencyHint: "playback" });
const analyser = labContext.createAnalyser();
analyser.fftSize = 1024;
analyser.smoothingTimeConstant = 0.82;
analyser.connect(labContext.destination);
Object.defineProperty(labContext, "destination", { value: analyser });

// one distinct colour per instrument slot, reused by audio + visuals.
const ROLE_COLORS: Record<Role, string> = {
  bass: "#5b6cff",
  harmony: "#39c8a0",
  accent: "#ffd24a",
  lead: "#ff6b4a",
  counter: "#e05bff",
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
  notes: DrawnNote[];
  voices: { role: Role; color: string; gain: number }[];
  analyser: AnalyserNode | null;
  transport: Transport;
  stop: () => void;
}

/** keep a value inside the low..high range. */
const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

// the chosen set, preset, and mode, resolved into voices and timing.
const buildPlan = (setName: string, presetName: string, modeName: string) => {
  const set = INSTRUMENT_SETS[setName];
  const preset = PRESETS[presetName];
  const offsets = MODES[modeName].offsets;
  const roles = [...preset.instruments];
  const tempo = preset.tempo;
  const beatSeconds = 60 / tempo;
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
  return { preset, offsets, tempo, beatSeconds, loopSeconds, voices };
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
  beatSeconds: number,
  loopSeconds: number,
): DrawnNote[] => {
  const notes: DrawnNote[] = [];
  for (const voice of voices) {
    const isNoise = voice.spec.synth === "NoiseSynth";
    const holdSeconds = voice.spec.hold * beatSeconds;
    for (const [bar, beat, step] of voice.events) {
      const startSeconds = (bar * BEATS_PER_BAR + beat) * beatSeconds;
      let pitch: number | null = null;
      if (!isNoise) {
        const semitone =
          offsets[step % offsets.length] +
          12 * Math.floor(step / offsets.length);
        pitch = 12 * (voice.register + 1) + semitone;
      }
      notes.push({
        role: voice.role,
        color: ROLE_COLORS[voice.role],
        startSeconds,
        lengthSeconds: Math.min(holdSeconds, loopSeconds - startSeconds),
        pitch,
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
  const plan = buildPlan(setName, presetName, modeName);
  const steps = plan.offsets.length + 1;
  const score = scoreVoices(plan);
  const { patch, roles } = toneSetToPatch(INSTRUMENT_SETS[setName], {
    reverbSend: plan.preset.reverbWet,
    roomSize: Math.min(0.85, plan.preset.reverbDecay / 14),
  });
  const engine = await createEngine({ patch, roles, context: labContext });
  await engine.unlock();
  const transport = engine.transport;
  const voices = score.map((voice) => ({ ...voice, instrument: engine.instrument(voice.role) }));

  const playback: Playback = {
    loopSeconds: plan.loopSeconds,
    tempo: plan.tempo,
    beatSeconds: plan.beatSeconds,
    notes: scoredToNotes(score, plan.offsets, plan.beatSeconds, plan.loopSeconds),
    voices: plan.voices.map((voice) => ({
      role: voice.role,
      color: ROLE_COLORS[voice.role],
      gain: voice.spec.gain,
    })),
    analyser,
    transport,
    stop: (): void => engine.dispose(),
  };

  transport.bpm = plan.tempo;
  let first = true;
  transport.scheduleRepeat((time): void => {
    if (!first) for (const voice of voices) slip(voice.spec.hold, voice.events, steps, plan.preset.density[voice.role]);
    first = false;
    for (const voice of voices) buildPart(voice, plan.offsets, plan.tempo, time);
    playback.notes = scoredToNotes(score, plan.offsets, plan.beatSeconds, plan.loopSeconds);
  }, `${LOOP_BARS}m`, 0);
  transport.start();
  return playback;
};

export type { DrawnNote, Playback };
export { BEATS_PER_BAR, clamp, startPlayback };
