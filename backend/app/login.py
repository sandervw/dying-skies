"""Logins: a user's link to one session, capped per user."""
from fastapi import Request, Response

from app.session import SESSION_COOKIE_NAME, create_session

_MAX_LOGINS_PER_USER = 4


async def start_login(request: Request, response: Response, user_id: str) -> None:
    """Log the user in on a fresh session, ending the cookie's login."""
    pool = request.state.pool
    session_id = await create_session(pool, response)
    old_session_id = request.cookies.get(SESSION_COOKIE_NAME)
    async with pool.acquire() as connection:
        async with connection.transaction():
            # A missing cookie binds NULL, which matches no login.
            await connection.execute(
                "DELETE FROM logins WHERE session_id = $1", old_session_id
            )
            await connection.execute(
                "INSERT INTO logins (session_id, user_id) VALUES ($1, $2)",
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


async def delete_login(request: Request) -> None:
    """Log the request's session out; the session and its count stay."""
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    if session_id is None:
        return
    await request.state.pool.execute(
        "DELETE FROM logins WHERE session_id = $1", session_id
    )


async def get_authenticated_user_id(request: Request) -> str | None:
    """Return the user logged in on the request's session cookie, if any."""
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    if session_id is None:
        return None
    return await request.state.pool.fetchval(
        "SELECT user_id FROM logins WHERE session_id = $1", session_id
    )
