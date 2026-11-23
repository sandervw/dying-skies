"""Logins: a user's link to one session, capped per user."""
import asyncpg
from fastapi import Request

from app.session import SESSION_COOKIE_NAME

_MAX_LOGINS_PER_USER = 4


async def create_login(pool: asyncpg.Pool, session_id: str, user_id: str) -> None:
    """Log a session in, evicting the user's oldest logins past the cap."""
    async with pool.acquire() as connection:
        async with connection.transaction():
            await connection.execute(
                "INSERT INTO logins (session_id, user_id) VALUES ($1, $2) "
                "ON CONFLICT (session_id) DO UPDATE "
                "SET user_id = EXCLUDED.user_id, logged_in_at = now()",
                session_id,
                user_id,
            )
            # Evicting logs that device out; its session and count stay.
            await connection.execute(
                "DELETE FROM logins WHERE user_id = $1 AND session_id NOT IN ("
                "SELECT session_id FROM logins WHERE user_id = $1 "
                "ORDER BY (session_id = $2) DESC, logged_in_at DESC LIMIT $3)",
                user_id,
                session_id,
                _MAX_LOGINS_PER_USER,
            )


async def delete_login(pool: asyncpg.Pool, session_id: str) -> None:
    """Log a session out; the session and its count stay."""
    await pool.execute("DELETE FROM logins WHERE session_id = $1", session_id)


async def get_authenticated_user_id(request: Request) -> str | None:
    """Return the user logged in on the request's session cookie, if any."""
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    if session_id is None:
        return None
    return await request.state.pool.fetchval(
        "SELECT user_id FROM logins WHERE session_id = $1", session_id
    )
