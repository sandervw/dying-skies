# Analytics outline

Dagster + dbt + Observable Framework. Concept: `../../.docs/plan.md`. Data contract: `data-contract.md`.

## Data flow
dbt reads the backend's Postgres tables directly as dbt sources. dbt materializes staging views and mart tables into an `analytics` schema owned by `analytics_reader`. Observable Framework data loaders query those marts and emit JSON; the site renders it. Dagster orchestrates the dbt build and the site deploy on a schedule. Historical trends derive from timestamped rows in the source event tables.

## dbt
Project in `dbt/`. Connects as `analytics_reader` via `profiles.yml` using the `ANALYTICS_DB_*` env vars; builds into the `analytics` schema. Staging is materialized as views, marts as tables.

Sources (`models/staging/backend/_backend__sources.yml`): backend `public` tables `users`, `sessions`, `saved_stars`, `destroyed_stars`.

Staging normalizes each source: `stg_users` (excludes `password_hash`), `stg_sessions`, `stg_saved_stars`, `stg_destroyed_stars`.

Marts (`models/marts/`):
- `mart_star_counters`: one row of `saved`, `destroyed`, `dead`. `saved` and `destroyed` are row counts; `dead` is issued minus saved minus destroyed, where issued is the sum of `sessions.counter`.
- `mart_users_total`: `total_users`, the `stg_users` row count.
- `mart_star_trends`: daily and weekly counts of saves, destroys, and signups. Columns `event_day`, `event_week`, `event_type` (`saved`/`destroyed`/`signup`), `event_count`. Built by unioning the timestamped event rows.

Dead is a computed total.

## Dagster orchestration
Code location under `orchestration/`, declared by `[tool.dagster]` in `pyproject.toml` (`module_name = orchestration.definitions`). Run locally with `uv run dagster dev` from `analytics/`.

Assets (`assets.py`): `dbt_models` runs `dbt build` (each dbt node is its own asset); `analytics_site` runs `npm run deploy` in `observable/`, downstream of the dbt assets.

`definitions.py` defines `refresh_job` (selection `*`), the `refresh` schedule (cron `0 */6 * * *`, `America/Chicago`), and the `failure_alert` run-failure sensor. On failure the sensor emails the operator via `alert.py` (Cloudflare Email Sending). Dagster orchestrates only; it stores no data of its own.

## Observable Framework site
Project in `observable/`, config `observablehq.config.js`: root `src`, output `dist/analytics`, base `/analytics/`, dark theme, pure-black background, no sidebar/toc/pager, favicon from `logo.png`.

`src/index.md` renders four counter cards (saved, destroyed, dead, users) and a stepped line chart of the trends. `src/components/starfield.js` draws the static seeded starfield backdrop.

Data loaders `src/data/metrics.json.js` and `src/data/trends.json.js` query the marts through `db.js`, a shared `pg` pool reading `ANALYTICS_DB_*` from `.env`. When the database is unavailable the loaders emit zeros.

`npm run deploy` runs `observable build` then `wrangler deploy`. `wrangler.jsonc` serves `dist/` and binds the `dying-skies-analytics` Worker to the `dyingskies.com/analytics` and `dyingskies.com/analytics/*` routes.

## Hosting and serving
Dagster runs on the OVH VPS provisioned in `infra/`, as `dagster-daemon` and `dagster-webserver` systemd services with Postgres-backed storage. The webserver binds `localhost:3000`, fronted by a Cloudflare Tunnel gated with Access. dbt connects as `analytics_reader` over local Postgres. VPS provisioning installs the site's npm deps and provides `ANALYTICS_DB_*` and `CLOUDFLARE_*` to the scheduled redeploys. The site is live at `dyingskies.com/analytics/`.

## Scope
Counter breakdown (saved/destroyed/dead), total users, and historical trends of saves, destroys, and signups over time.
