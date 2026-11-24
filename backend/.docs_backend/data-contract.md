# Data contract: backend Postgres

Analytics reads the backend's Postgres tables directly as dbt sources. `backend/app/db.py` is the source of truth for the schema and the access grant.

## Source tables and columns

- `saved_stars`: one row per Sky ever Saved. `seed` (`BYTEA` primary key), `owner_id`, `saved_at` (`TIMESTAMPTZ`; NULL only on some Destroyed Skies), `destroyed_at` (`TIMESTAMPTZ`; NULL while the Sky is still Saved).
- `sessions`: `counter` (`BIGINT NOT NULL DEFAULT 0`, the Session's Issuance count), `created_at`. Rows are never deleted. `SUM(counter)` is every Star ever Issued. `session_id` is not granted.
- `users`: `id` (`UUID` primary key), `username` (`TEXT UNIQUE NOT NULL`), `created_at` (`TIMESTAMPTZ NOT NULL DEFAULT now()`). `password_hash` is not granted and no model names it.

## Access

The backend defines a read-only role, `analytics_reader`, granted `SELECT` only, on exactly:

- `sessions` columns `counter`, `created_at`
- `saved_stars`
- `users` columns `id`, `username`, `created_at`

The backend also creates an `analytics` schema, where dbt materializes staging views and marts. dbt connects as `analytics_reader` and builds into that schema.

## Dagster storage

The backend creates the `dagster` login role, which owns the `dagster` schema and has no rights on the backend's tables. Dagster logs in as `dagster` and keeps its storage tables in that schema. Its password is `DAGSTER_DB_PASSWORD`.

## Counts

Saved counts `saved_stars` rows with `destroyed_at` NULL; Destroyed counts rows with `destroyed_at` set. Died is a computed total: Issued minus Saved minus Destroyed.
