"""Anonymous session identity and counter reservation."""
import os
import secrets

import asyncpg
from fastapi import Request, Response

SESSION_COOKIE_NAME = "session_id"

_ONE_YEAR_SECONDS = 60 * 60 * 24 * 365
_MAX_SESSIONS_PER_USER = 4


async def get_session_id(request: Request, response: Response) -> str:
    """Return the session id, creating and cookieing one if absent."""
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    if session_id is None:
        session_id = secrets.token_urlsafe(24)
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=session_id,
            httponly=True,
            samesite="lax",
            secure=os.environ.get("COOKIE_SECURE", "true").lower() == "true",
            max_age=_ONE_YEAR_SECONDS,
        )
    # Upsert so a stale cookie without a row still has one.
    await request.state.pool.execute(
        "INSERT INTO sessions (session_id) VALUES ($1) ON CONFLICT DO NOTHING",
        session_id,
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


async def set_session_user(
    pool: asyncpg.Pool, session_id: str, user_id: str
) -> None:
    """Link a session to a user, keeping the newest few per user."""
    async with pool.acquire() as connection:
        async with connection.transaction():
            await connection.execute(
                "UPDATE sessions SET user_id = $1 WHERE session_id = $2",
                user_id,
                session_id,
            )
            # Evict oldest sessions, always keeping the current one.
            await connection.execute(
                "DELETE FROM sessions WHERE user_id = $1 AND session_id NOT IN ("
                "SELECT session_id FROM sessions WHERE user_id = $1 "
                "ORDER BY (session_id = $2) DESC, created_at DESC LIMIT $3)",
                user_id,
                session_id,
                _MAX_SESSIONS_PER_USER,
            )


async def clear_session_user(pool: asyncpg.Pool, session_id: str) -> None:
    """Unlink a session from its authenticated user."""
    await pool.execute(
        "UPDATE sessions SET user_id = NULL WHERE session_id = $1", session_id
    )


async def get_session_user_id(pool: asyncpg.Pool, session_id: str) -> str | None:
    """Return the authenticated user id for a session, if any."""
    return await pool.fetchval(
        "SELECT user_id FROM sessions WHERE session_id = $1", session_id
    )


async def get_authenticated_user_id(request: Request) -> str | None:
    """Return the authenticated user id for the request's session cookie, if any."""
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    if session_id is None:
        return None
    return await get_session_user_id(request.state.pool, session_id)
