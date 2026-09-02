# Tone.js Sound Spec Sheet

---

### 1. Glassy Ostinato Pluck
* **Role:** Pluck / Lead (Arpeggiated Ostinato)
* **Tone.js Type:** `Tone.FMSynth` (or `Tone.PolySynth(Tone.FMSynth)`)
* **Register / Note Range:** Mid to High (`D4` – `A5`)
* **Oscillator Configuration:**
  * Type: `sine` (Carrier), `triangle` (Modulator)
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: `harmonicity: 2.0`, `modulationIndex: 3.5`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `0.45s`
  * Sustain: `0.05`
  * Release: `0.6s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `1800Hz`
  * Envelope Amount / Octaves: `2.5`
  * Attack: `0.005s` | Decay: `0.3s` | Sustain: `0.1` | Release: `0.5s`
* **Brightness & Timbre:** Bright, glassy, clean, crystalline, dynamic velocity-sensitive brightness
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 0Hz, depth: 0` (Static pitch)
  * Detune / Unison: `spread: 8 cents`
  * LFO Destinations: `filter cutoff` (LFO type: `sine`, rate: `0.2Hz`, min: `1600Hz`, max: `2400Hz`)
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Chorus` (`frequency: 1.5`, `delayTime: 3.5`, `depth: 0.4`, `wet: 0.3`)
  2. `Tone.FeedbackDelay` (`delayTime: "8n."`, `feedback: 0.35`, `wet: 0.25`)
  3. `Tone.Reverb` (`decay: 2.8`, `preDelay: 0.02`, `wet: 0.35`)

---

### 2. Warm Sub / Foundation Bass
* **Role:** Bass
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Sub-Bass / Low (`D1` – `G2`)
* **Oscillator Configuration:**
  * Type: `triangle` mixed with subtle `sawtooth`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.02s`
  * Decay: `0.3s`
  * Sustain: `0.85`
  * Release: `0.4s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `220Hz`
  * Envelope Amount / Octaves: `1.2`
  * Attack: `0.03s` | Decay: `0.25s` | Sustain: `0.6` | Release: `0.3s`
* **Brightness & Timbre:** Deep, warm, rounded, smooth low-end weight
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `none`
  * Detune / Unison: `0 cents`
  * LFO Destinations: `none`
  * Portamento / Glide: `0.04s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Distortion` (`distortion: 0.15`, `wet: 0.1`) (Subtle harmonic saturation)
  2. `Tone.Compressor` (`threshold: -14`, `ratio: 4`, `attack: 0.01`, `release: 0.1`)

---

### 3. Ambient Swell Pad
* **Role:** Pad / Drone
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Mid (`A2` – `E4`)
* **Oscillator Configuration:**
  * Type: `fatsawtooth` (count: 3, spread: 20)
  * Polyphony / Voicing: Polyphonic (6 voices)
* **Amplitude Envelope (ADSR):**
  * Attack: `1.2s`
  * Decay: `2.0s`
  * Sustain: `0.7`
  * Release: `2.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `650Hz`
  * Envelope Amount / Octaves: `2.0`
  * Attack: `1.5s` | Decay: `2.0s` | Sustain: `0.5` | Release: `2.0s`
* **Brightness & Timbre:** Dark, lush, warm, diffuse, cinematic
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 0.5Hz, depth: 0.05`
  * Detune / Unison: `spread: 25 cents, count: 3`
  * LFO Destinations: `pan` (LFO type: `sine`, rate: `0.1Hz`, min: `-0.4`, max: `0.4`)
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Chorus` (`frequency: 0.8`, `delayTime: 4.0`, `depth: 0.6`, `wet: 0.45`)
  2. `Tone.Reverb` (`decay: 5.0`, `preDelay: 0.05`, `wet: 0.55`)

---

### 4. Cinematic Downbeat Riser & Boom
* **Role:** Percussion / FX
* **Tone.js Type:** `Tone.DuoSynth`
* **Register / Note Range:** Low to High sweep (`C1` – `C5`)
* **Oscillator Configuration:**
  * Voice 1 Type: `fatsawtooth` (Reverse-like pitch rise)
  * Voice 2 Type: `sine` (Sub-bass drop/boom)
* **Amplitude Envelope (ADSR):**
  * Attack: `1.8s` (Swell)
  * Decay: `1.2s` (Impact decay)
  * Sustain: `0.0`
  * Release: `1.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `150Hz` rising to `6000Hz`
  * Envelope Amount / Octaves: `5.0`
  * Attack: `1.8s` | Decay: `1.0s` | Sustain: `0.0` | Release: `1.2s`
* **Brightness & Timbre:** Heavy, sweeping, dramatic, textured
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: Exponential upward pitch sweep
  * Detune / Unison: `spread: 30 cents`
  * LFO Destinations: `none`
  * Portamento / Glide: `1.8s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Chebyshev` (`order: 2`, `wet: 0.2`)
  2. `Tone.FeedbackDelay` (`delayTime: "4n"`, `feedback: 0.4`, `wet: 0.35`)
  3. `Tone.Reverb` (`decay: 4.5`, `wet: 0.6`)

---

### 5. Acoustic-Electronic Percussion Groove
* **Role:** Percussion / Rhythm Kit
* **Tone.js Type:** `Tone.Sampler` / `Tone.MembraneSynth` & `Tone.NoiseSynth`
* **Register / Note Range:** Full Spectrum (`C1` Kick to `High` Shakers/Snare)
* **Oscillator Configuration:**
  * Kick: `Tone.MembraneSynth` (pitch: `D1`, pitchDecay: `0.05s`, octaves: `4`)
  * Snare / Clap: `Tone.NoiseSynth` (white noise + tuned triangle transient)
  * Shaker / 16th Hats: `Tone.NoiseSynth` (pink noise with highpass filter at `5000Hz`)
* **Amplitude Envelope (ADSR):**
  * Kick Attack/Decay: `Attack: 0.001s`, `Decay: 0.28s`, `Sustain: 0.0`, `Release: 0.2s`
  * Snare Attack/Decay: `Attack: 0.002s`, `Decay: 0.18s`, `Sustain: 0.0`, `Release: 0.15s`
  * Shaker Attack/Decay: `Attack: 0.005s`, `Decay: 0.06s`, `Sustain: 0.0`, `Release: 0.04s`
* **Brightness & Timbre:** Tight, punchy, crisp high-end, organic syncopation
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `none`
  * Velocity Dynamics: Accents on offbeats and 16th-note subdivisions
* **FX Chain (Ordered signal flow):**
  1. `Tone.Compressor` (`threshold: -12`, `ratio: 3.5`, `attack: 0.005`, `release: 0.08`)
  2. `Tone.Reverb` (`decay: 1.2`, `preDelay: 0.01`, `wet: 0.15`)