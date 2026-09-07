# Reference: Instrument sets

---

## 1. `morrowind` (`soundscapes/morrowind/`)

#### drone: Low Sub Drone  (10. Silt Sunrise)
* **Role:** Drone
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Register 1; sounds C1 only
* **Hold / Gain:** `8 beats` (8.57s) / `0.9`
* **Oscillator Configuration:**
  * Type: `triangle`
  * Polyphony / Voicing: Monophonic (single voice)
  * Harmonicity / Modulation Index: N/A
  * Modulation Envelope: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `1.8s`
  * Decay: `0.5s`
  * Sustain: `1.0`
  * Release: `3.0s`
* **Filter Envelope & Cutoff:**
  * Filter Type: internal `lowpass` (12 dB/oct, Tone default) plus external `lowpass` (24 dB/oct) fixed at `140Hz`
  * Base Cutoff: `200Hz` (Tone default; not set in code)
  * Envelope Amount / Octaves: `0.5`, sweeping `200Hz - 283Hz`
  * Attack: `2.0s` | Decay: `1.0s` | Sustain: `1.0` | Release: `3.0s`
* **Brightness & Timbre:** Very dark, sub-heavy, felt more than heard
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None (single triangle)
  * LFO Destinations: None
  * Portamento / Glide: `0.2s`
* **FX Chain:**
  1. None

#### pad: Orchestral String Section  (02. Peaceful Waters)
* **Role:** Pad
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Register 3; sounds D#3, F3, G3, A#3
* **Hold / Gain:** `6 beats` (6.43s) / `0.5`
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (6 voices)
  * Harmonicity / Modulation Index: N/A
  * Modulation Envelope: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `1.8s`
  * Decay: `1.2s`
  * Sustain: `0.85`
  * Release: `2.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: external `lowpass` (24 dB/oct)
  * Base Cutoff: `600Hz`
  * Envelope Amount / Octaves: None; `Tone.Synth` has no internal filter, so the cutoff is static
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Warm, broad, slow-swelling string bed
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: `spread: 25 cents`, `count: 3`
  * LFO Destinations: Chorus delay time (internal to the FX)
  * Portamento / Glide: `0.0s` (Tone default)
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 1.5`, `delayTime: 3.5`, `depth: 0.7`, `wet: 0.4`)
  2. `Tone.StereoWidener` (`width: 0.8`, `wet: 1.0`)

#### sparkle: Airy Shimmer Texture  (02. Peaceful Waters)
* **Role:** Sparkle
* **Tone.js Type:** `Tone.PolySynth(Tone.FMSynth)`
* **Register / Note Range:** Register 6; sounds D#6, F6, G6, A#6, C7
* **Hold / Gain:** `2 beats` (2.14s) / `0.35`
* **Oscillator Configuration:**
  * Type: carrier `sine`, modulator `sine`
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: `3.01` / `2.0`
  * Modulation Envelope: Tone default (A `0.5s`, D `0s`, S `1.0`, R `0.5s`)
* **Amplitude Envelope (ADSR):**
  * Attack: `0.6s`
  * Decay: `2.0s`
  * Sustain: `0.6`
  * Release: `3.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: external `highpass` (12 dB/oct)
  * Base Cutoff: `2500Hz`
  * Envelope Amount / Octaves: None; `Tone.FMSynth` has no internal filter, so the cutoff is static
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Thin, glassy, air-only shimmer with a long tail
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: Stereo position, via `AutoPanner` at `0.2Hz`
  * Portamento / Glide: `0.0s` (Tone default)
* **FX Chain:**
  1. `Tone.FeedbackDelay` (`delayTime: 0.375`, `feedback: 0.45`, `wet: 0.35`)
  2. `Tone.AutoPanner` (`frequency: 0.2`, `depth: 0.7`, `wet: 1.0`)

#### lead: Plucked Acoustic Harp  (02. Peaceful Waters)
* **Role:** Lead
* **Tone.js Type:** `Tone.PolySynth(Tone.FMSynth)`
* **Register / Note Range:** Register 5; sounds D#5, F5, G5, A#5
* **Hold / Gain:** `3 beats` (3.21s) / `0.4`
* **Oscillator Configuration:**
  * Type: carrier `sine`, modulator `triangle`
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: `3.5` / `1.8`
  * Modulation Envelope: Tone default (A `0.5s`, D `0s`, S `1.0`, R `0.5s`)
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `0.85s`
  * Sustain: `0.0`
  * Release: `1.2s`
* **Filter Envelope & Cutoff:**
  * Filter Type: external `lowpass` (12 dB/oct)
  * Base Cutoff: `4500Hz`
  * Envelope Amount / Octaves: None; static cutoff
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Soft-edged plucked string, bright attack decaying to nothing
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: None
  * Portamento / Glide: `0.0s` (Tone default)
* **FX Chain:**
  1. `Tone.FeedbackDelay` (`delayTime: 8n.`, `feedback: 0.35`, `wet: 0.3`)

#### counter: Cinematic Brass Ensemble  (02. Peaceful Waters)
* **Role:** Counter
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Register 2; sounds C2, F2
* **Hold / Gain:** `6 beats` (6.43s) / `0.4`
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: N/A
  * Modulation Envelope: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `2.0s`
  * Decay: `1.5s`
  * Sustain: `0.8`
  * Release: `2.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: external `lowpass` (24 dB/oct)
  * Base Cutoff: `900Hz`
  * Envelope Amount / Octaves: None; static cutoff, but the `AutoFilter` below adds its own sweep
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Heavy, slow brass swell sitting under everything else
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: `spread: 18 cents`, `count: 3`
  * LFO Destinations: `AutoFilter` cutoff, sine at `0.12Hz` over `500Hz - 2000Hz`
  * Portamento / Glide: `0.0s` (Tone default)
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 0.5`, `delayTime: 3.5`, `depth: 0.6`, `wet: 0.4`)
  2. `Tone.AutoFilter` (`frequency: 0.12`, `baseFrequency: 500`, `octaves: 2`, `wet: 0.6`)

---

## 2. `kingsfield` (`soundscapes/kings-field/`)

#### drone: Deep Synth Drone  (04. Big Mine)
* **Role:** Drone
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Register 1; sounds C1 only
* **Hold / Gain:** `8 beats` (8.57s) / `0.9`
* **Oscillator Configuration:**
  * Type: `triangle`
  * Polyphony / Voicing: Monophonic (single voice)
  * Harmonicity / Modulation Index: N/A
  * Modulation Envelope: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `0.8s`
  * Decay: `1.0s`
  * Sustain: `1.0`
  * Release: `2.0s`
* **Filter Envelope & Cutoff:**
  * Filter Type: internal `lowpass` (12 dB/oct, Tone default) plus external `lowpass` (24 dB/oct) fixed at `220Hz`
  * Base Cutoff: `200Hz` (Tone default; not set in code)
  * Envelope Amount / Octaves: `0.5`, sweeping `200Hz - 283Hz`
  * Attack: `0.8s` | Decay: `1.0s` | Sustain: `1.0` | Release: `2.0s`
* **Brightness & Timbre:** Dark, dirty low rumble with a faint edge from the distortion
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None (single triangle)
  * LFO Destinations: None
  * Portamento / Glide: `0.3s`
* **FX Chain:**
  1. `Tone.Distortion` (`distortion: 0.05`, `wet: 0.15`)

#### pad: Warm Synth Pad  (04. Big Mine)
* **Role:** Pad
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Register 3; sounds D#3, F3, G3, A#3
* **Hold / Gain:** `6 beats` (6.43s) / `0.5`
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (6 voices)
  * Harmonicity / Modulation Index: N/A
  * Modulation Envelope: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `1.8s`
  * Decay: `2.0s`
  * Sustain: `0.85`
  * Release: `3.0s`
* **Filter Envelope & Cutoff:**
  * Filter Type: external `lowpass` (24 dB/oct)
  * Base Cutoff: `1200Hz`
  * Envelope Amount / Octaves: None; static cutoff
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Warm, ethereal, dreamlike, quite open at the top
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: `spread: 20 cents`, `count: 3`
  * LFO Destinations: Chorus delay time (internal to the FX)
  * Portamento / Glide: `0.0s` (Tone default)
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 0.8`, `delayTime: 4.0`, `depth: 0.7`, `wet: 0.5`)
  2. `Tone.StereoWidener` (`width: 0.7`, `wet: 0.6`)

#### sparkle: Crystalline Chimes  (05. East Village)
* **Role:** Sparkle
* **Tone.js Type:** `Tone.PolySynth(Tone.FMSynth)`
* **Register / Note Range:** Register 5; sounds D#5, F5, G5, A#5, C6
* **Hold / Gain:** `2 beats` (2.14s) / `0.4`
* **Oscillator Configuration:**
  * Type: carrier `sine`, modulator `sine`
  * Polyphony / Voicing: Polyphonic (3 voices)
  * Harmonicity / Modulation Index: `3.5` / `2.2`
  * Modulation Envelope: Tone default (A `0.5s`, D `0s`, S `1.0`, R `0.5s`)
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `2.2s`
  * Sustain: `0.0`
  * Release: `2.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: external `lowpass` (12 dB/oct)
  * Base Cutoff: `5000Hz`
  * Envelope Amount / Octaves: None; static cutoff
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Bright, glassy, bell-like, rings out well past the note
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: None
  * Portamento / Glide: `0.0s` (Tone default)
* **FX Chain:**
  1. `Tone.PingPongDelay` (`delayTime: 8n.`, `feedback: 0.45`, `wet: 0.35`)

#### lead: Plucked Synth Lead  (04. Big Mine)
* **Role:** Lead
* **Tone.js Type:** `Tone.PolySynth(Tone.FMSynth)`
* **Register / Note Range:** Register 4; sounds D#4, F4, G4, A#4
* **Hold / Gain:** `3 beats` (3.21s) / `0.4`
* **Oscillator Configuration:**
  * Type: carrier `sine`, modulator `sine`
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: `3.5` / `8.0`
  * Modulation Envelope: Tone default (A `0.5s`, D `0s`, S `1.0`, R `0.5s`)
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `0.6s`
  * Sustain: `0.1`
  * Release: `0.8s`
* **Filter Envelope & Cutoff:**
  * Filter Type: external `lowpass` (12 dB/oct)
  * Base Cutoff: `3500Hz`
  * Envelope Amount / Octaves: None; static cutoff
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Metallic and bell-like; the high modulation index gives it a hard, clangy attack
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: Chorus delay time (internal to the FX)
  * Portamento / Glide: `0.0s` (Tone default)
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 1.5`, `delayTime: 3.5`, `depth: 0.4`, `wet: 0.35`)
  2. `Tone.FeedbackDelay` (`delayTime: 8n.`, `feedback: 0.45`, `wet: 0.35`)

#### counter: Ethereal Vocal Choir  (05. East Village)
* **Role:** Counter
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Register 4; sounds C4, F4
* **Hold / Gain:** `6 beats` (6.43s) / `0.32`
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: N/A
  * Modulation Envelope: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `1.4s`
  * Decay: `1.5s`
  * Sustain: `0.75`
  * Release: `2.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: external `bandpass` (12 dB/oct), `Q: 1.6`
  * Base Cutoff: `900Hz`
  * Envelope Amount / Octaves: None; static cutoff
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Vocal and hollow; the bandpass scoops out the lows and highs to imitate a choir vowel
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: `spread: 22 cents`, `count: 3`
  * LFO Destinations: Chorus delay time (internal to the FX)
  * Portamento / Glide: `0.0s` (Tone default)
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 0.8`, `delayTime: 4.0`, `depth: 0.7`, `wet: 0.5`)
  2. `Tone.StereoWidener` (`width: 0.85`, `wet: 0.8`)

---

## 3. `majorasmask` (`soundscapes/majoras-mask/`)

#### drone: Sub Drone  (1-05. Majora's Theme)
* **Role:** Drone
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Register 1; sounds C1 only
* **Hold / Gain:** `8 beats` (8.57s) / `0.85`
* **Oscillator Configuration:**
  * Type: `triangle`
  * Polyphony / Voicing: Monophonic (single voice)
  * Harmonicity / Modulation Index: N/A
  * Modulation Envelope: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `0.08s`
  * Decay: `0.5s`
  * Sustain: `0.85`
  * Release: `0.6s`
* **Filter Envelope & Cutoff:**
  * Filter Type: internal `lowpass` (12 dB/oct, Tone default) plus external `lowpass` (24 dB/oct) fixed at `180Hz`
  * Base Cutoff: `200Hz` (Tone default; not set in code)
  * Envelope Amount / Octaves: `0.8`, sweeping `200Hz - 348Hz`, settling at `320Hz`
  * Attack: `0.08s` | Decay: `0.5s` | Sustain: `0.85` | Release: `0.6s`
* **Brightness & Timbre:** Dark and blunt, with a fast attack that makes each note land as a thud
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None (single triangle)
  * LFO Destinations: None
  * Portamento / Glide: `0.05s`
* **FX Chain:**
  1. None

#### pad: French Horn Ensemble  (1-05. Majora's Theme)
* **Role:** Pad
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Register 2; sounds D#2, F2, G2, A#2
* **Hold / Gain:** `6 beats` (6.43s) / `0.5`
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (6 voices)
  * Harmonicity / Modulation Index: N/A
  * Modulation Envelope: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `0.35s`
  * Decay: `1.2s`
  * Sustain: `0.75`
  * Release: `1.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: external `lowpass` (24 dB/oct)
  * Base Cutoff: `450Hz`
  * Envelope Amount / Octaves: None; static cutoff
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Dark and rounded; the low cutoff removes the bite of the sawtooth and leaves a horn-like body
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: `spread: 18 cents`, `count: 3`
  * LFO Destinations: Chorus delay time (internal to the FX)
  * Portamento / Glide: `0.0s` (Tone default)
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 1.2`, `delayTime: 3.5`, `depth: 0.6`, `wet: 0.35`)

#### sparkle: Celesta & Bell Plucks  (1-01. Title Theme)
* **Role:** Sparkle
* **Tone.js Type:** `Tone.PolySynth(Tone.FMSynth)`
* **Register / Note Range:** Register 6; sounds D#6, F6, G6, A#6, C7
* **Hold / Gain:** `2 beats` (2.14s) / `0.4`
* **Oscillator Configuration:**
  * Type: carrier `sine`, modulator `sine`
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: `3.5` / `2.2`
  * Modulation Envelope: A `0.001s`, D `0.3s`, S `0.0`, R `0.3s`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.001s`
  * Decay: `1.4s`
  * Sustain: `0.02`
  * Release: `1.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: None; no filter node is built for this voice
  * Base Cutoff: N/A
  * Envelope Amount / Octaves: N/A
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Bright and unfiltered; the fast modulation envelope gives a struck-metal ping that decays to a pure sine
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: None
  * Portamento / Glide: `0.0s` (Tone default)
* **FX Chain:**
  1. `Tone.PingPongDelay` (`delayTime: 4n`, `feedback: 0.35`, `wet: 0.25`)

#### lead: Woodwind Melody  (1-01. Title Theme)
* **Role:** Lead
* **Tone.js Type:** `Tone.Synth`
* **Register / Note Range:** Register 5; sounds D#5, F5, G5, A#5
* **Hold / Gain:** `3 beats` (3.21s) / `0.4`
* **Oscillator Configuration:**
  * Type: `sine`
  * Polyphony / Voicing: Monophonic (single voice)
  * Harmonicity / Modulation Index: N/A
  * Modulation Envelope: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `0.06s`
  * Decay: `0.2s`
  * Sustain: `0.85`
  * Release: `0.25s`
* **Filter Envelope & Cutoff:**
  * Filter Type: external `lowpass` (12 dB/oct)
  * Base Cutoff: `3200Hz`
  * Envelope Amount / Octaves: None; static cutoff
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Pure and breathy; a plain sine held flat
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: None
  * Portamento / Glide: `0.04s`
* **FX Chain:**
  1. `Tone.FeedbackDelay` (`delayTime: 4n`, `feedback: 0.3`, `wet: 0.25`)

#### counter: Symphonic String Section  (1-01. Title Theme)
* **Role:** Counter
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Register 3; sounds C3, F3
* **Hold / Gain:** `8 beats` (8.57s) / `0.4`
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (6 voices)
  * Harmonicity / Modulation Index: N/A
  * Modulation Envelope: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `1.5s`
  * Decay: `1.2s`
  * Sustain: `0.75`
  * Release: `2.4s`
* **Filter Envelope & Cutoff:**
  * Filter Type: external `lowpass` (24 dB/oct)
  * Base Cutoff: `1600Hz`
  * Envelope Amount / Octaves: None; static cutoff
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Open and bright for a low voice
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: `spread: 18 cents`, `count: 3`
  * LFO Destinations: Chorus delay time (internal to the FX)
  * Portamento / Glide: `0.0s` (Tone default)
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 1.5`, `delayTime: 3.5`, `depth: 0.6`, `wet: 0.35`)
  2. `Tone.StereoWidener` (`width: 0.6`, `wet: 0.5`)

---

## 4. `deusex` (`soundscapes/deus-ex/`)

#### drone: High Shimmering Drone  (036 Liberty Island Part 1)
* **Role:** Drone
* **Tone.js Type:** `Tone.NoiseSynth`
* **Register / Note Range:** Unpitched; no register
* **Hold / Gain:** `8 beats` (8.57s) / `0.3`
* **Oscillator Configuration:**
  * Type: `pink` noise
  * Polyphony / Voicing: Monophonic (single voice)
  * Harmonicity / Modulation Index: N/A
  * Modulation Envelope: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `4.0s`
  * Decay: `2.5s`
  * Sustain: `0.6`
  * Release: `5.0s`
* **Filter Envelope & Cutoff:**
  * Filter Type: external `bandpass` (12 dB/oct)
  * Base Cutoff: `3200Hz`
  * Envelope Amount / Octaves: None; static cutoff
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Bright and pitchless; a narrow band of hiss that reads as air rather than as a note
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: Chorus delay time (internal to the FX)
  * Portamento / Glide: N/A
* **FX Chain:**
  1. `Tone.StereoWidener` (`width: 0.9`, `wet: 1.0`)
  2. `Tone.Chorus` (`frequency: 0.2`, `delayTime: 4.0`, `depth: 0.8`, `wet: 0.5`)

#### pad: Ambient String Pad  (026 Hong Kong Streets Part 5)
* **Role:** Pad
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Register 3; sounds D#3, F3, G3, A#3
* **Hold / Gain:** `6 beats` (6.43s) / `0.5`
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (6 voices)
  * Harmonicity / Modulation Index: N/A
  * Modulation Envelope: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `1.2s`
  * Decay: `2.0s`
  * Sustain: `0.7`
  * Release: `2.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: external `lowpass` (12 dB/oct)
  * Base Cutoff: `650Hz`
  * Envelope Amount / Octaves: None; static cutoff
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Muted and distant, with a gentle slope that leaves some upper haze
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: `spread: 20 cents`, `count: 3`
  * LFO Destinations: Chorus delay time (internal to the FX)
  * Portamento / Glide: `0.0s` (Tone default)
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 0.8`, `delayTime: 4.0`, `depth: 0.6`, `wet: 0.45`)

#### sparkle: Glassy Shimmer Texture  (026 Hong Kong Streets Part 5)
* **Role:** Sparkle
* **Tone.js Type:** `Tone.PolySynth(Tone.FMSynth)`
* **Register / Note Range:** Register 6; sounds D#6, F6, G6, A#6, C7
* **Hold / Gain:** `2 beats` (2.14s) / `0.35`
* **Oscillator Configuration:**
  * Type: carrier `sine`, modulator `triangle`
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: `3.5` / `2.0`
  * Modulation Envelope: Tone default (A `0.5s`, D `0s`, S `1.0`, R `0.5s`)
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `1.8s`
  * Sustain: `0.0`
  * Release: `2.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: external `highpass` (12 dB/oct)
  * Base Cutoff: `2200Hz`
  * Envelope Amount / Octaves: None; static cutoff
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Thin and glassy, with the body stripped out by the highpass
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: None
  * Portamento / Glide: `0.0s` (Tone default)
* **FX Chain:**
  1. `Tone.PingPongDelay` (`delayTime: 8n.`, `feedback: 0.45`, `wet: 0.4`)

#### lead: Plucked Acoustic Harp / Kora  (026 Hong Kong Streets Part 5)
* **Role:** Lead
* **Tone.js Type:** `Tone.PolySynth(Tone.FMSynth)`
* **Register / Note Range:** Register 5; sounds D#5, F5, G5, A#5
* **Hold / Gain:** `2 beats` (2.14s) / `0.4`
* **Oscillator Configuration:**
  * Type: carrier `sine`, modulator `triangle`
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: `2.0` / `3.5`
  * Modulation Envelope: Tone default (A `0.5s`, D `0s`, S `1.0`, R `0.5s`)
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `0.45s`
  * Sustain: `0.05`
  * Release: `0.6s`
* **Filter Envelope & Cutoff:**
  * Filter Type: external `lowpass` (24 dB/oct)
  * Base Cutoff: `1800Hz`
  * Envelope Amount / Octaves: None; static cutoff
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Woody and short, with a fast decay
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: Chorus delay time (internal to the FX)
  * Portamento / Glide: `0.0s` (Tone default)
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 1.5`, `delayTime: 3.5`, `depth: 0.4`, `wet: 0.3`)
  2. `Tone.FeedbackDelay` (`delayTime: 8n.`, `feedback: 0.35`, `wet: 0.25`)

#### counter: Metallic Bowed Textures / FX  (026 Hong Kong Streets Part 5)
* **Role:** Counter
* **Tone.js Type:** `Tone.DuoSynth`
* **Register / Note Range:** Register 4; sounds C4, F4
* **Hold / Gain:** `6 beats` (6.43s) / `0.3`
* **Oscillator Configuration:**
  * Type: voice 0 `fatsawtooth` (`count: 3`, `spread: 30`), voice 1 `sine`
  * Polyphony / Voicing: Monophonic (two stacked voices, single note)
  * Harmonicity / Modulation Index: `1.5` / N/A
  * Modulation Envelope: N/A
* **Amplitude Envelope (ADSR):** both voices
  * Attack: `1.8s`
  * Decay: `1.2s`
  * Sustain: `0.0`
  * Release: `1.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: internal `lowpass` per voice (12 dB/oct, Tone default) plus external `bandpass` (12 dB/oct) fixed at `2400Hz`, `Q: 3.0`
  * Base Cutoff: `200Hz` per voice (Tone default; not set in code)
  * Envelope Amount / Octaves: voice 0 `5.0`, sweeping `200Hz - 6400Hz`; voice 1 `3.0`, sweeping `200Hz - 1600Hz`
  * Attack: `1.8s` | Decay: `1.0s` | Sustain: `0.0` | Release: `1.2s`
* **Brightness & Timbre:** Metallic and unstable; the slow filter sweep plus the Chebyshev shaping reads as bowed metal
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 5Hz`, `amount: 0.5` (Tone defaults; DuoSynth applies these unless overridden)
  * Detune / Unison: `spread: 30 cents`, `count: 3` on voice 0 only
  * LFO Destinations: Pitch, via the built-in DuoSynth vibrato above
  * Portamento / Glide: `1.8s`
* **FX Chain:**
  1. `Tone.Chebyshev` (`order: 2`, `wet: 0.2`)
  2. `Tone.FeedbackDelay` (`delayTime: 4n`, `feedback: 0.4`, `wet: 0.35`)

---

## 5. `aom` (`soundscapes/age-of-mythology/`)

#### drone: Root Sub Drone  (03 Chocolate Outline)
* **Role:** Drone
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Register 1; sounds C1 only
* **Hold / Gain:** `8 beats` (8.57s) / `0.8`
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: N/A
  * Modulation Envelope: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `1.8s`
  * Decay: `2.0s`
  * Sustain: `0.85`
  * Release: `2.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: external `lowpass` (24 dB/oct)
  * Base Cutoff: `420Hz`
  * Envelope Amount / Octaves: None; static cutoff
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Full and buzzy; the sawtooth keeps harmonics a triangle would not have
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: `spread: 18 cents`, `count: 3`
  * LFO Destinations: Chorus delay time (internal to the FX)
  * Portamento / Glide: `0.2s`
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 0.8`, `delayTime: 4.0`, `depth: 0.5`, `wet: 0.4`)

#### pad: Acoustic Guitar  (05 Suture Self)
* **Role:** Pad
* **Tone.js Type:** `Tone.PolySynth(Tone.FMSynth)`
* **Register / Note Range:** Register 3; sounds D#3, F3, G3, A#3
* **Hold / Gain:** `3 beats` (3.21s) / `0.45`
* **Oscillator Configuration:**
  * Type: carrier `sine`, modulator `triangle`
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: `3.5` / `12`
  * Modulation Envelope: Tone default (A `0.5s`, D `0s`, S `1.0`, R `0.5s`)
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `0.8s`
  * Sustain: `0.0`
  * Release: `0.6s`
* **Filter Envelope & Cutoff:**
  * Filter Type: external `lowpass` (24 dB/oct)
  * Base Cutoff: `2200Hz`
  * Envelope Amount / Octaves: None; static cutoff
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Plucked and percussive; decays to silence rather than sustaining
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: None
  * Portamento / Glide: `0.0s` (Tone default)
* **FX Chain:**
  1. `Tone.PingPongDelay` (`delayTime: 8n.`, `feedback: 0.35`, `wet: 0.25`)

#### sparkle: Chimes and Bell Accents  (05 Suture Self)
* **Role:** Sparkle
* **Tone.js Type:** `Tone.PolySynth(Tone.FMSynth)`
* **Register / Note Range:** Register 5; sounds D#5, F5, G5, A#5, C6
* **Hold / Gain:** `2 beats` (2.14s) / `0.4`
* **Oscillator Configuration:**
  * Type: carrier `sine`, modulator `triangle`
  * Polyphony / Voicing: Polyphonic (8 voices)
  * Harmonicity / Modulation Index: `3.5` / `12`
  * Modulation Envelope: Tone default (A `0.5s`, D `0s`, S `1.0`, R `0.5s`)
* **Amplitude Envelope (ADSR):**
  * Attack: `0.002s`
  * Decay: `0.9s`
  * Sustain: `0.0`
  * Release: `0.6s`
* **Filter Envelope & Cutoff:**
  * Filter Type: external `lowpass` (12 dB/oct)
  * Base Cutoff: `4500Hz`
  * Envelope Amount / Octaves: None; static cutoff
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Hard, bright, bell-struck; the high modulation index gives a dense metallic attack
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: Stereo position, via `AutoPanner` at `0.25Hz`
  * Portamento / Glide: `0.0s` (Tone default)
* **FX Chain:**
  1. `Tone.PingPongDelay` (`delayTime: 8n.`, `feedback: 0.35`, `wet: 0.25`)
  2. `Tone.AutoPanner` (`frequency: 0.25`, `depth: 0.6`, `wet: 1.0`)

#### lead: Native American Flute  (05 Suture Self)
* **Role:** Lead
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Register 5; sounds D#5, F5, G5, A#5
* **Hold / Gain:** `4 beats` (4.29s) / `0.4`
* **Oscillator Configuration:**
  * Type: `sawtooth`
  * Polyphony / Voicing: Monophonic (single voice)
  * Harmonicity / Modulation Index: N/A
  * Modulation Envelope: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `0.08s`
  * Decay: `0.3s`
  * Sustain: `0.85`
  * Release: `0.6s`
* **Filter Envelope & Cutoff:**
  * Filter Type: internal `lowpass` (12 dB/oct, Tone default) plus external `lowpass` (12 dB/oct) fixed at `1800Hz`
  * Base Cutoff: `700Hz`
  * Envelope Amount / Octaves: `1.5`, sweeping `700Hz - 1980Hz`, settling at `1450Hz`
  * Attack: `0.1s` | Decay: `0.4s` | Sustain: `0.7` | Release: `0.6s`
* **Brightness & Timbre:** Breathy and reedy; the sweep opens above the played notes and closes back under them
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: Chorus delay time (internal to the FX)
  * Portamento / Glide: `0.06s`
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 1.5`, `delayTime: 3.5`, `depth: 0.4`, `wet: 0.3`)
  2. `Tone.FeedbackDelay` (`delayTime: 4n`, `feedback: 0.3`, `wet: 0.2`)

#### counter: Wordless Female Vocals  (05 Suture Self)
* **Role:** Counter
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Register 4; sounds C4, F4
* **Hold / Gain:** `8 beats` (8.57s) / `0.38`
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (6 voices)
  * Harmonicity / Modulation Index: N/A
  * Modulation Envelope: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `1.2s`
  * Decay: `1.5s`
  * Sustain: `0.9`
  * Release: `2.4s`
* **Filter Envelope & Cutoff:**
  * Filter Type: external `lowpass` (24 dB/oct)
  * Base Cutoff: `900Hz`
  * Envelope Amount / Octaves: None; static cutoff
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Soft and vowel-like, held almost flat by the high sustain
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: `spread: 25 cents`, `count: 3`
  * LFO Destinations: Chorus delay time (internal to the FX)
  * Portamento / Glide: `0.0s` (Tone default)
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 0.8`, `delayTime: 4.0`, `depth: 0.7`, `wet: 0.5`)
  2. `Tone.StereoWidener` (`width: 0.9`, `wet: 0.8`)

---

## 6. `zoombinis` (`soundscapes/zoombinis/`)

#### drone: Sub-Bass Pulse / Drone  (02 Zoombini Isle)
* **Role:** Drone
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Register 1; sounds C1 only
* **Hold / Gain:** `8 beats` (8.57s) / `0.85`
* **Oscillator Configuration:**
  * Type: `triangle`
  * Polyphony / Voicing: Monophonic (single voice)
  * Harmonicity / Modulation Index: N/A
  * Modulation Envelope: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `0.04s`
  * Decay: `0.6s`
  * Sustain: `0.5`
  * Release: `0.8s`
* **Filter Envelope & Cutoff:**
  * Filter Type: internal `lowpass` (12 dB/oct, Tone default) plus external `lowpass` (24 dB/oct) fixed at `180Hz`
  * Base Cutoff: `200Hz` (Tone default; not set in code)
  * Envelope Amount / Octaves: `1.5`, sweeping `200Hz - 566Hz`, settling at `246Hz`
  * Attack: `0.02s` | Decay: `0.4s` | Sustain: `0.2` | Release: `0.6s`
* **Brightness & Timbre:** Dark and pulsing; the fast filter envelope gives each note a short thump before it settles
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None (single triangle)
  * LFO Destinations: None
  * Portamento / Glide: `0.02s`
* **FX Chain:**
  1. `Tone.Distortion` (`distortion: 0.1`, `wet: 0.15`)

#### pad: Warm Ambient Chord  (01 Zoombiniville)
* **Role:** Pad
* **Tone.js Type:** `Tone.PolySynth(Tone.MonoSynth)`
* **Register / Note Range:** Register 3; sounds D#3, F3, G3, A#3
* **Hold / Gain:** `6 beats` (6.43s) / `0.5`
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (6 voices)
  * Harmonicity / Modulation Index: N/A
  * Modulation Envelope: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `0.8s`
  * Decay: `1.5s`
  * Sustain: `0.75`
  * Release: `2.2s`
* **Filter Envelope & Cutoff:**
  * Filter Type: internal `lowpass` (24 dB/oct); no external filter
  * Base Cutoff: `1100Hz`
  * Envelope Amount / Octaves: `1.2`, sweeping `1100Hz - 2521Hz`, settling at `1811Hz`
  * Attack: `0.8s` | Decay: `1.2s` | Sustain: `0.6` | Release: `2.0s`
* **Brightness & Timbre:** Warm, lush, gentle, diffused; each chord opens up as it swells and closes as it fades
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 0.5Hz`, `depth: 0.01`
  * Detune / Unison: `spread: 15 cents`, `count: 3`
  * LFO Destinations: Vibrato pitch at `0.5Hz`; Chorus delay time (internal to the FX)
  * Portamento / Glide: `0.0s` (Tone default)
* **FX Chain:**
  1. `Tone.Vibrato` (`frequency: 0.5`, `depth: 0.01`)
  2. `Tone.Chorus` (`frequency: 0.8`, `delayTime: 4.0`, `depth: 0.7`, `wet: 0.4`)

#### sparkle: Glass Bell / Music Box Pluck  (02 Zoombini Isle)
* **Role:** Sparkle
* **Tone.js Type:** `Tone.PolySynth(Tone.FMSynth)`
* **Register / Note Range:** Register 5; sounds D#5, F5, G5, A#5, C6
* **Hold / Gain:** `2 beats` (2.14s) / `0.4`
* **Oscillator Configuration:**
  * Type: carrier `sine`, modulator `sine`
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: `3.5` / `12`
  * Modulation Envelope: Tone default (A `0.5s`, D `0s`, S `1.0`, R `0.5s`)
* **Amplitude Envelope (ADSR):**
  * Attack: `0.002s`
  * Decay: `1.2s`
  * Sustain: `0.0`
  * Release: `1.0s`
* **Filter Envelope & Cutoff:**
  * Filter Type: external `lowpass` (12 dB/oct)
  * Base Cutoff: `8000Hz`
  * Envelope Amount / Octaves: None; static cutoff
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Very bright; a music-box ping with almost nothing filtered away
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: None
  * Portamento / Glide: `0.0s` (Tone default)
* **FX Chain:**
  1. `Tone.FeedbackDelay` (`delayTime: 8n.`, `feedback: 0.35`, `wet: 0.3`)

#### lead: Airy Whistle / Flute Lead  (02 Zoombini Isle)
* **Role:** Lead
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Register 5; sounds D#5, F5, G5, A#5
* **Hold / Gain:** `3 beats` (3.21s) / `0.4`
* **Oscillator Configuration:**
  * Type: `sine`
  * Polyphony / Voicing: Monophonic (single voice)
  * Harmonicity / Modulation Index: N/A
  * Modulation Envelope: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `0.08s`
  * Decay: `0.3s`
  * Sustain: `0.75`
  * Release: `0.6s`
* **Filter Envelope & Cutoff:**
  * Filter Type: internal `lowpass` (12 dB/oct, Tone default) plus external `lowpass` (12 dB/oct) fixed at `2200Hz`
  * Base Cutoff: `1000Hz`
  * Envelope Amount / Octaves: `1.0`, sweeping `1000Hz - 2000Hz`, settling at `1625Hz`
  * Attack: `0.08s` | Decay: `0.2s` | Sustain: `0.7` | Release: `0.5s`
* **Brightness & Timbre:** Clear and airy; the cutoff stays above the played notes so the sine comes through whole
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: Chorus delay time (internal to the FX)
  * Portamento / Glide: `0.06s`
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 1.5`, `delayTime: 3.5`, `depth: 0.4`, `wet: 0.25`)
  2. `Tone.PingPongDelay` (`delayTime: 4n`, `feedback: 0.25`, `wet: 0.2`)

#### counter: Airy Ambient Swell  (08 Lion's Lair)
* **Role:** Counter
* **Tone.js Type:** `Tone.NoiseSynth`
* **Register / Note Range:** Unpitched; no register
* **Hold / Gain:** `8 beats` (8.57s) / `0.25`
* **Oscillator Configuration:**
  * Type: `pink` noise
  * Polyphony / Voicing: Monophonic (single voice)
  * Harmonicity / Modulation Index: N/A
  * Modulation Envelope: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `2.2s`
  * Decay: `3.0s`
  * Sustain: `0.3`
  * Release: `3.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: external `bandpass` (12 dB/oct)
  * Base Cutoff: `2200Hz`
  * Envelope Amount / Octaves: None; static cutoff
  * Attack: N/A | Decay: N/A | Sustain: N/A | Release: N/A
* **Brightness & Timbre:** Pitchless wash of air that swells in and drifts across the stereo field
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: Stereo position, via `AutoPanner` at `0.15Hz`
  * Portamento / Glide: N/A
* **FX Chain:**
  1. `Tone.AutoPanner` (`frequency: 0.15`, `depth: 0.8`, `wet: 1.0`)
