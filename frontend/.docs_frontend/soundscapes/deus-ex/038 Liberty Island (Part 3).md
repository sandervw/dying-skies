# Tone.js Sound Spec Sheet

---

### 1. Dark Sub Drone / Ambient Low Rumble
* **Role:** Drone / Bass
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Sub-Bass (C1 - C2 / 30 - 70 Hz)
* **Oscillator Configuration:**
  * Type: `triangle` (with slight `fatsawtooth` blend/sub)
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `2.0s`
  * Decay: `1.5s`
  * Sustain: `0.9`
  * Release: `3.0s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `90Hz`
  * Envelope Amount / Octaves: `1.2`
  * Attack: `2.5s` | Decay: `1.0s` | Sustain: `0.8` | Release: `3.0s`
* **Brightness & Timbre:** Dark, warm, cavernous, heavy low-end weight
* **Movement & Modulation:**
  * LFO Destinations: Filter Cutoff (LFO type: `sine`, rate: `0.1Hz`, min: `60Hz`, max: `120Hz`)
  * Portamento / Glide: `0.2s`
* **FX Chain:**
  1. `Tone.Distortion` (`distortion: 0.08`, `wet: 0.2`)
  2. `Tone.Reverb` (`decay: 6.0`, `preDelay: 0.05`, `wet: 0.4`)

---

### 2. Eerie Shimmer / Bowed Glass Pad
* **Role:** Pad
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Mid to High (C4 - G5)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Detune / Spread: `spread: 25 cents`, `count: 3`
* **Amplitude Envelope (ADSR):**
  * Attack: `1.8s`
  * Decay: `2.0s`
  * Sustain: `0.75`
  * Release: `2.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `bandpass` (12 dB/oct)
  * Base Cutoff: `1200Hz`
  * Envelope Amount / Octaves: `1.5`
  * Attack: `2.0s` | Decay: `1.5s` | Sustain: `0.6` | Release: `2.5s`
* **Brightness & Timbre:** Eerie, breathy, glassy, resonant, hollow
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: rate: `4.5Hz`, depth: `0.1`
  * LFO Destinations: Pan (LFO type: `triangle`, rate: `0.25Hz`, min: `-0.6`, max: `0.6`)
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 1.2`, `delayTime: 3.5`, `depth: 0.6`, `wet: 0.5`)
  2. `Tone.FeedbackDelay` (`delayTime: "4n."`, `feedback: 0.45`, `wet: 0.35`)
  3. `Tone.Reverb` (`decay: 8.0`, `preDelay: 0.04`, `wet: 0.6`)

---

### 3. Metallic Resonant Scrape / Dissonant Chime
* **Role:** Bell / FX
* **Tone.js Type:** `Tone.FMSynth`
* **Register / Note Range:** High (E5 - B6)
* **Oscillator Configuration:**
  * Carrier Type: `sine`
  * Modulator Type: `square`
  * Harmonicity / Modulation Index: `harmonicity: 3.14`, `modulationIndex: 18.0`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.05s`
  * Decay: `3.5s`
  * Sustain: `0.15`
  * Release: `3.0s`
* **Brightness & Timbre:** Piercing, metallic, inharmonic, cold, tense
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: rate: `6.0Hz`, depth: `0.25`
  * LFO Destinations: `modulationIndex` (LFO type: `sine`, rate: `0.3Hz`, min: `8`, max: `22`)
* **FX Chain:**
  1. `Tone.PingPongDelay` (`delayTime: "8n"`, `feedback: 0.5`, `wet: 0.4`)
  2. `Tone.Freeverb` (`roomSize: 0.85`, `dampening: 3000`, `wet: 0.55`)

---

### 4. Heavy Cinematic Kick / Sub Impact
* **Role:** Percussion / Bass
* **Tone.js Type:** `Tone.MembraneSynth`
* **Register / Note Range:** Sub to Low (C1 - G1 / ~45 - 90 Hz drop)
* **Oscillator Configuration:**
  * Type: `sine`
  * Pitch Decay: `0.08s`
  * Octaves: `4`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.002s`
  * Decay: `0.7s`
  * Sustain: `0.0`
  * Release: `0.7s`
* **Brightness & Timbre:** Heavy, punchy, deep, muffled acoustic/industrial impact
* **Movement & Modulation:**
  * Portamento / Glide: `0.0s`
* **FX Chain:**
  1. `Tone.Compressor` (`threshold: -18`, `ratio: 4`, `attack: 0.005`, `release: 0.1`)
  2. `Tone.Distortion` (`distortion: 0.15`, `wet: 0.25`)
  3. `Tone.Reverb` (`decay: 2.2`, `preDelay: 0.02`, `wet: 0.25`)

---

### 5. Industrial Metallic Rim / Clap-Snare
* **Role:** Percussion
* **Tone.js Type:** `Tone.NoiseSynth`
* **Register / Note Range:** Mid-High (1 kHz - 8 kHz)
* **Oscillator Configuration:**
  * Noise Type: `white`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.003s`
  * Decay: `0.22s`
  * Sustain: `0.0`
  * Release: `0.22s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `highpass` (12 dB/oct)
  * Base Cutoff: `1500Hz`
  * Envelope Amount / Octaves: `2.0`
  * Attack: `0.002s` | Decay: `0.15s` | Sustain: `0.0` | Release: `0.15s`
* **Brightness & Timbre:** Crisp, clattery, harsh, industrial snap
* **Movement & Modulation:** None
* **FX Chain:**
  1. `Tone.BitCrusher` (`bits: 6`, `wet: 0.2`)
  2. `Tone.Reverb` (`decay: 3.0`, `preDelay: 0.01`, `wet: 0.45`)