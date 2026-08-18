# Analytics Plan

Dagster + dbt + Observable Framework. Concept: `../../.docs/plan.md`. Not started.

## Architecture
dbt reads the backend's Postgres tables directly as dbt sources. No ingestion step, no analytics-owned raw schema, no data copied anywhere. Dagster only orchestrates: it schedules and runs dbt and the Observable Framework site build, and gives lineage across those runs. Historical trends come from timestamped rows in the source event tables, never from the mutable counter totals.

## Dependency warning
Every stage below reads from the backend's Postgres schema. `sessions` and `saved_stars` (with `saved_at`) exist now; `users` lands with backend auth (Phase 3). Stage 1 can begin against these. Destroy and death event tables do not exist yet; historical destroy/death trends stay blocked until they do.

## Serving
Observable Framework builds a static site served at `dyingskies.com/analytics/` via a Cloudflare subpath route and Observable's base-path setting. Black minimal look, static star backdrop, matching the frontend's near-invisible UI.

## Stages

### Stage 1: Backend data-access contract (TODO)
Coordinate with the backend piece: a read-only Postgres role scoped to `saved_stars`, `sessions`, `users`, and counters, plus confirmation that save, destroy, and death events are stored as timestamped rows. `saved_stars` and `sessions` exist now; `users` lands with backend auth.

### Stage 2: dbt sources and staging (TODO)
dbt project scaffold. Declare the backend's Postgres tables as dbt sources (no copying), including `saved_stars`, `sessions`, and `users`. Staging models normalize the raw event, user, and counter tables.

### Stage 3: dbt marts (TODO)
Mart models built on staging: the global counter breakdown (saved/destroyed/dead), total users, and historical trends of saves, destroys, deaths, and signups over time (daily/weekly rollups from timestamped rows). These marts are what Observable Framework queries.

### Stage 4: Dagster orchestration (TODO)
Dagster project scaffold. Assets/jobs that schedule and run the dbt build and the Observable Framework site build, with lineage across them. Dagster does not ingest or store data; it only orchestrates. No freshness sensors or monitoring beyond scheduling the runs.

### Stage 5: Observable Framework site and Cloudflare deploy (TODO)
Observable Framework project rendering the Stage 3 marts (counter breakdown, trends over time). Black minimal look, static star backdrop, base-path configured for `/analytics/`. Wire the static build into a Cloudflare subpath route at `dyingskies.com/analytics/`, confirming it doesn't collide with frontend routes.

## Scope
Counter breakdown (saved/destroyed/dead), total users, and historical trends of saves, destroys, deaths, and signups over time. Metrics beyond this are out of scope until Sander scopes them.
