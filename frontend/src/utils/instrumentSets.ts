/**
 * Instrument sets load from ../assets/instrumentSets/*.json (filename = set name).
 * THE INSTRUMENTS MUST NEVER BE ADJUSTED WITHOUT EXPLICIT INSTRUCTIONS;
 *   Treat instruments as raw sound sources - fixes must go in musicService.ts
 */

import * as Tone from "tone";
import type { EffectEntry, InstrumentSpec, Role, SynthClass } from "../types/music";

// Tone voice and effect classes the set JSON references by name.
const TONE_REGISTRY: Record<string, unknown> = {
  MonoSynth: Tone.MonoSynth, Synth: Tone.Synth, FMSynth: Tone.FMSynth,
  AMSynth: Tone.AMSynth, DuoSynth: Tone.DuoSynth, NoiseSynth: Tone.NoiseSynth,
  Distortion: Tone.Distortion, Chorus: Tone.Chorus, StereoWidener: Tone.StereoWidener,
  PingPongDelay: Tone.PingPongDelay, FeedbackDelay: Tone.FeedbackDelay, Reverb: Tone.Reverb,
  Chebyshev: Tone.Chebyshev, Vibrato: Tone.Vibrato, AutoPanner: Tone.AutoPanner,
  AutoFilter: Tone.AutoFilter,
};

// one spec as stored in JSON: class refs are class-name strings.
type RawSpec = Omit<InstrumentSpec, "synth" | "effects"> & {
  synth: string;
  effects: [string, object][];
};

// look up a Tone class by name, or fail loudly.
const resolve = <T>(name: string): T => {
  const found = TONE_REGISTRY[name];
  if (found === undefined) throw new Error(`unknown Tone class: ${name}`);
  return found as T;
};

// swap a raw spec's class-name strings for live Tone constructors.
const hydrateSpec = (raw: RawSpec): InstrumentSpec => ({
  ...raw,
  synth: resolve<SynthClass>(raw.synth),
  effects: raw.effects.map(([name, options]): EffectEntry => [resolve(name), options]),
});

// hydrate every role in one raw set.
const hydrateSet = (raw: Record<Role, RawSpec>): Record<Role, InstrumentSpec> =>
  Object.fromEntries(
    Object.entries(raw).map(([role, spec]) => [role, hydrateSpec(spec)]),
  ) as Record<Role, InstrumentSpec>;

// every set JSON, bundled at build time.
const modules = import.meta.glob<{ default: Record<Role, RawSpec> }>(
  "../assets/instrumentSets/*.json",
  { eager: true },
);

// set name is the JSON filename without extension.
const nameOf = (path: string): string =>
  path.split("/").pop()!.replace(".json", "");

/** the instrument sets, keyed by name; each fills all five roles. */
const INSTRUMENT_SETS = Object.fromEntries(
  Object.keys(modules).sort().map((path) => [nameOf(path), hydrateSet(modules[path].default)]),
) as Record<string, Record<Role, InstrumentSpec>>;

export { INSTRUMENT_SETS };
