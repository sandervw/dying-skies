# Tone.js Sound Spec Sheet

---

### 1. Guttural Sub-Bass Drone / Resonant Growl
* **Role:** Drone / Bass
* **Tone.js Type:** `Tone.FMSynth`
* **Register / Note Range:** Sub-Bass to Low (C1 – G1 with vocal formants up to ~300Hz)
* **Oscillator Configuration:**
  * Type: `sawtooth` (Carrier: `sawtooth`, Modulator: `triangle`)
  * Polyphony / Voicing: Monophonic
  * Harmonicity / Modulation Index: `harmonicity: 0.5, modulationIndex: 8.0`
* **Amplitude Envelope (ADSR):**
  * Attack: `1.2s`
  * Decay: `2.0s`
  * Sustain: `0.9`
  * Release: `2.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `180Hz`
  * Envelope Amount / Octaves: `2.0`
  * Attack: `0.8s` | Decay: `1.5s` | Sustain: `0.7` | Release: `2.0s`
* **Brightness & Timbre:** Dark, guttural, granular, throaty/didgeridoo-like, heavy sub weight
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 3.5Hz, depth: 0.08` (raspy guttural flutter)
  * Detune / Unison: `spread: 15 cents, count: 2`
  * LFO Destinations: `amplitude` (tremolo) (LFO type: `sine`, rate: `3.2Hz`, min: `0.6`, max: `1.0`)
  * Portamento / Glide: `0.1s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Distortion` (`distortion: 0.25, wet: 0.35`)
  2. `Tone.Filter` (`type: "bandpass", frequency: 220, Q: 3.0, wet: 0.4`)
  3. `Tone.Reverb` (`decay: 4.5, preDelay: 0.03, wet: 0.45`)

---

### 2. Cinematic Orchestral / Brass Swell Pad
* **Role:** Pad
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Mid to High (C3 – G5 polyphonic chord cluster)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (6 voices)
  * Harmonicity / Modulation Index: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `2.5s`
  * Decay: `3.0s`
  * Sustain: `0.75`
  * Release: `4.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `450Hz`
  * Envelope Amount / Octaves: `3.5`
  * Attack: `2.2s` | Decay: `2.8s` | Sustain: `0.7` | Release: `4.0s`
* **Brightness & Timbre:** Warm, lush, brassy, epic, cinematic, airy top-end
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 4.8Hz, depth: 0.03`
  * Detune / Unison: `spread: 30 cents, count: 3`
  * LFO Destinations: `filter.frequency` (LFO type: `triangle`, rate: `0.2Hz`, min: `400`, max: `3200`)
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Chorus` (`frequency: 1.5, delayTime: 3.5, depth: 0.7, wet: 0.5`)
  2. `Tone.FeedbackDelay` (`delayTime: "4n.", feedback: 0.35, wet: 0.25`)
  3. `Tone.Reverb` (`decay: 6.0, preDelay: 0.05, wet: 0.65`)