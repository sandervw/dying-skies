```markdown
# Tone.js Sound Spec Sheet

---

### 1. Crystalline Chime Pluck
* **Role:** Lead / Bell / Pluck
* **Tone.js Type:** `Tone.PolySynth(Tone.FMSynth)`
* **Register / Note Range:** High (C5 - G6)
* **Oscillator Configuration:**
  * Type: `sine` (carrier), `sine` (modulator)
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: `harmonicity: 3.01`, `modulationIndex: 3.5`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `0.7s`
  * Sustain: `0.1`
  * Release: `1.2s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `5500Hz`
  * Envelope Amount / Octaves: `1.5`
  * Attack: `0.005s` | Decay: `0.4s` | Sustain: `0.2` | Release: `1.0s`
* **Brightness & Timbre:** Bright, glass-like, metallic, clear chime
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 4.5Hz`, `depth: 0.02`
  * Detune / Unison: `spread: 8 cents`, `count: 2`
  * LFO Destinations: None
  * Portamento / Glide: `0.0s`
* **FX Chain:**
  1. `Tone.FeedbackDelay` (`delayTime: "8n."`, `feedback: 0.35`, `wet: 0.3`)
  2. `Tone.Chorus` (`frequency: 1.2`, `delayTime: 3.5`, `depth: 0.5`, `wet: 0.25`)
  3. `Tone.Reverb` (`decay: 3.5s`, `preDelay: 0.02s`, `wet: 0.45`)

---

### 2. Warm Ambient Chord Pad
* **Role:** Pad
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Mid (G3 - E5)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (6 voices)
  * Harmonicity / Modulation Index: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `0.8s`
  * Decay: `1.5s`
  * Sustain: `0.75`
  * Release: `2.2s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `1100Hz`
  * Envelope Amount / Octaves: `1.2`
  * Attack: `0.8s` | Decay: `1.2s` | Sustain: `0.6` | Release: `2.0s`
* **Brightness & Timbre:** Warm, lush, gentle, diffused
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `rate: 0.5Hz`, `depth: 0.01`
  * Detune / Unison: `spread: 15 cents`, `count: 3`
  * LFO Destinations: Filter Cutoff (`LFO type: sine`, `rate: 0.2Hz`, `min: 850`, `max: 1400`)
  * Portamento / Glide: `0.0s`
* **FX Chain:**
  1. `Tone.Chorus` (`frequency: 0.8`, `delayTime: 4.0`, `depth: 0.7`, `wet: 0.4`)
  2. `Tone.Reverb` (`decay: 4.5s`, `preDelay: 0.05s`, `wet: 0.55`)

---

### 3. Deep Sub Drone Bass
* **Role:** Drone / Bass
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Sub-Bass (C1 - G2)
* **Oscillator Configuration:**
  * Type: `triangle`
  * Polyphony / Voicing: Monophonic
  * Harmonicity / Modulation Index: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `0.4s`
  * Decay: `1.0s`
  * Sustain: `0.9`
  * Release: `1.8s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `280Hz`
  * Envelope Amount / Octaves: `0.5`
  * Attack: `0.3s` | Decay: `0.8s` | Sustain: `0.8` | Release: `1.5s`
* **Brightness & Timbre:** Dark, round, deep, foundational
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: None
  * LFO Destinations: Amplitude (`LFO type: sine`, `rate: 0.1Hz`, `min: 0.8`, `max: 1.0`)
  * Portamento / Glide: `0.1s`
* **FX Chain:**
  1. `Tone.Filter` (`frequency: 350Hz`, `type: "lowpass"`, `wet: 1.0`)
  2. `Tone.Reverb` (`decay: 2.0s`, `preDelay: 0.01s`, `wet: 0.15`)
```