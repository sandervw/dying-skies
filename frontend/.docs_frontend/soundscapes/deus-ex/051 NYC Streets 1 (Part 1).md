# Tone.js Sound Spec Sheet

---

### 1. Metallic Bell Pluck (Main Motif / Arp)
* **Role:** Pluck / Arp
* **Tone.js Type:** `Tone.PolySynth(Tone.FMSynth)`
* **Register / Note Range:** Mid to High (`D4` - `A5`)
* **Oscillator Configuration:**
  * Type: Carrier: `sine`, Modulator: `sawtooth`
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: `harmonicity: 3.5, modulationIndex: 8`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.003s`
  * Decay: `0.45s`
  * Sustain: `0.08`
  * Release: `0.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `900Hz`
  * Envelope Amount / Octaves: `3.2`
  * Attack: `0.002s` | Decay: `0.35s` | Sustain: `0.1` | Release: `0.4s`
* **Brightness & Timbre:** Bright, glassy, metallic FM strike with resonant top-end.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 0Hz, depth: 0`
  * Detune / Unison: `spread: 12 cents, count: 2`
  * LFO Destinations: Filter cutoff modulation during transitions (`rate: 0.25Hz, min: 800Hz, max: 4500Hz`)
  * Portamento / Glide: `0.0s`
* **FX Chain:**
  1. `Tone.FeedbackDelay` (`delayTime: "8n.", feedback: 0.35, wet: 0.3`)
  2. `Tone.Reverb` (`decay: 2.8, preDelay: 0.02, wet: 0.35`)

---

### 2. Rolling Acid/Mid Bassline
* **Role:** Bass
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Sub to Low-Mid (`D1` - `D2`)
* **Oscillator Configuration:**
  * Type: `sawtooth`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `0.22s`
  * Sustain: `0.25`
  * Release: `0.12s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `180Hz`
  * Envelope Amount / Octaves: `3.0`
  * Attack: `0.005s` | Decay: `0.18s` | Sustain: `0.15` | Release: `0.1s`
* **Brightness & Timbre:** Warm, punchy, resonant driving electro/synth bass.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `none`
  * Detune / Unison: `0 cents`
  * Portamento / Glide: `0.02s`
* **FX Chain:**
  1. `Tone.Distortion` (`distortion: 0.2, wet: 0.25`)
  2. `Tone.Compressor` (`threshold: -18, ratio: 4, wet: 1.0`)

---

### 3. Pumping Atmospheric Chords
* **Role:** Pad / Drone
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Mid (`A2` - `F#4`)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (6 voices)
* **Amplitude Envelope (ADSR):**
  * Attack: `0.35s`
  * Decay: `0.8s`
  * Sustain: `0.75`
  * Release: `1.2s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `1400Hz`
  * Envelope Amount / Octaves: `1.5`
  * Attack: `0.4s` | Decay: `0.8s` | Sustain: `0.6` | Release: `1.0s`
* **Brightness & Timbre:** Warm, lush, wide, diffused supersaw bed.
* **Movement & Modulation:**
  * Detune / Unison: `spread: 25 cents, count: 3`
  * LFO Destinations: Gain/Amplitude sidechain ducking (LFO type: `sawtooth`, `rate: "4n"`, `min: 0.15`, `max: 1.0`)
  * Portamento / Glide: `0.0s`
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 1.5, delayTime: 3.5, depth: 0.7, wet: 0.4`)
  2. `Tone.Reverb` (`decay: 4.5, preDelay: 0.05, wet: 0.55`)

---

### 4. Resonant Vocal/Formant Lead
* **Role:** Lead
* **Tone.js Type:** `Tone.DuoSynth`
* **Register / Note Range:** High (`D5` - `B5`)
* **Oscillator Configuration:**
  * Type: Voice 1: `pulse` (width: 0.35), Voice 2: `triangle`
  * Polyphony / Voicing: Monophonic
  * Harmonicity / Modulation Index: `harmonicity: 1.0`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.02s`
  * Decay: `0.3s`
  * Sustain: `0.65`
  * Release: `0.35s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `bandpass` (12 dB/oct)
  * Base Cutoff: `1800Hz`
  * Envelope Amount / Octaves: `1.2`
  * Attack: `0.04s` | Decay: `0.2s` | Sustain: `0.5` | Release: `0.2s`
* **Brightness & Timbre:** Reedy, nasal, formant-like vocalized synth lead.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 5.5Hz, depth: 0.08`
  * Portamento / Glide: `0.06s`
* **FX Chain:**
  1. `Tone.Chebyshev` (`order: 3, wet: 0.2`)
  2. `Tone.PingPongDelay` (`delayTime: "8n", feedback: 0.4, wet: 0.35`)
  3. `Tone.Reverb` (`decay: 3.0, wet: 0.4`)

---

### 5. Punchy Electronic Kick
* **Role:** Percussion / FX
* **Tone.js Type:** `Tone.MembraneSynth`
* **Register / Note Range:** Sub-Bass (`C1` dropping to `sub`)
* **Oscillator Configuration:**
  * Type: `sine`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.001s`
  * Decay: `0.32s`
  * Sustain: `0.0`
  * Release: `0.32s`
* **Brightness & Timbre:** Deep, clean low-end punch with distinct transient click.
* **Movement & Modulation:**
  * Pitch Mod: Fast pitch drop via pitch decay (`octaves: 6, pitchDecay: 0.035s`)
* **FX Chain:**
  1. `Tone.Distortion` (`distortion: 0.1, wet: 0.15`)
  2. `Tone.Compressor` (`threshold: -12, ratio: 5, wet: 1.0`)

---

### 6. Crisp Hi-Hat / Shaker
* **Role:** Percussion / FX
* **Tone.js Type:** `Tone.NoiseSynth`
* **Register / Note Range:** Very High (`6000Hz - 16000Hz`)
* **Oscillator Configuration:**
  * Type: `white noise`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.001s`
  * Decay: `0.06s` (Closed) / `0.22s` (Open)
  * Sustain: `0.0`
  * Release: `0.05s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `highpass` (24 dB/oct)
  * Base Cutoff: `7500Hz`
* **Brightness & Timbre:** Sizzling, crisp, bright metallic top-end.
* **Movement & Modulation:**
  * LFO Destinations: Stereo Pan (`rate: "8n", min: -0.3, max: 0.3`)
* **FX Chain:**
  1. `Tone.EQ3` (`high: +2, mid: -4, low: -20, wet: 1.0`)
  2. `Tone.Reverb` (`decay: 1.2, wet: 0.15`)