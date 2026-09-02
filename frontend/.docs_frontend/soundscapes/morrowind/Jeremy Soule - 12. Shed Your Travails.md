# Tone.js Sound Spec Sheet

---

### 1. Ethereal High Whistle / Glass Lead
* **Role:** Lead / Drone
* **Tone.js Type:** `Tone.Synth`
* **Register / Note Range:** High (C6 - G7)
* **Oscillator Configuration:**
  * Type: `sine` (with slight white noise mix)
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.8s`
  * Decay: `1.5s`
  * Sustain: `0.85`
  * Release: `2.5s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `5000Hz`
  * Envelope Amount / Octaves: `0.5`
  * Attack: `0.5s` | Decay: `1.0s` | Sustain: `0.8` | Release: `2.0s`
* **Brightness & Timbre:** Pure, airy, breathy, glassy, high whistle-like
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 4.5Hz, depth: 0.08`
  * Detune / Unison: `spread: 0 cents, count: 1`
  * LFO Destinations: `amplitude` (LFO type: `sine`, rate: `0.2Hz`, min: `0.7`, max: `1.0`)
  * Portamento / Glide: `0.1s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Chorus` (`frequency: 1.5, delayTime: 3.5, depth: 0.4, wet: 0.3`)
  2. `Tone.FeedbackDelay` (`delayTime: "4n.", feedback: 0.45, wet: 0.35`)
  3. `Tone.Reverb` (`decay: 6.0, preDelay: 0.05, wet: 0.6`)

---

### 2. Deep Warm Swell Pad
* **Role:** Pad / Drone
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Low-Mid to Mid (C2 - G4)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (4 voices)
* **Amplitude Envelope (ADSR):**
  * Attack: `2.5s`
  * Decay: `3.0s`
  * Sustain: `0.75`
  * Release: `4.0s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `800Hz`
  * Envelope Amount / Octaves: `2.0`
  * Attack: `2.5s` | Decay: `3.0s` | Sustain: `0.6` | Release: `3.5s`
* **Brightness & Timbre:** Dark, warm, cinematic, enveloping
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 0Hz, depth: 0`
  * Detune / Unison: `spread: 25 cents, count: 3`
  * LFO Destinations: `filter cutoff` (LFO type: `triangle`, rate: `0.1Hz`, min: `600Hz`, max: `1400Hz`)
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Chorus` (`frequency: 0.8, delayTime: 4.0, depth: 0.6, wet: 0.45`)
  2. `Tone.StereoWidener` (`width: 0.8, wet: 0.5`)
  3. `Tone.Reverb` (`decay: 8.0, preDelay: 0.08, wet: 0.55`)

---

### 3. Ambient Glass FM Pluck / Chime
* **Role:** Pluck / Bell
* **Tone.js Type:** `Tone.FMSynth`
* **Register / Note Range:** Mid-High (C4 - E6)
* **Oscillator Configuration:**
  * Type: `sine` (Carrier: `sine`, Modulator: `triangle`)
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: `harmonicity: 3.5, modulationIndex: 1.8`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.01s`
  * Decay: `1.8s`
  * Sustain: `0.15`
  * Release: `3.0s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `3200Hz`
  * Envelope Amount / Octaves: `1.5`
  * Attack: `0.01s` | Decay: `1.2s` | Sustain: `0.2` | Release: `2.5s`
* **Brightness & Timbre:** Delicate, metallic, bell-like, crystalline
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 0Hz, depth: 0`
  * Detune / Unison: `spread: 10 cents, count: 2`
  * LFO Destinations: `pan` (LFO type: `sine`, rate: `0.3Hz`, min: `-0.4`, max: `0.4`)
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.PingPongDelay` (`delayTime: "8n.", feedback: 0.5, wet: 0.4`)
  2. `Tone.Reverb` (`decay: 5.5, preDelay: 0.02, wet: 0.5`)

---

### 4. Sub-Bass Foundation Drone
* **Role:** Bass / Drone
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Sub-Bass (C1 - G2)
* **Oscillator Configuration:**
  * Type: `triangle`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `1.2s`
  * Decay: `2.0s`
  * Sustain: `0.9`
  * Release: `3.0s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `140Hz`
  * Envelope Amount / Octaves: `0.5`
  * Attack: `1.0s` | Decay: `1.5s` | Sustain: `0.8` | Release: `2.0s`
* **Brightness & Timbre:** Deep, smooth, grounding, soft fundamental
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 0Hz, depth: 0`
  * Detune / Unison: `spread: 0 cents, count: 1`
  * LFO Destinations: None
  * Portamento / Glide: `0.2s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Compressor` (`threshold: -18, ratio: 4, attack: 0.05, release: 0.25`)
  2. `Tone.Reverb` (`decay: 3.0, preDelay: 0.01, wet: 0.15`)