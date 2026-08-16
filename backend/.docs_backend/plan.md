# Backend Plan

FastAPI + Postgres. Concept: `../../.docs/plan.md`. Not started.

## Seeds and uniqueness
- Each star is a 256-bit seed generating one sky deterministically.
- 256 bits cover visual generation now and future MIDI audio.
- The seed space makes collisions effectively impossible at any real scale.

## Seed issuance (HMAC)
Users can only save stars they clicked; bots cannot post arbitrary seeds.
- The server holds a secret key `K`.
- On opening a sky, the server issues a batch of seeds. Each seed is
  `HMAC-SHA256(K, session_id || counter)` truncated to 128 bits; the counter
  increments and nothing is stored per issue.
- Each falling star carries its `seed` and `tag`.

## Save verification
- The client posts `{seed, tag}` when a star is clicked.
- The server recomputes the HMAC, checks the tag, checks the seed is unsaved,
  stores the 16-byte seed, and increments the saved counter.
- Offscreen stars are never reported.

## Counters and storage
- Only saved stars persist; storage stays negligible in practice.
- Counters: saved, destroyed, dead (dead = issued minus saved).
- Destroyed seeds go to a blacklist (Phase 3); a destroyed sky can never be
  visited or saved again.

## API contract (spec before frontend build)
- `POST /seeds/batch` issue seeds.
- `POST /stars/save` verify and save.
- `GET /counters` current totals.
- `GET /sky/:seed` sky data for a seed.
