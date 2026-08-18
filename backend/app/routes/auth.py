"""Signup, login, logout, current-user, and password-rule routes."""
import uuid

import asyncpg
from fastapi import APIRouter, Depends, Request, Response
from pydantic import BaseModel

from app.db import get_pool
from app.errors import error_response
from app.password_rules import all_rules_pass, check_password, random_riddle
from app.security import hash_password, verify_password
from app.session import (
    clear_session_user,
    get_session_id,
    get_session_user_id,
    set_session_user,
)

router = APIRouter()


class AuthSignupRequest(BaseModel):
    """Request body for account creation."""

    username: str
    password: str
    riddle_id: str


class AuthLoginRequest(BaseModel):
    """Request body for login."""

    username: str
    password: str


class PasswordCheckRequest(BaseModel):
    """Request body for the live password-rule check."""

    password: str
    riddle_id: str


class AuthUserResponse(BaseModel):
    """Public representation of an authenticated user."""

    id: str
    username: str


@router.get("/auth/signup-riddle")
async def get_signup_riddle() -> dict:
    """Assign a riddle for the signup page; answer stays server-side."""
    riddle = random_riddle()
    return {"riddle_id": riddle["id"], "text": riddle["text"]}


@router.post("/auth/password/check")
async def post_password_check(body: PasswordCheckRequest) -> dict:
    """Return per-rule booleans only; never the underlying lists."""
    return {"rules": check_password(body.password, body.riddle_id)}


@router.post("/auth/signup")
async def post_auth_signup(
    body: AuthSignupRequest,
    response: Response,
    session_id: str = Depends(get_session_id),
) -> dict:
    """Validate password rules, create an account, link the session."""
    rules = check_password(body.password, body.riddle_id)
    if not all_rules_pass(rules):
        response.status_code = 422
        return {"error": "weak_password", "code": "weak_password", "rules": rules}

    username = body.username.strip()
    password_hash = hash_password(body.password)
    user_id = str(uuid.uuid4())

    pool = await get_pool()
    try:
        await pool.execute(
            "INSERT INTO users (id, username, password_hash) VALUES ($1, $2, $3)",
            user_id,
            username,
            password_hash,
        )
    except asyncpg.UniqueViolationError:
        return error_response(response, 409, "username_taken")

    await set_session_user(session_id, user_id)
    return AuthUserResponse(id=user_id, username=username).model_dump()


@router.post("/auth/login")
async def post_auth_login(
    body: AuthLoginRequest,
    response: Response,
    session_id: str = Depends(get_session_id),
) -> dict:
    """Verify credentials by username and link the account to the session."""
    pool = await get_pool()
    row = await pool.fetchrow(
        "SELECT id, password_hash FROM users WHERE username = $1",
        body.username.strip(),
    )
    if row is None or not verify_password(body.password, row["password_hash"]):
        return error_response(response, 401, "invalid_credentials")

    user_id = str(row["id"])
    await set_session_user(session_id, user_id)
    return AuthUserResponse(id=user_id, username=body.username.strip()).model_dump()


@router.post("/auth/logout")
async def post_auth_logout(
    session_id: str = Depends(get_session_id),
) -> dict:
    """Unlink the current session from its authenticated user."""
    await clear_session_user(session_id)
    return {"status": "logged_out"}


@router.get("/auth/me")
async def get_auth_me(request: Request, response: Response) -> dict:
    """Return the current session's authenticated user, if any."""
    session_id = request.cookies.get("session_id")
    user_id = await get_session_user_id(session_id) if session_id else None
    if user_id is None:
        return error_response(response, 401, "not_authenticated")

    pool = await get_pool()
    row = await pool.fetchrow(
        "SELECT id, username FROM users WHERE id = $1", user_id
    )
    if row is None:
        return error_response(response, 401, "not_authenticated")

    return AuthUserResponse(id=str(row["id"]), username=row["username"]).model_dump()
