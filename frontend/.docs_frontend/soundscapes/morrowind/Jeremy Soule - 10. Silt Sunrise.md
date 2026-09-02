# Tone.js Sound Spec Sheet

---

### 1. Cinematic String Ensemble Pad
* **Role:** Pad / Swell
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Mid to High (`G3 - D6`)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (6 voices)
  * Harmonicity / Modulation Index (FM/AM only): N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `1.2s`
  * Decay: `1.5s`
  * Sustain: `0.85`
  * Release: `2.5s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `1800Hz`
  * Envelope Amount / Octaves: `1.5`
  * Attack: `1.5s` | Decay: `2.0s` | Sustain: `0.7` | Release: `2.5s`
* **Brightness & Timbre:** Warm, organic, bowed-string texture with gentle harmonic presence.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: rate: `4.5Hz`, depth: `0.1`
  * Detune / Unison: spread: `20 cents`, count: `3`
  * LFO Destinations: Filter cutoff (LFO type: `sine`, rate: `0.15Hz`, min: `1200Hz`, max: `2400Hz`)
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Chorus` (`frequency: 1.5, delayTime: 3.5, depth: 0.6, wet: 0.4`)
  2. `Tone.Reverb` (`decay: 5.0, preDelay: 0.04, wet: 0.55`)

---

### 2. Deep Foundation Sub-Drone
* **Role:** Drone / Bass
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Sub-Bass / Bass (`C1 - G2`)
* **Oscillator Configuration:**
  * Type: `triangle`
  * Polyphony / Voicing: Monophonic
  * Harmonicity / Modulation Index (FM/AM only): N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `1.8s`
  * Decay: `0.5s`
  * Sustain: `1.0`
  * Release: `3.0s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `140Hz`
  * Envelope Amount / Octaves: `0.5`
  * Attack: `2.0s` | Decay: `1.0s` | Sustain: `1.0` | Release: `3.0s`
* **Brightness & Timbre:** Dark, round, heavy, foundational low-end anchor.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: rate: `0.0Hz`, depth: `0.0`
  * Detune / Unison: spread: `0 cents`, count: `1`
  * LFO Destinations: None
  * Portamento / Glide: `0.2s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.EQ3` (`low: 2.0, mid: -4.0, high: -12.0, wet: 1.0`)
  2. `Tone.Reverb` (`decay: 3.5, preDelay: 0.02, wet: 0.25`)

---

### 3. Glassy Air / Shimmer Texture
* **Role:** Pad / FX Ambient
* **Tone.js Type:** `Tone.FMSynth`
* **Register / Note Range:** High (`C5 - G7`)
* **Oscillator Configuration:**
  * Type: `sine` (Modulator: `sine`)
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index (FM/AM only): `harmonicity: 3.01, modulationIndex: 2.0`
* **Amplitude Envelope (ADSR):**
  * Attack: `2.5s`
  * Decay: `2.0s`
  * Sustain: `0.6`
  * Release: `3.5s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `highpass` (12 dB/oct)
  * Base Cutoff: `2500Hz`
  * Envelope Amount / Octaves: `0`
  * Attack: `0s` | Decay: `0s` | Sustain: `1.0` | Release: `0s`
* **Brightness & Timbre:** Ethereal, glassy, breathy, floating overtone texture.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: rate: `5.0Hz`, depth: `0.08`
  * Detune / Unison: spread: `12 cents`, count: `2`
  * LFO Destinations: AutoPan (LFO type: `sine`, rate: `0.2Hz`, min: `-0.7`, max: `0.7`)
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.FeedbackDelay` (`delayTime: 0.375s, feedback: 0.45, wet: 0.35`)
  2. `Tone.Reverb` (`decay: 7.0, preDelay: 0.08, wet: 0.7`)