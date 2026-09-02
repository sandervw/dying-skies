# Tone.js Sound Spec Sheet

---

### 1. Crystalline Glass FM Bells
* **Role:** Bell / Pluck
* **Tone.js Type:** `Tone.PolySynth(Tone.FMSynth)`
* **Register / Note Range:** High (C5 – C7)
* **Oscillator Configuration:**
  * Type: `sine` (Carrier), `sine` (Modulator)
  * Polyphony / Voicing: Polyphonic (4–6 voices)
  * Harmonicity / Modulation Index: `harmonicity: 3.5`, `modulationIndex: 12.0`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `1.8s`
  * Sustain: `0.05`
  * Release: `2.2s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `8000Hz`
  * Envelope Amount / Octaves: `2`
  * Attack: `0.01s` | Decay: `1.2s` | Sustain: `0.1` | Release: `1.5s`
* **Brightness & Timbre:** Glass-like, crystalline, bright, metallic
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 4.5Hz`, `depth: 0.05`
  * Detune / Unison: `spread: 12 cents`, `count: 2`
  * LFO Destinations: None
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.FeedbackDelay` (`delayTime: "8n."`, `feedback: 0.4`, `wet: 0.35`)
  2. `Tone.Chorus` (`frequency: 1.5`, `delayTime: 3.5`, `depth: 0.6`, `wet: 0.4`)
  3. `Tone.Reverb` (`decay: 5.0`, `preDelay: 0.02`, `wet: 0.55`)

---

### 2. Warm Ethereal Swell Pad
* **Role:** Pad
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Mid (C3 – G5)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `1.8s`
  * Decay: `2.5s`
  * Sustain: `0.75`
  * Release: `3.0s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `1200Hz`
  * Envelope Amount / Octaves: `2.5`
  * Attack: `2.0s` | Decay: `2.0s` | Sustain: `0.5` | Release: `2.5s`
* **Brightness & Timbre:** Warm, airy, soft, cinematic
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 0.2Hz`, `depth: 0.02`
  * Detune / Unison: `spread: 20 cents`, `count: 3`
  * LFO Destinations: `filter cutoff` (LFO type: `sine`, rate: `0.15Hz`, min: `800Hz`, max: `2200Hz`)
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Chorus` (`frequency: 0.8`, `delayTime: 4.0`, `depth: 0.7`, `wet: 0.45`)
  2. `Tone.StereoWidener` (`width: 0.8`, `wet: 1.0`)
  3. `Tone.Reverb` (`decay: 6.5`, `preDelay: 0.04`, `wet: 0.6`)

---

### 3. Deep Resonant Sub-Drone
* **Role:** Drone / Bass
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Sub-Bass / Low (C1 – G2)
* **Oscillator Configuration:**
  * Type: `triangle`
  * Polyphony / Voicing: Monophonic
  * Harmonicity / Modulation Index: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `2.5s`
  * Decay: `4.0s`
  * Sustain: `0.85`
  * Release: `4.0s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `220Hz`
  * Envelope Amount / Octaves: `1.5`
  * Attack: `3.0s` | Decay: `3.0s` | Sustain: `0.7` | Release: `3.5s`
* **Brightness & Timbre:** Dark, deep, foundational, smooth
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: `filter cutoff` (LFO type: `triangle`, rate: `0.08Hz`, min: `140Hz`, max: `350Hz`)
  * Portamento / Glide: `0.5s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Filter` (`frequency: 300`, `type: "lowpass"`, `rolloff: -24`)
  2. `Tone.Reverb` (`decay: 4.0`, `preDelay: 0.01`, `wet: 0.3`)