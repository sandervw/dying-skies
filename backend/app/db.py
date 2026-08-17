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
    """Create required tables if they do not already exist."""
    await pool.execute(
        "CREATE TABLE IF NOT EXISTS sessions ("
        "session_id TEXT PRIMARY KEY, "
        "counter BIGINT NOT NULL DEFAULT 0)"
    )
    await pool.execute(
        "CREATE TABLE IF NOT EXISTS saved_stars ("
        "seed BYTEA PRIMARY KEY, "
        "saved_at TIMESTAMPTZ NOT NULL DEFAULT now())"
    )
