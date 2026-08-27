# CLAUDE.md: Dying Skies (monorepo root)

Procedurally-generated "skies" as falling stars on a black field. Click a falling star to save it and open its sky, then traverse forever. Full concept: `.docs/plan.md`. The sky is the interface; UI is near-invisible.

## Repo layout
Three independent pieces, each with its own tooling and its own `CLAUDE.md`. When working in a piece, read that piece's `CLAUDE.md` for its deltas; the standards below apply everywhere.

- **`frontend/`**: Vite + React, Canvas 2D visual layer. Done; deployed on Cloudflare.
- **`backend/`**: FastAPI + Postgres API. Done; live on GCP.
- **`analytics/`**: Dagster + dbt + Observable Framework pipeline. In progress; dbt and Dagster done, the Observable site remains.
- **`.docs/`**: cross-cutting docs. Each piece keeps its own `.docs_<piece>/` folder.

## Standards (every piece, every request)

**CLAUDE.md files** hold only what an agent needs on each request: these standards plus the piece's stack. Specific files, layout, and functions stay in the code, discoverable by grep.

**Documentation**
- A piece's docs live in its `.docs_<piece>/` folder; cross-cutting docs live in root `.docs/`. A piece's docs cover only that piece and its contracts with others, never another piece's internal design.
- `references/` subfolders are for agents only, organized for model digestion. Every other doc is human-readable.
- No document (README, CLAUDE.md, plan, reference) exceeds 700 words. Ever.
- A piece's docs update in the same commit that changes its behavior or contract.

**Code**
- Code files stay under 300 lines. Ever.
- Comments stay under 12 words.
- Every exported function or object used outside its file carries a javadoc-style comment where the language allows.
- Full descriptive names; the only short forms are `id`, `url`, `api`.
- Pieces integrate through defined contracts such as the HTTP API.

**Plans and stages**
- Each plan file breaks into 4 to 7 stages. An agent implements exactly one stage per pass, after any needed clarifications, and never more than one.
- A stage is done only when the build passes, tests pass, and the plan file marks it complete.

**Config**
- Secrets live in each piece's `.env`, never committed. A tracked `.env.sample` lists the keys with empty values.
- Local `.env` and `.tfvars` files hold live secrets by design and are gitignored, not tracked. Do not flag them.

**Git**
- Agents may stage, commit; commit subjects stay under 12 words.
- Agents never push or merge.

**System**
- Windows/Linux only. Bash, `python`, `wc -w` for word counts.
- Soft-wrap prose. No em-dashes. Prefer non-Microsoft tooling.

## Workflow
Claude runs commands and code. Sander drives and reviews.
