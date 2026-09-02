# Tone.js Sound Spec Sheet

---

### 1. Acoustic Piano (Low Bass Register)
* **Role:** Bass
* **Tone.js Type:** `Tone.Sampler` (or `Tone.Synth` / `Tone.MonoSynth`)
* **Register / Note Range:** Low / Bass (G1 – D3)
* **Oscillator Configuration:**
  * Type: `triangle` layered with soft `sine` (or acoustic piano multisample)
  * Polyphony / Voicing: Monophonic
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `4.5s`
  * Sustain: `0.15`
  * Release: `1.8s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `450Hz`
  * Envelope Amount / Octaves: `2.0`
  * Attack: `0.005s` | Decay: `3.0s` | Sustain: `0.1` | Release: `1.5s`
* **Brightness & Timbre:** Deep, warm, rich wooden resonance, soft hammer strike.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: none
  * Detune / Unison: `spread: 4 cents, count: 2` (subtle un-ison string detune)
  * LFO Destinations: none
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.EQ3` (`low: +2.0dB, mid: -1.0dB, high: -4.0dB`)
  2. `Tone.Reverb` (`decay: 3.2s, preDelay: 0.02s, wet: 0.35`)

---

### 2. Acoustic Piano (Mid Harmony Chords)
* **Role:** Pad / Chords
* **Tone.js Type:** `Tone.PolySynth` (`Tone.Synth`)
* **Register / Note Range:** Mid (G3 – B4)
* **Oscillator Configuration:**
  * Type: `triangle` / `fatsawtooth` (heavily filtered)
  * Polyphony / Voicing: Polyphonic (4–6 voices)
* **Amplitude Envelope (ADSR):**
  * Attack: `0.02s`
  * Decay: `3.0s`
  * Sustain: `0.25`
  * Release: `1.2s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `1800Hz`
  * Envelope Amount / Octaves: `1.5`
  * Attack: `0.02s` | Decay: `2.0s` | Sustain: `0.2` | Release: `1.0s`
* **Brightness & Timbre:** Warm, felted, mellow, gentle transient.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: none
  * Detune / Unison: `spread: 6 cents, count: 2`
  * LFO Destinations: none
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.StereoWidener` (`width: 0.4, wet: 1.0`)
  2. `Tone.Reverb` (`decay: 3.5s, preDelay: 0.03s, wet: 0.45`)

---

### 3. Acoustic Piano (Melodic Top Voice)
* **Role:** Lead
* **Tone.js Type:** `Tone.PolySynth` (`Tone.Synth`)
* **Register / Note Range:** High-Mid / Treble (C#4 – E5)
* **Oscillator Configuration:**
  * Type: `sine` layered with soft `triangle`
  * Polyphony / Voicing: Polyphonic (2–3 voices)
* **Amplitude Envelope (ADSR):**
  * Attack: `0.008s`
  * Decay: `5.0s`
  * Sustain: `0.35`
  * Release: `2.0s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `3800Hz`
  * Envelope Amount / Octaves: `1.8`
  * Attack: `0.008s` | Decay: `3.5s` | Sustain: `0.3` | Release: `1.5s`
* **Brightness & Timbre:** Clear, singing, crystalline wooden ping with a long natural ring.
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: none
  * Detune / Unison: `spread: 8 cents, count: 3` (triple-string piano chorus)
  * LFO Destinations: none
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Compressor` (`threshold: -20dB, ratio: 2.5, attack: 0.02s, release: 0.3s`)
  2. `Tone.Reverb` (`decay: 4.0s, preDelay: 0.04s, wet: 0.5`)