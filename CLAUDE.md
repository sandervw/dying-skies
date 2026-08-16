# CLAUDE.md — Dying Skies (monorepo root)

Procedurally-generated "skies" as falling stars on a black field. Click a
falling star → save it + open its sky → infinite traversal. Full concept:
`docs/PLAN.md`. The sky is the interface; UI is near-invisible.

## Repo Layout
Three independent pieces, each with its own tooling. Read the scoped
`CLAUDE.md` inside the piece you're working on; it overrides this file.

- **`frontend/`** — Vite + React, Canvas 2D visual layer. The active track.
  See `frontend/CLAUDE.md`.
- **`backend/`** — API + persistence. Not started.
- **`analytics/`** — Data/metrics pipeline. Not started.
- **`docs/`** — Cross-cutting docs (`PLAN.md`). Piece-specific docs live under
  their piece.

## Conventions (all pieces)
- Windows/Linux only. Use Bash, `python`, `wc -w` for word counts.
- Soft-wrap prose. No em-dashes. Prefer non-Microsoft tooling.
- Full descriptive names; exceptions are `id`, `url`, `api`.

## Workflow
Claude runs commands + code. Sander drives and reviews in small chunks,
increasingly hands-off per piece.
