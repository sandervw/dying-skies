/** the six timbral biomes; each maps roles to archetypes and leans register and density. */
type Biome =
  | "glass"
  | "warm-drift"
  | "deep-drone"
  | "haze"
  | "chime-rain"
  | "ember";

/** the five consonance modes; each is a small pool of in-key notes. */
type Mode =
  | "major-pentatonic"
  | "minor-pentatonic"
  | "dorian-pentatonic"
  | "lydian-pentatonic"
  | "whole-tone";

/** the ranked layer roles; the top N are taken for a layer count of N. */
type Role = "drone" | "pad" | "sparkle" | "accent" | "counter";

/** the four timbre archetypes an instrument can take. */
type Archetype = "drone" | "pad" | "bell" | "pluck";

/** oscillator waveforms shared across archetypes. */
type OscillatorType = "sine" | "triangle" | "sawtooth";

/** one playable layer: role, timbre, register, and density. */
interface Layer {
  readonly role: Role;
  readonly archetype: Archetype;
  readonly oscillator: OscillatorType;
  readonly octave: number;
  readonly density: number;
  readonly attack: number;
  readonly decay: number;
  readonly sustain: number;
  readonly release: number;
  readonly cutoff: number;
}

/** a full static score for one seed; playback unfolds live per session. */
interface Score {
  readonly seed: number;
  readonly biome: Biome;
  readonly mode: Mode;
  readonly rootPitchClass: number;
  readonly tempo: number;
  readonly reverbWet: number;
  readonly reverbDecay: number;
  readonly layers: readonly Layer[];
}

export type { Biome, Mode, Role, Archetype, OscillatorType, Layer, Score };
