"""Health check route."""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def get_health() -> dict:
    """Return service status for uptime checks."""
    return {"status": "ok"}
