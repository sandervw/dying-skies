# Engine comparison: generative.fm vs Dying Skies

Structural differences between Alex Bainter's `@generative-music/utilities` engine and `musicEngineService.ts`. Sound design is out of scope; this is plumbing only.

## 1. Playback substrate

His engine plays **live**. Notes go onto the Tone Transport in the online context and sound as they fire, forever, from a graph built once. `Tone.Offline` appears only to prebake a sample plus its effect chain into a reusable buffer.

Ours plays live as well. `bakeScore` renders one wet one-shot per role offline, once per score; `scheduleChunk` fires those buffers as `ToneBufferSource` nodes at absolute context times.

He schedules on the Transport. We schedule on raw context time, one chunk at a time, each chunk queued a second before the last one ends.

## 2. Lifecycle

His contract is `activate(...) -> [deactivate, schedule]`, and `schedule() -> end`. Three teardown levels: end one performance, deactivate the piece, dispose the nodes. `makeActiveStage` makes each idempotent, warns on double-schedule, throws on schedule-after-deactivate.

Ours is one `useEffect` keyed on `[seed]`. A seed change clears the queue timer, fades the master gain, and disposes the chain two seconds later. Notes already scheduled ring out into that fading chain; nothing else survives.

## 3. Randomness

He mutates one global, `window.generativeMusic.rng`, defaulting to `Math.random`. Pieces are random by default and determinism is opt-in.

We are the inverse: mulberry32 seeded per domain, then per chunk and per role, with `visitSalt` deliberately reintroducing variety. Determinism by construction.

Caveat: `score.seed ^ visitSalt ^ roleIndex` mixes role by XOR before hashing, so role 1 under salt X equals role 0 under salt X^1. Harmless today, fragile if role count grows.

## 4. Render concurrency

`create-prerendered-buffer.js` funnels every offline render through a **module-global serial queue**, plus an `inProgress` map deduping identical renders.

We have no guard. Offline work happens once per score, so the reachable overlap is a sky change during a bake: the abandoned `bakeScore` keeps rendering while the new one starts, and `Tone.Offline` swaps the global context under both.

## 5. Caching

He persists rendered buffers via `sampleLibrary.save()`, so a return visit skips rendering. We cache baked voices in memory, keyed by the serialized score, and impulse responses keyed by decay. A return to the same sky in one session is free; a reload rebakes.

## 6. Fades and gain staging

| | His | Ours |
|---|---|---|
| Fade | 0.1s `linearRampToValueAtTime` on a per-schedule `Gain`, with `cancelScheduledValues` then `setValueAtTime` pinning first | 2s `rampTo` on a master `Gain`, for fade in, mute, and teardown |
| Bus | `Gain(pieceGain) -> Compressor -> destination` | `Gain(level) -> Gain(fade) -> Filter(highpass 35Hz, -24) -> Limiter(-3)` |
| Level | measured per piece by binary search until 60s peak lands in [-2,-1] dBFS, baked into `gain.json` | summed peaks of the baked voices, scaled so a worst-case simultaneous hit stays under 0.7 |

## 7. Settings only we have

a 35Hz master highpass, a -3 dBFS limiter, `JITTER_SECONDS` 0.025, `CHUNK_TARGET_SECONDS` 30 with a 10s first chunk, a 0.2s scheduling lead, the next chunk queued one second early, `TAIL_MARGIN_SECONDS` 2 on top of `reverbDecay`, and envelope reshaping (`decay = hold - attack`, `sustain 0`). Both of us render at the live context rate.

## 8. Settings only he has

`onProgress` threaded through every render path; per-piece gain constants; the serial queue; `wrapMethodWithDisposeError` guarding use-after-dispose; explicit disposal of every intermediate buffer.

Conversely he has no autoplay handling at this layer. Ours is a `pointerdown` listener calling `Tone.start()`, plus a queue loop that waits rather than scheduling into a suspended context.
