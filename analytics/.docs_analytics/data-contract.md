# Data contract: backend Postgres

Analytics reads the backend's Postgres tables directly as dbt sources. This note tracks what access exists and what is pending from backend.

## Confirmed against `backend/app/db.py`

- `saved_stars.saved_at` is `TIMESTAMPTZ NOT NULL DEFAULT now()`. This drives historical save trends.
- `saved_stars.seed` is the primary key, `BYTEA`.
- `sessions` has `session_id` (`TEXT` primary key) and `counter` (`BIGINT NOT NULL DEFAULT 0`), a mutable running total.
- `users` has `id` (`UUID` primary key), `username` (`TEXT UNIQUE NOT NULL`), `password_hash` (`TEXT NOT NULL`), and `created_at` (`TIMESTAMPTZ NOT NULL DEFAULT now()`). `password_hash` exists but is excluded from every staging model; it never leaves the backend.

## Access granted

`analytics/sql/grants.sql` defines a read-only role, `analytics_reader`, with `SELECT` only, scoped to exactly three tables:

- `sessions`
- `saved_stars`
- `users`

No write access anywhere. No access to any other table.

## Access pending

Blocks the corresponding Stage 2 source until backend delivers it:

- A timestamped counters table (destroyed/dead events): does not exist yet.

Must be added to `grants.sql` once delivered.

## Provisioning

The backend provisions the role on startup: `ensure_analytics_role` in `backend/app/db.py` runs the same grants, reading the reader password from `ANALYTICS_READER_PASSWORD`. Sander sets that env var in the backend `.env` (local) or Terraform (deploy); no manual SQL run. `grants.sql` stays the source-of-truth contract the backend implements.
