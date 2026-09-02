# Tone.js Sound Spec Sheet

---

### 1. Acoustic Harp / Resonant Pluck
* **Role:** Pluck
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Mid to High (C4 - C6)
* **Oscillator Configuration:**
  * Type: `triangle` (blended with subtle `sine`)
  * Polyphony / Voicing: Polyphonic (6 voices)
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `1.2s`
  * Sustain: `0.08`
  * Release: `1.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `2200Hz`
  * Envelope Amount / Octaves: `2.5`
  * Attack: `0.005s` | Decay: `0.8s` | Sustain: `0.1` | Release: `1.2s`
* **Brightness & Timbre:** Warm, organic, wooden transient, resonant plucked decay.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 0Hz, depth: 0`
  * Detune / Unison: `spread: 6 cents, count: 2`
  * LFO Destinations: None
  * Portamento / Glide: `0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Chorus` (`frequency: 1.2, delayTime: 3.5, depth: 0.3, wet: 0.2`)
  2. `Tone.FeedbackDelay` (`delayTime: "8n.", feedback: 0.25, wet: 0.15`)
  3. `Tone.Reverb` (`decay: 3.2, preDelay: 0.02, wet: 0.35`)

---

### 2. Legato Orchestral Violins (Lead Strings)
* **Role:** Lead
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Mid to High (G3 - E6)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Detune / Count: `count: 3, spread: 15`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.35s`
  * Decay: `0.5s`
  * Sustain: `0.9`
  * Release: `1.0s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `3200Hz`
  * Envelope Amount / Octaves: `1.2`
  * Attack: `0.4s` | Decay: `0.6s` | Sustain: `0.8` | Release: `1.0s`
* **Brightness & Timbre:** Rich, warm, bowed friction, expressive high-register bloom.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 5.2Hz, depth: 0.12` (delayed onset)
  * Detune / Unison: `spread: 12 cents, count: 3`
  * LFO Destinations: `amplitude` (LFO type: `sine`, rate: `5.0Hz`, min: `0.85`, max: `1.0`)
  * Portamento / Glide: `0.06s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.EQ3` (`low: -2, mid: +1.5, high: +0.5`)
  2. `Tone.Chorus` (`frequency: 2.0, delayTime: 4.0, depth: 0.45, wet: 0.3`)
  3. `Tone.Reverb` (`decay: 4.0, preDelay: 0.04, wet: 0.45`)

---

### 3. Cello & Double Bass Foundation
* **Role:** Bass / Drone
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Sub-Bass to Low-Mid (C1 - G3)
* **Oscillator Configuration:**
  * Type: `sawtooth`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.25s`
  * Decay: `0.6s`
  * Sustain: `0.95`
  * Release: `0.9s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `480Hz`
  * Envelope Amount / Octaves: `1.8`
  * Attack: `0.3s` | Decay: `0.5s` | Sustain: `0.7` | Release: `0.8s`
* **Brightness & Timbre:** Deep, dark, heavy fundamental weight with woody bow grit.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 4.5Hz, depth: 0.05`
  * Detune / Unison: `spread: 0 cents, count: 1`
  * Portamento / Glide: `0.04s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Compressor` (`threshold: -20, ratio: 3.5, attack: 0.03, release: 0.25`)
  2. `Tone.EQ3` (`low: +3, mid: 0, high: -4`)
  3. `Tone.Reverb` (`decay: 2.8, preDelay: 0.02, wet: 0.25`)

---

### 4. Ethereal Choir / Vocal Pad
* **Role:** Pad
* **Tone.js Type:** `Tone.PolySynth(Tone.AMSynth)`
* **Register / Note Range:** Mid to High (C4 - A5)
* **Oscillator Configuration:**
  * Type: `sine` (Modulator: `triangle`)
  * Polyphony / Voicing: Polyphonic (8 voices)
  * Harmonicity / Modulation Index: `harmonicity: 2.0, modulationIndex: 1.5`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.9s`
  * Decay: `1.2s`
  * Sustain: `0.85`
  * Release: `2.2s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `bandpass` (12 dB/oct)
  * Base Cutoff: `1100Hz`
  * Envelope Amount / Octaves: `0.8`
  * Attack: `1.0s` | Decay: `1.5s` | Sustain: `0.9` | Release: `2.0s`
* **Brightness & Timbre:** Hollow, vocal "aah" vowel, airy, soft, celestial.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 4.8Hz, depth: 0.08`
  * Detune / Unison: `spread: 18 cents, count: 4`
  * LFO Destinations: `filter cutoff` (LFO type: `sine`, rate: `0.25Hz`, min: `900Hz`, max: `1400Hz`)
  * Portamento / Glide: `0.1s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Chorus` (`frequency: 0.8, delayTime: 5.0, depth: 0.6, wet: 0.45`)
  2. `Tone.StereoWidener` (`width: 0.8, wet: 0.5`)
  3. `Tone.Reverb` (`decay: 5.5, preDelay: 0.05, wet: 0.6`)

---

### 5. Orchestral Timpani / Concert Bass Hit
* **Role:** Percussion / FX
* **Tone.js Type:** `Tone.MembraneSynth`
* **Register / Note Range:** Sub-Bass to Low (C1 - G2)
* **Oscillator Configuration:**
  * Type: `sine`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.002s`
  * Decay: `1.8s`
  * Sustain: `0.0`
  * Release: `1.8s`
* **Pitch Decay / Modulation:**
  * Pitch Decay: `0.08s`
  * Octaves: `3.5`
* **Brightness & Timbre:** Boomy, deep, resonant, cinematic punch.
* **Movement & Modulation:**
  * Detune / Unison: `spread: 0 cents, count: 1`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Distortion` (`distortion: 0.08, wet: 0.15`)
  2. `Tone.Compressor` (`threshold: -14, ratio: 4.0, attack: 0.01, release: 0.4`)
  3. `Tone.Reverb` (`decay: 3.5, preDelay: 0.03, wet: 0.4`)