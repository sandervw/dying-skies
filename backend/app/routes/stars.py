"""Star issuance and save verification routes."""
from fastapi import APIRouter, Depends, Request, Response
from pydantic import BaseModel, Field

from app.encoding import decode_base64url, encode_base64url
from app.errors import error_response
from app.rate_limit import limiter
from app.security import generate_seed, generate_tag, load_secret, verify_tag
from app.login import get_authenticated_user_id
from app.session import get_session_id, reserve_issuance_range

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


class SkySaveRequest(BaseModel):
    """Request body for saving a Sky."""

    seed: str
    tag: str


class SavedSky(BaseModel):
    """A single Saved Sky: its seed and save timestamp."""

    seed: str
    saved_at: str


class SavedSkiesResponse(BaseModel):
    """Response body listing the caller's Saved Skies."""

    stars: list[SavedSky]


class SkyDestroyRequest(BaseModel):
    """Request body for permanently destroying a Sky."""

    seed: str


@router.post("/stars/batch")
@limiter.limit("60/minute")
async def post_stars_batch(
    request: Request,
    body: StarsBatchRequest,
    response: Response,
) -> StarsBatchResponse:
    """Issue a batch of HMAC-derived stars for the session."""
    # Called after the limit check, so a 429 never creates a session.
    session_id = await get_session_id(request, response)
    secret = load_secret()
    issuance_counts = await reserve_issuance_range(request.state.pool, session_id, body.count)
    stars = []
    for issuance_count in issuance_counts:
        seed = generate_seed(session_id, issuance_count, secret)
        tag = generate_tag(seed, secret)
        stars.append(StarTag(seed=encode_base64url(seed), tag=encode_base64url(tag)))
    return StarsBatchResponse(stars=stars)


@router.post("/stars/save")
async def post_stars_save(
    request: Request,
    body: SkySaveRequest,
    response: Response,
    user_id: str | None = Depends(get_authenticated_user_id),
) -> dict:
    """Verify an issued Star's tag; save its Sky once for the caller."""
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

    pool = request.state.pool
    row = await pool.fetchrow(
        "INSERT INTO saved_stars (seed, owner_id) VALUES ($1, $2) "
        "ON CONFLICT (seed) DO NOTHING RETURNING seed",
        seed,
        user_id,
    )
    if row is not None:
        return {"status": "saved"}

    destroyed_at = await pool.fetchval(
        "SELECT destroyed_at FROM saved_stars WHERE seed = $1", seed
    )
    if destroyed_at is not None:
        return error_response(response, 409, "already_destroyed")
    return error_response(response, 409, "already_saved")


@router.post("/stars/destroy")
async def post_stars_destroy(
    request: Request,
    body: SkyDestroyRequest,
    response: Response,
    user_id: str | None = Depends(get_authenticated_user_id),
) -> dict:
    """Permanently destroy one of the caller's Saved Skies."""
    if user_id is None:
        return error_response(response, 401, "not_authenticated")

    try:
        seed = decode_base64url(body.seed)
    except ValueError:
        return error_response(response, 400, "malformed_input")
    if len(seed) != 32:
        return error_response(response, 400, "malformed_input")

    row = await request.state.pool.fetchrow(
        "UPDATE saved_stars SET destroyed_at = now() "
        "WHERE seed = $1 AND owner_id = $2 AND destroyed_at IS NULL "
        "RETURNING seed",
        seed,
        user_id,
    )
    if row is None:
        return error_response(response, 404, "not_saved")
    return {"status": "destroyed"}


@router.get("/stars/mine")
async def get_stars_mine(
    request: Request,
    response: Response,
    user_id: str | None = Depends(get_authenticated_user_id),
) -> dict:
    """Return the caller's saved seeds, newest first."""
    if user_id is None:
        return error_response(response, 401, "not_authenticated")

    pool = request.state.pool
    rows = await pool.fetch(
        "SELECT seed, saved_at FROM saved_stars "
        "WHERE owner_id = $1 AND destroyed_at IS NULL "
        "ORDER BY saved_at DESC",
        user_id,
    )
    stars = [
        SavedSky(seed=encode_base64url(row["seed"]), saved_at=row["saved_at"].isoformat())
        for row in rows
    ]
    return SavedSkiesResponse(stars=stars).model_dump()
