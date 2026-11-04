/** Offline rendering: the same DSP worklet in an OfflineAudioContext, in chunks. */
import type { OfflineOptions, Score } from "../../spec/api.js";
import { type EngineAssets } from "./loader.js";
/** Renders a score offline and returns every output channel. */
export declare function renderScore(assets: EngineAssets, score: Score, options: OfflineOptions, defaultRate: number): Promise<Float32Array[]>;
