/** Engine 5 with best-practice mastering, plus a Dying Skies set converter. */
import { type QualityTier } from "../../../engines/5-wasm-worklet/src/index.js";
import type { Engine, Patch } from "../../../engines/spec/api.js";
import { type Role } from "../../../engines/spec/best-practice.js";
import { type ToneInstrument } from "../../../tester/core/convert.js";
export type * from "../../../engines/spec/api.js";
export type { QualityTier } from "../../../engines/5-wasm-worklet/src/index.js";
export type { Role } from "../../../engines/spec/best-practice.js";
export type { ToneInstrument } from "../../../tester/core/convert.js";
declare const SET_ROLES: readonly ["bass", "harmony", "lead", "counter", "accent"];
/** The five roles every Dying Skies instrument set fills. */
export type SetRole = (typeof SET_ROLES)[number];
/** A Dying Skies instrument set, as stored in its JSON file. */
export type ToneSet = {
    readonly displayName?: string;
} & Readonly<Record<SetRole, ToneInstrument>>;
/** Reverb settings for a converted set. */
export interface SetOptions {
    reverbSend?: number;
    roomSize?: number;
}
/** A patch plus the mix role of each instrument id. */
export interface MixedPatch {
    patch: Patch;
    roles: Record<string, Role>;
}
/** Options for the mastered engine. */
export interface MasteredEngineOptions extends MixedPatch {
    quality?: QualityTier | "auto";
    context?: AudioContext;
    latencyHint?: AudioContextLatencyCategory | number;
    baseUrl?: string;
}
/** Converts a set to a patch; instrument ids are role names. */
export declare function toneSetToPatch(set: ToneSet, options?: SetOptions): MixedPatch;
/** Builds engine 5 with best-practice mastering and a noise floor. */
export declare function createEngine(options: MasteredEngineOptions): Promise<Engine>;
