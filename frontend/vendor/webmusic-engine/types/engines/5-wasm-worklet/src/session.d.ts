/** Engine parts shared by live and offline sessions: notes, ramps, events. */
import type { Engine, Instrument, OfflineOptions, Score } from "../../spec/api.js";
import { type EventRecord } from "./core/events.js";
import type { CompiledPatch } from "./core/program.js";
import type { WorkletLink } from "./link.js";
import { BeatTransport } from "./transport.js";
/** The pieces a session is built from. */
export interface SessionParts {
    readonly context: BaseAudioContext;
    readonly node: AudioWorkletNode;
    readonly link: WorkletLink;
    readonly compiled: CompiledPatch;
    readonly leadSeconds: number;
}
/** Common engine behaviour over one DSP node. */
export declare abstract class Session implements Engine {
    readonly context: BaseAudioContext;
    readonly transport: BeatTransport;
    protected readonly node: AudioWorkletNode;
    protected readonly link: WorkletLink;
    private readonly compiled;
    private readonly leadSeconds;
    private readonly handles;
    private batch;
    private flushQueued;
    private noteCount;
    constructor(parts: SessionParts);
    abstract get state(): AudioContextState | "interrupted";
    abstract unlock(): Promise<void>;
    abstract resume(): Promise<void>;
    abstract suspend(): Promise<void>;
    abstract renderOffline(score: Score, options: OfflineOptions): Promise<Float32Array[]>;
    get now(): number;
    instrument(id: string): Instrument;
    /** Rest form keeps the spec's five arguments under the lint limit. */
    ramp(...request: Parameters<Engine["ramp"]>): void;
    private rampIndex;
    /** Queues a note-on and returns its id for the matching note-off. */
    noteOn(instrument: number, pitch: number, time: number, velocity: number): number;
    /** Queues an event, tagged with the running transport callback. */
    post(record: EventRecord): void;
    /** Sends every queued event to the processor now. */
    flush(): void;
    dispose(): void;
}
