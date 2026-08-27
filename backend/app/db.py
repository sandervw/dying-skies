"""Postgres connection pool built from DATABASE_URL."""
import os

import asyncpg

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    """Return the shared asyncpg pool, creating it on first call."""
    global _pool
    if _pool is None:
        database_url = os.environ["DATABASE_URL"]
        _pool = await asyncpg.create_pool(database_url)
    return _pool


async def close_pool() -> None:
    """Close the shared asyncpg pool if it is open."""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


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
    await pool.execute(
        "CREATE TABLE IF NOT EXISTS sessions ("
        "session_id TEXT PRIMARY KEY, "
        "counter BIGINT NOT NULL DEFAULT 0, "
        "user_id UUID REFERENCES users(id), "
        "created_at TIMESTAMPTZ NOT NULL DEFAULT now())"
    )
    await pool.execute(
        "CREATE TABLE IF NOT EXISTS saved_stars ("
        "seed BYTEA PRIMARY KEY, "
        "owner_id UUID REFERENCES users(id), "
        "saved_at TIMESTAMPTZ NOT NULL DEFAULT now())"
    )
    await pool.execute(
        "CREATE TABLE IF NOT EXISTS destroyed_stars ("
        "seed BYTEA PRIMARY KEY, "
        "owner_id UUID REFERENCES users(id), "
        "destroyed_at TIMESTAMPTZ NOT NULL DEFAULT now())"
    )


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
    password = os.environ.get("ANALYTICS_READER_PASSWORD")
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
            await connection.execute(
                "GRANT SELECT ON sessions, saved_stars, destroyed_stars TO analytics_reader"
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
