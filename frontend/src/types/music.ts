import type * as Tone from "tone";

/** the six spaces; each fixes tempo, reverb, register, and arrangement. */
type Biome = "cavern" | "chamber" | "expanse" | "veil" | "scatter" | "undertow";

/** the five consonance modes; each is a small pool of in-key notes. */
type Mode =
  | "major-pentatonic"
  | "minor-pentatonic"
  | "dorian-pentatonic"
  | "lydian-pentatonic"
  | "whole-tone";

/** the five instrument slots every set fills. */
type Role = "drone" | "pad" | "sparkle" | "lead" | "counter";

/** the six instrument sets, one voice per role. */
type InstrumentSetName = "morrowind" | "kingsfield" | "majorasmask" | "deusex" | "aom" | "zoombinis";

/** any Tone voice class; options are checked by Tone at runtime. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SynthClass = new (options?: any) => Tone.Synth | Tone.FMSynth | Tone.AMSynth | Tone.MonoSynth | Tone.DuoSynth | Tone.NoiseSynth;

/** any Tone effect class plus its constructor options. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EffectEntry = readonly [new (options?: any) => Tone.ToneAudioNode & { start?: () => unknown }, object];

/** one concrete voice: synth, static filter, effect chain, and levels. */
interface InstrumentSpec {
  readonly synth: SynthClass;
  readonly options: object;
  readonly polyphony?: number;
  readonly register: number;
  readonly hold: number;
  readonly gain: number;
  readonly send: number;
  readonly filter?: Partial<Tone.FilterOptions>;
  readonly effects: readonly EffectEntry[];
}

/** the seed's three picks plus root and sounding roles; constants follow. */
interface Score {
  readonly seed: number;
  readonly mode: Mode;
  readonly rootPitchClass: number;
  readonly biome: Biome;
  readonly instrumentSet: InstrumentSetName;
  readonly roles: readonly Role[];
}

export type { Biome, Mode, Role, InstrumentSetName, SynthClass, EffectEntry, InstrumentSpec, Score };
