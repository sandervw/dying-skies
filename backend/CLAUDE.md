# CLAUDE.md: Dying Skies / backend

FastAPI + Postgres API. Root `CLAUDE.md` holds shared standards and system conventions; this file adds only backend specifics.

## Stack
- Python, FastAPI, uvicorn. Postgres via asyncpg. argon2id password hashing, slowapi rate limiting.
- Issues HMAC-derived stars, verifies saves, tracks the save/destroy lifecycle, and exposes lifecycle stats and auth.

## Layout
- `app/main.py`: app entrypoint, lifespan, CORS, router wiring.
- `app/routes/`: `stars.py`, `auth.py`, `stats.py`, `health.py`.
- `app/`: domain modules `security.py`, `session.py`, `db.py`, `encoding.py`, `password_rules.py`, `rate_limit.py`, `errors.py`.
- `tests/`: pytest suites with `conftest.py` env defaults.
- Exception to one-export-per-file: small domain modules may group tightly-related functions.

## Commands
- Install: `pip install -r requirements.txt`
- Run local: `uvicorn app.main:app --reload`
- Test: `pytest`
- Config: copy `.env.sample` to `.env` and fill values; keys documented there.

## Contracts
- Exposes the HTTP API in `.docs_backend/api-contract.md`; the frontend integrates against it.
- Provisions the read-only `analytics_reader` Postgres role the analytics piece reads.
- Runs on the OVH VPS provisioned in `infra/`.

## Prose
Soft-wrap paragraphs and list items (one physical line each). No em-dashes.
