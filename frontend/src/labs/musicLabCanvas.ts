/** Music Lab canvas: piano roll, playhead, spectrum, meter, and legend. */

import { LOOP_BARS } from "../services/musicService";
import { BEATS_PER_BAR, clamp } from "./musicLabPlayback";
import type { DrawnNote, Playback } from "./musicLabPlayback";

// layout in CSS pixels.
const LEFT = 44;
const RIGHT_MARGIN = 12;
const TOP = 12;
const SPECTRUM_HEIGHT = 70;
const PERCUSSION_HEIGHT = 26;
const SPECTRUM_BARS = 72;

// pitch range shown before any pitched note exists.
const DEFAULT_LOW_PITCH = 48;
const DEFAULT_HIGH_PITCH = 72;

// one frame's geometry and clock.
interface Frame {
  readonly left: number;
  readonly right: number;
  readonly rollTop: number;
  readonly rollBottom: number;
  readonly laneBottom: number;
  readonly spanX: number;
  readonly loopSeconds: number;
  readonly now: number;
}

// lay out the roll, lanes, and clock for this canvas size.
const measureFrame = (width: number, height: number, playback: Playback): Frame => {
  const right = width - RIGHT_MARGIN;
  const rollBottom = height - SPECTRUM_HEIGHT - PERCUSSION_HEIGHT - 24;
  return {
    left: LEFT,
    right,
    rollTop: TOP,
    rollBottom,
    laneBottom: rollBottom + PERCUSSION_HEIGHT + 6,
    spanX: Math.max(1, right - LEFT),
    loopSeconds: playback.loopSeconds,
    now: playback.transport.seconds % playback.loopSeconds,
  };
};

// x position of a moment in the loop.
const xOf = (frame: Frame, seconds: number): number =>
  frame.left + (seconds / frame.loopSeconds) * frame.spanX;

// bar blocks and beat seams: thick per bar, faint per beat.
const drawGrid = (context: CanvasRenderingContext2D, frame: Frame, beatSeconds: number): void => {
  const barSeconds = beatSeconds * BEATS_PER_BAR;
  for (let bar = 0; bar <= LOOP_BARS; bar++) {
    const barX = xOf(frame, bar * barSeconds);
    context.strokeStyle = "rgba(255,255,255,0.14)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(barX, frame.rollTop);
    context.lineTo(barX, frame.laneBottom);
    context.stroke();
    if (bar < LOOP_BARS) {
      context.fillStyle = "rgba(255,255,255,0.28)";
      context.font = "10px monospace";
      context.fillText(String(bar + 1), barX + 3, frame.rollTop + 10);
      for (let beat = 1; beat < BEATS_PER_BAR; beat++) {
        const beatX = xOf(frame, bar * barSeconds + beat * beatSeconds);
        context.strokeStyle = "rgba(255,255,255,0.05)";
        context.beginPath();
        context.moveTo(beatX, frame.rollTop);
        context.lineTo(beatX, frame.rollBottom);
        context.stroke();
      }
    }
  }
};

// loop seam: where the rendered loop crossfades back onto itself.
const drawSeams = (context: CanvasRenderingContext2D, frame: Frame): void => {
  for (const seamX of [frame.left, frame.right]) {
    context.strokeStyle = "rgba(120,200,255,0.55)";
    context.lineWidth = 1.5;
    context.setLineDash([4, 4]);
    context.beginPath();
    context.moveTo(seamX, frame.rollTop - 2);
    context.lineTo(seamX, frame.laneBottom);
    context.stroke();
    context.setLineDash([]);
  }
  context.fillStyle = "rgba(120,200,255,0.75)";
  context.font = "10px monospace";
  context.fillText("loop seam", frame.right - 58, frame.rollBottom + PERCUSSION_HEIGHT + 4);
};

// percussion lane divider (unpitched hits live here).
const drawLaneDivider = (context: CanvasRenderingContext2D, frame: Frame): void => {
  context.strokeStyle = "rgba(255,255,255,0.10)";
  context.beginPath();
  context.moveTo(frame.left, frame.rollBottom);
  context.lineTo(frame.right, frame.rollBottom);
  context.stroke();
};

// map a pitch to a roll height, padded around the notes' range.
const pitchToY = (notes: readonly DrawnNote[], frame: Frame): ((pitch: number) => number) => {
  const pitches = notes.flatMap((note) => (note.pitch === null ? [] : [note.pitch]));
  const low = pitches.length > 0 ? Math.min(...pitches) - 2 : DEFAULT_LOW_PITCH;
  const high = pitches.length > 0 ? Math.max(...pitches) + 2 : DEFAULT_HIGH_PITCH;
  const span = Math.max(1, high - low);
  const rollHeight = Math.max(20, frame.rollBottom - frame.rollTop);
  return (pitch: number): number => frame.rollBottom - ((pitch - low) / span) * rollHeight;
};

// notes: colour by instrument, size and glow by volume.
const drawNotes = (context: CanvasRenderingContext2D, frame: Frame, notes: readonly DrawnNote[]): void => {
  const yOf = pitchToY(notes, frame);
  for (const note of notes) {
    const noteX = xOf(frame, note.startSeconds);
    const noteWidth = Math.max(3, (note.lengthSeconds / frame.loopSeconds) * frame.spanX);
    const nearness = 1 - Math.min(1, Math.abs(note.startSeconds - frame.now) / 0.35);
    context.globalAlpha = clamp(0.35 + note.gain * 0.8, 0.3, 1) * (0.55 + 0.45 * nearness);
    context.fillStyle = note.color;
    if (nearness > 0.05) {
      context.shadowColor = note.color;
      context.shadowBlur = 12 * nearness;
    }
    if (note.pitch === null) {
      const centerY = frame.rollBottom + PERCUSSION_HEIGHT / 2;
      const size = 4 + note.gain * 6;
      context.beginPath();
      context.moveTo(noteX, centerY - size);
      context.lineTo(noteX + size, centerY);
      context.lineTo(noteX, centerY + size);
      context.lineTo(noteX - size, centerY);
      context.closePath();
      context.fill();
    } else {
      const barHeight = 3 + note.gain * 9;
      context.fillRect(noteX, yOf(note.pitch) - barHeight / 2, noteWidth, barHeight);
    }
    context.shadowBlur = 0;
  }
  context.globalAlpha = 1;
};

// playhead sweeping across the loop.
const drawPlayhead = (context: CanvasRenderingContext2D, frame: Frame): void => {
  const headX = xOf(frame, frame.now);
  context.strokeStyle = "#ffffff";
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(headX, frame.rollTop);
  context.lineTo(headX, frame.laneBottom);
  context.stroke();
};

// live spectrum bars along the bottom.
const drawSpectrum = (context: CanvasRenderingContext2D, frame: Frame, analyser: AnalyserNode): void => {
  const levels = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(levels);
  const barWidth = frame.spanX / SPECTRUM_BARS;
  const spectrumTop = frame.rollBottom + PERCUSSION_HEIGHT + 18;
  for (let index = 0; index < SPECTRUM_BARS; index++) {
    const value = levels[Math.floor((index / SPECTRUM_BARS) * levels.length)] / 255;
    const barLength = value * SPECTRUM_HEIGHT;
    const hue = 200 - index * 2;
    context.fillStyle = `hsl(${hue}, 70%, ${30 + value * 40}%)`;
    context.fillRect(
      frame.left + index * barWidth,
      spectrumTop + SPECTRUM_HEIGHT - barLength,
      barWidth - 1,
      barLength,
    );
  }
};

// master volume: root mean square of the time-domain signal.
const measureLoudness = (analyser: AnalyserNode): number => {
  const samples = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(samples);
  let sum = 0;
  for (const sample of samples) {
    const centered = (sample - 128) / 128;
    sum += centered * centered;
  }
  return Math.sqrt(sum / samples.length);
};

// master meter on the left rail.
const drawMeter = (context: CanvasRenderingContext2D, frame: Frame, loudness: number): void => {
  const meterHeight = frame.rollBottom - frame.rollTop;
  const level = clamp(loudness * 2.6, 0, 1);
  context.fillStyle = "rgba(255,255,255,0.08)";
  context.fillRect(12, frame.rollTop, 16, meterHeight);
  const filled = level * meterHeight;
  const gradient = context.createLinearGradient(0, frame.rollBottom, 0, frame.rollTop);
  gradient.addColorStop(0, "#39c8a0");
  gradient.addColorStop(0.7, "#ffd24a");
  gradient.addColorStop(1, "#ff6b4a");
  context.fillStyle = gradient;
  context.fillRect(12, frame.rollBottom - filled, 16, filled);
  context.fillStyle = "rgba(255,255,255,0.4)";
  context.font = "9px monospace";
  context.save();
  context.translate(10, frame.rollBottom + 2);
  context.rotate(-Math.PI / 2);
  context.fillText("VOL", 0, 0);
  context.restore();
};

// legend: pulse each voice while it is sounding.
const drawLegend = (context: CanvasRenderingContext2D, frame: Frame, playback: Playback): void => {
  let legendX = frame.left;
  const legendY = frame.rollBottom + PERCUSSION_HEIGHT + SPECTRUM_HEIGHT + 22;
  for (const voice of playback.voices) {
    const sounding = playback.notes.some(
      (note) =>
        note.role === voice.role &&
        frame.now >= note.startSeconds &&
        frame.now <= note.startSeconds + note.lengthSeconds,
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

/** draw one animation frame: grid, notes, playhead, seam, spectrum, meter. */
const drawFrame = (canvas: HTMLCanvasElement, playback: Playback): void => {
  const pixelRatio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const backingWidth = Math.round(width * pixelRatio);
  const backingHeight = Math.round(height * pixelRatio);
  if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
    canvas.width = backingWidth;
    canvas.height = backingHeight;
  }
  const context = canvas.getContext("2d");
  if (context === null) return;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, width, height);

  const frame = measureFrame(width, height, playback);
  drawGrid(context, frame, playback.beatSeconds);
  drawSeams(context, frame);
  drawLaneDivider(context, frame);
  drawNotes(context, frame, playback.notes);
  drawPlayhead(context, frame);
  const analyser = playback.analyser;
  if (analyser !== null) drawSpectrum(context, frame, analyser);
  drawMeter(context, frame, analyser === null ? 0 : measureLoudness(analyser));
  drawLegend(context, frame, playback);
};

export { drawFrame };
