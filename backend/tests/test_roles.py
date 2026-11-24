"""Tests for the Postgres roles the backend provisions on startup."""
import asyncio
import os

import asyncpg
from fastapi.testclient import TestClient

from app.main import app

# Stand-ins for the Dagster tables that predate its role, left in public.
_FAKE_DAGSTER_TABLES = (
    "CREATE SCHEMA IF NOT EXISTS dagster; "
    "DROP TABLE IF EXISTS dagster.alembic_version, dagster.runs; "
    "CREATE TABLE IF NOT EXISTS public.alembic_version (version_num TEXT); "
    "CREATE TABLE IF NOT EXISTS public.runs (id BIGSERIAL PRIMARY KEY)"
)

_ROLE_FACTS = (
    "SELECT "
    "has_column_privilege('analytics_reader', 'sessions', 'session_id', 'SELECT') "
    "AS reads_session_id, "
    "has_column_privilege('analytics_reader', 'sessions', 'counter', 'SELECT') "
    "AS reads_issuance, "
    "(SELECT tableowner FROM pg_tables "
    "WHERE schemaname = 'dagster' AND tablename = 'runs') AS runs_owner, "
    "to_regclass('public.runs') AS runs_left_in_public"
)


async def _execute(statements: str) -> None:
    """Run one or more statements on a fresh connection."""
    connection = await asyncpg.connect(os.environ["DATABASE_URL"])
    try:
        await connection.execute(statements)
    finally:
        await connection.close()


async def _role_facts() -> asyncpg.Record:
    """Read the grants and table owners this test checks."""
    connection = await asyncpg.connect(os.environ["DATABASE_URL"])
    try:
        return await connection.fetchrow(_ROLE_FACTS)
    finally:
        await connection.close()


def test_startup_hides_session_ids_and_gives_dagster_its_tables(monkeypatch):
    """Analytics cannot read session_id; Dagster's tables move to its schema."""
    for key in ("ANALYTICS_DB_PASSWORD", "DAGSTER_DB_PASSWORD"):
        monkeypatch.setenv(key, os.environ.get(key) or "test-only")
    asyncio.run(_execute(_FAKE_DAGSTER_TABLES))

    with TestClient(app):
        facts = asyncio.run(_role_facts())

    assert not facts["reads_session_id"]
    assert facts["reads_issuance"]
    assert facts["runs_owner"] == "dagster"
    assert facts["runs_left_in_public"] is None
