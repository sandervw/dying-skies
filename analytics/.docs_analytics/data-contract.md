# Data contract: backend Postgres

Analytics reads the backend's Postgres tables directly as dbt sources. This note tracks what access exists and what is pending from backend.

## Confirmed against `backend/app/db.py`

- `saved_stars.saved_at` is `TIMESTAMPTZ NOT NULL DEFAULT now()`. This drives historical save trends.
- `saved_stars.seed` is the primary key, `BYTEA`.
- `sessions` has `session_id` (`TEXT` primary key) and `counter` (`BIGINT NOT NULL DEFAULT 0`), a mutable running total.
- `users` has `id` (`UUID` primary key), `username` (`TEXT UNIQUE NOT NULL`), `password_hash` (`TEXT NOT NULL`), and `created_at` (`TIMESTAMPTZ NOT NULL DEFAULT now()`). `password_hash` exists but is excluded from every staging model; it never leaves the backend.
- `destroyed_stars.destroyed_at` is `TIMESTAMPTZ NOT NULL DEFAULT now()`. This drives historical destroy trends.
- `destroyed_stars.seed` is the primary key, `BYTEA`.

## Access granted

The backend's `ensure_analytics_role` defines a read-only role, `analytics_reader`, with `SELECT` only, scoped to exactly four tables:

- `sessions`
- `saved_stars`
- `users`
- `destroyed_stars`

It also creates an `analytics` schema owned by `analytics_reader`, where dbt materializes marts. dbt connects as `analytics_reader` and builds into that schema.

No write access anywhere else. No access to any other table.

## Access pending

None. A death event table does not exist; dead stays a computed total, not a trend.

## Provisioning

The backend provisions the role on startup: `ensure_analytics_role` in `backend/app/db.py` is the source-of-truth contract, reading the reader password from `ANALYTICS_READER_PASSWORD`. Sander sets that env var in the backend `.env` (local) or Terraform (deploy); no manual SQL run.
