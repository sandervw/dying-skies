# Sound design: generativefm vs Dying Skies

*Sourced from: https://github.com/generativefm/generators*

Pure sound and note quality only. Scheduling, ordering and playback are out of scope. Sources: `generativefm/generators` utilities and four piece sources, against `musicSoundService.ts`, `musicEngineService.ts`.

## 1. Source material

He is 100% recorded samples (VSCO2, VCSL, SSO: piano, violins, cello, trumpet, didgeridoo, darbuka, female chorus, whales, waves). We are 100% oscillators (saw, fatsaw, sine, triangle, pulse, pink noise), rendered to one buffer per role at bake time. Both engines play buffers; his carry recorded noise, bow scrape, room and inharmonicity, ours carry a mathematically clean spectrum that repeats identically on every trigger.

## 2. Loudness

`wrapActivate` puts a default `Tone.Compressor` on every piece, fed by a piece gain node (`Gain(pieceGain) -> Compressor -> destination`). In `wrapActivate`, gain comes from `gain.json` (0.875 to 19.5, found offline by a 60-second binary search targeting -2 to -1 dBFS), while instrument trims are in decibels (`Volume(-5)`).

We use the same bus topology (`Gain(fade) -> Gain(gain) -> Compressor -> destination`), but compute gain dynamically as `min(1, 0.7 / peakSum)` using baked voice peak and overlap density. Per-role trims are linear.

## 3. What we do that he does not

Static per-voice filters with stated rolloff and Q; per-note `filterEnvelope` on Mono and Duo synths; FM and AM timbre by `harmonicity` and `modulationIndex`; unison detune via `fatsawtooth` spread; and a fully seeded score (his `window.generativeMusic.rng` defaults to `Math.random`).

## 4. Note supply

He tosses diatonic seven-note collections across three or four octaves and moves by step (`MAX_STEP_DISTANCE` 2 to 3), reusing one phrase across instruments. We draw uniformly from five or six note pentatonic and whole-tone pools per role, per event, so vertical intervals between roles are arbitrary.
