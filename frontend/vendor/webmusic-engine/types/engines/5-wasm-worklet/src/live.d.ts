/** Live engine: lookahead scheduling plus iOS-safe unlock, resume and suspend. */
import type { OfflineOptions, Score } from "../../spec/api.js";
import type { EngineAssets } from "./loader.js";
import { Session, type SessionParts } from "./session.js";
/** Whether the engine created its context and so must close it. */
export declare enum ContextOwnership {
    Owned = 0,
    Borrowed = 1
}
/** Engine on a real AudioContext, driven by a lookahead timer. */
export declare class LiveEngine extends Session {
    private readonly audioContext;
    private readonly assets;
    private readonly ownership;
    private readonly timer;
    private wish;
    private readonly onVisibility;
    private readonly onStateChange;
    private readonly onGesture;
    constructor(parts: SessionParts & {
        readonly context: AudioContext;
    }, assets: EngineAssets, ownership: ContextOwnership);
    get state(): AudioContextState | "interrupted";
    unlock(): Promise<void>;
    resume(): Promise<void>;
    suspend(): Promise<void>;
    renderOffline(score: Score, options: OfflineOptions): Promise<Float32Array[]>;
    dispose(): void;
    /** Runs transport callbacks inside the lookahead horizon. */
    private tick;
    private recoverAfterHidden;
    /** After an interruption, the next tap or key resumes playback. */
    private watchInterruption;
    private armGesture;
    private disarmGesture;
}
