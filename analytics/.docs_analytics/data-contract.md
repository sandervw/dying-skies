# Data contract: backend Postgres

Analytics reads the backend's Postgres tables directly as dbt sources. `backend/app/db.py` is the source of truth for the schema and the access grant.

## Source tables and columns

- `saved_stars`: `seed` (`BYTEA` primary key), `owner_id`, `saved_at` (`TIMESTAMPTZ NOT NULL DEFAULT now()`). `saved_at` drives historical save trends.
- `destroyed_stars`: `seed` (`BYTEA` primary key), `owner_id`, `destroyed_at` (`TIMESTAMPTZ NOT NULL DEFAULT now()`). `destroyed_at` drives historical destroy trends.
- `sessions`: `session_id` (`TEXT` primary key), `counter` (`BIGINT NOT NULL DEFAULT 0`, a mutable running total), `user_id`.
- `users`: `id` (`UUID` primary key), `username` (`TEXT UNIQUE NOT NULL`), `password_hash` (`TEXT NOT NULL`), `created_at` (`TIMESTAMPTZ NOT NULL DEFAULT now()`). `password_hash` is excluded from every staging model and never leaves the backend.

## Access

The backend defines a read-only role, `analytics_reader`, granted `SELECT` only, scoped to exactly four tables:

- `sessions`
- `saved_stars`
- `users`
- `destroyed_stars`

It also creates an `analytics` schema, where dbt materializes staging views and marts. dbt connects as `analytics_reader` and builds into that schema. The role has no write access and no access to any other table.

Dead is a computed total (issued minus saved minus destroyed).
