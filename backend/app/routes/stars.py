"""Star issuance and save verification routes."""
from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel, Field

from app.db import get_pool
from app.encoding import decode_base64url, encode_base64url
from app.errors import error_response
from app.security import generate_seed, generate_tag, load_secret, verify_tag
from app.session import get_session_id, reserve_counter_range

router = APIRouter()


class StarsBatchRequest(BaseModel):
    """Request body for a star batch issuance."""

    count: int = Field(gt=0, le=100)


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


@router.post("/stars/batch")
async def post_stars_batch(
    body: StarsBatchRequest, session_id: str = Depends(get_session_id)
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
async def post_stars_save(body: StarSaveRequest, response: Response) -> dict:
    """Verify a star's tag and persist its seed once."""
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
    row = await pool.fetchrow(
        "INSERT INTO saved_stars (seed) VALUES ($1) "
        "ON CONFLICT (seed) DO NOTHING RETURNING seed",
        seed,
    )
    if row is None:
        return error_response(response, 409, "already_saved")

    return {"status": "saved"}
