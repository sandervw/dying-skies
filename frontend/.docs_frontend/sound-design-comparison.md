# Sound design: generativefm vs Dying Skies

*Sourced from: https://github.com/generativefm/generators*

Pure sound and note quality only. Scheduling, ordering and playback are out of scope. Sources: `generativefm/generators` utilities and four piece sources, against `musicSoundService.ts`, `musicEngineService.ts`.

## 1. Source material

He is 100% recorded samples (VSCO2, VCSL, SSO: piano, violins, cello, trumpet, didgeridoo, darbuka, female chorus, whales, waves). We are 100% oscillators (saw, fatsaw, sine, triangle, pulse, pink noise), rendered to one buffer per role at bake time. Both engines play buffers; his carry recorded noise, bow scrape, room and inharmonicity, ours carry a mathematically clean spectrum that repeats identically on every trigger.

## 2. Pitch realization

`sampleNote` finds the nearest sampled note and resamples via `intervalToFrequencyRatio`. He deliberately renders only every other note (`notes.filter((_, i) => i % 2 === 0)`), so roughly half of all pitches are resampled a semitone off, shifting formants slightly. He also uses playback rate as timbre: `playbackRate: 0.25` on chorus samples, `pitchShift: -24` on violins, and a whole `createReverseSampler` for reversed buffers.

We bake each role once, at the middle degree of the mode, and reach every other pitch by `playbackRate`. Deviation runs about five semitones either way, which shifts formants further than his does and scales note length with pitch. We have no pitch-shift or reverse analogue.

## 3. Reverb architecture

He bakes reverb into the sample buffers offline, once, per instrument (`Freeverb {roomSize: 0.7, dampening: 6000}`, `Reverb(15)`, `Reverb(30)`), then plays wet buffers. We bake reverb the same way, one `Tone.Convolver` per role inside its offline render, fed by an impulse rendered once per decay. Tails sum independently for us too.

Our decays run 2.5 to 12s against his 15 to 30s, and our tails carry no HF damping.

## 4. Modulation over time

`timbral-oscillations` drives `chorus.wet`, `pitchShift.wet` and tremolo depth from independent LFOs at `rng()/100` Hz, periods of minutes, mutually incommensurate. `above-the-rain` sweeps an `AutoFilter(rng()/100 + 0.01, 100, 4)`, four octaves.

Our effects are constructed with fixed constants and baked into each one-shot, so `AutoPanner` and `AutoFilter` become one fixed gesture repeated identically by every note of that role.

## 5. Loudness

`wrapActivate` puts a `Tone.Compressor` on every piece, fed by a measured per-piece gain from `gain.json` (0.875 to 19.5, found by a 60 second metered binary search targeting -2 to -1 dBFS). Per-instrument trims are in decibels (`Volume(-5)`, `volume.value = -8`).

We measure each baked voice's peak, weight it by the square root of that role's average note overlap, and set one master gain per score so the sum stays under 0.7. Per-role gains are linear and chosen by ear. Our bus compressor is `-12 dBFS, 4:1, 0.05s attack, 0.5s release`.

## 6. What we do that he does not

Static per-voice filters with stated rolloff and Q; per-note `filterEnvelope` on Mono and Duo synths; FM and AM timbre by `harmonicity` and `modulationIndex`; unison detune via `fatsawtooth` spread; and a fully seeded score (his `window.generativeMusic.rng` defaults to `Math.random`).

## 7. Note supply

He tosses diatonic seven-note collections across three or four octaves and moves by step (`MAX_STEP_DISTANCE` 2 to 3), reusing one phrase across instruments. We draw uniformly from five or six note pentatonic and whole-tone pools per role, per event, so vertical intervals between roles are arbitrary.
