/** Beat-based transport that runs callbacks ahead with exact audio times. */
import type { Time, Transport } from "../../spec/api.js";
import { type EventRecord } from "./core/events.js";
/** What the transport needs from its engine. */
export interface TransportHost {
    /** Audio time new events default to. */
    now(): number;
    /** Queues an event for the DSP core. */
    post(record: EventRecord): void;
}
type TransportState = Transport["state"];
/** Transport clock in quarter-note beats, anchored to audio time. */
export declare class BeatTransport implements Transport {
    private beatsPerMinute;
    private beatsPerMeasure;
    private status;
    private anchorTime;
    private anchorBeat;
    private pausedBeat;
    private dispatchedBeat;
    private nextId;
    private readonly callbacks;
    private readonly host;
    /** Id of the callback running now; events it posts carry it. */
    currentTag: number;
    constructor(host: TransportHost);
    get bpm(): number;
    set bpm(value: number);
    get timeSignature(): number;
    set timeSignature(value: number);
    get state(): TransportState;
    get seconds(): number;
    start(time?: number): void;
    stop(time?: number): void;
    pause(time?: number): void;
    scheduleRepeat(callback: (time: number) => void, interval: Time, start?: Time, duration?: Time): number;
    scheduleOnce(callback: (time: number) => void, time: Time): number;
    cancel(eventId: number): void;
    toSeconds(time: Time): number;
    /** Runs every callback due before an audio time, in time order. */
    advance(untilTime: number): void;
    private run;
    private add;
    private earliestBefore;
    private toBeats;
    private beatAt;
    private timeAt;
    private currentBeat;
    private reanchor;
    private postTempo;
}
export {};
