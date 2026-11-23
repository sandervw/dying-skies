---
name: handoff
description: Current state, next work, CEO preferences, and gotchas for Dying Skies. Use at the start of every session, and rewrite the State and Next sections before ending one.
---

# Handoff

Current state and next work. Rewrite when stale; never log history.

## State

- **Production** (`dyingskies.com`) runs `main`: falling from sky to sky, accounts, saving, the Gallery, destroying, the Counter, music, and the analytics site at `/analytics/`.
- **Hosting:** the frontend and the analytics site are Cloudflare Workers assets. The API, Postgres, and Dagster run on one OVH VPS, reached as `api.dyingskies.com` through a Cloudflare Tunnel.
- **Checks:** `main` requires the `checks` job. The black-box suite, one Playwright test per use case, runs locally with `npm run test:e2e` at desktop and phone widths; CI does not run it.
- **Schema changes** run as idempotent blocks in `backend/app/db.py` at API startup. A `CASCADE` drop removes analytics staging views; the next Dagster run rebuilds them.

## Next

1. #26: naming drift, Postgres ownership, and the `Retry-After` header.
2. Merge the Dependabot PRs.

## CEO preferences

- The look, the sound, and the account design are final. A seed keeps its art, instrument set, mode, and preset.
- Close issues rather than open new ones. One batch, one PR.
- Give the CEO a way to see what was built. New visual design: a mockup round of 2 to 3 variants first.
- As few tests as possible: no unit tests, backend tests for main functionality and edge cases, one Playwright test per use case.
- Explain music in plain words.
- Time-box agents to 15 to 30 minutes.
- Docs state the current design only; no decision logs or history.
- The user WILL NOT manage secrets, or the .env file. Do not ask or wait for them. Retrieve, read, and write all secrets and .env variables yourself.

## Gotchas

- `gh pr merge` is blocked by `.claude/hooks/require_reviews.py` until the review PASS comments name the head commit. Re-review after every push.
- The doc hook blocks until `doc-cutter` has seen every Markdown file changed on the branch.
- Agent, skill, and hook changes need a session restart. An unquoted `: ` in an agent `description` breaks loading.
- Every merge to `main` deploys each piece whose folder it touches, a piece's `CLAUDE.md` and docs included. Watch it with `gh run watch`.
- A change to a seeded generator changes every Saved Sky. Compare the production bundle or fixed-seed screenshots before and after.
- A behaviour-neutral frontend change leaves `frontend/dist/assets/*.js` byte-identical apart from changed property names.
- The backend tests need Postgres on `localhost:5432` (`docker compose up db` in `backend/`).
- `npm run test:e2e` needs Docker running; it starts the API and the frontend itself and leaves test accounts in the local Postgres.
- `tests/e2e/harness.ts` gives each test its own client address; import `test` from it.
- The frontend's `wrangler` comes from the root `node_modules` on the box, which no deploy reinstalls.
- Root TypeScript is pinned for the linter; `frontend/` carries its own newer TypeScript for the build.
- Start the frontend with `npm run dev`.
- A Save needs the Tag kept in memory since the Star was clicked; a reloaded Sky cannot be saved.
- In a PR body, write `Closes` before each issue number.
- Python's `write_text` on Windows writes CRLF; pass `newline="\n"` or use Edit.
- `.docs/personal-notes.md` is the CEO's own file.
