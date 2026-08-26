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
- **Frontend** (`../frontend/.docs_frontend/outline.md`): the visual experience, seed rendering, routing, interaction, and counter display.
- **Backend** (`../backend/.docs_backend/outline.md`): seed issuance, save verification, counters, persistence, and the API contract.
- **Analytics** (`../analytics/.docs_analytics/plan.md`): the metrics pipeline feeding `/analytics`.

## Remaining Phases
1. **Analytics**: Dagster, dbt, Observable Framework.
2. **MIDI audio**: seed-driven tune per sky via the Web Audio API.
