import { useRef, useState } from "react";
import type { CSSProperties, ReactElement } from "react";
import * as Tone from "tone";
import { INSTRUMENT_SETS } from "../utils/instrumentSets";
import { MODES } from "../utils/modes";
import { BIOMES, type Biome } from "../utils/biomes";
import type { InstrumentSetName, InstrumentSpec } from "../types/music";

const LOOP_BARS = 8;
const MAX_DENSITY = 1.5;
const MIN_REGISTER = 1;
const MAX_REGISTER = 6;

const SET_NAMES = Object.keys(INSTRUMENT_SETS) as InstrumentSetName[];
const MODE_NAMES = Object.keys(MODES);
const BIOME_NAMES = Object.keys(BIOMES);

const styles: Record<string, CSSProperties> = {
  page: { display: "flex", minHeight: "100vh", background: "#0a0a0a", color: "#e6e6e6" },
  panel: { width: 280, padding: 16, boxSizing: "border-box", overflowY: "auto", height: "100vh" },
  title: { fontSize: 18, margin: "0 0 12px" },
  section: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#888", margin: "14px 0 6px" },
  label: { display: "flex", flexDirection: "column", fontSize: 12, marginBottom: 10, gap: 4 },
  select: { background: "#1c1c1c", color: "#e6e6e6", border: "1px solid #333", padding: 4, borderRadius: 2 },
  button: { padding: "8px 16px", cursor: "pointer", background: "#1c3466", color: "#e6e6e6", border: "1px solid #335", borderRadius: 2 },
  buttonDisabled: { opacity: 0.4 },
  main: { flex: 1, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 },
  info: { fontSize: 12, color: "#888", maxWidth: 420, textAlign: "center", lineHeight: 1.6 },
};

const pick = <T,>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const chainInto = (nodes: Tone.ToneAudioNode[], output: Tone.ToneAudioNode): void => {
  nodes.reduce((previous, node): Tone.ToneAudioNode => {
    previous.connect(node);
    return node;
  }).connect(output);
};

const buildMaster = (biome: Biome): Tone.ToneAudioNode[] => {
  const nodes = [
    new Tone.Filter({ type: "highpass", frequency: 30, rolloff: -12 }),
    new Tone.Gain(0.5),
    new Tone.Filter({ type: "lowpass", frequency: 7000, rolloff: -12 }),
    new Tone.Reverb({ decay: biome.reverbDecay, preDelay: 0.04, wet: biome.reverbWet }),
    new Tone.Compressor({ threshold: -20, ratio: 3, attack: 0.05, release: 0.3 }),
    new Tone.Limiter(-1),
  ];
  chainInto(nodes, Tone.getDestination());
  return nodes;
};

const buildVoice = (spec: InstrumentSpec, master: Tone.ToneAudioNode): Tone.ToneAudioNode[] => {
  const nodes: Tone.ToneAudioNode[] = [];
  const synth = spec.polyphony === undefined
    ? new spec.synth(spec.options)
    : new Tone.PolySynth({ maxPolyphony: spec.polyphony, voice: spec.synth as never, options: spec.options as never });
  nodes.push(synth);
  if (spec.filter !== undefined) {
    nodes.push(new Tone.Filter(spec.filter));
  }
  for (const [Effect, options] of spec.effects) {
    const effect = new Effect(options);
    effect.start?.();
    nodes.push(effect);
  }
  nodes.push(new Tone.Gain(spec.gain));
  chainInto(nodes, master);
  return nodes;
};

const buildScore = (density: number, steps: number): [number, number, number][] => {
  const count = Math.min(Math.round(Math.min(density, MAX_DENSITY) * LOOP_BARS), LOOP_BARS * 4);
  const seen = new Set<string>();
  const events: [number, number, number][] = [];
  while (events.length < count) {
    const bar = Math.floor(Math.random() * LOOP_BARS);
    const beat = Math.floor(Math.random() * 4);
    const slot = `${bar}:${beat}`;
    if (seen.has(slot)) continue;
    seen.add(slot);
    events.push([bar, beat, Math.floor(Math.random() * steps)]);
  }
  return events;
};

const buildPart = (
  spec: InstrumentSpec,
  synth: Tone.ToneAudioNode,
  events: readonly [number, number, number][],
  offsets: readonly number[],
  register: number,
  tempo: number,
): void => {
  const seconds = (spec.hold * 60) / tempo;
  const part = new Tone.Part((time, step: number): void => {
    if (synth instanceof Tone.NoiseSynth) {
      synth.triggerAttackRelease(seconds, time);
    } else {
      const semitone = offsets[step % offsets.length] + 12 * Math.floor(step / offsets.length);
      const note = Tone.Frequency(`C${register}`).transpose(semitone).toFrequency();
      (synth as Tone.PolySynth).triggerAttackRelease(note, seconds, time);
    }
  }, events.map(([bar, beat, step]): [string, number] => [`${bar}:${beat}:0`, step]));
  part.start(0);
};

const toWavUrl = (buffer: AudioBuffer, loopFrames: number): string => {
  const channels = buffer.numberOfChannels;
  const view = new DataView(new ArrayBuffer(44 + loopFrames * channels * 2));
  const writeText = (at: number, text: string): void => {
    for (let index = 0; index < text.length; index++) view.setUint8(at + index, text.charCodeAt(index));
  };
  writeText(0, "RIFF");
  view.setUint32(4, view.byteLength - 8, true);
  writeText(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, view.byteLength - 44, true);
  const at = (data: Float32Array, index: number): number => (index < buffer.length ? data[index] : 0);
  const fade = Math.round(buffer.sampleRate * 0.008);
  let position = 44;
  for (let frame = 0; frame < loopFrames; frame++) {
    for (let channel = 0; channel < channels; channel++) {
      const data = buffer.getChannelData(channel);
      let mixed = data[frame] + at(data, frame + loopFrames);
      if (frame < fade) {
        const weight = 0.5 - 0.5 * Math.cos((Math.PI * frame) / fade);
        const next = at(data, frame + loopFrames) + at(data, frame + 2 * loopFrames);
        mixed = mixed * weight + next * (1 - weight);
      }
      const shaped = Math.tanh(mixed);
      const dither = Math.random() + Math.random() - 1;
      const value = Math.round(shaped * 0x7fff + dither);
      view.setInt16(position, Math.max(-0x8000, Math.min(0x7fff, value)), true);
      position += 2;
    }
  }
  return URL.createObjectURL(new Blob([view], { type: "audio/wav" }));
};

const playWithVariables = (
  setName: InstrumentSetName,
  biomeName: string,
  modeName: string,
): (() => void) => {
  const set = INSTRUMENT_SETS[setName];
  const biome = BIOMES[biomeName];
  const offsets = MODES[modeName];
  const roles = [...biome.required, ...biome.optional.filter(() => Math.random() < 0.5)];

  const loopSeconds = (LOOP_BARS * 4 * 60) / biome.tempo;
  const audio = new Audio();
  audio.loop = true;
  let stopped = false;

  void Tone.Offline(({ transport }) => {
    const master = buildMaster(biome);
    for (const role of roles) {
      const spec = set[role];
      const register = Math.min(MAX_REGISTER, Math.max(MIN_REGISTER, (spec.register ?? 3) + biome.registerShift));
      const events = buildScore(biome.density[role], offsets.length + 1);
      const synth = buildVoice(spec, master[0])[0];
      buildPart(spec, synth, events, offsets, register, biome.tempo);
    }
    transport.bpm.value = biome.tempo;
    transport.start();
    return (master.find((node) => node instanceof Tone.Reverb) as Tone.Reverb).ready;
  }, loopSeconds + 6).then((buffer): void => {
    if (stopped) return;
    const rendered = buffer.get() as AudioBuffer;
    audio.src = toWavUrl(rendered, Math.round(loopSeconds * rendered.sampleRate));
    void audio.play();
  });

  return (): void => {
    stopped = true;
    audio.pause();
    if (audio.src) URL.revokeObjectURL(audio.src);
  };
};

const MusicLab = (): ReactElement => {
  const [setName, setSetName] = useState<InstrumentSetName>("morrowind");
  const [biomeName, setBiomeName] = useState<string>("cavern");
  const [modeName, setModeName] = useState<string>("majorPentatonic");
  const [playing, setPlaying] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  const handlePlay = async (): Promise<void> => {
    stopRef.current?.();
    await Tone.start();
    stopRef.current = playWithVariables(setName, biomeName, modeName);
    setPlaying(true);
  };

  const handleStop = (): void => {
    stopRef.current?.();
    stopRef.current = null;
    setPlaying(false);
  };

  const handleRandom = (): void => {
    setSetName(pick(SET_NAMES));
    setBiomeName(pick(BIOME_NAMES));
    setModeName(pick(MODE_NAMES));
  };

  return (
    <div style={styles.page}>
      <aside style={styles.panel}>
        <h1 style={styles.title}>Music Lab</h1>

        <h2 style={styles.section}>Instrument Set</h2>
        <label style={styles.label}>
          <select style={styles.select} value={setName} onChange={(e) => setSetName(e.target.value as InstrumentSetName)}>
            {SET_NAMES.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>

        <h2 style={styles.section}>Biome</h2>
        <label style={styles.label}>
          <select style={styles.select} value={biomeName} onChange={(e) => setBiomeName(e.target.value)}>
            {BIOME_NAMES.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>

        <h2 style={styles.section}>Mode</h2>
        <label style={styles.label}>
          <select style={styles.select} value={modeName} onChange={(e) => setModeName(e.target.value)}>
            {MODE_NAMES.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
          <button type="button" style={styles.button} onClick={() => { void handlePlay(); }}>
            Play
          </button>
          <button type="button" style={{ ...styles.button, ...(playing ? {} : styles.buttonDisabled) }} onClick={handleStop} disabled={!playing}>
            Stop
          </button>
          <button type="button" style={{ ...styles.button, background: "#1c1c1c", border: "1px solid #333" }} onClick={handleRandom}>
            Randomise
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.info}>
          <p><strong>{setName}</strong> + <strong>{biomeName}</strong> + <strong>{modeName}</strong></p>
          <p style={{ marginTop: 8 }}>
            tempo {BIOMES[biomeName].tempo}bpm, reverb {BIOMES[biomeName].reverbDecay}s decay,{" "}
            register shift {BIOMES[biomeName].registerShift > 0 ? "+" : ""}{BIOMES[biomeName].registerShift}
          </p>
          <p style={{ marginTop: 4 }}>
            mode steps: {JSON.stringify(MODES[modeName])}
          </p>
          <p style={{ marginTop: 4, fontSize: 11 }}>
            {playing ? "looping..." : "stopped"}
          </p>
        </div>
      </main>
    </div>
  );
};

export { MusicLab };