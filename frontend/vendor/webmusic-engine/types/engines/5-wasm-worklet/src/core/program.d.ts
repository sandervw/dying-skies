/** Compiles a Patch into the flat number program the DSP core reads. */
import type { Patch } from "../../../spec/api.js";
import { type TierSettings } from "./tiers.js";
/** One recording a sampler instrument needs loaded. */
export interface RecordingRequest {
    readonly instrumentIndex: number;
    readonly midi: number;
    readonly url: string;
}
/** A compiled patch plus what the shell needs to drive it. */
export interface CompiledPatch {
    readonly program: Float64Array;
    readonly instrumentIds: readonly string[];
    readonly filterTargets: ReadonlySet<string>;
    readonly masterHasFilter: boolean;
    readonly recordings: readonly RecordingRequest[];
}
/** Validates and flattens a patch for one quality tier. */
export declare function compilePatch(patch: Patch, tier: TierSettings): CompiledPatch;
