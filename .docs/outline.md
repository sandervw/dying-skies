# Dying Skies Outline

An infinite, procedurally-generated universe of unique skies. Each sky is born from a 256-bit seed and rendered as stars falling across a black field. Clicking a falling star saves it and opens its sky, which births new stars. Stars that fall offscreen unclicked become dead skies. Live at dyingskies.com on Cloudflare, backed by an OVH VPS.

## Core loop
1. A sky shows static art plus falling stars.
2. Click a falling star to save it and open its sky.
3. Every sky repeats this, giving infinite traversal.
4. Unclicked stars that leave the screen are dead skies.

## Seeds
Each star carries a 256-bit seed that deterministically generates one sky. A reopened seed yields the same static art with fresh falling stars. Seeds are shareable as `/sky/<seed>` links.

## Global counter
The homepage tagline shows how many skies humanity has saved, destroyed, and let die. The full breakdown lives at `/analytics`.

## Pieces
- **Frontend** (`../frontend/.docs_frontend/outline.md`): the visual experience; seed rendering, routing, interaction, and the counter. Vite + React, Canvas 2D, on Cloudflare.
- **Backend** (`../backend/.docs_backend/outline.md`): seed issuance, save verification, counters, persistence, and auth. FastAPI + Postgres.
- **Analytics** (`../analytics/.docs_analytics/outline.md`): the metrics pipeline feeding `/analytics`. Dagster + dbt + Observable Framework.
- **Infra** (`../infra/.docs_infra/outline.md`): OpenTofu provisioning the OVH VPS that runs the backend and analytics.

## Deploy
Pushes to `main` deploy the pieces they touch through GitHub Actions; infra is applied by hand with OpenTofu. See `deploy.md`.
