/** Event records shared with the DSP core: eight numbers each. */
import type { RampTarget } from "../../../spec/api.js";
/** Event kinds, in the DSP core's numbering. */
export declare enum EventType {
    NoteOn = 1,
    NoteOff = 2,
    ReleaseAll = 3,
    Ramp = 4,
    Tempo = 5,
    CancelTag = 6,
    CancelAfter = 7
}
/** Ramp target codes, in the DSP core's numbering. */
export declare const RAMP_TARGET_CODES: Readonly<Record<RampTarget, number>>;
/** Instrument index meaning the master strip. */
export declare const MASTER_INDEX = -1;
/** One event before encoding; unused fields default to zero. */
export interface EventRecord {
    readonly type: EventType;
    readonly time: number;
    readonly instrument?: number;
    readonly noteId?: number;
    readonly pitch?: number;
    readonly value?: number;
    readonly duration?: number;
    readonly tag?: number;
}
/** Appends one record's eight numbers to a batch. */
export declare function encodeEvent(record: EventRecord, batch: number[]): void;
