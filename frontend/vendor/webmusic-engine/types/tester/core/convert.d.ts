/** Types for convert.js. */
import type { InstrumentSpec, Patch, PlayHint } from "../../engines/spec/api.js";

/** One Dying Skies instrument as stored in its set JSON. */
export interface ToneInstrument {
  readonly synth: string;
  readonly options?: object;
  readonly polyphony?: number;
  readonly register?: number;
  readonly hold?: number;
  readonly gain: number;
  readonly filter?: object;
  readonly effects?: readonly (readonly (string | object)[])[];
  readonly name?: string;
  readonly note?: string;
}

/** Room size matching the old tester's six-second reverb. */
export const REVERB_ROOM: number;

/** One spec instrument from a set role or kit piece. */
export function instrumentSpec(id: string, raw: ToneInstrument, reverbSend: number): InstrumentSpec;

/** Patch, roles and pre-render hints for a set role or a set's kit ({ pieces }). */
export function testRig(raw: object, role: string, notes: readonly string[], reverbSend: number): {
  patch: Patch;
  roles: Record<string, string>;
  hints: Record<string, PlayHint>;
};
