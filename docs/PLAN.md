# Dying Skies — Project Plan

## Concept
An infinite, procedurally-generated universe of unique skies. Each sky is born from a seed, rendered as stars falling slantwise across a pitch-black field. Clicking a falling star saves it and opens its sky — which itself births new stars. Stars that fall offscreen unclicked are dead skies, lost forever.

**Domain:** dyingskies.com (Cloudflare)

---

## Core Loop
1. Landing page: the "root" sky — black background, scattered white static dots, one constellation, falling stars of varying color sequences.
2. Click a falling star → navigate to that star's unique sky page. That star is **saved** (registered to the user if logged in).
3. New sky page also has falling stars, each clickable → infinite traversal.
4. Stars that fall offscreen unclicked = **dead skies**.

---

## Seeds & Uniqueness
- Each star = a 256-bit seed; each seed deterministically generates a unique sky.
- **Collision math:** at 500K stars/sec for 1,000 years (~1.58×10¹⁶ total), 256 bits, P collision ≈ 1.1×10⁻⁴⁵ — astronomically impossible.
- **Bit allocation (provisional):** 256 bits for both visual generation and future MIDI audio generation. Audio is phase 2.

## Seed Authentication (anti-bot)
Goal: users can only save stars they actually clicked. Bots can't POST random seeds to the API.
Scheme: **HMAC-issuance.** No dead-star storage needed.

1. Server holds a secret key `K`.
2. When a client opens a sky, server issues a batch of seeds. Each seed = `HMAC-SHA256(K, session_id || counter)`, truncated to 128 bits. The counter is a simple increment — server stores nothing per-issue.
3. Each seed embeds its HMAC tag. The falling star carries both `seed` + `tag`.
4. User clicks a star → client POSTs `{seed, tag}`. Server recomputes the HMAC, verifies the tag matches, checks the seed hasn't been saved before, stores the 16-byte seed in `saved_stars`, increments the global saved counter.
5. Stars that fall offscreen → nothing. The server never hears about them.

**Storage profile:**
- Only saved stars are persisted. 1,000 saves/sec (extreme) = ~1.4 GB/year. Real usage: negligible.
- Dead counter = `total_issued - total_saved` (derived, not individually witnessed).

---

## Root Sky
- Fixed, hardcoded seed (to-be chosen by Sander). The unchanging origin of the universe.
- Anonymous visitors: **completely non-interactive** — a screensaver. Stars fall, nothing is clickable.
- Logged-in users: fully interactive — click stars to traverse and save.

## Design Philosophy
- Screensaver aesthetic. Very minimal UI.

## URL Structure
- `/` — Root sky (homepage). Global counter tagline displayed.
- `/sky/<seed>` — Individual sky page. Seed encoded as base64url (~43 chars). Shareable.
- `/analytics` — Analytics page. Data visualizations from backend analytics pipeline.

## Global Counter
- Tagline on homepage: "So far, man has saved X skies, destroyed X skies, and allowed X skies to die."
- Full breakdown on `/analytics` with historical data, charts, etc.

## Sky Composition
- Pitch-black background.
- **Static elements (deterministic from seed):**
  - A few scattered white static dots (count, positions).
  - One constellation (shape, position, star count) — random connect-the-dots.
  - Color theme for falling stars — randomly-generated palette, deterministically derived from seed.
- **Dynamic elements (fresh per session):**
  - Falling stars: Each star has a unique, static arrangement of pixels, with each pixel's color drawn from the sky's palette.
- Same seed reopened = same constellation and theme, but new falling stars.

---

## Development Workflow
- Nous builds the Code.
- Iterative: Sander directs, Nous implements small chunks, Sander reviews.
- API contract to be spec'd collaboratively before implementation.

## Phases

### Phase 1 — Core Experience
- React SPA with falling stars, sky traversal, seed-based generation.
- **Frontend stack:** Vite + React (no Next.js).
- Rendering: Canvas 2D (primary). WebGL/Three.js as fallback/upgrade if effects need it.
- Falling stars animation, tail wagging, hit detection, hover freeze, and click traversal (done).
- HMAC seed issuance and save verification.
- Global counters: saved, destroyed, dead.
- Anonymous view-only root sky.
- No auth yet — saving is session-local or disabled until Phase 2.

### Phase 2 - Backend and storage
- Postgres, VPS or Cloud service, fastAPI

### Phase 3 — Custom Auth
- Artsy/custom login experience (TBD).
- User accounts, persistent saved-sky collections.
- **Destroy saved skies:** button on sky page. Permanently deletes the seed from the universe — stored in a `destroyed_seeds` blacklist. No one can ever visit or save that sky again. If multiple users saved the same sky, it vanishes from all their collections.

### Phase 4 - Analytics
- Dagster + dbt, evidence.dev (or alternative custom)

### Phase 54 — MIDI Audio
- Seeds drive unique MIDI tune per sky.
- Web Audio API synthesis in-browser.

---

## TBD During Implementation

### Analytics Page (`/analytics`)
- Beyond the three counters, what else?
- Historical trends chart (saves/destroys/deaths over time)?
- Live feed / recent activity log?
- Per-user stats?
- Heatmap of most-traversed seeds?

### Saved Skies Gallery
- How do users browse saved skies? Thumbnail grid of mini constellation renders? Text list of seeds?
- Sort/filter? By date saved, color theme, etc.?

### Real-Time Counter Updates
- Polling every N seconds (simple, works everywhere)?
- Server-Sent Events (lightweight push)?
- WebSocket (overkill for a counter)?

### Backend API Contract
- Endpoints, request/response shapes, auth headers — to be specced before frontend implementation begins.
- Key endpoints: `POST /seeds/batch` (issue), `POST /stars/save`, `GET /counters`, `GET /sky/:seed`.
