# Reference: Music generation data

Values for the three seed-picked axes.

## Axes

The seed picks one mode, one preset, and one instrument set. Eight modes times six presets times six sets give 288 combinations.

## Modes

Semitone offsets from the root. Five notes each, six for whole-tone.

| Mode              | Offsets          | Feel               |
| ----------------- | ---------------- | ------------------ |
| major-pentatonic  | `[0,2,4,7,9]`    | bright, open       |
| minor-pentatonic  | `[0,3,5,7,10]`   | moody, bluesy      |
| dorian-pentatonic | `[0,2,3,7,9]`    | minor, hopeful     |
| lydian-pentatonic | `[0,2,4,6,11]`   | floating, ethereal |
| whole-tone        | `[0,2,4,6,8,10]` | weightless, hazy   |
| egyptian          | `[0,2,5,7,10]`   | open, suspended    |
| ritusen           | `[0,2,5,7,9]`    | bright, folk       |
| man-gong          | `[0,3,5,8,10]`   | dark, wistful      |

## Presets

Space and arrangement. Each preset fixes tempo, the shared reverb, register shift, and which roles play.

| Preset   | Tempo | Reverb decay | Reverb wet | Register shift | Instruments                        |
| -------- | ----- | ------------ | ---------- | -------------- | ---------------------------------- |
| cavern   | 56    | 9.0s         | 0.65       | 0              | bass, harmony, accent, counter       |
| chamber  | 80    | 2.5s         | 0.30       | +1             | bass, harmony, accent, lead          |
| expanse  | 66    | 6.0s         | 0.50       | +1             | bass, harmony, accent, lead, counter |
| veil     | 52    | 12.0s        | 0.75       | +2             | harmony, accent, counter             |
| scatter  | 92    | 4.0s         | 0.45       | +2             | harmony, accent, lead, counter       |
| undertow | 60    | 7.0s         | 0.55       | 0              | bass, harmony, lead, counter         |

## Density

Events per bar, per preset, per role. Fixed values, no jitter.

| Preset   | bass  | harmony | accent | lead | counter |
| -------- | ----- | ------- | ------ | ---- | ------- |
| cavern   | 0.30  | 0.60 | 0.80    | 0.30 | 0.60    |
| chamber  | 0.25  | 0.80 | 1.60    | 0.80 | 0.60    |
| expanse  | 0.20  | 0.60 | 1.00    | 0.50 | 0.40    |
| veil     | 0.20  | 0.60 | 0.50    | 0.20 | 0.50    |
| scatter  | 0.25  | 0.80 | 2.20    | 1.20 | 0.50    |
| undertow | 0.20  | 0.50 | 0.60    | 0.35 | 0.40    |

## Instrument sets

| Set         | Character                                                         |
| ----------- | ----------------------------------------------------------------- |
| lunacid     | hazy and moonlit, warm sub, saw pad, FM bells, breathy lead       |
| unexplained | eerie and raw, distorted saw sub, buzzy pad, reedy leads, FM haze |
| deusex      | synthetic, supersaw bed, FM strikes, reedy lead, noise shimmer    |
| zoombinis   | bright and buoyant, music box, soft flute, chord pad, misty swell |
| aom         | driven and gritty, distorted sub, bright FM bell, biting saw lead |
| ogresound   | cinematic and cavernous, saw swell, glassy pluck, kinetic lead    |

## Score

Purely randomly generated. Not seed-derived; see only picks mode+preset+instrument-set.
