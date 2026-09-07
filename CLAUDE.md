# Dying Skies

Procedurally-generated "skies" as falling stars on a black field. Click a falling star to save it and open its sky. Full concept: `.docs/outline.md`.

**Repo layout**
- `frontend/`: Vite + React, Canvas 2D visual layer. Done; deployed on Cloudflare.
- `backend/`: FastAPI + Postgres API. Done; live on an OVH VPS.
- `analytics/`: Dagster + dbt + Observable Framework pipeline. Done; live at dyingskies.com/analytics.
- `infra/`: OpenTofu provisioning the OVH VPS that runs the backend and analytics.
- `.docs/`: cross-cutting docs. Each piece keeps its own `.docs_<piece>/` folder.

**Conventions**
- Code files stay under 300 lines. Exceptions by user approval only.
- Comments stay under 12 words.
- Every exported function or object used outside its file carries a javadoc-style comment where the language allows.
- Full descriptive names; the only short forms are `id`, `url`, `api`.
- **NEVER, EVER, EVER, EVER, EVER ADD FEATURES, FUNCTIONS, METHODS, OR FILES, WITHOUT EXPLICIT PERMISSION**

**Config**
- Secrets live in each piece's `.env`, never committed. A tracked `.env.sample` lists the keys with empty values.
- Local `.env` and `.tfvars` files hold live secrets by design and are gitignored, not tracked. Do not flag them.

**Git**
- Do not run GIT commands without asking. This includes history commands.

**System**
- Windows/Linux only. Bash, `python`, `wc -w` for word counts.
- Soft-wrap prose. No em-dashes. Prefer non-Microsoft tooling.
