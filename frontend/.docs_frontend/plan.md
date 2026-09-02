# Plan: Seed-Derived Music

Procedural music for each sky, generated from the seed like the palette and constellation. Values live in `music-reference.md` and `instrument-sets.md`.

## Goal

Every seed carries its own sound: an endless, non-repeating ambient drift with no audible loop point. Reopening a seed gives the same musical character with a fresh performance.

## Three axes

Variety comes from multiplying three independent seed picks. Nothing else is randomised.

- **Mode** picks the notes: one pool of five or six pitches every layer draws from.
- **Instrument set** picks the voices: one concrete synth, envelope, and effect chain per role.
- **Biome** picks the space and the arrangement: tempo, shared reverb, register shift, which roles play, and how dense each one is.

Five modes times six biomes times six instrument sets give 180 combinations.

## Chunked playback

Playback runs as roughly thirty second chunks, each rendered offline with `Tone.Offline` and played through plain `<audio>` elements (see `webaudio-fixes-reference.md`). Each chunk scatters its notes from a fresh seed and bakes its own tail, which rings over the next chunk's start so no seam is audible.

## Seed to music mapping

`deriveSeed(seed, "music")` yields an independent music stream. From it the seed picks: mode, root pitch class, biome, instrument set, and which of the biome's optional roles sound. Every other value is a constant looked up from those picks.

Each visit salts the per-chunk seeds, so the same seed gives the same character and a fresh unrepeating performance.

## Signal graph

Each spec holds its Tone constructors directly, so rendering is `new spec.synth(spec.options)` and `spec.effects.map(([Effect, options]) => new Effect(options))`.

Each instrument is one voice, an optional static filter, then its effect chain. The chain splits: dry to the bus, and a `send` gain to one shared reverb whose decay and wet come from the biome. The reverb returns to the bus; the bus feeds master gain and a limiter.

The chunk tail is the longest hold plus release across the sounding instruments, plus the biome's reverb decay, plus a margin.

## Not in the system

- Per-instrument LFOs. Movement comes from `AutoFilter`, `AutoPanner`, `Chorus`, and oscillator detune.
- Per-instrument reverbs, vibrato nodes, and filter envelopes on polyphonic voices. `MonoSynth` and `DuoSynth` keep their native `filterEnvelope`.
- Percussion, samplers, and `PluckSynth`.
- Seven effect types exist: `Chorus`, `StereoWidener`, `PingPongDelay`, `FeedbackDelay`, `Distortion`, `AutoFilter`, `AutoPanner`.
- The archetype layer, the tempo, reverb, density, and envelope jitter ranges, and the random layer count.

## Files

One new file. Everything else lands in files that already exist, each under 300 lines.

| File                             | State                  | Holds                                                        |
| -------------------------------- | ---------------------- | ------------------------------------------------------------ |
| `services/instrumentSets.ts`     | new, about 240 lines   | thirty specs, six sets, `EXCLUDED_PAIRINGS`                  |
| `types/music.ts`                 | edit                   | `InstrumentSpec` and `Score` replace `Archetype` and `Layer` |
| `services/musicService.ts`       | edit, 208 to about 150 | modes, the six biomes, `generateScore`, `buildChunkEvents`   |
| `services/audioRenderService.ts` | edit, 51 to about 110  | spec into Tone nodes, send bus, chunk render                 |
| `services/audioEncodeService.ts` | unchanged              | WAV encoding                                                 |
| `hooks/useSkyMusic.ts`           | unchanged              | chunk chaining, fades, mute                                  |

## Work

1. Delete from `musicService.ts`: `ARCHETYPE_RANGES`, `HOLD_BEATS`, `ROLE_DENSITY`, `ROLE_OCTAVE`, `ScoreRanges`, `DEFAULT_RANGES`, `randomInRange`, `generateLayer`. Delete `Archetype`, `Layer`, and `OscillatorType` from `types/music.ts`.
2. Write `instrumentSets.ts` from `instrument-sets.md`.
3. Rewrite `generateScore`: three picks plus optional-role selection, biome constants, no jitter.
4. Extend `audioRenderService.ts`: construct each spec's synth and effects, chain them, wire the send, compute the tail, add a limiter.
5. Balance pass: render one chunk of each set in `chamber` and level the gains by ear.
6. Timing pass: measure first-chunk render time per set on a throttled device.

## Start and stop

Render chunk zero on page load and hand it to an audio element; further chunks render ahead and chain as each one's music ends. On sky change, fade out and revoke the old chunks, then fade in the new score's chunk zero. Music plays on every sky including the root screensaver; only the gallery is silent.
