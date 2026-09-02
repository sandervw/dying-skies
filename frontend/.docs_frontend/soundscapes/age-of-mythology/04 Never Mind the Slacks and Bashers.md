# Tone.js Sound Spec Sheet

---

### 1. Dark Sub Drone Foundation
* **Role:** Drone / Bass
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Sub-Bass to Low (C1–C2)
* **Oscillator Configuration:**
  * Type: `triangle` (mixed with subtle low `sine`)
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `2.5s`
  * Decay: `1.0s`
  * Sustain: `1.0`
  * Release: `3.0s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `180Hz`
  * Envelope Amount / Octaves: `1.5`
  * Attack: `2.0s` | Decay: `1.5s` | Sustain: `0.7` | Release: `3.0s`
* **Brightness & Timbre:** Dark, warm, rumbling, heavy fundamental weight
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: `filter.frequency` (LFO type: `sine`, rate: `0.08Hz`, min: `120Hz`, max: `220Hz`)
  * Portamento / Glide: `0.5s`
* **FX Chain:**
  1. `Tone.Distortion` (`distortion: 0.15, wet: 0.2`)
  2. `Tone.Reverb` (`decay: 6.0, preDelay: 0.05, wet: 0.35`)

---

### 2. Ethereal Choral Pad ("Aah" Formant)
* **Role:** Pad / Lead
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)` or `Tone.Sampler`
* **Register / Note Range:** Mid to High (F3–C5)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (4 voices)
* **Amplitude Envelope (ADSR):**
  * Attack: `1.2s`
  * Decay: `0.8s`
  * Sustain: `0.85`
  * Release: `2.4s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `bandpass` (12 dB/oct, formant-focused)
  * Base Cutoff: `950Hz`
  * Envelope Amount / Octaves: `0.8`
  * Attack: `1.5s` | Decay: `1.0s` | Sustain: `0.8` | Release: `2.0s`
* **Brightness & Timbre:** Warm, vocal, resonant, spacious, airy
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: rate: `4.5Hz`, depth: `0.08`
  * Detune / Unison: spread: `18 cents`, count: `3`
  * LFO Destinations: `volume` / `filter.frequency` (LFO type: `sine`, rate: `0.2Hz`, min: `800Hz`, max: `1100Hz`)
  * Portamento / Glide: `0.0s`
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 1.2, delayTime: 3.5, depth: 0.6, wet: 0.45`)
  2. `Tone.FeedbackDelay` (`delayTime: "4n.", feedback: 0.4, wet: 0.3`)
  3. `Tone.Reverb` (`decay: 7.5, preDelay: 0.08, wet: 0.65`)

---

### 3. Acoustic Pluck / Zither Lead
* **Role:** Pluck
* **Tone.js Type:** `Tone.Synth`
* **Register / Note Range:** Mid to High (A3–E5)
* **Oscillator Configuration:**
  * Type: `triangle`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `1.4s`
  * Sustain: `0.05`
  * Release: `1.2s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `1200Hz`
  * Envelope Amount / Octaves: `3.2`
  * Attack: `0.005s` | Decay: `0.4s` | Sustain: `0.1` | Release: `0.8s`
* **Brightness & Timbre:** Crisp attack, organic, wooden, bright transient fading into warm ring
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: rate: `5.0Hz`, depth: `0.04` (delayed onset)
  * Detune / Unison: None
  * LFO Destinations: None
  * Portamento / Glide: `0.0s`
* **FX Chain:**
  1. `Tone.FeedbackDelay` (`delayTime: "8n.", feedback: 0.35, wet: 0.25`)
  2. `Tone.Reverb` (`decay: 4.5, preDelay: 0.02, wet: 0.4`)

---

### 4. Textured Metallic Rattle / Guiro Scrape
* **Role:** Percussion / FX
* **Tone.js Type:** `Tone.NoiseSynth`
* **Register / Note Range:** High-Mid / Treble (2.5kHz–8kHz)
* **Oscillator Configuration:**
  * Type: `white noise`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.03s`
  * Decay: `0.12s`
  * Sustain: `0.0`
  * Release: `0.1s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `bandpass` (12 dB/oct)
  * Base Cutoff: `3800Hz`
  * Envelope Amount / Octaves: `1.2`
  * Attack: `0.02s` | Decay: `0.1s` | Sustain: `0.0` | Release: `0.1s`
* **Brightness & Timbre:** Dry, raspy, metallic, brittle, tactile
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: `pan` (LFO type: `random`, rate: `6Hz`, min: `-0.4`, max: `0.4`)
  * Portamento / Glide: `0.0s`
* **FX Chain:**
  1. `Tone.BitCrusher` (`bits: 7, wet: 0.15`)
  2. `Tone.Reverb` (`decay: 1.8, preDelay: 0.01, wet: 0.2`)

---

### 5. Resonant Deep Frame Drum / Impact
* **Role:** Percussion / Bass
* **Tone.js Type:** `Tone.MembraneSynth`
* **Register / Note Range:** Low (D1–A1)
* **Oscillator Configuration:**
  * Type: `sine`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.008s`
  * Decay: `1.8s`
  * Sustain: `0.0`
  * Release: `1.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `350Hz`
  * Envelope Amount / Octaves: `2.0`
  * Attack: `0.008s` | Decay: `0.25s` | Sustain: `0.0` | Release: `1.0s`
* **Brightness & Timbre:** Boomy, deep, resonant, cinematic low impact
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `octaves: 3.5, pitchDecay: 0.06`
  * Detune / Unison: None
  * LFO Destinations: None
  * Portamento / Glide: `0.0s`
* **FX Chain:**
  1. `Tone.Compressor` (`threshold: -18, ratio: 4, attack: 0.01, release: 0.25`)
  2. `Tone.Reverb` (`decay: 5.0, preDelay: 0.04, wet: 0.45`)