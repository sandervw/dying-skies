/** Fetches the WASM core and recordings, and builds DSP worklet nodes. */
import type { CompiledPatch } from "./core/program.js";
import { WorkletLink } from "./link.js";
/** A recording decoded once and reused by every render. */
export interface DecodedRecording {
    readonly instrumentIndex: number;
    readonly midi: number;
    readonly rate: number;
    readonly channels: Float32Array[];
}
/** Everything needed to build a DSP node in any context. */
export interface EngineAssets {
    readonly wasmBytes: ArrayBuffer;
    readonly compiled: CompiledPatch;
    readonly recordings: readonly DecodedRecording[];
}
/** A connected DSP node and its message link. */
export interface DspNode {
    readonly node: AudioWorkletNode;
    readonly link: WorkletLink;
}
/** Loads the WASM bytes and decodes every sampler recording in parallel. */
export declare function loadAssets(compiled: CompiledPatch, baseUrl: string | undefined, decoder: BaseAudioContext): Promise<EngineAssets>;
/** Builds a loaded DSP node and connects it to the destination. */
export declare function createDspNode(context: BaseAudioContext, assets: EngineAssets): Promise<DspNode>;
