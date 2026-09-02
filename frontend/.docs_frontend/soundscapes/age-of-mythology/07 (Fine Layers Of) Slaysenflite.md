# Tone.js Sound Spec Sheet

---

### 1. Resonant Metallic Pluck (Ostinato / Lead Pluck)
* **Role:** Pluck
* **Tone.js Type:** `Tone.FMSynth`
* **Register / Note Range:** Mid to High (A3 – E5)
* **Oscillator Configuration:**
  * Type: `sine` (Carrier), `triangle` (Modulator)
  * Polyphony / Voicing: Monophonic
  * Harmonicity / Modulation Index: `harmonicity: 3.01`, `modulationIndex: 4.5`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `0.55s`
  * Sustain: `0.1`
  * Release: `0.8s`
* **Brightness & Timbre:** Bright, metallic, twangy attack with ringing bell/sitar-like resonance.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 5.0Hz`, `depth: 0.08`
  * Detune / Unison: `spread: 10 cents`
  * Portamento / Glide: `0.04s`
* **FX Chain:**
  1. `Tone.PingPongDelay` (`delayTime: "8n."`, `feedback: 0.35`, `wet: 0.3`)
  2. `Tone.Reverb` (`decay: 2.5s`, `preDelay: 0.02s`, `wet: 0.35`)

---

### 2. Ethereal Vocal / Flute Lead
* **Role:** Lead
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** High (D4 – B5)
* **Oscillator Configuration:**
  * Type: `sine` (with subtle breathiness)
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.25s`
  * Decay: `0.8s`
  * Sustain: `0.85`
  * Release: `1.2s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `2800Hz`
  * Envelope Amount / Octaves: `1.5`
  * Attack: `0.3s` | Decay: `0.6s` | Sustain: `0.8` | Release: `1.0s`
* **Brightness & Timbre:** Warm, silky, airy, glass-like vocal/woodwind timbre.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 4.8Hz`, `depth: 0.15`
  * Portamento / Glide: `0.12s`
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 1.5Hz`, `delayTime: 3.5ms`, `depth: 0.6`, `wet: 0.25`)
  2. `Tone.FeedbackDelay` (`delayTime: "4n"`, `feedback: 0.25`, `wet: 0.2`)
  3. `Tone.Reverb` (`decay: 4.5s`, `wet: 0.55`)

---

### 3. Deep Organic Sub Bass
* **Role:** Bass
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Sub-Bass / Low (D1 – D2)
* **Oscillator Configuration:**
  * Type: `triangle`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.01s`
  * Decay: `0.4s`
  * Sustain: `0.75`
  * Release: `0.35s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `180Hz`
  * Envelope Amount / Octaves: `1.0`
  * Attack: `0.01s` | Decay: `0.2s` | Sustain: `0.6` | Release: `0.3s`
* **Brightness & Timbre:** Deep, rounded, warm, low-end anchor.
* **Movement & Modulation:**
  * Portamento / Glide: `0.05s`
* **FX Chain:**
  1. `Tone.Distortion` (`distortion: 0.08`, `wet: 0.15`)
  2. `Tone.EQ3` (`low: +3dB`, `mid: -2dB`, `high: -8dB`)

---

### 4. Atmospheric Ambient Drone
* **Role:** Drone / Pad
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Low-Mid (D2 – A3)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (4 voices)
* **Amplitude Envelope (ADSR):**
  * Attack: `1.8s`
  * Decay: `2.0s`
  * Sustain: `0.9`
  * Release: `3.0s`
* **Brightness & Timbre:** Dark, lush, expansive, evolving floor texture.
* **Movement & Modulation:**
  * Detune / Unison: `spread: 25 cents`, `count: 3`
  * LFO Destinations: Filter Cutoff (`type: sine`, `rate: 0.1Hz`, `min: 400Hz`, `max: 1200Hz`)
* **FX Chain:**
  1. `Tone.AutoFilter` (`frequency: 0.15Hz`, `baseFrequency: 500Hz`, `octaves: 2`, `wet: 0.7`)
  2. `Tone.Reverb` (`decay: 5.0s`, `wet: 0.65`)

---

### 5. Organic Percussion & Shaker Bed
* **Role:** Percussion / FX
* **Tone.js Type:** `Tone.NoiseSynth` & `Tone.MembraneSynth`
* **Register / Note Range:** Full Range (Transient click/hiss at 3kHz–12kHz; Low pulse at 60Hz–120Hz)
* **Oscillator Configuration:**
  * Type: `pink` (Shaker/Scrape), `sine` (Low Frame Drum/Kick)
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.002s`
  * Decay: `0.08s` (Shaker) / `0.28s` (Low pulse)
  * Sustain: `0.0`
  * Release: `0.05s`
* **Brightness & Timbre:** Crisp, dry, woody, and kinetic.
* **FX Chain:**
  1. `Tone.StereoWidener` (`width: 0.7`)
  2. `Tone.Reverb` (`decay: 1.0s`, `wet: 0.15`)