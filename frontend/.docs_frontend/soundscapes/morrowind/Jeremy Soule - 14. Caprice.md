# Tone.js Sound Spec Sheet

---

### 1. Ostinato Pluck (Cinematic Pizzicato / Muted String)
* **Role:** Pluck
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Mid to High (D3 – A4)
* **Oscillator Configuration:**
  * Type: `triangle` (blended with subtle pulse)
  * Polyphony / Voicing: Polyphonic (4 voices)
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `0.35s`
  * Sustain: `0.0`
  * Release: `0.25s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `800Hz`
  * Envelope Amount / Octaves: `2.5`
  * Attack: `0.005s` | Decay: `0.25s` | Sustain: `0.0` | Release: `0.2s`
* **Brightness & Timbre:** Warm, woody, organic, muted percussive pluck.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 0Hz, depth: 0.0`
  * Detune / Unison: `spread: 5 cents, count: 2`
  * LFO Destinations: None
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.FeedbackDelay` (`delayTime: "8n.", feedback: 0.25, wet: 0.25`)
  2. `Tone.Reverb` (`decay: 2.2, preDelay: 0.01, wet: 0.35`)

---

### 2. Legato Cello / Low String Lead
* **Role:** Lead
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Low-Mid to Mid (G2 – E4)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.25s`
  * Decay: `0.5s`
  * Sustain: `0.85`
  * Release: `0.8s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `1200Hz`
  * Envelope Amount / Octaves: `1.8`
  * Attack: `0.3s` | Decay: `0.6s` | Sustain: `0.7` | Release: `0.8s`
* **Brightness & Timbre:** Warm, bowed, resonant, rich cello-like texture.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 5.2Hz, depth: 0.15`
  * Detune / Unison: `spread: 12 cents, count: 3`
  * LFO Destinations: `filter cutoff` (LFO type: `sine`, rate: `0.2Hz`, min: `900`, max: `1500`)
  * Portamento / Glide: `0.08s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Chorus` (`frequency: 1.5, delayTime: 3.5, depth: 0.4, wet: 0.3`)
  2. `Tone.Reverb` (`decay: 3.5, preDelay: 0.03, wet: 0.45`)

---

### 3. Deep Cinematic Sub-Bass Impact
* **Role:** Bass / Percussion / FX
* **Tone.js Type:** `Tone.MembraneSynth`
* **Register / Note Range:** Sub-Bass (C1 – G1)
* **Oscillator Configuration:**
  * Type: `sine`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.001s`
  * Decay: `1.8s`
  * Sustain: `0.0`
  * Release: `1.2s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `180Hz`
  * Envelope Amount / Octaves: `1.5`
  * Attack: `0.001s` | Decay: `0.8s` | Sustain: `0.0` | Release: `0.8s`
* **Brightness & Timbre:** Deep, dark, heavy, rumbling impact.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: Pitch decay drop (`octaves: 4, pitchDecay: 0.08s`)
  * Detune / Unison: `spread: 0 cents, count: 1`
  * LFO Destinations: None
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Distortion` (`distortion: 0.15, wet: 0.15`)
  2. `Tone.Reverb` (`decay: 4.0, preDelay: 0.02, wet: 0.4`)

---

### 4. Ambient Drone / Air Texture
* **Role:** Drone / Pad
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Low to Mid (D2 – A3)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (3 voices)
* **Amplitude Envelope (ADSR):**
  * Attack: `1.8s`
  * Decay: `2.0s`
  * Sustain: `1.0`
  * Release: `2.5s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `bandpass` (12 dB/oct)
  * Base Cutoff: `450Hz`
  * Envelope Amount / Octaves: `0.8`
  * Attack: `1.5s` | Decay: `2.0s` | Sustain: `0.8` | Release: `2.0s`
* **Brightness & Timbre:** Dark, cavernous, diffuse, evolving cinematic bed.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 0.1Hz, depth: 0.05`
  * Detune / Unison: `spread: 25 cents, count: 3`
  * LFO Destinations: `filter cutoff` (LFO type: `triangle`, rate: `0.15Hz`, min: `300`, max: `700`)
  * Portamento / Glide: `0.2s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Filter` (`type: "lowpass", frequency: 800, rolloff: -24`)
  2. `Tone.Reverb` (`decay: 6.0, preDelay: 0.05, wet: 0.65`)