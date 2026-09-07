# Idiots' Dictionary: Music Words in This Code

Plain-English meanings, guided by the code but not Tone.js-specific.

## How a note travels

```
synth --> filter --> effects --> gain --> speakers
(make it) (color it)  (decorate) (volume)  (out)
```

## Sound makers

- **Synth (synthesizer)**: a program that generates sound electronically instead of playing a recording.
- **MonoSynth**: a synth that plays one note at a time, like a flute.
- **PolySynth / polyphony**: a synth that plays several notes at once, like a piano. `polyphony: 4` means max 4 notes at once.
- **FMSynth**: a synth that makes bells, glassy, metallic sounds by wiggling one wave with another.
- **AMSynth**: like FMSynth but cruder; buzzy, hollow textures.
- **DuoSynth**: two synths glued together, playing in tandem for a thicker lead voice.
- **NoiseSynth**: plays raw noise (no musical pitch), like wind or hiss.
- **Oscillator**: the raw wave a synth repeats to make a tone. Its shape is the timbre.
- **sine**: the smoothest wave; pure, soft, flute-like.
- **triangle**: sine with a slight edge; gentle and hollow.
- **sawtooth**: jagged wave; bright and buzzy, like a brass section.
- **fatsawtooth (count, spread)**: several detuned sawtooths stacked; huge, rich synth-pad sound. `count` = how many, `spread` = how far apart their tunings are (cents).
- **pulse / width**: a square-ish, beep-like wave; `width` skinnies it, making it nasal.
- **harmonicity**: in FM/AM synths, how the wiggling wave relates in pitch; whole numbers sound musical, odd values sound clangy.
- **modulationIndex**: how strongly the wiggling wave distorts the tone; higher = more metallic, glassy, extreme.
- **register**: which octave the role plays in. `register: 5` is higher than `2`. Higher number = higher pitch.

## Loudness over time (the envelope)

- **Envelope**: a volume timeline for every note: attack, decay, sustain, release.
- **attack**: seconds to rise from silence to full volume. 0.01 = instant pluck; 2.5 = slow swell.
- **decay**: seconds to fall from the peak to the sustain level.
- **sustain**: the volume held while the note lasts (0 to 1). 0 means the note fades out by itself, like a bell.
- **release**: seconds to fade out after the note ends.
- **filterEnvelope**: the same timeline but applied to brightness (filter position) instead of volume.
- **portamento**: seconds to slide from one pitch to the next instead of jumping; 0 = instant, 0.3 = smooth glide.

## Tone shaping

- **Filter**: a gate that removes part of the sound by pitch range. Lower `frequency` = darker, muffled.
- **lowpass**: keeps low sounds, cuts high ones. Makes things warm or muffled.
- **bandpass**: keeps only a narrow middle slice; nasal, phone-like, distant.
- **Q**: how narrow a bandpass filter's slice is. Higher = thinner and more whistling.
- **rolloff**: how steeply the filter cuts what it removes. -24 cuts harder than -12.
- **octaves (filterEnvelope)**: how far the filter sweeps during a note, in octaves. Bigger = more dramatic "wah" movement.

## Effects

- **Effect**: a processor placed after the synth that alters the sound on its way out.
- **wet**: how much of the effect is mixed in. 0 = none, 1 = effect only, 0.4 = mostly dry with a touch.
- **Reverb**: makes it sound like the music plays in a big room or cave; echoes smeared into a wash.
- **Chorus**: plays slightly detuned, slightly delayed copies alongside; makes one voice sound like several. Watery, shimmering.
- **Delay**: records the sound and replays it after a short wait; a distinct echo.
- **delayTime**: how long until the echo. Written in note lengths: "4n" = a quarter note, "8n." = a dotted eighth (longer).
- **feedback**: how loudly each echo repeats the last. 0 = one echo, 0.5 = echoing tail, near 1 = endless runaway.
- **PingPongDelay**: echoes bounce left speaker, right speaker, left, like a ping-pong ball.
- **FeedbackDelay**: a normal echo that stays centered.
- **Distortion**: deliberately overdrives the wave; gritty, growling, guitar-amp crackle. `distortion` is the amount.
- **StereoWidener**: spreads the sound wider between left and right speakers. `width` 0 = mono, 1 = very wide.
- **AutoPanner**: automatically sweeps the sound left and right. `frequency` is sweeps per second; `depth` is how far.
- **AutoFilter**: automatically opens and closes a lowpass filter; slow rhythmic "wah wah". `baseFrequency` is the middle position.
- **Gain**: a simple volume knob. `gain: 0.5` is quieter than `0.9`. Used here to balance the roles.
- **Compressor**: automatically squashes loud moments so quiet parts stay audible; keeps the mix even.

## Notes and time

- **Pitch / note**: how high or low a sound is. Named like "C5" (the note C in octave 5).
- **Frequency (Hz)**: pitch measured in vibration speed; 440 Hz is concert A.
- **Semitone**: the smallest step between notes on a piano. Twelve make an octave.
- **Octave**: doubling of frequency; the same note, higher.
- **Scale**: the allowed set of notes. `SCALE = [0,3,5,7,10,12]` means "play only these offsets above the root."
- **transpose**: shift a note up or down by semitones.
- **Root**: the home note the whole piece is built around.
- **Mode**: which flavor of scale; each sounds a different mood (see music-reference.md).
- **Drone**: a long, unchanging held note underneath everything; the floor of the music.
- **Pad**: soft, sustained chords that fill the background, like a warm wash.
- **Lead**: the main melody voice, the part you'd hum.
- **Counter**: a secondary texture weaving against the lead; also an air/wind bed here.
- **Sparkle**: short, high, bell-like notes scattered on top.

## Rhythm and structure

- **Tempo / BPM**: speed of the music; 56 BPM = 56 beats per minute, slow.
- **Beat**: the steady pulse you'd tap your foot to.
- **Bar (measure)**: a fixed group of beats; here music loops every 8 bars (`LOOP_BARS`).
- **"4n", "8n.", "8n"**: note lengths. "4n" = quarter note (one beat), "8n" = eighth (half a beat), the dot makes it half again longer.
- **Transport**: Tone.js's shared clock that all parts follow; start, stop, and set tempo on it.
- **Part**: a scheduled list of "play this role at this bar:beat" events, looping.
- **Trigger (attack/release)**: telling a synth to start and later stop a note.
- **Node / connect / toDestination**: the audio is a chain, like guitar pedals: synth, then filter, then effects, then gain, then speakers.
- **Wet/Dry**: "dry" is the untouched sound; "wet" is the processed one.
- **Dispose**: free the audio resources; without it the browser leaks memory.
