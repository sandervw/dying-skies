# Backend Outline

FastAPI + Postgres API. Live on an OVH VPS (see `infra/`). Full endpoint spec: `api-contract.md`.

## Star lifecycle
- Issuance: `POST /stars/batch` reserves a counter range for the session, derives each seed as `HMAC(secret, session_id || counter)` and a tag as `HMAC(secret, seed)`, and returns base64url `{seed, tag}` pairs (`stars.py`, `security.py`, `session.py`).
- Save: `POST /stars/save` recomputes the tag with a constant-time compare, rejects already-destroyed seeds, and inserts once per seed, owned by the caller.
- Destroy: `POST /stars/destroy` deletes an owned save and records it destroyed in one transaction.
- List: `GET /stars/mine` returns the caller's saved seeds, newest first.

## Seeds and tags
- A seed is a 32-byte (256-bit) HMAC of the session id and a per-session counter. Issuance is deterministic.
- The tag is a second HMAC over the seed. The server accepts a save only if the tag verifies.
- Both are encoded as unpadded base64url on the wire.

## Sessions and auth
- An anonymous httponly `session_id` cookie names a session, which holds the issuance counter and is never deleted. An unknown `session_id` cookie gets a new session (`session.py`).
- A login links a user to one session in the `logins` table; logout deletes it (`login.py`).
- `/auth` signup/login/logout/me hash passwords with argon2id and use a dummy-verify timing guard on unknown users.
- A user keeps at most 4 logins; a fifth evicts the oldest.

## Password gate
- Signup requires a password containing a color, a zodiac sign, the assigned riddle's answer, a digit, and a special character.
- Word lists stay server-side; `/auth/password/check` returns only per-rule booleans (`password_rules.py`).

## Stats
- `GET /stats` returns `saved`, `destroyed`, and `died = issued - saved - destroyed`, where issued is the sum of session counters.

## Storage
- Shared asyncpg pool. The `users`, `sessions`, `logins`, `saved_stars`, `destroyed_stars` schema is created on startup (`db.py`).
- Startup also provisions a read-only `analytics_reader` role with column-scoped grants and an owned `analytics` schema, when `ANALYTICS_READER_PASSWORD` is set.

## Rate limiting
- slowapi keyed by the real client address; `X-Forwarded-For` is honored only for `TRUSTED_PROXY_HOPS` (`rate_limit.py`).

## CORS and health
- CORS is locked to the single `FRONTEND_ORIGIN` with credentials. `GET /health` serves uptime checks.

## Deployment
- Runs as the `skies-api` systemd service against local Postgres, provisioned in `infra/`. Secrets in `/etc/skies/.env`: `SEED_HMAC_SECRET`, `DATABASE_URL`, `FRONTEND_ORIGIN`, `ANALYTICS_READER_PASSWORD`.
- Public at `api.dyingskies.com` through a Cloudflare Tunnel; the Dagster UI shares it, gated with Cloudflare Access.
