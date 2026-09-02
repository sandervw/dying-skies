# Tone.js Sound Spec Sheet

---

### 1. Resonant Asian Folk Pluck (Pipa / Shamisen-like)
* **Role:** Pluck / Lead
* **Tone.js Type:** `Tone.PolySynth(Tone.FMSynth)`
* **Register / Note Range:** Mid to High (D4 – A5)
* **Oscillator Configuration:**
  * Type: `triangle` (Carrier: `triangle`, Modulator: `sawtooth`)
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: `harmonicity: 3.01, modulationIndex: 8`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `1.8s`
  * Sustain: `0.0`
  * Release: `1.2s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `1800Hz`
  * Envelope Amount / Octaves: `3.5`
  * Attack: `0.005s` | Decay: `0.4s` | Sustain: `0.1` | Release: `1.0s`
* **Brightness & Timbre:** Bright, twangy, metallic attack with organic acoustic resonance.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 4.5Hz, depth: 0.08` (manual / subtle post-attack)
  * Detune / Unison: `spread: 12 cents, count: 2`
  * LFO Destinations: None
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.FeedbackDelay` (`delayTime: "8n.", feedback: 0.35, wet: 0.25`)
  2. `Tone.Chorus` (`frequency: 1.5, delayTime: 3.5, depth: 0.5, wet: 0.2`)
  3. `Tone.Reverb` (`decay: 3.8, preDelay: 0.02, wet: 0.45`)

---

### 2. Deep Temple Drone / Gong Impact
* **Role:** Drone / Bass
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Sub-Bass to Low (D1 – D2)
* **Oscillator Configuration:**
  * Type: `fatsine`
  * Polyphony / Voicing: Monophonic
  * Harmonicity / Modulation Index: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `0.2s`
  * Decay: `5.0s`
  * Sustain: `0.2`
  * Release: `4.0s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `120Hz`
  * Envelope Amount / Octaves: `2.0`
  * Attack: `0.1s` | Decay: `3.0s` | Sustain: `0.1` | Release: `3.5s`
* **Brightness & Timbre:** Dark, cavernous, heavy fundamental weight with subdued low-mid overtone decay.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 0.2Hz, depth: 0.02`
  * Detune / Unison: `spread: 20 cents, count: 3`
  * LFO Destinations: Filter Cutoff (`type: sine, rate: 0.1Hz, min: 80, max: 240`)
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Distortion` (`distortion: 0.15, wet: 0.1`)
  2. `Tone.Reverb` (`decay: 6.0, preDelay: 0.05, wet: 0.55`)

---

### 3. Ethereal Glass / Airy Pad
* **Role:** Pad / Drone
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** High (A4 – E6)
* **Oscillator Configuration:**
  * Type: `sine` (blended with soft pink noise)
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `1.8s`
  * Decay: `2.5s`
  * Sustain: `0.75`
  * Release: `3.0s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `bandpass` (12 dB/oct)
  * Base Cutoff: `3200Hz`
  * Envelope Amount / Octaves: `0.8`
  * Attack: `1.5s` | Decay: `2.0s` | Sustain: `0.8` | Release: `2.5s`
* **Brightness & Timbre:** Soft, glassy, hollow, misty atmosphere.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 0.8Hz, depth: 0.03`
  * Detune / Unison: `spread: 15 cents, count: 2`
  * LFO Destinations: Pan (`type: sine, rate: 0.15Hz, min: -0.6, max: 0.6`)
  * Portamento / Glide: `0.1s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.StereoWidener` (`width: 0.85, wet: 1.0`)
  2. `Tone.Reverb` (`decay: 8.0, preDelay: 0.1, wet: 0.7`)