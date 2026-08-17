# Dying Skies Plan

## Concept
An infinite, procedurally-generated universe of unique skies. Each sky is born from a 256-bit seed and rendered as stars falling across a black field. Clicking a falling star saves it and opens its sky, which births new stars. Stars that fall offscreen unclicked become dead skies. Domain: dyingskies.com (Cloudflare).

## Core loop
1. A sky shows static art plus falling stars.
2. Click a falling star to save it and open its sky.
3. Every sky repeats this, giving infinite traversal.
4. Unclicked stars that leave the screen are dead skies.

## Seeds
Each star is a 256-bit seed that deterministically generates one sky. The seed space makes collisions effectively impossible. A seed reopened yields the same static art with fresh falling stars. Seed mechanics live in the backend plan.

## Global counter
Homepage tagline: how many skies humanity has saved, destroyed, and let die. The full breakdown lives on `/analytics`.

## Pieces
- **Frontend** (`../frontend/.docs_frontend/plan.md`): the visual experience, seed rendering, routing, interaction, and counter display.
- **Backend** (`../backend/.docs_backend/plan.md`): seed issuance, save verification, counters, persistence, and the API contract.
- **Analytics** (`../analytics/.docs_analytics/plan.md`): the metrics pipeline feeding `/analytics`.

## Phases
1. **Core experience** (active): React SPA, falling stars, seed traversal, session-local or disabled saving.
2. **Backend and storage**: Postgres, FastAPI, HMAC seed issuance, counters.
3. **Custom auth**: accounts, persistent collections, destroy-saved-sky.
   - Reminder: `saved_stars` (and destroyed rows) gain an owner reference here. Decide global-first-saver vs per-user-collection ownership. Pre-auth saves are anonymous; capture `session_id` at save time earlier only if those saves must be adoptable on signup.
4. **Analytics**: Dagster, dbt, Observable Framework.
5. **MIDI audio**: seed-driven tune per sky via the Web Audio API.
