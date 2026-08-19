# Backend Auth Plan (Phase 3)

FastAPI + Postgres. Concept and decisions: `../../.docs/plan.md` Phase 3. Custom email/password auth. One stage per pass.

## Rules
- Global first-saver: `saved_stars` stays one row per seed; `owner_id UUID` is the first and only saver, nullable for pre-auth legacy rows.
- Saving requires login. Seed issuance and viewing stay anonymous.
- No `session_id` is stored on save.

## Stage 1: Accounts and sessions - DONE
- `users` table: `id UUID`, `username` (unique), `password_hash`, `created_at TIMESTAMPTZ`.
- Endpoints: `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`.
- Login keys on `username`. No email, no recovery: a forgotten login is gone for good, by design.
- Signup body is `{username, password, riddle_id}`; `me`/`signup`/`login` return `{id, username}`.
- Authenticated session upgrades the anonymous session cookie to carry the user; cookie stays httpOnly.
- Passwords hashed with argon2id.

### Password rules (custom, deliberately absurd)
- A password must contain: a creative color, a zodiac sign, the answer to an assigned riddle, a favorite year (any digits), and a special character.
- Word lists (`app/data/*.json`: colors, zodiac, riddles) live server-side only and never ship to the client.
- `GET /auth/signup-riddle` assigns a riddle `{riddle_id, text}`; the answer stays server-side.
- `POST /auth/password/check` (`{password, riddle_id}`) returns `{rules: {color, zodiac, riddle, year, special}}` booleans only, for the live checklist.
- `POST /auth/signup` re-runs the same checks; failure returns `422 {error, code: "weak_password", rules}`.
- Matching is present-anywhere, case-insensitive; not bulletproof by design.

## Stage 2: Login-gated saves and ownership - DONE
- `saved_stars.owner_id` already exists in the base schema, nullable.
- `POST /stars/save` requires an authenticated session and sets `owner_id` to the caller; anonymous callers get the `{error, code}` envelope.
- `GET /stars/mine` returns the caller's saved seeds, newest first.
