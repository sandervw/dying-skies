# Tone.js Sound Spec Sheet

---

### 1. Crystalline Bell Pluck (Ostinato)
* **Role:** Bell / Pluck
* **Tone.js Type:** `Tone.FMSynth` (or `Tone.PolySynth(Tone.FMSynth)`)
* **Register / Note Range:** High (E5 - A6)
* **Oscillator Configuration:**
  * Type: `sine` (Carrier: sine, Modulator: sine)
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: `harmonicity: 3.5, modulationIndex: 8.0`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `0.6s`
  * Sustain: `0.0`
  * Release: `0.8s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `3500Hz`
  * Envelope Amount / Octaves: `2.5`
  * Attack: `0.005s` | Decay: `0.4s` | Sustain: `0.0` | Release: `0.5s`
* **Brightness & Timbre:** Bright, glassy, bell-like, metallic, crystalline.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 0Hz, depth: 0`
  * Detune / Unison: `spread: 10 cents, count: 2`
  * LFO Destinations: None
  * Portamento / Glide: `0.0s`
* **FX Chain:**
  1. `Tone.PingPongDelay` (`delayTime: "8n.", feedback: 0.35, wet: 0.3`)
  2. `Tone.Reverb` (`decay: 3.5, preDelay: 0.02, wet: 0.45`)

---

### 2. Warm Swelling Ambient Pad
* **Role:** Pad
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Mid (C3 - G5)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (6 voices)
  * Harmonicity / Modulation Index: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `1.8s`
  * Decay: `2.0s`
  * Sustain: `0.75`
  * Release: `2.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `900Hz`
  * Envelope Amount / Octaves: `2.0`
  * Attack: `2.0s` | Decay: `1.5s` | Sustain: `0.6` | Release: `2.5s`
* **Brightness & Timbre:** Warm, lush, soft, cinematic.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 4.5Hz, depth: 0.05`
  * Detune / Unison: `spread: 25 cents, count: 3`
  * LFO Destinations: `filter cutoff` (LFO type: `sine`, rate: `0.2Hz`, min: `700Hz`, max: `1600Hz`)
  * Portamento / Glide: `0.0s`
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 1.5, delayTime: 3.5, depth: 0.6, wet: 0.4`)
  2. `Tone.Reverb` (`decay: 5.0, preDelay: 0.04, wet: 0.55`)

---

### 3. Deep Sub-Bass Anchor
* **Role:** Bass / Drone
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Sub-Bass / Low (C1 - G2)
* **Oscillator Configuration:**
  * Type: `triangle`
  * Polyphony / Voicing: Monophonic
  * Harmonicity / Modulation Index: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `0.25s`
  * Decay: `0.8s`
  * Sustain: `0.9`
  * Release: `1.2s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `180Hz`
  * Envelope Amount / Octaves: `1.0`
  * Attack: `0.2s` | Decay: `0.5s` | Sustain: `0.8` | Release: `1.0s`
* **Brightness & Timbre:** Dark, smooth, round, heavy low-end weight.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 0Hz, depth: 0`
  * Detune / Unison: `spread: 0 cents, count: 1`
  * LFO Destinations: None
  * Portamento / Glide: `0.08s`
* **FX Chain:**
  1. `Tone.Distortion` (`distortion: 0.1, wet: 0.15`)
  2. `Tone.EQ3` (`low: +3dB, mid: -2dB, high: -6dB`)

---

### 4. Ethereal Vocal / Formant Texture
* **Role:** Lead / Pad
* **Tone.js Type:** `Tone.AMSynth`
* **Register / Note Range:** High-Mid to High (A4 - E6)
* **Oscillator Configuration:**
  * Type: `sine` (Modulator: `sawtooth`)
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: `harmonicity: 2.0`
* **Amplitude Envelope (ADSR):**
  * Attack: `1.2s`
  * Decay: `1.5s`
  * Sustain: `0.7`
  * Release: `2.0s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `bandpass` (12 dB/oct)
  * Base Cutoff: `1800Hz`
  * Envelope Amount / Octaves: `1.2`
  * Attack: `1.0s` | Decay: `1.0s` | Sustain: `0.7` | Release: `2.0s`
* **Brightness & Timbre:** Ethereal, vocal-like, airy, resonant, drifting.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 5.2Hz, depth: 0.15`
  * Detune / Unison: `spread: 15 cents, count: 2`
  * LFO Destinations: `pan` (LFO type: `sine`, rate: `0.15Hz`, min: `-0.4`, max: `0.4`)
  * Portamento / Glide: `0.1s`
* **FX Chain:**
  1. `Tone.FeedbackDelay` (`delayTime: "4n", feedback: 0.4, wet: 0.35`)
  2. `Tone.Freeverb` (`roomSize: 0.85, dampening: 2500, wet: 0.6`)