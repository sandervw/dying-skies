/** Main-thread side of the worklet port: sends, syncs, chunks and errors. */
import type { FromProcessor, ToProcessor } from "./protocol.js";
type ChunkMessage = Extract<FromProcessor, {
    type: "chunk";
}>;
/** Typed wrapper around one processor's message port. */
export declare class WorkletLink {
    private readonly port;
    private readonly waiters;
    private nextSyncId;
    private failure;
    private chunkListener;
    constructor(node: AudioWorkletNode);
    /** Posts a message, transferring any listed buffers. */
    send(message: ToProcessor, transfer?: Transferable[]): void;
    /** Resolves once the processor has handled every earlier message. */
    sync(): Promise<void>;
    /** Calls the listener for each rendered chunk the processor posts. */
    listenForChunks(listener: (chunk: ChunkMessage) => void): void;
    private receive;
    private fail;
}
export {};
