# CLAUDE.md: Dying Skies / analytics

Dagster + dbt + Observable Framework pipeline feeding `dyingskies.com/analytics/`. Outline: `.docs_analytics/outline.md`. Data contract: `../backend/.docs_backend/data-contract.md`.

## Layout
- `dbt/`: dbt project. Sources are the backend's Postgres tables; staging views and mart tables build into the `analytics` schema.
- `orchestration/`: Dagster code location (package; `[tool.dagster]` in `pyproject.toml`). Assets, schedule, failure sensor, resources.
- `observable/`: Observable Framework site. Data loaders read the marts; `wrangler` deploys to the `/analytics/*` route.

## Stack notes
- Python pinned `>=3.12,<3.13`. Managed with `uv`.

## Commands (run from `analytics/`)
- Dagster (dbt build + site deploy, scheduled): `uv run dagster dev`.
- dbt directly: `uv run dbt build` (needs `ANALYTICS_DB_*` env).
- Site build/deploy: `npm run deploy` in `observable/` (`observable build`, copy `_headers` into `dist/`, then `wrangler deploy`); `_headers` caches the fingerprinted `/analytics/_*` files for a year; `npm run dev` for local preview.

## Contract with other pieces
Input data comes from the backend's Postgres, read directly as dbt sources over the read-only `analytics_reader` role the backend provisions. Tables, columns, and access live in `../backend/.docs_backend/data-contract.md`. Connection comes from `ANALYTICS_DB_*` in `.env`; alert and deploy use `CLOUDFLARE_*`. `.env.sample` lists the keys.
