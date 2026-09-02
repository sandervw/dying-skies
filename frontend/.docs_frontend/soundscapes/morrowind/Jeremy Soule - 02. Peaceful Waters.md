# Tone.js Sound Spec Sheet Template

---

### 1. Crystalline Music Box / Bell Pluck
* **Role:** Bell / Pluck
* **Tone.js Type:** `Tone.FMSynth`
* **Register / Note Range:** High (E5 – G6)
* **Oscillator Configuration:**
  * Type: `sine` (Modulator: `triangle`)
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: `harmonicity: 3.5, modulationIndex: 1.8`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `0.85s`
  * Sustain: `0.0`
  * Release: `1.2s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `4500Hz`
  * Envelope Amount / Octaves: `1.5`
  * Attack: `0.005s` | Decay: `0.4s` | Sustain: `0.0` | Release: `0.8s`
* **Brightness & Timbre:** Bright, delicate, metallic, glass-like
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 4.0Hz, depth: 0.03`
  * Detune / Unison: `spread: 8 cents, count: 2`
  * LFO Destinations: `None`
  * Portamento / Glide: `0.0s`
* **FX Chain:**
  1. `Tone.FeedbackDelay` (`delayTime: "8n.", feedback: 0.35, wet: 0.3`)
  2. `Tone.Reverb` (`decay: 3.5, preDelay: 0.02, wet: 0.45`)

---

### 2. Cinematic String / Brass Swell Pad
* **Role:** Pad / Lead
* **Tone.js Type:** `Tone.PolySynth` (`Tone.Synth`)
* **Register / Note Range:** Mid to High (G3 – D6)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (6 voices)
  * Harmonicity / Modulation Index: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `1.8s`
  * Decay: `1.2s`
  * Sustain: `0.85`
  * Release: `2.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `600Hz`
  * Envelope Amount / Octaves: `3.2`
  * Attack: `2.0s` | Decay: `1.5s` | Sustain: `0.75` | Release: `2.0s`
* **Brightness & Timbre:** Warm, lush, cinematic, brassy-reedy
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 5.2Hz, depth: 0.08` (envelope delayed to peak after attack)
  * Detune / Unison: `spread: 25 cents, count: 3`
  * LFO Destinations: `filter cutoff` (LFO type: `sine`, rate: `0.25Hz`, min: `500Hz`, max: `3200Hz`)
  * Portamento / Glide: `0.0s`
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 1.5, delayTime: 3.5, depth: 0.7, wet: 0.4`)
  2. `Tone.StereoWidener` (`width: 0.8, wet: 1.0`)
  3. `Tone.Reverb` (`decay: 5.0, preDelay: 0.04, wet: 0.55`)

---

### 3. Deep Cinematic Drone & Sub-Bass
* **Role:** Bass / Drone
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Sub-Bass / Low (C1 – G2)
* **Oscillator Configuration:**
  * Type: `triangle` (with subtle sub-oscillator)
  * Polyphony / Voicing: Monophonic
  * Harmonicity / Modulation Index: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `0.6s`
  * Decay: `0.8s`
  * Sustain: `0.95`
  * Release: `2.0s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `180Hz`
  * Envelope Amount / Octaves: `1.0`
  * Attack: `0.5s` | Decay: `0.8s` | Sustain: `0.8` | Release: `1.5s`
* **Brightness & Timbre:** Deep, dark, heavy rumble, grounded
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `None`
  * Detune / Unison: `spread: 0 cents, count: 1`
  * LFO Destinations: `None`
  * Portamento / Glide: `0.08s`
* **FX Chain:**
  1. `Tone.Distortion` (`distortion: 0.15, wet: 0.1`)
  2. `Tone.Reverb` (`decay: 2.5, preDelay: 0.01, wet: 0.2`)