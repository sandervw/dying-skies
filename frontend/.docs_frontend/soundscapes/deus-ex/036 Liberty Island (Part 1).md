# Tone.js Sound Spec Sheet

---

### 1. Deep Cinematic Sub-Drone
* **Role:** Drone / Bass
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Sub-Bass (C1–C2 / 30–70 Hz)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `2.0s`
  * Decay: `0.0s`
  * Sustain: `1.0`
  * Release: `3.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `110Hz`
  * Envelope Amount / Octaves: `0.8`
  * Attack: `2.0s` | Decay: `1.0s` | Sustain: `0.7` | Release: `3.0s`
* **Brightness & Timbre:** Dark, heavy, rumbling, warm, immersive sub-weight
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: rate: `0.1Hz`, depth: `0.02`
  * Detune / Unison: spread: `15 cents`, count: `3`
  * LFO Destinations: `filter.frequency` (LFO type: `sine`, rate: `0.08Hz`, min: `70Hz`, max: `130Hz`)
  * Portamento / Glide: `0.5s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Filter` (`type: "lowpass", frequency: 160, rolloff: -24, wet: 1.0`)
  2. `Tone.Compressor` (`threshold: -18, ratio: 4, attack: 0.03, release: 0.25, wet: 1.0`)
  3. `Tone.Freeverb` (`roomSize: 0.8, dampening: 2500, wet: 0.35`)

---

### 2. Ominous Low-Mid Brass/Pad Swell
* **Role:** Pad / Drone
* **Tone.js Type:** `Tone.PolySynth(Tone.FMSynth)`
* **Register / Note Range:** Low-Mid (C2–G3 / 65–200 Hz)
* **Oscillator Configuration:**
  * Type: `sawtooth` (Carrier), `sine` (Modulator)
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: harmonicity: `0.5`, modulationIndex: `3.0`
* **Amplitude Envelope (ADSR):**
  * Attack: `3.5s`
  * Decay: `2.0s`
  * Sustain: `0.85`
  * Release: `4.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `320Hz`
  * Envelope Amount / Octaves: `2.2`
  * Attack: `3.0s` | Decay: `2.0s` | Sustain: `0.6` | Release: `4.0s`
* **Brightness & Timbre:** Brassy, dark, resonant, hollow, cinematic tension swell
* **Movement & Modulation:**
  * Detune / Unison: spread: `20 cents`, count: `2`
  * LFO Destinations: `modulationIndex` (LFO type: `triangle`, rate: `0.15Hz`, min: `1.5`, max: `4.5`)
* **FX Chain (Ordered signal flow):**
  1. `Tone.Chorus` (`frequency: 0.4, delayTime: 3.5, depth: 0.65, wet: 0.4`)
  2. `Tone.FeedbackDelay` (`delayTime: "4n.", feedback: 0.45, wet: 0.25`)
  3. `Tone.Reverb` (`decay: 8.0, preDelay: 0.08, wet: 0.6`)

---

### 3. Muffled Sub-Impact / Pulse Hit
* **Role:** Percussion / FX
* **Tone.js Type:** `Tone.MembraneSynth`
* **Register / Note Range:** Sub-Bass (C1–E1 / 32–45 Hz)
* **Oscillator Configuration:**
  * Type: `sine`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `1.4s`
  * Sustain: `0.0`
  * Release: `1.4s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `90Hz`
  * Envelope Amount / Octaves: `1.5`
  * Attack: `0.005s` | Decay: `0.3s` | Sustain: `0.0` | Release: `0.3s`
* **Brightness & Timbre:** Muffled, boomy, deep, heart-thud character
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: Pitch decay curve: `0.08s`, octaves: `3.5`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Distortion` (`distortion: 0.15, oversample: "2x", wet: 0.2`)
  2. `Tone.Filter` (`type: "lowpass", frequency: 120, wet: 1.0`)
  3. `Tone.Reverb` (`decay: 5.5, preDelay: 0.02, wet: 0.45`)

---

### 4. High Airy Ethereal Shimmer Bed
* **Role:** Drone / FX
* **Tone.js Type:** `Tone.NoiseSynth`
* **Register / Note Range:** High (C5–C7 / 2 kHz–7 kHz)
* **Oscillator Configuration:**
  * Type: `pink noise`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `4.0s`
  * Decay: `2.5s`
  * Sustain: `0.6`
  * Release: `5.0s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `bandpass` (12 dB/oct)
  * Base Cutoff: `3200Hz`
  * Envelope Amount / Octaves: `1.0`
  * Attack: `4.0s` | Decay: `2.0s` | Sustain: `0.7` | Release: `4.0s`
* **Brightness & Timbre:** Airy, glassy, whispering, diffuse background texture
* **Movement & Modulation:**
  * LFO Destinations: `filter.frequency` (LFO type: `sine`, rate: `0.05Hz`, min: `2500Hz`, max: `4200Hz`)
* **FX Chain (Ordered signal flow):**
  1. `Tone.StereoWidener` (`width: 0.9, wet: 1.0`)
  2. `Tone.Chorus` (`frequency: 0.2, delayTime: 4.0, depth: 0.8, wet: 0.5`)
  3. `Tone.Reverb` (`decay: 10.0, preDelay: 0.1, wet: 0.75`)