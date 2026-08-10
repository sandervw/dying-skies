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
- **Collision math:** at 500K stars/sec for 1,000 years (~1.58×10¹⁶ total), 128-bit random seeds give P(collision) ≈ 3.7×10⁻⁷ (~1 in 2.7 million). At 256 bits, P ≈ 1.1×10⁻⁴⁵ — astronomically impossible.
- **Bit allocation (provisional):** lower 128 bits for visual generation; upper 128 bits reserved for future MIDI audio generation. Audio is phase 2.

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

**Why it works:** without the server's secret key, forging a valid HMAC is computationally infeasible. A bot could macro-click real stars rapidly, but it cannot invent valid seeds.

---

## Root Sky
- Fixed, hardcoded seed (chosen by Sander). The unchanging origin of the universe.
- Anonymous visitors: **completely non-interactive** — a screensaver. Stars fall, nothing is clickable.
- Logged-in users: fully interactive — click stars to traverse and save.

## Design Philosophy
- Screensaver aesthetic. Very minimal UI. The sky is the interface.

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
  - One constellation (shape, position, star count) — random connect-the-dots: N points placed by seed-derived PRNG, subset connected by thin white/grey lines. Classic constellation look.
  - Color theme for falling stars — randomly-generated palette (not from a predefined list), deterministically derived from seed.
  - Fall angle / trajectory profile.
- **Dynamic elements (fresh per session):**
  - Falling stars: issued by server each time the sky is opened. Each star has a unique, static arrangement of pixels, with each pixel's color drawn from the sky's palette. Colors do not cycle/change — the star is a fixed multicolored cluster that falls as a unit.
  - **Star shape:** "diamond with a tail" or "thicker dash" — wide enough for reliable click targeting. ~3-4px wide, 8-14px long, angled with fall trajectory.
- Same seed reopened = same constellation and theme, but new falling stars. A sky is a *place*, not a frozen image.

---

## Development Workflow
- Sander builds the Python backend (API + database + analytics).
- Nous builds the React/Canvas frontend.
- Iterative: Sander directs, Nous implements small chunks, Sander reviews.
- API contract to be spec'd collaboratively before implementation begins.

## Phases

### Phase 1 — Core Experience
- React SPA with falling stars, sky traversal, seed-based generation.
- **Frontend stack:** Vite + React (no Next.js).
- Rendering: Canvas 2D (primary). WebGL/Three.js as fallback/upgrade if effects need it.
- HMAC seed issuance and save verification.
- Global counters: saved, destroyed, dead.
- Anonymous view-only root sky.
- No auth yet — saving is session-local or disabled until Phase 2.

### Phase 2 — Custom Auth
- Artsy/custom login experience (TBD).
- User accounts, persistent saved-sky collections.
- **Destroy saved skies:** button on sky page. Permanently deletes the seed from the universe — stored in a `destroyed_seeds` blacklist. No one can ever visit or save that sky again. If multiple users saved the same sky, it vanishes from all their collections.

### Phase 3 — MIDI Audio
- Upper 128 bits of seed drive unique MIDI tune per sky.
- Web Audio API synthesis in-browser.

---

## TBD During Implementation

### Seed → Constellation Algorithm
- How many points per constellation? Range (e.g. 4–12)?
- How are points distributed across the canvas? Gaussian around center? Uniform?
- Which pairs get connected? Nearest-neighbor? Minimum spanning tree? Random subset?
- Line style: thin white, slight opacity? Glow effect?

### Seed → Palette Generation
- How many colors per palette? (e.g. 4–8)
- Color space: HSL with constrained ranges to avoid ugly combinations? Or full RGB freedom?
- How to ensure palettes are visually distinct between skies?

### Star Animation
- Fall speed range (pixels per frame at 60fps)?
- Angle variance — how much does trajectory deviate per star?
- Star spawn rate — stars per second? Constant or variable?
- Star lifetime — how long from spawn to offscreen?
- Z-depths / parallax — do some stars fall faster (closer) and some slower (farther)?

### Analytics Page (`/analytics`)
- Beyond the three counters, what else?
- Historical trends chart (saves/destroys/deaths over time)?
- Live feed / recent activity log?
- Per-user stats (Phase 2)?
- Heatmap of most-traversed seeds?

### Saved Skies Gallery (Phase 2)
- How do users browse saved skies? Thumbnail grid of mini constellation renders? Text list of seeds?
- Sort/filter? By date saved, color theme, etc.?

### Real-Time Counter Updates
- Polling every N seconds (simple, works everywhere)?
- Server-Sent Events (lightweight push)?
- WebSocket (overkill for a counter)?

### Backend API Contract
- Endpoints, request/response shapes, auth headers — to be specced before frontend implementation begins.
- Key endpoints: `POST /seeds/batch` (issue), `POST /stars/save`, `GET /counters`, `GET /sky/:seed`.
