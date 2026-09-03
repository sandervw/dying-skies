# Reference: Music generation data

Values for the three seed-picked axes. Instrument parameters live in `instrument-sets.md`; structure lives in `plan.md`.

## Axes

The seed picks one mode, one biome, and one instrument set. Five modes times six biomes times six sets give 180 combinations.

## Modes

Semitone offsets from the root. Five notes each, six for whole-tone.

| Mode              | Offsets          | Feel               |
| ----------------- | ---------------- | ------------------ |
| major-pentatonic  | `[0,2,4,7,9]`    | bright, open       |
| minor-pentatonic  | `[0,3,5,7,10]`   | moody, bluesy      |
| dorian-pentatonic | `[0,2,3,7,9]`    | minor, hopeful     |
| lydian-pentatonic | `[0,2,4,6,11]`   | floating, ethereal |
| whole-tone        | `[0,2,4,6,8,10]` | weightless, hazy   |

## Roles

Five slots an instrument set fills. Every set defines all five.

| Role    | Register    | Function                    |
| ------- | ----------- | --------------------------- |
| drone   | low         | the anchor                  |
| pad     | mid         | the harmonic bed            |
| sparkle | high        | bells and plucks            |
| lead    | mid to high | a single singing voice      |
| counter | low to mid  | a second texture or air bed |

## Biomes

Space and arrangement. Each biome fixes tempo, the shared reverb, register shift, and which roles play. Required roles always sound; the seed picks a random subset of the optional roles, so layer overlap varies per sky.

| Biome    | Tempo | Reverb decay | Reverb wet | Register shift | Required            | Optional         |
| -------- | ----- | ------------ | ---------- | -------------- | ------------------- | ---------------- |
| cavern   | 48    | 9.0s         | 0.65       | -1             | drone, pad          | sparkle, counter |
| chamber  | 72    | 2.5s         | 0.30       | 0              | pad, sparkle, lead  | drone, counter   |
| expanse  | 58    | 6.0s         | 0.50       | 0              | drone, pad, lead    | sparkle, counter |
| veil     | 44    | 12.0s        | 0.75       | +1             | pad, counter        | sparkle          |
| scatter  | 84    | 4.0s         | 0.45       | +1             | sparkle, lead       | pad, counter     |
| undertow | 52    | 7.0s         | 0.55       | -1             | drone, pad, counter | lead             |

## Density

Events per bar, per biome, per role. Fixed values, no jitter.

| Biome    | drone | pad  | sparkle | lead | counter |
| -------- | ----- | ---- | ------- | ---- | ------- |
| cavern   | 0.15  | 0.40 | 0.80    | 0.30 | 0.30    |
| chamber  | 0.25  | 0.80 | 1.60    | 0.80 | 0.60    |
| expanse  | 0.20  | 0.60 | 1.00    | 0.50 | 0.40    |
| veil     | 0.10  | 0.30 | 0.50    | 0.20 | 0.25    |
| scatter  | 0.25  | 0.80 | 2.20    | 1.20 | 0.50    |
| undertow | 0.20  | 0.50 | 0.60    | 0.35 | 0.40    |

## Instrument sets

| Set         | Character                                                         |
| ----------- | ----------------------------------------------------------------- |
| morrowind   | cinematic, swelling saw pads, high whistle, glass chime           |
| kingsfield  | cold and subterranean, metallic FM pad, formant horn, hiss        |
| majorasmask | acoustic and dry, bowed strings, celesta, ocarina, koto           |
| deusex      | synthetic, supersaw bed, FM strikes, reedy lead, noise shimmer    |
| aom         | world and ritual, kalimba, oud, formant choir, filtered floor     |
| zoombinis   | bright and buoyant, music box, soft flute, chord pad, misty swell |

## Blacklist

`EXCLUDED_PAIRINGS` holds `[Biome, InstrumentSet]` pairs the seed may not pick. The array is empty by default.

## Global values

- Root pitch class: 0 to 11, picked per seed.
- Chunks: about thirty seconds of music each, plus a computed tail.
- Master gain: none; each score is RMS-normalized after render, into a limiter at -3 dBFS.
