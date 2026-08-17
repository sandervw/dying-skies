"""Star save verification and persistence route."""
from fastapi import APIRouter, Response
from pydantic import BaseModel

from app.db import get_pool
from app.encoding import decode_base64url
from app.security import load_secret, verify_tag

router = APIRouter()


class StarSaveRequest(BaseModel):
    """Request body for a star save."""

    seed: str
    tag: str


def _error(response: Response, status_code: int, code: str) -> dict:
    """Build an {error, code} envelope and set the response status."""
    response.status_code = status_code
    return {"error": code, "code": code}


@router.post("/stars/save")
async def post_stars_save(body: StarSaveRequest, response: Response) -> dict:
    """Verify a star's tag and persist its seed once."""
    try:
        seed = decode_base64url(body.seed)
        tag = decode_base64url(body.tag)
    except ValueError:
        return _error(response, 400, "malformed_input")
    if len(seed) != 32:
        return _error(response, 400, "malformed_input")

    secret = load_secret()
    if not verify_tag(seed, tag, secret):
        return _error(response, 403, "invalid_tag")

    pool = await get_pool()
    row = await pool.fetchrow(
        "INSERT INTO saved_stars (seed) VALUES ($1) "
        "ON CONFLICT (seed) DO NOTHING RETURNING seed",
        seed,
    )
    if row is None:
        return _error(response, 409, "already_saved")

    return {"status": "saved"}
