# CLAUDE.md: Dying Skies (monorepo root)

Procedurally-generated "skies" as falling stars on a black field. Click a falling star to save it and open its sky, then traverse forever. Full concept: `.docs/outline.md`. The sky is the interface; UI is near-invisible.

## Repo layout
Four pieces, each with its own tooling and its own `CLAUDE.md`. When working in a piece, read that piece's `CLAUDE.md` for its deltas; the standards below apply everywhere.

- **`frontend/`**: Vite + React, Canvas 2D visual layer. Done; deployed on Cloudflare.
- **`backend/`**: FastAPI + Postgres API. Done; live on an OVH VPS.
- **`analytics/`**: Dagster + dbt + Observable Framework pipeline. Done; live at dyingskies.com/analytics.
- **`infra/`**: OpenTofu provisioning the OVH VPS that runs the backend and analytics.
- **`.docs/`**: cross-cutting docs. Each piece keeps its own `.docs_<piece>/` folder.

## Standards (every piece, every request)

**CLAUDE.md files** hold only what an agent needs on each request: these standards plus the piece's stack.

**Documentation**
- A piece's docs live in its `.docs_<piece>/` folder; cross-cutting docs live in root `.docs/`. A piece's docs cover only that piece and its contracts with others.
- No document (README, CLAUDE.md, plan, reference) exceeds 700 words. Ever.

**Code**
- Code files stay under 300 lines. Ever.
- Comments stay under 12 words.
- Every exported function or object used outside its file carries a javadoc-style comment where the language allows.
- Full descriptive names; the only short forms are `id`, `url`, `api`.
- Pieces integrate through defined contracts such as the HTTP API.

**Config**
- Secrets live in each piece's `.env`, never committed. A tracked `.env.sample` lists the keys with empty values.
- Local `.env` and `.tfvars` files hold live secrets by design and are gitignored, not tracked. Do not flag them.

**Git**
- Agents may stage, commit; commit subjects stay under 12 words.
- Agents never push or merge.

**System**
- Windows/Linux only. Bash, `python`, `wc -w` for word counts.
- Soft-wrap prose. No em-dashes. Prefer non-Microsoft tooling.
