```markdown
# Tone.js Sound Spec Sheet

---

### 1. Sub Drone Bed
* **Role:** Drone / Bass
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Sub-Bass (C1–E2)
* **Oscillator Configuration:**
  * Type: `triangle`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `2.0s`
  * Decay: `2.0s`
  * Sustain: `0.9`
  * Release: `3.0s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `120Hz`
  * Envelope Amount / Octaves: `1.5`
  * Attack: `2.0s` | Decay: `1.5s` | Sustain: `0.8` | Release: `3.0s`
* **Brightness & Timbre:** Deep, dark, warm, smooth sub-foundation
* **Movement & Modulation:**
  * LFO Destinations: `filter.frequency` (LFO type: `sine`, rate: `0.08Hz`, min: `90Hz`, max: `160Hz`)
* **FX Chain (Ordered signal flow):**
  1. `Tone.Filter` (`type: "lowpass", frequency: 180, wet: 1.0`)
  2. `Tone.Reverb` (`decay: 4.0, preDelay: 0.05, wet: 0.3`)

---

### 2. Clockwork Rim / Wood Tick
* **Role:** Percussion / FX
* **Tone.js Type:** `Tone.MembraneSynth`
* **Register / Note Range:** Mid-High transient (~800Hz–2.5kHz body)
* **Oscillator Configuration:**
  * Type: `sine`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.001s`
  * Decay: `0.04s`
  * Sustain: `0.0`
  * Release: `0.04s`
* **Pitch Envelope:**
  * Pitch Decay: `0.02s`
  * Octaves: `3.5`
* **Brightness & Timbre:** Dry, woody, snappy, clock-like transient
* **Movement & Modulation:** None (static rhythmic pulse)
* **FX Chain (Ordered signal flow):**
  1. `Tone.Filter` (`type: "highpass", frequency: 400, wet: 1.0`)
  2. `Tone.Freeverb` (`roomSize: 0.2, dampening: 3000, wet: 0.15`)

---

### 3. Glass / Mallet Bell Pluck
* **Role:** Pluck / Bell / Lead
* **Tone.js Type:** `Tone.FMSynth`
* **Register / Note Range:** High (C5–C7)
* **Oscillator Configuration:**
  * Carrier: `sine`
  * Modulator: `triangle`
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: `harmonicity: 3.5, modulationIndex: 2.0`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.002s`
  * Decay: `1.4s`
  * Sustain: `0.05`
  * Release: `1.8s`
* **Modulation Envelope:**
  * Attack: `0.002s` | Decay: `0.3s` | Sustain: `0.0` | Release: `0.3s`
* **Brightness & Timbre:** Pure, glassy, bell-like, crystalline
* **Movement & Modulation:**
  * Stereo Pan / Ping-pong via stereo delay
* **FX Chain (Ordered signal flow):**
  1. `Tone.FeedbackDelay` (`delayTime: "8n.", feedback: 0.35, wet: 0.35`)
  2. `Tone.Chorus` (`frequency: 1.5, delayTime: 3.5, depth: 0.3, wet: 0.25`)
  3. `Tone.Reverb` (`decay: 3.5, preDelay: 0.02, wet: 0.45`)

---

### 4. Warm Swell Pad
* **Role:** Pad
* **Tone.js Type:** `Tone.PolySynth` (`Tone.Synth`)
* **Register / Note Range:** Mid (C3–G4)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (6 voices)
* **Amplitude Envelope (ADSR):**
  * Attack: `1.2s`
  * Decay: `2.0s`
  * Sustain: `0.75`
  * Release: `2.5s`
* **Filter Envelope & Cutoff:**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `450Hz`
  * Envelope Amount / Octaves: `2.0`
  * Attack: `1.5s` | Decay: `1.8s` | Sustain: `0.6` | Release: `2.5s`
* **Brightness & Timbre:** Warm, lush, diffused, analog character
* **Movement & Modulation:**
  * Detune / Unison: `spread: 20 cents, count: 3`
  * LFO Destinations: `filter.frequency` (LFO type: `triangle`, rate: `0.2Hz`, min: `350Hz`, max: `800Hz`)
* **FX Chain (Ordered signal flow):**
  1. `Tone.Chorus` (`frequency: 0.8, delayTime: 4.0, depth: 0.5, wet: 0.4`)
  2. `Tone.Reverb` (`decay: 5.0, preDelay: 0.04, wet: 0.5`)

---

### 5. Soft Sub Pulse Kick
* **Role:** Bass / Percussion
* **Tone.js Type:** `Tone.MembraneSynth`
* **Register / Note Range:** Sub-Bass (C1–F1, ~45–60Hz)
* **Oscillator Configuration:**
  * Type: `sine`
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `0.45s`
  * Sustain: `0.0`
  * Release: `0.3s`
* **Pitch Envelope:**
  * Pitch Decay: `0.08s`
  * Octaves: `4`
* **Brightness & Timbre:** Muffled, round, soft low-end pulse
* **Movement & Modulation:** None
* **FX Chain (Ordered signal flow):**
  1. `Tone.Filter` (`type: "lowpass", frequency: 160, wet: 1.0`)
  2. `Tone.Compressor` (`threshold: -18, ratio: 4, attack: 0.01, release: 0.1`)
```