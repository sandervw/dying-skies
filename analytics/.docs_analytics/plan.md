# Analytics Plan

Dagster + dbt + Observable Framework. Concept: `../../.docs/plan.md`. All stages done.

## Architecture
dbt reads the backend's Postgres tables directly as dbt sources. No ingestion step, no analytics-owned raw schema, no data copied anywhere. Dagster only orchestrates: it schedules and runs dbt and the Observable Framework site build, and gives lineage across those runs. Historical trends come from timestamped rows in the source event tables, never from the mutable counter totals.

## Dependency warning
Every stage below reads from the backend's Postgres schema. `sessions` and `saved_stars` (with `saved_at`) exist now; `users` lands with backend auth (Phase 3). Stage 1 can begin against these. Destroy and death event tables do not exist yet; historical destroy/death trends stay blocked until they do.

## Serving
Observable Framework builds a static site served at `dyingskies.com/analytics/` via a Cloudflare subpath route and Observable's base-path setting. Black minimal look, static star backdrop, matching the frontend's near-invisible UI.

## Hosting
Dagster runs on the OVH VPS provisioned in `infra/`, as the `dagster-daemon` and `dagster-webserver` systemd services with Postgres-backed storage. The webserver binds to localhost:3000, fronted by a Cloudflare Tunnel gated with Access. dbt connects as `analytics_reader` over local Postgres.

## Stages

### Stage 1: Backend data-access contract (DONE)
A read-only Postgres role, `analytics_reader`, is scoped to `SELECT` on `saved_stars`, `sessions`, and `users`. `saved_stars.saved_at` is a timestamped row confirmed against `backend/app/db.py`. A counters table stays pending until backend delivers it.

The backend provisions the role: `ensure_analytics_role` in `backend/app/db.py` is the source-of-truth contract. On startup it grants `SELECT` on `sessions`, `saved_stars`, `destroyed_stars`, and `users`, and creates an `analytics` schema owned by `analytics_reader` where dbt materializes marts. It reads the reader password from `ANALYTICS_READER_PASSWORD`. Sander sets that env var in the backend `.env` (local) or `/etc/skies/.env` (deploy).

### Stage 2: dbt sources and staging (DONE)
dbt project scaffold. Declares the backend's Postgres tables as dbt sources (no copying), including `saved_stars`, `sessions`, and `users`. Staging models normalize each: `stg_users` (excludes `password_hash`), `stg_sessions`, `stg_saved_stars`.

### Stage 3: dbt marts (DONE)
Mart models built on staging: the global counter breakdown (saved/destroyed/dead), total users, and historical trends of saves, destroys, and signups over time (daily/weekly rollups from timestamped rows). No death trend; dead is a computed total only. These marts are what Observable Framework queries.

### Stage 4: Dagster orchestration (DONE)
Dagster code location under `orchestration/` (package, `[tool.dagster]` in `pyproject.toml`). `dbt_models` runs `dbt build`; `analytics_site` runs `npm run deploy` in `observable/`, downstream of the marts. `refresh_job` covers both, scheduled every 6 hours (`refresh`, America/Chicago). A `failure_alert` run-failure sensor emails via `alert.py` (Cloudflare Email Sending). Dagster only orchestrates; it ingests and stores no data. Run with `uv run dagster dev` from `analytics/`.

### Stage 5: Observable Framework site and Cloudflare deploy (DONE)
Observable Framework project in `observable/` renders the Stage 3 marts (counter breakdown, trends over time). Node data loaders read the marts via the `ANALYTICS_DB_*` env; missing database yields zeros so builds never block. Black minimal look, static seeded starfield, favicon from the frontend logo. `npm run deploy` runs `observable build` then `wrangler deploy`; output nests under `dist/analytics/` and binds the `dying-skies-analytics` Worker to the `dyingskies.com/analytics/*` route. Live at `dyingskies.com/analytics/`. The VPS provisioning installs the site's npm deps and reuses `ANALYTICS_DB_*` and `CLOUDFLARE_*` for scheduled redeploys with real data.

## Scope
Counter breakdown (saved/destroyed/dead), total users, and historical trends of saves, destroys, deaths, and signups over time. Metrics beyond this are out of scope until Sander scopes them.
