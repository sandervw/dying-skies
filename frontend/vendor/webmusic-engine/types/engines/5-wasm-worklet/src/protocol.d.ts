/** Messages between the main thread and the DSP worklet. */
/** Name the processor registers under. */
export declare const PROCESSOR_NAME = "webmusic-wasm-dsp";
/** Numbers per event record in the WASM inbox. */
export declare const EVENT_FIELDS = 8;
/** Records the WASM inbox holds per call. */
export declare const INBOX_EVENTS = 512;
/** Processor options: the module bytes and the compiled patch. */
export interface ProcessorSetup {
    readonly wasmBytes: ArrayBuffer;
    readonly program: Float64Array;
}
/** Messages the main thread sends to the processor. */
export type ToProcessor = {
    readonly type: "events";
    readonly records: Float64Array;
} | {
    readonly type: "recording";
    readonly instrumentIndex: number;
    readonly midi: number;
    readonly rate: number;
    readonly channels: Float32Array[];
} | {
    readonly type: "sync";
    readonly id: number;
} | {
    readonly type: "capture";
    readonly chunkFrames: number;
    readonly totalFrames: number;
} | {
    readonly type: "stop";
};
/** Messages the processor sends back. */
export type FromProcessor = {
    readonly type: "synced";
    readonly id: number;
} | {
    readonly type: "chunk";
    readonly index: number;
    readonly left: Float32Array;
    readonly right: Float32Array;
} | {
    readonly type: "error";
    readonly message: string;
};
