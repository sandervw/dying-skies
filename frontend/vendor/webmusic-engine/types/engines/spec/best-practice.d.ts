/** Types for best-practice.js. */
import type { Engine, Patch } from "./api.js";

/** Mix roles that best practice has rules for. */
export type Role = "bass" | "kick" | "harmony" | "lead" | "counter" | "accent" | "snare" | "hat" | "perc";

/** Engine folders that best practice knows the capabilities of. */
export type EngineName = "0-original" | "1-live-hardened" | "2-baked-notes" | "3-stem-loops" | "5-wasm-worklet";

/** Returns a new patch with best practices this engine honours. */
export function applyBestPractice(patch: Patch, options: { engine: EngineName; roles: Record<string, Role> }): { patch: Patch; notes: string[] };

/** Wraps an engine with a noise floor and faded suspend and dispose. */
export function wrapEngine(engine: Engine, options: { engine: EngineName }): Engine;
