```markdown
# Tone.js Sound Spec Sheet

---

### 1. Resonant Asian Dulcimer / Pluck
* **Role:** Pluck / Lead
* **Tone.js Type:** `Tone.PolySynth(Tone.FMSynth)`
* **Register / Note Range:** Mid to High (D4 - A5)
* **Oscillator Configuration:**
  * Type: `triangle` (Carrier), `sine` (Modulator)
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: `harmonicity: 3.01`, `modulationIndex: 4.5`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.003s`
  * Decay: `1.4s`
  * Sustain: `0.0`
  * Release: `1.2s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `4200Hz`
  * Envelope Amount / Octaves: `2.5`
  * Attack: `0.005s` | Decay: `0.6s` | Sustain: `0.1` | Release: `1.2s`
* **Brightness & Timbre:** Bright, metallic, crystalline, acoustic hammer-strike transient.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 0Hz`, `depth: 0` (Natural static pitch)
  * Detune / Unison: `spread: 8 cents`, `count: 2`
  * LFO Destinations: None
  * Portamento / Glide: `0.0s`
* **FX Chain:**
  1. `Tone.StereoWidener` (`width: 0.6`, `wet: 0.5`)
  2. `Tone.FeedbackDelay` (`delayTime: "8n."`, `feedback: 0.35`, `wet: 0.28`)
  3. `Tone.Reverb` (`decay: 3.8s`, `preDelay: 0.02s`, `wet: 0.45`)

---

### 2. Deep Sub Cinematic Drone
* **Role:** Drone / Bass
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Sub-Bass to Low (D1 - D2)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Monophonic
  * Harmonicity / Modulation Index: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `2.2s`
  * Decay: `2.5s`
  * Sustain: `0.85`
  * Release: `3.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `140Hz`
  * Envelope Amount / Octaves: `1.2`
  * Attack: `2.0s` | Decay: `2.0s` | Sustain: `0.6` | Release: `3.0s`
* **Brightness & Timbre:** Very dark, warm, rumbling, heavy foundational mass.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: `spread: 15 cents`, `count: 3`
  * LFO Destinations: `filter.frequency` (LFO type: `sine`, `rate: 0.08Hz`, `min: 100Hz`, `max: 220Hz`)
  * Portamento / Glide: `0.4s`
* **FX Chain:**
  1. `Tone.Distortion` (`distortion: 0.15`, `oversample: "2x"`, `wet: 0.15`)
  2. `Tone.Compressor` (`threshold: -18`, `ratio: 4`, `attack: 0.05`, `release: 0.2`)
  3. `Tone.Reverb` (`decay: 4.5s`, `wet: 0.2`)

---

### 3. Shimmering Ambient Pad
* **Role:** Pad
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Mid to High (A3 - E5)
* **Oscillator Configuration:**
  * Type: `sawtooth`
  * Polyphony / Voicing: Polyphonic (6 voices)
  * Harmonicity / Modulation Index: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `2.8s`
  * Decay: `3.0s`
  * Sustain: `0.75`
  * Release: `4.0s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `1800Hz`
  * Envelope Amount / Octaves: `1.8`
  * Attack: `3.0s` | Decay: `3.0s` | Sustain: `0.5` | Release: `4.0s`
* **Brightness & Timbre:** Ethereal, airy, silky, diffused background haze.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: `spread: 20 cents`, `count: 4`
  * LFO Destinations: `pan` (LFO type: `sine`, `rate: 0.12Hz`, `min: -0.4`, `max: 0.4`)
  * Portamento / Glide: `0.0s`
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 0.6Hz`, `delayTime: 3.5ms`, `depth: 0.7`, `wet: 0.5`)
  2. `Tone.Reverb` (`decay: 6.0s`, `preDelay: 0.05s`, `wet: 0.65`)

---

### 4. Cinematic Frame Drum / Sub Hit
* **Role:** Percussion / FX
* **Tone.js Type:** `Tone.MembraneSynth`
* **Register / Note Range:** Sub-Bass (D1, ~36Hz base)
* **Oscillator Configuration:**
  * Type: `sine`
  * Polyphony / Voicing: Monophonic
  * Harmonicity / Modulation Index: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `0.002s`
  * Decay: `1.8s`
  * Sustain: `0.0`
  * Release: `1.8s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `350Hz`
  * Envelope Amount / Octaves: `2.0`
  * Attack: `0.001s` | Decay: `0.4s` | Sustain: `0.0` | Release: `0.4s`
* **Brightness & Timbre:** Boomy, deep, organic impact with resonant sub decay.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: Pitch decay (`octaves: 4`, `pitchDecay: 0.08s`)
  * Detune / Unison: None
  * LFO Destinations: None
  * Portamento / Glide: `0.0s`
* **FX Chain:**
  1. `Tone.Distortion` (`distortion: 0.2`, `wet: 0.2`)
  2. `Tone.Reverb` (`decay: 4.0s`, `wet: 0.4`)

---

### 5. Ambient Shaker / Textured Tick
* **Role:** Percussion
* **Tone.js Type:** `Tone.NoiseSynth`
* **Register / Note Range:** High Band (4kHz - 12kHz)
* **Oscillator Configuration:**
  * Type: `white` noise
  * Polyphony / Voicing: Monophonic
  * Harmonicity / Modulation Index: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `0.004s`
  * Decay: `0.07s`
  * Sustain: `0.0`
  * Release: `0.05s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `bandpass` (12 dB/oct)
  * Base Cutoff: `6500Hz`
  * Envelope Amount / Octaves: `0.5`
  * Attack: `0.002s` | Decay: `0.05s` | Sustain: `0.0` | Release: `0.05s`
* **Brightness & Timbre:** Crisp, dry, sandy, quiet transient rustle.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: None
  * Portamento / Glide: `0.0s`
* **FX Chain:**
  1. `Tone.Panner` (`pan: 0.25`)
  2. `Tone.Reverb` (`decay: 2.2s`, `wet: 0.25`)
```