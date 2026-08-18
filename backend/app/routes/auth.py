"""Signup, login, logout, and current-user routes."""
import uuid

import asyncpg
from fastapi import APIRouter, Depends, Request, Response
from pydantic import BaseModel

from app.db import get_pool
from app.errors import error_response
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

    email: str
    password: str


class AuthLoginRequest(BaseModel):
    """Request body for login."""

    email: str
    password: str


class AuthUserResponse(BaseModel):
    """Public representation of an authenticated user."""

    id: str
    email: str


@router.post("/auth/signup")
async def post_auth_signup(
    body: AuthSignupRequest,
    response: Response,
    session_id: str = Depends(get_session_id),
) -> dict:
    """Create an account and link it to the current session."""
    email = body.email.lower()
    password_hash = hash_password(body.password)
    user_id = str(uuid.uuid4())

    pool = await get_pool()
    try:
        await pool.execute(
            "INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)",
            user_id,
            email,
            password_hash,
        )
    except asyncpg.UniqueViolationError:
        return error_response(response, 409, "email_taken")

    await set_session_user(session_id, user_id)
    return AuthUserResponse(id=user_id, email=email).model_dump()


@router.post("/auth/login")
async def post_auth_login(
    body: AuthLoginRequest,
    response: Response,
    session_id: str = Depends(get_session_id),
) -> dict:
    """Verify credentials and link the account to the current session."""
    email = body.email.lower()
    pool = await get_pool()
    row = await pool.fetchrow(
        "SELECT id, password_hash FROM users WHERE email = $1", email
    )
    if row is None or not verify_password(body.password, row["password_hash"]):
        return error_response(response, 401, "invalid_credentials")

    user_id = str(row["id"])
    await set_session_user(session_id, user_id)
    return AuthUserResponse(id=user_id, email=email).model_dump()


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
    row = await pool.fetchrow("SELECT id, email FROM users WHERE id = $1", user_id)
    if row is None:
        return error_response(response, 401, "not_authenticated")

    return AuthUserResponse(id=str(row["id"]), email=row["email"]).model_dump()
