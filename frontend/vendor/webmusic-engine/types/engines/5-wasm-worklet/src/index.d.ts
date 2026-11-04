/** Public entry: createEngine builds a WASM AudioWorklet engine from a patch. */
import type { Engine, EngineOptions } from "../../spec/api.js";
import { type QualityTier } from "./core/tiers.js";
export type * from "../../spec/api.js";
export type { QualityTier } from "./core/tiers.js";
/** Engine options plus a quality tier; "auto" picks one per device. */
export interface WasmEngineOptions extends EngineOptions {
    quality?: QualityTier | "auto";
}
/** Loads the WASM core and recordings, then returns a ready engine. */
export declare function createEngine(options: WasmEngineOptions): Promise<Engine>;
