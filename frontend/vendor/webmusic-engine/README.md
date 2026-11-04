# webmusic-engine

Engine 5 from `webmusic-engine`: one AudioWorklet running a WebAssembly DSP core. It comes with best-practice mastering and a converter for Dying Skies instrument sets.

## Install

Copy this folder into the app, then add it as a file dependency:

```json
"dependencies": { "webmusic-engine": "file:./vendor/webmusic-engine" }
```

With Vite, exclude it from pre-bundling:

```ts
optimizeDeps: { exclude: ["webmusic-engine"] }
```

It needs a secure context (HTTPS or localhost), AudioWorklet and WebAssembly.

## Use

```ts
import { createEngine, toneSetToPatch } from "webmusic-engine";
import aom from "./instrumentSets/aom.json";

const { patch, roles } = toneSetToPatch(aom, { reverbSend: 0.2 });
const engine = await createEngine({ patch, roles });

window.addEventListener("pointerdown", () => void engine.unlock());

engine.transport.bpm = 80;
const repeat = engine.transport.scheduleRepeat((time) => {
  engine.instrument("bass").triggerAttackRelease("A1", "4n", time, 0.8);
}, "1m", 0);
engine.transport.start();

// Later:
engine.transport.cancel(repeat);
engine.transport.stop();
engine.dispose();
```

## API

- `toneSetToPatch(set, { reverbSend?, roomSize? })` returns `{ patch, roles }`. It takes a set as stored in its JSON file (`synth` is a Tone class name). Instrument ids are the role names: `bass`, `harmony`, `lead`, `counter`, `accent`. It throws on a synth or effect class it can't convert.
- `createEngine({ patch, roles, quality?, context?, latencyHint?, baseUrl? })` returns a ready `Engine`.
  - It applies best practice for engine 5: envelope floors, role high-passes, distortion oversampling, reverb-return filters, a rumble guard, a −1.5 dBTP limiter, and a −84 dBFS noise floor.
  - Stopping and disposing fade out.
  - `quality` is `"high"`, `"medium"`, `"low"` or `"auto"` (the default, picked per device).
  - `latencyHint` defaults to `"playback"`.
- `Engine`:
  - `transport`: `bpm`, `start`, `stop`, `pause`, `scheduleRepeat`, `scheduleOnce`, `cancel`, `toSeconds`. Times accept seconds or Tone-style notation (`"4n"`, `"1m"`).
  - `instrument(id)`: `triggerAttack`, `triggerRelease`, `triggerAttackRelease`, `releaseAll`. Notes are names (`"A1"`) or MIDI numbers.
  - `ramp(target, value, seconds, time?, instrumentId?)`: `volume` (dB), `pan`, `reverbSend` or `filterFrequency`. Without an id, `volume` moves the master.
  - `unlock()` resumes audio after a user gesture. `suspend()`, `resume()`, `dispose()`.
  - `renderOffline(score, { duration, sampleRate?, channels? })` renders to `Float32Array` channels.
  - `now` and `context` expose the audio clock.

All types (`Patch`, `InstrumentSpec`, `Engine`, `Role`, `ToneSet`) are exported.

## Rebuild

From the `webmusic-engine` repo: `npm run build --prefix packages/engine`, then copy `packages/engine/dist` here again.
