# Tone.js Sound Spec Sheet

---

### 1. Ostinato Wooden Pluck / Bell
* **Role:** Pluck
* **Tone.js Type:** `Tone.FMSynth`
* **Register / Note Range:** Mid to High (G3 – E5)
* **Oscillator Configuration:**
  * Type: `sine` (Modulator: `triangle`)
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: `harmonicity: 3.5, modulationIndex: 12`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `0.25s`
  * Sustain: `0.0`
  * Release: `0.2s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `2200Hz`
  * Envelope Amount / Octaves: `2.5`
  * Attack: `0.005s` | Decay: `0.2s` | Sustain: `0.0` | Release: `0.2s`
* **Brightness & Timbre:** Organic, hollow, warm gamelan/kalimba-like transient.
* **Movement & Modulation:**
  * Detune / Unison: `spread: 8 cents, count: 2`
  * LFO Destinations: `pan` (LFO type: `sine`, rate: `0.25Hz`, min: `-0.6`, max: `0.6`)
* **FX Chain:**
  1. `Tone.PingPongDelay` (`delayTime: "8n.", feedback: 0.35, wet: 0.25`)
  2. `Tone.Reverb` (`decay: 2.2, preDelay: 0.02, wet: 0.3`)

---

### 2. Expressive Solo String / Vocal Lead
* **Role:** Lead
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Mid to High (D4 – B5)
* **Oscillator Configuration:**
  * Type: `sawtooth`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.08s`
  * Decay: `0.3s`
  * Sustain: `0.85`
  * Release: `0.6s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `1800Hz`
  * Envelope Amount / Octaves: `1.5`
  * Attack: `0.1s` | Decay: `0.4s` | Sustain: `0.7` | Release: `0.6s`
* **Brightness & Timbre:** Warm, vocal-like, nasal, resonant bowed/erhu character.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 5.2Hz, depth: 0.15`
  * Portamento / Glide: `0.06s`
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 1.5, delayTime: 3.5, depth: 0.4, wet: 0.3`)
  2. `Tone.FeedbackDelay` (`delayTime: "4n", feedback: 0.3, wet: 0.2`)
  3. `Tone.Reverb` (`decay: 3.5, preDelay: 0.04, wet: 0.45`)

---

### 3. Ambient Choral / Shimmer Pad
* **Role:** Pad / Drone
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Low-Mid to High (C3 – G5)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (6 voices)
* **Amplitude Envelope (ADSR):**
  * Attack: `1.2s`
  * Decay: `1.5s`
  * Sustain: `0.9`
  * Release: `2.4s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `900Hz`
  * Envelope Amount / Octaves: `1.2`
  * Attack: `1.5s` | Decay: `2.0s` | Sustain: `0.6` | Release: `2.5s`
* **Brightness & Timbre:** Ethereal, soft, breathy, wide cinematic wash.
* **Movement & Modulation:**
  * Detune / Unison: `spread: 25 cents, count: 3`
  * LFO Destinations: `filter cutoff` (LFO type: `sine`, rate: `0.1Hz`, min: `600`, max: `1400`)
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 0.8, delayTime: 4.0, depth: 0.7, wet: 0.5`)
  2. `Tone.Freeverb` (`roomSize: 0.85, dampening: 2500, wet: 0.6`)

---

### 4. Resonant Deep Bass Pulse
* **Role:** Bass
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Sub-Bass (C1 – G2)
* **Oscillator Configuration:**
  * Type: `sine` (sub-blend with `triangle`)
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.02s`
  * Decay: `0.6s`
  * Sustain: `0.5`
  * Release: `0.8s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `180Hz`
  * Envelope Amount / Octaves: `1.0`
  * Attack: `0.02s` | Decay: `0.4s` | Sustain: `0.2` | Release: `0.5s`
* **Brightness & Timbre:** Deep, round, warm, grounded fundamental sub weight.
* **Movement & Modulation:**
  * Portamento / Glide: `0.03s`
* **FX Chain:**
  1. `Tone.Distortion` (`distortion: 0.08, wet: 0.15`)
  2. `Tone.EQ3` (`low: 3.0, mid: -2.0, high: -6.0`)