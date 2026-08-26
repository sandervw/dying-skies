# Backend Outline

FastAPI + Postgres. Live on GCP Cloud Run + Cloud SQL. Full endpoint spec: `api-contract.md`.

## Implementation
- Star issuance: `POST /stars/batch` reserves a counter range for the session, derives each seed as `HMAC(secret, session_id || counter)` and a tag as `HMAC(secret, seed)`, returns base64url pairs (`stars.py`, `security.py`, `session.py`).
- Save verification: `POST /stars/save` recomputes the tag with a constant-time compare, rejects already-destroyed seeds, and inserts once per seed owned by the caller.
- Destroy and list: `POST /stars/destroy` deletes an owned save and records it destroyed in one transaction; `GET /stars/mine` returns the caller's saved seeds, newest first.
- Auth: anonymous httponly `session_id` cookie carries identity; `/auth` signup/login/logout/me hash passwords with argon2id, use a dummy-verify timing guard, and cap a user at 4 linked sessions (oldest evicted).
- Signup gate: the password must contain a color, a zodiac sign, a riddle answer, a digit, and a special char; word lists stay server-side and `/auth/password/check` returns only per-rule booleans (`password_rules.py`).
- Stats: `GET /stats` returns saved, destroyed, and `died = issued - saved - destroyed`, where issued is the sum of session counters.
- Storage: shared asyncpg pool; the `users`, `sessions`, `saved_stars`, `destroyed_stars` schema is auto-created on startup (`db.py`).
- Rate limiting: slowapi keyed by the real client address, `X-Forwarded-For` honored only for `TRUSTED_PROXY_HOPS` (`rate_limit.py`).
- Analytics access: startup provisions a read-only `analytics_reader` role with column-scoped grants (never `password_hash`) and an owned `analytics` schema.
- CORS is locked to the single `FRONTEND_ORIGIN` with credentials; `GET /health` for uptime checks.

## Out of scope
Sky rendering from a seed (frontend); the metrics pipeline that reads the analytics role (analytics).

## Seeds
- A seed is a 32-byte (256-bit) HMAC of the session id and a per-session counter. Issuance is deterministic; the space makes collisions effectively impossible.
- The tag is a second HMAC over the seed; the server accepts a save only if the tag verifies.

## Sessions and auth
- The session cookie holds both anonymous identity and the issuance counter; login links a user row to it. No bearer token.
- A user keeps at most 4 sessions; a fifth login evicts the oldest device.

## Deployment
- GCP Cloud Run (API) + Cloud SQL Postgres, provisioned via OpenTofu. Secrets live in the environment: `SEED_HMAC_SECRET`, `DATABASE_URL`, `FRONTEND_ORIGIN`, `ANALYTICS_READER_PASSWORD`.
