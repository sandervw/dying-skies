import * as Tone from "tone";
import type { EffectEntry, InstrumentSet, InstrumentSpec, Role, SynthClass } from "../types/music";

// Tone voice and effect classes the set JSON references by name.
const TONE_REGISTRY: Record<string, unknown> = {
  MonoSynth: Tone.MonoSynth, Synth: Tone.Synth, FMSynth: Tone.FMSynth,
  AMSynth: Tone.AMSynth, DuoSynth: Tone.DuoSynth, NoiseSynth: Tone.NoiseSynth,
  Distortion: Tone.Distortion, Chorus: Tone.Chorus, StereoWidener: Tone.StereoWidener,
  PingPongDelay: Tone.PingPongDelay, FeedbackDelay: Tone.FeedbackDelay, Reverb: Tone.Reverb,
  Vibrato: Tone.Vibrato, AutoPanner: Tone.AutoPanner, Chebyshev: Tone.Chebyshev,
};

// one spec as stored in JSON: class refs are class-name strings.
type RawSpec = Omit<InstrumentSpec, "synth" | "effects"> & {
  synth: string;
  effects: [string, object][];
};
type RawSet = { name: string } & Partial<Record<Role, RawSpec>>;

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

// hydrate one raw set: every role it fills gets live class refs.
const hydrateSet = (raw: RawSet): InstrumentSet => {
  const { name, ...roles } = raw;
  const specs = Object.entries(roles).map(([role, spec]) => [role, hydrateSpec(spec as RawSpec)]);
  return { name, ...Object.fromEntries(specs) } as InstrumentSet;
};

// every set JSON in the assets folder, bundled at build time.
const modules = import.meta.glob<{ default: RawSet }>("../assets/instrumentSets/*.json", { eager: true });

/** the instrument sets; each names itself and fills any subset of roles. */
const INSTRUMENT_SETS: InstrumentSet[] = Object.keys(modules)
  .sort()
  .map((path) => hydrateSet(modules[path].default));

export { INSTRUMENT_SETS };
