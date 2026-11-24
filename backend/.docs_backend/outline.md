# Backend Outline

FastAPI + Postgres API. Live on an OVH VPS (see `infra/`). Full endpoint spec: `api-contract.md`.

## Star lifecycle
- Issuance: `POST /stars/batch` raises the session's Issuance count by the batch size, derives one seed per count it passed as `HMAC(secret, session_id || Issuance count)` and a tag as `HMAC(secret, seed)`, and returns base64url `{seed, tag}` pairs (`stars.py`, `security.py`, `session.py`).
- Save: `POST /stars/save` recomputes the tag with a constant-time compare and inserts once per seed, owned by the caller. A conflicting seed answers `already_destroyed` or `already_saved`.
- Destroy: `POST /stars/destroy` sets `destroyed_at` on one of the caller's saves that is not yet destroyed.
- List: `GET /stars/mine` returns the caller's saved, not destroyed seeds, newest first.

## Seeds and tags
- A seed is a 32-byte (256-bit) HMAC of the session id and an Issuance count. Issuance is deterministic.
- The tag is a second HMAC over the seed. The server accepts a save only if the tag verifies.
- Both are encoded as unpadded base64url on the wire.

## Sessions and auth
- An anonymous httponly `session_id` cookie names a session, which holds the Issuance count and is never deleted. An unknown `session_id` cookie gets a new session (`session.py`).
- A login links a user to one session in the `logins` table; logout deletes it (`login.py`).
- Signup and login create a new session with a fresh one-year cookie, delete any login on the old cookie's session, and log in on the new one. Old sessions stay; a star issued before login can be saved after.
- `/auth` signup/login/logout/me hash passwords with argon2id and use a dummy-verify timing guard on unknown users.
- A user keeps at most 4 logins; a fifth evicts the oldest.

## Password gate
- Signup requires a password containing a color, a zodiac sign, the assigned riddle's answer, a digit, and a special character.
- Word lists stay server-side; `/auth/password/check` returns only per-rule booleans (`password_rules.py`).

## Stats
- `GET /stats` returns `saved` (rows with no `destroyed_at`), `destroyed` (rows with one), and `died = issued - saved - destroyed`, where issued is the sum of the sessions' Issuance counts.

## Storage
- Shared asyncpg pool. The `users`, `sessions`, `logins`, `saved_stars` schema is created on startup (`db.py`), with idempotent migrations.
- `saved_stars` holds every Sky ever Saved. `destroyed_at` is NULL while Saved; `saved_at` is NULL only on some Destroyed Skies.
- Startup also provisions every other role, schema, and grant. With `ANALYTICS_DB_PASSWORD` set: the read-only `analytics_reader` role with the column grants in `data-contract.md`, and its `analytics` schema. With `DAGSTER_DB_PASSWORD` set: the `dagster` role, which owns only the `dagster` schema. With `ADMIN_DB_PASSWORD` set: the read/write `skies_admin` login. Analytics and Dagster log in with the same variables.

## Rate limiting
- slowapi keyed by the real client address; `X-Forwarded-For` is honored only for `TRUSTED_PROXY_HOPS` (`rate_limit.py`).
- Limited routes create their session in the route body, after the limit check. A 429 carries `Retry-After` and creates no session.

## CORS and health
- CORS is locked to the single `FRONTEND_ORIGIN` with credentials. `GET /health` serves uptime checks.

## Deployment
- Runs as the `skies-api` systemd service against local Postgres, provisioned in `infra/`. Secrets in `/etc/skies/.env`: `SEED_HMAC_SECRET`, `DATABASE_URL`, `FRONTEND_ORIGIN`, `ANALYTICS_DB_PASSWORD`, `DAGSTER_DB_PASSWORD`, `ADMIN_DB_PASSWORD`.
- Public at `api.dyingskies.com` through a Cloudflare Tunnel; the Dagster UI shares it, gated with Cloudflare Access.
