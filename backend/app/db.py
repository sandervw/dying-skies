"""Postgres connection pool built from DATABASE_URL."""
import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import asyncpg


@asynccontextmanager
async def open_pool() -> AsyncIterator[asyncpg.Pool]:
    """Open the pool with schema and roles ready; close it on exit."""
    async with asyncpg.create_pool(os.environ["DATABASE_URL"]) as pool:
        await ensure_schema(pool)
        await ensure_analytics_role(pool)
        await ensure_dagster_role(pool)
        await ensure_admin_role(pool)
        yield pool


# Moves pre-split login links into logins; a no-op once applied.
_MOVE_LOGINS_OUT_OF_SESSIONS = """
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sessions'
      AND column_name = 'user_id'
  ) THEN
    INSERT INTO logins (session_id, user_id, logged_in_at)
      SELECT session_id, user_id, created_at FROM sessions
      WHERE user_id IS NOT NULL
      ON CONFLICT (session_id) DO NOTHING;
    -- CASCADE drops analytics views on the column; dbt rebuilds them.
    ALTER TABLE sessions DROP COLUMN user_id CASCADE;
  END IF;
END $$
"""


# Folds destroyed_stars into saved_stars; a no-op once applied.
_MERGE_DESTROYED_INTO_SAVED = """
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'destroyed_stars'
  ) THEN
    ALTER TABLE saved_stars ADD COLUMN IF NOT EXISTS destroyed_at TIMESTAMPTZ;
    -- Stars destroyed before the merge lost their save time.
    ALTER TABLE saved_stars ALTER COLUMN saved_at DROP NOT NULL;
    INSERT INTO saved_stars (seed, owner_id, saved_at, destroyed_at)
      SELECT seed, owner_id, NULL, destroyed_at FROM destroyed_stars
      ON CONFLICT (seed) DO UPDATE SET destroyed_at = EXCLUDED.destroyed_at;
    -- CASCADE drops analytics views on the table; dbt rebuilds them.
    DROP TABLE destroyed_stars CASCADE;
  END IF;
END $$
"""


async def ensure_schema(pool: asyncpg.Pool) -> None:
    """Create the full schema if tables do not already exist."""
    await pool.execute(
        "CREATE TABLE IF NOT EXISTS users ("
        "id UUID PRIMARY KEY, "
        "username TEXT UNIQUE NOT NULL "
        "CHECK (char_length(username) BETWEEN 3 AND 64), "
        "password_hash TEXT NOT NULL, "
        "created_at TIMESTAMPTZ NOT NULL DEFAULT now())"
    )
    # Sessions are never deleted; their Issuance counts sum to all-time Issued.
    await pool.execute(
        "CREATE TABLE IF NOT EXISTS sessions ("
        "session_id TEXT PRIMARY KEY, "
        "counter BIGINT NOT NULL DEFAULT 0, "
        "created_at TIMESTAMPTZ NOT NULL DEFAULT now())"
    )
    await pool.execute(
        "CREATE TABLE IF NOT EXISTS logins ("
        "session_id TEXT PRIMARY KEY REFERENCES sessions(session_id), "
        "user_id UUID NOT NULL REFERENCES users(id), "
        "logged_in_at TIMESTAMPTZ NOT NULL DEFAULT now())"
    )
    await pool.execute(_MOVE_LOGINS_OUT_OF_SESSIONS)
    # Every Star ever Saved; destroyed_at stays NULL while it is Saved.
    await pool.execute(
        "CREATE TABLE IF NOT EXISTS saved_stars ("
        "seed BYTEA PRIMARY KEY, "
        "owner_id UUID REFERENCES users(id), "
        "saved_at TIMESTAMPTZ DEFAULT now(), "
        "destroyed_at TIMESTAMPTZ)"
    )
    await pool.execute(_MERGE_DESTROYED_INTO_SAVED)


_ENSURE_ANALYTICS_ROLE = """
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'analytics_reader') THEN
    EXECUTE format(
      'CREATE ROLE analytics_reader LOGIN PASSWORD %L',
      current_setting('analytics.reader_password'));
  ELSE
    EXECUTE format(
      'ALTER ROLE analytics_reader WITH PASSWORD %L',
      current_setting('analytics.reader_password'));
  END IF;
END $$
"""


async def ensure_analytics_role(pool: asyncpg.Pool) -> None:
    """Create analytics_reader, its grants, and its marts schema."""
    password = os.environ.get("ANALYTICS_DB_PASSWORD")
    if not password:
        return
    async with pool.acquire() as connection:
        async with connection.transaction():
            # Pass password via a session setting; role DDL cannot bind params.
            await connection.execute(
                "SELECT set_config('analytics.reader_password', $1, true)", password
            )
            await connection.execute(_ENSURE_ANALYTICS_ROLE)
            # Membership lets us reassign schema ownership.
            await connection.execute("GRANT analytics_reader TO CURRENT_USER")
            await connection.execute(
                "GRANT CONNECT ON DATABASE dying_skies TO analytics_reader"
            )
            await connection.execute("GRANT USAGE ON SCHEMA public TO analytics_reader")
            await connection.execute("GRANT SELECT ON saved_stars TO analytics_reader")
            # Never expose session_id; grant only counter and created_at.
            await connection.execute("REVOKE ALL ON sessions FROM analytics_reader")
            await connection.execute(
                "GRANT SELECT (counter, created_at) ON sessions TO analytics_reader"
            )
            # Never expose password_hash; grant only safe user columns.
            await connection.execute("REVOKE ALL ON users FROM analytics_reader")
            await connection.execute(
                "GRANT SELECT (id, username, created_at) ON users TO analytics_reader"
            )
            await connection.execute("CREATE SCHEMA IF NOT EXISTS analytics")
            await connection.execute(
                "ALTER SCHEMA analytics OWNER TO analytics_reader"
            )


_ENSURE_DAGSTER_ROLE = """
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'dagster') THEN
    EXECUTE format(
      'CREATE ROLE dagster LOGIN PASSWORD %L',
      current_setting('dagster.password'));
  ELSE
    EXECUTE format(
      'ALTER ROLE dagster WITH PASSWORD %L',
      current_setting('dagster.password'));
  END IF;
END $$
"""


# Moves Dagster's tables from public into its schema; a no-op once applied.
_MOVE_DAGSTER_OUT_OF_PUBLIC = """
DO $$
DECLARE
  dagster_table TEXT;
BEGIN
  -- Only Dagster keeps an alembic_version table.
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'alembic_version'
  ) THEN
    FOR dagster_table IN
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename NOT IN ('users', 'sessions', 'logins', 'saved_stars')
    LOOP
      -- Owned sequences and indexes move with the table.
      EXECUTE format('ALTER TABLE public.%I SET SCHEMA dagster', dagster_table);
      EXECUTE format('ALTER TABLE dagster.%I OWNER TO dagster', dagster_table);
    END LOOP;
  END IF;
END $$
"""


async def ensure_dagster_role(pool: asyncpg.Pool) -> None:
    """Create the dagster role and schema; move its tables there."""
    password = os.environ.get("DAGSTER_DB_PASSWORD")
    if not password:
        return
    async with pool.acquire() as connection:
        async with connection.transaction():
            # Pass password via a session setting; role DDL cannot bind params.
            await connection.execute(
                "SELECT set_config('dagster.password', $1, true)", password
            )
            await connection.execute(_ENSURE_DAGSTER_ROLE)
            # Membership lets us reassign ownership to dagster.
            await connection.execute("GRANT dagster TO CURRENT_USER")
            await connection.execute("GRANT CONNECT ON DATABASE dying_skies TO dagster")
            await connection.execute("CREATE SCHEMA IF NOT EXISTS dagster")
            await connection.execute("ALTER SCHEMA dagster OWNER TO dagster")
            # Dagster names its tables without a schema.
            await connection.execute("ALTER ROLE dagster SET search_path = dagster")
            await connection.execute(_MOVE_DAGSTER_OUT_OF_PUBLIC)


_ENSURE_ADMIN_ROLE = """
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'skies_admin') THEN
    EXECUTE format(
      'CREATE ROLE skies_admin LOGIN PASSWORD %L',
      current_setting('admin.password'));
  ELSE
    EXECUTE format(
      'ALTER ROLE skies_admin WITH PASSWORD %L',
      current_setting('admin.password'));
  END IF;
  -- Membership grants write on the analytics_reader-owned schema.
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'analytics_reader') THEN
    GRANT analytics_reader TO skies_admin;
  END IF;
END $$
"""


_ENSURE_DAGSTER_WRITE = """
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'dagster') THEN
    GRANT USAGE, CREATE ON SCHEMA dagster TO skies_admin;
    GRANT ALL ON ALL TABLES IN SCHEMA dagster TO skies_admin;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA dagster TO skies_admin;
    -- Cover the tables Dagster creates later.
    ALTER DEFAULT PRIVILEGES FOR ROLE dagster IN SCHEMA dagster
      GRANT ALL ON TABLES TO skies_admin;
    ALTER DEFAULT PRIVILEGES FOR ROLE dagster IN SCHEMA dagster
      GRANT ALL ON SEQUENCES TO skies_admin;
  END IF;
END $$
"""


async def ensure_admin_role(pool: asyncpg.Pool) -> None:
    """Create skies_admin, a read/write login across app, analytics, dagster."""
    password = os.environ.get("ADMIN_DB_PASSWORD")
    if not password:
        return
    async with pool.acquire() as connection:
        async with connection.transaction():
            # Pass password via a session setting; role DDL cannot bind params.
            await connection.execute(
                "SELECT set_config('admin.password', $1, true)", password
            )
            await connection.execute(_ENSURE_ADMIN_ROLE)
            await connection.execute(
                "GRANT CONNECT ON DATABASE dying_skies TO skies_admin"
            )
            await connection.execute(
                "GRANT USAGE, CREATE ON SCHEMA public TO skies_admin"
            )
            await connection.execute(
                "GRANT ALL ON ALL TABLES IN SCHEMA public TO skies_admin"
            )
            await connection.execute(
                "GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO skies_admin"
            )
            # Cover tables the app creates later.
            await connection.execute(
                "ALTER DEFAULT PRIVILEGES IN SCHEMA public "
                "GRANT ALL ON TABLES TO skies_admin"
            )
            await connection.execute(
                "ALTER DEFAULT PRIVILEGES IN SCHEMA public "
                "GRANT ALL ON SEQUENCES TO skies_admin"
            )
            await connection.execute(_ENSURE_DAGSTER_WRITE)
