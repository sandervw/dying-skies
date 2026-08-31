# Reference: WebAudio session fixes (reverted)

Every click/pop fix applied in the 2026-08-31 debugging session, preserved here because all were reverted from the code. Reapply selectively; each is independent unless noted.

## Diagnosis

AudioWorklet taps on each layer, the reverb, and the output found zero waveform discontinuities while pops were audible. The pops came from Chrome's WebAudio-over-Bluetooth output path, confirmed by a plain WebAudio tone generator crackling on the same headphones (Shokz, 50 Hz floor, bass-boost DSP). Clean on wired and hi-fi gear. Secondary finding: raw Tone oscillators default to 0 dB and sustained lows stress cheap amps (Tone.js issue 976). The planned Tone.Offline render plus `<audio>` playback route sidesteps the broken transport entirely.

## Voice fixes, useSkyMusic.ts

Jitter each trigger about 5 cents so PolySynth never resets a still-ringing voice (same-pitch retrigger was the top pop suspect):

```ts
const part = new Tone.Part<MusicEvent>((time, value) => {
  const detune = 1 + (Math.random() - 0.5) * 0.006;
  synth.triggerAttackRelease(value.frequency * detune, value.duration, time);
}, buildEvents(layer, score));
```

Raise voice cap, default 32 steals long drone tails mid-release:

```ts
synth.maxPolyphony = 64;
```

Per-role gain staging, applied with `synth.volume.value = ROLE_VOLUME[layer.role]` (import `Role` in the type import):

```ts
const ROLE_VOLUME: Record<Role, number> = {
  drone: -14, pad: -11, sparkle: -8, accent: -9, counter: -12,
};
```

## Generator fixes, musicService.ts

Floor attacks at 20 ms in `generateLayer`; faster starts click:

```ts
attack: Math.max(0.02, randomInRange(random, range.attack[0], range.attack[1])),
```

Drone register band raised so drones clear cheap-speaker floors, `ROLE_OCTAVE.drone` from `[1, 2]` to `[2, 3]`.

## Master chain, useSkyMusic.ts

Playback-latency context before any node exists (guard against remounts). The option must be spelled `latencyHint`; a `latencyContextHint` typo passes silently and does nothing:

```ts
let playbackContextReady = false;
const ensurePlaybackContext = (): void => {
  if (playbackContextReady) { return; }
  playbackContextReady = true;
  Tone.setContext(new Tone.Context({ latencyHint: "playback" }));
};
ensurePlaybackContext();
```

Scheduling headroom for main-thread stalls: `Tone.getContext().lookAhead = 0.25;`

Trim sub-bass and cap peaks before the destination:

```ts
const highpass = new Tone.Filter(60, "highpass");
const limiter = new Tone.Limiter(-1);
master.connect(highpass);
highpass.connect(limiter);
limiter.connect(Tone.getDestination());
```

Unmount: fade then dispose, instant disposal cuts ringing voices:

```ts
master.gain.rampTo(0, 0.1);
window.setTimeout((): void => { master.dispose(); highpass.dispose(); limiter.dispose(); }, 150);
```

## Reverb send, useSkyMusic.ts

Pro-style routing so lows stay dry and the wet level is a send gain instead of a crossfade:

```ts
const reverb = new Tone.Reverb({ decay: score.reverbDecay, wet: 1 });
const reverbSend = new Tone.Gain(score.reverbWet);
const reverbHighpass = new Tone.Filter(150, "highpass");
group.connect(master);
group.connect(reverbSend);
reverbSend.connect(reverbHighpass);
reverbHighpass.connect(reverb);
reverb.connect(master);
```

Dispose `reverbSend` and `reverbHighpass` with `reverb` in the cleanup timeout.

## Diagnostic

One-time buffer check, remove after use:

```ts
const rawContext = Tone.getContext().rawContext as AudioContext;
console.info(`[music] baseLatency=${rawContext.baseLatency}`);
```
