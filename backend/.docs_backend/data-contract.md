# Data contract: backend Postgres

Analytics reads the backend's Postgres tables directly as dbt sources. `backend/app/db.py` is the source of truth for the schema and the access grant.

## Source tables and columns

- `saved_stars`: one row per Star ever Saved. `seed` (`BYTEA` primary key), `owner_id`, `saved_at` (`TIMESTAMPTZ`; NULL only on some Destroyed Stars), `destroyed_at` (`TIMESTAMPTZ`; NULL while the Star is still Saved).
- `sessions`: `session_id` (`TEXT` primary key), `counter` (`BIGINT NOT NULL DEFAULT 0`, the session's issuance count), `created_at`. Rows are never deleted. `SUM(counter)` is every Star ever Issued.
- `users`: `id` (`UUID` primary key), `username` (`TEXT UNIQUE NOT NULL`), `created_at` (`TIMESTAMPTZ NOT NULL DEFAULT now()`). `password_hash` is not granted and no model names it.

## Access

The backend defines a read-only role, `analytics_reader`, granted `SELECT` only, on exactly:

- `sessions`
- `saved_stars`
- `users` columns `id`, `username`, `created_at`

The backend also creates an `analytics` schema, where dbt materializes staging views and marts. dbt connects as `analytics_reader` and builds into that schema.

## Counts

Saved counts `saved_stars` rows with `destroyed_at` NULL; Destroyed counts rows with `destroyed_at` set. Dead is a computed total: Issued minus Saved minus Destroyed.
