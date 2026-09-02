# Tone.js Sound Spec Sheet

---

### 1. Sub-Bass Pulse / Drone
* **Role:** Bass / Drone
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Sub-Bass / Low (C1 - G2)
* **Oscillator Configuration:**
  * Type: `triangle`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.04s`
  * Decay: `0.6s`
  * Sustain: `0.5`
  * Release: `0.8s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `180Hz`
  * Envelope Amount / Octaves: `1.5`
  * Attack: `0.02s` | Decay: `0.4s` | Sustain: `0.2` | Release: `0.6s`
* **Brightness & Timbre:** Dark, warm, rounded, deep
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: none
  * Detune / Unison: none
  * LFO Destinations: none
  * Portamento / Glide: `0.02s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Distortion` (`distortion: 0.1, wet: 0.15`)
  2. `Tone.Reverb` (`decay: 1.5s, wet: 0.1`)

---

### 2. Glass Bell / Music Box Pluck
* **Role:** Pluck / Bell
* **Tone.js Type:** `Tone.FMSynth`
* **Register / Note Range:** High (C5 - G7)
* **Oscillator Configuration:**
  * Type: `sine` (Carrier: `sine`, Modulator: `sine`)
  * Polyphony / Voicing: Polyphonic (4 voices via `Tone.PolySynth`)
  * Harmonicity / Modulation Index: `harmonicity: 3.5, modulationIndex: 12`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.002s`
  * Decay: `1.2s`
  * Sustain: `0.0`
  * Release: `1.0s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `8000Hz`
  * Envelope Amount / Octaves: `0`
  * Attack: `0.001s` | Decay: `1.0s` | Sustain: `0.0` | Release: `1.0s`
* **Brightness & Timbre:** Bright, crystalline, glassy, metallic
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: none
  * Detune / Unison: `spread: 5 cents, count: 2`
  * LFO Destinations: none
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.FeedbackDelay` (`delayTime: "8n.", feedback: 0.35, wet: 0.3`)
  2. `Tone.Reverb` (`decay: 3.5s, wet: 0.45`)

---

### 3. Airy Whistle / Flute Lead
* **Role:** Lead
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Mid to High (G4 - E6)
* **Oscillator Configuration:**
  * Type: `sine`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.08s`
  * Decay: `0.3s`
  * Sustain: `0.75`
  * Release: `0.6s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `2200Hz`
  * Envelope Amount / Octaves: `1.0`
  * Attack: `0.08s` | Decay: `0.2s` | Sustain: `0.7` | Release: `0.5s`
* **Brightness & Timbre:** Soft, breathy, mellow, pure
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 5.2Hz, depth: 0.12`
  * Detune / Unison: none
  * LFO Destinations: `filter cutoff` (LFO type: `sine`, rate: `0.5Hz`, min: `2000Hz`, max: `2500Hz`)
  * Portamento / Glide: `0.06s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Chorus` (`frequency: 1.5Hz, delayTime: 3.5ms, depth: 0.4, wet: 0.25`)
  2. `Tone.PingPongDelay` (`delayTime: "4n", feedback: 0.25, wet: 0.2`)
  3. `Tone.Reverb` (`decay: 4.0s, wet: 0.5`)

---

### 4. Seed Rattle / Shaker
* **Role:** Percussion / FX
* **Tone.js Type:** `Tone.NoiseSynth`
* **Register / Note Range:** High Band (3kHz - 12kHz)
* **Oscillator Configuration:**
  * Type: `pink`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.01s`
  * Decay: `0.09s`
  * Sustain: `0.0`
  * Release: `0.05s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `bandpass` (12 dB/oct)
  * Base Cutoff: `4500Hz`
  * Envelope Amount / Octaves: `1.5`
  * Attack: `0.01s` | Decay: `0.08s` | Sustain: `0.0` | Release: `0.05s`
* **Brightness & Timbre:** Dry, crisp, airy, textured
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: none
  * Detune / Unison: none
  * LFO Destinations: `pan` (LFO type: `triangle`, rate: `0.8Hz`, min: `-0.4`, max: `0.4`)
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Filter` (`type: "highpass", frequency: 2000Hz`)
  2. `Tone.Reverb` (`decay: 1.2s, wet: 0.2`)