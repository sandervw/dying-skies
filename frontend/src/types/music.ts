import type * as Tone from "tone";

/** the six instrument slots a set can fill. */
type Role = "bass" | "harmony" | "lead" | "counter" | "accent" | "percussion";

/** allowed instrument types per role; synth-leaning and minimal. */
const ROLE_INSTRUMENTS = {
  bass: ["sub", "pluck", "noise"],
  harmony: ["pad", "strings", "choir"],
  lead: ["bell", "pluck", "keys", "winds"],
  counter: ["pad", "strings", "swell", "choir"],
  accent: ["bell", "sparkle", "pluck"],
  percussion: ["kick", "hat", "tom"],
} as const;

/** every instrument type, derived from the role lists. */
type InstrumentType = (typeof ROLE_INSTRUMENTS)[Role][number];

/** the instrument sets, one voice per role. */
type InstrumentSetName =
  | "kingsfield" | "majorasmask" | "deusex" | "zoombinis"
  | "aindulmedir" | "ogresound";

/** any Tone voice class; options are checked by Tone at runtime. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SynthClass = new (options?: any) => Tone.Synth | Tone.FMSynth | Tone.AMSynth | Tone.MonoSynth | Tone.DuoSynth | Tone.NoiseSynth;

/** any Tone effect class plus its constructor options. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EffectEntry = readonly [new (options?: any) => Tone.ToneAudioNode & { start?: () => unknown }, object];

/** one concrete voice: synth, static filter, effect chain, and levels. */
interface InstrumentSpec {
  readonly type: InstrumentType;
  readonly synth: SynthClass;
  readonly options: object;
  readonly polyphony?: number;
  readonly register?: number;
  readonly hold: number;
  readonly gain: number;
  readonly filter?: Partial<Tone.FilterOptions>;
  readonly effects: readonly EffectEntry[];
}

export { ROLE_INSTRUMENTS };
export type { Role, InstrumentType, InstrumentSetName, SynthClass, EffectEntry, InstrumentSpec };
