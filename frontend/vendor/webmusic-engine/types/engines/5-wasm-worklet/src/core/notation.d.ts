/** Parses tempo notation and note names into numbers. */
import type { Note, Time } from "../../../spec/api.js";
/** A duration split into absolute seconds, beats and measures. */
export interface TimeParts {
    readonly seconds: number;
    readonly beats: number;
    readonly measures: number;
}
/** Splits a time into seconds, beats and measures; fails on unknown notation. */
export declare function parseTime(time: Time): TimeParts;
/** Total beats of a time at a tempo and meter. */
export declare function partsToBeats(parts: TimeParts, beatsPerMinute: number, beatsPerMeasure: number): number;
/** MIDI number of a note name like "F#2"; numbers pass through. */
export declare function noteToMidi(note: Note): number;
