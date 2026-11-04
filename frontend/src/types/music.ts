/** the five instrument slots every set fills. */
type Role = "bass" | "harmony" | "lead" | "counter" | "accent";

/** one voice as stored in set JSON; the engine converts it. */
interface InstrumentSpec {
  readonly synth: string;
  readonly options: object;
  readonly polyphony?: number;
  readonly register?: number;
  readonly hold: number;
  readonly gain: number;
  readonly filter?: object;
  readonly effects: readonly (readonly [string, object])[];
}

export type { Role, InstrumentSpec };
