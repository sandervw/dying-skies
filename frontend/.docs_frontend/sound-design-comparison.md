# Sound design: generativefm vs Dying Skies

Pure sound and note quality only. Scheduling, ordering and playback are out of scope. Sources: `generativefm/generators` utilities and four piece sources, against `musicSoundService.ts`, `musicEngineService.ts`.

## 1. Source material

He is 100% recorded samples (VSCO2, VCSL, SSO: piano, violins, cello, trumpet, didgeridoo, darbuka, female chorus, whales, waves). We are 100% oscillators (saw, fatsaw, sine, triangle, pulse, pink noise). Every other difference below follows from this one. His notes carry recorded noise, bow scrape, room and inharmonicity; ours carry a mathematically clean spectrum that repeats identically on every trigger.

## 2. Pitch realization

`sampleNote` finds the nearest sampled note and resamples via `intervalToFrequencyRatio`. He deliberately renders only every other note (`notes.filter((_, i) => i % 2 === 0)`), so roughly half of all pitches are resampled a semitone off, shifting formants slightly. He also uses playback rate as timbre: `playbackRate: 0.25` on chorus samples, `pitchShift: -24` on violins, and a whole `createReverseSampler` for reversed buffers. Our `midiToFrequency` is exact equal temperament with zero per-note variance and no pitch-shift or reverse analogue.

## 3. Reverb architecture

He bakes reverb into the sample buffers offline, once, per instrument (`Freeverb {roomSize: 0.7, dampening: 6000}`, `Reverb(15)`, `Reverb(30)`), then plays wet buffers, so tails never collide in a shared tank. We run one shared `Tone.Convolver` per chunk with per-role sends, fed by an impulse rendered once per decay and reused, so the room is now stable across chunk boundaries.

Two consequences remain: our decays are far shorter (2.5 to 12s vs his 15 to 30s), and we have no HF damping in the tail, so ours stays as bright as the source while his darkens like a real space.

## 4. Modulation over time

`timbral-oscillations` drives `chorus.wet`, `pitchShift.wet` and tremolo depth from independent LFOs at `rng()/100` Hz, periods of minutes, mutually incommensurate. `above-the-rain` sweeps an `AutoFilter(rng()/100 + 0.01, 100, 4)`, four octaves. Our effects are constructed with fixed constants; the only motion is `AutoPanner` and `AutoFilter` pinned at 0.15 Hz on a handful of roles. Nothing in our timbre evolves within a chunk or across chunks.

## 5. Envelopes

He avoids ADSR on sources, using `fadeIn` / `fadeOut` with explicit `curve: 'linear'` (4 to 5 second linear fades). Our `shapeVoice` forces `sustain: 0, decayCurve: "linear", release: 0.01`, which converges on the same idea, but the length is fixed per role by `spec.hold`, identical for every note that role plays.

## 6. Loudness

`wrapActivate` puts a `Tone.Compressor` on every piece, fed by a measured per-piece gain from `gain.json` (0.875 to 19.5, found by a 60 second metered binary search targeting -2 to -1 dBFS). Per-instrument trims are in decibels (`Volume(-5)`, `volume.value = -8`). We measure too, but at runtime and on average level rather than peak: chunk zero of each score is scanned for RMS and peak, and one gain normalizing RMS to 0.06, clamped so peak stays under 0.7, applies to every chunk of that score. Per-role gains are still linear and chosen by ear, and we run `Limiter(-3)` with no compressor.

## 7. Output fidelity

We render at `SAMPLE_RATE = 44100` and encode 16-bit WAV; he renders at context rate and ships ogg. Bandwidth now matches, so what is left is container cost, not fidelity: our chunks are uncompressed and held only in memory.

## 8. What we do that he does not

Static per-voice filters with stated rolloff and Q; per-note `filterEnvelope` on Mono and Duo synths; FM and AM timbre by `harmonicity` and `modulationIndex`; unison detune via `fatsawtooth` spread; a 35 Hz master highpass; a true limiter; and a fully seeded score (his `window.generativeMusic.rng` defaults to `Math.random`).

## 9. Note supply

He tosses diatonic seven-note collections across three or four octaves and moves by step (`MAX_STEP_DISTANCE` 2 to 3), reusing one phrase across instruments. We draw uniformly from five or six note pentatonic and whole-tone pools per role, per event, so vertical intervals between roles are arbitrary.
