"""Signup, login, logout, current-user, and password-rule routes."""
import uuid
from typing import Annotated

import asyncpg
from fastapi import APIRouter, Depends, Request, Response
from pydantic import BaseModel, StringConstraints

from app.errors import error_response
from app.password_rules import all_rules_pass, check_password, random_riddle
from app.rate_limit import limiter
from app.security import dummy_verify, hash_password, verify_password
from app.login import delete_login, get_authenticated_user_id, start_login

router = APIRouter()

Username = Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=64)]
Password = Annotated[str, StringConstraints(max_length=127)]


class AuthSignupRequest(BaseModel):
    """Request body for account creation."""

    username: Username
    password: Password
    riddle_id: str


class AuthLoginRequest(BaseModel):
    """Request body for login."""

    username: Username
    password: Password


class PasswordCheckRequest(BaseModel):
    """Request body for the live password-rule check."""

    password: Password
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
@limiter.limit("60/minute")
async def post_password_check(request: Request, body: PasswordCheckRequest) -> dict:
    """Return per-rule booleans only; never the underlying lists."""
    return {"rules": check_password(body.password, body.riddle_id)}


@router.post("/auth/signup")
@limiter.limit("10/minute")
async def post_auth_signup(
    request: Request,
    body: AuthSignupRequest,
    response: Response,
) -> dict:
    """Validate password rules, create an account, log it in."""
    rules = check_password(body.password, body.riddle_id)
    if not all_rules_pass(rules):
        response.status_code = 422
        return {"error": "weak_password", "code": "weak_password", "rules": rules}

    username = body.username
    password_hash = hash_password(body.password)
    user_id = str(uuid.uuid4())

    pool = request.state.pool
    try:
        await pool.execute(
            "INSERT INTO users (id, username, password_hash) VALUES ($1, $2, $3)",
            user_id,
            username,
            password_hash,
        )
    except asyncpg.UniqueViolationError:
        return error_response(response, 409, "username_taken")

    await start_login(request, response, user_id)
    return AuthUserResponse(id=user_id, username=username).model_dump()


@router.post("/auth/login")
@limiter.limit("10/minute")
async def post_auth_login(
    request: Request,
    body: AuthLoginRequest,
    response: Response,
) -> dict:
    """Verify credentials by username and log the account in."""
    pool = request.state.pool
    row = await pool.fetchrow(
        "SELECT id, password_hash FROM users WHERE username = $1",
        body.username,
    )
    if row is None:
        dummy_verify(body.password)  # equalize timing for unknown users
        return error_response(response, 401, "invalid_credentials")
    if not verify_password(body.password, row["password_hash"]):
        return error_response(response, 401, "invalid_credentials")

    user_id = str(row["id"])
    await start_login(request, response, user_id)
    return AuthUserResponse(id=user_id, username=body.username).model_dump()


@router.post("/auth/logout")
async def post_auth_logout(request: Request) -> dict:
    """Log the caller's session out, if it has a login."""
    await delete_login(request)
    return {"status": "logged_out"}


@router.get("/auth/me")
async def get_auth_me(
    request: Request,
    response: Response,
    user_id: str | None = Depends(get_authenticated_user_id),
) -> dict:
    """Return the current session's authenticated user, if any."""
    if user_id is None:
        return error_response(response, 401, "not_authenticated")

    row = await request.state.pool.fetchrow(
        "SELECT id, username FROM users WHERE id = $1", user_id
    )
    if row is None:
        return error_response(response, 401, "not_authenticated")

    return AuthUserResponse(id=str(row["id"]), username=row["username"]).model_dump()
