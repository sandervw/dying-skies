```markdown
# Tone.js Sound Spec Sheet Template

---

### 1. High Pipe / Reedy Whistle Lead
* **Role:** Lead / Pluck
* **Tone.js Type:** `Tone.MonoSynth` (or `Tone.FMSynth`)
* **Register / Note Range:** High (C5 - A6)
* **Oscillator Configuration:**
  * Type: `pulse` (width: 0.25) or `triangle` with FM
  * Polyphony / Voicing: Monophonic
  * Harmonicity / Modulation Index (FM/AM only): `[harmonicity: 2.0, modulationIndex: 3.5]`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `0.18s`
  * Sustain: `0.25`
  * Release: `0.2s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `bandpass` (12 dB/oct)
  * Base Cutoff: `2200Hz`
  * Envelope Amount / Octaves: `1.5`
  * Attack: `0.005s` | Decay: `0.15s` | Sustain: `0.3` | Release: `0.2s`
* **Brightness & Timbre:** Bright, nasal, hollow, reedy pipe/whistle with sharp transient articulation
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `[rate: 5.5Hz, depth: 0.1]`
  * Detune / Unison: `spread: 5 cents, count: 1`
  * LFO Destinations: None (static timbre per note)
  * Portamento / Glide: `0.02s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.FeedbackDelay` (`[delayTime: "8n.", feedback: 0.35, wet: 0.3]`)
  2. `Tone.Reverb` (`[decay: 2.0, preDelay: 0.02, wet: 0.25]`)

---

### 2. Warm Swelling Drone / Pad
* **Role:** Drone / Pad / Bass
* **Tone.js Type:** `Tone.PolySynth` with `Tone.Synth`
* **Register / Note Range:** Low to Mid (C2 - G4)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index (FM/AM only): N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `0.35s`
  * Decay: `0.8s`
  * Sustain: `0.75`
  * Release: `1.2s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `650Hz`
  * Envelope Amount / Octaves: `2.0`
  * Attack: `0.4s` | Decay: `0.8s` | Sustain: `0.6` | Release: `1.0s`
* **Brightness & Timbre:** Warm, rounded, brassy/organ-like swell
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: `[rate: 4.0Hz, depth: 0.05]`
  * Detune / Unison: `spread: 15 cents, count: 3`
  * LFO Destinations: Filter Cutoff (LFO type: `sine`, rate: `0.25Hz`, min: `500`, max: `1200`)
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Chorus` (`[frequency: 1.5, delayTime: 3.5, depth: 0.7, wet: 0.4]`)
  2. `Tone.Reverb` (`[decay: 3.5, preDelay: 0.04, wet: 0.4]`)
```