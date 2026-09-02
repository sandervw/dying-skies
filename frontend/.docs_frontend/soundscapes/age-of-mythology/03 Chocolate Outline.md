# Tone.js Sound Spec Sheet

---

### 1. High Shaker / Rattle
* **Role:** Percussion / FX
* **Tone.js Type:** `Tone.NoiseSynth`
* **Register / Note Range:** High (3 kHz – 12 kHz)
* **Oscillator Configuration:**
  * Type: `pink noise`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `0.07s`
  * Sustain: `0.0`
  * Release: `0.05s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `highpass` (12 dB/oct)
  * Base Cutoff: `3500Hz`
  * Envelope Amount / Octaves: `0`
  * Attack: `0.001s` | Decay: `0.05s` | Sustain: `0.0` | Release: `0.05s`
* **Brightness & Timbre:** Crisp, papery, dry, granular transient
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: None
  * Portamento / Glide: `0.0s`
* **FX Chain:**
  1. `Tone.Filter` (`type: "highpass", frequency: 3000, wet: 1.0`)
  2. `Tone.Reverb` (`decay: 0.8, preDelay: 0.01, wet: 0.2`)

---

### 2. Resonant Frame Drum (Dumbek / Tar Bass)
* **Role:** Bass / Percussion
* **Tone.js Type:** `Tone.MembraneSynth`
* **Register / Note Range:** Sub-Bass / Low (`D1 - G2` / 45 Hz – 110 Hz)
* **Oscillator Configuration:**
  * Type: `sine`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.002s`
  * Decay: `0.45s`
  * Sustain: `0.0`
  * Release: `0.35s`
* **Filter Envelope & Cutoff:**
  * Base Cutoff: `180Hz`
  * Pitch Decay: `0.05s`
  * Octaves: `3.5`
* **Brightness & Timbre:** Deep, hollow, warm resonant skin body
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: None
  * Portamento / Glide: `0.0s`
* **FX Chain:**
  1. `Tone.Compressor` (`threshold: -18, ratio: 3.5, attack: 0.01, release: 0.1, wet: 1.0`)
  2. `Tone.EQ3` (`low: 3, mid: -2, high: -6, wet: 1.0`)
  3. `Tone.Reverb` (`decay: 1.4, preDelay: 0.02, wet: 0.25`)

---

### 3. Middle-Eastern Plucked Lead (Oud / Saz)
* **Role:** Lead / Pluck
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Mid to High (`D3 - A5`)
* **Oscillator Configuration:**
  * Type: `sawtooth`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.003s`
  * Decay: `0.8s`
  * Sustain: `0.0`
  * Release: `0.3s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `1800Hz`
  * Envelope Amount / Octaves: `2.2`
  * Attack: `0.002s` | Decay: `0.15s` | Sustain: `0.1` | Release: `0.2s`
* **Brightness & Timbre:** Woody, metallic attack, warm organic body, expressive
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 5.2Hz, depth: 0.08` (manual/expression-driven)
  * Detune / Unison: `spread: 6 cents, count: 2`
  * LFO Destinations: None
  * Portamento / Glide: `0.035s`
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 1.5, delayTime: 3.5, depth: 0.3, wet: 0.25`)
  2. `Tone.FeedbackDelay` (`delayTime: "8n.", feedback: 0.28, wet: 0.22`)
  3. `Tone.Reverb` (`decay: 2.2, preDelay: 0.025, wet: 0.35`)

---

### 4. Cinematic Ambient Drone / Low Pad
* **Role:** Drone / Pad
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Low (`D1 - D3`)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (4 voices)
* **Amplitude Envelope (ADSR):**
  * Attack: `1.8s`
  * Decay: `2.0s`
  * Sustain: `0.85`
  * Release: `2.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `420Hz`
  * Envelope Amount / Octaves: `1.5`
  * Attack: `2.0s` | Decay: `1.5s` | Sustain: `0.5` | Release: `2.0s`
* **Brightness & Timbre:** Dark, warm, filtered, expansive, atmospheric
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: `spread: 18 cents, count: 3`
  * LFO Destinations: Filter Cutoff (`LFO type: "sine", rate: 0.12Hz, min: 280, max: 650`)
  * Portamento / Glide: `0.2s`
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 0.8, delayTime: 4.0, depth: 0.5, wet: 0.4`)
  2. `Tone.Reverb` (`decay: 4.5, preDelay: 0.05, wet: 0.55`)