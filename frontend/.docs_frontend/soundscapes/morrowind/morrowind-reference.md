# Morrowind Sound References

## 14. Caprice

### LEAD: Legato Cello / Low String Lead
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

### DRONE: Ambient Drone / Air Texture
* **Role:** Drone
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

## Silt Sunrise

### PAD: Deep Warm Swell Pad
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

## Peaceful Waters

### SPARKLE: Crystalline Music Box / Bell Pluck
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

### COUNTER: Cinematic String / Brass Swell Pad
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
