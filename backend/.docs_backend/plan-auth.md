# Backend Auth Plan (Phase 3)

FastAPI + Postgres. Concept and decisions: `../../.docs/plan.md` Phase 3. Custom email/password auth. One stage per pass.

## Rules
- Global first-saver: `saved_stars` stays one row per seed; `owner_id UUID` is the first and only saver, nullable for pre-auth legacy rows.
- Saving requires login. Seed issuance and viewing stay anonymous.
- No `session_id` is stored on save.

## Stage 1: Accounts and sessions - DONE
- `users` table: `id UUID`, `email`, `password_hash`, `created_at TIMESTAMPTZ`.
- Endpoints: `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`.
- Authenticated session upgrades the anonymous session cookie to carry the user; cookie stays httpOnly.
- Passwords hashed with argon2id.

## Stage 2: Login-gated saves and ownership - TODO
- `saved_stars.owner_id` already exists in the base schema, nullable.
- `POST /stars/save` requires an authenticated session and sets `owner_id` to the caller; anonymous callers get the `{error, code}` envelope.
- `GET /stars/mine` returns the caller's saved seeds, newest first.
