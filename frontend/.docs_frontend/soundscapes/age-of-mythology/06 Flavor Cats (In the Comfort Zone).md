# Tone.js Sound Spec Sheet

---

### 1. Organic Seed Rattle / Shaker
* **Role:** Percussion / FX
* **Tone.js Type:** `Tone.NoiseSynth`
* **Register / Note Range:** High (2.5 kHz – 12 kHz)
* **Oscillator Configuration:**
  * Type: `white` noise
  * Polyphony / Voicing: Monophonic
  * Harmonicity / Modulation Index (FM/AM only): N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `0.08s`
  * Sustain: `0.0`
  * Release: `0.05s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `bandpass` (12 dB/oct)
  * Base Cutoff: `4500Hz`
  * Envelope Amount / Octaves: `1.2`
  * Attack: `0.005s` | Decay: `0.06s` | Sustain: `0.0` | Release: `0.05s`
* **Brightness & Timbre:** Crisp, dry, papery, granular seed-pod rattle.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: N/A
  * Detune / Unison: N/A
  * LFO Destinations: Stereo Panning (LFO type: `sine`, rate: `0.25Hz`, min: `-0.2`, max: `0.2`)
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.EQ3` (`low: -12, mid: 2, high: 4, wet: 1.0`)
  2. `Tone.Reverb` (`decay: 1.2s, preDelay: 0.01s, wet: 0.15`)

---

### 2. Kalimba / Mbira Tines
* **Role:** Pluck / Lead
* **Tone.js Type:** `Tone.FMSynth`
* **Register / Note Range:** Mid to High (C4 – G5)
* **Oscillator Configuration:**
  * Type: `sine` (Modulator: `triangle`)
  * Polyphony / Voicing: Polyphonic (8 voices via `Tone.PolySynth`)
  * Harmonicity / Modulation Index (FM/AM only): `harmonicity: 3.5, modulationIndex: 8.0`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.002s`
  * Decay: `0.9s`
  * Sustain: `0.0`
  * Release: `0.6s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `3200Hz`
  * Envelope Amount / Octaves: `2.0`
  * Attack: `0.002s` | Decay: `0.3s` | Sustain: `0.1` | Release: `0.6s`
* **Brightness & Timbre:** Warm, metallic chime with a wooden transient pop and bright harmonic ring.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 4.5Hz, depth: 0.03`
  * Detune / Unison: `spread: 4 cents, count: 2`
  * LFO Destinations: N/A
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Chorus` (`frequency: 1.5, delayTime: 3.5, depth: 0.3, wet: 0.2`)
  2. `Tone.FeedbackDelay` (`delayTime: "8n.", feedback: 0.22, wet: 0.25`)
  3. `Tone.Reverb` (`decay: 2.5s, preDelay: 0.02s, wet: 0.35`)

---

### 3. Acoustic Hand Drum / Frame Drum Bass
* **Role:** Bass / Percussion
* **Tone.js Type:** `Tone.MembraneSynth`
* **Register / Note Range:** Sub-Bass to Low-Mid (F1 – A2)
* **Oscillator Configuration:**
  * Type: `sine`
  * Polyphony / Voicing: Monophonic
  * Harmonicity / Modulation Index (FM/AM only): N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `0.45s`
  * Sustain: `0.0`
  * Release: `0.35s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `600Hz`
  * Envelope Amount / Octaves: `1.5`
  * Attack: `0.005s` | Decay: `0.2s` | Sustain: `0.0` | Release: `0.3s`
* **Brightness & Timbre:** Deep, warm, skin-resonance thud with natural acoustic dampening.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: N/A
  * Detune / Unison: N/A
  * LFO Destinations: N/A
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Compressor` (`threshold: -18, ratio: 4, attack: 0.01, release: 0.1, wet: 1.0`)
  2. `Tone.EQ3` (`low: 4, mid: -2, high: -8, wet: 1.0`)
  3. `Tone.Reverb` (`decay: 1.6s, preDelay: 0.01s, wet: 0.2`)

---

### 4. Wooden Clave / Rim Click
* **Role:** Percussion / FX
* **Tone.js Type:** `Tone.Synth`
* **Register / Note Range:** Mid-High (800 Hz – 1800 Hz)
* **Oscillator Configuration:**
  * Type: `triangle`
  * Polyphony / Voicing: Monophonic
  * Harmonicity / Modulation Index (FM/AM only): N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `0.001s`
  * Decay: `0.045s`
  * Sustain: `0.0`
  * Release: `0.03s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `bandpass` (24 dB/oct)
  * Base Cutoff: `1200Hz`
  * Envelope Amount / Octaves: `0.8`
  * Attack: `0.001s` | Decay: `0.03s` | Sustain: `0.0` | Release: `0.03s`
* **Brightness & Timbre:** Hollow, dry, organic wooden tap with fast transient impact.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: Pitch envelope drop (octaves: `1.5`, decay: `0.015s`)
  * Detune / Unison: N/A
  * LFO Destinations: N/A
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.EQ3` (`low: -10, mid: 3, high: 1, wet: 1.0`)
  2. `Tone.Reverb` (`decay: 1.0s, preDelay: 0.005s, wet: 0.18`)