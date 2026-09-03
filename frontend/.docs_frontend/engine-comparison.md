# Engine comparison: generative.fm vs Dying Skies

Structural differences between Alex Bainter's `@generative-music/utilities` engine and `musicEngineService.ts`. Sound design is out of scope; this is plumbing only.

## 1. Playback substrate

His engine plays **live**. Notes go onto the Tone Transport in the online context and sound as they fire, forever, from a graph built once. `Tone.Offline` appears only to prebake a sample plus its effect chain into a reusable buffer.

Ours plays **prerendered**. Every chunk is rendered offline, encoded to WAV, and handed to an `HTMLAudioElement`. There is no live graph and no Transport. We trade steady DSP load for render bursts, and we gain a limiter that sees the whole chunk before it sounds.

This is the root difference; most others follow from it.

## 2. Lifecycle

His contract is `activate(...) -> [deactivate, schedule]`, and `schedule() -> end`. Three teardown levels: end one performance, deactivate the piece, dispose the nodes. `makeActiveStage` makes each idempotent, warns on double-schedule, throws on schedule-after-deactivate.

Ours is one `useEffect` keyed on `[seed]`. No activate/schedule split, so a seed change rebuilds everything; nothing survives except the pooled audio elements.

## 3. Randomness

He mutates one global, `window.generativeMusic.rng`, defaulting to `Math.random`. Pieces are random by default and determinism is opt-in.

We are the inverse: mulberry32 seeded per domain, then per chunk and per role, with `visitSalt` deliberately reintroducing variety. Determinism by construction.

Caveat: `score.seed ^ visitSalt ^ roleIndex` mixes role by XOR before hashing, so role 1 under salt X equals role 0 under salt X^1. Harmless today, fragile if role count grows.

## 4. Render concurrency

`create-prerendered-buffer.js` funnels every offline render through a **module-global serial queue**, plus an `inProgress` map deduping identical renders.

We have no guard. `Tone.Offline` holds the global context across its own `await context.render()`, so two overlapping `renderChunk` calls restore each other's context out of order and can leave the global pointing at a dead offline context. Our callback is now synchronous, so the graph is built before any await and notes no longer land in the wrong render, but the overlap itself is still reachable: on a sky change our cleanup sets `stopped = true` and leaves the in-flight `nextChunk` rendering while the new effect starts chunk 0.

## 5. Caching

He persists rendered buffers via `sampleLibrary.save()`, so a return visit skips rendering. We cache only the impulse response, in memory, keyed by decay; chunks themselves are never cached and every blob url is revoked.

## 6. Fades and gain staging

| | His | Ours |
|---|---|---|
| Fade | 0.1s `linearRampToValueAtTime` on a per-schedule `Gain`, with `cancelScheduledValues` then `setValueAtTime` pinning first | 2s `setInterval` at 50ms on `element.volume` |
| Bus | `Gain(pieceGain) -> Compressor -> destination` | `Gain(1) -> Filter(highpass 35Hz, -24) -> Limiter(-3)` |
| Level | measured per piece by binary search until 60s peak lands in [-2,-1] dBFS, baked into `gain.json` | measured on chunk zero of each score: RMS to `TARGET_RMS`, clamped by `TARGET_PEAK` |

His fades are sample-accurate; ours run on the main thread and stutter under jank. We cannot fix that without routing elements through a `MediaElementAudioSourceNode`, which would cost the unlock trick in section 8.

## 7. Settings only we have

`SAMPLE_RATE` 44100 (he renders at context rate), `HIGHPASS_HZ` 35, `LIMITER_THRESHOLD_DB` -3, `JITTER_SECONDS` 0.025, `CHUNK_TARGET_SECONDS` 30 with a 10s first chunk, `HANDOFF_LEAD_SECONDS` 0.2 and `PRERENDER_AT_SECONDS` 3 polled every 100ms, `TAIL_MARGIN_SECONDS` 2 on top of `reverbDecay`, and envelope reshaping (`decay = hold - attack`, `sustain 0`).

## 8. Settings only he has

`onProgress` threaded through every render path; per-piece gain constants; the serial queue; `wrapMethodWithDisposeError` guarding use-after-dispose; explicit disposal of every intermediate buffer.

Conversely he has no autoplay handling at this layer. Our element pool and `pointerdown` retry have no counterpart, and neither does chunk handoff, where the previous chunk's baked tail rings over the next chunk's start.
