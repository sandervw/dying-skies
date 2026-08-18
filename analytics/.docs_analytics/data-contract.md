# Data contract: backend Postgres

Analytics reads the backend's Postgres tables directly as dbt sources.
This note tracks what access exists and what is pending from backend.

## Confirmed against `backend/app/db.py`

- `saved_stars.saved_at` is `TIMESTAMPTZ NOT NULL DEFAULT now()`. This
  drives historical save trends.
- `saved_stars.seed` is the primary key, `BYTEA`.
- `sessions` has `session_id` (`TEXT` primary key) and `counter`
  (`BIGINT NOT NULL DEFAULT 0`), a mutable running total.

## Access granted

`analytics/sql/grants.sql` creates a read-only role, `analytics_reader`,
with `SELECT` only, scoped to exactly two tables:

- `sessions`
- `saved_stars`

No write access anywhere. No access to any other table. The script
has not been executed yet; see "Execution pending" below.

## Access pending

Blocks the corresponding Stage 2 sources until backend delivers these:

- `users`: does not exist in the backend schema yet. Lands with
  backend auth (Phase 3).
- A timestamped counters table (destroyed/dead events): does not
  exist yet.

Both must be added to `grants.sql` once delivered.

## Execution pending

Analytics cannot run `grants.sql` itself; it needs backend database
credentials that Sander controls. The script is written and reviewed
for SQL syntax. Sander must run it against the live backend Postgres
instance before `analytics_reader` exists. Stage 2 dbt source
declarations depend on this role existing and being connectable.
