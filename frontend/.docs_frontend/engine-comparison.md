# Engine comparison: generative.fm vs Dying Skies

Structural differences between Alex Bainter's `@generative-music/utilities` engine and `musicEngineService.ts`. Sound design is out of scope.

## 1. Playback substrate

His engine plays **live**. Notes go onto the Tone Transport in the online context and sound as they fire, forever, from a graph built once. `Tone.Offline` appears only to prebake a sample plus its effect chain into a reusable buffer.

Ours plays live as well. `bakeScore` renders one wet one-shot per role offline, once per score; `scheduleChunk` fires those buffers as `ToneBufferSource` nodes at absolute context times.

He schedules on the Transport. We schedule on raw context time, one chunk at a time, each chunk queued a second before the last one ends.

## 2. Lifecycle

His contract is `activate(...) -> [deactivate, schedule]`, and `schedule() -> end`. Three teardown levels: end one performance, deactivate the piece, dispose the nodes. `makeActiveStage` makes each idempotent, warns on double-schedule, throws on schedule-after-deactivate.

Ours is one `useEffect` keyed on `[seed]`. A seed change clears the queue timer, fades the master gain over two seconds, and disposes the chain half a second past that ramp. Notes already scheduled ring out into that fading chain.

## 3. Randomness

He mutates one global, `window.generativeMusic.rng`, defaulting to `Math.random`. Pieces are random by default and determinism is opt-in.

We are the inverse: mulberry32 seeded per domain, then per chunk and per role, with `visitSalt` reintroducing variety.

## 4. Render concurrency

`create-prerendered-buffer.js` funnels every offline render through a **module-global serial queue**, plus an `inProgress` map deduping identical renders.

We have no guard. A sky change during a bake leaves the abandoned `bakeScore` rendering while the new one starts, and `Tone.Offline` swaps the global context under both.

## 5. Fades and gain staging

|       | His                                                                                                                       | Ours                                                                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fade  | 0.1s `linearRampToValueAtTime` on a per-schedule `Gain`, with `cancelScheduledValues` then `setValueAtTime` pinning first | 2s `rampTo` on a master `Gain`, for fade in, mute, and teardown                                                                                   |
| Bus   | `Gain(pieceGain) -> Compressor -> destination`                                                                            | `Gain(level) -> Gain(fade) -> Compressor(-12, 4:1)`                                                               |
| Level | measured per piece by binary search until 60s peak lands in [-2,-1] dBFS, baked into `gain.json`                          | summed peaks of the baked voices, each weighted by the square root of its expected overlap (`density * duration * tempo / 240`), summed under 0.7 |

## 6. Settings only he has

`onProgress` threaded through every render path; per-piece gain constants; the serial queue; `wrapMethodWithDisposeError` guarding use-after-dispose; explicit disposal of every intermediate buffer.

Conversely he has no autoplay handling at this layer. Ours is a `pointerdown` listener calling `Tone.start()`, plus a queue loop that waits while the context is suspended.
