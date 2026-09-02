```markdown
# Tone.js Sound Spec Sheet

---

### 1. Ambient Air Drone / Ethereal Pad
* **Role:** Drone / Pad
* **Tone.js Type:** `Tone.PolySynth(Tone.Synth)`
* **Register / Note Range:** Mid to High (C3 - G5)
* **Oscillator Configuration:**
  * Type: `fatsawtooth`
  * Polyphony / Voicing: Polyphonic (4 voices)
  * Harmonicity / Modulation Index: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `1.8s`
  * Decay: `2.0s`
  * Sustain: `0.75`
  * Release: `2.5s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `850Hz`
  * Envelope Amount / Octaves: `2.5`
  * Attack: `2.0s` | Decay: `2.0s` | Sustain: `0.6` | Release: `2.5s`
* **Brightness & Timbre:** Warm, airy, flute/choral-like, diffuse
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: rate: `4.5Hz`, depth: `0.08`
  * Detune / Unison: spread: `25 cents`, count: `3`
  * LFO Destinations: `filter cutoff` (LFO type: `sine`, rate: `0.15Hz`, min: `600Hz`, max: `1800Hz`)
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Chorus` (`frequency: 1.2, delayTime: 3.5, depth: 0.6, wet: 0.45`)
  2. `Tone.FeedbackDelay` (`delayTime: "4n.", feedback: 0.35, wet: 0.3`)
  3. `Tone.Reverb` (`decay: 6.0, preDelay: 0.04, wet: 0.6`)

---

### 2. Glassy Mallet / Arp Pluck Lead
* **Role:** Pluck / Lead
* **Tone.js Type:** `Tone.PolySynth(Tone.FMSynth)`
* **Register / Note Range:** High-Mid to High (C4 - E6)
* **Oscillator Configuration:**
  * Type: `sine` (Carrier), `triangle` (Modulator)
  * Polyphony / Voicing: Polyphonic (6 voices)
  * Harmonicity / Modulation Index: harmonicity: `3.5`, modulationIndex: `4.0`
* **Amplitude Envelope (ADSR):**
  * Attack: `0.003s`
  * Decay: `0.28s`
  * Sustain: `0.05`
  * Release: `0.35s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (12 dB/oct)
  * Base Cutoff: `2200Hz`
  * Envelope Amount / Octaves: `3.0`
  * Attack: `0.002s` | Decay: `0.2s` | Sustain: `0.0` | Release: `0.25s`
* **Brightness & Timbre:** Bright, percussive, bell/kalimba-like, crisp
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: rate: `0Hz`, depth: `0.0`
  * Detune / Unison: spread: `8 cents`, count: `2`
  * LFO Destinations: None
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.PingPongDelay` (`delayTime: "8n", feedback: 0.4, wet: 0.35`)
  2. `Tone.Freeverb` (`roomSize: 0.7, dampening: 3500, wet: 0.4`)

---

### 3. Tight Analog Synth Bass
* **Role:** Bass
* **Tone.js Type:** `Tone.MonoSynth`
* **Register / Note Range:** Sub-Bass to Low-Mid (E1 - E3)
* **Oscillator Configuration:**
  * Type: `sawtooth`
  * Polyphony / Voicing: Monophonic
  * Harmonicity / Modulation Index: N/A
* **Amplitude Envelope (ADSR):**
  * Attack: `0.005s`
  * Decay: `0.22s`
  * Sustain: `0.25`
  * Release: `0.15s`
* **Filter Envelope & Cutoff (Optional/MonoSynth):**
  * Filter Type: `lowpass` (24 dB/oct)
  * Base Cutoff: `140Hz`
  * Envelope Amount / Octaves: `3.8`
  * Attack: `0.005s` | Decay: `0.18s` | Sustain: `0.1` | Release: `0.15s`
* **Brightness & Timbre:** Punchy, round, focused low-end, warm analog bite
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: None
  * Detune / Unison: `0 cents`
  * LFO Destinations: None
  * Portamento / Glide: `0.02s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Distortion` (`distortion: 0.15, oversample: "2x", wet: 0.25`)
  2. `Tone.EQ3` (`low: 3.0, mid: -1.5, high: -6.0`)
  3. `Tone.Limiter` (`threshold: -1.0`)

---

### 4. Electronic Drum Percussion Suite
* **Role:** Percussion / FX
* **Tone.js Type:** `Tone.MembraneSynth` (Kick/Toms) & `Tone.NoiseSynth` (Hats/Snare)
* **Register / Note Range:** Full Bandwidth (Sub-Low to Ultra-High)
* **Oscillator Configuration:**
  * Type: `sine` (Kick/Toms), `white noise` (Snare/Hats)
  * Polyphony / Voicing: Monophonic per voice instance
  * Harmonicity / Modulation Index: N/A
* **Amplitude Envelope (ADSR):**
  * Kick: Attack: `0.001s` | Decay: `0.35s` | Sustain: `0.0` | Release: `0.35s`
  * Snare/Clap: Attack: `0.002s` | Decay: `0.18s` | Sustain: `0.0` | Release: `0.15s`
  * Closed Hat: Attack: `0.001s` | Decay: `0.05s` | Sustain: `0.0` | Release: `0.03s`
* **Brightness & Timbre:** Crisp, modern, tight electronic punch
* **Movement & Modulation:**
  * Pitch Mod / Vibrato: MembraneSynth pitch decay: `0.05s`, octaves: `6`
  * Detune / Unison: None
  * LFO Destinations: None
  * Portamento / Glide: `0.0s`
* **FX Chain (Ordered signal flow):**
  1. `Tone.Compressor` (`threshold: -18, ratio: 4, attack: 0.005, release: 0.1`)
  2. `Tone.Reverb` (`decay: 1.2, preDelay: 0.01, wet: 0.18`)
```