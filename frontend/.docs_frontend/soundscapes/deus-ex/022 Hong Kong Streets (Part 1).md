# Tone.js Sound Spec Sheet

---

### 1. Sequenced Arp Pluck / Bell Lead
* **Role:** Pluck / Lead
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Mid to High (`B3 - E6`)
* **Oscillator Configuration:**
  * Type: `sawtooth`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `0.22s`
  * Sustain: `0.15`
  * Release: `0.20s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `900Hz`
  * Envelope Amount / Octaves: `3.5`
  * Attack: `0.005s` | Decay: `0.18s` | Sustain: `0.1` | Release: `0.2s`
* **Brightness & Timbre:** Bright, punchy, retro synthwave character with percussive attack
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: none
  * Detune / Unison: `spread: 8 cents`
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.FeedbackDelay` (`delayTime: "16n.", feedback: 0.35, wet: 0.3`)
  2. `Tone.Chorus` (`frequency: 1.5, delayTime: 3.5, depth: 0.5, wet: 0.25`)
  3. `Tone.Reverb` (`decay: 2.0, preDelay: 0.02, wet: 0.25`)

---

### 2. Punchy Synth Bass
* **Role:** Bass
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Bass (`E1 - E3`)
* **Oscillator Configuration:**
  * Type: `square`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `0.28s`
  * Sustain: `0.35`
  * Release: `0.12s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `250Hz`
  * Envelope Amount / Octaves: `2.8`
  * Attack: `0.005s` | Decay: `0.22s` | Sustain: `0.2` | Release: `0.12s`
* **Brightness & Timbre:** Warm, rounded, fat low-end with transient snap
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: none
  * Portamento / Glide: `0.02s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Distortion` (`distortion: 0.15, wet: 0.2`)
  2. `Tone.Compressor` (`threshold: -18, ratio: 4, attack: 0.01, release: 0.1`)

---

### 3. Warm Analog Background Pad
* **Role:** Pad
* **Tone.js Type:** `Tone.PolySynth` (`options: { voice: Tone.Synth }`)
* **Register / Note Range:** Mid (`E3 - B4`)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (4 voices)
* **Amplitude Envelope (ADSR):**
  * Attack: `0.6s`
  * Decay: `1.2s`
  * Sustain: `0.85`
  * Release: `1.8s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `1200Hz`
  * Envelope Amount / Octaves: `1.2`
  * Attack: `0.8s` | Decay: `1.0s` | Sustain: `0.7` | Release: `1.5s`
* **Brightness & Timbre:** Warm, lush, airy, slightly diffused
* **Movement & Modulation:**
  * Detune / Unison: `spread: 18 cents, count: 3`
  * LFO Destinations: `filter cutoff` (LFO type: `sine`, rate: `0.2Hz`, min: `900`, max: `1600`)
* **FX Chain (Ordered signal flow):**
  1. `Tone.Chorus` (`frequency: 0.8, delayTime: 4.0, depth: 0.7, wet: 0.4`)
  2. `Tone.Reverb` (`decay: 3.5, preDelay: 0.05, wet: 0.45`)

---

### 4. Electro Kick Drum
* **Role:** Percussion / FX
* **Tone.js Type:** `Tone.MembraneSynth`
* **Register / Note Range:** Sub-Bass (`C1 - G1`)
* **Oscillator Configuration:**
  * Type: `sine`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.001s`
  * Decay: `0.32s`
  * Sustain: `0.0`
  * Release: `0.32s`
* **Brightness & Timbre:** Tight, punchy, clean low-end thump
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: Pitch decay envelope (`pitchDecay: 0.04, octaves: 6`)
* **FX Chain (Ordered signal flow):**
  1. `Tone.Compressor` (`threshold: -12, ratio: 6, attack: 0.005, release: 0.1`)

---

### 5. Gated / 80s Snare Drum
* **Role:** Percussion / FX
* **Tone.js Type:** `Tone.NoiseSynth`
* **Register / Note Range:** Mid to High Frequency Band
* **Oscillator Configuration:**
  * Type: `white noise`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.001s`
  * Decay: `0.22s`
  * Sustain: `0.0`
  * Release: `0.22s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `highpass` (12 dB/oct)
  * Base Cutoff: `800Hz`
* **Brightness & Timbre:** Crispy, snappy, aggressive splash
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: none
* **FX Chain (Ordered signal flow):**
  1. `Tone.Chebyshev` (`order: 2, wet: 0.15`)
  2. `Tone.Reverb` (`decay: 1.4, preDelay: 0.01, wet: 0.35`)