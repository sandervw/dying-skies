# CLAUDE.md: Dying Skies / analytics

Dagster + dbt + Observable Framework pipeline feeding `dyingskies.com/analytics/`. Outline: `.docs_analytics/outline.md`. Data contract: `.docs_analytics/data-contract.md`. Root `CLAUDE.md` holds shared standards and conventions; this file adds only analytics specifics.

## Layout
- `dbt/`: dbt project. Sources are the backend's Postgres tables; staging views and mart tables build into the `analytics` schema.
- `orchestration/`: Dagster code location (package; `[tool.dagster]` in `pyproject.toml`). Assets, schedule, failure sensor, resources.
- `observable/`: Observable Framework site. Data loaders read the marts; `wrangler` deploys to the `/analytics/*` route.

## Stack notes
- Python pinned `>=3.12,<3.13` (Dagster). Managed with `uv`.
- dbt reads backend Postgres as sources; Dagster orchestrates and stores no data of its own.

## Commands (run from `analytics/`)
- Dagster (dbt build + site deploy, scheduled): `uv run dagster dev`.
- dbt directly: `uv run dbt build` (needs `ANALYTICS_DB_*` env).
- Site build/deploy: `npm run deploy` in `observable/` (`observable build` then `wrangler deploy`); `npm run dev` for local preview.

## Contract with other pieces
Input data comes from the backend's Postgres, read directly as dbt sources over the read-only `analytics_reader` role the backend provisions. Tables, columns, and access live in `.docs_analytics/data-contract.md`. Connection comes from `ANALYTICS_DB_*` in `.env`; alert and deploy use `CLOUDFLARE_*`. `.env.sample` lists the keys.

## Prose
Soft-wrap paragraphs (one physical line each). No em-dashes.
