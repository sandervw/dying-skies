/** Shared contract every engine library implements and exports. */
/** Time in seconds, or tempo notation: "4n", "8n.", "8t", "1m". */
export type Time = number | string;
/** Note name like "C4" or "F#2", or a MIDI number. */
export type Note = string | number;
/** Oscillator shapes every engine supports. */
export type Waveform = "sine" | "triangle" | "sawtooth" | "square" | "pulse" | "fatsawtooth";
/** Oscillator; width is pulse duty, count and spread shape fatsawtooth. */
export interface OscillatorSpec {
    type: Waveform;
    width?: number;
    count?: number;
    spread?: number;
    detune?: number;
}
/** Amplitude envelope in seconds; sustain is a 0 to 1 level. */
export interface EnvelopeSpec {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
}
/** Filter; gain applies to peaking and shelves, rolloff to the rest. */
export interface FilterSpec {
    type: "lowpass" | "highpass" | "bandpass" | "peaking" | "highshelf" | "lowshelf";
    frequency: number;
    Q?: number;
    gain?: number;
    rolloff?: -12 | -24;
}
/** Filter sweep: from baseFrequency up by octaves at envelope peak. */
export interface FilterEnvelopeSpec extends EnvelopeSpec {
    baseFrequency: number;
    octaves: number;
}
/** Single-oscillator voice with an amplitude envelope. */
export interface BasicSynthSpec {
    kind: "synth";
    oscillator: OscillatorSpec;
    envelope: EnvelopeSpec;
}
/** Monophonic voice with swept filter and portamento glide in seconds. */
export interface MonoSynthSpec {
    kind: "mono";
    oscillator: OscillatorSpec;
    envelope: EnvelopeSpec;
    filter: FilterSpec;
    filterEnvelope: FilterEnvelopeSpec;
    portamento?: number;
}
/** Two-operator FM; modulator frequency is carrier times harmonicity. */
export interface FmSynthSpec {
    kind: "fm";
    oscillator: OscillatorSpec;
    modulator: OscillatorSpec;
    harmonicity: number;
    modulationIndex: number;
    envelope: EnvelopeSpec;
    modulationEnvelope: EnvelopeSpec;
}
/** Two mono voices, the second at harmonicity, with shared vibrato. */
export interface DuoSynthSpec {
    kind: "duo";
    voices: [Omit<MonoSynthSpec, "kind">, Omit<MonoSynthSpec, "kind">];
    harmonicity: number;
    vibratoRate: number;
    vibratoAmount: number;
    portamento?: number;
}
/** Drum: sine-like body that drops octaves over pitchDecay seconds. */
export interface MembraneSynthSpec {
    kind: "membrane";
    oscillator: OscillatorSpec;
    envelope: EnvelopeSpec;
    pitchDecay: number;
    octaves: number;
}
/** Noise through an envelope; pitch arguments are ignored. */
export interface NoiseSynthSpec {
    kind: "noise";
    noise: "white" | "pink" | "brown";
    envelope: EnvelopeSpec;
}
/** Repitches the nearest recorded note; fades in and out in seconds. */
export interface SamplerSpec {
    kind: "sampler";
    urls: Record<string, string>;
    attack: number;
    release: number;
}
/** Every sound source an instrument can use. */
export type SourceSpec = BasicSynthSpec | MonoSynthSpec | FmSynthSpec | DuoSynthSpec | MembraneSynthSpec | NoiseSynthSpec | SamplerSpec;
/** Insert effects; wet is 0 to 1 and defaults to 1. */
export type EffectSpec = {
    type: "filter";
    filter: FilterSpec;
} | {
    type: "autofilter";
    frequency: Time;
    baseFrequency: number;
    octaves: number;
    depth: number;
    wet?: number;
} | {
    type: "compressor";
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
    knee: number;
} | {
    type: "limiter";
    threshold: number;
} | {
    type: "distortion";
    amount: number;
    oversample?: "none" | "2x" | "4x";
    wet?: number;
} | {
    type: "chebyshev";
    order: number;
    wet?: number;
} | {
    type: "chorus";
    frequency: number;
    delayTime: number;
    depth: number;
    spread?: number;
    wet?: number;
} | {
    type: "tremolo";
    frequency: number;
    depth: number;
    spread?: number;
    wet?: number;
} | {
    type: "vibrato";
    frequency: number;
    depth: number;
    wet?: number;
} | {
    type: "widener";
    width: number;
} | {
    type: "feedbackdelay";
    delayTime: Time;
    feedback: number;
    wet?: number;
} | {
    type: "pingpong";
    delayTime: Time;
    feedback: number;
    wet?: number;
} | {
    type: "reverb";
    decay: number;
    preDelay: number;
    wet?: number;
};
/** One playable part: source, voice count, then its channel strip. */
export interface InstrumentSpec {
    id: string;
    source: SourceSpec;
    polyphony?: number;
    volume?: number;
    pan?: number;
    effects?: EffectSpec[];
    reverbSend?: number;
}
/** Whole graph: instruments, shared JCReverb send, then master chain. */
export interface Patch {
    instruments: InstrumentSpec[];
    reverb: {
        roomSize: number;
        returnEffects?: EffectSpec[];
    };
    master: {
        volume?: number;
        effects?: EffectSpec[];
    };
}
/** Notes and lengths an instrument will play, for engines that pre-render. */
export interface PlayHint {
    notes: Note[];
    durations?: Time[];
}
/** Handle to one instrument; every time is audio-context seconds. */
export interface Instrument {
    triggerAttack(note: Note, time?: number, velocity?: number): void;
    triggerRelease(note?: Note, time?: number): void;
    triggerAttackRelease(note: Note, duration: Time, time?: number, velocity?: number): void;
    releaseAll(time?: number): void;
}
/** Values a ramp can move; filterFrequency moves the first filter insert. */
export type RampTarget = "volume" | "pan" | "reverbSend" | "filterFrequency";
/** Sample-accurate clock that calls back ahead with exact audio times. */
export interface Transport {
    bpm: number;
    timeSignature: number;
    readonly state: "started" | "stopped" | "paused";
    readonly seconds: number;
    start(time?: number): void;
    stop(time?: number): void;
    pause(time?: number): void;
    scheduleRepeat(callback: (time: number) => void, interval: Time, start?: Time, duration?: Time): number;
    scheduleOnce(callback: (time: number) => void, time: Time): number;
    cancel(eventId: number): void;
    toSeconds(time: Time): number;
}
/** Function that drives an engine's transport and instruments. */
export type Score = (engine: Engine) => void;
/** Options for rendering a score offline, optionally chunk by chunk. */
export interface OfflineOptions {
    duration: number;
    sampleRate?: number;
    channels?: number;
    chunkSeconds?: number;
    onChunk?: (chunk: Float32Array[], index: number) => void;
}
/** A loaded engine: instruments, clock, ramps, lifecycle and offline rendering. */
export interface Engine {
    readonly context: BaseAudioContext;
    readonly transport: Transport;
    readonly state: AudioContextState | "interrupted";
    readonly now: number;
    instrument(id: string): Instrument;
    ramp(target: RampTarget, value: number, duration: number, time?: number, instrumentId?: string): void;
    unlock(): Promise<void>;
    resume(): Promise<void>;
    suspend(): Promise<void>;
    renderOffline(score: Score, options: OfflineOptions): Promise<Float32Array[]>;
    dispose(): void;
}
/** Options for building an engine. */
export interface EngineOptions {
    patch: Patch;
    hints?: Record<string, PlayHint>;
    context?: AudioContext;
    latencyHint?: AudioContextLatencyCategory | number;
    baseUrl?: string;
}
/** Each library default-exports nothing and exports createEngine. */
export type CreateEngine = (options: EngineOptions) => Promise<Engine>;
