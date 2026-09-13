import type * as Tone from "tone";

/** the five instrument slots every set fills. */
type Role = "bass" | "harmony" | "lead" | "counter" | "accent";

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
  readonly synth: SynthClass;
  readonly options: object;
  readonly polyphony?: number;
  readonly register?: number;
  readonly hold: number;
  readonly gain: number;
  readonly filter?: Partial<Tone.FilterOptions>;
  readonly effects: readonly EffectEntry[];
}

export type { Role, InstrumentSetName, SynthClass, EffectEntry, InstrumentSpec };
