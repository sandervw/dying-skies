# Tone.js Sound Spec Sheet

---

### 1. Ambient Bass Drone
* **Role:** Bass / Drone
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Sub-Bass to Low-Mid (E1 – B2)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.8s`
  * Decay: `1.5s`
  * Sustain: `0.85`
  * Release: `2.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `180Hz`
  * Envelope Amount / Octaves: `2.0`
  * Attack: `0.6s` | Decay: `2.0s` | Sustain: `0.5` | Release: `2.5s`
* **Brightness & Timbre:** Dark, warm, rounded, deep sub-rumble
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: none
  * Detune / Unison: `spread: 15 cents, count: 3`
  * LFO Destinations: Filter Cutoff (LFO type: `sine`, rate: `0.1Hz`, min: `140Hz`, max: `280Hz`)
  * Portamento / Glide: `0.3s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Chorus` (`frequency: 0.5, delayTime: 3.5, depth: 0.4, wet: 0.3`)
  2. `Tone.Reverb` (`decay: 4.5, preDelay: 0.05, wet: 0.4`)

---

### 2. Glassy Bell Pluck
* **Role:** Bell / Pluck
* **Tone.js Type:** `Tone.FMSynth`
* **Register / Note Range:** High (E5 – B6)
* **Oscillator Configuration:**
  * Type: `sine` (Carrier), `triangle` (Modulator)
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: `harmonicity: 2.005, modulationIndex: 2.2`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `1.8s`
  * Sustain: `0.05`
  * Release: `2.0s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `3800Hz`
  * Envelope Amount / Octaves: `1.5`
  * Attack: `0.01s` | Decay: `1.2s` | Sustain: `0.1` | Release: `1.8s`
* **Brightness & Timbre:** Bright, crystalline, glassy, metallic resonance
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 4.5Hz, depth: 0.02`
  * Detune / Unison: `spread: 8 cents, count: 2`
  * LFO Destinations: Stereo Panning (LFO type: `triangle`, rate: `0.25Hz`, min: `-0.6`, max: `0.6`)
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.FeedbackDelay` (`delayTime: "8n.", feedback: 0.45, wet: 0.4`)
  2. `Tone.Chorus` (`frequency: 1.2, delayTime: 2.5, depth: 0.6, wet: 0.35`)
  3. `Tone.Reverb` (`decay: 5.0, preDelay: 0.02, wet: 0.55`)

---

### 3. Airy Ambient Swell
* **Role:** Pad / FX
* **Tone.js Type:** `Tone.NoiseSynth`
* **Register / Note Range:** Upper-Mid to High (1.5kHz – 9kHz)
* **Oscillator Configuration:**
  * Type: `pink noise`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `2.2s`
  * Decay: `3.0s`
  * Sustain: `0.3`
  * Release: `3.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `bandpass` (12 dB/oct)
  * Base Cutoff: `2200Hz`
  * Envelope Amount / Octaves: `1.0`
  * Attack: `2.0s` | Decay: `3.0s` | Sustain: `0.4` | Release: `3.0s`
* **Brightness & Timbre:** Airy, diffuse, misty texture
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: none
  * Detune / Unison: none
  * LFO Destinations: Filter Cutoff (LFO type: `sine`, rate: `0.08Hz`, min: `1800Hz`, max: `3200Hz`)
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.AutoPanner` (`frequency: 0.15, depth: 0.8, wet: 1.0`)
  2. `Tone.Reverb` (`decay: 6.0, preDelay: 0.1, wet: 0.7`)