"""Sessions: anonymous browser identity and its permanent issuance count."""
import os
import secrets

import asyncpg
from fastapi import Request, Response

SESSION_COOKIE_NAME = "session_id"

_ONE_YEAR_SECONDS = 60 * 60 * 24 * 365


async def _known_session_id(pool: asyncpg.Pool, cookie: str | None) -> str | None:
    """Return the cookie's session id when that session exists."""
    if cookie is None:
        return None
    return await pool.fetchval(
        "SELECT session_id FROM sessions WHERE session_id = $1", cookie
    )


async def get_session_id(request: Request, response: Response) -> str:
    """Return the caller's session id, creating a new session if needed."""
    pool = request.state.pool
    cookie = request.cookies.get(SESSION_COOKIE_NAME)
    session_id = await _known_session_id(pool, cookie)
    if session_id is not None:
        return session_id
    # Never adopt an unknown cookie; a reused id would repeat seeds.
    return await create_session(pool, response)


async def create_session(pool: asyncpg.Pool, response: Response) -> str:
    """Create a new session and set its cookie for one year."""
    session_id = secrets.token_urlsafe(24)
    await pool.execute("INSERT INTO sessions (session_id) VALUES ($1)", session_id)
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_id,
        httponly=True,
        samesite="lax",
        secure=os.environ.get("COOKIE_SECURE", "true").lower() == "true",
        max_age=_ONE_YEAR_SECONDS,
    )
    return session_id


async def reserve_counter_range(
    pool: asyncpg.Pool, session_id: str, count: int
) -> range:
    """Atomically reserve `count` counter values for a session."""
    new_counter = await pool.fetchval(
        "UPDATE sessions SET counter = counter + $1 WHERE session_id = $2 "
        "RETURNING counter",
        count,
        session_id,
    )
    return range(new_counter - count, new_counter)
