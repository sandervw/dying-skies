"""Star issuance and save verification routes."""
from fastapi import APIRouter, Depends, Request, Response
from pydantic import BaseModel, Field

from app.db import get_pool
from app.encoding import decode_base64url, encode_base64url
from app.errors import error_response
from app.rate_limit import limiter
from app.security import generate_seed, generate_tag, load_secret, verify_tag
from app.session import (
    get_authenticated_user_id,
    get_session_id,
    reserve_counter_range,
)

router = APIRouter()


class StarsBatchRequest(BaseModel):
    """Request body for a star batch issuance."""

    count: int = Field(gt=0, le=105)


class StarTag(BaseModel):
    """A single issued star: its seed and verification tag."""

    seed: str
    tag: str


class StarsBatchResponse(BaseModel):
    """Response body listing the issued stars."""

    stars: list[StarTag]


class StarSaveRequest(BaseModel):
    """Request body for a star save."""

    seed: str
    tag: str


class SavedStar(BaseModel):
    """A single saved star: its seed and save timestamp."""

    seed: str
    saved_at: str


class SavedStarsResponse(BaseModel):
    """Response body listing the caller's saved stars."""

    stars: list[SavedStar]


class StarDestroyRequest(BaseModel):
    """Request body for a permanent star destruction."""

    seed: str


@router.post("/stars/batch")
@limiter.limit("60/minute")
async def post_stars_batch(
    request: Request,
    body: StarsBatchRequest,
    session_id: str = Depends(get_session_id),
) -> StarsBatchResponse:
    """Issue a batch of HMAC-derived stars for the session."""
    secret = load_secret()
    counters = await reserve_counter_range(session_id, body.count)
    stars = []
    for counter in counters:
        seed = generate_seed(session_id, counter, secret)
        tag = generate_tag(seed, secret)
        stars.append(StarTag(seed=encode_base64url(seed), tag=encode_base64url(tag)))
    return StarsBatchResponse(stars=stars)


@router.post("/stars/save")
async def post_stars_save(
    body: StarSaveRequest,
    response: Response,
    user_id: str | None = Depends(get_authenticated_user_id),
) -> dict:
    """Verify a star's tag and persist its seed once, owned by the caller."""
    if user_id is None:
        return error_response(response, 401, "not_authenticated")

    try:
        seed = decode_base64url(body.seed)
        tag = decode_base64url(body.tag)
    except ValueError:
        return error_response(response, 400, "malformed_input")
    if len(seed) != 32:
        return error_response(response, 400, "malformed_input")

    secret = load_secret()
    if not verify_tag(seed, tag, secret):
        return error_response(response, 403, "invalid_tag")

    pool = await get_pool()
    destroyed = await pool.fetchval(
        "SELECT 1 FROM destroyed_stars WHERE seed = $1", seed
    )
    if destroyed:
        return error_response(response, 409, "already_destroyed")

    row = await pool.fetchrow(
        "INSERT INTO saved_stars (seed, owner_id) VALUES ($1, $2) "
        "ON CONFLICT (seed) DO NOTHING RETURNING seed",
        seed,
        user_id,
    )
    if row is None:
        return error_response(response, 409, "already_saved")

    return {"status": "saved"}


@router.post("/stars/destroy")
async def post_stars_destroy(
    body: StarDestroyRequest,
    response: Response,
    user_id: str | None = Depends(get_authenticated_user_id),
) -> dict:
    """Permanently destroy one of the caller's saved stars."""
    if user_id is None:
        return error_response(response, 401, "not_authenticated")

    try:
        seed = decode_base64url(body.seed)
    except ValueError:
        return error_response(response, 400, "malformed_input")
    if len(seed) != 32:
        return error_response(response, 400, "malformed_input")

    pool = await get_pool()
    async with pool.acquire() as connection:
        async with connection.transaction():
            row = await connection.fetchrow(
                "DELETE FROM saved_stars WHERE seed = $1 AND owner_id = $2 "
                "RETURNING seed",
                seed,
                user_id,
            )
            if row is None:
                return error_response(response, 404, "not_saved")

            await connection.execute(
                "INSERT INTO destroyed_stars (seed, owner_id) VALUES ($1, $2) "
                "ON CONFLICT (seed) DO NOTHING",
                seed,
                user_id,
            )

    return {"status": "destroyed"}


@router.get("/stars/mine")
async def get_stars_mine(
    response: Response,
    user_id: str | None = Depends(get_authenticated_user_id),
) -> dict:
    """Return the caller's saved seeds, newest first."""
    if user_id is None:
        return error_response(response, 401, "not_authenticated")

    pool = await get_pool()
    rows = await pool.fetch(
        "SELECT seed, saved_at FROM saved_stars WHERE owner_id = $1 "
        "ORDER BY saved_at DESC",
        user_id,
    )
    stars = [
        SavedStar(seed=encode_base64url(row["seed"]), saved_at=row["saved_at"].isoformat())
        for row in rows
    ]
    return SavedStarsResponse(stars=stars).model_dump()
