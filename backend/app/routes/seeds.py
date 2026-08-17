"""Seed batch issuance route."""
import base64

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.security import generate_seed, generate_tag, load_secret
from app.session import get_session_id, reserve_counter_range

router = APIRouter()


class SeedsBatchRequest(BaseModel):
    """Request body for a seed batch issuance."""

    count: int = Field(gt=0, le=100)


class SeedTag(BaseModel):
    """A single issued seed with its verification tag."""

    seed: str
    tag: str


class SeedsBatchResponse(BaseModel):
    """Response body listing the issued seeds and tags."""

    seeds: list[SeedTag]


def _encode(value: bytes) -> str:
    """Base64url-encode bytes without padding."""
    return base64.urlsafe_b64encode(value).decode().rstrip("=")


@router.post("/seeds/batch")
async def post_seeds_batch(
    body: SeedsBatchRequest, session_id: str = Depends(get_session_id)
) -> SeedsBatchResponse:
    """Issue a batch of HMAC-derived seeds for the session."""
    secret = load_secret()
    counters = await reserve_counter_range(session_id, body.count)
    seeds = []
    for counter in counters:
        seed = generate_seed(session_id, counter, secret)
        tag = generate_tag(seed, secret)
        seeds.append(SeedTag(seed=_encode(seed), tag=_encode(tag)))
    return SeedsBatchResponse(seeds=seeds)
