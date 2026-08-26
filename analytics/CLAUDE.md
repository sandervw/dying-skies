# CLAUDE.md: Dying Skies / analytics

Dagster + dbt + Observable Framework pipeline feeding the `/analytics` page. Plan: `.docs_analytics/plan.md`. In progress; dbt marts and Dagster orchestration done, the Observable site remains. Standards and system conventions live in the root `CLAUDE.md`; this file adds only analytics specifics.

## Stack notes
- Dagster code location: `orchestration/` package; `[tool.dagster]` in `pyproject.toml`. Run `uv run dagster dev` from `analytics/`.
- Python is pinned `>=3.12,<3.14` (Dagster). dbt reads backend Postgres as sources; Dagster orchestrates, stores no data.

## Prose
Soft-wrap paragraphs (one physical line each). No em-dashes.
