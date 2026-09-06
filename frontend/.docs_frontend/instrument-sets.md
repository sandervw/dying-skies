# Reference: Instrument sets

Six sets, five roles each, thirty instruments. Each entry names the `soundscapes/` track holding its full spec sheet. Axes live in `plan.md`; modes and biomes live in `music-reference.md`.

## How to read an entry

```
#### role: Instrument name              (source track)
Tone type | voicing | register | hold | gain | send
osc ... | filter ... | filterEnv ...
amp A/D/S/R | portamento
fx: ordered chain
```

- **register**: base octave the role plays in, before the biome's `registerShift`. MIDI note is `(register + 1) * 12 + root + degree`.
- **hold**: note length in beats, before the envelope release.
- **gain**: per-instrument level into the bus. Tune by ear once all six sets render.
- **send**: gain into the biome's shared reverb.
- **voicing**: `mono` plays one note at a time and steals its own voice on overlap. `poly N` wraps the voice in `Tone.PolySynth` with `maxPolyphony: N`. `Tone.NoiseSynth` cannot be wrapped in `PolySynth` and takes no note.
- **filter**: a static `Tone.Filter` node in front of the chain. **filterEnv** is the native `filterEnvelope` option and appears only on `MonoSynth` and `DuoSynth`.
- `fatsawtooth` carries `count` and `spread` in its oscillator options.
- **fx**: `Chorus`, `StereoWidener`, `PingPongDelay`, `FeedbackDelay`, `Distortion`, `AutoFilter`, `AutoPanner`.

---

## 1. `morrowind` (`soundscapes/morrowind/`)

#### drone: Sub-Bass Foundation Drone  (12. Shed Your Travails)
`Tone.MonoSynth` | mono | register 1 | hold 8 | gain 0.9 | send 0.15
osc `triangle` | filter lowpass -24dB @ 140Hz | filterEnv A1.0 D1.5 S0.8 R2.0, octaves 0.5
amp A1.2 D2.0 S0.9 R3.0 | portamento 0.2s
fx: none

#### pad: Deep Warm Swell Pad  (12. Shed Your Travails)
`Tone.Synth` | poly 4 | register 3 | hold 6 | gain 0.5 | send 0.55
osc `fatsawtooth` count 3 spread 25 | filter lowpass -24dB @ 800Hz
amp A2.5 D3.0 S0.75 R4.0
fx: `Chorus` (0.8, 4.0, depth 0.6, wet 0.45), `StereoWidener` (0.8, wet 0.5)

#### sparkle: Ambient Glass FM Pluck  (12. Shed Your Travails)
`Tone.FMSynth` | poly 4 | register 5 | hold 2 | gain 0.45 | send 0.5
carrier `sine`, modulator `triangle` | harmonicity 3.5, modulationIndex 1.8 | filter lowpass -12dB @ 3200Hz
amp A0.01 D1.8 S0.15 R3.0 | detune spread 10 cents count 2
fx: `PingPongDelay` (`8n.`, feedback 0.5, wet 0.4)

#### lead: Ethereal High Whistle / Glass Lead  (12. Shed Your Travails)
`Tone.Synth` | mono | register 6 | hold 4 | gain 0.35 | send 0.6
osc `sine` | filter lowpass -12dB @ 5000Hz
amp A0.8 D1.5 S0.85 R2.5 | portamento 0.1s
fx: `Chorus` (1.5, 3.5, depth 0.4, wet 0.3), `FeedbackDelay` (`4n.`, feedback 0.45, wet 0.35)

#### counter: Ethereal Vocal / Formant Texture  (04. Over the Next Hill)
`Tone.AMSynth` | poly 4 | register 5 | hold 4 | gain 0.4 | send 0.6
carrier `sine`, modulator `sawtooth` | harmonicity 2.0 | filter bandpass -12dB @ 1800Hz
amp A1.2 D1.5 S0.7 R2.0 | detune spread 15 cents count 2
fx: `FeedbackDelay` (`4n`, feedback 0.4, wet 0.35), `AutoPanner` (0.15Hz, depth 0.4, wet 1.0)

---

## 2. `kingsfield` (`soundscapes/kings-field/`)

#### drone: Deep Ambient Sub-Drone  (04. Big Mine)
`Tone.MonoSynth` | mono | register 1 | hold 8 | gain 0.9 | send 0.2
osc `triangle` | filter lowpass -24dB @ 220Hz | filterEnv A0.8 D1.0 S1.0 R2.0, octaves 0.5
amp A0.8 D1.0 S1.0 R2.0 | portamento 0.3s
fx: `Distortion` (0.05, wet 0.15)

#### pad: Dark Evolving Resonant Pad  (03. Central Village)
`Tone.FMSynth` | poly 4 | register 2 | hold 6 | gain 0.5 | send 0.55
carrier `fatsawtooth` count 3 spread 18, modulator `sine` | harmonicity 1.5, modulationIndex 3.0 | filter lowpass -12dB @ 450Hz
amp A2.2 D1.8 S0.75 R3.5
fx: `Chorus` (0.5, 3.5, depth 0.7, wet 0.4), `FeedbackDelay` (`4n.`, feedback 0.35, wet 0.25)

#### sparkle: Glass FM Bell / Pluck  (05. East Village)
`Tone.FMSynth` | poly 3 | register 5 | hold 2 | gain 0.4 | send 0.5
carrier `sine`, modulator `sine` | harmonicity 3.5, modulationIndex 2.2 | filter lowpass -12dB @ 5000Hz
amp A0.005 D2.2 S0.0 R2.5 | detune spread 6 cents count 2
fx: `PingPongDelay` (`8n.`, feedback 0.45, wet 0.35)

#### lead: Swelling Resonant Vocal Horn  (05. East Village)
`Tone.MonoSynth` | mono | register 2 | hold 4 | gain 0.45 | send 0.6
osc `sawtooth` | filter bandpass -12dB @ 320Hz | filterEnv A1.4 D1.0 S0.5 R2.0, octaves 3.0
amp A1.2 D1.5 S0.75 R2.2 | portamento 0.25s
fx: `FeedbackDelay` (`4n`, feedback 0.3, wet 0.25)

#### counter: Metallic Ethereal Air / Whistle  (03. Central Village)
`Tone.NoiseSynth` | unpitched, mono | hold 6 | gain 0.25 | send 0.7
noise `pink` | filter bandpass -24dB @ 2200Hz, Q 6.0
amp A1.8 D2.0 S0.4 R3.0
fx: `PingPongDelay` (`8n`, feedback 0.45, wet 0.4), `AutoPanner` (0.15Hz, depth 0.7, wet 1.0)

---

## 3. `majorasmask` (`soundscapes/majoras-mask/`)

#### drone: Cinematic Cello / Bass Drone  (1-01. Title Theme)
`Tone.MonoSynth` | mono | register 2 | hold 8 | gain 0.8 | send 0.3
osc `sawtooth` | filter lowpass -24dB @ 320Hz | filterEnv A0.8 D1.5 S0.6 R2.0, octaves 1.5
amp A0.6 D1.8 S0.85 R2.2 | portamento 0.08s
fx: none

#### pad: Warm Orchestral String Pad  (1-01. Title Theme)
`Tone.Synth` | poly 6 | register 3 | hold 6 | gain 0.5 | send 0.45
osc `fatsawtooth` count 3 spread 18 | filter lowpass -24dB @ 1600Hz
amp A0.45 D1.2 S0.75 R1.8
fx: `Chorus` (1.5, 3.5, depth 0.6, wet 0.35)

#### sparkle: Crystalline Music Box / Celesta  (1-01. Title Theme)
`Tone.FMSynth` | poly 4 | register 6 | hold 2 | gain 0.4 | send 0.5
carrier `sine`, modulator `sine` | harmonicity 3.5, modulationIndex 2.2
amp A0.001 D1.4 S0.02 R1.5 | modulation envelope A0.001 D0.3 S0.0 R0.3
fx: `PingPongDelay` (`4n`, feedback 0.35, wet 0.25)

#### lead: Folk Whistle / Ocarina  (1-12. Guru-Guru's Song)
`Tone.Synth` | mono | register 5 | hold 3 | gain 0.4 | send 0.35
osc `sine` | filter lowpass -12dB @ 3200Hz
amp A0.06 D0.2 S0.85 R0.25 | portamento 0.04s
fx: `FeedbackDelay` (`4n`, feedback 0.3, wet 0.25)

#### counter: Oriental Harp / Koto Pluck  (1-01. Title Theme)
`Tone.MonoSynth` | poly 4 | register 4 | hold 2 | gain 0.45 | send 0.35
osc `triangle` | filter lowpass -12dB @ 900Hz | filterEnv A0.001 D0.25 S0.0 R0.5, octaves 3.0
amp A0.003 D0.75 S0.0 R0.6 | detune spread 5 cents
fx: `StereoWidener` (0.5, wet 0.4), `FeedbackDelay` (`8n.`, feedback 0.28, wet 0.22)

---

## 4. `deusex` (`soundscapes/deus-ex/`)

#### drone: Deep Cinematic Sub-Drone  (036 Liberty Island Part 1)
`Tone.MonoSynth` | mono | register 1 | hold 8 | gain 0.85 | send 0.35
osc `fatsawtooth` count 3 spread 15 | filter lowpass -24dB @ 110Hz | filterEnv A2.0 D1.0 S0.7 R3.0, octaves 0.8
amp A2.0 D0.0 S1.0 R3.5 | portamento 0.5s
fx: none

#### pad: Pumping Atmospheric Chords  (051 NYC Streets 1 Part 1)
`Tone.Synth` | poly 6 | register 3 | hold 4 | gain 0.5 | send 0.55
osc `fatsawtooth` count 3 spread 25 | filter lowpass -12dB @ 1400Hz
amp A0.35 D0.8 S0.75 R1.2
fx: `Chorus` (1.5, 3.5, depth 0.7, wet 0.4)

#### sparkle: Metallic Bell Pluck  (051 NYC Streets 1 Part 1)
`Tone.FMSynth` | poly 4 | register 4 | hold 2 | gain 0.4 | send 0.35
carrier `sine`, modulator `sawtooth` | harmonicity 3.5, modulationIndex 8 | filter lowpass -24dB @ 900Hz
amp A0.003 D0.45 S0.08 R0.5 | detune spread 12 cents count 2
fx: `FeedbackDelay` (`8n.`, feedback 0.35, wet 0.3)

#### lead: Resonant Vocal / Formant Lead  (051 NYC Streets 1 Part 1)
`Tone.DuoSynth` | mono | register 5 | hold 3 | gain 0.35 | send 0.4
voice 1 `pulse` width 0.35, voice 2 `triangle` | harmonicity 1.0 | filter bandpass -12dB @ 1800Hz | filterEnv A0.04 D0.2 S0.5 R0.2, octaves 1.2
amp A0.02 D0.3 S0.65 R0.35 | portamento 0.06s
fx: `PingPongDelay` (`8n`, feedback 0.4, wet 0.35)

#### counter: High Airy Ethereal Shimmer Bed  (036 Liberty Island Part 1)
`Tone.NoiseSynth` | unpitched, mono | hold 8 | gain 0.25 | send 0.75
noise `pink` | filter bandpass -12dB @ 3200Hz
amp A4.0 D2.5 S0.6 R5.0
fx: `StereoWidener` (0.9, wet 1.0), `Chorus` (0.2, 4.0, depth 0.8, wet 0.5)

---

## 5. `aom` (`soundscapes/age-of-mythology/`)

#### drone: Deep Organic Sub Bass  (07 Slaysenflite)
`Tone.MonoSynth` | mono | register 1 | hold 8 | gain 0.9 | send 0.15
osc `triangle` | filter lowpass -24dB @ 180Hz | filterEnv A0.01 D0.2 S0.6 R0.3, octaves 1.0
amp A0.01 D0.4 S0.75 R0.35 | portamento 0.05s
fx: `Distortion` (0.08, wet 0.15)

#### pad: Ethereal Choral Pad, "Aah" formant  (04 Never Mind the Slacks and Bashers)
`Tone.Synth` | poly 4 | register 3 | hold 6 | gain 0.5 | send 0.65
osc `fatsawtooth` count 3 spread 18 | filter bandpass -12dB @ 950Hz
amp A1.2 D0.8 S0.85 R2.4
fx: `Chorus` (1.2, 3.5, depth 0.6, wet 0.45), `FeedbackDelay` (`4n.`, feedback 0.4, wet 0.3)

#### sparkle: Kalimba / Mbira Tines  (06 Flavor Cats)
`Tone.FMSynth` | poly 8 | register 4 | hold 2 | gain 0.45 | send 0.35
carrier `sine`, modulator `triangle` | harmonicity 3.5, modulationIndex 8.0 | filter lowpass -12dB @ 3200Hz
amp A0.002 D0.9 S0.0 R0.6 | detune spread 4 cents count 2
fx: `Chorus` (1.5, 3.5, depth 0.3, wet 0.2), `FeedbackDelay` (`8n.`, feedback 0.22, wet 0.25)

#### lead: Middle-Eastern Plucked Lead, oud or saz  (03 Chocolate Outline)
`Tone.MonoSynth` | mono | register 4 | hold 2 | gain 0.45 | send 0.35
osc `sawtooth` | filter lowpass -24dB @ 1800Hz | filterEnv A0.002 D0.15 S0.1 R0.2, octaves 2.2
amp A0.003 D0.8 S0.0 R0.3 | portamento 0.035s
fx: `Chorus` (1.5, 3.5, depth 0.3, wet 0.25), `FeedbackDelay` (`8n.`, feedback 0.28, wet 0.22)

#### counter: Atmospheric Ambient Drone  (07 Slaysenflite)
`Tone.Synth` | poly 4 | register 2 | hold 6 | gain 0.45 | send 0.65
osc `fatsawtooth` count 3 spread 25
amp A1.8 D2.0 S0.9 R3.0
fx: `AutoFilter` (0.15Hz, baseFrequency 500Hz, octaves 2, wet 0.7)

---

## 6. `zoombinis` (`soundscapes/zoombinis/`)

#### drone: Sub-Bass Pulse / Drone  (02 Zoombini Isle)
`Tone.MonoSynth` | mono | register 1 | hold 8 | gain 0.85 | send 0.1
osc `triangle` | filter lowpass -24dB @ 180Hz | filterEnv A0.02 D0.4 S0.2 R0.6, octaves 1.5
amp A0.04 D0.6 S0.5 R0.8 | portamento 0.02s
fx: `Distortion` (0.1, wet 0.15)

#### pad: Warm Ambient Chord Pad  (01 Zoombiniville)
`Tone.Synth` | poly 6 | register 3 | hold 6 | gain 0.5 | send 0.55
osc `fatsawtooth` count 3 spread 15 | filter lowpass -24dB @ 1100Hz
amp A0.8 D1.5 S0.75 R2.2
fx: `Chorus` (0.8, 4.0, depth 0.7, wet 0.4)

#### sparkle: Glass Bell / Music Box Pluck  (02 Zoombini Isle)
`Tone.FMSynth` | poly 4 | register 5 | hold 2 | gain 0.4 | send 0.45
carrier `sine`, modulator `sine` | harmonicity 3.5, modulationIndex 12 | filter lowpass -12dB @ 8000Hz
amp A0.002 D1.2 S0.0 R1.0 | detune spread 5 cents count 2
fx: `FeedbackDelay` (`8n.`, feedback 0.35, wet 0.3)

#### lead: Airy Whistle / Flute Lead  (02 Zoombini Isle)
`Tone.MonoSynth` | mono | register 5 | hold 3 | gain 0.4 | send 0.5
osc `sine` | filter lowpass -12dB @ 2200Hz | filterEnv A0.08 D0.2 S0.7 R0.5, octaves 1.0
amp A0.08 D0.3 S0.75 R0.6 | portamento 0.06s
fx: `Chorus` (1.5, 3.5, depth 0.4, wet 0.25), `PingPongDelay` (`4n`, feedback 0.25, wet 0.2)

#### counter: Airy Ambient Swell  (08 Lion's Lair)
`Tone.NoiseSynth` | unpitched, mono | hold 8 | gain 0.25 | send 0.7
noise `pink` | filter bandpass -12dB @ 2200Hz
amp A2.2 D3.0 S0.3 R3.5
fx: `AutoPanner` (0.15Hz, depth 0.8, wet 1.0)
